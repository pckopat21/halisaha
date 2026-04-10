<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = [
        'first_name', 
        'last_name', 
        'tc_id', 
        'sicil_no',
        'unit_id', 
        'is_company_staff', 
        'is_permanent_staff',
        'is_licensed', 
        'health_certificate_at'
    ];

    protected $casts = [
        'is_company_staff' => 'boolean',
        'is_permanent_staff' => 'boolean',
        'is_licensed' => 'boolean',
        'health_certificate_at' => 'datetime',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_player');
    }
}
