<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Standing extends Model
{
    protected $fillable = [
        'group_id', 
        'team_id', 
        'played', 
        'won', 
        'drawn', 
        'lost', 
        'goals_for', 
        'goals_against', 
        'points', 
        'fair_play_points'
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function getGoalDifferenceAttribute()
    {
        return $this->goals_for - $this->goals_against;
    }
}
