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
        // ========================================
        // CLIENT MANAGEMENT DATABASE RELATIONS
        // ========================================

        // Step 1: Convert tables to InnoDB (required for foreign keys)
        $tables = [
            'clients', 'products', 'prices', 'purchases', 'subscriptions',
            'billing_managements', 'payment_managements', 'notifications',
            'currency_rates', 'reports', 'user_managements', 'users'
        ];

        foreach ($tables as $table) {
            DB::statement("ALTER TABLE {$table} ENGINE=InnoDB");
        }

        // ========================================
        // Step 2: PURCHASES Table Relations
        // ========================================

        // Add foreign key columns
        Schema::table('purchases', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable()->after('updated_at');
            $table->unsignedBigInteger('product_id')->nullable()->after('client_id');

            // Create indexes
            $table->index('client_id', 'idx_client_id');
            $table->index('product_id', 'idx_product_id');

            // Add foreign key constraints
            $table->foreign('client_id', 'fk_purchases_client')->references('id')->on('clients')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('product_id', 'fk_purchases_product')->references('id')->on('products')->onDelete('set null')->onUpdate('cascade');
        });

        // ========================================
        // Step 3: SUBSCRIPTIONS Table Relations
        // ========================================

        // Add foreign key columns
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable()->after('updated_at');
            $table->unsignedBigInteger('product_id')->nullable()->after('client_id');
            $table->date('start_date')->nullable()->after('progress');
            $table->date('end_date')->nullable()->after('start_date');
            $table->date('next_billing_date')->nullable()->after('end_date');

            // Create indexes
            $table->index('client_id', 'idx_client_id');
            $table->index('product_id', 'idx_product_id');
            $table->index('next_billing_date', 'idx_next_billing_date');

            // Add foreign key constraints
            $table->foreign('client_id', 'fk_subscriptions_client')->references('id')->on('clients')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('product_id', 'fk_subscriptions_product')->references('id')->on('products')->onDelete('set null')->onUpdate('cascade');
        });

        // ========================================
        // Step 4: BILLING_MANAGEMENTS Table Relations
        // ========================================

        // Add foreign key columns
        Schema::table('billing_managements', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable()->after('updated_at');
            $table->unsignedBigInteger('subscription_id')->nullable()->after('client_id');
            $table->unsignedBigInteger('purchase_id')->nullable()->after('subscription_id');

            // Create indexes
            $table->index('client_id', 'idx_client_id');
            $table->index('subscription_id', 'idx_subscription_id');
            $table->index('purchase_id', 'idx_purchase_id');
            $table->index('due_date', 'idx_due_date');
            $table->index('payment_status', 'idx_payment_status');

            // Add foreign key constraints
            $table->foreign('client_id', 'fk_billing_client')->references('id')->on('clients')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('subscription_id', 'fk_billing_subscription')->references('id')->on('subscriptions')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('purchase_id', 'fk_billing_purchase')->references('id')->on('purchases')->onDelete('set null')->onUpdate('cascade');
        });

        // ========================================
        // Step 5: PAYMENT_MANAGEMENTS Table Relations
        // ========================================

        // Add foreign key columns
        Schema::table('payment_managements', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable()->after('updated_at');
            $table->unsignedBigInteger('billing_id')->nullable()->after('client_id');

            // Create indexes
            $table->index('client_id', 'idx_client_id');
            $table->index('billing_id', 'idx_billing_id');
            $table->index('transaction_id', 'idx_transaction_id');
            $table->index('date', 'idx_date');

            // Add foreign key constraints
            $table->foreign('client_id', 'fk_payment_client')->references('id')->on('clients')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('billing_id', 'fk_payment_billing')->references('id')->on('billing_managements')->onDelete('cascade')->onUpdate('cascade');
        });

        // ========================================
        // Step 6: NOTIFICATIONS Table Relations
        // ========================================

        // Add foreign key columns
        Schema::table('notifications', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable()->after('updated_at');
            $table->unsignedBigInteger('user_id')->nullable()->after('client_id');

            // Create indexes
            $table->index('client_id', 'idx_client_id');
            $table->index('user_id', 'idx_user_id');
            $table->index('type', 'idx_type');
            $table->index('status', 'idx_status');
            $table->index('sent_at', 'idx_sent_at');

            // Add foreign key constraints
            $table->foreign('client_id', 'fk_notifications_client')->references('id')->on('clients')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('user_id', 'fk_notifications_user')->references('id')->on('users')->onDelete('cascade')->onUpdate('cascade');
        });

        // ========================================
        // Step 7: PRICES Table Setup
        // ========================================

        // Add product relation and pricing columns
        Schema::table('prices', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable()->after('updated_at');
            $table->string('currency', 10)->nullable()->after('product_id');
            $table->decimal('amount', 10, 2)->nullable()->after('currency');
            $table->enum('billing_cycle', ['monthly', 'yearly', 'one-time'])->nullable()->after('amount');
            $table->boolean('is_active')->default(true)->after('billing_cycle');

            // Create indexes
            $table->index('product_id', 'idx_product_id');
            $table->index('currency', 'idx_currency');

            // Add foreign key constraint
            $table->foreign('product_id', 'fk_prices_product')->references('id')->on('products')->onDelete('cascade')->onUpdate('cascade');
        });

        // ========================================
        // Step 8: Additional Indexes for Performance
        // ========================================

        // Clients table indexes
        Schema::table('clients', function (Blueprint $table) {
            $table->index('email', 'idx_email');
            $table->index('status', 'idx_status');
            $table->index('company', 'idx_company');
        });

        // Products table indexes
        Schema::table('products', function (Blueprint $table) {
            $table->index('status', 'idx_status');
            $table->index('vendor_type', 'idx_vendor_type');
        });

        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index('role', 'idx_role');
        });

        // ========================================
        // Step 9: Add Email Unique Constraint
        // ========================================

        // Make client email unique
        Schema::table('clients', function (Blueprint $table) {
            $table->unique('email', 'unique_client_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
