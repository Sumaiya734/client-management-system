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
        'subscription_type',
        'recurring_count',
        'delivery_date',
        'po_details',
        'cli_name',
        'products_subscriptions',
        'total_amount',
        'attachment',
    ];
    
    protected $casts = [
        'subscription_start' => 'date',
        'subscription_end' => 'date',
        'attachment' => 'string',
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
