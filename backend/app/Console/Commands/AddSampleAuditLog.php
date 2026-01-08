<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AddSampleAuditLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:add-sample-audit-log';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add a sample audit log entry to the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating sample audit log entry...');
        
        try {
            $auditLog = AuditLog::create([
                'action' => 'Data Export',
                'module' => 'Reporting',
                'details' => 'User exported client data to CSV',
                'ip_address' => '192.168.1.101',
                'url' => '/reports/export',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
            ]);
            
            $this->info("Sample audit log entry created successfully with ID: {$auditLog->id}");
        } catch (\Exception $e) {
            $this->error('Error creating sample audit log entry: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
