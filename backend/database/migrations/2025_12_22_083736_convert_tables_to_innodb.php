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
        $tables = [
            'users',
            'password_reset_tokens',
            'failed_jobs',
            'clients',
            'products',
            'prices',
            'purchases',
            'subscriptions',
            'billing_managements',
            'payment_managements',
            'currency_rates',
            'reports',
            'notifications',
            'user_managements'
        ];

        foreach ($tables as $table) {
            DB::statement("ALTER TABLE {$table} ENGINE=InnoDB");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse engine conversion
    }
};
