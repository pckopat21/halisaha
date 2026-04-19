<?php

namespace App\Policies;

use App\Models\Game;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GamePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Game $game): bool
    {
        return true;
    }

    /**
     * Determine whether the user can log events for the game.
     */
    public function logEvent(User $user, Game $game): bool
    {
        if ($game->status === 'completed') {
            return false;
        }

        return $user->isReferee() || $user->isCommittee();
    }

    /**
     * Determine whether the user can approve the final result.
     */
    public function approve(User $user, Game $game): bool
    {
        return $user->isCommittee();
    }

    /**
     * Determine whether the user can manage the roster for the game.
     */
    public function manageRoster(User $user, Game $game): bool
    {
        if ($game->status === 'completed' || $game->status === 'playing') {
            return false;
        }

        // Committee can always override (except if completed)
        if ($user->isCommittee()) {
            return true;
        }

        // Managers can manage if it's their team and not locked
        $isMyTeam = $user->id === $game->homeTeam?->user_id || $user->id === $game->awayTeam?->user_id;
        
        if (!$isMyTeam) {
            return false;
        }

        // Time lock: 30 minutes before start
        $scheduledAt = \Carbon\Carbon::parse($game->scheduled_at);
        if (now()->diffInMinutes($scheduledAt, false) < 30) {
            return false;
        }

        return true;
    }
}
