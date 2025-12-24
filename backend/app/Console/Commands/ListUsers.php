<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class ListUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:list-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all users in the system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->info('No users found in the database.');
            return;
        }
        
        $headers = ['ID', 'Name', 'Email', 'Role', 'Status'];
        $data = [];
        
        foreach ($users as $user) {
            $data[] = [
                $user->id,
                $user->name,
                $user->email,
                $user->role ?? 'N/A',
                $user->status ?? 'N/A'
            ];
        }
        
        $this->table($headers, $data);
    }
}