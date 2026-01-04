<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentManagementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentManagementController extends Controller
{
    protected $paymentService;
    
    public function __construct(PaymentManagementService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $payments = $this->paymentService->getAll();
            $statistics = $this->paymentService->getPaymentStatistics();
            
            return response()->json([
                'success' => true,
                'data' => $payments,
                'statistics' => $statistics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $payment = $this->paymentService->create($request->all());
            $statistics = $this->paymentService->getPaymentStatistics();
            
            return response()->json([
                'success' => true,
                'message' => 'Payment created successfully',
                'data' => $payment,
                'statistics' => $statistics
            ], 201);
        } catch (\Exception $e) {
            // Extract validation errors from the exception message if present
            $errors = [];
            if (strpos($e->getMessage(), 'Validation failed') !== false) {
                $errors = json_decode(substr($e->getMessage(), strpos($e->getMessage(), ':') + 1), true);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $errors
                ], 422);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $payment = $this->paymentService->getById($id);
            
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $payment = $this->paymentService->update($id, $request->all());
            $statistics = $this->paymentService->getPaymentStatistics();
            
            return response()->json([
                'success' => true,
                'message' => 'Payment updated successfully',
                'data' => $payment,
                'statistics' => $statistics
            ]);
        } catch (\Exception $e) {
            // Extract validation errors from the exception message if present
            $errors = [];
            if (strpos($e->getMessage(), 'Validation failed') !== false) {
                $errors = json_decode(substr($e->getMessage(), strpos($e->getMessage(), ':') + 1), true);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $errors
                ], 422);
            }
            
            if (strpos($e->getMessage(), 'Payment not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $result = $this->paymentService->delete($id);
            $statistics = $this->paymentService->getPaymentStatistics();
            
            return response()->json([
                'success' => true,
                'message' => 'Payment deleted successfully',
                'statistics' => $statistics
            ]);
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Payment not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $statistics = $this->paymentService->getPaymentStatistics();
            
            return response()->json([
                'success' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}