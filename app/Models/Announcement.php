<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use \App\Models\Traits\HasRegionScope;
    protected $fillable = [
        'title',
        'content',
        'type',
        'is_active',
        'published_at',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}
