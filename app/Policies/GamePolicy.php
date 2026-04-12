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
}
