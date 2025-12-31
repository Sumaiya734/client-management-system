<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // The po_details column should already be text type from previous migrations
        // This migration is to ensure the column exists and is properly configured
        if (!Schema::hasColumn('purchases', 'po_details')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->text('po_details')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No action needed as we're not changing the schema structure
        // The column should remain for data consistency
    }
};
