<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            RegionSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'role' => User::ROLE_SUPER_ADMIN,
        ]);
    }
}
