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
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('type')->nullable();
            $table->string('recipient')->nullable();
            $table->string('client')->nullable();
            $table->string('subject')->nullable();
            $table->string('method')->nullable();
            $table->string('status')->nullable();
            $table->timestamp('sent_at')->nullable();
            // Actions column is typically handled in the frontend, not stored in DB
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['type', 'recipient', 'client', 'subject', 'method', 'status', 'sent_at']);
        });
    }
};
