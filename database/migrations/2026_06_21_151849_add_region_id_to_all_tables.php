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
        $tables = ['users', 'tournaments', 'teams', 'players', 'fields', 'announcements', 'galleries', 'units'];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                if (!Schema::hasColumn($table, 'region_id')) {
                    $blueprint->foreignId('region_id')->nullable()->constrained('regions')->onDelete('cascade');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['users', 'tournaments', 'teams', 'players', 'fields', 'announcements', 'galleries', 'units'];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                if (Schema::hasColumn($table, 'region_id')) {
                    $blueprint->dropForeign(['region_id']);
                    $blueprint->dropColumn('region_id');
                }
            });
        }
    }
};
