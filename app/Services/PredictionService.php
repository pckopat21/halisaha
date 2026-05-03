<?php

namespace App\Services;

use App\Models\Game;
use App\Models\Prediction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PredictionService
{
    /**
     * Calculate points for all predictions of a completed game.
     */
    public function calculatePoints(Game $game)
    {
        if ($game->status !== 'completed') return;

        $predictions = Prediction::where('game_id', $game->id)
            ->where('status', 'pending')
            ->get();

        foreach ($predictions as $prediction) {
            $points = 0;

            $actualHome = $game->home_score;
            $actualAway = $game->away_score;
            $predHome = $prediction->home_score;
            $predAway = $prediction->away_score;

            // 1. Exact Match (10 Points)
            if ($actualHome == $predHome && $actualAway == $predAway) {
                $points = 10;
            } 
            // 2. Correct Goal Difference (5 Points)
            else if (($actualHome - $actualAway) === ($predHome - $predAway)) {
                $points = 5;
            }
            // 3. Correct Outcome (Win/Draw/Loss) (3 Points)
            else {
                $actualOutcome = $this->getOutcome($actualHome, $actualAway);
                $predOutcome = $this->getOutcome($predHome, $predAway);

                if ($actualOutcome === $predOutcome) {
                    $points = 3;
                }
            }

            Prediction::where('id', $prediction->id)->update([
                'points' => $points,
                'status' => 'calculated',
            ]);
        }
    }

    /**
     * Get aggregated prediction stats for a specific game.
     */
    public function getGamePredictionStats(Game $game)
    {
        $predictions = Prediction::where('game_id', $game->id)->get();
        $total = $predictions->count();

        if ($total === 0) {
            return [
                'total' => 0,
                'distribution' => ['home' => 0, 'draw' => 0, 'away' => 0],
                'counts' => ['home' => 0, 'draw' => 0, 'away' => 0],
                'common_scores' => []
            ];
        }

        $homeWins = $predictions->filter(function($p) {
            if ($p->prediction_type === 'outcome') return $p->outcome === 'home';
            return $p->home_score > $p->away_score;
        })->count();

        $draws = $predictions->filter(function($p) {
            if ($p->prediction_type === 'outcome') return $p->outcome === 'draw';
            return $p->home_score == $p->away_score;
        })->count();

        $awayWins = $predictions->filter(function($p) {
            if ($p->prediction_type === 'outcome') return $p->outcome === 'away';
            return $p->home_score < $p->away_score;
        })->count();

        $commonScores = $predictions->where('prediction_type', 'exact')
            ->groupBy(fn($p) => "{$p->home_score}-{$p->away_score}")
            ->map(fn($group) => $group->count())
            ->sortDesc()
            ->take(3);

        return [
            'total' => $total,
            'distribution' => [
                'home' => $total > 0 ? round(($homeWins / $total) * 100) : 0,
                'draw' => $total > 0 ? round(($draws / $total) * 100) : 0,
                'away' => $total > 0 ? round(($awayWins / $total) * 100) : 0,
            ],
            'counts' => [
                'home' => $homeWins,
                'draw' => $draws,
                'away' => $awayWins
            ],
            'common_scores' => $commonScores->map(fn($count, $score) => [
                'score' => $score,
                'count' => $count,
                'percentage' => round(($count / $total) * 100)
            ])->values()->toArray()
        ];
    }

    private function getOutcome($home, $away)
    {
        if ($home > $away) return 'home';
        if ($away > $home) return 'away';
        return 'draw';
    }

    /**
     * Get the leaderboard for a specific tournament.
     */
    public function getLeaderboard($tournamentId = null, $limit = 10)
    {
        $query = User::select('users.id', 'users.name')
            ->join('predictions', 'users.id', '=', 'predictions.user_id')
            ->join('games', 'predictions.game_id', '=', 'games.id');

        if ($tournamentId) {
            $query->where('games.tournament_id', $tournamentId);
        }

        return $query->selectRaw('
                SUM(CASE WHEN predictions.status = "calculated" THEN predictions.points ELSE 0 END) as total_points, 
                COUNT(predictions.id) as total_predictions,
                SUM(CASE WHEN predictions.status = "calculated" AND predictions.points = 10 THEN 1 ELSE 0 END) as exact_hits
            ')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_points')
            ->orderByDesc('total_predictions')
            ->limit($limit)
            ->get()
            ->map(function($user) {
                $user->accuracy = $user->total_predictions > 0 
                    ? round(($user->exact_hits / $user->total_predictions) * 100) 
                    : 0;
                return $user;
            });
    }
}
