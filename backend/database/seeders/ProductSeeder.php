<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::create([
            'product_name' => 'Web Development Package',
            'description' => 'Complete web development solution with modern frameworks',
            'category' => 'Software Development',
            'vendor' => 'TechCorp',
            'base_price' => 2500.00,
            'base_currency' => 'USD',
            'bdt_price' => 300000.00,
            'status' => 'Active',
            'subscription_type' => '1',
            'multi_currency' => true,
            'profit_margin' => 20.00,
            'profit' => 500.00
        ]);

        Product::create([
            'product_name' => 'Mobile App Development',
            'description' => 'Cross-platform mobile application development',
            'category' => 'Mobile Development',
            'vendor' => 'AppSolutions',
            'base_price' => 3500.00,
            'base_currency' => 'USD',
            'bdt_price' => 420000.00,
            'status' => 'Active',
            'subscription_type' => '1',
            'multi_currency' => true,
            'profit_margin' => 25.00,
            'profit' => 875.00
        ]);

        Product::create([
            'product_name' => 'Cloud Infrastructure Setup',
            'description' => 'AWS/Azure cloud infrastructure configuration and deployment',
            'category' => 'Cloud Services',
            'vendor' => 'CloudExperts',
            'base_price' => 1800.00,
            'base_currency' => 'USD',
            'bdt_price' => 216000.00,
            'status' => 'Active',
            'subscription_type' => '1',
            'multi_currency' => true,
            'profit_margin' => 15.00,
            'profit' => 270.00
        ]);

        Product::create([
            'product_name' => 'Database Design & Optimization',
            'description' => 'Professional database design and performance optimization',
            'category' => 'Database Services',
            'vendor' => 'DataPro',
            'base_price' => 1200.00,
            'base_currency' => 'USD',
            'bdt_price' => 144000.00,
            'status' => 'Active',
            'subscription_type' => '1',
            'multi_currency' => true,
            'profit_margin' => 30.00,
            'profit' => 360.00
        ]);

        Product::create([
            'product_name' => 'SEO Optimization Package',
            'description' => 'Complete SEO audit and optimization service',
            'category' => 'Digital Marketing',
            'vendor' => 'MarketingPlus',
            'base_price' => 800.00,
            'base_currency' => 'USD',
            'bdt_price' => 96000.00,
            'status' => 'Inactive',
            'subscription_type' => '1',
            'multi_currency' => true,
            'profit_margin' => 40.00,
            'profit' => 320.00
        ]);
    }
}