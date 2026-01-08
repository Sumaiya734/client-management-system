<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency_rate extends Model
{
    protected $table = 'currency_rates';
    
    protected $fillable = [
        'currency',
        'rate',
        'last_updated',
        'change',
        'trend',
        'updated_by'
    ];
    
    protected $casts = [
        'rate' => 'decimal:4',
        'change' => 'decimal:4',
        'last_updated' => 'date',
    ];
    
    public function history(): HasMany
    {
        return $this->hasMany(ExchangeRateHistory::class, 'currency', 'currency');
    }
    

}
