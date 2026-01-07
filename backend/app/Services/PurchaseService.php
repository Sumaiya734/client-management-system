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
use Illuminate\Support\Facades\Log;

class PurchaseService
{
    /**
     * Get all purchases with transformed products array
     */
    public function getAll()
    {
        $purchases = Purchase::with(['client', 'invoice'])->get();

        return $purchases->map(function ($purchase) {
            return $this->transformPurchaseWithProducts($purchase);
        });
    }

    /**
     * Get single purchase by ID with transformed products
     */
    public function getById($id)
    {
        $purchase = Purchase::with(['client', 'invoice'])->find($id);

        if (!$purchase) {
            return null;
        }

        return $this->transformPurchaseWithProducts($purchase);
    }

    /**
     * Create new purchase - supports multiple products in one PO
     */
    public function create(array $requestData)
    {
        // Sanitize input to handle "null" strings from FormData
        $requestData = $this->sanitizeRequestData($requestData);

        // Auto-correct subscription_active if required fields missing
        if (isset($requestData['subscription_active']) && $this->getBooleanValue($requestData['subscription_active'])) {
            if (empty($requestData['subscription_type']) || empty($requestData['recurring_count']) || empty($requestData['delivery_date'])) {
                $requestData['subscription_active'] = false;
            }
        }

        $this->validatePurchaseData($requestData);

        return DB::transaction(function () use ($requestData) {
            try {
                $client = Client::find($requestData['client_id']);
                if (!$client) {
                    throw new \Exception('Client not found');
                }

                // Handle file attachment
                $attachmentPath = null;
                if (isset($requestData['attachment']) && $requestData['attachment'] instanceof \Illuminate\Http\UploadedFile) {
                    $attachmentPath = $requestData['attachment']->store('purchase_attachments', 'public');
                }

                // Generate PO number if not provided
                $poNumber = $requestData['po_number'] ?? $this->generatePoNumber();

                // Determine products: multiple or single fallback
                $productsInput = $this->normalizeProductsInput($requestData);
                
                if (empty($productsInput)) {
                    throw new \Exception('At least one product is required');
                }

                // Process products and calculate totals
                $result = $this->processProductsAndCalculate($productsInput, $requestData);
                $productsArray = $result['products'];
                $totalAmount = $result['total'];
                $subscriptionDates = $result['subscription_dates'];

                if (empty($productsArray)) {
                    throw new \Exception('No valid products to add');
                }

                // Create single Purchase record
                $purchase = Purchase::create([
                    'po_number' => $poNumber,
                    'client_id' => $requestData['client_id'],
                    'total_amount' => $totalAmount,
                    'status' => $requestData['status'] ?? 'Draft',
                    'subscription_active' => $this->getBooleanValue($requestData['subscription_active'] ?? false),
                    'subscription_type' => $requestData['subscription_type'] ?? null,
                    'recurring_count' => $requestData['recurring_count'] ?? null,
                    'delivery_date' => $requestData['delivery_date'] ?? null,
                    'po_details' => $requestData['po_details'] ?? null,
                    'attachment' => $attachmentPath,
                    'cli_name' => $client->company ?? $client->cli_name ?? $client->name ?? 'Unknown Client',
                    'products_subscriptions' => json_encode($productsArray, JSON_PRETTY_PRINT),
                ]);

                // Create subscription records if active
                if ($this->getBooleanValue($requestData['subscription_active'] ?? false) && 
                    $subscriptionDates['start'] && $subscriptionDates['end']) {
                    $this->createSubscriptionAndBilling($purchase, $client, $productsArray, $subscriptionDates, $totalAmount, $requestData);
                }

                return $this->getById($purchase->id);

            } catch (\Exception $e) {
                Log::error('Purchase creation failed: ' . $e->getMessage(), [
                    'data' => $requestData,
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Update purchase with multiple products
     */
    public function update($id, array $data)
    {
        // Sanitize input
        $data = $this->sanitizeRequestData($data);

        $this->validatePurchaseData($data, true);

        return DB::transaction(function () use ($id, $data) {
            $purchase = Purchase::find($id);
            if (!$purchase) {
                throw new \Exception('Purchase not found');
            }

            $client = Client::find($data['client_id'] ?? $purchase->client_id);
            if (!$client) {
                throw new \Exception('Client not found');
            }

            // Handle file attachment update
            $attachmentPath = $purchase->attachment;
            if (isset($data['attachment']) && $data['attachment'] instanceof \Illuminate\Http\UploadedFile) {
                // Delete old attachment if exists
                if ($purchase->attachment) {
                    Storage::disk('public')->delete($purchase->attachment);
                }
                $attachmentPath = $data['attachment']->store('purchase_attachments', 'public');
            }

            // Determine products input
            $productsInput = $this->normalizeProductsInput($data);
            if (empty($productsInput)) {
                throw new \Exception('At least one product is required');
            }

            // Process products and calculate totals
            $result = $this->processProductsAndCalculate($productsInput, $data);
            $productsArray = $result['products'];
            $totalAmount = $result['total'];
            $subscriptionDates = $result['subscription_dates'];

            // Update purchase
            $purchase->update([
                'client_id' => $data['client_id'] ?? $purchase->client_id,
                'total_amount' => $totalAmount,
                'status' => $data['status'] ?? $purchase->status,
                'subscription_active' => $this->getBooleanValue($data['subscription_active'] ?? $purchase->subscription_active),
                'subscription_type' => $data['subscription_type'] ?? $purchase->subscription_type ?? null,
                'recurring_count' => $data['recurring_count'] ?? $purchase->recurring_count,
                'delivery_date' => $data['delivery_date'] ?? $purchase->delivery_date,
                'po_details' => $data['po_details'] ?? $purchase->po_details,
                'attachment' => $attachmentPath,
                'cli_name' => $client->company ?? $client->cli_name ?? $client->name ?? 'Unknown Client',
                'products_subscriptions' => json_encode($productsArray, JSON_PRETTY_PRINT),
            ]);

            // Handle subscription update if active
            if ($this->getBooleanValue($data['subscription_active'] ?? $purchase->subscription_active) && 
                $subscriptionDates['start'] && $subscriptionDates['end']) {
                
                $subscription = Subscription::where('purchase_id', $id)->first();
                if ($subscription) {
                    $subscription->update([
                        'start_date' => $subscriptionDates['start'],
                        'end_date' => $subscriptionDates['end'],
                        'total_amount' => $totalAmount,
                        'products_subscription_status' => $productsArray,
                    ]);
                }
            }

            return $this->getById($purchase->id);
        });
    }

    /**
     * Delete purchase and related records
     */
    public function delete($id)
    {
        return DB::transaction(function () use ($id) {
            $purchase = Purchase::find($id);
            if (!$purchase) {
                throw new \Exception('Purchase not found');
            }

            // Delete related subscription, billing, payments
            if ($purchase->subscription_active) {
                Subscription::where('purchase_id', $id)->delete();
                $billings = Billing_management::where('purchase_id', $id)->get();
                foreach ($billings as $billing) {
                    Payment_management::where('billing_id', $billing->id)->delete();
                }
                Billing_management::where('purchase_id', $id)->delete();
            }

            // Delete attachment
            if ($purchase->attachment) {
                Storage::disk('public')->delete($purchase->attachment);
            }

            $purchase->delete();

            return true;
        });
    }

    /**
     * Transform purchase with products array
     */
    private function transformPurchaseWithProducts($purchase)
    {
        $purchaseArray = $purchase->toArray();

        // Decode products_subscriptions JSON
        $products = [];
        if ($purchase->products_subscriptions) {
            $products = is_string($purchase->products_subscriptions)
                ? json_decode($purchase->products_subscriptions, true)
                : $purchase->products_subscriptions;
            
            // Calculate individual product totals if not already present
            foreach ($products as &$product) {
                if (!isset($product['sub_total'])) {
                    $product['sub_total'] = ($product['quantity'] ?? 1) * ($product['price'] ?? 0);
                }
            }
        }

        $purchaseArray['products'] = $products;
        $purchaseArray['total_amount'] = $purchase->total_amount;

        return $purchaseArray;
    }

    /**
     * Normalize products input from request
     */
    private function normalizeProductsInput($requestData)
    {
        $productsInput = $requestData['products'] ?? null;
        
        if (!$productsInput && isset($requestData['product_id'])) {
            // Single product fallback
            $productsInput = [
                [
                    'productId' => $requestData['product_id'],
                    'quantity' => $requestData['quantity'] ?? 1
                ]
            ];
        }

        return $productsInput;
    }

    /**
     * Process products and calculate totals
     */
    private function processProductsAndCalculate($productsInput, $requestData)
    {
        $productsArray = [];
        $totalAmount = 0;
        $subscriptionDates = ['start' => null, 'end' => null];

        foreach ($productsInput as $item) {
            $productId = $item['productId'] ?? $item['product_id'] ?? null;
            if (!$productId) continue;

            $product = Product::find($productId);
            if (!$product) {
                throw new \Exception("Product not found: ID {$productId}");
            }

            $quantity = intval($item['quantity'] ?? 1);
            $unitPrice = floatval($product->bdt_price ?? $product->base_price ?? $product->price ?? 0);
            $subTotal = $quantity * $unitPrice;
            $totalAmount += $subTotal;

            // Calculate subscription dates if active
            $dateRange = $requestData['delivery_date'] ?? 'N/A';
            $subscriptionStart = null;
            $subscriptionEnd = null;

            if ($this->getBooleanValue($requestData['subscription_active'] ?? false) &&
                !empty($requestData['subscription_type']) &&
                !empty($requestData['recurring_count']) &&
                !empty($requestData['delivery_date'])) {

                $startDate = Carbon::parse($requestData['delivery_date']);
                $months = (int)$requestData['subscription_type'];
                $recurringCount = (int)$requestData['recurring_count'];
                $endDate = $startDate->copy()->addMonths($months * $recurringCount);

                $subscriptionStart = $startDate->format('Y-m-d');
                $subscriptionEnd = $endDate->format('Y-m-d');
                $dateRange = "$subscriptionStart to $subscriptionEnd";

                $subscriptionDates['start'] = $subscriptionStart;
                $subscriptionDates['end'] = $subscriptionEnd;
            }

            $productsArray[] = [
                'name' => $product->product_name ?? $product->name ?? 'Unknown Product',
                'product_name' => $product->product_name ?? $product->name ?? 'Unknown Product',
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $unitPrice,
                'sub_total' => $subTotal,
                'status' => $item['status'] ?? 'Pending',
                'dateRange' => $dateRange,
                'subscription_start' => $subscriptionStart,
                'subscription_end' => $subscriptionEnd,
            ];
        }

        return [
            'products' => $productsArray,
            'total' => $totalAmount,
            'subscription_dates' => $subscriptionDates
        ];
    }

    /**
     * Create subscription and billing records
     */
    private function createSubscriptionAndBilling($purchase, $client, $productsArray, $subscriptionDates, $totalAmount, $requestData)
    {
        $subscription = Subscription::create([
            'po_number' => $purchase->po_number,
            'client_id' => $purchase->client_id,
            'purchase_id' => $purchase->id,
            'start_date' => $subscriptionDates['start'],
            'end_date' => $subscriptionDates['end'],
            'status' => 'Pending',
            'total_amount' => $totalAmount,
            'next_billing_date' => $subscriptionDates['end'],
            'notes' => 'Auto-created from multi-product PO',
            'po_details' => $requestData['po_details'] ?? null,
            'products_subscription_status' => json_encode($productsArray, JSON_PRETTY_PRINT),
        ]);

        $billNumber = 'BILL-' . $purchase->po_number;
        $billing = Billing_management::create([
            'bill_number' => $billNumber,
            'client' => $client->company ?? $client->cli_name ?? $client->name ?? 'Unknown',
            'po_number' => $purchase->po_number,
            'bill_date' => now()->format('Y-m-d'),
            'due_date' => $subscriptionDates['end'],
            'total_amount' => $totalAmount,
            'paid_amount' => 0,
            'status' => 'Pending',
            'payment_status' => 'Unpaid',
            'client_id' => $purchase->client_id,
            'subscription_id' => $subscription->id,
            'purchase_id' => $purchase->id,
        ]);

        Payment_management::create([
            'po_number' => $purchase->po_number,
            'client_id' => $purchase->client_id,
            'date' => now()->format('Y-m-d'),
            'amount' => 0,
            'method' => 'Pending',
            'transaction_id' => 'AUTO-' . $purchase->po_number,
            'status' => 'Pending',
            'receipt' => 'Not Generated',
            'billing_id' => $billing->id,
        ]);
    }

    /**
     * Validate incoming data
     */
    private function validatePurchaseData(array $data, $forUpdate = false)
    {
        $rules = [
            'client_id' => ($forUpdate ? 'sometimes' : 'required') . '|exists:clients,id',
            'status' => 'sometimes|string|in:Draft,Active,In Progress,Completed,Expired,Expiring Soon',
            'subscription_active' => 'sometimes|boolean',
            'po_details' => 'nullable|string',
            'delivery_date' => 'nullable|date',
            'subscription_type' => 'nullable|in:1,2,3,6,12',
            'recurring_count' => 'nullable|integer|min:1',
            'attachment' => 'nullable|file|max:5120', // 5MB max
        ];

        // Products validation
        if (isset($data['products']) && is_array($data['products'])) {
            $rules['products'] = 'required|array|min:1';
            $rules['products.*.productId'] = 'required|integer|exists:products,id';
            $rules['products.*.quantity'] = 'required|integer|min:1';
        } elseif (!$forUpdate) {
            // For creation only, fallback to single product
            $rules['product_id'] = 'required_without:products|exists:products,id';
            $rules['quantity'] = 'required_with:product_id|integer|min:1';
        }

        // Subscription strict rules only if active
        if (isset($data['subscription_active']) && $this->getBooleanValue($data['subscription_active'])) {
            $rules['subscription_type'] = 'required|in:1,2,3,6,12';
            $rules['recurring_count'] = 'required|integer|min:1';
            $rules['delivery_date'] = 'required|date';
        }

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            Log::error('Purchase validation failed', $validator->errors()->toArray());
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()->toArray()));
        }
    }

    /**
     * Convert various values to boolean
     */
    private function getBooleanValue($value)
    {
        if (is_bool($value)) return $value;
        if (is_string($value)) return in_array(strtolower($value), ['true', '1', 'yes', 'on']);
        if (is_numeric($value)) return intval($value) === 1;
        return false;
    }

    /**
     * Generate unique PO number
     */
    public function generatePoNumber()
    {
        $year = date('Y');

        $lastPo = DB::table('purchases')
            ->where('po_number', 'like', "PO-$year-%")
            ->orderByDesc('id')
            ->first();

        $nextDigits = '0001';
        if ($lastPo && preg_match("/PO-$year-(\d+)/", $lastPo->po_number, $matches)) {
            $nextSerial = intval($matches[1]) + 1;
            $nextDigits = str_pad($nextSerial, 4, '0', STR_PAD_LEFT);
        }

        return "PO-$year-$nextDigits";
    }

    /**
     * Get purchases by client ID
     */
    public function getByClientId($clientId)
    {
        $purchases = Purchase::where('client_id', $clientId)
            ->with(['client'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $purchases->map(function ($purchase) {
            return $this->transformPurchaseWithProducts($purchase);
        });
    }

    /**
     * Get purchase by PO number
     */
    public function getByPoNumber($poNumber)
    {
        $purchase = Purchase::where('po_number', $poNumber)
            ->with(['client'])
            ->first();

        if (!$purchase) {
            return null;
        }

        return $this->transformPurchaseWithProducts($purchase);
    }

    /**
     * Get status options for frontend
     */
    public function getStatusOptions()
    {
        return [
            ['value' => 'All Status', 'label' => 'All Status'],
            ['value' => 'Active', 'label' => 'Active'],
            ['value' => 'In Progress', 'label' => 'In Progress'],
            ['value' => 'Completed', 'label' => 'Completed'],
            ['value' => 'Expired', 'label' => 'Expired'],
            ['value' => 'Expiring Soon', 'label' => 'Expiring Soon'],
        ];
    }

    /**
     * Get status color mapping for UI
     */
    public function getStatusColor($status)
    {
        $statusColors = [
            'Active' => 'bg-gray-900 text-white',
            'In Progress' => 'bg-blue-100 text-blue-800',
            'Expiring Soon' => 'bg-red-100 text-red-800',
            'Completed' => 'bg-green-100 text-green-800',
            'Expired' => 'bg-gray-100 text-gray-800',
        ];

        return $statusColors[$status] ?? 'bg-gray-100 text-gray-800';
    }

    /**
     * Check if purchase has attachment
     */
    public function hasAttachment($purchase)
    {
        return !empty($purchase->attachment);
    }

    /**
     * Get all unique purchase statuses
     */
    public function getAllStatuses()
    {
        return Purchase::select('status')->distinct()->pluck('status')->toArray();
    }

    /**
     * Get purchase with related data (for detailed view)
     */
    public function getWithRelatedData($id)
    {
        $purchase = Purchase::with(['client', 'subscription', 'billing', 'payment'])->find($id);

        if (!$purchase) {
            return null;
        }

        $purchaseArray = $this->transformPurchaseWithProducts($purchase);
        
        // Add related data to the response
        $purchaseArray['subscription'] = $purchase->subscription;
        $purchaseArray['billing'] = $purchase->billing;
        $purchaseArray['payment'] = $purchase->payment;
        
        return $purchaseArray;
    }
    /**
     * Sanitize request data to handle "null" strings
     */
    private function sanitizeRequestData(array $data)
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                if ($value === 'null') {
                    $data[$key] = null;
                } elseif ($value === 'true') {
                    $data[$key] = true;
                } elseif ($value === 'false') {
                    $data[$key] = false;
                }
            }
        }
        return $data;
    }
}