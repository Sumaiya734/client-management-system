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
        // Rename name column in clients table to cli_name
        Schema::table('clients', function (Blueprint $table) {
            $table->renameColumn('name', 'cli_name');
        });
        
        // Rename client column in purchases table to cli_name
        Schema::table('purchases', function (Blueprint $table) {
            $table->renameColumn('client', 'cli_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename cli_name column in clients table back to name
        Schema::table('clients', function (Blueprint $table) {
            $table->renameColumn('cli_name', 'name');
        });
        
        // Rename cli_name column in purchases table back to client
        Schema::table('purchases', function (Blueprint $table) {
            $table->renameColumn('cli_name', 'client');
        });
    }
};
