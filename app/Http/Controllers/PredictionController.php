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
        $isGuest = !auth()->check();

        if ($request->has('outcome')) {
            $validated = $request->validate([
                'game_id' => 'required|exists:games,id',
                'outcome' => 'required|in:home,draw,away',
            ]);

            $game = Game::findOrFail($validated['game_id']);

            if ($game->status !== 'scheduled') {
                return back()->with('error', 'Maç başladıktan sonra oy verilemez.');
            }

            // Check if guest/user already voted/predicted
            $exists = Prediction::where('game_id', $game->id)
                ->where(function($q) use ($isGuest) {
                    if ($isGuest) {
                        $q->where('ip_address', request()->ip());
                    } else {
                        $q->where('user_id', auth()->id());
                    }
                })->exists();

            if ($exists && $isGuest) {
                return back()->with('error', 'Bu maç için zaten oy verdiniz.');
            }

            Prediction::updateOrCreate(
                ['user_id' => auth()->id(), 'game_id' => $game->id, 'ip_address' => $isGuest ? request()->ip() : null],
                [
                    'prediction_type' => 'outcome',
                    'outcome' => $validated['outcome'],
                    'status' => 'pending',
                    'points' => 0
                ]
            );

            return back()->with('success', 'Oyunuz başarıyla kaydedildi!');
        }

        // Exact Score Prediction (Requires Auth)
        if ($isGuest) {
            return back()->with('error', 'Skor tahmini yapabilmek için giriş yapmalısınız.');
        }

        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'home_score' => 'required|integer|min:0',
            'away_score' => 'required|integer|min:0',
        ]);

        $game = Game::findOrFail($validated['game_id']);

        if ($game->status !== 'scheduled') {
            return back()->with('error', 'Maç başladıktan sonra tahmin yapılamaz.');
        }

        Prediction::updateOrCreate(
            ['user_id' => auth()->id(), 'game_id' => $game->id],
            [
                'prediction_type' => 'exact',
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
