<?php

namespace App\Services;

use App\Models\Tournament;
use App\Models\Team;
use App\Models\Group;
use App\Models\Game;
use App\Models\Standing;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TournamentService
{
    /**
     * Handles group drawing and scheduling.
     * 
     * @param Tournament $tournament
     * @param int $groupCount
     * @param Carbon $startDate
     * @param string $matchStartTime
     * @param int $matchDurationMinutes
     * @param int $bufferMinutes
     * @return void
     */
    public function generateDrawAndSchedule(
        Tournament $tournament, 
        int $groupCount = 4, 
        Carbon $startDate = null,
        string $matchStartTime = '18:00',
        int $matchDurationMinutes = 50,
        int $bufferMinutes = 10
    ): void {
        DB::transaction(function () use ($tournament, $groupCount, $startDate, $matchStartTime, $matchDurationMinutes, $bufferMinutes) {
            $startDate = $startDate ?? Carbon::tomorrow();
            
            // 1. Get all approved teams (case-insensitive check)
            $teams = $tournament->teams()
                ->whereIn('status', ['approved', 'Approved'])
                ->get();
            
            // 2. Separate seeded teams (Rule 22 & 23)
            $seeds = $teams->where('seed_level', '>', 0)->sortBy('seed_level');
            $unseeded = $teams->where('seed_level', 0)->shuffle();

            // 3. Create groups
            $groups = collect();
            for ($i = 0; $i < $groupCount; $i++) {
                $group = $tournament->groups()->create([
                    'name' => 'Grup ' . chr(65 + $i) // Grup A, Grup B...
                ]);
                $groups->push($group);
            }

            // 4. Distribute seeds first
            $groupIndex = 0;
            foreach ($seeds as $team) {
                $this->assignToGroup($groups[$groupIndex % $groupCount], $team);
                $groupIndex++;
            }

            // 5. Distribute remaining teams
            foreach ($unseeded as $team) {
                $this->assignToGroup($groups[$groupIndex % $groupCount], $team);
                $groupIndex++;
            }

            // 6. Generate fixtures (Rule 15 & 24)
            $this->generateFixtures($tournament, $matchStartTime, $matchDurationMinutes, $bufferMinutes, $startDate);
        });
    }

    private function assignToGroup(Group $group, Team $team)
    {
        Standing::create([
            'group_id' => $group->id,
            'team_id' => $team->id,
        ]);
        // Note: standing table also has group_id and team_id.
    }

    private function generateFixtures(Tournament $tournament, $startTime, $duration, $buffer, $currentDate)
    {
        $groups = $tournament->groups;
        $allMatches = collect();

        // 1. Generate all Round Robin matches for all groups
        foreach ($groups as $group) {
            $teamIds = Standing::where('group_id', $group->id)->pluck('team_id')->toArray();
            $matches = $this->roundRobin($teamIds);
            
            foreach ($matches as $m) {
                $allMatches->push([
                    'group_id' => $group->id,
                    'home_team_id' => $m[0],
                    'away_team_id' => $m[1]
                ]);
            }
        }

        // 2. Schedule them sequentially on a single pitch
        // We shuffle to avoid group-monopoly on time slots, but keeping it fair
        $allMatches = $allMatches->shuffle();
        
        $matchDayStart = Carbon::parse($currentDate->format('Y-m-d') . ' ' . $startTime);
        $matchTimeIndex = $matchDayStart->copy();
        
        foreach ($allMatches as $matchData) {
            // Check if we passed 23:00, if so, move to next day
            if ($matchTimeIndex->hour >= 23) {
                $matchDayStart->addDay();
                $matchTimeIndex = Carbon::parse($matchDayStart->format('Y-m-d') . ' ' . $startTime);
            }

            Game::create([
                'tournament_id' => $tournament->id,
                'group_id' => $matchData['group_id'],
                'home_team_id' => $matchData['home_team_id'],
                'away_team_id' => $matchData['away_team_id'],
                'scheduled_at' => $matchTimeIndex->copy(),
                'status' => 'scheduled',
                'pitch_id' => 1 // Rule 24: Single pitch
            ]);

            // Advance to next slot
            $matchTimeIndex->addMinutes($duration + $buffer);
        }
    }

    /**
     * Round Robin Algorithm (Circle Method)
     */
    private function roundRobin(array $teamIds)
    {
        if (count($teamIds) < 2) return [];
        
        $teams = $teamIds;
        if (count($teams) % 2 != 0) {
            $teams[] = null; // Bye
        }
        
        $n = count($teams);
        $matches = [];
        $rounds = $n - 1;
        
        for ($round = 0; $round < $rounds; $round++) {
            for ($i = 0; $i < $n / 2; $i++) {
                $home = $teams[$i];
                $away = $teams[$n - 1 - $i];
                if ($home !== null && $away !== null) {
                    $matches[] = [$home, $away];
                }
            }
            // Rotate (keep index 0 static)
            array_splice($teams, 1, 0, array_pop($teams));
        }
        return $matches;
    }
}
