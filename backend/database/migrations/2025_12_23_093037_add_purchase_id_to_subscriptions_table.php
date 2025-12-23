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
            if (!Schema::hasColumn('subscriptions', 'purchase_id')) {
                $table->unsignedBigInteger('purchase_id')->nullable();
                $table->foreign('purchase_id')->references('id')->on('purchases')->onDelete('set null');
            }
            
            // Add other missing columns if needed
            if (!Schema::hasColumn('subscriptions', 'po_number')) {
                $table->string('po_number')->nullable();
            }
            
            if (!Schema::hasColumn('subscriptions', 'status')) {
                $table->string('status')->default('Pending');
            }
            
            if (!Schema::hasColumn('subscriptions', 'notes')) {
                $table->text('notes')->nullable();
            }
            
            if (!Schema::hasColumn('subscriptions', 'quantity')) {
                $table->integer('quantity')->default(1);
            }
            
            if (!Schema::hasColumn('subscriptions', 'next_billing_date')) {
                $table->date('next_billing_date')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropForeign(['purchase_id']);
            $table->dropColumn(['purchase_id', 'po_number', 'status', 'notes', 'quantity', 'next_billing_date']);
        });
    }
};
