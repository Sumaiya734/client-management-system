<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment_management;
use App\Models\Client;

class SamplePaymentSeeder extends Seeder
{
    public function run()
    {
        // Get first client or create a sample one
        $client = Client::first();
        if (!$client) {
            $client = Client::create([
                'company' => 'Sample Company',
                'cli_name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '1234567890',
                'address' => '123 Main St',
                'status' => 'Active'
            ]);
        }

        // Create sample payments
        $payments = [
            [
                'po_number' => 'PO-2026-0001',
                'client_id' => $client->id,
                'date' => '2026-01-04',
                'amount' => 1500.00,
                'method' => 'Bank Transfer',
                'transaction_id' => 'PO-2026-0001',
                'status' => 'Completed',
                'receipt' => 'Generated'
            ],
            [
                'po_number' => 'PO-2026-0002',
                'client_id' => $client->id,
                'date' => '2026-01-03',
                'amount' => 2500.00,
                'method' => 'Credit Card',
                'transaction_id' => 'PO-2026-0002',
                'status' => 'Pending',
                'receipt' => 'Not Generated'
            ],
            [
                'po_number' => 'PO-2026-0003',
                'client_id' => $client->id,
                'date' => '2026-01-02',
                'amount' => 750.50,
                'method' => 'Check',
                'transaction_id' => 'PO-2026-0003',
                'status' => 'Completed',
                'receipt' => 'Generated'
            ]
        ];

        foreach ($payments as $payment) {
            Payment_management::create($payment);
        }

        $this->command->info('Sample payments created successfully!');
    }
}
