<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Billing_management;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BillingManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $billings = Billing_management::with('client', 'subscription', 'purchase')->get();
            
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'bill_number' => 'required|string|unique:billing_managements,bill_number',
                'client' => 'required|string',
                'po_number' => 'nullable|string',
                'bill_date' => 'required|date',
                'due_date' => 'required|date|after_or_equal:bill_date',
                'total_amount' => 'required|numeric|min:0',
                'paid_amount' => 'required|numeric|min:0|lte:total_amount',
                'status' => 'required|string|in:Draft,Pending,Overdue,Completed',
                'payment_status' => 'required|string|in:Unpaid,Partially Paid,Paid,Overpaid',
                'client_id' => 'nullable|exists:clients,id',
                'subscription_id' => 'nullable|exists:subscriptions,id',
                'purchase_id' => 'nullable|exists:purchases,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $billing = Billing_management::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing record created successfully'
            ], 201);
            
        } catch (\Exception $e) {
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
    public function show(string $id)
    {
        try {
            $billing = Billing_management::with('client', 'subscription', 'purchase')->find($id);

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
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $billing = Billing_management::find($id);

            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing record not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'bill_number' => 'sometimes|string|unique:billing_managements,bill_number,' . $id,
                'client' => 'sometimes|string',
                'po_number' => 'nullable|string',
                'bill_date' => 'sometimes|date',
                'due_date' => 'sometimes|date|after_or_equal:bill_date',
                'total_amount' => 'sometimes|numeric|min:0',
                'paid_amount' => 'sometimes|numeric|min:0|lte:total_amount',
                'status' => 'sometimes|string|in:Draft,Pending,Overdue,Completed',
                'payment_status' => 'sometimes|string|in:Unpaid,Partially Paid,Paid,Overpaid',
                'client_id' => 'nullable|exists:clients,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $billing->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing record updated successfully'
            ]);
            
        } catch (\Exception $e) {
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
    public function destroy(string $id)
    {
        try {
            $billing = Billing_management::find($id);

            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing record not found'
                ], 404);
            }

            $billing->delete();

            return response()->json([
                'success' => true,
                'message' => 'Billing record deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete billing record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search billing records with filters
     */
    public function search(Request $request)
    {
        try {
            $query = Billing_management::query();

            // Search by bill number, client, or PO number
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('bill_number', 'like', "%{$search}%")
                      ->orWhere('client', 'like', "%{$search}%")
                      ->orWhere('po_number', 'like', "%{$search}%");
                });
            }

            // Filter by status
            if ($request->has('status') && $request->get('status') !== 'All Status') {
                $query->where('payment_status', $request->get('status'));
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('bill_date', '>=', $request->get('start_date'));
            }
            
            if ($request->has('end_date')) {
                $query->where('bill_date', '<=', $request->get('end_date'));
            }

            $billings = $query->with('client', 'subscription', 'purchase')->get();

            return response()->json([
                'success' => true,
                'data' => $billings,
                'message' => 'Billing records retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search billing records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get billing summary statistics
     */
    public function summary()
    {
        try {
            $totalBills = Billing_management::count();
            $paidBills = Billing_management::where('payment_status', 'Paid')->count();
            $unpaidBills = Billing_management::where('payment_status', 'Unpaid')->count();
            $partiallyPaidBills = Billing_management::where('payment_status', 'Partially Paid')->count();
            
            $totalRevenue = Billing_management::sum('total_amount');
            $amountCollected = Billing_management::sum('paid_amount');
            $outstandingAmount = $totalRevenue - $amountCollected;

            return response()->json([
                'success' => true,
                'data' => [
                    'totalBills' => $totalBills,
                    'paidBills' => $paidBills,
                    'unpaidBills' => $unpaidBills,
                    'partiallyPaidBills' => $partiallyPaidBills,
                    'totalRevenue' => $totalRevenue,
                    'amountCollected' => $amountCollected,
                    'outstandingAmount' => $outstandingAmount
                ],
                'message' => 'Billing summary retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billing summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
