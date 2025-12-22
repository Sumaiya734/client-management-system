<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency_rate extends Model
{
    protected $fillable = [
        'currency',
        'rate',
        'last_updated',
        'change',
        'trend'
    ];
}
