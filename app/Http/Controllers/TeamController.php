<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TeamController extends Controller
{
    protected $disciplineService;

    public function __construct(\App\Services\DisciplineService $disciplineService)
    {
        $this->disciplineService = $disciplineService;
    }

    public function index()
    {
        $user = auth()->user();
        $query = Team::with(['unit', 'tournament', 'owner'])->withCount('players');

        if ($user && $user->isCommittee()) {
            // Admins must see everything to manage approvals/rejections
            $teams = $query->latest()->get();
        } elseif ($user) {
            $teams = $query->where(function ($q) use ($user) {
                $q->where('status', 'approved')
                  ->orWhere('user_id', $user->id);
            })->latest()->get();
        } else {
            $teams = $query->where('status', 'approved')->latest()->get();
        }

        return Inertia::render('teams/index', [
            'teams' => $teams,
            'tournaments' => Tournament::where('status', 'registration')->get(),
            'units' => \App\Models\Unit::all()
        ]);
    }

    public function show(Team $team, \App\Services\StatsService $statsService)
    {
        // Find next game for this team to check suspension status
        $nextGame = \App\Models\Game::where(function($q) use ($team) {
            $q->where('home_team_id', $team->id)
              ->orWhere('away_team_id', $team->id);
        })
        ->whereIn('status', ['scheduled', 'playing'])
        ->with(['homeTeam', 'awayTeam', 'field'])
        ->orderBy('scheduled_at')
        ->first();

        $team->load(['players', 'unit', 'captain', 'tournament']);

        foreach ($team->players as $player) {
            $player->yellow_cards_count = \App\Models\GameEvent::where('player_id', $player->id)
                ->where('event_type', 'yellow_card')
                ->whereHas('game', function($q) use ($team) {
                    $q->where('tournament_id', $team->tournament_id);
                })
                ->count();
            
            if ($nextGame) {
                $player->suspension = $this->disciplineService->isPlayerSuspended($player, $nextGame);
            } else {
                // If no upcoming game, check general status (e.g. pending red card carryover)
                $player->suspension = ['is_suspended' => false, 'reason' => null];
            }
        }

        return Inertia::render('teams/show', [
            'team' => $team,
            'performance' => $statsService->getTeamPerformance($team),
            'nextMatch' => $nextGame,
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
        $validation = $validator->validateTeamRoster($team, $newRoster, false);

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
