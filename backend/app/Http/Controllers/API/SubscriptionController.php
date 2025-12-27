<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Purchase;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $subscriptions = Subscription::with(['client', 'product', 'purchase'])->get();
        
        // Transform the subscriptions to match the frontend expectations
        $transformedSubscriptions = $subscriptions->map(function ($subscription) {
            // Get the associated purchase to get additional information
            $purchase = $subscription->purchase;
            
            // For single product subscriptions
            $products = [];
            if ($subscription->product) {
                $products[] = [
                    'name' => $subscription->product->product_name ?? $subscription->product->name ?? 'N/A',
                    'quantity' => $subscription->quantity ?? 1,
                    'status' => $subscription->status ?? 'Pending',
                    'dateRange' => $subscription->start_date && $subscription->end_date ? 
                        $subscription->start_date . ' to ' . $subscription->end_date : 'N/A',
                    'action' => $subscription->status === 'Pending' ? 'Subscribe' : 'Edit'
                ];
            }
            
            // If purchase exists and has products_subscriptions (for multi-product support)
            if ($purchase && $purchase->products_subscriptions) {
                $products = $this->parseProductsFromPurchase($purchase->products_subscriptions);
            }
            
            return [
                'id' => $subscription->id,
                'poNumber' => $subscription->po_number ?? $purchase->po_number ?? 'N/A',
                'createdDate' => $subscription->start_date ?? $purchase->subscription_start ?? 'N/A',
                'client' => [
                    'company' => $subscription->client->company ?? $subscription->client->name ?? $purchase->cli_name ?? 'N/A',
                    'contact' => $subscription->client->contact ?? 'N/A'
                ],
                'products' => $products,
                'products_subscription_status' => $subscription->products_subscription_status,
                'progress' => [
                    'status' => $subscription->progress ? $subscription->progress['status'] ?? $subscription->status ?? 'Pending' : $subscription->status ?? 'Pending',
                    'completed' => $subscription->status === 'Active' ? 1 : 0,
                    'total' => count($products),
                    'percentage' => $subscription->status === 'Active' ? 100 : ($subscription->status === 'Pending' ? 0 : 50)
                ],
                'totalAmount' => '৳' . number_format($subscription->total_amount ?? $purchase->total_amount ?? 0, 2) . ' BDT',
                'canGenerateBill' => $subscription->status === 'Active',
                // Store original data needed for creating new subscriptions
                'client_id' => $subscription->client_id ?? $purchase->client_id,
                'product_id' => $subscription->product_id,
                'total_amount' => $subscription->total_amount ?? $purchase->total_amount,
                // Include the raw database fields
                'raw_progress' => $subscription->progress,
                'raw_products_subscription_status' => $subscription->products_subscription_status
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $transformedSubscriptions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'po_number' => 'required|string',
            'client_id' => 'required|exists:clients,id',
            'product_id' => 'required|exists:products,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'total_amount' => 'required|numeric|min:0',
            'products_subscription_status' => 'sometimes|json',
            'progress' => 'sometimes|json'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Calculate next billing date (typically the end date for now)
        $requestData = $request->all();
        $requestData['next_billing_date'] = $request->end_date;
        
        $subscription = Subscription::create($requestData);
        
        return response()->json([
            'success' => true,
            'message' => 'Subscription created successfully',
            'data' => $subscription
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $subscription = Subscription::with(['client', 'product', 'purchase'])->find($id);
        
        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found'
            ], 404);
        }
        
        // Transform the single subscription to match the frontend expectations
        $purchase = $subscription->purchase;
        
        // For single product subscriptions
        $products = [];
        if ($subscription->product) {
            $products[] = [
                'name' => $subscription->product->product_name ?? $subscription->product->name ?? 'N/A',
                'quantity' => $subscription->quantity ?? 1,
                'status' => $subscription->status ?? 'Pending',
                'dateRange' => $subscription->start_date && $subscription->end_date ? 
                    $subscription->start_date . ' to ' . $subscription->end_date : 'N/A',
                'action' => $subscription->status === 'Pending' ? 'Subscribe' : 'Edit'
            ];
        }
        
        // If purchase exists and has products_subscriptions (for multi-product support)
        if ($purchase && $purchase->products_subscriptions) {
            $products = $this->parseProductsFromPurchase($purchase->products_subscriptions);
        }
        
        $transformedSubscription = [
            'id' => $subscription->id,
            'poNumber' => $subscription->po_number ?? $purchase->po_number ?? 'N/A',
            'createdDate' => $subscription->start_date ?? $purchase->subscription_start ?? 'N/A',
            'client' => [
                'company' => $subscription->client->company ?? $subscription->client->name ?? $purchase->cli_name ?? 'N/A',
                'contact' => $subscription->client->contact ?? 'N/A'
            ],
            'products' => $products,
            'products_subscription_status' => $subscription->products_subscription_status,
            'progress' => [
                'status' => $subscription->progress ? $subscription->progress['status'] ?? $subscription->status ?? 'Pending' : $subscription->status ?? 'Pending',
                'completed' => $subscription->status === 'Active' ? 1 : 0,
                'total' => count($products),
                'percentage' => $subscription->status === 'Active' ? 100 : ($subscription->status === 'Pending' ? 0 : 50)
            ],
            'totalAmount' => '৳' . number_format($subscription->total_amount ?? $purchase->total_amount ?? 0, 2) . ' BDT',
            'canGenerateBill' => $subscription->status === 'Active',
            // Store original data needed for creating new subscriptions
            'client_id' => $subscription->client_id ?? $purchase->client_id,
            'product_id' => $subscription->product_id,
            'total_amount' => $subscription->total_amount ?? $purchase->total_amount,
            // Include the raw database fields
            'raw_progress' => $subscription->progress,
            'raw_products_subscription_status' => $subscription->products_subscription_status
        ];
        
        return response()->json([
            'success' => true,
            'data' => $transformedSubscription
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $subscription = Subscription::find($id);
        
        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'po_number' => 'sometimes|string',
            'client_id' => 'sometimes|exists:clients,id',
            'product_id' => 'sometimes|exists:products,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'status' => 'sometimes|string',
            'quantity' => 'sometimes|integer|min:1',
            'total_amount' => 'sometimes|numeric|min:0',
            'products_subscription_status' => 'sometimes|json',
            'progress' => 'sometimes|json'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $subscription->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Subscription updated successfully',
            'data' => $subscription
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $subscription = Subscription::find($id);
        
        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found'
            ], 404);
        }
        
        $subscription->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Subscription deleted successfully'
        ]);
    }
    
    /**
     * Parse products from purchase data
     */
    private function parseProductsFromPurchase($productsSubscriptions)
    {
        $products = [];
        
        // If products_subscriptions is a JSON string, decode it
        if (is_string($productsSubscriptions)) {
            $productsData = json_decode($productsSubscriptions, true);
        } else {
            $productsData = $productsSubscriptions;
        }
        
        if (is_array($productsData)) {
            foreach ($productsData as $productData) {
                $products[] = [
                    'name' => $productData['name'] ?? $productData['product_name'] ?? 'N/A',
                    'quantity' => $productData['quantity'] ?? 1,
                    'status' => $productData['status'] ?? 'Pending',
                    'dateRange' => $productData['dateRange'] ?? $productData['subscription_start'] . ' to ' . $productData['subscription_end'] ?? 'N/A',
                    'action' => $productData['status'] === 'Pending' ? 'Subscribe' : 'Edit'
                ];
            }
        }
        
        return $products;
    }
}
