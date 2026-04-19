<?php

namespace App\Services;

use App\Models\Player;
use App\Models\Tournament;
use App\Models\Game;
use App\Models\GameEvent;

class DisciplineService
{
    /**
     * Check if a player is suspended for a given game.
     */
    public function isPlayerSuspended(Player $player, Game $game): array
    {
        $tournament = $game->tournament;
        $yellowCardLimit = $tournament->settings['yellow_card_limit'] ?? 4;

        // 1. Check for RED card in the IMMEDIATE PREVIOUS game of the same team in this tournament
        $previousGame = Game::where('tournament_id', $tournament->id)
            ->where(function($q) use ($game) {
                $q->where('home_team_id', $game->home_team_id)
                  ->orWhere('away_team_id', $game->away_team_id)
                  ->orWhere('home_team_id', $game->away_team_id)
                  ->orWhere('away_team_id', $game->home_team_id);
            })
            ->where('scheduled_at', '<', $game->scheduled_at)
            ->where('status', 'completed')
            ->orderByDesc('scheduled_at')
            ->first();

        if ($previousGame) {
            $hasRed = GameEvent::where('game_id', $previousGame->id)
                ->where('player_id', $player->id)
                ->where('event_type', 'red_card')
                ->exists();

            if ($hasRed) {
                return [
                    'is_suspended' => true,
                    'reason' => 'Bir önceki maçta görülen kırmızı kart nedeniyle cezalı.'
                ];
            }
        }

        // 2. Check for cumulative yellow cards in the tournament
        // We count yellow cards before this game.
        $yellowCardsCount = GameEvent::whereHas('game', function($q) use ($tournament, $game) {
                $q->where('tournament_id', $tournament->id)
                  ->where('scheduled_at', '<', $game->scheduled_at);
            })
            ->where('player_id', $player->id)
            ->where('event_type', 'yellow_card')
            ->count();

        // Standard suspension rule: every X yellow cards = 1 match ban.
        // We need to know if the player already served bans.
        // Simple logic: if count is a multiple of limit, they are suspended for the NEXT match.
        // But we must ensure it's not "already served".
        // A better way: Count how many times they hit the limit, then check if the previous game was the "trigger" game.
        
        // Let's simplify: If the TOTAL yellow cards until NOW is exactly a multiple of the limit,
        // AND the last yellow card was in the player's last game.
        
        if ($yellowCardsCount > 0 && $yellowCardsCount % $yellowCardLimit === 0) {
            // Find the game where the last yellow card was received
            $lastYellowEvent = GameEvent::whereHas('game', function($q) use ($tournament, $game) {
                    $q->where('tournament_id', $tournament->id)
                      ->where('scheduled_at', '<', $game->scheduled_at);
                })
                ->where('player_id', $player->id)
                ->where('event_type', 'yellow_card')
                ->orderByDesc('created_at')
                ->first();
            
            // If the last yellow was in the immediate previous game of the player's team
            if ($lastYellowEvent && $previousGame && $lastYellowEvent->game_id === $previousGame->id) {
                return [
                    'is_suspended' => true,
                    'reason' => "Toplam {$yellowCardLimit} sarı karta ulaştığı için cezalı."
                ];
            }
        }

        return [
            'is_suspended' => false,
            'reason' => null
        ];
    }

    /**
     * Check if user can manage the roster for a specific team in a game.
     */
    public function canManageRoster($user, Game $game, $team): bool
    {
        if (!$user) return false;
        if ($game->status === 'completed' || $game->status === 'playing') return false;

        // Committee can manage any roster (if not completed/playing)
        if ($user->isCommittee()) return true;

        // Managers can manage if it's their team and not locked
        if ($user->id !== $team->user_id) return false;

        // Time lock: 30 minutes before start
        $scheduledAt = \Carbon\Carbon::parse($game->scheduled_at);
        if (now()->diffInMinutes($scheduledAt, false) < 30) {
            return false;
        }

        return true;
    }
}
