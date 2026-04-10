<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $fillable = ['name', 'slug'];

    public function players()
    {
        return $this->hasMany(Player::class);
    }

    public function teams()
    {
        return $this->hasMany(Team::class);
    }
}
