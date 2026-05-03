<?php

namespace App\Services;

use App\Models\Game;
use App\Models\GameEvent;
use App\Models\GameRoster;
use App\Models\Standing;
use Illuminate\Support\Facades\DB;

class GameService
{
    protected $validator;
    protected $disciplineService;
    protected $predictionService;

    public function __construct(TournamentValidationService $validator, \App\Services\DisciplineService $disciplineService, PredictionService $predictionService)
    {
        $this->validator = $validator;
        $this->disciplineService = $disciplineService;
        $this->predictionService = $predictionService;
    }

    public function getValidator(): TournamentValidationService
    {
        return $this->validator;
    }

    /**
     * Rule 2: Checks if match can start.
     */
    public function canStartMatch(Game $game): bool
    {
        $minToStart = $game->tournament->settings['min_players_on_pitch'] ?? 5;
        $homeCount = $game->rosters()->where('team_id', $game->home_team_id)->where('is_starting', true)->count();
        $awayCount = $game->rosters()->where('team_id', $game->away_team_id)->where('is_starting', true)->count();

        return $homeCount >= $minToStart && $awayCount >= $minToStart;
    }

    /**
     * Handles a match event.
     */
    public function logEvent(Game $game, array $data)
    {
        return DB::transaction(function () use ($game, $data) {
            // Check suspension
            $player = \App\Models\Player::findOrFail($data['player_id']);
            $suspension = $this->disciplineService->isPlayerSuspended($player, $game);
            if ($suspension['is_suspended'] && $data['event_type'] !== 'sub_out') {
                throw new \Exception("Bu oyuncu cezalıdır: " . $suspension['reason']);
            }

            $event = $game->events()->create($data);

            if ($data['event_type'] === 'goal') {
                $this->updateScore($game, $data['team_id'], 1);
            }

            // Red cards should check for forfeit
            if ($data['event_type'] === 'red_card') {
                $this->handleDiscipline($game, $data);
            }

            if ($data['event_type'] === 'sub_in') {
                $this->handleSubstitution($game, $data);
            }

            return $event;
        });
    }

    private function updateScore(Game $game, $teamId, $points)
    {
        if ($game->home_team_id == $teamId) {
            $game->increment('home_score', $points);
        } else {
            $game->increment('away_score', $points);
        }
    }

    private function handleDiscipline(Game $game, array $data)
    {
        $minPlayers = $game->tournament->settings['min_players_on_pitch'] ?? 5;
        $onPitch = $this->getPlayersOnPitch($game, $data['team_id']);
        if ($onPitch->count() < $minPlayers) {
            $this->forfeitMatch($game, $data['team_id']);
        }
    }

    private function handleSubstitution(Game $game, array $data)
    {
        $subLimit = $game->tournament->settings['substitution_limit'] ?? 5;
        $subCount = $game->events()->where('team_id', $data['team_id'])->where('event_type', 'sub_in')->count();
        if ($subCount >= $subLimit) {
            throw new \Exception("En fazla {$subLimit} oyuncu değişikliği yapılabilir.");
        }

        // Validate pitch composition
        $onPitch = $this->getPlayersOnPitch($game, $data['team_id']);
        $validation = $this->validator->validatePitchLineup($onPitch, $game->tournament->settings);
        
        if (!$validation['is_valid']) {
            throw new \Exception(implode(", ", $validation['errors']));
        }
    }

    private function getPlayersOnPitch(Game $game, $teamId)
    {
        $rosteredCount = $game->rosters()->where('team_id', $teamId)->count();
        $redCardedIds = $game->events()->where('team_id', $teamId)->where('event_type', 'red_card')->pluck('player_id');

        // FALLBACK: If no rosters are defined for the game yet, assume a full team (7) minus red cards
        // to prevent immediate forfeit (3-0 bug)
        $totalOnPitch = $game->tournament->settings['total_players_on_pitch'] ?? 7;
        if ($rosteredCount === 0) {
            return collect(array_fill(0, max(0, $totalOnPitch - $redCardedIds->count()), null));
        }

        $startingIds = $game->rosters()->where('team_id', $teamId)->where('is_starting', true)->pluck('player_id');
        return \App\Models\Player::whereIn('id', $startingIds)->whereNotIn('id', $redCardedIds)->get();
    }

