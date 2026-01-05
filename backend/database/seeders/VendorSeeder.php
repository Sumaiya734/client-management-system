<?php

namespace Database\Seeders;

use App\Models\Vendor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Vendor::create([
            'name' => 'TechCorp Solutions',
            'company' => 'TechCorp Inc.',
            'email' => 'contact@techcorp.com',
            'phone' => '+1-555-1000',
            'contact_person' => 'Michael Johnson',
            'website' => 'https://techcorp.com',
            'address' => '100 Tech Street, Silicon Valley, CA',
            'status' => 'Active'
        ]);

        Vendor::create([
            'name' => 'AppSolutions Ltd',
            'company' => 'AppSolutions Limited',
            'email' => 'info@appsolutions.com',
            'phone' => '+1-555-2000',
            'contact_person' => 'Sarah Wilson',
            'website' => 'https://appsolutions.com',
            'address' => '200 App Avenue, New York, NY',
            'status' => 'Active'
        ]);

        Vendor::create([
            'name' => 'CloudExperts',
            'company' => 'Cloud Experts LLC',
            'email' => 'support@cloudexperts.com',
            'phone' => '+1-555-3000',
            'contact_person' => 'David Chen',
            'website' => 'https://cloudexperts.com',
            'address' => '300 Cloud Drive, Seattle, WA',
            'status' => 'Active'
        ]);

        Vendor::create([
            'name' => 'DataPro Services',
            'company' => 'DataPro Inc.',
            'email' => 'hello@datapro.com',
            'phone' => '+1-555-4000',
            'contact_person' => 'Lisa Rodriguez',
            'website' => 'https://datapro.com',
            'address' => '400 Data Lane, Austin, TX',
            'status' => 'Inactive'
        ]);
    }
}