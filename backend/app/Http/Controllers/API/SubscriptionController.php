<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    protected $subscriptionService;
    
    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $subscriptions = $this->subscriptionService->getAll();
            
            return response()->json([
                'success' => true,
                'data' => $subscriptions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subscriptions',
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
            $subscription = $this->subscriptionService->create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Subscription created successfully',
                'data' => $subscription
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
                'message' => 'Failed to create subscription',
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
            $subscription = $this->subscriptionService->getById($id);
            
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subscription',
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
            $subscription = $this->subscriptionService->update($id, $request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Subscription updated successfully',
                'data' => $subscription
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
            
            if (strpos($e->getMessage(), 'Subscription not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update subscription',
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
            $result = $this->subscriptionService->delete($id);
            
            return response()->json([
                'success' => true,
                'message' => 'Subscription deleted successfully'
            ]);
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Subscription not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subscription renewals
     */
    public function getRenewals(): JsonResponse
    {
        try {
            $renewals = $this->subscriptionService->getRenewals();
            
            return response()->json([
                'success' => true,
                'data' => $renewals
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subscription renewals',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
