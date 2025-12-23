<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PurchaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $purchases = Purchase::with(['client', 'product'])->get();
        
        return response()->json([
            'success' => true,
            'data' => $purchases
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'po_number' => 'required|string|unique:purchases',
            'status' => 'required|string',
            'client_id' => 'required|exists:clients,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'subscription_start' => 'required|date',
            'subscription_end' => 'required|date|after:subscription_start',
            'subscription_active' => 'boolean',
            'total_amount' => 'required|numeric|min:0'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Calculate total amount based on product price and quantity if not provided
        $requestData = $request->all();
        if (!isset($requestData['total_amount']) || $requestData['total_amount'] == 0) {
            $product = Product::find($request->product_id);
            if ($product) {
                $price = $product->bdt_price ?? $product->base_price ?? 0;
                $requestData['total_amount'] = $price * $request->quantity;
            }
        }
        
        $purchase = Purchase::create($requestData);
        
        return response()->json([
            'success' => true,
            'message' => 'Purchase created successfully',
            'data' => $purchase
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
        
        return response()->json([
            'success' => true,
            'data' => $purchase
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
        
        $validator = Validator::make($request->all(), [
            'po_number' => 'sometimes|string|unique:purchases,po_number,' . $id,
            'status' => 'sometimes|string',
            'client_id' => 'sometimes|exists:clients,id',
            'product_id' => 'sometimes|exists:products,id',
            'quantity' => 'sometimes|integer|min:1',
            'subscription_start' => 'sometimes|date',
            'subscription_end' => 'sometimes|date|after:subscription_start',
            'subscription_active' => 'sometimes|boolean',
            'total_amount' => 'sometimes|numeric|min:0'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Calculate total amount based on product price and quantity if not provided
        $requestData = $request->all();
        if (isset($requestData['product_id']) || isset($requestData['quantity'])) {
            if (!isset($requestData['total_amount']) || $requestData['total_amount'] == 0) {
                $productId = $requestData['product_id'] ?? $purchase->product_id;
                $quantity = $requestData['quantity'] ?? $purchase->quantity;
                
                $product = Product::find($productId);
                if ($product) {
                    $price = $product->bdt_price ?? $product->base_price ?? 0;
                    $requestData['total_amount'] = $price * $quantity;
                }
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
