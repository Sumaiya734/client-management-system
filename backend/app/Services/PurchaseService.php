<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\Client;
use App\Models\Product;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PurchaseService extends BaseService
{
    protected $model;

    public function __construct(Purchase $model)
    {
        $this->model = $model;
    }

    /**
     * Get all purchases with relationships and group by PO number
     */
    public function getAll()
    {
        // Get purchases with valid client and product relationships to avoid errors
        $purchases = $this->model->whereHas('client')->whereHas('product')
            ->with(['client', 'product'])->get();

        // Group purchases by PO number to handle multiple products per PO
        $groupedPurchases = [];
        $processedPONumbers = [];

        foreach ($purchases as $purchase) {
            if (!in_array($purchase->po_number, $processedPONumbers)) {
                // Find all purchases with the same PO number
                $relatedPurchases = $purchases->where('po_number', $purchase->po_number);

                // Create a consolidated purchase object
                $consolidatedPurchase = $purchase->toArray();
                $consolidatedPurchase['products'] = [];

                foreach ($relatedPurchases as $relatedPurchase) {
                    $productData = [
                        'id' => $relatedPurchase->product->id,
                        'product_name' => $relatedPurchase->product->product_name ?? $relatedPurchase->product->name,
                        'quantity' => $relatedPurchase->quantity,
                        'subscription_start' => $relatedPurchase->subscription_start,
                        'subscription_end' => $relatedPurchase->subscription_end,
                    ];
                    $consolidatedPurchase['products'][] = $productData;
                }

                $consolidatedPurchase['total_products'] = count($consolidatedPurchase['products']);
                $consolidatedPurchase['total_amount'] = $relatedPurchases->sum('total_amount');

                $groupedPurchases[] = $consolidatedPurchase;
                $processedPONumbers[] = $purchase->po_number;
            }
        }

        return $groupedPurchases;
    }

    /**
     * Get purchase by ID with relationships
     */
    public function getById($id)
    {
        $purchase = $this->model->whereHas('client')->whereHas('product')
            ->with(['client', 'product'])->find($id);

        if (!$purchase) {
            return null;
        }

        // Find all purchases with the same PO number
        $relatedPurchases = $this->model->where('po_number', $purchase->po_number)
            ->whereHas('client')->whereHas('product')
            ->with(['client', 'product'])
            ->get();

        // Create a consolidated purchase object
        $consolidatedPurchase = $purchase->toArray();
        $consolidatedPurchase['products'] = [];

        foreach ($relatedPurchases as $relatedPurchase) {
            $productData = [
                'id' => $relatedPurchase->product->id,
                'product_name' => $relatedPurchase->product->product_name ?? $relatedPurchase->product->name,
                'quantity' => $relatedPurchase->quantity,
                'subscription_start' => $relatedPurchase->subscription_start,
                'subscription_end' => $relatedPurchase->subscription_end,
            ];
            $consolidatedPurchase['products'][] = $productData;
        }

        $consolidatedPurchase['total_products'] = count($consolidatedPurchase['products']);
        $consolidatedPurchase['total_amount'] = $relatedPurchases->sum('total_amount');

        return $consolidatedPurchase;
    }

    /**
     * Create a new purchase
     */
    public function create(array $data)
    {
        // Handle validation differently for single vs multiple products
        if (isset($data['products']) && is_array($data['products']) && count($data['products']) > 0) {
            // Multiple products validation
            $validator = Validator::make($data, [
                'status' => 'required|string',
                'client_id' => 'required|exists:clients,id',
                'products' => 'required|array|min:1',
                'products.*.productId' => 'required|exists:products,id',
                'products.*.quantity' => 'required|integer|min:1',
                'products.*.subscription_start' => 'required|date',
                'products.*.subscription_end' => 'required|date',
                'subscription_active' => 'boolean',
                'total_amount' => 'required|numeric|min:0',
                'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:10240' // 10MB max
            ]);

            // Custom validation for date comparison
            foreach ($data['products'] ?? [] as $index => $product) {
                if (isset($product['subscription_start']) && isset($product['subscription_end'])) {
                    $startDate = new \DateTime($product['subscription_start']);
                    $endDate = new \DateTime($product['subscription_end']);

                    if ($startDate >= $endDate) {
                        $validator->errors()->add("products.$index.subscription_end", 'Subscription end date must be after subscription start date.');
                    }
                }
            }
        } else {
            // Single product validation (backward compatibility)
            $validator = Validator::make($data, [
                'status' => 'required|string',
                'client_id' => 'required|exists:clients,id',
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
                'subscription_start' => 'required|date',
                'subscription_end' => 'required|date',
                'subscription_active' => 'boolean',
                'total_amount' => 'required|numeric|min:0',
                'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:10240' // 10MB max
            ]);

            // Custom validation for single product date comparison
            if (isset($data['subscription_start']) && isset($data['subscription_end'])) {
                $startDate = new \DateTime($data['subscription_start']);
                $endDate = new \DateTime($data['subscription_end']);

                if ($startDate >= $endDate) {
                    $validator->errors()->add('subscription_end', 'Subscription end date must be after subscription start date.');
                }
            }
        }

        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }

        // Generate PO number automatically in format PO-YYYY-xxxx
        $year = date('Y');
        $latestPO = $this->model->where('po_number', 'LIKE', "PO-$year-%")
            ->orderByRaw('CAST(SUBSTRING(po_number, -4) AS UNSIGNED) DESC')
            ->first();

        $sequenceNumber = 1;
        if ($latestPO) {
            $lastSequence = substr($latestPO->po_number, -4);
            $sequenceNumber = (int)$lastSequence + 1;
        }

        $poNumber = "PO-$year-" . str_pad($sequenceNumber, 4, '0', STR_PAD_LEFT);

        // Handle file upload if attachment is present
        if (isset($data['attachment']) && $data['attachment'] instanceof \Illuminate\Http\UploadedFile) {
            $file = $data['attachment'];
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('purchase_attachments', $fileName, 'public');
            $attachmentPath = $filePath;
        } else {
            $attachmentPath = null;
        }

        $purchases = [];
        $requestData = $data;

        // Automatically populate cli_name from client if client_id is provided
        $client = Client::find($data['client_id']);
        $cliName = null;
        if ($client) {
            $cliName = $client->cli_name ?? $client->name;
        }

        if (isset($requestData['products']) && is_array($requestData['products']) && count($requestData['products']) > 0) {
            // Multiple products - create separate purchase records for each
            foreach ($requestData['products'] as $productData) {
                // Handle case where productData might come from FormData
                $productId = $productData['productId'] ?? $productData['product_id'] ?? null;
                $quantity = $productData['quantity'] ?? 1;
                $subscriptionStart = $productData['subscription_start'] ?? null;
                $subscriptionEnd = $productData['subscription_end'] ?? null;

                $product = Product::find($productId);
                if ($product) {
                    $price = $product->bdt_price ?? $product->base_price ?? 0;
                    $totalAmount = $price * $quantity;
                } else {
                    $totalAmount = 0;
                }

                $purchaseData = [
                    'po_number' => $poNumber,
                    'status' => $requestData['status'],
                    'client_id' => $data['client_id'],
                    'cli_name' => $cliName,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'subscription_start' => $subscriptionStart,
                    'subscription_end' => $subscriptionEnd,
                    'subscription_active' => $this->getBooleanValue($requestData['subscription_active'] ?? false),
                    'total_amount' => $totalAmount,
                    'attachment' => $attachmentPath,
                    'po_details' => $requestData['po_details'] ?? null,
                    'products_subscriptions' => $this->formatProductsSubscriptions($requestData['products'] ?? [], $data['client_id']),
                ];

                $purchase = $this->model->create($purchaseData);
                $purchases[] = $purchase;

                // Create subscription if subscription_active is true and subscription dates are provided
                if (($this->getBooleanValue($requestData['subscription_active'] ?? false)) && $subscriptionStart && $subscriptionEnd) {
                    $subscription = Subscription::create([
                        'po_number' => $poNumber,
                        'client_id' => $data['client_id'],
                        'product_id' => $productId,
                        'purchase_id' => $purchase->id,
                        'start_date' => $subscriptionStart,
                        'end_date' => $subscriptionEnd,
                        'status' => 'Pending', // Default status
                        'quantity' => $quantity,
                        'total_amount' => $totalAmount,
                        'next_billing_date' => $subscriptionEnd, // Set end date as next billing date initially
                        'notes' => 'Auto-created from purchase order'
                    ]);
                }
            }
        } else {
            // Single product - backward compatibility
            $product = Product::find($data['product_id']);
            if ($product) {
                $price = $product->bdt_price ?? $product->base_price ?? 0;
                $totalAmount = $price * $data['quantity'];
            } else {
                $totalAmount = 0;
            }

            $purchaseData = [
                'po_number' => $poNumber,
                'status' => $requestData['status'],
                'client_id' => $data['client_id'],
                'cli_name' => $cliName,
                'product_id' => $data['product_id'],
                'quantity' => $data['quantity'],
                'subscription_start' => $data['subscription_start'],
                'subscription_end' => $data['subscription_end'],
                'subscription_active' => $this->getBooleanValue($requestData['subscription_active'] ?? false),
                'total_amount' => $totalAmount,
                'attachment' => $attachmentPath,
                'po_details' => $requestData['po_details'] ?? null,
                'products_subscriptions' => null, // For single product, no products_subscriptions data to format
            ];

            $purchase = $this->model->create($purchaseData);
            $purchases[] = $purchase;

            // Create subscription if subscription_active is true and subscription dates are provided
            if (($this->getBooleanValue($requestData['subscription_active'] ?? false)) && isset($data['subscription_start']) && isset($data['subscription_end'])) {
                $subscription = Subscription::create([
                    'po_number' => $poNumber,
                    'client_id' => $data['client_id'],
                    'product_id' => $data['product_id'],
                    'purchase_id' => $purchase->id,
                    'start_date' => $data['subscription_start'],
                    'end_date' => $data['subscription_end'],
                    'status' => 'Pending', // Default status
                    'quantity' => $data['quantity'],
                    'total_amount' => $totalAmount,
                    'next_billing_date' => $data['subscription_end'], // Set end date as next billing date initially
                    'notes' => 'Auto-created from purchase order'
                ]);
            }
        }

        return $purchases;
    }

    /**
     * Update an existing purchase
     */
    public function update($id, array $data)
    {
        $purchase = $this->model->find($id);

        if (!$purchase) {
            throw new \Exception('Purchase not found');
        }

        // Handle validation differently for single vs multiple products
        if (isset($data['products']) && is_array($data['products']) && count($data['products']) > 0) {
            // Multiple products validation
            $validator = Validator::make($data, [
                'po_number' => 'sometimes|string|unique:purchases,po_number,' . $id,
                'status' => 'sometimes|string',
                'client_id' => 'sometimes|exists:clients,id',
                'products' => 'sometimes|array|min:1',
                'products.*.productId' => 'sometimes|exists:products,id',
                'products.*.quantity' => 'sometimes|integer|min:1',
                'products.*.subscription_start' => 'sometimes|date',
                'products.*.subscription_end' => 'sometimes|date',
                'subscription_active' => 'sometimes|boolean',
                'total_amount' => 'sometimes|numeric|min:0',
                'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:10240' // 10MB max
            ]);

            // Custom validation for date comparison in update
            foreach ($data['products'] ?? [] as $index => $product) {
                if (isset($product['subscription_start']) && isset($product['subscription_end'])) {
                    $startDate = new \DateTime($product['subscription_start']);
                    $endDate = new \DateTime($product['subscription_end']);

                    if ($startDate >= $endDate) {
                        $validator->errors()->add("products.$index.subscription_end", 'Subscription end date must be after subscription start date.');
                    }
                }
            }
        } else {
            // Single product validation (backward compatibility)
            $validator = Validator::make($data, [
                'po_number' => 'sometimes|string|unique:purchases,po_number,' . $id,
                'status' => 'sometimes|string',
                'client_id' => 'sometimes|exists:clients,id',
                'product_id' => 'sometimes|exists:products,id',
                'quantity' => 'sometimes|integer|min:1',
                'subscription_start' => 'sometimes|date',
                'subscription_end' => 'sometimes|date',
                'subscription_active' => 'sometimes|boolean',
                'total_amount' => 'sometimes|numeric|min:0',
                'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:10240' // 10MB max
            ]);

            // Custom validation for single product date comparison in update
            if (isset($data['subscription_start']) && isset($data['subscription_end'])) {
                $startDate = new \DateTime($data['subscription_start']);
                $endDate = new \DateTime($data['subscription_end']);

                if ($startDate >= $endDate) {
                    $validator->errors()->add('subscription_end', 'Subscription end date must be after subscription start date.');
                }
            }
        }

        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }

        // Handle file upload if attachment is present
        if (isset($data['attachment']) && $data['attachment'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old attachment if exists
            if ($purchase->attachment) {
                Storage::disk('public')->delete($purchase->attachment);
            }

            $file = $data['attachment'];
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('purchase_attachments', $fileName, 'public');
            $requestData['attachment'] = $filePath;
        } else {
            $requestData = $data;
        }

        // Automatically update cli_name from client if client_id is provided
        if (isset($requestData['client_id'])) {
            $client = Client::find($requestData['client_id']);
            if ($client) {
                $requestData['cli_name'] = $client->cli_name ?? $client->name;
            }
        }

        $purchase->update($requestData);

        return $purchase;
    }

    /**
     * Delete a purchase
     */
    public function delete($id)
    {
        $purchase = $this->model->find($id);

        if (!$purchase) {
            throw new \Exception('Purchase not found');
        }

        return $purchase->delete();
    }

    /**
     * Format products subscriptions data for storage
     */
    private function formatProductsSubscriptions($products, $clientId)
    {
        if (empty($products) || !is_array($products)) {
            return null;
        }

        $formattedProducts = [];
        foreach ($products as $productData) {
            $productId = $productData['productId'] ?? $productData['product_id'] ?? null;
            if ($productId) {
                $product = Product::find($productId);
                $productName = $product ? ($product->product_name ?? $product->name ?? 'Unknown Product') : 'Unknown Product';

                $formattedProducts[] = [
                    'id' => $productId,
                    'name' => $productName,
                    'quantity' => $productData['quantity'] ?? 1,
                    'subscription_start' => $productData['subscription_start'] ?? null,
                    'subscription_end' => $productData['subscription_end'] ?? null,
                    'status' => 'Pending'
                ];
            }
        }

        return !empty($formattedProducts) ? json_encode($formattedProducts) : null;
    }

    /**
     * Determine purchase status based on start and end dates
     * 
     * @param string $startDate Start date in dd/mm/yyyy format
     * @param string $endDate End date in dd/mm/yyyy format
     * @return string Status of the purchase
     */
    public function getPurchaseStatus($startDate, $endDate)
    {
        // Parse dates from dd/mm/yyyy format
        $start = null;
        $end = null;
        
        if ($startDate) {
            $start = \DateTime::createFromFormat('d/m/Y', $startDate);
            if (!$start) {
                // If dd/mm/yyyy format fails, try other common formats
                $start = \DateTime::createFromFormat('Y-m-d', $startDate);
                if (!$start) {
                    $start = \DateTime::createFromFormat('m/d/Y', $startDate);
                }
            }
        }
        
        if ($endDate) {
            $end = \DateTime::createFromFormat('d/m/Y', $endDate);
            if (!$end) {
                // If dd/mm/yyyy format fails, try other common formats
                $end = \DateTime::createFromFormat('Y-m-d', $endDate);
                if (!$end) {
                    $end = \DateTime::createFromFormat('m/d/Y', $endDate);
                }
            }
        }
        
        $currentDate = new \DateTime();
        
        // If no start date, status is pending
        if (!$start) {
            return 'Pending';
        }
        
        // If start date is in the future, status is pending
        if ($start > $currentDate) {
            return 'Pending';
        }
        
        // If no end date but start date is in past, status is active
        if (!$end) {
            return 'Active';
        }
        
        // Check if end date is coming up within 7 days but still in the future
        $sevenDaysFromNow = clone $currentDate;
        $sevenDaysFromNow->add(new \DateInterval('P7D')); // P7D = Period of 7 Days
        
        if ($end > $currentDate && $end <= $sevenDaysFromNow) {
            return 'Expired soon';
        }
        
        // If end date is in the future (more than 7 days), status is active
        if ($end > $currentDate) {
            return 'Active';
        }
        
        // If end date is in the past, status is expired
        return 'Expired';
    }

    /**
     * Convert various input types to boolean value
     */
    private function getBooleanValue($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_string($value)) {
            $value = strtolower($value);
            return $value === '1' || $value === 'true' || $value === 'on';
        }

        if (is_numeric($value)) {
            return (bool) $value;
        }

        return (bool) $value;
    }
}
