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
        'total_amount'
    ];
}
