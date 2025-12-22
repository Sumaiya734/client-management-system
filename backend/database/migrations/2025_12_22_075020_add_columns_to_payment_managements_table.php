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
        Schema::table('payment_managements', function (Blueprint $table) {
            $table->string('po_number')->nullable();
            $table->string('client')->nullable();
            $table->date('date')->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('method')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('status')->nullable();
            $table->string('receipt')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_managements', function (Blueprint $table) {
            $table->dropColumn(['po_number', 'client', 'date', 'amount', 'method', 'transaction_id', 'status', 'receipt']);
        });
    }
};
