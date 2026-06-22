<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use \App\Models\Traits\HasRegionScope;

    protected $fillable = ['tournament_id', 'name', 'advance_count', 'region_id'];

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
