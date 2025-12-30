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
        // Check if columns already exist to avoid errors
        $columns = Schema::getColumnListing('purchases');
        
        if (!in_array('subscription_type', $columns)) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->string('subscription_type')->nullable()->after('subscription_end');
            });
        }
        
        if (!in_array('recurring_count', $columns)) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->integer('recurring_count')->default(1)->after('subscription_type');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columns = Schema::getColumnListing('purchases');
        
        if (in_array('subscription_type', $columns)) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->dropColumn(['subscription_type', 'recurring_count']);
            });
        }
    }
};