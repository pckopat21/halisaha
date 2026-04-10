<?php

namespace App\Services;

use App\Models\Tournament;
use App\Models\Game;
use App\Models\Group;
use App\Models\Standing;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class KnockoutService
{
    /**
     * Start the knockout stage by taking top teams from groups.
     */
    public function startKnockout(Tournament $tournament, array $options)
    {
        return DB::transaction(function () use ($tournament, $options) {
            $advanceCount = $options['advance_count'] ?? 2; // Default top 2
            $pairingType = $options['pairing_type'] ?? 'cross'; // 'cross' or 'random'
            
            $groups = $tournament->groups;
            $advancingTeams = collect();

            // 1. Get top teams from each group
            foreach ($groups as $group) {
                $topTeams = Standing::where('group_id', $group->id)
                    ->with('team')
                    ->get()
                    ->sort(function($a, $b) {
                        return ($b->points <=> $a->points) 
                            ?: (($b->goals_for - $b->goals_against) <=> ($a->goals_for - $a->goals_against))
                            ?: ($b->goals_for <=> $a->goals_for);
                    })
                    ->take($advanceCount);
                
                $advancingTeams->put($group->name, $topTeams->pluck('team'));
            }

            // 2. Pair them
            if ($pairingType === 'cross') {
                $matches = $this->createCrossPairings($advancingTeams);
            } else {
                $matches = $this->createRandomPairings($advancingTeams->flatten());
            }

            // 3. Create Games
            $this->createKnockoutMatches($tournament, $matches, $options['round_name'] ?? 'quarter');

            return true;
        });
    }

    /**
     * Advance winners from current round to next round.
     */
    public function advanceToNextRound(Tournament $tournament, $currentRound, $nextRound)
    {
        return DB::transaction(function () use ($tournament, $currentRound, $nextRound) {
            $matches = Game::where('tournament_id', $tournament->id)
                ->where('round', $currentRound)
                ->orderBy('bracket_position')
                ->get();

            if ($matches->isEmpty()) {
                throw new \Exception("Bu tur için maç bulunamadı.");
            }

            if ($matches->where('status', '!=', 'completed')->isNotEmpty()) {
                throw new \Exception("Tüm maçlar tamamlanmadan bir üst tura geçilemez.");
            }

            $winners = $matches->map(function ($match) {
                return $this->getWinner($match);
            });

            $pairings = [];
            for ($i = 0; $i < count($winners); $i += 2) {
                if (isset($winners[$i+1])) {
                    $pairings[] = [$winners[$i], $winners[$i+1]];
                } else {
                    // Bye or single team (e.g. final or irregular count)
                    // In a standard bracket this shouldn't happen except for Final
                }
            }

            $this->createKnockoutMatches($tournament, $pairings, $nextRound);

            return true;
        });
    }

    private function getWinner(Game $match)
    {
        // 1. Check for forfeit (hükmen)
        // (Assuming forfeit is handled by score being set to 3-0)
        
        // 2. Main score
        if ($match->home_score > $match->away_score) return $match->homeTeam;
        if ($match->away_score > $match->home_score) return $match->awayTeam;

        // 3. Penalties
        if ($match->home_penalty_score > $match->away_penalty_score) return $match->homeTeam;
        if ($match->away_penalty_score > $match->home_penalty_score) return $match->awayTeam;

        throw new \Exception("Maç #{$match->id} berabere ve penaltı sonucu girilmemiş.");
    }

    private function createCrossPairings($groupsData)
    {
        $groupNames = $groupsData->keys()->toArray();
        $pairings = [];

        // Simple Cross: Group A1 vs B2, B1 vs A2, C1 vs D2, D1 vs C2
        for ($i = 0; $i < count($groupNames); $i += 2) {
            if (!isset($groupNames[$i+1])) break;

            $groupA = $groupsData[$groupNames[$i]];
            $groupB = $groupsData[$groupNames[$i+1]];

            // A1 vs B2
            if (isset($groupA[0]) && isset($groupB[1])) {
                $pairings[] = [$groupA[0], $groupB[1]];
            }
            // B1 vs A2
            if (isset($groupB[0]) && isset($groupA[1])) {
                $pairings[] = [$groupB[0], $groupA[1]];
            }
        }

        return $pairings;
    }

    private function createRandomPairings($teams)
    {
        $shuffled = $teams->shuffle();
        $pairings = [];
        for ($i = 0; $i < count($shuffled); $i += 2) {
            if (isset($shuffled[$i+1])) {
                $pairings[] = [$shuffled[$i], $shuffled[$i+1]];
            }
        }
        return $pairings;
    }

    private function createKnockoutMatches(Tournament $tournament, $pairings, $roundName)
    {
        // Find latest match in this tournament to schedule after it
        $lastMatch = Game::where('tournament_id', $tournament->id)->orderBy('scheduled_at', 'desc')->first();
        $startTime = $lastMatch ? Carbon::parse($lastMatch->scheduled_at)->addDays(2)->setTime(18, 0) : Carbon::now()->addDays(2)->setTime(18, 0);
        
        foreach ($pairings as $idx => $pair) {
            Game::create([
                'tournament_id' => $tournament->id,
                'home_team_id' => $pair[0]->id,
                'away_team_id' => $pair[1]->id,
                'round' => $roundName,
                'bracket_position' => $idx + 1,
                'status' => 'scheduled',
                'scheduled_at' => $startTime->copy()->addHours($idx),
                'pitch_id' => 1
            ]);
        }
    }
}
