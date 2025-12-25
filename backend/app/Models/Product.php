<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'product_name',
        'subscription_type', 
        'vendor_type',        
        'base_price',
        'bdt_price',
        'multi_currency',
        'status',
        'description',        
        'category',          
        'vendor',            
        'vendor_website',    
        'profit_margin',     
        'currencies'
    ];
    
    protected $casts = [
        'multi_currency' => 'array',
    ];
}