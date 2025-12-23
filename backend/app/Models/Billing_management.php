<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Billing_management extends Model
{
    protected $fillable = [
        'bill_number',
        'client',
        'po_number',
        'bill_date',
        'due_date',
        'total_amount',
        'paid_amount',
        'status',
        'payment_status',
        'client_id',
        'subscription_id',
        'purchase_id'
    ];
    
    protected $casts = [
        'bill_date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];
    
    /**
     * Get the client that owns the billing record.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Client::class, 'client_id');
    }
    
    /**
     * Get the subscription associated with the billing record.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Subscription::class, 'subscription_id');
    }
    
    /**
     * Get the purchase associated with the billing record.
     */
    public function purchase(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Purchase::class, 'purchase_id');
    }
}
