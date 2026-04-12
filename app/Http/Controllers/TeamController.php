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
        $query = Team::with(['unit', 'tournament', 'owner'])->withCount('players');

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

    public function show(Team $team, \App\Services\StatsService $statsService)
    {
        return Inertia::render('teams/show', [
            'team' => $team->load(['players', 'unit', 'captain', 'tournament']),
            'performance' => $statsService->getTeamPerformance($team),
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

        $tournament = Tournament::findOrFail($validated['tournament_id']);
        
        if ($tournament->status !== 'registration') {
            return redirect()->back()->withErrors(['tournament_id' => 'Bu turnuva için başvuru süreci tamamlanmıştır.']);
        }

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

    public function addPlayer(Team $team, Request $request, \App\Services\TournamentValidationService $validator)
    {
        Gate::authorize('manageRoster', $team);

        $validated = $request->validate([
            'player_id' => 'required|exists:players,id',
        ]);

        $player = \App\Models\Player::findOrFail($validated['player_id']);

        // Check if player is already in team
        if ($team->players()->where('player_id', $player->id)->exists()) {
            return redirect()->back()->withErrors(['player_id' => 'Bu oyuncu zaten kadroda yer alıyor.']);
        }

        // Simulate new roster for validation
        $newRoster = $team->players->push($player);
        $validation = $validator->validateTeamRoster($team, $newRoster);

        if (!$validation['is_valid'] && !$team->has_exception) {
            return redirect()->back()->withErrors(['player_id' => $validation['errors'][0] ?? 'Kadro kuralları ihlal ediliyor.']);
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
