<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = [
        'tournament_id', 
        'unit_id', 
        'user_id',
        'name', 
        'captain_id', 
        'seed_level', 
        'status', 
        'has_exception',
        'rejection_reason'
    ];

    protected $casts = [
        'has_exception' => 'boolean',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function captain()
    {
        return $this->belongsTo(Player::class, 'captain_id');
    }

    public function players()
    {
        return $this->belongsToMany(Player::class, 'team_player');
    }

    public function homeGames()
    {
        return $this->hasMany(Game::class, 'home_team_id');
    }

    public function awayGames()
    {
        return $this->hasMany(Game::class, 'away_team_id');
    }

    public function events()
    {
        return $this->hasMany(GameEvent::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function standings()
    {
        return $this->hasMany(Standing::class);
    }
}
