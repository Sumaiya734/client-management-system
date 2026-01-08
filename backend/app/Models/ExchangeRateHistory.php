<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExchangeRateHistory extends Model
{
    protected $table = 'exchange_rate_history';
    
    // Disable Laravel's automatic updated_at timestamp since we only have created_at
    public $timestamps = false;
    
    protected $fillable = [
        'currency',
        'rate',
        'previous_rate',
        'change',
        'percentage_change',
        'trend',
        'date',
        'timestamp',
        'updated_by',
    ];
    
    protected $casts = [
        'rate' => 'decimal:4',
        'previous_rate' => 'decimal:4',
        'change' => 'decimal:4',
        'percentage_change' => 'decimal:2',
        'date' => 'date',
        'timestamp' => 'datetime',
        'created_at' => 'datetime',
    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
