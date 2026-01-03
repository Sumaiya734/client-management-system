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
        'attachment' => 'string',
        'subscription_active' => 'boolean',
        'total_amount' => 'decimal:2',
        'po_details' => 'array'
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
    
    /**
     * Get the subscriptions for the purchase.
     */
    public function subscription()
    {
        return $this->hasOne(Subscription::class, 'purchase_id');
    }
    
    /**
     * Get the billing records for the purchase.
     */
    public function billing()
    {
        return $this->hasMany(Billing_management::class, 'purchase_id');
    }
    
    /**
     * Get the payment records for the purchase.
     */
    public function payment()
    {
        return $this->hasMany(Payment_management::class, 'purchase_id');
    }
    
    /**
     * Get the invoice records for the purchase.
     */
    public function invoice()
    {
        return $this->hasMany(Invoice::class, 'purchase_id');
    }
}
