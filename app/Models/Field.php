<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    use \App\Models\Traits\HasRegionScope;
    protected $fillable = ['name', 'location', 'description', 'is_active'];

    public function games()
    {
        return $this->hasMany(Game::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}
