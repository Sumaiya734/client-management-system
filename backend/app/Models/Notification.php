<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'recipient',
        'client',
        'subject',
        'method',
        'status',
        'sent_at'
    ];
}
