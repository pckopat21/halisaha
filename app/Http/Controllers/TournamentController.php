<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Services\TournamentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TournamentController extends Controller
{
    protected $tournamentService;

    public function __construct(TournamentService $tournamentService)
    {
        $this->tournamentService = $tournamentService;
    }

    public function index()
    {
        return Inertia::render('tournaments/index', [
            'tournaments' => Tournament::withCount('teams')->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Tournament::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|integer',
        ]);

        Tournament::create($validated);

        return redirect()->back()->with('success', 'Turnuva başarıyla oluşturuldu.');
    }

    public function show(Tournament $tournament)
    {
        return Inertia::render('tournaments/show', [
            'tournament' => $tournament->load([
                'teams.unit', 
                'groups.standings.team', 
                'groups.games.homeTeam.unit', 
                'groups.games.awayTeam.unit'
            ])
        ]);
    }

    public function draw(Tournament $tournament, Request $request)
    {
        Gate::authorize('draw', $tournament);

        $validated = $request->validate([
            'group_count' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'start_time' => 'required|string',
            'match_duration' => 'required|integer|min:1',
            'buffer_time' => 'required|integer|min:0',
        ]);

        $this->tournamentService->generateDrawAndSchedule(
            $tournament, 
            $validated['group_count'],
            \Carbon\Carbon::parse($validated['start_date']),
            $validated['start_time'],
            $validated['match_duration'],
            $validated['buffer_time']
        );

        $tournament->update(['status' => 'active']);

        return redirect()->back()->with('success', 'Kura çekildi ve fikstür oluşturuldu.');
    }
}
