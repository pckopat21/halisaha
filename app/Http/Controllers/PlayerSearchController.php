<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;

class PlayerSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q');
        $unitId = $request->get('unit_id');
        $tournamentId = $request->get('tournament_id');

        $players = Player::query()
            ->when($query, function ($q) use ($query) {
                $q->where(function($sq) use ($query) {
                    $sq->where('first_name', 'like', "%{$query}%")
                      ->orWhere('last_name', 'like', "%{$query}%")
                      ->orWhere('tc_id', 'like', "%{$query}%")
                      ->orWhere('sicil_no', 'like', "%{$query}%");
                });
            })
            ->when($unitId, function ($q) use ($unitId) {
                $q->where('unit_id', $unitId);
            })
            ->with(['unit', 'teams' => function($q) use ($tournamentId) {
                if ($tournamentId) {
                    $q->where('tournament_id', $tournamentId);
                }
            }])
            ->orderBy('first_name')
            ->simplePaginate(15);

        $players->getCollection()->transform(function($player) {
            $player->current_team = $player->teams->first();
            return $player;
        });

        return response()->json($players);
    }
}
