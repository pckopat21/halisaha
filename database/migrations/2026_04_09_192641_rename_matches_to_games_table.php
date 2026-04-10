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
        Schema::rename('matches', 'games');
        
        Schema::table('match_rosters', function (Blueprint $table) {
            $table->renameColumn('match_id', 'game_id');
        });

        Schema::table('match_events', function (Blueprint $table) {
            $table->renameColumn('match_id', 'game_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('match_events', function (Blueprint $table) {
            $table->renameColumn('game_id', 'match_id');
        });

        Schema::table('match_rosters', function (Blueprint $table) {
            $table->renameColumn('game_id', 'match_id');
        });

        Schema::rename('games', 'matches');
    }
};
