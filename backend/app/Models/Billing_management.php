<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        'payment_status'
    ];
}
