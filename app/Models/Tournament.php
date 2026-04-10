<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    protected $fillable = ['name', 'year', 'status'];

    public function teams()
    {
        return $this->hasMany(Team::class);
    }

    public function groups()
    {
        return $this->hasMany(Group::class);
    }

    public function games()
    {
        return $this->hasMany(Game::class);
    }
}
