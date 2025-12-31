<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\Client;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\Billing_management;
use App\Models\Payment_management;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class PurchaseService
{
    /**
     * Get all purchases with relationships
     */
    public function getAll()
    {
        $purchases = Purchase::with(['client', 'product'])->get();
        
        // Transform the data to match frontend expectations
        return $purchases->map(function ($purchase) {
            $purchaseArray = $purchase->toArray();
            
            // Create products array from single product
            if ($purchase->product) {
                $productData = [
                    'product_name' => $purchase->product->product_name ?? $purchase->product->name ?? 'N/A',
                    'quantity' => $purchase->quantity ?? 1,
                    'subscription_type' => $purchase->subscription_type,
                    'recurring_count' => $purchase->recurring_count,
                    'delivery_date' => $purchase->delivery_date,
                ];
                
                // Add subscription dates if subscription exists
                if ($purchase->subscription_active) {
                    $subscription = Subscription::where('purchase_id', $purchase->id)->first();
                    if ($subscription) {
                        $productData['subscription_start'] = $subscription->start_date;
                        $productData['subscription_end'] = $subscription->end_date;
                    }
                }
                
                $purchaseArray['products'] = [$productData];
            } else {
                $purchaseArray['products'] = [];
            }
            
            return $purchaseArray;
        });
    }

    /**
     * Get purchase by ID
     */
    public function getById($id)
    {
        $purchase = Purchase::with(['client', 'product'])->find($id);
        
        if (!$purchase) {
            return null;
        }
        
        // Transform the data to match frontend expectations
        $purchaseArray = $purchase->toArray();
        
        // Create products array from single product
        if ($purchase->product) {
            $productData = [
                'product_name' => $purchase->product->product_name ?? $purchase->product->name ?? 'N/A',
                'quantity' => $purchase->quantity ?? 1,
                'subscription_type' => $purchase->subscription_type,
                'recurring_count' => $purchase->recurring_count,
                'delivery_date' => $purchase->delivery_date,
            ];
            
            // Add subscription dates if subscription exists
            if ($purchase->subscription_active) {
                $subscription = Subscription::where('purchase_id', $purchase->id)->first();
                if ($subscription) {
                    $productData['subscription_start'] = $subscription->start_date;
                    $productData['subscription_end'] = $subscription->end_date;
                }
            }
            
            $purchaseArray['products'] = [$productData];
        } else {
            $purchaseArray['products'] = [];
        }
        
        return $purchaseArray;
    }

    /**
     * Create new purchase(s)
     */
    public function create(array $requestData)
    {
        // Auto-correct subscription_active state if details are missing
        if (isset($requestData['subscription_active']) && $this->getBooleanValue($requestData['subscription_active'])) {
            if (empty($requestData['subscription_type']) || empty($requestData['recurring_count']) || empty($requestData['delivery_date'])) {
                $requestData['subscription_active'] = false;
            }
        }

        // Validate the request data
        $this->validatePurchaseData($requestData);

        DB::beginTransaction();
        
        try {
            $purchases = [];
            
            // Check if we have multiple products or single product
            if (isset($requestData['products']) && is_array($requestData['products']) && count($requestData['products']) > 0) {
                // Multiple products - create separate purchase for each
                foreach ($requestData['products'] as $productData) {
                    $singlePurchaseData = array_merge($requestData, [
                        'product_id' => $productData['productId'],
                        'quantity' => $productData['quantity'],
                    ]);
                    
                    $purchases[] = $this->createSinglePurchase($singlePurchaseData, $requestData);
                }
            } else {
                // Single product
                $purchases[] = $this->createSinglePurchase($requestData, $requestData);
            }

            DB::commit();
            return $purchases;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Create a single purchase record
     */
    private function createSinglePurchase(array $data, array $originalRequestData)
    {
        // Get client and product information
        $client = Client::find($data['client_id']);
        $product = Product::find($data['product_id']);
        
        if (!$client) {
            throw new \Exception('Client not found');
        }
        
        if (!$product) {
            throw new \Exception('Product not found');
        }

        // Calculate total amount
        $quantity = intval($data['quantity'] ?? 1);
        $unitPrice = floatval($product->bdt_price ?? $product->base_price ?? $product->price ?? 0);
        $totalAmount = $quantity * $unitPrice;

        // Handle file attachment
        $attachmentPath = null;
        if (isset($originalRequestData['attachment']) && $originalRequestData['attachment']) {
            $file = $originalRequestData['attachment'];
            $attachmentPath = $file->store('purchase_attachments', 'public');
        }
        
        // Generate PO number if not provided (within the transaction to prevent race conditions)
        if (!isset($data['po_number']) || empty($data['po_number'])) {
            $data['po_number'] = $this->generatePoNumber();
        }

        // Calculate subscription dates first to use in product data
        $subscriptionStart = null;
        $subscriptionEnd = null;
        $dateRange = $data['delivery_date'] ?? 'N/A';

        if ($this->getBooleanValue($data['subscription_active'] ?? false) && 
            !empty($data['subscription_type']) && 
            !empty($data['recurring_count']) && 
            !empty($data['delivery_date'])) {
            
            // Calculate subscription dates based on delivery date, type and recurring count
            $startDate = Carbon::parse($data['delivery_date']);
            $months = (int)$data['subscription_type'];
            $recurringCount = (int)$data['recurring_count'];
            
            // Calculate end date based on subscription type and recurring count
            $endDate = $startDate->copy()->addMonths($months * $recurringCount);
            
            $subscriptionStart = $startDate->format('Y-m-d');
            $subscriptionEnd = $endDate->format('Y-m-d');
            $dateRange = $subscriptionStart . ' to ' . $subscriptionEnd;
        }

        // Prepare structured product data
        $productsArray = [
            [
                'name' => $product->product_name ?? $product->name ?? 'Unknown Product',
                'quantity' => $quantity,
                'status' => 'Pending',
                'dateRange' => $dateRange,
                // Add useful metadata
                'product_id' => $product->id,
                'price' => $unitPrice
            ]
        ];

        // Create purchase record
        $purchase = Purchase::create([
            'po_number' => $data['po_number'],
            'client_id' => $data['client_id'],
            'product_id' => $data['product_id'],
            'quantity' => $quantity,
            'total_amount' => $totalAmount,
            'status' => $data['status'] ?? 'Draft',
            'subscription_active' => $this->getBooleanValue($data['subscription_active'] ?? false),
            'subscription_type' => $data['subscription_type'] ?? null,
            'recurring_count' => $data['recurring_count'] ?? 1, // Default to 1 instead of null
            'delivery_date' => $data['delivery_date'] ?? null,
            'po_details' => $data['po_details'] ?? null, // Include po_details if provided
            'attachment' => $attachmentPath,
            'cli_name' => $client->company ?? $client->cli_name ?? 'Unknown Client', // Populate cli_name column
            'products_subscriptions' => json_encode($productsArray), // Save as JSON
        ]);

        // Create subscription if subscription_active is true and dates were calculated
        if ($subscriptionStart && $subscriptionEnd) {
            
            $subscription = Subscription::create([
                'po_number' => $data['po_number'],
                'client_id' => $data['client_id'],
                'product_id' => $data['product_id'],
                'purchase_id' => $purchase->id,
                'start_date' => $subscriptionStart,
                'end_date' => $subscriptionEnd,
                'status' => 'Pending',
                'quantity' => $quantity,
                'total_amount' => $totalAmount,
                'next_billing_date' => $subscriptionEnd,
                'notes' => 'Auto-created from purchase order',
                'po_details' => $data['po_details'] ?? null,
                'products_subscription_status' => $productsArray // Eloquent cast handles JSON encoding
            ]);

            // Create billing record for this subscription
            $billNumber = 'BILL-' . $data['po_number'] . '-' . $data['product_id'];
            $billing = Billing_management::create([
                'bill_number' => $billNumber,
                'client' => $client->company ?? $client->name,
                'po_number' => $data['po_number'],
                'bill_date' => date('Y-m-d'),
                'due_date' => $subscriptionEnd,
                'total_amount' => $totalAmount,
                'paid_amount' => 0,
                'status' => 'Pending',
                'payment_status' => 'Unpaid',
                'client_id' => $data['client_id'],
                'subscription_id' => $subscription->id,
                'purchase_id' => $purchase->id
            ]);

            // Create initial payment record
            Payment_management::create([
                'po_number' => $data['po_number'],
                'client_id' => $data['client_id'],
                'date' => date('Y-m-d'),
                'amount' => 0,
                'method' => 'Pending',
                'transaction_id' => 'AUTO-' . $data['po_number'],
                'status' => 'Pending',
                'receipt' => 'Not Generated',
                'billing_id' => $billing->id
            ]);
        }

        // Load relationships and return
        return $purchase->load(['client', 'product']);
    }

    /**
     * Update purchase
     */
    public function update($id, array $data)
    {
        $purchase = Purchase::find($id);
        
        if (!$purchase) {
            throw new \Exception('Purchase not found');
        }

        // Validate update data
        $this->validatePurchaseData($data, $id);

        DB::beginTransaction();
        
        try {
            // Always recalculate total amount when updating
            $product = Product::find($data['product_id'] ?? $purchase->product_id);
            if ($product) {
                $quantity = intval($data['quantity'] ?? $purchase->quantity);
                $unitPrice = floatval($product->bdt_price ?? $product->base_price ?? $product->price ?? 0);
                $data['total_amount'] = $quantity * $unitPrice;
            }

            // Include delivery_date if provided
            if (isset($data['delivery_date'])) {
                $data['delivery_date'] = $data['delivery_date'];
            }
            
            // Include po_details if provided
            if (isset($data['po_details'])) {
                $data['po_details'] = $data['po_details'];
            }
                    
            $purchase->update($data);
            
            DB::commit();
            
            // Transform the updated data to match frontend expectations
            $purchaseArray = $purchase->fresh(['client', 'product'])->toArray();
            
            // Create products array from single product
            if ($purchase->product) {
                $productData = [
                    'product_name' => $purchase->product->product_name ?? $purchase->product->name ?? 'N/A',
                    'quantity' => $purchase->quantity ?? 1,
                    'subscription_type' => $purchase->subscription_type,
                    'recurring_count' => $purchase->recurring_count,
                    'delivery_date' => $purchase->delivery_date,
                ];
                
                // Add subscription dates if subscription exists
                if ($purchase->subscription_active) {
                    $subscription = Subscription::where('purchase_id', $purchase->id)->first();
                    if ($subscription) {
                        $productData['subscription_start'] = $subscription->start_date;
                        $productData['subscription_end'] = $subscription->end_date;
                    }
                }
                
                $purchaseArray['products'] = [$productData];
            } else {
                $purchaseArray['products'] = [];
            }
            
            return $purchaseArray;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete purchase
     */
    public function delete($id)
    {
        $purchase = Purchase::find($id);
        
        if (!$purchase) {
            throw new \Exception('Purchase not found');
        }

        DB::beginTransaction();
        
        try {
            // Delete related records
            if ($purchase->subscription_active) {
                // Delete related subscriptions, billings, and payments
                Subscription::where('purchase_id', $id)->delete();
                $billings = Billing_management::where('purchase_id', $id)->get();
                foreach ($billings as $billing) {
                    Payment_management::where('billing_id', $billing->id)->delete();
                }
                Billing_management::where('purchase_id', $id)->delete();
            }

            // Delete attachment file if exists
            if ($purchase->attachment) {
                Storage::disk('public')->delete($purchase->attachment);
            }

            $purchase->delete();
            
            DB::commit();
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Validate purchase data
     */
    private function validatePurchaseData(array $data, $id = null)
    {
        $rules = [
            'client_id' => 'required|exists:clients,id',
            'status' => 'required|string|in:Draft,Active,In Progress,Completed,Expired,Expiring Soon',
            'subscription_active' => 'boolean',
            'po_details' => 'nullable',
        ];

        // Validate products array or single product
        if (isset($data['products']) && is_array($data['products'])) {
            $rules['products'] = 'required|array|min:1';
            $rules['products.*.productId'] = 'required|exists:products,id';
            $rules['products.*.quantity'] = 'required|integer|min:1';
        } else {
            $rules['product_id'] = 'required|exists:products,id';
            $rules['quantity'] = 'required|integer|min:1';
        }
        
        // Delivery date validation
        if (isset($data['delivery_date'])) {
            $rules['delivery_date'] = 'nullable|date';
        }

        // Subscription validation - using subscription type format
        if (isset($data['subscription_active']) && $this->getBooleanValue($data['subscription_active'])) {
            // When subscription is active, subscription type and recurring count are required
            $rules['subscription_type'] = 'required|string|in:1,2,3,6,12';
            $rules['recurring_count'] = 'required|integer|min:1';
            $rules['delivery_date'] = 'required|date';
        } else {
            // If subscription is not active, subscription type and recurring count are optional
            $rules['subscription_type'] = 'nullable|string|in:1,2,3,6,12';
            $rules['recurring_count'] = 'nullable|integer|min:1';
            // Delivery date validation if provided
            if (isset($data['delivery_date'])) {
                $rules['delivery_date'] = 'nullable|date';
            }
        }

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
    }

    /**
     * Convert various boolean representations to actual boolean
     */
    private function getBooleanValue($value)
    {
        if (is_bool($value)) {
            return $value;
        }
        
        if (is_string($value)) {
            return in_array(strtolower($value), ['true', '1', 'yes', 'on']);
        }
        
        if (is_numeric($value)) {
            return intval($value) === 1;
        }
        
        return false;
    }
    
    /**
     * Generate unique PO number within transaction to prevent race conditions
     */
    private function generatePoNumber()
    {
        $year = date('Y');

        $lastPo = DB::table('purchases')
            ->where('po_number', 'like', "PO-$year-%")
            ->orderBy('id', 'desc')
            ->first();

        if ($lastPo && isset($lastPo->po_number)) {
            // Extract the serial number part after the year
            $pattern = "/PO-$year-(\d+)$/";
            if (preg_match($pattern, $lastPo->po_number, $matches)) {
                $lastSerial = intval($matches[1]);
                $nextSerial = $lastSerial + 1;
                $nextDigits = str_pad($nextSerial, strlen($matches[1]), '0', STR_PAD_LEFT);
            } else {
                $nextDigits = "0001"; // fallback
            }
        } else {
            $nextDigits = "0001";
        }

        return "PO-$year-$nextDigits";
    }
}