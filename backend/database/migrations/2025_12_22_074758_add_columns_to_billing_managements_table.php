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
        Schema::table('billing_managements', function (Blueprint $table) {
            $table->string('bill_number')->nullable();
            $table->string('client')->nullable();
            $table->string('po_number')->nullable();
            $table->date('bill_date')->nullable();
            $table->date('due_date')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->decimal('paid_amount', 10, 2)->nullable();
            $table->string('status')->nullable();
            $table->string('payment_status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_managements', function (Blueprint $table) {
            $table->dropColumn(['bill_number', 'client', 'po_number', 'bill_date', 'due_date', 'total_amount', 'paid_amount', 'status', 'payment_status']);
        });
    }
};
