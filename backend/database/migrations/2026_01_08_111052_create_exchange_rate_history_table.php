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
        Schema::create('exchange_rate_history', function (Blueprint $table) {
            $table->id();
            $table->string('currency', 10)->nullable();
            $table->decimal('rate', 10, 4)->nullable();
            $table->decimal('previous_rate', 10, 4)->nullable();
            $table->decimal('change', 10, 4)->nullable();
            $table->decimal('percentage_change', 10, 2)->nullable();
            $table->enum('trend', ['up', 'down', 'stable'])->nullable();
            $table->date('date')->nullable();
            $table->timestamp('timestamp')->nullable()->default(now());
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('created_at')->nullable()->default(now());
            
            // Add indexes
            $table->index(['currency', 'date'], 'idx_currency_date');
            $table->index('timestamp', 'idx_timestamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rate_history');
    }
};