    public function forfeitMatch(Game $game, $losingTeamId)
    {
        $game->update([
            'status' => 'completed',
            'is_forfeit' => true,
            'winner_team_id' => $game->home_team_id == $losingTeamId ? $game->away_team_id : $game->home_team_id,
            'home_score' => $game->home_team_id == $losingTeamId ? 0 : 3,
            'away_score' => $game->home_team_id == $losingTeamId ? 3 : 0,
        ]);
        
        if ($game->group_id) {
            $this->recalculateGroupStandings($game->group_id);
        }
    }

    public function logPenalty(Game $game, array $data)
    {
        return DB::transaction(function () use ($game, $data) {
            $game->update(['has_penalties' => true]);
            
            if ($data['team_id'] == $game->home_team_id) {
                $game->increment('home_penalty_score');
            } else {
                $game->increment('away_penalty_score');
            }

            return $game->events()->create([
                'team_id' => $data['team_id'],
                'player_id' => $data['player_id'],
                'event_type' => 'penalty_goal',
                'minute' => 120, // Conventional for penalties
            ]);
        });
    }

    /**
     * Deletes an event and reverts its side effects.
     */
    public function deleteEvent(Game $game, GameEvent $event)
    {
        return DB::transaction(function () use ($game, $event) {
            $type = $event->event_type;
            $teamId = $event->team_id;

            $event->delete();

            if ($type === 'goal') {
                if ($game->home_team_id == $teamId) {
                    $game->home_score = max(0, $game->home_score - 1);
                    $game->save();
                } else {
                    $game->away_score = max(0, $game->away_score - 1);
                    $game->save();
                }
            }

            if ($game->status === 'completed') {
                $this->recalculateGroupStandings($game->group_id);
            }

            return true;
        });
    }

    public function completeMatch(Game $game)
    {
        // Rule 16: Check for draw in finals (Knockout)
        if ($game->home_score === $game->away_score && $game->group_id === null && !$game->has_penalties) {
            throw new \Exception("Eleme maçlarında beraberlik durumunda penaltı sonuçları girilmelidir.");
        }

        return DB::transaction(function () use ($game) {
            $game->update(['status' => 'completed']);
            
            if ($game->group_id) {
                $this->recalculateGroupStandings($game->group_id);
            }

            // Calculate prediction points
            $this->predictionService->calculatePoints($game);

            // Crown Champion logic
            if ($game->round === 'final') {
                $winnerId = null;
                if ($game->home_score > $game->away_score) {
                    $winnerId = $game->home_team_id;
                } elseif ($game->away_score > $game->home_score) {
                    $winnerId = $game->away_team_id;
                } elseif ($game->has_penalties) {
                    $winnerId = $game->home_penalty_score > $game->away_penalty_score 
                        ? $game->home_team_id 
                        : $game->away_team_id;
                }

                if ($winnerId) {
                    $game->tournament->update(['champion_id' => $winnerId]);
                }
            }

            return $game;
        });
    }

    public function recalculateGroupStandings(int $groupId)
    {
        DB::transaction(function () use ($groupId) {
            // Reset all standings for this group
            Standing::where('group_id', $groupId)->update([
                'played' => 0,
                'won' => 0,
                'drawn' => 0,
                'lost' => 0,
                'goals_for' => 0,
                'goals_against' => 0,
                'points' => 0,
                'fair_play_points' => 0
            ]);

            // Get all completed matches in this group
            $matches = Game::where('group_id', $groupId)
                ->where('status', 'completed')
                ->get();

            foreach ($matches as $match) {
                $homeStanding = Standing::where('group_id', $groupId)->where('team_id', $match->home_team_id)->first();
                $awayStanding = Standing::where('group_id', $groupId)->where('team_id', $match->away_team_id)->first();

                if (!$homeStanding || !$awayStanding) continue;

                $homeStanding->played += 1;
                $awayStanding->played += 1;
                
                $homeStanding->goals_for += $match->home_score;
                $homeStanding->goals_against += $match->away_score;
                $awayStanding->goals_for += $match->away_score;
                $awayStanding->goals_against += $match->home_score;

                if ($match->home_score > $match->away_score) {
                    $homeStanding->won += 1; $homeStanding->points += 3;
                    $awayStanding->lost += 1;
                } elseif ($match->home_score < $match->away_score) {
                    $awayStanding->won += 1; $awayStanding->points += 3;
                    $homeStanding->lost += 1;
                } else {
                    $homeStanding->drawn += 1; $homeStanding->points += 1;
                    $awayStanding->drawn += 1; $awayStanding->points += 1;
                }

                $homeStanding->save();
                $awayStanding->save();
            }
        });
    }
}
