<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create a function that can be called to log rate changes
        // We'll implement the trigger logic in the application layer
        // since PostgreSQL triggers are complex to manage in Laravel
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the function if it exists
    }
};
