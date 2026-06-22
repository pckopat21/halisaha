<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rule extends Model
{
    use \App\Models\Traits\HasRegionScope;

    protected $fillable = [
        'region_id',
        'title',
        'content',
        'sort_order',
        'is_active',
    ];
}
