<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment_management extends Model
{
    protected $fillable = [
        'po_number',
        'client',
        'date',
        'amount',
        'method',
        'transaction_id',
        'status',
        'receipt'
    ];
}
