<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'product_name',
        'vendor_type',
        'base_price',
        'bdt_price',
        'multi_currency',
        'status'
    ];
}
