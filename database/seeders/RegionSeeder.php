<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regions = [
            '1. Bölge (İstanbul)',
            '2. Bölge (İzmir)',
            '3. Bölge (Konya)',
            '4. Bölge (Ankara)',
            '5. Bölge (Mersin)',
            '6. Bölge (Kayseri)',
            '7. Bölge (Samsun)',
            '8. Bölge (Elazığ)',
            '9. Bölge (Diyarbakır)',
            '10. Bölge (Trabzon)',
            '11. Bölge (Van)',
            '12. Bölge (Erzurum)',
            '13. Bölge (Antalya)',
            '14. Bölge (Bursa)',
            '15. Bölge (Kastamonu)',
            '16. Bölge (Sivas)',
            '17. Bölge (İstanbul - Otoyol)',
            '18. Bölge (Kars)',
        ];

        foreach ($regions as $region) {
            \App\Models\Region::create(['name' => $region]);
        }
    }
}
