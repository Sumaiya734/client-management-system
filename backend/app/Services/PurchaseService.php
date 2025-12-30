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
                $purchaseArray['products'] = [
                    [
                        'product_name' => $purchase->product->product_name ?? $purchase->product->name ?? 'N/A',
                        'quantity' => $purchase->quantity ?? 1,
                        'subscription_start' => $purchase->subscription_start,
                        'subscription_end' => $purchase->subscription_end,
                    ]
                ];
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
            $purchaseArray['products'] = [
                [
                    'product_name' => $purchase->product->product_name ?? $purchase->product->name ?? 'N/A',
                    'quantity' => $purchase->quantity ?? 1,
                    'subscription_start' => $purchase->subscription_start,
                    'subscription_end' => $purchase->subscription_end,
                ]
            ];
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
                        'subscription_start' => $productData['subscription_start'] ?? null,
                        'subscription_end' => $productData['subscription_end'] ?? null,
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

        // Create purchase record
        $purchase = Purchase::create([
            'po_number' => $data['po_number'],
            'client_id' => $data['client_id'],
            'product_id' => $data['product_id'],
            'quantity' => $quantity,
            'total_amount' => $totalAmount,
            'status' => $data['status'] ?? 'Draft',
            'subscription_active' => $this->getBooleanValue($data['subscription_active'] ?? false),
            'subscription_start' => $data['subscription_start'] ?? null,
            'subscription_end' => $data['subscription_end'] ?? null,
            'attachment' => $attachmentPath,
        ]);

        // Create subscription if subscription_active is true and subscription dates are provided
        if ($this->getBooleanValue($data['subscription_active'] ?? false) && 
            isset($data['subscription_start']) && 
            isset($data['subscription_end'])) {
            
            $subscription = Subscription::create([
                'po_number' => $data['po_number'],
                'client_id' => $data['client_id'],
                'product_id' => $data['product_id'],
                'purchase_id' => $purchase->id,
                'start_date' => $data['subscription_start'],
                'end_date' => $data['subscription_end'],
                'status' => 'Pending',
                'quantity' => $quantity,
                'total_amount' => $totalAmount,
                'next_billing_date' => $data['subscription_end'],
                'notes' => 'Auto-created from purchase order'
            ]);

            // Create billing record for this subscription
            $billNumber = 'BILL-' . $data['po_number'] . '-' . $data['product_id'];
            $billing = Billing_management::create([
                'bill_number' => $billNumber,
                'client' => $client->company ?? $client->name,
                'po_number' => $data['po_number'],
                'bill_date' => date('Y-m-d'),
                'due_date' => $data['subscription_end'],
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

            $purchase->update($data);
            
            DB::commit();
            
            // Transform the updated data to match frontend expectations
            $purchaseArray = $purchase->fresh(['client', 'product'])->toArray();
            
            // Create products array from single product
            if ($purchase->product) {
                $purchaseArray['products'] = [
                    [
                        'product_name' => $purchase->product->product_name ?? $purchase->product->name ?? 'N/A',
                        'quantity' => $purchase->quantity ?? 1,
                        'subscription_start' => $purchase->subscription_start,
                        'subscription_end' => $purchase->subscription_end,
                    ]
                ];
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

        // Subscription validation
        if (isset($data['subscription_active']) && $this->getBooleanValue($data['subscription_active'])) {
            $rules['subscription_start'] = 'required|date';
            $rules['subscription_end'] = 'required|date|after:subscription_start';
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
}