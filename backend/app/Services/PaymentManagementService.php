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
            'transaction_id' => 'required|string|unique:payment_managements',
            'status' => 'required|string',
            'receipt' => 'required|string'
        ]);
        
        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        return $this->model->create($data);
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
            'transaction_id' => 'sometimes|string|unique:payment_managements,transaction_id,' . $id,
            'status' => 'sometimes|string',
            'receipt' => 'sometimes|string'
        ]);
        
        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }
        
        $payment->update($data);
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
        
        return $payment->delete();
    }
}