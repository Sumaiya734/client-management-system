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
        Schema::table('subscriptions', function (Blueprint $table) {
            // Remove the client column since we use the relationship through client_id
            if (Schema::hasColumn('subscriptions', 'client')) {
                $table->dropColumn('client');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Add back the client column in case we need to rollback
            $table->string('client')->nullable();
        });
    }
};
