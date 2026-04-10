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
        Schema::table('players', function (Blueprint $table) {
            $table->renameColumn('staff_id', 'tc_id');
            $table->string('sicil_no')->after('last_name')->nullable(); // Mandatory but nullable for migration transition
            $table->boolean('is_permanent_staff')->default(false)->after('is_company_staff');
        });

        // Set tc_id as sicil_no for existing company staff
        DB::table('players')->where('is_company_staff', true)->update([
            'sicil_no' => DB::raw('tc_id')
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->renameColumn('tc_id', 'staff_id');
            $table->dropColumn(['sicil_no', 'is_permanent_staff']);
        });
    }
};
