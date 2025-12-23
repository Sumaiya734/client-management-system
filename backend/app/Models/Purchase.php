<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Purchase extends Model
{
    protected $fillable = [
        'po_number',
        'status',
        'client_id',
        'product_id',
        'quantity',
        'subscription_start',
        'subscription_end',
        'subscription_active',
        'po_details',
        'client',
        'products_subscriptions',
        'total_amount'
    ];
    
    protected $casts = [
        'subscription_start' => 'date',
        'subscription_end' => 'date',
        'subscription_active' => 'boolean',
        'total_amount' => 'decimal:2'
    ];
    
    /**
     * Get the client that owns the purchase.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
    
    /**
     * Get the product associated with the purchase.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
