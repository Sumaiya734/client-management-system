<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ChangeUserRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:change-role {email} {role}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Change a user\'s role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $role = $this->argument('role');
        
        $user = DB::table('users')->where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }
        
        DB::table('users')->where('email', $email)->update(['role' => $role]);
        
        $this->info("User {$email} role changed to {$role} successfully.");
        
        return 0;
    }
}
