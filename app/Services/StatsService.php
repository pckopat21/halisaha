<?php

namespace App\Services;

use App\Models\Tournament;
use App\Models\Player;
use App\Models\GameEvent;
use App\Models\Team;
use Illuminate\Support\Facades\DB;

class StatsService
{
    /**
     * Get top scorers for a tournament.
     */
    public function getTopScorers(Tournament $tournament, $limit = 10)
    {
        return Player::select('players.*', DB::raw('count(match_events.id) as goals_count'))
            ->join('match_events', 'players.id', '=', 'match_events.player_id')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->where('match_events.event_type', 'goal')
            ->groupBy('players.id')
            ->orderByDesc('goals_count')
            ->with(['unit', 'teams' => function($q) use ($tournament) {
                $q->where('tournament_id', $tournament->id);
            }])
            ->limit($limit)
            ->get();
    }

    /**
     * Get fair play rankings for a tournament.
     * Points: Yellow = 1, Red = 3
     */
    public function getFairPlayTable(Tournament $tournament)
    {
        $events = GameEvent::select('team_id', 'event_type')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->whereIn('event_type', ['yellow_card', 'red_card'])
            ->get();

        $teams = Team::where('tournament_id', $tournament->id)->with('unit')->get();

        $stats = $teams->map(function ($team) use ($events) {
            $teamEvents = $events->where('team_id', $team->id);
            $yellows = $teamEvents->where('event_type', 'yellow_card')->count();
            $reds = $teamEvents->where('event_type', 'red_card')->count();
            $points = ($yellows * 1) + ($reds * 3);

            return [
                'team' => $team,
                'yellow_cards' => $yellows,
                'red_cards' => $reds,
                'points' => $points
            ];
        })->sortBy('points');

        return $stats->values();
    }

    /**
     * Get detailed stats for a specific player.
     */
    public function getPlayerStats(Player $player)
    {
        $events = GameEvent::where('player_id', $player->id)
            ->with(['game.homeTeam', 'game.awayTeam', 'team'])
            ->orderByDesc('created_at')
            ->get();

        return [
            'player' => $player->load('unit'),
            'total_goals' => $events->where('event_type', 'goal')->count(),
            'yellow_cards' => $events->where('event_type', 'yellow_card')->count(),
            'red_cards' => $events->where('event_type', 'red_card')->count(),
            'match_history' => $events->groupBy('game_id')->map(function ($gameEvents) {
                $firstEvent = $gameEvents->first();
                return [
                    'game' => $firstEvent->game,
                    'team' => $firstEvent->team,
                    'goals' => $gameEvents->where('event_type', 'goal')->count(),
                    'yellow_cards' => $gameEvents->where('event_type', 'yellow_card')->count(),
                    'red_cards' => $gameEvents->where('event_type', 'red_card')->count(),
                    'events' => $gameEvents
                ];
            })->values()
        ];
    }
}
