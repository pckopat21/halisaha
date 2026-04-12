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
        Schema::table('tournaments', function (Blueprint $table) {
            $table->foreignId('champion_id')->nullable()->after('status')->constrained('teams')->nullOnDelete();
        });

        // Add 'assist' to the enum column. In MySQL, we need raw SQL or recreate table.
        // For simplicity and since it's a new system, we can use DB::statement or recreate.
        // Actually, match_events was created with enum.
        DB::statement("ALTER TABLE match_events MODIFY COLUMN event_type ENUM('goal', 'yellow_card', 'red_card', 'sub_in', 'sub_out', 'penalty_goal', 'penalty_miss', 'assist') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropForeign(['champion_id']);
            $table->dropColumn('champion_id');
        });

        DB::statement("ALTER TABLE match_events MODIFY COLUMN event_type ENUM('goal', 'yellow_card', 'red_card', 'sub_in', 'sub_out', 'penalty_goal', 'penalty_miss') NOT NULL");
    }
};
