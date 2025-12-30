<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    protected $fillable = [
        'name',
        'company',
        'email',
        'phone',
        'address',
        'website',
        'contact_person',
        'status',
    ];
    
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
