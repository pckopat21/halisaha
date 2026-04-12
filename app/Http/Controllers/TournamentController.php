<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Services\TournamentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

use App\Services\KnockoutService;
use App\Services\StatsService;

class TournamentController extends Controller
{
    protected $tournamentService;
    protected $knockoutService;

    public function __construct(TournamentService $tournamentService, KnockoutService $knockoutService)
    {
        $this->tournamentService = $tournamentService;
        $this->knockoutService = $knockoutService;
    }

    public function index()
    {
        return Inertia::render('tournaments/index', [
            'tournaments' => Tournament::withCount(['teams' => function($q) {
                $q->where('status', 'approved');
            }])->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Tournament::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|integer',
        ]);

        Tournament::create(array_merge($validated, ['status' => 'registration']));

        return redirect()->back()->with('success', 'Turnuva başarıyla oluşturuldu.');
    }

    public function show(Tournament $tournament, StatsService $statsService)
    {
        return Inertia::render('tournaments/show', [
            'tournament' => $tournament->load([
                'teams' => function($q) {
                    if (!auth()->user()?->isCommittee()) {
                        $q->where('status', 'approved');
                    }
                    $q->with('unit');
                }, 
                'groups.standings.team', 
                'groups.games.homeTeam.unit', 
                'groups.games.awayTeam.unit',
                'champion.unit',
                'games' => function($q) {
                    $q->whereNull('group_id')->with(['homeTeam.unit', 'awayTeam.unit']);
                }
            ]),
            'teamStats' => [
                'total' => $tournament->teams()->count(),
                'approved' => $tournament->teams()->where('status', 'approved')->count() ?: $tournament->teams()->where('status', 'Approved')->count(),
                'pending' => $tournament->teams()->where('status', 'pending')->count() ?: $tournament->teams()->where('status', 'Pending')->count(),
                'rejected' => $tournament->teams()->where('status', 'rejected')->count() ?: $tournament->teams()->where('status', 'Rejected')->count(),
            ],
            'isGroupStageCompleted' => $tournament->groups()->count() > 0 && 
                !\App\Models\Game::whereIn('group_id', $tournament->groups()->pluck('id'))
                    ->where('status', '!=', 'completed')
                    ->exists(),
            'stats' => [
                'topScorers' => $statsService->getTopScorers($tournament),
                'fairPlay' => $statsService->getFairPlayTable($tournament)
            ]
        ]);
    }

    public function startKnockout(Tournament $tournament, KnockoutService $service)
    {
        $service->startKnockout($tournament, request()->all());
        return back()->with('success', 'Eleme turları başarıyla oluşturuldu.');
    }

    public function advanceRound(Tournament $tournament, KnockoutService $service)
    {
        $currentRound = request('current_round');
        $nextRound = request('next_round');

        try {
            $service->advanceToNextRound($tournament, $currentRound, $nextRound);
            return back()->with('success', 'Turlar başarıyla ilerletildi.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function complete(Tournament $tournament)
    {
        Gate::authorize('update', $tournament);

        $tournament->update(['status' => 'completed']);

        return redirect()->back()->with('success', 'Turnuva başarıyla tamamlandı. Artık arşivde görünecektir.');
    }

    public function createThirdPlaceMatch(Tournament $tournament, KnockoutService $service)
    {
        Gate::authorize('update', $tournament);

        try {
            $service->createThirdPlaceMatch($tournament);
            return back()->with('success', '3.lük maçı başarıyla oluşturuldu.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
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
