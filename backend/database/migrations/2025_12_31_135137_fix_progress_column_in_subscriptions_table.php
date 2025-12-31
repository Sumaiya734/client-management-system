<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update any existing string values in progress column to valid JSON if needed
        $subscriptions = DB::table('subscriptions')->select('id', 'progress')->get();
        
        foreach ($subscriptions as $subscription) {
            $progress = $subscription->progress;
            
            // If progress is not a valid JSON string, convert it appropriately
            if ($progress !== null && !is_array(json_decode($progress, true))) {
                // If it's a simple string, convert to a basic array structure
                if (!is_array($progress)) {
                    // Try to parse as JSON first, if it fails, set as default array
                    $decoded = json_decode($progress, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        // Not valid JSON, convert to default array structure
                        $newProgress = [
                            'status' => $progress,
                            'completed' => 0,
                            'total' => 1,
                            'percentage' => 0
                        ];
                        $progress = json_encode($newProgress);
                    } else {
                        $progress = $subscription->progress; // Already valid JSON
                    }
                }
                
                DB::table('subscriptions')
                    ->where('id', $subscription->id)
                    ->update(['progress' => $progress]);
            }
        }
        
        // Now change the column type
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->text('progress')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the column type back to string
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('progress')->change();
        });
    }
};
