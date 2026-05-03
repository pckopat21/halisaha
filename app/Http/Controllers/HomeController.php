<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Models\Team;
use App\Models\Game;
use App\Models\Player;
use App\Services\StatsService;
use App\Services\PredictionService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class HomeController extends Controller
{
    protected $statsService;
    protected $predictionService;

    public function __construct(StatsService $statsService, PredictionService $predictionService)
    {
        $this->statsService = $statsService;
        $this->predictionService = $predictionService;
    }

    public function index()
    {
        $activeTournament = Tournament::whereIn('status', ['active', 'registration'])
            ->with(['champion.unit'])
            ->latest()
            ->first()
            ?? Tournament::with(['champion.unit'])->latest()->first();

        $data = [
            'activeTournament' => $activeTournament,
            'approvedTeams' => Team::where('status', 'approved')->with(['unit', 'players', 'captain'])->latest()->limit(8)->get(),
            'totalStats' => $this->getTotalStats($activeTournament),
            'announcements' => \App\Models\Announcement::where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
            'predictionLeaderboard' => $this->predictionService->getLeaderboard($activeTournament?->id, 5),
            'userPredictions' => auth()->check() && $activeTournament
                ? \App\Models\Prediction::where('user_id', auth()->id())
                    ->whereIn('game_id', Game::where('tournament_id', $activeTournament->id)->pluck('id'))
                    ->get()
                : [],
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ];

        if ($activeTournament) {
            $data = array_merge($data, $this->getTournamentData($activeTournament));
        }

        return Inertia::render('welcome', $data);
    }

    private function getTournamentData($activeTournament)
    {
        return [
            'groupStandings' => $this->getGroupStandings($activeTournament),
            'liveMatches' => $this->getLiveMatches($activeTournament),
            'lastResults' => $this->getLastResults($activeTournament),
            'upcomingFixtures' => $this->getUpcomingFixtures($activeTournament),
            'nextMatch' => $this->getNextMatch($activeTournament),
            'homepageStats' => $this->getHomepageStats($activeTournament),
            'galleries' => $activeTournament->galleries()
                ->where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->get()
                ->map(fn($g) => [
                    'id' => $g->id,
                    'image_url' => asset('storage/' . $g->image_path),
                    'title' => $g->title
                ]),
        ];
    }

    private function getGroupStandings($tournament)
    {
        return $tournament->groups()->with(['standings.team'])->get()->map(function ($group) {
            return [
                'name' => $group->name,
                'advance_count' => $group->advance_count,
                'rows' => $group->standings->sortByDesc('points')->values()->map(function ($standing) {
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
    }

    private function getLiveMatches($tournament)
    {
        return Game::where('tournament_id', $tournament->id)
            ->where('status', 'playing')
            ->with(['homeTeam', 'awayTeam', 'field', 'group'])
            ->get();
    }

    private function getLastResults($tournament)
    {
        return Game::where('tournament_id', $tournament->id)
            ->where('status', 'completed')
            ->with(['homeTeam', 'awayTeam', 'field', 'group'])
            ->orderBy('scheduled_at', 'desc')
            ->limit(4)
            ->get();
    }

    private function getUpcomingFixtures($tournament)
    {
        return Game::where('tournament_id', $tournament->id)
            ->where('status', 'scheduled')
            ->with(['homeTeam', 'awayTeam', 'field', 'group'])
            ->orderBy('scheduled_at', 'asc')
            ->limit(4)
            ->get();
    }

    private function getNextMatch($tournament)
    {
        $match = Game::where('tournament_id', $tournament->id)
            ->where('status', 'scheduled')
            ->with(['homeTeam', 'awayTeam', 'field'])
            ->orderBy('scheduled_at', 'asc')
            ->first();

        return $match ? [
            'id' => $match->id,
            'home_team' => $match->homeTeam->name,
            'away_team' => $match->awayTeam->name,
            'scheduled_at' => $match->scheduled_at->toDateTimeString(),
            'field' => $match->field?->name,
        ] : null;
    }

    private function getHomepageStats($tournament)
    {
        return [
            'summary' => $this->statsService->getTournamentSummary($tournament),
            'topScorers' => $this->statsService->getTopScorers($tournament, 5)->map(fn($p) => [
                'name' => $p->first_name . ' ' . $p->last_name,
                'goals' => $p->goals_count,
                'team_name' => $p->teams->first()?->name ?? 'Takımsız'
            ]),
            'topAssists' => $this->statsService->getTopAssists($tournament, 5)->map(fn($p) => [
                'name' => $p->first_name . ' ' . $p->last_name,
                'assists' => $p->assists_count,
                'team_name' => $p->teams->first()?->name ?? 'Takımsız'
            ])
        ];
    }

    private function getTotalStats($tournament)
    {
        return [
            'approvedTeams' => Team::where('status', 'approved')->count(),
            'activePlayers' => Player::whereHas('teams', fn($q) => $q->where('status', 'approved'))->count(),
            'totalMatches' => $tournament ? Game::where('tournament_id', $tournament->id)->count() : 0,
        ];
    }
}
