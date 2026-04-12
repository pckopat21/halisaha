<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Services\StatsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    protected $statsService;

    public function __construct(StatsService $statsService)
    {
        $this->statsService = $statsService;
    }

    public function index(Request $request)
    {
        $tournaments = Tournament::orderByDesc('year')->get();
        $selectedTournament = null;

        if ($request->has('tournament_id')) {
            $selectedTournament = Tournament::find($request->tournament_id);
        } elseif ($tournaments->isNotEmpty()) {
            $selectedTournament = $tournaments->first();
        }

        if (!$selectedTournament) {
            return Inertia::render('statistics/index', [
                'tournaments' => $tournaments,
                'selectedTournament' => null,
                'stats' => null
            ]);
        }

        return Inertia::render('statistics/index', [
            'tournaments' => $tournaments,
            'selectedTournament' => $selectedTournament,
            'stats' => [
                'summary' => $this->statsService->getTournamentSummary($selectedTournament),
                'topScorers' => $this->statsService->getTopScorers($selectedTournament),
                'topAssists' => $this->statsService->getTopAssists($selectedTournament),
                'bestDefenses' => $this->statsService->getBestDefenses($selectedTournament),
                'fairPlay' => $this->statsService->getFairPlayTable($selectedTournament),
                'unitGoals' => $this->statsService->getGoalsByUnit($selectedTournament),
                'trends' => $this->statsService->getMatchTrends($selectedTournament),
            ]
        ]);
    }
}
