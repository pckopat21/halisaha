<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_COMMITTEE = 'committee';
    const ROLE_TEAM_MANAGER = 'team_manager';
    const ROLE_REFEREE = 'referee';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'unit_id',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isCommittee(): bool
    {
        return $this->role === self::ROLE_COMMITTEE || $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isTeamManager(): bool
    {
        return $this->role === self::ROLE_TEAM_MANAGER;
    }

    public function isReferee(): bool
    {
        return $this->role === self::ROLE_REFEREE || $this->role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
