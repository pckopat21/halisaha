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
            ->groupBy('players.id', 'players.first_name', 'players.last_name', 'players.unit_id', 'players.tc_id', 'players.sicil_no', 'players.is_company_staff', 'players.is_permanent_staff', 'players.is_licensed', 'players.health_certificate_at', 'players.created_at', 'players.updated_at')
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
            ->groupBy('players.id', 'players.first_name', 'players.last_name', 'players.unit_id', 'players.tc_id', 'players.sicil_no', 'players.is_company_staff', 'players.is_permanent_staff', 'players.is_licensed', 'players.health_certificate_at', 'players.created_at', 'players.updated_at')
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
        $events = \App\Models\GameEvent::where('player_id', $player->id)
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
}
