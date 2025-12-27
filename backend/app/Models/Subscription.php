<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'po_number',
        'client_id',
        'product_id',
        'purchase_id',
        'start_date',
        'end_date',
        'status',
        'notes',
        'total_amount',
        'quantity',
        'next_billing_date',
        'po_details',
        'products_subscription_status',
        'progress'
    ];
    
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'next_billing_date' => 'date',
        'total_amount' => 'decimal:2',
        'products_subscription_status' => 'array',
        'progress' => 'array'
    ];
    
    /**
     * Get the client that owns the subscription.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
    
    /**
     * Get the product associated with the subscription.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
    
    /**
     * Get the purchase associated with the subscription.
     */
    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }
}