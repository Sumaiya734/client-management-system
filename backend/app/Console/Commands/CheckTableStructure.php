<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class CheckTableStructure extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-table-structure';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $columns = Schema::getColumnListing('subscriptions');
        
        $this->info('Current subscriptions table structure:');
        foreach ($columns as $column) {
            $this->line("Column: $column");
        }
        
        $this->info('\nModel fillable array:');
        $subscription = new \App\Models\Subscription();
        $fillable = $subscription->getFillable();
        foreach ($fillable as $field) {
            $status = in_array($field, $columns) ? 'EXISTS' : 'MISSING';
            $this->line("Field: $field - $status");
        }
    }
}
