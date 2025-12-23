<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'recipient',
        'client',
        'subject',
        'message',
        'method',
        'status',
        'sent_at',
        'client_id',
        'user_id'
    ];
    
    protected $casts = [
        'sent_at' => 'datetime',
    ];
    
    /**
     * Get the client that owns the notification.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Client::class, 'client_id');
    }
    
    /**
     * Get the user that owns the notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}
