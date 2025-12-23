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
        Schema::table('purchases', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('purchases', 'po_number')) {
                $table->string('po_number')->unique();
            }
            
            if (!Schema::hasColumn('purchases', 'client_id')) {
                $table->unsignedBigInteger('client_id')->nullable();
                $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            }
            
            if (!Schema::hasColumn('purchases', 'product_id')) {
                $table->unsignedBigInteger('product_id')->nullable();
                $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('purchases', 'quantity')) {
                $table->integer('quantity')->default(1);
            }
            
            if (!Schema::hasColumn('purchases', 'subscription_start')) {
                $table->date('subscription_start')->nullable();
            }
            
            if (!Schema::hasColumn('purchases', 'subscription_end')) {
                $table->date('subscription_end')->nullable();
            }
            
            if (!Schema::hasColumn('purchases', 'subscription_active')) {
                $table->boolean('subscription_active')->default(false);
            }
            
            // Update existing columns if needed
            if (Schema::hasColumn('purchases', 'po_details')) {
                $table->text('po_details')->nullable()->change();
            }
            
            if (Schema::hasColumn('purchases', 'total_amount')) {
                $table->decimal('total_amount', 10, 2)->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['product_id']);
            $table->dropColumn(['po_number', 'client_id', 'product_id', 'quantity', 'subscription_start', 'subscription_end', 'subscription_active']);
        });
    }
};
