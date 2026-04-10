<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Unit;
use App\Models\Player;
use App\Models\Tournament;
use App\Models\Team;
use Illuminate\Support\Str;

class TournamentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Units
        $units = ['IT', 'HR', 'Finance', 'Logistics', 'Security', 'Sales'];
        foreach ($units as $u) {
            Unit::create(['name' => $u, 'slug' => Str::slug($u)]);
        }

        // 2. Create Players
        $allUnits = Unit::all();
        foreach ($allUnits as $unit) {
            for ($i = 1; $i <= 15; $i++) {
                Player::create([
                    'first_name' => "Player_$i",
                    'last_name' => $unit->name,
                    'staff_id' => "Staff_" . $unit->name . "_$i",
                    'unit_id' => $unit->id,
                    'is_company_staff' => rand(0, 10) > 3,
                    'is_licensed' => rand(0, 10) > 8,
                    'health_certificate_at' => now(),
                ]);
            }
        }

        // 3. Create Tournament
        $tournament = Tournament::create([
            'name' => '2026 Bahar Turnuvası',
            'year' => 2026,
            'status' => 'draft'
        ]);

        // 4. Create Teams for some units
        foreach ($allUnits as $unit) {
            $players = Player::where('unit_id', $unit->id)->take(10)->get();
            $team = Team::create([
                'tournament_id' => $tournament->id,
                'unit_id' => $unit->id,
                'name' => $unit->name . " FC",
                'captain_id' => $players->first()->id,
                'status' => 'approved',
                'seed_level' => rand(0, 4)
            ]);

            $team->players()->attach($players->pluck('id'));
        }
    }
}
