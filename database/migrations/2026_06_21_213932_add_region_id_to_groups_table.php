<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            if (!Schema::hasColumn('groups', 'region_id')) {
                $table->foreignId('region_id')->nullable()->constrained('regions')->onDelete('cascade');
            }
        });

        // Populate region_id from tournaments
        \Illuminate\Support\Facades\DB::statement('
            UPDATE `groups` 
            INNER JOIN tournaments ON `groups`.tournament_id = tournaments.id 
            SET `groups`.region_id = tournaments.region_id
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropForeign(['region_id']);
            $table->dropColumn('region_id');
        });
    }
};
