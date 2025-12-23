<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'po_details',
        'client',
        'products_subscription_status',
        'progress',
        'total_amount',
        'client_id',
        'product_id',
        'start_date',
        'end_date',
        'next_billing_date'
    ];
}
