<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    protected $fillable = ['name', 'location', 'description', 'is_active'];

    public function games()
    {
        return $this->hasMany(Game::class);
    }}
