<?php
// Test script to verify subscription creation and display fix

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use App\Models\Client;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Subscription;
use App\Services\PurchaseService;
use App\Services\SubscriptionService;

// Test the functionality
echo "Testing subscription creation and display fix...\n";

try {
    // Check if we have clients and products
    $clientCount = Client::count();
    $productCount = Product::count();

    echo "Clients in database: $clientCount\n";
    echo "Products in database: $productCount\n";

    if ($clientCount > 0 && $productCount > 0) {
        // Get the first client and product
        $client = Client::first();
        $product = Product::first();

        echo "Using client: {$client->company} (ID: {$client->id})\n";
        echo "Using product: {$product->product_name} (ID: {$product->id})\n";

        // Count subscriptions before
        $subscriptionsBefore = Subscription::count();
        echo "Subscriptions before: $subscriptionsBefore\n";

        // Create purchase service
        $purchaseService = new PurchaseService(new Purchase());

        // Test data for creating a purchase with subscription
        $testData = [
            'status' => 'Active',
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'subscription_type' => '1',
            'recurring_count' => 12,
            'delivery_date' => '2025-01-01',
            'subscription_active' => true, // This should now work correctly
            'total_amount' => 1000
        ];

        echo "Creating purchase with subscription_active: " . ($testData['subscription_active'] ? 'true' : 'false') . "\n";

        // Create purchase
        $result = $purchaseService->create($testData);
        echo "Purchase created successfully\n";

        // Count subscriptions after
        $subscriptionsAfter = Subscription::count();
        echo "Subscriptions after: $subscriptionsAfter\n";

        if ($subscriptionsAfter > $subscriptionsBefore) {
            echo "SUCCESS: Subscription was automatically created!\n";

            // Get the latest subscription
            $latestSubscription = Subscription::latest('id')->first();
            echo "Subscription details:\n";
            echo "  ID: {$latestSubscription->id}\n";
            echo "  PO Number: {$latestSubscription->po_number}\n";
            echo "  Client ID: {$latestSubscription->client_id}\n";
            echo "  Product ID: {$latestSubscription->product_id}\n";
            echo "  Purchase ID: {$latestSubscription->purchase_id}\n";
            echo "  Start Date: {$latestSubscription->start_date}\n";
            echo "  End Date: {$latestSubscription->end_date}\n";
            echo "  Status: {$latestSubscription->status}\n";

            // Test the SubscriptionService to see how it transforms the data
            $subscriptionService = new SubscriptionService(new Subscription());
            $transformedSubscriptions = $subscriptionService->getAll();

            echo "\nTransformed subscription data for frontend:\n";
            foreach ($transformedSubscriptions as $sub) {
                if ($sub['id'] == $latestSubscription->id) {
                    echo "  PO Number: {$sub['poNumber']}\n";
                    echo "  Client Company: {$sub['client']['company']}\n";
                    echo "  Client Contact: {$sub['client']['cli_name']}\n";
                    echo "  Products Count: " . count($sub['products']) . "\n";
                    echo "  Progress Status: {$sub['progress']['status']}\n";
                    echo "  Progress: {$sub['progress']['completed']}/{$sub['progress']['total']} ({$sub['progress']['percentage']}%)\n";
                    echo "  Total Amount: {$sub['totalAmount']}\n";
                    echo "  Can Generate Bill: " . ($sub['canGenerateBill'] ? 'Yes' : 'No') . "\n";
                    break;
                }
            }
        } else {
            echo "ISSUE: No subscription was created\n";
        }
    } else {
        echo "Need clients and products to test. Consider running migrations and seeders first.\n";
    }

} catch (Exception $e) {
    echo "Error occurred: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

echo "Test completed.\n";
