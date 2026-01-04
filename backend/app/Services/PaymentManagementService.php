<?php

namespace App\Services;

use App\Models\Payment_management;
use App\Models\Client;
use App\Models\Billing_management;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PaymentManagementService extends BaseService
{
    protected $model;

    public function __construct(Payment_management $model)
    {
        $this->model = $model;
    }

    /**
     * Get all payments with relationships
     */
    public function getAll()
    {
        return $this->model->with(['client', 'billing'])->get();
    }

    /**
     * Get payment by ID with relationships
     */
    public function getById($id)
    {
        return $this->model->with(['client', 'billing'])->find($id);
    }

    /**
     * Create a new payment
     */
    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'po_number' => 'required|string',
            'client_id' => 'required|exists:clients,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|string',
            'transaction_id' => 'required|string',
            'status' => 'required|string',
            'receipt' => 'required|string'
        ]);
        
        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        $payment = $this->model->create($data);
        
        // Update billing record if payment is linked to a billing record
        if (isset($data['billing_id']) && $data['billing_id']) {
            $this->updateBillingPaymentStatus($data['billing_id'], $data['amount']);
        }
        
        return $payment;
    }

    /**
     * Update an existing payment
     */
    public function update($id, array $data)
    {
        $payment = $this->model->find($id);
        
        if (!$payment) {
            throw new \Exception('Payment not found');
        }
        
        $validator = Validator::make($data, [
            'po_number' => 'sometimes|string',
            'client_id' => 'sometimes|exists:clients,id',
            'date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0',
            'method' => 'sometimes|string',
            'transaction_id' => 'sometimes|string',
            'status' => 'sometimes|string',
            'receipt' => 'sometimes|string'
        ]);
        
        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        $oldAmount = $payment->amount;
        $payment->update($data);
        
        // Update billing record if payment is linked to a billing record
        if (isset($data['billing_id']) && $data['billing_id']) {
            $this->updateBillingPaymentStatus($data['billing_id'], $data['amount'] - $oldAmount);
        }
        
        return $payment;
    }

    /**
     * Delete a payment
     */
    public function delete($id)
    {
        $payment = $this->model->find($id);
        
        if (!$payment) {
            throw new \Exception('Payment not found');
        }
        
        $result = $payment->delete();
        
        // Update billing record if payment was linked to a billing record
        if ($payment->billing_id) {
            $this->updateBillingPaymentStatus($payment->billing_id, -$payment->amount);
        }
        
        return $result;
    }
    
    /**
     * Refresh payment statistics when billing records are updated
     */
    public function refreshPaymentStatistics()
    {
        // This method can be called from other services when billing records change
        // It returns the updated statistics
        return $this->getPaymentStatistics();
    }
    
    /**
     * Get payment statistics
     */
    public function getPaymentStatistics()
    {
        $completedPayments = $this->model->where('status', 'Completed')->get();
        $pendingPayments = $this->model->where('status', 'Pending')->get();
        
        $totalReceived = $completedPayments->sum('amount');
        $pendingAmount = $pendingPayments->sum('amount');
        
        // Calculate outstanding amounts from billing records
        $outstandingAmount = Billing_management::where('payment_status', '!=', 'Paid')->sum('total_amount') - 
                            Billing_management::where('payment_status', '!=', 'Paid')->sum('paid_amount');
        
        return [
            'total_received' => $totalReceived,
            'pending_payments' => $pendingAmount,
            'outstanding_balance' => $outstandingAmount,
            'upcoming_payments' => $this->calculateUpcomingPayments(),
            'total_transactions' => $this->model->count()
        ];
    }
    
    /**
     * Calculate upcoming payments based on next delivery dates
     */
    private function calculateUpcomingPayments()
    {
        // Get purchases with future delivery dates
        $futureDeliveries = \App\Models\Purchase::where('delivery_date', '>', now())
            ->where('status', '!=', 'Completed')
            ->sum('total_amount');
        
        // Get billing records with future due dates that are not paid
        $futureBills = Billing_management::where('due_date', '>', now())
            ->where('payment_status', '!=', 'Paid')
            ->sum('total_amount');
        
        return $futureDeliveries + $futureBills;
    }
    
    /**
     * Update billing payment status after payment
     */
    private function updateBillingPaymentStatus($billingId, $amountChange)
    {
        $billing = Billing_management::find($billingId);
        if (!$billing) return;
        
        $billing->paid_amount += $amountChange;
        
        // Update payment status based on paid amount
        if ($billing->paid_amount >= $billing->total_amount) {
            $billing->paid_amount = $billing->total_amount; // Cap at total amount
            $billing->payment_status = 'Paid';
            $billing->status = 'Completed';
        } elseif ($billing->paid_amount > 0 && $billing->paid_amount < $billing->total_amount) {
            $billing->payment_status = 'Partially Paid';
            $billing->status = 'Partially Paid';
        } else {
            $billing->payment_status = 'Unpaid';
            $billing->status = 'Pending';
        }
        
        $billing->save();
    }
}