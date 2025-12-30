<?php
// Test script to check billing management data

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use App\Models\Billing_management;
use App\Models\Client;
use App\Models\Subscription;
use App\Models\Purchase;
use App\Services\BillingManagementService;

// Test the functionality
echo "Testing billing management data...\n";

try {
    // Check if we have billing records
    $billingCount = Billing_management::count();
    echo "Billing records in database: $billingCount\n";

    if ($billingCount > 0) {
        echo "Found billing records! Here are the first few:\n";

        $billings = Billing_management::with('client', 'subscription', 'purchase')->take(5)->get();
        foreach ($billings as $billing) {
            echo "  Bill ID: {$billing->id}\n";
            echo "  Bill Number: {$billing->bill_number}\n";
            echo "  Client: " . ($billing->client ? $billing->client->company : 'N/A') . "\n";
            echo "  PO Number: {$billing->po_number}\n";
            echo "  Total Amount: {$billing->total_amount}\n";
            echo "  Status: {$billing->status}\n";
            echo "  Payment Status: {$billing->payment_status}\n";
            echo "  ---\n";
        }
    } else {
        echo "No billing records found in the database.\n";
        echo "This explains why the BillingManagement page shows no data.\n\n";

        // Check if we have the necessary data to create bills
        $subscriptionCount = Subscription::count();
        $purchaseCount = Purchase::count();
        $clientCount = Client::count();

        echo "Related data counts:\n";
        echo "  Subscriptions: $subscriptionCount\n";
        echo "  Purchases: $purchaseCount\n";
        echo "  Clients: $clientCount\n\n";

        if ($subscriptionCount > 0) {
            echo "We have subscriptions that could potentially generate bills.\n";
            echo "Bills are typically generated from completed subscriptions.\n";
        } else {
            echo "No subscriptions found. Bills are usually generated from subscriptions.\n";
        }

        echo "\nTo populate the BillingManagement page, you need to:\n";
        echo "1. Create purchase orders with subscriptions enabled\n";
        echo "2. Generate bills from completed subscriptions\n";
        echo "3. Or manually create billing records\n";
    }

    // Test the BillingManagementService
    echo "\nTesting BillingManagementService...\n";
    $billingService = new BillingManagementService(new Billing_management());
    $allBillings = $billingService->getAll();
    echo "Service returned " . count($allBillings) . " billing records\n";

    $summary = $billingService->getSummary();
    echo "Summary stats:\n";
    echo "  Total Bills: {$summary['totalBills']}\n";
    echo "  Total Revenue: {$summary['totalRevenue']}\n";
    echo "  Amount Collected: {$summary['amountCollected']}\n";

} catch (Exception $e) {
    echo "Error occurred: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

echo "Test completed.\n";
