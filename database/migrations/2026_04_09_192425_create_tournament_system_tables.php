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
        // Units (Birimler)
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // Players (Oyuncular)
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('staff_id')->unique()->nullable();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_company_staff')->default(false);
            $table->boolean('is_licensed')->default(false);
            $table->timestamp('health_certificate_at')->nullable();
            $table->timestamps();
        });

        // Tournaments (Turnuvalar)
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('year');
            $table->enum('status', ['draft', 'registration', 'active', 'completed'])->default('draft');
            $table->timestamps();
        });

        // Teams (Takımlar)
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->foreignId('captain_id')->nullable()->constrained('players')->nullOnDelete();
            $table->integer('seed_level')->default(0); // 0: No seed, 1, 2, 3, 4
            $table->enum('status', ['pending', 'approved', 'rejected', 'disqualified'])->default('pending');
            $table->boolean('has_exception')->default(false); // Rule 12: Admin override
            $table->timestamps();
        });

        // Team Player Pivot (Kadro)
        Schema::create('team_player', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->unique(['team_id', 'player_id']);
            $table->timestamps();
        });

        // Groups (Gruplar)
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // Group A, Group B, etc.
            $table->timestamps();
        });

        // Group Standings (Puan Durumu)
        Schema::create('standings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->integer('played')->default(0);
            $table->integer('won')->default(0);
            $table->integer('drawn')->default(0);
            $table->integer('lost')->default(0);
            $table->integer('goals_for')->default(0);
            $table->integer('goals_against')->default(0);
            $table->integer('points')->default(0);
            $table->integer('fair_play_points')->default(0); // For cards etc.
            $table->timestamps();
        });

        // Matches (Maçlar)
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('group_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('home_team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('away_team_id')->constrained('teams')->cascadeOnDelete();
            $table->integer('pitch_id')->default(1);
            $table->timestamp('scheduled_at')->nullable();
            $table->foreignId('winner_team_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->boolean('is_forfeit')->default(false);
            $table->integer('home_score')->default(0);
            $table->integer('away_score')->default(0);
            $table->enum('status', ['scheduled', 'playing', 'completed'])->default('scheduled');
            $table->boolean('has_penalties')->default(false);
            $table->integer('home_penalty_score')->default(0);
            $table->integer('away_penalty_score')->default(0);
            $table->timestamps();
        });

        // Match Rosters (Esame Listesi)
        Schema::create('match_rosters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_starting')->default(false);
            $table->timestamps();
        });

        // Match Events (Maç Olayları - Goal, Card, Sub)
        Schema::create('match_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('player_id')->nullable()->constrained()->cascadeOnDelete();
            $table->enum('event_type', ['goal', 'yellow_card', 'red_card', 'sub_in', 'sub_out', 'penalty_goal', 'penalty_miss']);
            $table->integer('minute')->nullable();
            $table->json('details')->nullable(); // For sub info etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('match_events');
        Schema::dropIfExists('match_rosters');
        Schema::dropIfExists('matches');
        Schema::dropIfExists('standings');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('team_player');
        Schema::dropIfExists('teams');
        Schema::dropIfExists('tournaments');
        Schema::dropIfExists('players');
        Schema::dropIfExists('units');
    }
};
