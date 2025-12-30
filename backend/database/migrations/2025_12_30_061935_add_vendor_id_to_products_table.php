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
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('vendor_id')->nullable()->after('vendor_website');
            
            // Create index
            $table->index('vendor_id', 'idx_vendor_id');
            
            // Add foreign key constraint
            $table->foreign('vendor_id', 'fk_products_vendor')->references('id')->on('vendors')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['vendor_id']);
            
            // Drop index
            $table->dropIndex(['idx_vendor_id']);
            
            // Drop column
            $table->dropColumn('vendor_id');
        });
    }
};
