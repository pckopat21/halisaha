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
        Schema::table('predictions', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->integer('home_score')->nullable()->change();
            $table->integer('away_score')->nullable()->change();
            
            $table->string('prediction_type')->default('exact')->after('game_id'); // exact, outcome
            $table->string('outcome')->nullable()->after('prediction_type'); // home, draw, away
            $table->string('ip_address')->nullable()->after('outcome');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('predictions', function (Blueprint $table) {
            $table->dropColumn(['prediction_type', 'outcome', 'ip_address']);
        });
    }
};
