<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Purchase;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SubscriptionService extends BaseService
{
    protected $model;

    public function __construct(Subscription $model)
    {
        $this->model = $model;
    }

    /**
     * Get all subscriptions with relationships and transform data
     */
    public function getAll()
    {
        $subscriptions = $this->model->with(['client', 'product', 'purchase'])->get();
        
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
        
        return $transformedSubscriptions;
    }

    /**
     * Get subscription by ID with relationships and transform data
     */
    public function getById($id)
    {
        $subscription = $this->model->with(['client', 'product', 'purchase'])->find($id);
        
        if (!$subscription) {
            return null;
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
        
        return $transformedSubscription;
    }

    /**
     * Create a new subscription
     */
    public function create(array $data)
    {
        $validator = Validator::make($data, [
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
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        // Calculate next billing date (typically the end date for now)
        $requestData = $data;
        $requestData['next_billing_date'] = $data['end_date'];
        
        return $this->model->create($requestData);
    }

    /**
     * Update an existing subscription
     */
    public function update($id, array $data)
    {
        $subscription = $this->model->find($id);
        
        if (!$subscription) {
            throw new \Exception('Subscription not found');
        }
        
        $validator = Validator::make($data, [
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
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        $subscription->update($data);
        return $subscription;
    }

    /**
     * Delete a subscription
     */
    public function delete($id)
    {
        $subscription = $this->model->find($id);
        
        if (!$subscription) {
            throw new \Exception('Subscription not found');
        }
        
        return $subscription->delete();
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
                    'dateRange' => $productData['dateRange'] ?? ($productData['subscription_start'] . ' to ' . $productData['subscription_end'] ?? 'N/A'),
                    'action' => $productData['status'] === 'Pending' ? 'Subscribe' : 'Edit'
                ];
            }
        }
        
        return $products;
    }
}