<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    //
    protected $fillable = [
        'po_details',
        'client',
        'products_subscriptions',
        'total_amount',
        'status'
    ];
}
