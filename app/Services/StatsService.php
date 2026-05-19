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
     * Get top assist makers for a tournament.
     */
    public function getTopAssists(Tournament $tournament, $limit = 10)
    {
        return Player::select('players.*', DB::raw('count(match_events.id) as assists_count'))
            ->join('match_events', 'players.id', '=', 'match_events.player_id')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->where('match_events.event_type', 'assist')
            ->groupBy('players.id')
            ->orderByDesc('assists_count')
            ->with(['unit', 'teams' => function($q) use ($tournament) {
                $q->where('tournament_id', $tournament->id);
            }])
            ->limit($limit)
            ->get();
    }

    /**
     * Get best defenses (most clean sheets) for a tournament.
     */
    public function getBestDefenses(Tournament $tournament)
    {
        $games = \App\Models\Game::where('tournament_id', $tournament->id)
            ->where('status', 'completed')
            ->get();

        $teams = Team::where('tournament_id', $tournament->id)->with('unit')->get();

        return $teams->map(function ($team) use ($games) {
            $myGames = $games->filter(function($g) use ($team) {
                return $g->home_team_id === $team->id || $g->away_team_id === $team->id;
            });

            $cleanSheets = $myGames->filter(function($g) use ($team) {
                return $g->home_team_id === $team->id ? $g->away_score === 0 : $g->home_score === 0;
            })->count();

            return [
                'team' => $team,
                'clean_sheets' => $cleanSheets,
                'played' => $myGames->count()
            ];
        })->sortByDesc('clean_sheets')->values();
    }

    /**
     * Get best attacks (most goals scored) for a tournament.
     */
    public function getBestAttacks(Tournament $tournament)
    {
        $games = \App\Models\Game::where('tournament_id', $tournament->id)
            ->where('status', 'completed')
            ->get();

        $teams = Team::where('tournament_id', $tournament->id)->with('unit')->get();

        return $teams->map(function ($team) use ($games) {
            $myGames = $games->filter(function($g) use ($team) {
                return $g->home_team_id === $team->id || $g->away_team_id === $team->id;
            });

            $goalsScored = $myGames->sum(function($g) use ($team) {
                return $g->home_team_id === $team->id ? $g->home_score : $g->away_score;
            });

            return [
                'team' => $team,
                'goals_scored' => $goalsScored,
                'played' => $myGames->count()
            ];
        })->sortByDesc('goals_scored')->values();
    }

    /**
     * Get top goal-assist duos for a tournament.
     */
    public function getTopDuos(Tournament $tournament, $limit = 5)
    {
        // 1. Fetch all goals in the tournament
        $goals = DB::table('match_events')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->where('match_events.event_type', 'goal')
            ->select('match_events.game_id', 'match_events.team_id', 'match_events.minute', 'match_events.player_id as scorer_id')
            ->get();

        // 2. Fetch all assists in the tournament
        $assists = DB::table('match_events')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->where('match_events.event_type', 'assist')
            ->select('match_events.game_id', 'match_events.team_id', 'match_events.minute', 'match_events.player_id as assister_id')
            ->get();

        // 3. Group by game and team
        $goalsGrouped = [];
        foreach ($goals as $g) {
            $goalsGrouped[$g->game_id][$g->team_id][] = $g;
        }

        $assistsGrouped = [];
        foreach ($assists as $a) {
            $assistsGrouped[$a->game_id][$a->team_id][] = $a;
        }

        $partnerships = [];

        foreach ($goalsGrouped as $gameId => $teams) {
            foreach ($teams as $teamId => $gameGoals) {
                $gameAssists = $assistsGrouped[$gameId][$teamId] ?? [];
                if (empty($gameAssists)) continue;

                // Track matched assists in this game to prevent double counting
                $matchedAssistIds = [];

                foreach ($gameGoals as $goal) {
                    $bestAssistIdx = null;
                    $bestDiff = 999;

                    foreach ($gameAssists as $idx => $assist) {
                        if (in_array($idx, $matchedAssistIds)) continue;
                        if ($assist->assister_id == $goal->scorer_id) continue; // No self-assists

                        $diff = abs($goal->minute - $assist->minute);
                        if ($diff <= 1 && $diff < $bestDiff) {
                            $bestDiff = $diff;
                            $bestAssistIdx = $idx;
                        }
                    }

                    if ($bestAssistIdx !== null) {
                        $matchedAssistIds[] = $bestAssistIdx;
                        $assist = $gameAssists[$bestAssistIdx];

                        $key = $goal->scorer_id . '-' . $assist->assister_id;
                        $partnerships[$key] = ($partnerships[$key] ?? 0) + 1;
                    }
                }
            }
        }

        // Sort partnerships by count descending
        arsort($partnerships);

        // Fetch player details and format top duos
        $result = [];
        $count = 0;
        foreach ($partnerships as $key => $goalsCount) {
            if ($count >= $limit) break;

            list($scorerId, $assisterId) = explode('-', $key);

            $scorer = Player::with('unit')->find($scorerId);
            $assister = Player::with('unit')->find($assisterId);

            if ($scorer && $assister) {
                $team = $scorer->teams()->where('tournament_id', $tournament->id)->first();
                $teamName = $team ? $team->name : null;

                $result[] = [
                    'scorer' => $scorer,
                    'assister' => $assister,
                    'goals_count' => $goalsCount,
                    'team_name' => $teamName
                ];
                $count++;
            }
        }

        return collect($result);
    }

    /**
     * Get outstanding tournament records and highlights.
     */
    public function getTournamentRecords(Tournament $tournament)
    {
        $games = \App\Models\Game::where('tournament_id', $tournament->id)
            ->where('status', 'completed')
            ->get();

        if ($games->isEmpty()) {
            return [
                'highest_scoring' => null,
                'biggest_victory' => null,
                'most_cards' => null,
            ];
        }

        // 1. Highest scoring game
        $highestScoring = $games->sortByDesc(function($g) {
            return $g->home_score + $g->away_score;
        })->first();

        // 2. Biggest margin victory
        $biggestVictory = $games->sortByDesc(function($g) {
            return abs($g->home_score - $g->away_score);
        })->first();

        // 3. Most cards game
        $mostCards = \App\Models\Game::where('tournament_id', $tournament->id)
            ->where('status', 'completed')
            ->select('games.*')
            ->selectRaw('(
                SELECT COUNT(*) 
                FROM match_events 
                WHERE match_events.game_id = games.id 
                AND match_events.event_type IN ("yellow_card", "red_card")
            ) as cards_count')
            ->orderByDesc('cards_count')
            ->first();

        if ($highestScoring) $highestScoring->load(['homeTeam', 'awayTeam']);
        if ($biggestVictory) $biggestVictory->load(['homeTeam', 'awayTeam']);
        if ($mostCards) $mostCards->load(['homeTeam', 'awayTeam']);

        return [
            'highest_scoring' => $highestScoring ? [
                'home_team' => $highestScoring->homeTeam->name,
                'away_team' => $highestScoring->awayTeam->name,
                'home_score' => $highestScoring->home_score,
                'away_score' => $highestScoring->away_score,
                'total_goals' => $highestScoring->home_score + $highestScoring->away_score
            ] : null,
            'biggest_victory' => $biggestVictory ? [
                'home_team' => $biggestVictory->homeTeam->name,
                'away_team' => $biggestVictory->awayTeam->name,
                'home_score' => $biggestVictory->home_score,
                'away_score' => $biggestVictory->away_score,
                'margin' => abs($biggestVictory->home_score - $biggestVictory->away_score)
            ] : null,
            'most_cards' => $mostCards ? [
                'home_team' => $mostCards->homeTeam->name,
                'away_team' => $mostCards->awayTeam->name,
                'home_score' => $mostCards->home_score,
                'away_score' => $mostCards->away_score,
                'cards_count' => $mostCards->cards_count
            ] : null
        ];
    }

    /**
     * Get goal minute distribution (10-minute intervals).
     */
    public function getGoalDistribution(Tournament $tournament)
    {
        $goals = DB::table('match_events')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->where('match_events.event_type', 'goal')
            ->select('match_events.minute')
            ->get();

        $intervals = [
            '1-10' => 0,
            '11-20' => 0,
            '21-30' => 0,
            '31-40' => 0,
            '41-50' => 0,
            '50+' => 0
        ];

        foreach ($goals as $g) {
            $m = $g->minute;
            if ($m <= 10) $intervals['1-10']++;
            elseif ($m <= 20) $intervals['11-20']++;
            elseif ($m <= 30) $intervals['21-30']++;
            elseif ($m <= 40) $intervals['31-40']++;
            elseif ($m <= 50) $intervals['41-50']++;
            else $intervals['50+']++;
        }

        $data = [];
        foreach ($intervals as $range => $count) {
            $data[] = [
                'interval' => $range,
                'goals' => $count
            ];
        }

        return $data;
    }

    /**
     * Get fair play rankings for a tournament.
     */
    public function getFairPlayTable(Tournament $tournament)
    {
        $events = DB::table('match_events')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->whereIn('event_type', ['yellow_card', 'red_card'])
            ->select('team_id', 'event_type')
            ->get();

        $teams = Team::where('tournament_id', $tournament->id)->with('unit')->get();

        return $teams->map(function ($team) use ($events) {
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
        })->sortBy('points')->values();
    }

    /**
     * Get tournament summary overview.
     */
    public function getTournamentSummary(Tournament $tournament)
    {
        $games = \App\Models\Game::where('tournament_id', $tournament->id);
        $completedGames = $games->clone()->where('status', 'completed');
        
        $totalGoals = $completedGames->sum('home_score') + $completedGames->sum('away_score');
        $gameCount = $completedGames->count();

        return [
            'total_goals' => $totalGoals,
            'avg_goals' => $gameCount > 0 ? round($totalGoals / $gameCount, 2) : 0,
            'total_matches' => $games->count(),
            'played_matches' => $gameCount,
            'total_cards' => DB::table('match_events')
                ->join('games', 'match_events.game_id', '=', 'games.id')
                ->where('games.tournament_id', $tournament->id)
                ->whereIn('event_type', ['yellow_card', 'red_card'])
                ->count()
        ];
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
            'total_assists' => $events->where('event_type', 'assist')->count(),
            'yellow_cards' => $events->where('event_type', 'yellow_card')->count(),
            'red_cards' => $events->where('event_type', 'red_card')->count(),
            'match_history' => $events->groupBy('game_id')->map(function ($gameEvents) {
                $firstEvent = $gameEvents->first();
                return [
                    'game' => $firstEvent->game,
                    'team' => $firstEvent->team,
                    'goals' => $gameEvents->where('event_type', 'goal')->count(),
                    'assists' => $gameEvents->where('event_type', 'assist')->count(),
                    'yellow_cards' => $gameEvents->where('event_type', 'yellow_card')->count(),
                    'red_cards' => $gameEvents->where('event_type', 'red_card')->count(),
                    'events' => $gameEvents
                ];
            })->values()
        ];
    }

    /**
     * Get goal distribution by unit.
     */
    public function getGoalsByUnit(Tournament $tournament)
    {
        return DB::table('match_events')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->join('players', 'match_events.player_id', '=', 'players.id')
            ->join('units', 'players.unit_id', '=', 'units.id')
            ->where('games.tournament_id', $tournament->id)
            ->where('match_events.event_type', 'goal')
            ->select('units.name', DB::raw('count(match_events.id) as goals_count'))
            ->groupBy('units.id', 'units.name')
            ->orderByDesc('goals_count')
            ->get();
    }

    /**
     * Get match results trend.
     */
    public function getMatchTrends(Tournament $tournament)
    {
        return DB::table('match_events')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->where('match_events.event_type', 'goal')
            ->select(DB::raw('DATE(games.scheduled_at) as date'), DB::raw('count(*) as goals'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * Get performance stats and form guide for a specific team.
     */
    public function getTeamPerformance(Team $team)
    {
        $games = \App\Models\Game::where(function($q) use ($team) {
                $q->where('home_team_id', $team->id)
                  ->orWhere('away_team_id', $team->id);
            })
            ->where('status', 'completed')
            ->orderByDesc('scheduled_at')
            ->limit(10)
            ->get();

        $form = $games->take(5)->map(function($game) use ($team) {
            if ($game->home_score === $game->away_score) return 'D';
            
            $isHome = $game->home_team_id === $team->id;
            $isWinner = $isHome ? $game->home_score > $game->away_score : $game->away_score > $game->home_score;
            
            return $isWinner ? 'W' : 'L';
        })->reverse()->values();

        $stats = [
            'played' => $games->count(),
            'wins' => 0,
            'draws' => 0,
            'losses' => 0,
            'goals_for' => 0,
            'goals_against' => 0,
            'clean_sheets' => 0
        ];

        foreach ($games as $game) {
            $isHome = $game->home_team_id === $team->id;
            $myScore = $isHome ? $game->home_score : $game->away_score;
            $oppScore = $isHome ? $game->away_score : $game->home_score;

            $stats['goals_for'] += $myScore;
            $stats['goals_against'] += $oppScore;
            if ($oppScore === 0) $stats['clean_sheets']++;

            if ($myScore > $oppScore) $stats['wins']++;
            elseif ($myScore < $oppScore) $stats['losses']++;
            else $stats['draws']++;
        }

        return [
            'stats' => $stats,
            'form' => $form,
            'top_scorer' => Player::select('players.*', DB::raw('count(match_events.id) as goals_count'))
                ->join('match_events', 'players.id', '=', 'match_events.player_id')
                ->join('team_player', 'players.id', '=', 'team_player.player_id')
                ->where('team_player.team_id', $team->id)
                ->where('match_events.event_type', 'goal')
                ->where('match_events.team_id', $team->id)
                ->groupBy('players.id', 'players.first_name', 'players.last_name', 'players.unit_id', 'players.tc_id', 'players.sicil_no', 'players.is_company_staff', 'players.is_permanent_staff', 'players.is_licensed', 'players.health_certificate_at', 'players.created_at', 'players.updated_at')
                ->orderByDesc('goals_count')
                ->first()
        ];
    }

    /**
     * Get players with the most cards in a tournament.
     */
    public function getTopCardPlayers(Tournament $tournament, $limit = 10)
    {
        $players = Player::select('players.*')
            ->selectRaw('SUM(CASE WHEN match_events.event_type = "yellow_card" THEN 1 ELSE 0 END) as yellow_cards_count')
            ->selectRaw('SUM(CASE WHEN match_events.event_type = "red_card" THEN 1 ELSE 0 END) as red_cards_count')
            ->join('match_events', 'players.id', '=', 'match_events.player_id')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->whereIn('match_events.event_type', ['yellow_card', 'red_card'])
            ->groupBy('players.id')
            ->orderByRaw('(SUM(CASE WHEN match_events.event_type = "red_card" THEN 1 ELSE 0 END) * 3 + SUM(CASE WHEN match_events.event_type = "yellow_card" THEN 1 ELSE 0 END)) DESC')
            ->with(['unit', 'teams' => function($q) use ($tournament) {
                $q->where('tournament_id', $tournament->id);
            }])
            ->get();

        return [
            'players' => $players
        ];
    }

    /**
     * Get the dynamic Dream Team (Best 7 / Altın Karma) of the tournament.
     */
    public function getDreamTeam(Tournament $tournament)
    {
        // 1. Fetch all players who participated in this tournament
        $players = Player::whereHas('teams', function($q) use ($tournament) {
            $q->where('tournament_id', $tournament->id);
        })->with(['unit', 'teams' => function($q) use ($tournament) {
            $q->where('tournament_id', $tournament->id);
        }])->get();

        // 2. Fetch all events in this tournament to compute stats in memory (highly optimized!)
        $events = DB::table('match_events')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->select('match_events.player_id', 'match_events.event_type')
            ->get();

        $playerStats = [];
        foreach ($players as $player) {
            $pEvents = $events->where('player_id', $player->id);
            $goals = $pEvents->where('event_type', 'goal')->count();
            $assists = $pEvents->where('event_type', 'assist')->count();
            $yellows = $pEvents->where('event_type', 'yellow_card')->count();
            $reds = $pEvents->where('event_type', 'red_card')->count();

            // Performans rating formula:
            $rating = ($goals * 3.0) + ($assists * 2.0) - ($yellows * 1.0) - ($reds * 3.0);

            if ($rating > 0) {
                $playerStats[] = [
                    'player' => $player,
                    'goals' => $goals,
                    'assists' => $assists,
                    'yellows' => $yellows,
                    'reds' => $reds,
                    'rating' => $rating,
                    'team_name' => $player->teams->first() ? $player->teams->first()->name : null
                ];
            }
        }

        // Sort by rating desc, then goals desc, then assists desc
        usort($playerStats, function($a, $b) {
            if ($b['rating'] != $a['rating']) {
                return $b['rating'] <=> $a['rating'];
            }
            if ($b['goals'] != $a['goals']) {
                return $b['goals'] <=> $a['goals'];
            }
            return $b['assists'] <=> $a['assists'];
        });

        // Get players limit from tournament settings (default to 7 if not specified)
        $totalPlayersOnPitch = isset($tournament->settings['total_players_on_pitch']) 
            ? (int)$tournament->settings['total_players_on_pitch'] 
            : 7;

        // Take top N players
        $slicedPlayers = array_slice($playerStats, 0, $totalPlayersOnPitch);

        // Pre-defined responsive coordinates & roles for standard halisaha sizes (5 to 8)
        $positionsByCount = [
            5 => [
                0 => ['role' => 'ST', 'label' => 'FORVET (ST)', 'desc' => 'Zirve Hücumcu', 'coords' => 'top-[12%] left-1/2 -translate-x-1/2'],
                1 => ['role' => 'CM', 'label' => 'ORTA SAHA (CM)', 'desc' => 'Orta Saha Lideri', 'coords' => 'top-[38%] left-1/2 -translate-x-1/2'],
                2 => ['role' => 'LD', 'label' => 'SOL SAVUNMA (LD)', 'desc' => 'Duvar Savunmacı', 'coords' => 'top-[65%] left-[22%]'],
                3 => ['role' => 'RD', 'label' => 'SAĞ SAVUNMA (RD)', 'desc' => 'Çelik Savunmacı', 'coords' => 'top-[65%] right-[22%]'],
                4 => ['role' => 'GK', 'label' => 'KALECİ (GK)', 'desc' => 'Panter Kaleci', 'coords' => 'bottom-[8%] left-1/2 -translate-x-1/2'],
            ],
            6 => [
                0 => ['role' => 'ST', 'label' => 'FORVET (ST)', 'desc' => 'Zirve Hücumcu', 'coords' => 'top-[12%] left-1/2 -translate-x-1/2'],
                1 => ['role' => 'LM', 'label' => 'SOL ORTA (LM)', 'desc' => 'Fırtına Kanat', 'coords' => 'top-[40%] left-[16%]'],
                2 => ['role' => 'RM', 'label' => 'SAĞ ORTA (RM)', 'desc' => 'Dinamik Kanat', 'coords' => 'top-[40%] right-[16%]'],
                3 => ['role' => 'LD', 'label' => 'SOL SAVUNMA (LD)', 'desc' => 'Duvar Savunmacı', 'coords' => 'top-[68%] left-[24%]'],
                4 => ['role' => 'RD', 'label' => 'SAĞ SAVUNMA (RD)', 'desc' => 'Çelik Savunmacı', 'coords' => 'top-[68%] right-[24%]'],
                5 => ['role' => 'GK', 'label' => 'KALECİ (GK)', 'desc' => 'Panter Kaleci', 'coords' => 'bottom-[8%] left-1/2 -translate-x-1/2'],
            ],
            7 => [
                0 => ['role' => 'ST', 'label' => 'FORVET (ST)', 'desc' => 'Zirve Hücumcu', 'coords' => 'top-[12%] left-1/2 -translate-x-1/2'],
                1 => ['role' => 'CAM', 'label' => 'OYUN KURUCU (CAM)', 'desc' => 'Orta Saha Lideri', 'coords' => 'top-[38%] left-1/2 -translate-x-1/2'],
                2 => ['role' => 'LW', 'label' => 'SOL KANAT (LW)', 'desc' => 'Fırtına Kanat', 'coords' => 'top-[40%] left-[12%] md:left-[15%]'],
                3 => ['role' => 'RW', 'label' => 'SAĞ KANAT (RW)', 'desc' => 'Dinamik Kanat', 'coords' => 'top-[40%] right-[12%] md:right-[15%]'],
                4 => ['role' => 'LD', 'label' => 'SOL SAVUNMA (LD)', 'desc' => 'Duvar Savunmacı', 'coords' => 'top-[68%] left-[20%] md:left-[24%]'],
                5 => ['role' => 'RD', 'label' => 'SAĞ SAVUNMA (RD)', 'desc' => 'Çelik Savunmacı', 'coords' => 'top-[68%] right-[20%] md:right-[24%]'],
                6 => ['role' => 'GK', 'label' => 'KALECİ (GK)', 'desc' => 'Panter Kaleci', 'coords' => 'bottom-[8%] left-1/2 -translate-x-1/2'],
            ],
            8 => [
                0 => ['role' => 'ST', 'label' => 'FORVET (ST)', 'desc' => 'Zirve Hücumcu', 'coords' => 'top-[14%] left-1/2 -translate-x-1/2'],
                1 => ['role' => 'CM', 'label' => 'ORTA SAHA (CM)', 'desc' => 'Orta Saha Lideri', 'coords' => 'top-[40%] left-1/2 -translate-x-1/2'],
                2 => ['role' => 'LW', 'label' => 'SOL KANAT (LW)', 'desc' => 'Fırtına Kanat', 'coords' => 'top-[42%] left-[12%]'],
                3 => ['role' => 'RW', 'label' => 'SAĞ KANAT (RW)', 'desc' => 'Dinamik Kanat', 'coords' => 'top-[42%] right-[12%]'],
                4 => ['role' => 'CD', 'label' => 'MERKEZ DEFANS (CD)', 'desc' => 'Savunma Lideri', 'coords' => 'top-[72%] left-1/2 -translate-x-1/2'],
                5 => ['role' => 'LD', 'label' => 'SOL SAVUNMA (LD)', 'desc' => 'Duvar Savunmacı', 'coords' => 'top-[70%] left-[12%]'],
                6 => ['role' => 'RD', 'label' => 'SAĞ SAVUNMA (RD)', 'desc' => 'Çelik Savunmacı', 'coords' => 'top-[70%] right-[12%]'],
                7 => ['role' => 'GK', 'label' => 'KALECİ (GK)', 'desc' => 'Panter Kaleci', 'coords' => 'bottom-[8%] left-1/2 -translate-x-1/2'],
            ]
        ];

        // Choose positions map based on total players, fallback to 7 if out of range
        $positions = isset($positionsByCount[$totalPlayersOnPitch]) 
            ? $positionsByCount[$totalPlayersOnPitch] 
            : $positionsByCount[7];

        $lineup = [];
        foreach ($slicedPlayers as $idx => $data) {
            if (isset($positions[$idx])) {
                $lineup[] = array_merge($data, $positions[$idx]);
            }
        }

        return $lineup;
    }

    /**
     * Get comprehensive compare data (all players and all teams) for a tournament.
     */
    public function getCompareData(Tournament $tournament)
    {
        // --- 1. Fetch Players Compare Data ---
        $players = Player::whereHas('teams', function($q) use ($tournament) {
            $q->where('tournament_id', $tournament->id);
        })->with(['unit', 'teams' => function($q) use ($tournament) {
            $q->where('tournament_id', $tournament->id);
        }])->get();

        $events = DB::table('match_events')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->select('match_events.player_id', 'match_events.event_type')
            ->get();

        $matchesPlayed = DB::table('match_rosters')
            ->join('games', 'match_rosters.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->select('match_rosters.player_id')
            ->get();

        $playerCompare = $players->map(function ($player) use ($events, $matchesPlayed) {
            $pEvents = $events->where('player_id', $player->id);
            $goals = $pEvents->where('event_type', 'goal')->count();
            $assists = $pEvents->where('event_type', 'assist')->count();
            $yellows = $pEvents->where('event_type', 'yellow_card')->count();
            $reds = $pEvents->where('event_type', 'red_card')->count();

            // Performans rating formula:
            $rating = ($goals * 3.0) + ($assists * 2.0) - ($yellows * 1.0) - ($reds * 3.0);
            $played = $matchesPlayed->where('player_id', $player->id)->count();

            return [
                'id' => $player->id,
                'name' => $player->first_name . ' ' . $player->last_name,
                'team_name' => $player->teams->first() ? $player->teams->first()->name : 'Serbest',
                'unit_name' => $player->unit ? $player->unit->name : 'Genel',
                'goals' => $goals,
                'assists' => $assists,
                'yellow_cards' => $yellows,
                'red_cards' => $reds,
                'played_matches' => $played,
                'goals_per_match' => $played > 0 ? round($goals / $played, 2) : 0,
                'assists_per_match' => $played > 0 ? round($assists / $played, 2) : 0,
                'rating' => $rating,
            ];
        })->sortByDesc('rating')->values();

        // --- 2. Fetch Teams Compare Data ---
        $games = \App\Models\Game::where('tournament_id', $tournament->id)
            ->where('status', 'completed')
            ->get();

        $teams = Team::where('tournament_id', $tournament->id)->with('unit')->get();

        $teamCards = DB::table('match_events')
            ->join('games', 'match_events.game_id', '=', 'games.id')
            ->where('games.tournament_id', $tournament->id)
            ->whereIn('match_events.event_type', ['yellow_card', 'red_card'])
            ->select('match_events.team_id', 'match_events.event_type')
            ->get();

        $teamCompare = $teams->map(function ($team) use ($games, $teamCards) {
            $myGames = $games->filter(function($g) use ($team) {
                return $g->home_team_id === $team->id || $g->away_team_id === $team->id;
            });

            $wins = 0;
            $draws = 0;
            $losses = 0;
            $goalsFor = 0;
            $goalsAgainst = 0;
            $cleanSheets = 0;

            foreach ($myGames as $game) {
                $isHome = $game->home_team_id === $team->id;
                $myScore = $isHome ? $game->home_score : $game->away_score;
                $oppScore = $isHome ? $game->away_score : $game->home_score;

                $goalsFor += $myScore;
                $goalsAgainst += $oppScore;
                if ($oppScore === 0) {
                    $cleanSheets++;
                }

                if ($myScore > $oppScore) {
                    $wins++;
                } elseif ($myScore < $oppScore) {
                    $losses++;
                } else {
                    $draws++;
                }
            }

            $played = $myGames->count();
            $points = ($wins * 3) + ($draws * 1);
            $goalDiff = $goalsFor - $goalsAgainst;
            $winRatio = $played > 0 ? round(($wins / $played) * 100, 1) : 0;

            $myCards = $teamCards->where('team_id', $team->id);
            $yellows = $myCards->where('event_type', 'yellow_card')->count();
            $reds = $myCards->where('event_type', 'red_card')->count();

            return [
                'id' => $team->id,
                'name' => $team->name,
                'unit_name' => $team->unit ? $team->unit->name : 'Genel',
                'played' => $played,
                'wins' => $wins,
                'draws' => $draws,
                'losses' => $losses,
                'points' => $points,
                'goals_for' => $goalsFor,
                'goals_against' => $goalsAgainst,
                'goal_difference' => $goalDiff,
                'clean_sheets' => $cleanSheets,
                'yellow_cards' => $yellows,
                'red_cards' => $reds,
                'win_ratio' => $winRatio,
            ];
        })->sortByDesc('points')->values();

        return [
            'players' => $playerCompare,
            'teams' => $teamCompare,
        ];
    }
}
