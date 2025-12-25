<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // নতুন কলাম যোগ করুন
            $table->string('vendor')->nullable();
            $table->string('category')->nullable();
            $table->string('vendor_website')->nullable();
            $table->decimal('profit_margin', 10, 2)->default(0);
            
            // কলামের নাম পরিবর্তন
            $table->renameColumn('vendor_type', 'subscription_type');
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            // নতুন কলামগুলো ড্রপ করুন
            $table->dropColumn(['vendor', 'category', 'vendor_website', 'profit_margin']);
            
            // কলামের নাম পুরাতনে ফিরিয়ে আনুন
            $table->renameColumn('subscription_type', 'vendor_type');
        });
    }
};