<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'total_revenue',
        'total_clients',
        'active_subscriptions',
        'avg_revenue_per_client'
    ];
}
