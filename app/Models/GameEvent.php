<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameEvent extends Model
{
    protected $table = 'match_events';

    protected $fillable = [
        'game_id', 
        'team_id', 
        'player_id', 
        'event_type', 
        'minute', 
        'details'
    ];

    protected $casts = [
        'details' => 'array',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
