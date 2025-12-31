<?php

namespace Database\Seeders;

use App\Models\Purchase;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PurchaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some existing clients and products to associate with purchases
        $clients = Client::all();
        $products = Product::all();
        
        if ($clients->count() > 0 && $products->count() > 0) {
            Purchase::create([
                'po_number' => 'PO-2025-001',
                'status' => 'Active',
                'client_id' => $clients->first()->id,
                'product_id' => $products->first()->id,
                'quantity' => 2,
                'subscription_type' => '1',
                'recurring_count' => 12,
                'delivery_date' => '2025-02-01',
                'subscription_active' => true,
                'total_amount' => 4297.08
            ]);
            
            Purchase::create([
                'po_number' => 'PO-2025-002',
                'status' => 'In Progress',
                'client_id' => $clients->skip(1)->first()?->id ?? $clients->first()->id,
                'product_id' => $products->skip(1)->first()?->id ?? $products->first()->id,
                'quantity' => 1,
                'subscription_type' => '1',
                'recurring_count' => 12,
                'delivery_date' => '2025-01-15',
                'subscription_active' => true,
                'total_amount' => 3094.00
            ]);
            
            Purchase::create([
                'po_number' => 'PO-2024-089',
                'status' => 'Completed',
                'client_id' => $clients->last()->id,
                'product_id' => $products->last()->id,
                'quantity' => 3,
                'subscription_type' => '1',
                'recurring_count' => 12,
                'delivery_date' => '2024-12-15',
                'subscription_active' => false,
                'total_amount' => 5370.30
            ]);
        }
    }
}
