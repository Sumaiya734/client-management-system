<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment_management;
use App\Models\Client;
use App\Models\Billing_management;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PaymentManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $payments = Payment_management::with(['client', 'billing'])->get();
        
        return response()->json([
            'success' => true,
            'data' => $payments
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
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|string',
            'transaction_id' => 'required|string|unique:payment_managements',
            'status' => 'required|string',
            'receipt' => 'required|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $payment = Payment_management::create($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Payment created successfully',
            'data' => $payment
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $payment = Payment_management::with(['client', 'billing'])->find($id);
        
        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $payment = Payment_management::find($id);
        
        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'po_number' => 'sometimes|string',
            'client_id' => 'sometimes|exists:clients,id',
            'date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0',
            'method' => 'sometimes|string',
            'transaction_id' => 'sometimes|string|unique:payment_managements,transaction_id,' . $id,
            'status' => 'sometimes|string',
            'receipt' => 'sometimes|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $payment->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Payment updated successfully',
            'data' => $payment
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $payment = Payment_management::find($id);
        
        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }
        
        $payment->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Payment deleted successfully'
        ]);
    }
}
