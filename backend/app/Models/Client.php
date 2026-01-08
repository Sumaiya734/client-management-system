<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'cli_name',
        'company',
        'email',
        'phone',
        'address',
        'status'
    ];
    
    protected $table = 'clients';
    
    // Define the relationship with subscriptions
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'client_id');
    }
}
