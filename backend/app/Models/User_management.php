<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User_management extends Model
{
    protected $fillable = [
        'name',
        'email',
        'role',
        'status',
        'last_login'
    ];
}
