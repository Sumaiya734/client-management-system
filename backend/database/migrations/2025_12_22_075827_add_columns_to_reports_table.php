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
        Schema::table('reports', function (Blueprint $table) {
            $table->decimal('total_revenue', 12, 2)->nullable();
            $table->integer('total_clients')->nullable();
            $table->integer('active_subscriptions')->nullable();
            $table->decimal('avg_revenue_per_client', 12, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['total_revenue', 'total_clients', 'active_subscriptions', 'avg_revenue_per_client']);
        });
    }
};
