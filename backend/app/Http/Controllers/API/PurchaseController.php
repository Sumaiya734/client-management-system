<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PurchaseService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PurchaseController extends Controller
{
    protected $purchaseService;
    
    public function __construct(PurchaseService $purchaseService)
    {
        $this->purchaseService = $purchaseService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $purchases = $this->purchaseService->getAll();

            return response()->json([
                'success' => true,
                'data' => $purchases
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve purchases: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve purchases',
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
            // Log request for debugging
            Log::info('Purchase store request', ['data' => $request->all()]);

            $purchase = $this->purchaseService->create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Purchase created successfully',
                'data' => $purchase
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Purchase creation failed: ' . $e->getMessage());
            
            if (strpos($e->getMessage(), 'Validation failed') !== false) {
                try {
                    $errorPart = substr($e->getMessage(), strpos($e->getMessage(), ':') + 1);
                    $errors = json_decode(trim($errorPart), true);
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation failed',
                        'errors' => $errors
                    ], 422);
                } catch (\Exception $jsonError) {
                    // If JSON decode fails, return the original message
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to create purchase',
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
            $purchase = $this->purchaseService->getById($id);
            
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
        } catch (\Exception $e) {
            Log::error('Failed to retrieve purchase: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve purchase',
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
            // Optional: prevent editing the PO number
            if ($request->has('po_number')) {
                $request->request->remove('po_number');
            }

            Log::info('Purchase update request', ['id' => $id, 'data' => $request->all()]);

            $purchase = $this->purchaseService->update($id, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Purchase updated successfully',
                'data' => $purchase
            ]);
            
        } catch (\Exception $e) {
            Log::error('Purchase update failed: ' . $e->getMessage());
            
            if (strpos($e->getMessage(), 'Validation failed') !== false) {
                try {
                    $errorPart = substr($e->getMessage(), strpos($e->getMessage(), ':') + 1);
                    $errors = json_decode(trim($errorPart), true);
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation failed',
                        'errors' => $errors
                    ], 422);
                } catch (\Exception $jsonError) {
                    // If JSON decode fails, return the original message
                }
            }

            if (strpos($e->getMessage(), 'Purchase not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Purchase not found'
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to update purchase',
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
            Log::info('Purchase delete request', ['id' => $id]);
            
            $result = $this->purchaseService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Purchase deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Purchase delete failed: ' . $e->getMessage());
            
            if (strpos($e->getMessage(), 'Purchase not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Purchase not found'
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete purchase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate the next PO number without creating a record
     */
    public function generatePoNumber(): JsonResponse
    {
        try {
            // Use the service method for PO number generation to maintain consistency
            $poNumber = $this->purchaseService->generatePoNumber();

            return response()->json([
                'success' => true,
                'data' => [
                    'po_number' => $poNumber
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate PO number: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PO number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get purchases by client ID
     */
    public function getByClient($clientId): JsonResponse
    {
        try {
            $purchases = $this->purchaseService->getByClientId($clientId);

            return response()->json([
                'success' => true,
                'data' => $purchases
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve client purchases: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve purchases for client',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get purchase by PO number
     */
    public function getByPoNumber($poNumber): JsonResponse
    {
        try {
            $purchase = $this->purchaseService->getByPoNumber($poNumber);
            
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
        } catch (\Exception $e) {
            Log::error('Failed to retrieve purchase by PO number: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve purchase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get purchase with related data (subscriptions, billing, payments)
     */
    public function getWithRelatedData($id): JsonResponse
    {
        try {
            $purchase = $this->purchaseService->getWithRelatedData($id);
            
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
        } catch (\Exception $e) {
            Log::error('Failed to retrieve purchase with related data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve purchase with related data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}