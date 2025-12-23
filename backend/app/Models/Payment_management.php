<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment_management extends Model
{
    protected $fillable = [
        'po_number',
        'client_id',
        'date',
        'amount',
        'method',
        'transaction_id',
        'status',
        'receipt',
        'billing_id'
    ];
    
    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2'
    ];
    
    /**
     * Get the client that owns the payment.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
    
    /**
     * Get the billing record associated with the payment.
     */
    public function billing(): BelongsTo
    {
        return $this->belongsTo(Billing_management::class, 'billing_id');
    }
}
