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
        Schema::table('purchases', function (Blueprint $table) {
            $table->text('po_details')->nullable();
            $table->string('client')->nullable();
            $table->text('products_subscriptions')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->string('status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['po_details', 'client', 'products_subscriptions', 'total_amount', 'status']);
        });
    }
};
