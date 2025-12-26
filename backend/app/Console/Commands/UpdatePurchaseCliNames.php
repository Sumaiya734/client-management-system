<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class UpdatePurchaseCliNames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-purchase-cli-names';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update existing purchase records to populate cli_name based on client_id';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $purchases = \App\Models\Purchase::whereNotNull('client_id')->get();
        
        $updatedCount = 0;
        
        foreach ($purchases as $purchase) {
            $client = \App\Models\Client::find($purchase->client_id);
            
            if ($client) {
                // Update the purchase with the client's name
                $cliName = $client->cli_name ?? $client->name;
                $purchase->update([
                    'cli_name' => $cliName
                ]);
                $updatedCount++;
                
                $cliName = $client->cli_name ?? $client->name;
                $this->info("Updated purchase #{$purchase->id} with cli_name: {$cliName}");
            }
        }
        
        $this->info("Successfully updated {$updatedCount} purchase records with cli_name");
    }
}
