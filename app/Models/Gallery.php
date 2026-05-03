<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $fillable = [
        'tournament_id',
        'image_path',
        'title',
        'description',
        'is_active',
        'sort_order'
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }
}
