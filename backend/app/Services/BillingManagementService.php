<?php

namespace App\Services;

use App\Models\Billing_management;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class BillingManagementService extends BaseService
{
    protected $model;

    public function __construct(Billing_management $model)
    {
        $this->model = $model;
    }

    /**
     * Get all billing records with relationships
     */
    public function getAll()
    {
        $billings = $this->model->with('client', 'subscription', 'purchase')->orderBy('created_at', 'desc')->get();
        
        // Process each billing record to include products from the associated purchase
        // Process each billing record to include products from the associated purchase or subscription
        foreach ($billings as $billing) {
            $products = [];
            
            // Priority 1: Check subscription for products
            if ($billing->subscription && $billing->subscription->products_subscription_status) {
                $productsSubscriptions = $billing->subscription->products_subscription_status;
                
                // If it's a JSON string, decode it
                if (is_string($productsSubscriptions)) {
                    $productsSubscriptions = json_decode($productsSubscriptions, true);
                }
                
                if (is_array($productsSubscriptions)) {
                    foreach ($productsSubscriptions as $productData) {
                        $products[] = [
                            'description' => $productData['name'] ?? $productData['product_name'] ?? 'Product',
                            'quantity' => $productData['quantity'] ?? 1,
                            'unit_price' => $productData['price'] ?? $productData['unit_price'] ?? 0,
                            'total' => $productData['sub_total'] ?? ($productData['quantity'] ?? 1) * ($productData['price'] ?? $productData['unit_price'] ?? 0)
                        ];
                    }
                }
            } 
            // Priority 2: Check purchase for products
            elseif ($billing->purchase) {
                // Extract products from the purchase
                $purchaseData = $billing->purchase->toArray();
                
                if (isset($purchaseData['products_subscriptions'])) {
                    $productsSubscriptions = $purchaseData['products_subscriptions'];
                    
                    // If it's a JSON string, decode it
                    if (is_string($productsSubscriptions)) {
                        $productsSubscriptions = json_decode($productsSubscriptions, true);
                    }
                    
                    if (is_array($productsSubscriptions)) {
                        foreach ($productsSubscriptions as $productData) {
                            $products[] = [
                                'description' => $productData['name'] ?? $productData['product_name'] ?? 'Product',
                                'quantity' => $productData['quantity'] ?? 1,
                                'unit_price' => $productData['price'] ?? 0,
                                'total' => $productData['sub_total'] ?? ($productData['quantity'] ?? 1) * ($productData['price'] ?? 0)
                            ];
                        }
                    }
                }
            }
            
            // Add products to the billing record
            $billing->setAttribute('products', $products);
        }
        
        return $billings;
    }

    /**
     * Get billing record by ID with relationships
     */
    public function getById($id)
    {
        $billing = $this->model->with('client', 'subscription', 'purchase')->find($id);
        
        if ($billing) {
            $products = [];
            
            // Priority 1: Check subscription for products
            if ($billing->subscription && $billing->subscription->products_subscription_status) {
                $productsSubscriptions = $billing->subscription->products_subscription_status;
                
                // If it's a JSON string, decode it
                if (is_string($productsSubscriptions)) {
                    $productsSubscriptions = json_decode($productsSubscriptions, true);
                }
                
                if (is_array($productsSubscriptions)) {
                    foreach ($productsSubscriptions as $productData) {
                        $products[] = [
                            'description' => $productData['name'] ?? $productData['product_name'] ?? 'Product',
                            'quantity' => $productData['quantity'] ?? 1,
                            'unit_price' => $productData['price'] ?? $productData['unit_price'] ?? 0,
                            'total' => $productData['sub_total'] ?? ($productData['quantity'] ?? 1) * ($productData['price'] ?? $productData['unit_price'] ?? 0)
                        ];
                    }
                }
            }
            // Priority 2: Check purchase for products
            elseif ($billing->purchase) {
                // Extract products from the purchase
                $purchaseData = $billing->purchase->toArray();
                
                if (isset($purchaseData['products_subscriptions'])) {
                    $productsSubscriptions = $purchaseData['products_subscriptions'];
                    
                    // If it's a JSON string, decode it
                    if (is_string($productsSubscriptions)) {
                        $productsSubscriptions = json_decode($productsSubscriptions, true);
                    }
                    
                    if (is_array($productsSubscriptions)) {
                        foreach ($productsSubscriptions as $productData) {
                            $products[] = [
                                'description' => $productData['name'] ?? $productData['product_name'] ?? 'Product',
                                'quantity' => $productData['quantity'] ?? 1,
                                'unit_price' => $productData['price'] ?? 0,
                                'total' => $productData['sub_total'] ?? ($productData['quantity'] ?? 1) * ($productData['price'] ?? 0)
                            ];
                        }
                    }
                }
            }
            
            // Add products to the billing record
            $billing->setAttribute('products', $products);
        }
        
        return $billing;
    }

    /**
     * Create a new billing record
     */
    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'bill_number' => 'required|string|unique:billing_managements,bill_number',
            'client' => 'required|string',
            'po_number' => 'nullable|string',
            'bill_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:bill_date',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0|lte:total_amount',
            'status' => 'required|string|in:Draft,Pending,Overdue,Completed',
            'payment_status' => 'required|string|in:Unpaid,Partially Paid,Paid,Overpaid',
            'client_id' => 'nullable|exists:clients,id',
            'subscription_id' => 'nullable|exists:subscriptions,id',
            'purchase_id' => 'nullable|exists:purchases,id'
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation error: ' . json_encode($validator->errors()));
        }

        $billing = $this->model->create($data);
        
        // Clear payment statistics cache when new billing is created
        Cache::forget('payment_statistics');
        
        return $billing;
    }

    /**
     * Update an existing billing record
     */
    public function update($id, array $data)
    {
        $billing = $this->model->find($id);

        if (!$billing) {
            throw new \Exception('Billing record not found');
        }

        $validator = Validator::make($data, [
            'bill_number' => 'sometimes|string|unique:billing_managements,bill_number,' . $id,
            'client' => 'sometimes|string',
            'po_number' => 'nullable|string',
            'bill_date' => 'sometimes|date',
            'due_date' => 'sometimes|date|after_or_equal:bill_date',
            'total_amount' => 'sometimes|numeric|min:0',
            'paid_amount' => 'sometimes|numeric|min:0|lte:total_amount',
            'status' => 'sometimes|string|in:Draft,Pending,Overdue,Completed',
            'payment_status' => 'sometimes|string|in:Unpaid,Partially Paid,Paid,Overpaid',
            'client_id' => 'nullable|exists:clients,id'
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation error: ' . json_encode($validator->errors()));
        }

        $billing->update($data);
        
        // Clear payment statistics cache when billing is updated
        Cache::forget('payment_statistics');
        
        return $billing;
    }

    /**
     * Delete a billing record
     */
    public function delete($id)
    {
        $billing = $this->model->find($id);

        if (!$billing) {
            throw new \Exception('Billing record not found');
        }

        $result = $billing->delete();
        
        // Clear payment statistics cache when billing is deleted
        Cache::forget('payment_statistics');
        
        return $result;
    }

    /**
     * Search billing records with filters
     */
    public function search(Request $request)
    {
        $query = $this->model->query();

        // Search by bill number, client, or PO number
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('bill_number', 'like', "%{$search}%")
                  ->orWhere('client', 'like', "%{$search}%")
                  ->orWhere('po_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('payment_status', $request->get('status'));
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('bill_date', '>=', $request->get('start_date'));
        }
        
        if ($request->has('end_date')) {
            $query->where('bill_date', '<=', $request->get('end_date'));
        }

        $billings = $query->with('client', 'subscription', 'purchase')->orderBy('created_at', 'desc')->get();
        
        // Process each billing record to include products from the associated purchase
        // Process each billing record to include products from the associated purchase or subscription
        foreach ($billings as $billing) {
            $products = [];
            
            // Priority 1: Check subscription for products
            if ($billing->subscription && $billing->subscription->products_subscription_status) {
                $productsSubscriptions = $billing->subscription->products_subscription_status;
                
                // If it's a JSON string, decode it
                if (is_string($productsSubscriptions)) {
                    $productsSubscriptions = json_decode($productsSubscriptions, true);
                }
                
                if (is_array($productsSubscriptions)) {
                    foreach ($productsSubscriptions as $productData) {
                        $products[] = [
                            'description' => $productData['name'] ?? $productData['product_name'] ?? 'Product',
                            'quantity' => $productData['quantity'] ?? 1,
                            'unit_price' => $productData['price'] ?? $productData['unit_price'] ?? 0,
                            'total' => $productData['sub_total'] ?? ($productData['quantity'] ?? 1) * ($productData['price'] ?? $productData['unit_price'] ?? 0)
                        ];
                    }
                }
            }
            // Priority 2: Check purchase for products
            elseif ($billing->purchase) {
                // Extract products from the purchase
                $purchaseData = $billing->purchase->toArray();
                
                if (isset($purchaseData['products_subscriptions'])) {
                    $productsSubscriptions = $purchaseData['products_subscriptions'];
                    
                    // If it's a JSON string, decode it
                    if (is_string($productsSubscriptions)) {
                        $productsSubscriptions = json_decode($productsSubscriptions, true);
                    }
                    
                    if (is_array($productsSubscriptions)) {
                        foreach ($productsSubscriptions as $productData) {
                            $products[] = [
                                'description' => $productData['name'] ?? $productData['product_name'] ?? 'Product',
                                'quantity' => $productData['quantity'] ?? 1,
                                'unit_price' => $productData['price'] ?? 0,
                                'total' => $productData['sub_total'] ?? ($productData['quantity'] ?? 1) * ($productData['price'] ?? 0)
                            ];
                        }
                    }
                }
            }
            
            // Add products to the billing record
            $billing->setAttribute('products', $products);
        }
        
        return $billings;
    }

    /**
     * Get billing summary statistics
     */
    public function getSummary()
    {
        $totalBills = $this->model->count();
        $paidBills = $this->model->where('payment_status', 'Paid')->count();
        $unpaidBills = $this->model->where('payment_status', 'Unpaid')->count();
        $partiallyPaidBills = $this->model->where('payment_status', 'Partially Paid')->count();
        
        $totalRevenue = $this->model->sum('total_amount');
        $amountCollected = $this->model->sum('paid_amount');
        $outstandingAmount = $totalRevenue - $amountCollected;

        return [
            'totalBills' => $totalBills,
            'paidBills' => $paidBills,
            'unpaidBills' => $unpaidBills,
            'partiallyPaidBills' => $partiallyPaidBills,
            'totalRevenue' => $totalRevenue,
            'amountCollected' => $amountCollected,
            'outstandingAmount' => $outstandingAmount
        ];
    }
}