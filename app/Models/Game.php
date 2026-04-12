<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'tournament_id',
        'group_id',
        'home_team_id',
        'away_team_id',
        'pitch_id',
        'scheduled_at',
        'winner_team_id',
        'is_forfeit',
        'home_score',
        'away_score',
        'status',
        'has_penalties',
        'home_penalty_score',
        'away_penalty_score',
        'round',
        'started_at'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'is_forfeit' => 'boolean',
        'has_penalties' => 'boolean',
        'started_at' => 'datetime',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function homeTeam()
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam()
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function winnerTeam()
    {
        return $this->belongsTo(Team::class, 'winner_team_id');
    }

    public function rosters()
    {
        return $this->hasMany(GameRoster::class);
    }

    public function events()
    {
        return $this->hasMany(GameEvent::class);
    }
}
