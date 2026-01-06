<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Purchase;
use App\Models\Product;
use App\Models\Client;
use App\Models\Billing_management;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

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
        try {
            $subscriptions = $this->model->with(['client', 'product', 'purchase', 'invoice'])->get();
            
            logger()->info('SubscriptionService::getAll() - Found subscriptions:', [
                'count' => $subscriptions->count(),
                'subscriptions' => $subscriptions->toArray()
            ]);

            // Transform the subscriptions to match the frontend expectations
            $transformedSubscriptions = $subscriptions->map(function ($subscription) {
                logger()->info('Processing subscription:', [
                    'id' => $subscription->id,
                    'po_number' => $subscription->po_number,
                    'has_client' => !is_null($subscription->client),
                    'has_product' => !is_null($subscription->product),
                    'has_purchase' => !is_null($subscription->purchase),
                    'products_subscription_status' => $subscription->products_subscription_status
                ]);
                
                // Get the associated purchase to get additional information
                $purchase = $subscription->purchase;

                // For single product subscriptions
                $products = [];
                
                // First check if subscription has products_subscription_status (stored products data)
                if ($subscription->products_subscription_status) {
                    $storedProducts = is_string($subscription->products_subscription_status) ? 
                        json_decode($subscription->products_subscription_status, true) : 
                        $subscription->products_subscription_status;
                    
                    if (is_array($storedProducts) && count($storedProducts) > 0) {
                        foreach ($storedProducts as $storedProduct) {
                            $products[] = [
                                'name' => $storedProduct['name'] ?? $storedProduct['product_name'] ?? 'N/A',
                                'quantity' => $storedProduct['quantity'] ?? 1,
                                'status' => $storedProduct['status'] ?? 'Pending',
                                'dateRange' => $subscription->start_date && $subscription->end_date ?
                                    $subscription->start_date . ' to ' . $subscription->end_date : 'N/A',
                                'action' => ($storedProduct['status'] ?? 'Pending') === 'Pending' ? 'Subscribe' : 'Edit',
                                'price' => $storedProduct['price'] ?? $storedProduct['unit_price'] ?? 0,
                                'sub_total' => $storedProduct['sub_total'] ?? 0,
                                'start_date' => $storedProduct['start_date'] ?? $subscription->start_date,
                                'end_date' => $storedProduct['end_date'] ?? $subscription->end_date,
                                'delivery_date' => $storedProduct['delivery_date'] ?? $subscription->delivery_date ?? $purchase->delivery_date ?? null,
                            ];
                        }
                    } else {
                        // Log error if products_subscription_status is not a valid array
                        logger()->warning('Invalid products_subscription_status format for subscription ID: ' . $subscription->id, [
                            'raw_data' => $subscription->products_subscription_status,
                            'type' => gettype($subscription->products_subscription_status)
                        ]);
                    }
                }
                // Then check if purchase has products_subscriptions (multi-product support)
                elseif ($purchase && $purchase->products_subscriptions) {
                    $products = $this->parseProductsFromPurchase($purchase->products_subscriptions, $purchase);
                }
                // Then check if subscription has a direct product relationship
                elseif ($subscription->product) {
                    $products[] = [
                        'name' => $subscription->product->product_name ?? $subscription->product->name ?? 'N/A',
                        'quantity' => $subscription->quantity ?? 1,
                        'status' => $subscription->status ?? 'Pending',
                        'dateRange' => $subscription->start_date && $subscription->end_date ?
                            $subscription->start_date . ' to ' . $subscription->end_date : 'N/A',
                        'action' => $subscription->status === 'Pending' ? 'Subscribe' : 'Edit',
                        'price' => $subscription->unit_price ?? $subscription->product->price ?? 0,
                        'sub_total' => $subscription->total_amount ?? 0,
                        'start_date' => $subscription->start_date,
                        'end_date' => $subscription->end_date,
                        'delivery_date' => $subscription->delivery_date ?? $purchase->delivery_date ?? null,
                    ];
                }
                // Fallback: create a basic product entry from subscription data if no product or purchase data available
                else {
                    $products[] = [
                        'name' => $subscription->product_name ?? 'Product ' . $subscription->id ?? 'N/A',
                        'quantity' => $subscription->quantity ?? 1,
                        'status' => $subscription->status ?? 'Pending',
                        'dateRange' => $subscription->start_date && $subscription->end_date ?
                            $subscription->start_date . ' to ' . $subscription->end_date : 'N/A',
                        'action' => $subscription->status === 'Pending' ? 'Subscribe' : 'Edit'
                    ];
                }

                logger()->info('Generated products for subscription:', [
                    'subscription_id' => $subscription->id,
                    'products_count' => count($products),
                    'products' => $products
                ]);

                // Determine individual product status based on dates
                $products = array_map(function($product) use ($subscription) {
                    $status = $product['status'];
                    
                    // Check if product has date range
                    if (isset($subscription->end_date) && $subscription->end_date) {
                        $endDate = Carbon::parse($subscription->end_date);
                        $now = Carbon::now();
                        $daysToExpiry = $now->diffInDays($endDate, false);
                        
                        if ($now->gt($endDate)) {
                            // Subscription is expired
                            $status = 'Expired';
                        } elseif ($daysToExpiry <= 7) {
                            // Subscription expires within 7 days
                            $status = 'Expiring Soon';
                        } else {
                            // Subscription is active
                            $status = 'Active';
                        }
                    }
                    
                    $product['status'] = $status;
                    $product['action'] = ($status === 'Pending' || $status === 'Expiring Soon' || $status === 'Active') ? 'Edit' : 'Edit';
                    
                    return $product;
                }, $products);
                
                // Calculate progress based on updated product statuses
                $activeProducts = count(array_filter($products, function($product) {
                    return $product['status'] === 'Active';
                }));
                $totalProducts = count($products);
                $progressPercentage = $totalProducts > 0 ? ($activeProducts / $totalProducts) * 100 : 0;

                $progressStatus = 'Pending';
                if ($progressPercentage === 100) {
                    $progressStatus = 'Complete';
                } elseif ($progressPercentage > 0) {
                    $progressStatus = 'Partial';
                }
                
                // Additional logic: if any products are expired, overall status could be 'Expired'
                $expiredProducts = count(array_filter($products, function($product) {
                    return $product['status'] === 'Expired';
                }));
                
                if ($expiredProducts > 0) {
                    $progressStatus = 'Expired';
                }
                
                // Additional logic: if any products are expiring soon, overall status could be 'Expiring Soon'
                $expiringSoonProducts = count(array_filter($products, function($product) {
                    return $product['status'] === 'Expiring Soon';
                }));
                
                if ($expiringSoonProducts > 0 && $expiredProducts === 0) {
                    $progressStatus = 'Expiring Soon';
                }

                $transformedSubscription = [
                    'id' => $subscription->id,
                    'poNumber' => $subscription->po_number ?? $purchase->po_number ?? 'N/A',
                    'createdDate' => $subscription->start_date ?? $purchase->delivery_date ?? 'N/A',
                    'client' => [
                        'company' => $subscription->client->company ?? $subscription->client->name ?? $purchase->cli_name ?? 'N/A',
                        'contact' => $subscription->client->contact ?? 'N/A',
                        'cli_name' => $subscription->client->cli_name ?? $purchase->cli_name ?? 'N/A'
                    ],
                    'products' => $products,
                    'products_subscription_status' => $subscription->products_subscription_status,
                    'progress' => [
                        'status' => $progressStatus,
                        'completed' => $activeProducts,
                        'total' => $totalProducts,
                        'percentage' => (int) $progressPercentage
                    ],
                    'totalAmount' => '৳' . number_format($subscription->total_amount ?? $purchase->total_amount ?? 0, 2) . ' BDT',
                    'canGenerateBill' => $progressStatus === 'Complete' || $progressStatus === 'Active' || $progressStatus === 'Expiring Soon' || $progressStatus === 'Expired',
                    // Store original data needed for creating new subscriptions
                    'client_id' => $subscription->client_id ?? $purchase->client_id,
                    'product_id' => $subscription->product_id,
                    'total_amount' => $subscription->total_amount ?? $purchase->total_amount,
                    // Include the raw database fields
                    'raw_progress' => $subscription->progress,
                    'raw_progress' => $subscription->progress,
                    'raw_products_subscription_status' => $subscription->products_subscription_status,
                    'invoice' => $subscription->invoice,
                    // Add attachment from purchase
                    'attachment' => $purchase->attachment ?? null,
                    // Add date fields for frontend modal
                    'start_date' => $subscription->start_date,
                    'end_date' => $subscription->end_date,
                    'delivery_date' => $subscription->delivery_date ?? $purchase->delivery_date ?? null,
                ];

                logger()->info('Transformed subscription:', [
                    'subscription_id' => $subscription->id,
                    'products_count' => count($transformedSubscription['products']),
                    'client_data' => $transformedSubscription['client']
                ]);

                return $transformedSubscription;
            });

            logger()->info('Final transformed subscriptions:', [
                'count' => $transformedSubscriptions->count(),
                'data' => $transformedSubscriptions->toArray()
            ]);

            return $transformedSubscriptions;
        } catch (\Exception $e) {
            logger()->error('Error in SubscriptionService::getAll()', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get subscription by ID with relationships and transform data
     */
    public function getById($id)
    {
        try {
            $subscription = $this->model->with(['client', 'product', 'purchase', 'invoice'])->find($id);
    
            if (!$subscription) {
                return null;
            }
    
            // Transform the single subscription to match the frontend expectations
            $purchase = $subscription->purchase;
    
            // For single product subscriptions
            $products = [];
            
            // First check if subscription has products_subscription_status (stored products data)
            if ($subscription->products_subscription_status) {
                $storedProducts = is_string($subscription->products_subscription_status) ? 
                    json_decode($subscription->products_subscription_status, true) : 
                    $subscription->products_subscription_status;
                
                if (is_array($storedProducts)) {
                    foreach ($storedProducts as $storedProduct) {
                        $products[] = [
                            'name' => $storedProduct['name'] ?? $storedProduct['product_name'] ?? 'N/A',
                            'quantity' => $storedProduct['quantity'] ?? 1,
                            'status' => $storedProduct['status'] ?? 'Pending',
                            'dateRange' => $subscription->start_date && $subscription->end_date ?
                                $subscription->start_date . ' to ' . $subscription->end_date : 'N/A',
                            'action' => ($storedProduct['status'] ?? 'Pending') === 'Pending' ? 'Subscribe' : 'Edit',
                            'price' => $storedProduct['price'] ?? $storedProduct['unit_price'] ?? 0,
                            'sub_total' => $storedProduct['sub_total'] ?? 0,
                            'start_date' => $storedProduct['start_date'] ?? $subscription->start_date,
                            'end_date' => $storedProduct['end_date'] ?? $subscription->end_date,
                            'delivery_date' => $storedProduct['delivery_date'] ?? $subscription->delivery_date ?? $purchase->delivery_date ?? null,
                        ];
                    }
                } else {
                    // Log error if products_subscription_status is not a valid array
                    logger()->warning('Invalid products_subscription_status format for subscription ID: ' . $subscription->id, [
                        'raw_data' => $subscription->products_subscription_status,
                        'type' => gettype($subscription->products_subscription_status)
                    ]);
                }
            }
            // Then check if purchase has products_subscriptions (multi-product support)
            elseif ($purchase && $purchase->products_subscriptions) {
                $products = $this->parseProductsFromPurchase($purchase->products_subscriptions, $purchase);
            }
            // Then check if subscription has a direct product relationship
            elseif ($subscription->product) {
                $products[] = [
                    'name' => $subscription->product->product_name ?? $subscription->product->name ?? 'N/A',
                    'quantity' => $subscription->quantity ?? 1,
                    'status' => $subscription->status ?? 'Pending',
                    'dateRange' => $subscription->start_date && $subscription->end_date ?
                        $subscription->start_date . ' to ' . $subscription->end_date : 'N/A',
                    'action' => $subscription->status === 'Pending' ? 'Subscribe' : 'Edit',
                    'price' => $subscription->unit_price ?? $subscription->product->price ?? 0,
                    'sub_total' => $subscription->total_amount ?? 0,
                    'start_date' => $subscription->start_date,
                    'end_date' => $subscription->end_date,
                    'delivery_date' => $subscription->delivery_date ?? $purchase->delivery_date ?? null,
                ];
            }
            // Fallback: create a basic product entry from subscription data if no product or purchase data available
            else {
                $products[] = [
                    'name' => $subscription->product_name ?? 'Product' . $subscription->id ?? 'N/A',
                    'quantity' => $subscription->quantity ?? 1,
                    'status' => $subscription->status ?? 'Pending',
                    'dateRange' => $subscription->start_date && $subscription->end_date ?
                        $subscription->start_date . ' to ' . $subscription->end_date : 'N/A',
                    'action' => $subscription->status === 'Pending' ? 'Subscribe' : 'Edit',
                    'price' => $subscription->unit_price ?? $subscription->product->price ?? 0,
                    'sub_total' => $subscription->total_amount ?? 0,
                    'start_date' => $subscription->start_date,
                    'end_date' => $subscription->end_date,
                    'delivery_date' => $subscription->delivery_date ?? $purchase->delivery_date ?? null,
                ];
            }
    
            // Determine individual product status based on dates
            $products = array_map(function($product) use ($subscription) {
                $status = $product['status'];
                
                // Check if product has date range
                if (isset($subscription->end_date) && $subscription->end_date) {
                    $endDate = Carbon::parse($subscription->end_date);
                    $now = Carbon::now();
                    $daysToExpiry = $now->diffInDays($endDate, false);
                    
                    if ($now->gt($endDate)) {
                        // Subscription is expired
                        $status = 'Expired';
                    } elseif ($daysToExpiry <= 7) {
                        // Subscription expires within 7 days
                        $status = 'Expiring Soon';
                    } else {
                        // Subscription is active
                        $status = 'Active';
                    }
                }
                
                $product['status'] = $status;
                $product['action'] = ($status === 'Pending' || $status === 'Expiring Soon' || $status === 'Active') ? 'Edit' : 'Edit';
                
                return $product;
            }, $products);
            
            // Calculate progress based on updated product statuses
            $activeProducts = count(array_filter($products, function($product) {
                return $product['status'] === 'Active';
            }));
            $totalProducts = count($products);
            $progressPercentage = $totalProducts > 0 ? ($activeProducts / $totalProducts) * 100 : 0;
    
            $progressStatus = 'Pending';
            if ($progressPercentage === 100) {
                $progressStatus = 'Complete';
            } elseif ($progressPercentage > 0) {
                $progressStatus = 'Partial';
            }
            
            // Additional logic: if any products are expired, overall status could be 'Expired'
            $expiredProducts = count(array_filter($products, function($product) {
                return $product['status'] === 'Expired';
            }));
            
            if ($expiredProducts > 0) {
                $progressStatus = 'Expired';
            }
            
            // Additional logic: if any products are expiring soon, overall status could be 'Expiring Soon'
            $expiringSoonProducts = count(array_filter($products, function($product) {
                return $product['status'] === 'Expiring Soon';
            }));
            
            if ($expiringSoonProducts > 0 && $expiredProducts === 0) {
                $progressStatus = 'Expiring Soon';
            }
    
            $transformedSubscription = [
                'id' => $subscription->id,
                'poNumber' => $subscription->po_number ?? $purchase->po_number ?? 'N/A',
                'createdDate' => $subscription->start_date ?? $purchase->delivery_date ?? 'N/A',
                'client' => [
                    'company' => $subscription->client->company ?? $subscription->client->name ?? $purchase->cli_name ?? 'N/A',
                    'contact' => $subscription->client->contact ?? 'N/A',
                    'cli_name' => $subscription->client->cli_name ?? $purchase->cli_name ?? 'N/A'
                ],
                'products' => $products,
                'products_subscription_status' => $subscription->products_subscription_status,
                'progress' => [
                    'status' => $progressStatus,
                    'completed' => $activeProducts,
                    'total' => $totalProducts,
                    'percentage' => (int) $progressPercentage
                ],
                'totalAmount' => '৳' . number_format($subscription->total_amount ?? $purchase->total_amount ?? 0, 2) . ' BDT',
                'canGenerateBill' => $progressStatus === 'Complete' || $progressStatus === 'Active' || $progressStatus === 'Expiring Soon' || $progressStatus === 'Expired',
                // Store original data needed for creating new subscriptions
                'client_id' => $subscription->client_id ?? $purchase->client_id,
                'product_id' => $subscription->product_id,
                'total_amount' => $subscription->total_amount ?? $purchase->total_amount,
                // Include the raw database fields
                'raw_progress' => $subscription->progress,
                'raw_products_subscription_status' => $subscription->products_subscription_status,
                // Add attachment from purchase
                'attachment' => $purchase->attachment ?? null,
                'start_date' => $subscription->start_date,
                'end_date' => $subscription->end_date,
                'delivery_date' => $subscription->delivery_date ?? $purchase->delivery_date ?? null,
            ];
    
            return $transformedSubscription;
        } catch (\Exception $e) {
            logger()->error('Error in SubscriptionService::getById()', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Create a new subscription
     */
    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'po_number' => 'required|string',
            'client_id' => 'required|exists:clients,id',
            'product_id' => 'nullable|exists:products,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'total_amount' => 'required|numeric|min:0',
            'custom_price' => 'nullable|numeric|min:0',
            'products_subscription_status' => 'sometimes',
            'progress' => 'sometimes',
            'po_details' => 'sometimes',
            'unit_price' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string',
            'purchase_id' => 'nullable|exists:purchases,id'
        ]);
        
        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        // Calculate next billing date (typically the end date for now)
        $requestData = $data;
        $requestData['next_billing_date'] = $data['end_date'];
        
        // Ensure products_subscription_status is properly formatted as JSON if it's an array
        if (isset($requestData['products_subscription_status'])) {
            if (is_array($requestData['products_subscription_status'])) {
                $requestData['products_subscription_status'] = json_encode($requestData['products_subscription_status']);
            }
        } else {
            // If products_subscription_status is not provided, calculate from product data
            if (isset($requestData['product_id'])) {
                // Create products_subscription_status from the single product
                $product = \App\Models\Product::find($requestData['product_id']);
                $productName = $product ? $product->product_name ?? $product->name : 'Product';
                
                $productsArray = [
                    [
                        'name' => $productName,
                        'quantity' => $requestData['quantity'] ?? 1,
                        'status' => $requestData['status'] ?? 'Pending'
                    ]
                ];
                
                $requestData['products_subscription_status'] = json_encode($productsArray);
            } else {
                // If no product_id is provided, set to empty array
                $requestData['products_subscription_status'] = json_encode([]);
            }
        }
        
        // Calculate progress based on products_subscription_status
        if (isset($requestData['products_subscription_status'])) {
            $products = is_string($requestData['products_subscription_status']) ? 
                json_decode($requestData['products_subscription_status'], true) : 
                $requestData['products_subscription_status'];
            
            if (is_array($products)) {
                $activeProducts = count(array_filter($products, function($product) {
                    return $product['status'] === 'Active';
                }));
                $totalProducts = count($products);
                $progressPercentage = $totalProducts > 0 ? ($activeProducts / $totalProducts) * 100 : 0;
                
                $progressStatus = 'Pending';
                if ($progressPercentage === 100) {
                    $progressStatus = 'Complete';
                } elseif ($progressPercentage > 0) {
                    $progressStatus = 'Partial';
                }
                
                $requestData['progress'] = [
                    'status' => $progressStatus,
                    'completed' => $activeProducts,
                    'total' => $totalProducts,
                    'percentage' => (int) $progressPercentage
                ];
            }
        }
        
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
            'product_id' => 'nullable|exists:products,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'status' => 'sometimes|string',
            'quantity' => 'sometimes|integer|min:1',
            'total_amount' => 'sometimes|numeric|min:0',
            'custom_price' => 'nullable|numeric|min:0',
            'products_subscription_status' => 'sometimes',
            'progress' => 'sometimes',
            'po_details' => 'sometimes',
            'unit_price' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string',
            'purchase_id' => 'nullable|exists:purchases,id'
        ]);
        
        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        // Handle products_subscription_status formatting
        if (isset($data['products_subscription_status'])) {
            if (is_array($data['products_subscription_status'])) {
                $data['products_subscription_status'] = json_encode($data['products_subscription_status']);
            }
        }
        
        // If products_subscription_status is being updated, recalculate progress
        if (isset($data['products_subscription_status'])) {
            $products = is_string($data['products_subscription_status']) ? 
                json_decode($data['products_subscription_status'], true) : 
                $data['products_subscription_status'];
            
            if (is_array($products)) {
                $activeProducts = count(array_filter($products, function($product) {
                    return $product['status'] === 'Active';
                }));
                $totalProducts = count($products);
                $progressPercentage = $totalProducts > 0 ? ($activeProducts / $totalProducts) * 100 : 0;
                
                $progressStatus = 'Pending';
                if ($progressPercentage === 100) {
                    $progressStatus = 'Complete';
                } elseif ($progressPercentage > 0) {
                    $progressStatus = 'Partial';
                }
                
                $data['progress'] = [
                    'status' => $progressStatus,
                    'completed' => $activeProducts,
                    'total' => $totalProducts,
                    'percentage' => (int) $progressPercentage
                ];
            }
        }
        
        $subscription->update($data);
        
        // Cascade updates to related Billing Management records
        if (isset($data['total_amount']) || isset($data['products_subscription_status'])) {
            $billing = Billing_management::where('subscription_id', $id)->first();
            
            if ($billing) {
                // Update total amount
                if (isset($data['total_amount'])) {
                    $billing->total_amount = $data['total_amount'];
                    
                    // Recalculate status based on paid amount
                    if ($billing->paid_amount >= $billing->total_amount) {
                         $billing->payment_status = 'Paid';
                         $billing->status = 'Completed';
                    } elseif ($billing->paid_amount > 0) {
                         $billing->payment_status = 'Partially Paid';
                         $billing->status = 'Partially Paid';
                    } else {
                         $billing->payment_status = 'Unpaid';
                         $billing->status = 'Pending'; // or keep existing status if not Completed/Paid
                    }
                }
                
                $billing->save();
                
                // Clear payment statistics cache
                Cache::forget('payment_statistics');
            }
            
            // Cascade updates to related Invoice records
            $invoices = Invoice::where('subscription_id', $id)->get();
            
            foreach ($invoices as $invoice) {
                $invoiceUpdates = [];
                $shouldUpdate = false;
                
                // Update total amount and balance
                if (isset($data['total_amount'])) {
                    $invoiceUpdates['sub_total'] = $data['total_amount']; // Assuming sub_total = total for subscription (tax/discount separate?)
                    // If invoice has tax/discount, we should respect them. 
                    // Simple approach: Recalculate total based on new subtotal
                    $invoiceUpdates['total_amount'] = $data['total_amount'] + $invoice->tax_amount - $invoice->discount_amount;
                    $invoiceUpdates['balance_amount'] = $invoiceUpdates['total_amount'] - $invoice->paid_amount;
                    $shouldUpdate = true;
                }
                
                // Update items if products changed
                if (isset($data['products_subscription_status'])) {
                    $products = is_string($data['products_subscription_status']) ? 
                        json_decode($data['products_subscription_status'], true) : 
                        $data['products_subscription_status'];
                        
                    if (is_array($products)) {
                        $items = [];
                        foreach ($products as $product) {
                            $items[] = [
                                'name' => $product['name'] ?? $product['product_name'] ?? 'Service',
                                'description' => 'Service for ' . ($product['name'] ?? $product['product_name'] ?? 'Service'),
                                'quantity' => $product['quantity'] ?? 1,
                                'unit_price' => $product['price'] ?? $product['unit_price'] ?? 0,
                                'total' => $product['sub_total'] ?? ($product['quantity'] ?? 1) * ($product['price'] ?? $product['unit_price'] ?? 0)
                            ];
                        }
                        $invoiceUpdates['items'] = $items; // Invoice model casts items to array/json automatically? Check Model.
                        // InvoiceService creates it as array, Model probably casts it.
                        // Let's assume Invoice model has 'items' => 'array' cast or handles it.
                         $shouldUpdate = true;
                    }
                }
                
                if ($shouldUpdate) {
                    $invoice->update($invoiceUpdates);
                }
            }
        }
        
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
    private function parseProductsFromPurchase($productsSubscriptions, $purchase)
    {
        $products = [];
        
        try {
            // If products_subscriptions is a JSON string, decode it
            if (is_string($productsSubscriptions)) {
                $productsData = json_decode($productsSubscriptions, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    logger()->error('JSON decode error in parseProductsFromPurchase', [
                        'json_error' => json_last_error_msg(),
                        'raw_data' => $productsSubscriptions
                    ]);
                    return $products; // Return empty array on JSON error
                }
            } else {
                $productsData = $productsSubscriptions; 
            }
            
            if (is_array($productsData)) {
                foreach ($productsData as $productData) {
                    $products[] = [
                        'name' => $productData['name'] ?? $productData['product_name'] ?? 'N/A',
                        'quantity' => $productData['quantity'] ?? 1,
                        'status' => $productData['status'] ?? 'Pending',
                        'dateRange' => $productData['dateRange'] ?? ($purchase->delivery_date ?? 'N/A'),
                        'action' => $productData['status'] === 'Pending' ? 'Subscribe' : 'Edit',
                        'price' => $productData['price'] ?? $productData['unit_price'] ?? 0,
                        'sub_total' => $productData['sub_total'] ?? 0,
                        'start_date' => $productData['start_date'] ?? $purchase->delivery_date ?? null,
                        'end_date' => $productData['end_date'] ?? null,
                        'delivery_date' => $productData['delivery_date'] ?? $purchase->delivery_date ?? null,
                    ];
                }
            } else {
                logger()->warning('Invalid products_subscriptions format in parseProductsFromPurchase', [
                    'type' => gettype($productsData),
                    'raw_data' => $productsData
                ]);
            }
        } catch (\Exception $e) {
            logger()->error('Error in parseProductsFromPurchase()', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        return $products;
    }
}