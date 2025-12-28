<?php

namespace App\Services;

use App\Models\Billing_management;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BillingManagementService extends BaseService
{
    protected $model;

    public function __construct(Billing_management $model)
    {
        $this->model = $model;
    }

    /**
     * Get all billing records with relationships
     */
    public function getAll()
    {
        return $this->model->with('client', 'subscription', 'purchase')->get();
    }

    /**
     * Get billing record by ID with relationships
     */
    public function getById($id)
    {
        return $this->model->with('client', 'subscription', 'purchase')->find($id);
    }

    /**
     * Create a new billing record
     */
    public function create(array $data)
    {
        $validator = Validator::make($data, [
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
            throw new \Exception('Validation error: ' . json_encode($validator->errors()));
        }

        return $this->model->create($data);
    }

    /**
     * Update an existing billing record
     */
    public function update($id, array $data)
    {
        $billing = $this->model->find($id);

        if (!$billing) {
            throw new \Exception('Billing record not found');
        }

        $validator = Validator::make($data, [
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
            throw new \Exception('Validation error: ' . json_encode($validator->errors()));
        }

        $billing->update($data);
        return $billing;
    }

    /**
     * Delete a billing record
     */
    public function delete($id)
    {
        $billing = $this->model->find($id);

        if (!$billing) {
            throw new \Exception('Billing record not found');
        }

        return $billing->delete();
    }

    /**
     * Search billing records with filters
     */
    public function search(Request $request)
    {
        $query = $this->model->query();

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

        return $query->with('client', 'subscription', 'purchase')->get();
    }

    /**
     * Get billing summary statistics
     */
    public function getSummary()
    {
        $totalBills = $this->model->count();
        $paidBills = $this->model->where('payment_status', 'Paid')->count();
        $unpaidBills = $this->model->where('payment_status', 'Unpaid')->count();
        $partiallyPaidBills = $this->model->where('payment_status', 'Partially Paid')->count();
        
        $totalRevenue = $this->model->sum('total_amount');
        $amountCollected = $this->model->sum('paid_amount');
        $outstandingAmount = $totalRevenue - $amountCollected;

        return [
            'totalBills' => $totalBills,
            'paidBills' => $paidBills,
            'unpaidBills' => $unpaidBills,
            'partiallyPaidBills' => $partiallyPaidBills,
            'totalRevenue' => $totalRevenue,
            'amountCollected' => $amountCollected,
            'outstandingAmount' => $outstandingAmount
        ];
    }
}