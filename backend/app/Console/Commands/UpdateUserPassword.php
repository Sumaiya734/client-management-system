<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdateUserPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-user-password {email} {password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update a user\'s password';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }
        
        $user->password = Hash::make($password);
        $user->save();
        
        $this->info("Password updated successfully for user: {$email}");
    }
}