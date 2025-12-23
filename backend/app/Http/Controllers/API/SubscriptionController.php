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
        
        return response()->json([
            'success' => true,
            'data' => $subscriptions
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
            'total_amount' => 'required|numeric|min:0'
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
        
        return response()->json([
            'success' => true,
            'data' => $subscription
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
            'total_amount' => 'sometimes|numeric|min:0'
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
}
