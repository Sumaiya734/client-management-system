<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\Client;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing clients, products, and purchases to associate with subscriptions
        $clients = Client::all();
        $products = Product::all();
        $purchases = Purchase::all();
        
        if ($clients->count() > 0 && $products->count() > 0 && $purchases->count() > 0) {
            Subscription::create([
                'po_number' => 'PO-2025-001',
                'client_id' => $clients->first()->id,
                'product_id' => $products->first()->id,
                'purchase_id' => $purchases->first()->id,
                'start_date' => '2025-02-01',
                'end_date' => '2026-01-31',
                'status' => 'Active',
                'notes' => 'Initial subscription for Zoom Pro',
                'quantity' => 2,
                'total_amount' => 4297.08,
                'next_billing_date' => '2026-01-31'
            ]);
            
            Subscription::create([
                'po_number' => 'PO-2025-002',
                'client_id' => $clients->skip(1)->first()?->id ?? $clients->first()->id,
                'product_id' => $products->skip(1)->first()?->id ?? $products->first()->id,
                'purchase_id' => $purchases->skip(1)->first()?->id ?? $purchases->first()->id,
                'start_date' => '2025-01-15',
                'end_date' => '2025-12-31',
                'status' => 'Pending',
                'notes' => 'Microsoft Teams subscription pending activation',
                'quantity' => 5,
                'total_amount' => 4143.75,
                'next_billing_date' => '2025-12-31'
            ]);
            
            Subscription::create([
                'po_number' => 'PO-2024-089',
                'client_id' => $clients->last()->id,
                'product_id' => $products->last()->id,
                'purchase_id' => $purchases->last()->id,
                'start_date' => '2024-12-15',
                'end_date' => '2025-12-14',
                'status' => 'Active',
                'notes' => 'Office 365 Business subscription',
                'quantity' => 10,
                'total_amount' => 16575.00,
                'next_billing_date' => '2025-12-14'
            ]);
        }
    }
}
