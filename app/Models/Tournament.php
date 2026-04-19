<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    protected $fillable = ['name', 'year', 'status', 'champion_id', 'settings'];

    protected $casts = [
        'settings' => 'array'
    ];

    public function getSettingsAttribute($value)
    {
        $defaults = [
            'max_roster_size' => 12,
            'min_roster_size' => 6,
            'max_licensed_players' => 2,
            'max_company_players' => 5,
            'max_licensed_on_pitch' => 1,
            'max_company_on_pitch' => 3,
            'yellow_card_limit' => 4,
            'substitution_limit' => 5,
            'total_players_on_pitch' => 7,
            'min_players_on_pitch' => 5,
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
}
