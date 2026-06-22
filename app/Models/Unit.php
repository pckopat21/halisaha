<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use \App\Models\Traits\HasRegionScope;
    protected $fillable = ['name', 'slug'];

    public function players()
    {
        return $this->hasMany(Player::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function teams()
    {
        return $this->hasMany(Team::class);
    }
}
