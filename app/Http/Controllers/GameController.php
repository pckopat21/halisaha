<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Field;
use App\Services\GameService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class GameController extends Controller
{
    protected $gameService;
    protected $disciplineService;

    public function __construct(GameService $gameService, \App\Services\DisciplineService $disciplineService)
    {
        $this->gameService = $gameService;
        $this->disciplineService = $disciplineService;
    }

    public function index()
    {
        return Inertia::render('games/index', [
            'games' => Game::with(['homeTeam', 'awayTeam', 'group', 'tournament'])->latest()->get(),
        ]);
    }

    public function show(Game $game)
    {
        $game->load(['homeTeam.players', 'awayTeam.players', 'events.player', 'rosters.player', 'tournament', 'group']);

        // Check suspension for each player
        foreach ([$game->homeTeam, $game->awayTeam] as $team) {
            foreach ($team->players as $player) {
                $status = $this->disciplineService->isPlayerSuspended($player, $game);
                $player->suspension = $status;
            }
            $team->can_manage_roster = $this->disciplineService->canManageRoster(auth()->user(), $game, $team);
        }

        return Inertia::render('games/show', [
            'game' => $game
        ]);
    }

    public function logEvent(Game $game, Request $request)
    {
        Gate::authorize('logEvent', $game);

        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'player_id' => 'required|exists:players,id',
            'event_type' => 'required|string',
            'minute' => 'nullable|integer',
            'details' => 'nullable|array',
        ]);

        try {
            $this->gameService->logEvent($game, $validated);
            return redirect()->back()->with('success', 'Olay kaydedildi.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function complete(Game $game)
    {
        Gate::authorize('approve', $game);

        try {
            $this->gameService->completeMatch($game);
            return redirect()->back()->with('success', 'Maç tamamlandı.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function reopen(Game $game)
    {
        Gate::authorize('approve', $game);

        try {
            $game->update(['status' => 'playing']);
            
            if ($game->group_id) {
                $this->gameService->recalculateGroupStandings($game->group_id);
            }

            return redirect()->back()->with('success', 'Maç tekrar düzenlemeye açıldı.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function logPenalty(Game $game, Request $request)
    {
        Gate::authorize('logEvent', $game);

        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'player_id' => 'required|exists:players,id',
        ]);

        $this->gameService->logPenalty($game, $validated);

        return redirect()->back()->with('success', 'Penaltı golü kaydedildi.');
    }

    public function updateQuickResult(Game $game, Request $request)
    {
        Gate::authorize('approve', $game);

        $validated = $request->validate([
            'home_score' => 'nullable|integer|min:0',
            'away_score' => 'nullable|integer|min:0',
            'status' => 'required|string|in:scheduled,playing,completed',
            'scheduled_at' => 'nullable|date',
            'live_stream_url' => 'nullable|string|max:255',
        ]);

        $game->update($validated);

        if ($validated['status'] === 'playing' && !$game->started_at) {
            $game->update(['started_at' => now()]);
        }

        if ($validated['status'] === 'completed') {
            $this->gameService->completeMatch($game);
        }

        return redirect()->back()->with('success', 'Maç bilgileri güncellendi.');
    }

    public function updateRoster(Game $game, Request $request)
    {
        Gate::authorize('manageRoster', $game);

        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'players' => 'required|array',
            'players.*.id' => 'required|exists:players,id',
            'players.*.is_starting' => 'required|boolean',
        ]);

        $team = \App\Models\Team::findOrFail($validated['team_id']);
        $playerIds = collect($validated['players'])->pluck('id');
        $players = \App\Models\Player::whereIn('id', $playerIds)->get();
        $startingPlayers = $players->filter(function($p) use ($validated) {
            foreach ($validated['players'] as $vp) {
                if ($vp['id'] == $p->id) return $vp['is_starting'];
            }
            return false;
        });

        // 1. Check if all players belong to this team
        $validPlayerIds = $team->players()->pluck('players.id')->toArray();
        foreach ($playerIds as $id) {
            if (!in_array($id, $validPlayerIds)) {
                return redirect()->back()->withErrors(['error' => 'Bazı oyuncular bu takıma ait değil.']);
            }
        }

        // 2. Check for suspensions
        foreach ($players as $player) {
            /** @var \App\Models\Player $player */
            $status = $this->disciplineService->isPlayerSuspended($player, $game);
            if ($status['is_suspended']) {
                return redirect()->back()->withErrors(['error' => "{$player->first_name} cezalı olduğu için kadroya alınamaz: " . $status['reason']]);
            }
        }

        // 3. Rule validation
        $validation = $this->gameService->getValidator()->validateGameRoster($game, $startingPlayers, $players->count());
        if (!$validation['is_valid']) {
            return redirect()->back()->withErrors(['error' => implode(", ", $validation['errors'])]);
        }

        // 4. Save
        \Illuminate\Support\Facades\DB::transaction(function() use ($game, $team, $validated) {
            // Remove old roster for this team in this game
            \App\Models\GameRoster::where('game_id', $game->id)->where('team_id', $team->id)->delete();

            // Add new ones
            foreach ($validated['players'] as $playerData) {
                \App\Models\GameRoster::create([
                    'game_id' => $game->id,
                    'team_id' => $team->id,
                    'player_id' => $playerData['id'],
                    'is_starting' => $playerData['is_starting'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Esame listesi güncellendi.');
    }

    public function destroyEvent(Game $game, $eventId)
    {
        Gate::authorize('logEvent', $game);

        $event = \App\Models\GameEvent::findOrFail($eventId);
        
        $this->gameService->deleteEvent($game, $event);

        return redirect()->back()->with('success', 'Olay silindi.');
    }

    public function assignField(Game $game, Request $request)
    {
        Gate::authorize('update', $game);

        $validated = $request->validate([
            'field_id' => 'required|exists:fields,id',
        ]);

        $game->update(['field_id' => $validated['field_id']]);

        return back()->with('success', 'Saha ataması başarıyla yapıldı.');
    }
}
