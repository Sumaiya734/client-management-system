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
        'status'
    ];
}
