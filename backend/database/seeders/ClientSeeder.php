<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Client::create([
            'cli_name' => 'John Doe',
            'company' => 'Acme Corporation',
            'email' => 'john.doe@acme.com',
            'phone' => '+1-555-0123',
            'status' => 'Active'
        ]);

        Client::create([
            'cli_name' => 'Jane Smith',
            'company' => 'Tech Solutions Inc',
            'email' => 'jane.smith@techsolutions.com',
            'phone' => '+1-555-0456',
            'status' => 'Active'
        ]);

        Client::create([
            'cli_name' => 'Bob Johnson',
            'company' => 'Global Enterprises',
            'email' => 'bob.johnson@global.com',
            'phone' => '+1-555-0789',
            'status' => 'Active'
        ]);

        Client::create([
            'cli_name' => 'Alice Brown',
            'company' => 'Innovation Labs',
            'email' => 'alice.brown@innovation.com',
            'phone' => '+1-555-0321',
            'status' => 'Inactive'
        ]);
    }
}