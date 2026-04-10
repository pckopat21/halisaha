<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameRoster extends Model
{
    protected $table = 'match_rosters';

    protected $fillable = ['game_id', 'team_id', 'player_id', 'is_starting'];

    protected $casts = [
        'is_starting' => 'boolean',
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
