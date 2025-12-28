<?php

namespace App\Http\Controllers;

use App\Models\Billing_management;
use App\Services\BillingManagementService;
use Illuminate\Http\Request;

class BillingManagementController extends Controller
{
    protected $billingService;
    
    public function __construct(BillingManagementService $billingService)
    {
        $this->billingService = $billingService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $billings = $this->billingService->getAll();
            
            return response()->json([
                'success' => true,
                'data' => $billings,
                'message' => 'Billing records retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billing records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $billing = $this->billingService->create($request->all());

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing record created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            // Extract validation errors from the exception message if present
            $errors = [];
            if (strpos($e->getMessage(), 'Validation error') !== false) {
                $errors = json_decode(substr($e->getMessage(), strpos($e->getMessage(), ':') + 1), true);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $errors
                ], 422);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create billing record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Billing_management $billing_management)
    {
        try {
            $billing = $this->billingService->getById($billing_management->id);

            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing record retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billing record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Billing_management $billing_management)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Billing_management $billing_management)
    {
        try {
            $billing = $this->billingService->update($billing_management->id, $request->all());

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing record updated successfully'
            ]);
            
        } catch (\Exception $e) {
            // Extract validation errors from the exception message if present
            $errors = [];
            if (strpos($e->getMessage(), 'Validation error') !== false) {
                $errors = json_decode(substr($e->getMessage(), strpos($e->getMessage(), ':') + 1), true);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $errors
                ], 422);
            }
            
            if (strpos($e->getMessage(), 'Billing record not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing record not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update billing record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Billing_management $billing_management)
    {
        try {
            $result = $this->billingService->delete($billing_management->id);

            return response()->json([
                'success' => true,
                'message' => 'Billing record deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Billing record not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing record not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete billing record',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
