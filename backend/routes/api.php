<?php

use Illuminate\Support\Facades\Route;

Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/user', [\App\Http\Controllers\Api\AuthController::class, 'me']);
});

Route::get('/test', function () {
    return response()->json([
        'project' => 'Client Management System',
        'status' => 'API is working'
    ]);
});

// Test routes to check data
Route::get('test-clients', function () {
    $clients = App\Models\Client::all();
    return response()->json([
        'success' => true,
        'data' => $clients,
        'count' => $clients->count()
    ]);
});

Route::get('test-products', function () {
    $products = App\Models\Product::all();
    return response()->json([
        'success' => true,
        'data' => $products,
        'count' => $products->count()
    ]);
});

Route::get('test-purchases', function () {
    $purchases = App\Models\Purchase::with(['client', 'product'])->get();
    return response()->json([
        'success' => true,
        'data' => $purchases,
        'count' => $purchases->count()
    ]);
});

// Dashboard/Home Routes
Route::get('dashboard', [\App\Http\Controllers\Api\HomeController::class, 'index']);
Route::get('dashboard-stats', [\App\Http\Controllers\Api\HomeController::class, 'getStats']);

// Client Management Routes
Route::apiResource('clients', \App\Http\Controllers\Api\ClientController::class);
Route::post('clients-search', [\App\Http\Controllers\Api\ClientController::class, 'search']);
Route::post('clients-paginate', [\App\Http\Controllers\Api\ClientController::class, 'paginate']);

// Product Management Routes
Route::apiResource('products', \App\Http\Controllers\Api\ProductController::class);
Route::post('products-search', [\App\Http\Controllers\Api\ProductController::class, 'search']);

// Billing Management Routes
Route::apiResource('billing-managements', \App\Http\Controllers\Api\BillingManagementController::class);

// Additional billing management routes
Route::get('billing-managements-search', [\App\Http\Controllers\Api\BillingManagementController::class, 'search']);
Route::get('billing-managements-summary', [\App\Http\Controllers\Api\BillingManagementController::class, 'summary']);
Route::get('billing-managements/{id}/download', [\App\Http\Controllers\Api\BillingManagementController::class, 'download']);

// Currency Rate Routes
Route::apiResource('currency-rates', \App\Http\Controllers\Api\CurrencyRateController::class);

// Additional currency rate routes
Route::get('currency-rates-search', [\App\Http\Controllers\Api\CurrencyRateController::class, 'search']);
Route::get('currency-rates-summary', [\App\Http\Controllers\Api\CurrencyRateController::class, 'summary']);

// Notification Routes
Route::apiResource('notifications', \App\Http\Controllers\Api\NotificationController::class);

// Additional notification routes
Route::patch('notifications/{id}/mark-as-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
Route::get('notifications/user/{userId}', [\App\Http\Controllers\Api\NotificationController::class, 'getUserNotifications']);
Route::post('notifications/{id}/send', [\App\Http\Controllers\Api\NotificationController::class, 'sendNotification']);

// Purchase Management Routes
Route::prefix('purchases')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\PurchaseController::class, 'index']);

    Route::post('/', [\App\Http\Controllers\Api\PurchaseController::class, 'store']);

    Route::get('/generate-po', [\App\Http\Controllers\Api\PurchaseController::class, 'generatePoNumber']);

    Route::get('/client/{clientId}', [\App\Http\Controllers\Api\PurchaseController::class, 'getByClient']);

    Route::get('/po/{poNumber}', [\App\Http\Controllers\Api\PurchaseController::class, 'getByPoNumber']);

    Route::get('/{id}/with-related', [\App\Http\Controllers\Api\PurchaseController::class, 'getWithRelatedData']);

    Route::get('/{id}', [\App\Http\Controllers\Api\PurchaseController::class, 'show']);

    Route::put('/{id}', [\App\Http\Controllers\Api\PurchaseController::class, 'update']);

    Route::delete('/{id}', [\App\Http\Controllers\Api\PurchaseController::class, 'destroy']);
});

// Subscription Management Routes
Route::apiResource('subscriptions', \App\Http\Controllers\Api\SubscriptionController::class)->middleware('auth:sanctum');

// Payment Management Routes
Route::apiResource('payment-managements', \App\Http\Controllers\Api\PaymentManagementController::class);
Route::get('payment-managements-statistics', [\App\Http\Controllers\Api\PaymentManagementController::class, 'getStatistics']);
Route::post('payment-managements-refresh-statistics', [\App\Http\Controllers\Api\PaymentManagementController::class, 'refreshStatistics']);

// Vendor Management Routes
Route::apiResource('vendors', \App\Http\Controllers\Api\VendorController::class);
Route::post('vendors-search', [\App\Http\Controllers\Api\VendorController::class, 'search']);

// User Management Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', \App\Http\Controllers\Api\UserManagementController::class);
    Route::patch('users/{id}/permissions', [\App\Http\Controllers\Api\UserManagementController::class, 'updatePermissions']);
    Route::get('users/{id}/permissions', [\App\Http\Controllers\Api\UserManagementController::class, 'getPermissions']);
});

// Search Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('search', [\App\Http\Controllers\SearchController::class, 'search']);
    Route::post('search', [\App\Http\Controllers\SearchController::class, 'search']);
    Route::get('searchable-models', [\App\Http\Controllers\SearchController::class, 'getSearchableModels']);
});

// Invoice Management Routes
Route::apiResource('invoices', \App\Http\Controllers\InvoiceController::class);

// Additional invoice routes
Route::post('invoices/generate-from-subscription', [\App\Http\Controllers\InvoiceController::class, 'generateFromSubscription']);
Route::post('invoices/generate-from-purchase', [\App\Http\Controllers\InvoiceController::class, 'generateFromPurchase']);
Route::get('invoices/client/{clientId}', [\App\Http\Controllers\InvoiceController::class, 'getByClient']);
Route::get('invoices/status/{status}', [\App\Http\Controllers\InvoiceController::class, 'getByStatus']);
Route::get('invoices/{id}/download', [\App\Http\Controllers\InvoiceController::class, 'downloadInvoice']);

// Report Management Routes
Route::apiResource('reports', \App\Http\Controllers\Api\ReportController::class);

// Additional report routes
Route::get('reports-overview', [\App\Http\Controllers\Api\ReportController::class, 'overview']);
Route::get('reports-revenue', [\App\Http\Controllers\Api\ReportController::class, 'revenue']);
Route::get('reports-client', [\App\Http\Controllers\Api\ReportController::class, 'clientReport']);
Route::get('reports-subscription', [\App\Http\Controllers\Api\ReportController::class, 'subscriptionReport']);
Route::post('reports-generate', [\App\Http\Controllers\Api\ReportController::class, 'generateReport']);
