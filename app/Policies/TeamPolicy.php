<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TeamPolicy
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
    public function view(?User $user, Team $team): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // All registered users can create a team
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Team $team): bool
    {
        return $user->isSuperAdmin() || ($team->user_id === $user->id && $team->status === 'pending');
        // Note: Once approved, changes might need admin approval, but for now owner can edit if pending.
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Team $team): bool
    {
        return $user->isSuperAdmin() || $team->user_id === $user->id;
    }

    /**
     * Determine whether the user can approve teams.
     */
    public function approve(User $user, Team $team): bool
    {
        return $user->isCommittee();
    }

    /**
     * Determine whether the user can reject teams.
     */
    public function reject(User $user, Team $team): bool
    {
        return $user->isCommittee();
    }

    /**
     * Determine whether the user can manage the roster.
     */
    public function manageRoster(User $user, Team $team): bool
    {
        return $user->isSuperAdmin() || $team->user_id === $user->id;
    }
}
