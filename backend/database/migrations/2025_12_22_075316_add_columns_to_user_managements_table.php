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
        Schema::table('user_managements', function (Blueprint $table) {
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('role')->nullable();
            $table->string('status')->nullable();
            $table->timestamp('last_login')->nullable();
            // Actions column is typically handled in the frontend, not stored in DB
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_managements', function (Blueprint $table) {
            $table->dropColumn(['name', 'email', 'role', 'status', 'last_login']);
        });
    }
};
