<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Tournament;
use App\Models\Team;
use App\Models\Game;
use App\Models\Player;
use App\Services\StatsService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(StatsService $statsService)
    {
        $user = auth()->user();
        $activeTournament = Tournament::whereIn('status', ['active', 'registration'])->latest()->first() ?? Tournament::latest()->first();
        
        $stats = [
            'tournaments_count' => Tournament::count(),
            'teams_count' => Team::count(),
            'games_count' => Game::count(),
            'players_count' => Player::count(),
            'top_scorer' => $activeTournament ? $statsService->getTopScorers($activeTournament, 1)->first() : null,
            'goals_by_unit' => $activeTournament ? $statsService->getGoalsByUnit($activeTournament) : [],
            'match_trends' => $activeTournament ? $statsService->getMatchTrends($activeTournament) : [],
        ];

        $upcomingGames = Game::with(['homeTeam.unit', 'awayTeam.unit', 'field'])
            ->where('status', 'scheduled')
            ->orderBy('scheduled_at')
            ->take(5)
            ->get();

        $liveGames = Game::with(['homeTeam.unit', 'awayTeam.unit', 'field'])
            ->where('status', 'playing')
            ->get();

        $latestChampionTournament = Tournament::whereNotNull('champion_id')
            ->where('status', 'completed')
            ->with(['champion.unit'])
            ->latest()
            ->first();

        if ($user->isCommittee()) {
            return Inertia::render('dashboard', [
                'stats' => $stats,
                'recent_games' => Game::with(['homeTeam', 'awayTeam'])
                    ->where('status', 'completed')
                    ->latest()
                    ->take(5)
                    ->get(),
                'upcoming_games' => $upcomingGames,
                'active_tournament' => $activeTournament,
                'latest_champion_tournament' => $latestChampionTournament,
                'live_games' => $liveGames,
            ]);
        }

        // Team Manager Dashboard
        $myTeam = Team::where('user_id', $user->id)->with(['tournament', 'unit', 'players'])->first();
        $myStanding = null;
        if ($myTeam) {
            $myStanding = \App\Models\Standing::where('team_id', $myTeam->id)->first();
        }
        
        return Inertia::render('dashboard/manager', [
            'stats' => $stats,
            'team' => $myTeam,
            'standing' => $myStanding,
            'tournaments' => Tournament::whereIn('status', ['registration', 'active'])->get(),
            'upcoming_games' => $upcomingGames,
            'latest_champion_tournament' => $latestChampionTournament,
            'live_games' => $liveGames,
            'my_games' => $myTeam ? Game::where(function($q) use ($myTeam) {
                    $q->where('home_team_id', $myTeam->id)
                      ->orWhere('away_team_id', $myTeam->id);
                })
                ->with(['homeTeam', 'awayTeam'])
                ->orderBy('scheduled_at')
                ->take(5)
                ->get() : [],
        ]);
    }

    public function users(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('viewAny', \App\Models\User::class);

        $query = \App\Models\User::with('unit')->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('unit', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%");
                  });
            });
        }

        return Inertia::render('users/index', [
            'users' => $query->get(),
            'roles' => [
                \App\Models\User::ROLE_SUPER_ADMIN,
                \App\Models\User::ROLE_COMMITTEE,
                \App\Models\User::ROLE_TEAM_MANAGER,
                \App\Models\User::ROLE_REFEREE,
            ],
            'units' => \App\Models\Unit::all(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function updateRole(\App\Models\User $user, Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('updateRole', $user);

        $validated = $request->validate([
            'role' => 'required|string|in:super_admin,committee,team_manager,referee',
            'unit_id' => 'nullable|exists:units,id',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Kullanıcı bilgileri güncellendi.');
    }

    public function destroy(\App\Models\User $user)
    {
        \Illuminate\Support\Facades\Gate::authorize('delete', $user);

        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'Kendi hesabınızı silemezsiniz.']);
        }

        $user->delete();

        return redirect()->back()->with('success', 'Kullanıcı silindi.');
    }
}
