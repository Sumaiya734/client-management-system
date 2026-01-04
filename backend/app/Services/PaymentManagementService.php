<?php

namespace App\Services;

use App\Models\Payment_management;
use App\Models\Client;
use App\Models\Billing_management;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

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
            'receipt' => 'required|string',
            'billing_id' => 'nullable|exists:billing_managements,id'
        ]);
        
        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        $payment = $this->model->create($data);
        
        // Update billing record if payment is linked to a billing record
        if (isset($data['billing_id']) && $data['billing_id']) {
            $this->updateBillingPaymentStatus($data['billing_id'], $data['amount']);
        }
        
        // Clear cached statistics
        Cache::forget('payment_statistics');
        
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
            'receipt' => 'sometimes|string',
            'billing_id' => 'nullable|exists:billing_managements,id'
        ]);
        
        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        $oldAmount = $payment->amount;
        $oldBillingId = $payment->billing_id;
        
        $payment->update($data);
        
        // Handle billing updates
        $newBillingId = $data['billing_id'] ?? $payment->billing_id;
        $newAmount = $data['amount'] ?? $payment->amount;
        
        // If billing ID changed, update both old and new billing records
        if ($oldBillingId && $oldBillingId != $newBillingId) {
            $this->updateBillingPaymentStatus($oldBillingId, -$oldAmount);
        }
        
        if ($newBillingId) {
            $amountChange = $oldBillingId == $newBillingId ? ($newAmount - $oldAmount) : $newAmount;
            $this->updateBillingPaymentStatus($newBillingId, $amountChange);
        }
        
        // Clear cached statistics
        Cache::forget('payment_statistics');
        
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
        
        // Update billing record if payment was linked to a billing record
        if ($payment->billing_id) {
            $this->updateBillingPaymentStatus($payment->billing_id, -$payment->amount);
        }
        
        $result = $payment->delete();
        
        // Clear cached statistics
        Cache::forget('payment_statistics');
        
        return $result;
    }
    
    /**
     * Refresh payment statistics when billing records are updated
     */
    public function refreshPaymentStatistics()
    {
        // Clear cached statistics to force refresh
        Cache::forget('payment_statistics');
        
        // Return fresh statistics
        return $this->getPaymentStatistics();
    }
    
    /**
     * Get payment statistics with caching
     */
    public function getPaymentStatistics()
    {
        return Cache::remember('payment_statistics', 300, function () {
            // Get payment statistics
            $completedPayments = $this->model->where('status', 'Completed')->sum('amount');
            $pendingPayments = $this->model->where('status', 'Pending')->sum('amount');
            $totalPayments = $this->model->sum('amount');
            
            // Calculate billing statistics
            $totalBillAmount = Billing_management::sum('total_amount');
            $totalPaidAmount = Billing_management::sum('paid_amount');
            $outstandingAmount = $totalBillAmount - $totalPaidAmount;
            
            // Get upcoming payments (bills due in next 30 days that aren't fully paid)
            $upcomingPayments = Billing_management::where('due_date', '>', now())
                ->where('due_date', '<=', now()->addDays(30))
                ->where('payment_status', '!=', 'Paid')
                ->sum('total_amount') - Billing_management::where('due_date', '>', now())
                ->where('due_date', '<=', now()->addDays(30))
                ->where('payment_status', '!=', 'Paid')
                ->sum('paid_amount');
            
            // Get overdue amounts
            $overdueAmount = Billing_management::where('due_date', '<', now())
                ->where('payment_status', '!=', 'Paid')
                ->sum('total_amount') - Billing_management::where('due_date', '<', now())
                ->where('payment_status', '!=', 'Paid')
                ->sum('paid_amount');
            
            return [
                'total_received' => round($completedPayments, 2),
                'pending_payments' => round($pendingPayments, 2),
                'outstanding_balance' => round($outstandingAmount, 2),
                'upcoming_payments' => round($upcomingPayments, 2),
                'overdue_amount' => round($overdueAmount, 2),
                'total_transactions' => $this->model->count(),
                'total_bill_amount' => round($totalBillAmount, 2),
                'collection_rate' => $totalBillAmount > 0 ? round(($totalPaidAmount / $totalBillAmount) * 100, 2) : 0
            ];
        });
    }
    
    /**
     * Update billing payment status after payment
     */
    private function updateBillingPaymentStatus($billingId, $amountChange)
    {
        $billing = Billing_management::find($billingId);
        if (!$billing) return;
        
        // Update paid amount
        $billing->paid_amount = max(0, $billing->paid_amount + $amountChange);
        
        // Ensure paid amount doesn't exceed total amount
        if ($billing->paid_amount > $billing->total_amount) {
            $billing->paid_amount = $billing->total_amount;
        }
        
        // Update payment status based on paid amount
        if ($billing->paid_amount >= $billing->total_amount) {
            $billing->payment_status = 'Paid';
            $billing->status = 'Completed';
        } elseif ($billing->paid_amount > 0) {
            $billing->payment_status = 'Partially Paid';
            $billing->status = 'Partially Paid';
        } else {
            $billing->payment_status = 'Unpaid';
            $billing->status = 'Pending';
        }
        
        // Check if overdue
        if ($billing->due_date < now() && $billing->payment_status !== 'Paid') {
            $billing->status = 'Overdue';
        }
        
        $billing->save();
        
        // Clear any cached statistics
        Cache::forget('payment_statistics');
    }
}