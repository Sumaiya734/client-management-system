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
        Schema::table('currency_rates', function (Blueprint $table) {
            $table->string('currency')->nullable();
            $table->decimal('rate', 10, 4)->nullable();
            $table->timestamp('last_updated')->nullable();
            $table->decimal('change', 10, 4)->nullable();
            $table->string('trend')->nullable();
            // Actions column is typically handled in the frontend, not stored in DB
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('currency_rates', function (Blueprint $table) {
            $table->dropColumn(['currency', 'rate', 'last_updated', 'change', 'trend']);
        });
    }
};
