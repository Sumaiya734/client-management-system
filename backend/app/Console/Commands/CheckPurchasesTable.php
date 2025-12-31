<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CheckPurchasesTable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-purchases-table';

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
        $columns = Schema::getColumnListing('purchases');
        
        $this->info('Current purchases table structure:');
        foreach ($columns as $column) {
            $this->line("Column: $column");
        }
        
        $this->info('\nSample po_details values:');
        $purchases = DB::table('purchases')->select('id', 'po_details')->limit(5)->get();
        foreach ($purchases as $purchase) {
            $value = $purchase->po_details ? $purchase->po_details : 'NULL';
            $this->line("ID: {$purchase->id}, po_details: $value");
        }
    }
}
