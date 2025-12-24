<?php

use Illuminate\Support\Facades\Route;

Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
});

Route::get('/test', function () {
    return response()->json([
        'project' => 'Client Management System',
        'status' => 'API is working'
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
Route::apiResource('purchases', \App\Http\Controllers\Api\PurchaseController::class);

// Subscription Management Routes
Route::apiResource('subscriptions', \App\Http\Controllers\Api\SubscriptionController::class);

// Payment Management Routes
Route::apiResource('payment-managements', \App\Http\Controllers\Api\PaymentManagementController::class);

// User Management Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', \App\Http\Controllers\Api\UserManagementController::class);
    Route::patch('users/{id}/permissions', [\App\Http\Controllers\Api\UserManagementController::class, 'updatePermissions']);
    Route::get('users/{id}/permissions', [\App\Http\Controllers\Api\UserManagementController::class, 'getPermissions']);
});

// Report Management Routes
Route::apiResource('reports', \App\Http\Controllers\Api\ReportController::class);

// Additional report routes
Route::get('reports-overview', [\App\Http\Controllers\Api\ReportController::class, 'overview']);
Route::get('reports-revenue', [\App\Http\Controllers\Api\ReportController::class, 'revenue']);
Route::get('reports-client', [\App\Http\Controllers\Api\ReportController::class, 'clientReport']);
Route::get('reports-subscription', [\App\Http\Controllers\Api\ReportController::class, 'subscriptionReport']);
Route::post('reports-generate', [\App\Http\Controllers\Api\ReportController::class, 'generateReport']);
