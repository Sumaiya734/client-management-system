<?php

namespace Database\Seeders;

use App\Models\Payment_management;
use App\Models\Client;
use App\Models\Purchase;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentManagementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing clients and purchases to associate with payments
        $clients = Client::all();
        $purchases = Purchase::all();
        
        if ($clients->count() > 0 && $purchases->count() > 0) {
            Payment_management::create([
                'po_number' => 'PO-2025-001',
                'client_id' => $clients->first()->id,
                'date' => '2025-01-16',
                'amount' => 99.99,
                'method' => 'Credit Card',
                'transaction_id' => 'TXN-2025-001',
                'status' => 'Completed',
                'receipt' => 'Generated'
            ]);
            
            Payment_management::create([
                'po_number' => 'PO-2025-002',
                'client_id' => $clients->skip(1)->first()?->id ?? $clients->first()->id,
                'date' => '2025-01-12',
                'amount' => 15.00,
                'method' => 'Bank Transfer',
                'transaction_id' => 'TXN-2025-002',
                'status' => 'Completed',
                'receipt' => 'Generated'
            ]);
            
            Payment_management::create([
                'po_number' => 'PO-2024-089',
                'client_id' => $clients->last()->id,
                'date' => '2024-12-15',
                'amount' => 150.00,
                'method' => 'Check',
                'transaction_id' => 'CHK-2024-089',
                'status' => 'Pending',
                'receipt' => 'Not Generated'
            ]);
        }
    }
}
