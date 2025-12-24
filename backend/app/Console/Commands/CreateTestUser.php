<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class CreateTestUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-test-user {--email=} {--password=} {--name=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->option('email') ?? 'admin@example.com';
        $password = $this->option('password') ?? 'password';
        $name = $this->option('name') ?? 'Admin User';
        
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'admin',
            'status' => 'Active',
        ]);
        
        $this->info("Test user created successfully:");
        $this->info("Email: $email");
        $this->info("Password: $password");
        $this->info("ID: {$user->id}");
    }
}
