<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = Team::with(['unit', 'tournament', 'owner']);

        if ($user && !$user->isCommittee()) {
            // For team managers, we still let them see all teams (as requested: "diğer takımları görebilir")
            // but we might want to flag which ones they own in the frontend.
            // For the index, we list all approved teams plus any pending team of the user.
            $teams = $query->where(function ($q) use ($user) {
                $q->where('status', 'approved')
                  ->orWhere('user_id', $user->id);
            })->latest()->get();
        } else {
            // Admins see everything
            $teams = $query->latest()->get();
        }

        return Inertia::render('teams/index', [
            'teams' => $teams,
            'tournaments' => Tournament::where('status', 'registration')->get(),
            'units' => \App\Models\Unit::all()
        ]);
    }

    public function show(Team $team)
    {
        return Inertia::render('teams/show', [
            'team' => $team->load(['players', 'unit', 'captain', 'tournament']),
            'can' => [
                'update' => auth()->user()?->can('update', $team) ?? false,
                'approve' => auth()->user()?->can('approve', $team) ?? false,
            ]
        ]);
    }

    public function approve(Team $team, \App\Services\TournamentValidationService $validator)
    {
        Gate::authorize('approve', $team);

        $validation = $validator->validateTeamRoster($team, $team->players);

        if (!$validation['is_valid']) {
            return redirect()->back()->withErrors([
                'error' => 'Takım başvurusu onaylanamadı. Kuruluş kuralları ihlal ediliyor:',
                'details' => $validation['errors']
            ]);
        }

        $team->update([
            'status' => 'approved',
            'rejection_reason' => null
        ]);
        
        return redirect()->back()->with('success', 'Takım başvurusu başarıyla onaylandı.');
    }

    public function reject(Team $team, Request $request)
    {
        Gate::authorize('reject', $team);

        $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        $team->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        return redirect()->back()->with('success', 'Takım başvurusu reddedildi.');
    }

    public function setCaptain(Team $team, \App\Models\Player $player)
    {
        Gate::authorize('update', $team);

        if (!$team->players()->where('player_id', $player->id)->exists()) {
            return redirect()->back()->withErrors(['error' => 'Bu oyuncu bu takımın kadrosunda yer almıyor.']);
        }

        $team->update(['captain_id' => $player->id]);

        return redirect()->back()->with('success', 'Takım kaptanı başarıyla güncellendi.');
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Team::class);

        $validated = $request->validate([
            'tournament_id' => 'required|exists:tournaments,id',
            'unit_id' => 'nullable|exists:units,id',
            'name' => 'required|string|max:255',
        ]);

        $unitId = $validated['unit_id'] ?? auth()->user()->unit_id;

        if (!$unitId) {
            return redirect()->back()->withErrors(['unit_id' => 'Lütfen bir birim seçin veya hesabınıza birim tanımlayın.']);
        }

        $team = Team::create([
            'tournament_id' => $validated['tournament_id'],
            'unit_id' => $unitId,
            'name' => $validated['name'],
            'user_id' => auth()->id(),
            'status' => 'pending'
        ]);

        return redirect()->route('teams.show', $team->id)->with('success', 'Takım başvurusu oluşturuldu. Şimdi kadronuzu kurabilirsiniz.');
    }

    public function addPlayer(Team $team, Request $request)
    {
        Gate::authorize('manageRoster', $team);

        $validated = $request->validate([
            'player_id' => 'required|exists:players,id',
        ]);

        $player = \App\Models\Player::findOrFail($validated['player_id']);

        // Rule 11: Unit consistency
        if ($player->unit_id !== $team->unit_id && !auth()->user()->isSuperAdmin()) {
            return redirect()->back()->withErrors(['player_id' => 'Oyuncu sadece kendi biriminin takımında oynayabilir.']);
        }

        // Rule 1: Max 12 players
        if ($team->players()->count() >= 12) {
            return redirect()->back()->withErrors(['player_id' => 'Takım kadrosu en fazla 12 kişi olabilir.']);
        }

        // Rule 10: Player cannot be in multiple teams in the same tournament
        $existsInTournament = \DB::table('team_player')
            ->join('teams', 'team_player.team_id', '=', 'teams.id')
            ->where('teams.tournament_id', $team->tournament_id)
            ->where('team_player.player_id', $player->id)
            ->exists();
        
        if ($existsInTournament) {
            return redirect()->back()->withErrors(['player_id' => 'Bu oyuncu bu turnuvada başka bir takıma kayıtlıdır.']);
        }

        $team->players()->syncWithoutDetaching([$validated['player_id']]);

        return redirect()->back()->with('success', 'Oyuncu kadroya eklendi.');
    }

    public function removePlayer(Team $team, \App\Models\Player $player)
    {
        Gate::authorize('manageRoster', $team);

        $team->players()->detach($player->id);

        return redirect()->back()->with('success', 'Oyuncu kadrodan çıkarıldı.');
    }
}
