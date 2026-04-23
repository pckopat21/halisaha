<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $fillable = ['tournament_id', 'name', 'advance_count'];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function standings()
    {
        return $this->hasMany(Standing::class)->with('team');
    }

    public function games()
    {
        return $this->hasMany(Game::class);
    }
}
