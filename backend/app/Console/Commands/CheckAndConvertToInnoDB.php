<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckAndConvertToInnoDB extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:convert-to-innodb';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and convert database tables to InnoDB engine';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tables = [
            'users',
            'password_reset_tokens',
            'failed_jobs',
            'clients',
            'products',
            'prices',
            'purchases',
            'subscriptions',
            'billing_managements',
            'payment_managements',
            'currency_rates',
            'reports',
            'notifications',
            'user_managements'
        ];

        $this->info('Checking and converting tables to InnoDB...');
        
        foreach ($tables as $table) {
            try {
                // Check current engine
                $result = \DB::select("SHOW TABLE STATUS LIKE '{$table}'");
                if (!empty($result)) {
                    $engine = $result[0]->Engine;
                    if (strtolower($engine) !== 'innodb') {
                        // Convert to InnoDB
                        \DB::statement("ALTER TABLE {$table} ENGINE=InnoDB");
                        $this->info("Converted table '{$table}' to InnoDB");
                    } else {
                        $this->info("Table '{$table}' is already using InnoDB");
                    }
                } else {
                    $this->warn("Table '{$table}' not found");
                }
            } catch (\Exception $e) {
                $this->error("Error processing table '{$table}': " . $e->getMessage());
            }
        }
        
        $this->info('Finished checking and converting tables to InnoDB.');
    }
}
