<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property int $year
 * @property string $status
 * @property int|null $champion_id
 * @property array $settings
 */
class Tournament extends Model
{
    protected $fillable = ['name', 'year', 'status', 'champion_id', 'settings'];

    protected $casts = [
        'settings' => 'array'
    ];

    public function getSettingsAttribute($value)
    {
        $defaults = [
            'max_roster_size' => 11,
            'min_roster_size' => 5,
            'max_licensed_players' => 2,
            'max_company_players' => 1,
            'max_licensed_on_pitch' => 0,
            'max_company_on_pitch' => 1,
            'yellow_card_limit' => 3,
            'substitution_limit' => 4,
            'total_players_on_pitch' => 5,
            'min_players_on_pitch' => 3,
            'match_duration' => 50,
        ];

        if (!$value) return $defaults;

        $settings = json_decode($value, true) ?: [];
        return array_merge($defaults, $settings);
    }

    public function champion()
    {
        return $this->belongsTo(Team::class, 'champion_id');
    }

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

    public function galleries()
    {
        return $this->hasMany(Gallery::class);
    }
}
