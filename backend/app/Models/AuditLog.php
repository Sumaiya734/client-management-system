<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'action',
        'module',
        'details',
        'timestamp',
        'ip_address',
        'old_values',
        'new_values',
        'url',
        'user_agent'
    ];
    
    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'timestamp' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
