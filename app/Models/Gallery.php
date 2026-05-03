<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $tournament_id
 * @property string $image_path
 * @property string|null $title
 * @property string|null $description
 * @property bool $is_active
 * @property int $sort_order
 */
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
