<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Price extends Model
{
    protected $fillable = [
        'product_id',
        'currency',
        'amount',
        'billing_cycle',
        'is_active'
    ];
}
