<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Subscription;
use App\Models\Purchase;
use App\Models\Client;
use App\Models\Billing_management;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class InvoiceService extends BaseService
{
    protected $model;

    public function __construct(Invoice $model)
    {
        $this->model = $model;
    }

    /**
     * Get all invoices with relationships
     */
    public function getAll()
    {
        return $this->model->with(['client', 'subscription', 'purchase', 'billing'])->get();
    }

    /**
     * Get invoice by ID with relationships
     */
    public function getById($id)
    {
        return $this->model->with(['client', 'subscription', 'purchase', 'billing'])->find($id);
    }

    /**
     * Create a new invoice
     */
    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'client_id' => 'required|exists:clients,id',
            'issue_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:issue_date',
            'items' => 'required|array',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'status' => 'in:Draft,Sent,Paid,Overdue,Cancelled',
            'payment_status' => 'in:Unpaid,Partially Paid,Paid'
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }

        // Generate invoice number
        $invoiceNumber = $this->generateInvoiceNumber();

        // Calculate amounts
        $items = $data['items'] ?? [];
        $subTotal = collect($items)->sum(function ($item) {
            return ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
        });

        $taxAmount = $data['tax_amount'] ?? 0;
        $discountAmount = $data['discount_amount'] ?? 0;
        $totalAmount = $subTotal + $taxAmount - $discountAmount;
        $paidAmount = $data['paid_amount'] ?? 0;
        $balanceAmount = $totalAmount - $paidAmount;

        // Get client details if not provided
        $client = Client::find($data['client_id']);
        $clientData = [
            'client_name' => $data['client_name'] ?? $client->company ?? $client->cli_name ?? $client->name ?? null,
            'client_address' => $data['client_address'] ?? $client->address ?? null,
            'client_email' => $data['client_email'] ?? $client->email ?? null,
            'client_phone' => $data['client_phone'] ?? $client->phone ?? null,
        ];

        $invoiceData = array_merge($data, [
            'invoice_number' => $invoiceNumber,
            'sub_total' => $subTotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'balance_amount' => $balanceAmount,
            'status' => $data['status'] ?? 'Draft',
            'payment_status' => $data['payment_status'] ?? 'Unpaid'
        ], $clientData);

        return $this->model->create($invoiceData);
    }

    /**
     * Update an existing invoice
     */
    public function update($id, array $data)
    {
        $invoice = $this->model->find($id);

        if (!$invoice) {
            throw new \Exception('Invoice not found');
        }

        $validator = Validator::make($data, [
            'client_id' => 'sometimes|exists:clients,id',
            'issue_date' => 'sometimes|date',
            'due_date' => 'sometimes|date|after_or_equal:issue_date',
            'items' => 'sometimes|array',
            'items.*.name' => 'sometimes|required|string',
            'items.*.quantity' => 'sometimes|required|numeric|min:0.01',
            'items.*.unit_price' => 'sometimes|required|numeric|min:0',
            'status' => 'in:Draft,Sent,Paid,Overdue,Cancelled',
            'payment_status' => 'in:Unpaid,Partially Paid,Paid'
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation failed: ' . json_encode($validator->errors()));
        }

        // Recalculate amounts if items are being updated
        if (isset($data['items'])) {
            $items = $data['items'];
            $subTotal = collect($items)->sum(function ($item) {
                return ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
            });

            $taxAmount = $data['tax_amount'] ?? $invoice->tax_amount;
            $discountAmount = $data['discount_amount'] ?? $invoice->discount_amount;
            $totalAmount = $subTotal + $taxAmount - $discountAmount;
            $paidAmount = $data['paid_amount'] ?? $invoice->paid_amount;
            $balanceAmount = $totalAmount - $paidAmount;

            $data = array_merge($data, [
                'sub_total' => $subTotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'balance_amount' => $balanceAmount
            ]);
        }

        $invoice->update($data);
        return $invoice;
    }

    /**
     * Delete an invoice
     */
    public function delete($id)
    {
        $invoice = $this->model->find($id);

        if (!$invoice) {
            throw new \Exception('Invoice not found');
        }

        return $invoice->delete();
    }

    /**
     * Generate a unique invoice number
     */
    private function generateInvoiceNumber()
    {
        $prefix = 'INV';
        $date = date('Ym');
        $lastInvoice = $this->model->where('invoice_number', 'LIKE', $prefix . '-' . $date . '-%')
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = intval(substr($lastInvoice->invoice_number, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . '-' . $date . '-' . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Generate invoice from subscription
     */
    public function generateFromSubscription($subscriptionId)
    {
        $subscription = Subscription::with(['client', 'product', 'purchase'])->find($subscriptionId);

        if (!$subscription) {
            throw new \Exception('Subscription not found');
        }

        // Get related purchase to get product details
        $purchase = $subscription->purchase;
        $client = $subscription->client;

        // Prepare invoice items from subscription/product
        $items = [];
        $subscriptionTotalAmount = $subscription->total_amount ?? $purchase->total_amount ?? 0;
        
        // Check for subscription specific products (from products_subscription_status)
        if ($subscription->products_subscription_status) {
             $products = is_string($subscription->products_subscription_status) ? 
                json_decode($subscription->products_subscription_status, true) : 
                $subscription->products_subscription_status;
                
             if (is_array($products)) {
                $items = [];
                // Recalculate total amount from active products to be safe
                $subscriptionTotalAmount = 0;
                
                foreach ($products as $product) {
                    $itemTotal = $product['sub_total'] ?? ($product['quantity'] ?? 1) * ($product['price'] ?? $product['unit_price'] ?? 0);
                    $subscriptionTotalAmount += $itemTotal;
                    
                    $items[] = [
                        'name' => $product['name'] ?? $product['product_name'] ?? 'Service',
                        'description' => 'Service for ' . ($product['name'] ?? $product['product_name'] ?? 'Service'),
                        'quantity' => $product['quantity'] ?? 1,
                        'unit_price' => $product['price'] ?? $product['unit_price'] ?? 0,
                        'total' => $itemTotal
                    ];
                }
             }
        }
        // Check next for direct product relationship
        elseif ($subscription->product) {
            $items[] = [
                'name' => $subscription->product->product_name ?? $subscription->product->name ?? 'Service',
                'description' => 'Subscription for ' . ($subscription->product->product_name ?? $subscription->product->name ?? 'Service'),
                'quantity' => $subscription->quantity ?? 1,
                'unit_price' => ($subscriptionTotalAmount) / ($subscription->quantity ?? 1),
                'total' => $subscriptionTotalAmount
            ];
        } 
        // Fallback to purchase products
        else {
            if ($purchase && $purchase->products_subscriptions) {
                $products = is_string($purchase->products_subscriptions) ? 
                    json_decode($purchase->products_subscriptions, true) : 
                    $purchase->products_subscriptions;
                
                if (is_array($products)) {
                    foreach ($products as $product) {
                        $items[] = [
                            'name' => $product['name'] ?? 'Service',
                            'description' => 'Service for ' . ($product['name'] ?? 'Service'),
                            'quantity' => $product['quantity'] ?? 1,
                            'unit_price' => $product['price'] ?? 0,
                            'total' => ($product['quantity'] ?? 1) * ($product['price'] ?? 0)
                        ];
                    }
                }
            }
        }

        // --- Generate or Retrieve Billing Record ---
        // Check if a billing record already exists for this subscription
        $billing = Billing_management::where('subscription_id', $subscription->id)->first();
        
        if (!$billing) {
            // Create a new Billing Record
            $billPrefix = 'BILL';
            $billDate = date('Ym');
            $lastBill = Billing_management::where('bill_number', 'LIKE', $billPrefix . '-' . $billDate . '-%')
                ->orderBy('bill_number', 'desc')
                ->first();
            
            if ($lastBill) {
                $billNum = intval(substr($lastBill->bill_number, -4));
                $newBillNum = $billNum + 1;
            } else {
                $newBillNum = 1;
            }
            $billNumber = $billPrefix . '-' . $billDate . '-' . str_pad($newBillNum, 4, '0', STR_PAD_LEFT);

            $billingData = [
                'bill_number' => $billNumber,
                'client' => $client->company ?? $client->cli_name ?? $client->name,
                'client_id' => $client->id,
                'subscription_id' => $subscription->id,
                'purchase_id' => $purchase->id ?? null,
                'po_number' => $subscription->po_number ?? $purchase->po_number ?? null,
                'bill_date' => now()->format('Y-m-d'),
                'due_date' => $subscription->end_date ?? now()->addDays(30)->format('Y-m-d'),
                'total_amount' => $subscriptionTotalAmount,
                'paid_amount' => 0,
                'status' => 'Pending',
                'payment_status' => 'Unpaid'
            ];
            
            $billing = Billing_management::create($billingData);
            
            // Clear payment statistics cache
            \Illuminate\Support\Facades\Cache::forget('payment_statistics');
        } else {
            // Update existing billing amount to ensure it matches subscription
            if ($billing->total_amount != $subscriptionTotalAmount) {
                $billing->total_amount = $subscriptionTotalAmount;
                // Adjust status if needed
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
                $billing->save();
            }
        }

        // Create invoice data
        $invoiceData = [
            'client_id' => $client->id,
            'client_name' => $client->company ?? $client->cli_name ?? $client->name,
            'client_address' => $client->address ?? null,
            'client_email' => $client->email ?? null,
            'client_phone' => $client->phone ?? null,
            'po_number' => $subscription->po_number ?? $purchase->po_number ?? null,
            'subscription_id' => $subscription->id,
            'purchase_id' => $purchase->id ?? null,
            'billing_id' => $billing->id, // Link to the billing record
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => $subscription->end_date ?? now()->addDays(30)->format('Y-m-d'),
            'items' => $items,
            'sub_total' => $subscriptionTotalAmount,
            'total_amount' => $subscriptionTotalAmount, // Assuming no tax/discount initially for generated invoices
            'balance_amount' => $subscriptionTotalAmount - ($billing->paid_amount ?? 0), 
            'paid_amount' => $billing->paid_amount ?? 0,
            'notes' => 'Invoice generated from subscription',
            'terms' => 'Payment is due within 30 days.',
            'status' => ($billing->payment_status == 'Paid') ? 'Paid' : 'Draft',
            'payment_status' => $billing->payment_status ?? 'Unpaid'
        ];

        return $this->create($invoiceData);
    }

    /**
     * Generate invoice from purchase
     */
    public function generateFromPurchase($purchaseId)
    {
        $purchase = Purchase::with(['client'])->find($purchaseId);

        if (!$purchase) {
            throw new \Exception('Purchase not found');
        }

        $client = $purchase->client;

        // Prepare invoice items from purchase
        $items = [];
        if ($purchase->products_subscriptions) {
            $products = is_string($purchase->products_subscriptions) ? 
                json_decode($purchase->products_subscriptions, true) : 
                $purchase->products_subscriptions;
            
            if (is_array($products)) {
                foreach ($products as $product) {
                    $items[] = [
                        'name' => $product['name'] ?? 'Product',
                        'description' => 'Product: ' . ($product['name'] ?? 'Product'),
                        'quantity' => $product['quantity'] ?? 1,
                        'unit_price' => $product['price'] ?? 0,
                        'total' => ($product['quantity'] ?? 1) * ($product['price'] ?? 0)
                    ];
                }
            }
        } else {
            // Fallback - create a generic item
            $items[] = [
                'name' => 'Purchase Order Items',
                'description' => 'Items from PO: ' . $purchase->po_number,
                'quantity' => 1,
                'unit_price' => $purchase->total_amount ?? 0,
                'total' => $purchase->total_amount ?? 0
            ];
        }

        // Create invoice data
        $invoiceData = [
            'client_id' => $client->id,
            'client_name' => $client->company ?? $client->cli_name ?? $client->name,
            'client_address' => $client->address ?? null,
            'client_email' => $client->email ?? null,
            'client_phone' => $client->phone ?? null,
            'po_number' => $purchase->po_number,
            'subscription_id' => null,
            'purchase_id' => $purchase->id,
            'billing_id' => null,
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'items' => $items,
            'notes' => 'Invoice generated from purchase order',
            'terms' => 'Payment is due within 30 days.',
            'status' => 'Draft',
            'payment_status' => 'Unpaid'
        ];

        return $this->create($invoiceData);
    }

    /**
     * Get invoices by client
     */
    public function getByClient($clientId)
    {
        return $this->model->with(['client', 'subscription', 'purchase', 'billing'])
            ->where('client_id', $clientId)
            ->get();
    }

    /**
     * Get invoices by status
     */
    public function getByStatus($status)
    {
        return $this->model->with(['client', 'subscription', 'purchase', 'billing'])
            ->where('status', $status)
            ->get();
    }
}