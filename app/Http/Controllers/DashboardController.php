<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Tournament;
use App\Models\Team;
use App\Models\Game;
use App\Models\Player;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if ($user->isCommittee()) {
            return Inertia::render('dashboard', [
                'stats' => [
                    'tournaments_count' => Tournament::count(),
                    'teams_count' => Team::count(),
                    'games_count' => Game::count(),
                    'players_count' => Player::count(),
                ],
                'recent_games' => Game::with(['homeTeam', 'awayTeam'])
                    ->latest()
                    ->take(5)
                    ->get(),
                'active_tournament' => Tournament::where('status', 'active')->first(),
            ]);
        }

        // Team Manager Dashboard
        $myTeam = Team::where('user_id', $user->id)->with(['tournament', 'unit'])->first();
        
        return Inertia::render('dashboard/manager', [
            'team' => $myTeam,
            'tournaments' => Tournament::where('status', 'registration')->get(),
            'upcoming_games' => $myTeam ? Game::where('home_team_id', $myTeam->id)
                ->orWhere('away_team_id', $myTeam->id)
                ->where('status', 'scheduled')
                ->with(['homeTeam', 'awayTeam'])
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
