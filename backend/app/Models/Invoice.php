<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'client_id',
        'client_name',
        'client_address',
        'client_email',
        'client_phone',
        'po_number',
        'subscription_id',
        'purchase_id',
        'billing_id',
        'issue_date',
        'due_date',
        'sub_total',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'paid_amount',
        'balance_amount',
        'status',
        'payment_status',
        'notes',
        'terms',
        'items'
    ];
    
    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'sub_total' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'items' => 'array',
    ];
    
    /**
     * Get the client that owns the invoice.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
    
    /**
     * Get the subscription associated with the invoice.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_id');
    }
    
    /**
     * Get the purchase associated with the invoice.
     */
    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }
    
    /**
     * Get the billing record associated with the invoice.
     */
    public function billing(): BelongsTo
    {
        return $this->belongsTo(Billing_management::class, 'billing_id');
    }
}