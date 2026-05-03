<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Prediction;
use App\Models\User;
use App\Services\PredictionService;
use Illuminate\Http\Request;

class PredictionController extends Controller
{
    protected $service;

    public function __construct(PredictionService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'home_score' => 'required|integer|min:0',
            'away_score' => 'required|integer|min:0',
        ]);

        $game = Game::findOrFail($validated['game_id']);

        // Check if game has already started
        if ($game->status !== 'scheduled') {
            return back()->with('error', 'Maç başladıktan sonra tahmin yapılamaz.');
        }

        // Check if user already predicted this game
        Prediction::updateOrCreate(
            ['user_id' => auth()->id(), 'game_id' => $game->id],
            [
                'home_score' => $validated['home_score'],
                'away_score' => $validated['away_score'],
                'status' => 'pending',
                'points' => 0
            ]
        );

        return back()->with('success', 'Tahmininiz başarıyla kaydedildi!');
    }

    public function analyze(Game $game)
    {
        return response()->json($this->service->getGamePredictionStats($game));
    }

    public function userPredictions(User $user)
    {
        $predictions = Prediction::where('user_id', $user->id)
            ->with(['game.homeTeam', 'game.awayTeam', 'game.group'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'user' => $user->name,
            'predictions' => $predictions
        ]);
    }
}
