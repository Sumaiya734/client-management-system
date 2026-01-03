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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('set null');
            $table->string('client_name')->nullable();
            $table->text('client_address')->nullable();
            $table->string('client_email')->nullable();
            $table->string('client_phone')->nullable();
            $table->string('po_number')->nullable();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->onDelete('set null');
            $table->foreignId('purchase_id')->nullable()->constrained('purchases')->onDelete('set null');
            $table->foreignId('billing_id')->nullable()->constrained('billing_managements')->onDelete('set null');
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->decimal('sub_total', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->decimal('balance_amount', 10, 2)->default(0);
            $table->string('status')->default('Draft'); // Draft, Sent, Paid, Overdue, Cancelled
            $table->string('payment_status')->default('Unpaid'); // Unpaid, Partially Paid, Paid
            $table->text('notes')->nullable();
            $table->text('terms')->nullable();
            $table->json('items')->nullable(); // Store invoice items as JSON
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
