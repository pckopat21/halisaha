<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can update the model's role.
     */
    public function updateRole(User $user, User $model): bool
    {
        // Must be super admin and cannot demote themselves (if they are the only admin)
        // For simplicity: super_admin can edit anyone but themselves.
        return $user->isSuperAdmin() && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->isSuperAdmin() && $user->id !== $model->id;
    }
}
