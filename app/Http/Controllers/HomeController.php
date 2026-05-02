<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Models\Team;
use App\Models\Game;
use App\Models\Player;
use App\Services\StatsService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class HomeController extends Controller
{
    public function index(StatsService $statsService)
    {
        $activeTournament = Tournament::whereIn('status', ['active', 'registration'])
            ->with(['champion.unit'])
            ->latest()
            ->first()
            ?? Tournament::with(['champion.unit'])->latest()->first();

        $approvedTeams = Team::where('status', 'approved')
            ->with(['unit', 'players', 'captain'])
            ->latest()
            ->get();

        $groupStandings = [];
        $liveMatches = [];
        $lastResults = [];
        $upcomingFixtures = [];
        $homepageStats = null;
        $nextMatch = null;

        if ($activeTournament) {
            $groupStandings = $activeTournament->groups()->with(['standings.team'])->get()->map(function($group) {
                return [
                    'name' => $group->name,
                    'advance_count' => $group->advance_count,
                    'rows' => $group->standings->sortByDesc('points')->values()->map(function($standing) {
                        return [
                            'team' => ['name' => $standing->team->name],
                            'played' => $standing->played,
                            'won' => $standing->won,
                            'drawn' => $standing->drawn,
                            'lost' => $standing->lost,
                            'goals_for' => $standing->goals_for,
                            'goals_against' => $standing->goals_against,
                            'goal_difference' => $standing->goal_difference,
                            'points' => $standing->points,
                        ];
                    })
                ];
            });

            $liveMatches = Game::where('tournament_id', $activeTournament->id)
                ->where('status', 'playing')
                ->with(['homeTeam', 'awayTeam', 'field', 'group'])
                ->get()
                ->map(function($game) {
                    return [
                        'id' => $game->id,
                        'group' => $game->group?->name ?? 'Canlı Maç',
                        'home_team' => $game->homeTeam->name,
                        'away_team' => $game->awayTeam->name,
                        'home_score' => $game->home_score ?? 0,
                        'away_score' => $game->away_score ?? 0,
                        'minute' => $game->started_at ? (int) floor(min(5400, abs(now()->timestamp - $game->started_at->timestamp)) / 60) : 0,
                        'field' => $game->field?->name,
                        'live_stream_url' => $game->live_stream_url,
                    ];
                });

            $lastResults = Game::where('tournament_id', $activeTournament->id)
                ->where('status', 'completed')
                ->with(['homeTeam', 'awayTeam', 'field', 'group'])
                ->orderBy('scheduled_at', 'desc')
                ->limit(8)
                ->get()
                ->map(function($game) {
                    return [
                        'id' => $game->id,
                        'group' => $game->group?->name ?? 'Eleme',
                        'home_team' => $game->homeTeam->name,
                        'away_team' => $game->awayTeam->name,
                        'scheduled_at' => $game->scheduled_at ? $game->scheduled_at->toDateTimeString() : null,
                        'status' => $game->status,
                        'home_score' => $game->home_score,
                        'away_score' => $game->away_score,
                        'field' => $game->field?->name,
                        'live_stream_url' => $game->live_stream_url,
                    ];
                });

            $upcomingFixtures = Game::where('tournament_id', $activeTournament->id)
                ->where('status', 'scheduled')
                ->with(['homeTeam', 'awayTeam', 'field', 'group'])
                ->orderBy('scheduled_at', 'asc')
                ->limit(8)
                ->get()
                ->map(function($game) {
                    return [
                        'group' => $game->group?->name ?? 'Grup',
                        'home_team' => $game->homeTeam->name,
                        'away_team' => $game->awayTeam->name,
                        'scheduled_at' => $game->scheduled_at ? $game->scheduled_at->toDateTimeString() : null,
                        'status' => $game->status,
                        'field' => $game->field?->name,
                    ];
                });

            $nextMatch = Game::where('tournament_id', $activeTournament->id)
                ->where('status', 'scheduled')
                ->with(['homeTeam', 'awayTeam', 'field'])
                ->orderBy('scheduled_at', 'asc')
                ->first();

            $homepageStats = [
                'summary' => $statsService->getTournamentSummary($activeTournament),
                'topScorers' => $statsService->getTopScorers($activeTournament, 5)->map(function($p) {
                    return ['name' => $p->first_name . ' ' . $p->last_name, 'goals' => $p->goals_count];
                }),
                'topAssists' => $statsService->getTopAssists($activeTournament, 5)->map(function($p) {
                    return ['name' => $p->first_name . ' ' . $p->last_name, 'assists' => $p->assists_count];
                })
            ];
        }

        return Inertia::render('welcome', [
            'activeTournament' => $activeTournament,
            'approvedTeams' => $approvedTeams,
            'groupStandings' => $groupStandings,
            'liveMatches' => $liveMatches,
            'lastResults' => $lastResults,
            'upcomingFixtures' => $upcomingFixtures,
            'homepageStats' => $homepageStats,
            'totalStats' => [
                'approvedTeams' => Team::where('status', 'approved')->count(),
                'activePlayers' => Player::whereHas('teams', function($q) { $q->where('status', 'approved'); })->count(),
                'totalMatches' => $activeTournament ? Game::where('tournament_id', $activeTournament->id)->count() : 0,
            ],
            'nextMatch' => $nextMatch ? [
                'home_team' => $nextMatch->homeTeam->name,
                'away_team' => $nextMatch->awayTeam->name,
                'scheduled_at' => $nextMatch->scheduled_at->toDateTimeString(),
                'field' => $nextMatch->field?->name,
            ] : null,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }
}
