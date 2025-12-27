<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PurchaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $purchases = Purchase::with(['client', 'product'])->get();
        
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
        
        return response()->json([
            'success' => true,
            'data' => $groupedPurchases
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Handle validation differently for single vs multiple products
        if ($request->has('products') && is_array($request->products) && count($request->products) > 0) {
            // Multiple products validation
            $validator = Validator::make($request->all(), [
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
            foreach ($request->products ?? [] as $index => $product) {
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
            $validator = Validator::make($request->all(), [
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
            if ($request->subscription_start && $request->subscription_end) {
                $startDate = new \DateTime($request->subscription_start);
                $endDate = new \DateTime($request->subscription_end);
                
                if ($startDate >= $endDate) {
                    $validator->errors()->add('subscription_end', 'Subscription end date must be after subscription start date.');
                }
            }
        }
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Generate PO number automatically in format PO-YYYY-xxxx
        $year = date('Y');
        $latestPO = Purchase::where('po_number', 'LIKE', "PO-$year-%")
                           ->orderByRaw('CAST(SUBSTRING(po_number, -4) AS UNSIGNED) DESC')
                           ->first();
        
        $sequenceNumber = 1;
        if ($latestPO) {
            $lastSequence = substr($latestPO->po_number, -4);
            $sequenceNumber = (int)$lastSequence + 1;
        }
        
        $poNumber = "PO-$year-" . str_pad($sequenceNumber, 4, '0', STR_PAD_LEFT);
        
        // Handle file upload if attachment is present
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('purchase_attachments', $fileName, 'public');
            $attachmentPath = $filePath;
        } else {
            $attachmentPath = null;
        }
        
        $purchases = [];
        $requestData = $request->all();
        
        // Automatically populate cli_name from client if client_id is provided
        $client = Client::find($request->client_id);
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
                    'client_id' => $request->client_id,
                    'cli_name' => $cliName,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'subscription_start' => $subscriptionStart,
                    'subscription_end' => $subscriptionEnd,
                    'subscription_active' => $requestData['subscription_active'] ?? false,
                    'total_amount' => $totalAmount,
                    'attachment' => $attachmentPath,
                    'po_details' => $requestData['po_details'] ?? null,
                    'products_subscriptions' => $requestData['products_subscriptions'] ?? null,
                ];
                
                $purchase = Purchase::create($purchaseData);
                $purchases[] = $purchase;
            }
        } else {
            // Single product - backward compatibility
            $product = Product::find($request->product_id);
            if ($product) {
                $price = $product->bdt_price ?? $product->base_price ?? 0;
                $totalAmount = $price * $request->quantity;
            } else {
                $totalAmount = 0;
            }
            
            $purchaseData = [
                'po_number' => $poNumber,
                'status' => $requestData['status'],
                'client_id' => $request->client_id,
                'cli_name' => $cliName,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'subscription_start' => $request->subscription_start,
                'subscription_end' => $request->subscription_end,
                'subscription_active' => $requestData['subscription_active'] ?? false,
                'total_amount' => $totalAmount,
                'attachment' => $attachmentPath,
                'po_details' => $requestData['po_details'] ?? null,
                'products_subscriptions' => $requestData['products_subscriptions'] ?? null,
            ];
            
            $purchase = Purchase::create($purchaseData);
            $purchases[] = $purchase;
        }
        
        return response()->json([
            'success' => true,
            'message' => count($purchases) > 1 ? 'Purchases created successfully' : 'Purchase created successfully',
            'data' => count($purchases) > 1 ? $purchases : $purchases[0]
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $purchase = Purchase::with(['client', 'product'])->find($id);
        
        if (!$purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Purchase not found'
            ], 404);
        }
        
        // Find all purchases with the same PO number
        $relatedPurchases = Purchase::where('po_number', $purchase->po_number)
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
        
        return response()->json([
            'success' => true,
            'data' => $consolidatedPurchase
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $purchase = Purchase::find($id);
        
        if (!$purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Purchase not found'
            ], 404);
        }
        
        // Handle validation differently for single vs multiple products
        if ($request->has('products') && is_array($request->products) && count($request->products) > 0) {
            // Multiple products validation
            $validator = Validator::make($request->all(), [
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
            foreach ($request->products ?? [] as $index => $product) {
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
            $validator = Validator::make($request->all(), [
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
            if ($request->subscription_start && $request->subscription_end) {
                $startDate = new \DateTime($request->subscription_start);
                $endDate = new \DateTime($request->subscription_end);
                
                if ($startDate >= $endDate) {
                    $validator->errors()->add('subscription_end', 'Subscription end date must be after subscription start date.');
                }
            }
        }
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Handle file upload if attachment is present
        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($purchase->attachment) {
                Storage::disk('public')->delete($purchase->attachment);
            }
            
            $file = $request->file('attachment');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('purchase_attachments', $fileName, 'public');
            $requestData['attachment'] = $filePath;
        } else {
            $requestData = $request->all();
        }
        
        // Automatically update cli_name from client if client_id is provided
        if (isset($requestData['client_id'])) {
            $client = Client::find($requestData['client_id']);
            if ($client) {
                $requestData['cli_name'] = $client->cli_name ?? $client->name;
            }
        }
        
        $purchase->update($requestData);
        
        return response()->json([
            'success' => true,
            'message' => 'Purchase updated successfully',
            'data' => $purchase
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $purchase = Purchase::find($id);
        
        if (!$purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Purchase not found'
            ], 404);
        }
        
        $purchase->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Purchase deleted successfully'
        ]);
    }
}
