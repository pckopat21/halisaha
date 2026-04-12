<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Models\Standing;
use App\Models\Game;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * Generate PDF for tournament standings.
     */
    public function standings(Tournament $tournament)
    {
        $standings = Standing::select('standings.*', 'groups.name as group_name')
            ->join('groups', 'standings.group_id', '=', 'groups.id')
            ->whereHas('team', function($q) use ($tournament) {
                $q->where('tournament_id', $tournament->id);
            })
            ->with(['team.unit'])
            ->orderBy('group_name')
            ->orderByDesc('points')
            ->orderByRaw('(goals_for - goals_against) DESC')
            ->get()
            ->groupBy('group_name');

        $data = [
            'tournament' => $tournament,
            'standings' => $standings,
            'date' => now()->format('d.m.Y H:i'),
            'title' => 'RESMİ PUAN DURUMU'
        ];

        $pdf = Pdf::loadView('reports.standings', $data);
        
        return $pdf->download("{$tournament->name}_Puan_Durumu.pdf");
    }

    /**
     * Generate PDF for tournament fixture.
     */
    public function fixture(Tournament $tournament)
    {
        $games = Game::where('tournament_id', $tournament->id)
            ->with(['homeTeam.unit', 'awayTeam.unit'])
            ->orderBy('scheduled_at')
            ->get()
            ->groupBy(function($game) {
                return \Carbon\Carbon::parse($game->scheduled_at)->format('d.m.Y');
            });

        $data = [
            'tournament' => $tournament,
            'games_by_date' => $games,
            'date' => now()->format('d.m.Y H:i'),
            'title' => 'RESMİ FİKSTÜR VE MAÇ PROGRAMI'
        ];

        $pdf = Pdf::loadView('reports.fixture', $data);
        
        return $pdf->download("{$tournament->name}_Fikstur.pdf");
    }
}
