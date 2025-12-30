<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'product_name',
        'subscription_type', 
        'vendor_type',        
        'base_price',
        'base_currency',
        'bdt_price',
        'multi_currency',
        'status',
        'description',        
        'category',          
        'vendor',            
        'vendor_website',    
        'profit_margin',     
        'profit',
    ];
    
    protected $casts = [
        'multi_currency' => 'array',
    ];
    
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}