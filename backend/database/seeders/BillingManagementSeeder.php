<?php

namespace Database\Seeders;

use App\Models\Billing_management;
use App\Models\Client;
use App\Models\Subscription;
use App\Models\Purchase;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BillingManagementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing billing records only if needed
        // We'll skip truncation to avoid foreign key constraint issues
        // If records exist, we'll skip creating new ones
        $existingBills = Billing_management::count();
        
        if ($existingBills > 0) {
            $this->command->info('Billing records already exist. Skipping seeding.');
            return;
        }

        // Get existing clients, subscriptions, and purchases to link to billing records
        $clients = Client::all();
        $subscriptions = Subscription::all();
        $purchases = Purchase::all();

        if ($clients->isEmpty() || $purchases->isEmpty()) {
            // If no clients or purchases exist, create some sample ones first
            $this->command->info('Creating sample clients and purchases for billing records...');
            
            // Create sample clients
            $client1 = Client::create([
                'company' => 'Tech Solutions Inc.',
                'contact' => 'John Smith',
                'email' => 'john@techsolutions.com',
                'phone' => '+1-555-0101',
                'address' => '123 Business St, New York, NY',
                'status' => 'active'
            ]);

            $client2 = Client::create([
                'company' => 'Global Enterprises',
                'contact' => 'Sarah Johnson',
                'email' => 'sarah@globalent.com',
                'phone' => '+1-555-0102',
                'address' => '456 Corporate Ave, Los Angeles, CA',
                'status' => 'active'
            ]);

            $client3 = Client::create([
                'company' => 'Innovative Designs',
                'contact' => 'Michael Chen',
                'email' => 'michael@inno-designs.com',
                'phone' => '+1-555-0103',
                'address' => '789 Creative Blvd, Chicago, IL',
                'status' => 'active'
            ]);

            $clients = collect([$client1, $client2, $client3]);

            // Create sample purchases
            $purchase1 = \App\Models\Purchase::create([
                'client_id' => $client1->id,
                'product_id' => 1, // Using a placeholder ID, will be handled by seeder logic
                'quantity' => 5,
                'unit_price' => 100.00,
                'total_amount' => 500.00,
                'purchase_date' => now()->subDays(30),
                'status' => 'completed',
                'po_number' => 'PO-001',
                'notes' => 'Initial purchase for development tools'
            ]);

            $purchase2 = \App\Models\Purchase::create([
                'client_id' => $client2->id,
                'product_id' => 2,
                'quantity' => 3,
                'unit_price' => 250.00,
                'total_amount' => 750.00,
                'purchase_date' => now()->subDays(25),
                'status' => 'completed',
                'po_number' => 'PO-002',
                'notes' => 'Office equipment purchase'
            ]);

            $purchase3 = \App\Models\Purchase::create([
                'client_id' => $client3->id,
                'product_id' => 3,
                'quantity' => 10,
                'unit_price' => 75.00,
                'total_amount' => 750.00,
                'purchase_date' => now()->subDays(20),
                'status' => 'completed',
                'po_number' => 'PO-003',
                'notes' => 'Software licenses'
            ]);

            $purchases = collect([$purchase1, $purchase2, $purchase3]);
        }

        // Create sample billing records
        $billingRecords = [
            [
                'bill_number' => 'BILL-001',
                'client' => $clients->first()->company ?? 'Sample Client',
                'client_id' => $clients->first()->id ?? null,
                'po_number' => 'PO-001',
                'purchase_id' => $purchases->first()->id ?? null,
                'bill_date' => now()->subDays(30),
                'due_date' => now()->subDays(15),
                'total_amount' => 500.00,
                'paid_amount' => 500.00,
                'status' => 'Completed',
                'payment_status' => 'Paid',
            ],
            [
                'bill_number' => 'BILL-002',
                'client' => $clients->skip(1)->first()->company ?? 'Sample Client 2',
                'client_id' => $clients->skip(1)->first()->id ?? null,
                'po_number' => 'PO-002',
                'purchase_id' => $purchases->skip(1)->first()->id ?? null,
                'bill_date' => now()->subDays(25),
                'due_date' => now()->subDays(10),
                'total_amount' => 750.00,
                'paid_amount' => 500.00,
                'status' => 'Pending',
                'payment_status' => 'Partially Paid',
            ],
            [
                'bill_number' => 'BILL-003',
                'client' => $clients->skip(2)->first()->company ?? 'Sample Client 3',
                'client_id' => $clients->skip(2)->first()->id ?? null,
                'po_number' => 'PO-003',
                'purchase_id' => $purchases->skip(2)->first()->id ?? null,
                'bill_date' => now()->subDays(20),
                'due_date' => now()->addDays(10), // Future due date
                'total_amount' => 750.00,
                'paid_amount' => 0.00,
                'status' => 'Pending',
                'payment_status' => 'Unpaid',
            ],
            [
                'bill_number' => 'BILL-004',
                'client' => $clients->first()->company ?? 'Sample Client',
                'client_id' => $clients->first()->id ?? null,
                'po_number' => 'PO-004',
                'bill_date' => now()->subDays(15),
                'due_date' => now()->subDays(5),
                'total_amount' => 1200.00,
                'paid_amount' => 0.00,
                'status' => 'Overdue',
                'payment_status' => 'Unpaid',
            ],
            [
                'bill_number' => 'BILL-005',
                'client' => $clients->skip(1)->first()->company ?? 'Sample Client 2',
                'client_id' => $clients->skip(1)->first()->id ?? null,
                'po_number' => 'PO-005',
                'bill_date' => now()->subDays(10),
                'due_date' => now()->addDays(20),
                'total_amount' => 300.00,
                'paid_amount' => 300.00,
                'status' => 'Completed',
                'payment_status' => 'Paid',
            ],
        ];

        foreach ($billingRecords as $record) {
            Billing_management::create($record);
        }

        $this->command->info('Billing management records created successfully.');
    }
}