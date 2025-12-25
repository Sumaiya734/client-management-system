<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseAPIController;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends BaseAPIController
{
    protected $resourceName = 'Product';

    public function __construct(ProductService $productService)
    {
        $this->service = $productService;

        // Store (Create) Rules - সব নতুন ফিল্ড যোগ করা হয়েছে
        $this->storeRules = [
            'product_name'     => 'required|string|max:255',
            'vendor_type'      => 'nullable|string|max:255',
            'base_price'       => 'required|numeric|min:0',
            'bdt_price'        => 'nullable|numeric|min:0',
            'multi_currency'   => 'nullable|json', // গুরুত্বপূর্ণ: array হলে json string পাঠাতে হবে
            // অথবা যদি array accept করতে চাও: 'nullable|array'
            'status'           => 'required|string|in:Active,Inactive',
            'description'      => 'nullable|string',
            'category'         => 'nullable|string|max:255',
            'vendor'           => 'nullable|string|max:255',
            'vendor_website'   => 'nullable|url|max:255',
            'profit_margin'    => 'nullable|numeric|min:0',
            'subscription_type'=> 'nullable|string|max:255', // নতুন কলাম যোগ করা
            // যদি currencies নামে আলাদা কলাম থাকে তাহলে যোগ করো
            // 'currencies'    => 'nullable|json',
        ];

        // Update Rules - সব ফিল্ড optional (sometimes বা nullable)
        $this->updateRules = [
            'product_name'     => 'sometimes|string|max:255',
            'vendor_type'      => 'nullable|string|max:255',
            'base_price'       => 'sometimes|numeric|min:0',
            'bdt_price'        => 'nullable|numeric|min:0',
            'multi_currency'   => 'nullable|json',
            'status'           => 'sometimes|string|in:Active,Inactive',
            'description'      => 'nullable|string',
            'category'         => 'nullable|string|max:255',
            'vendor'           => 'nullable|string|max:255',
            'vendor_website'   => 'nullable|url|max:255',
            'profit_margin'    => 'nullable|numeric|min:0',
            'subscription_type'=> 'nullable|string|max:255',
        ];
    }

    // যদি দরকার হয় তাহলে শুধু update ওভাররাইড করতে পারো, কিন্তু বেসেরটা পারফেক্ট কাজ করে
    // তাই কোনো মেথড ওভাররাইড করার দরকার নেই। index, show, destroy, paginate, search সব বেস থেকে আসবে।
}