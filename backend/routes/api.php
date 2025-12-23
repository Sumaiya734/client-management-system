<?php

use Illuminate\Support\Facades\Route;

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
