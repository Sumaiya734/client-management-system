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
            $table->string('product_name')->nullable();
            $table->string('vendor_type')->nullable();
            $table->decimal('base_price', 10, 2)->nullable();
            $table->decimal('bdt_price', 10, 2)->nullable();
            $table->string('multi_currency')->nullable();
            $table->string('status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['product_name', 'vendor_type', 'base_price', 'bdt_price', 'multi_currency', 'status']);
        });
    }
};
