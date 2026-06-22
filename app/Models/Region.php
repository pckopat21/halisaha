<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $fillable = ['name'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function tournaments()
    {
        return $this->hasMany(Tournament::class);
    }

    public function teams()
    {
        return $this->hasMany(Team::class);
    }

    public function players()
    {
        return $this->hasMany(Player::class);
    }

    public function fields()
    {
        return $this->hasMany(Field::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    public function galleries()
    {
        return $this->hasMany(Gallery::class);
    }
}
