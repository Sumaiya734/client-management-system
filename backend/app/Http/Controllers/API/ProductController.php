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

        // Store (Create) Rules -
        $this->storeRules = [
            'product_name'     => 'required|string|max:255',
            'vendor_type'      => 'nullable|string|max:255',
            'base_price'       => 'required|numeric|min:0',
            'base_currency'    => 'nullable|string|max:10',
            'bdt_price'        => 'nullable|numeric|min:0',
            'multi_currency'   => 'nullable|json', 
           
            'status'           => 'required|string|in:Active,Inactive',
            'description'      => 'nullable|string',
            'category'         => 'nullable|string|max:255',
            'vendor'           => 'nullable|string|max:255',
            'vendor_website'   => 'nullable|url|max:255',
            'profit_margin'    => 'nullable|numeric|min:0',
            'profit'           => 'nullable|numeric|min:0',
            'subscription_type'=> 'nullable|string|max:255',
            
        ];

        // Update Rules - 
        $this->updateRules = [
            'product_name'     => 'sometimes|string|max:255',
            'vendor_type'      => 'nullable|string|max:255',
            'base_price'       => 'sometimes|numeric|min:0',
            'base_currency'    => 'nullable|string|max:10',
            'bdt_price'        => 'nullable|numeric|min:0',
            'multi_currency'   => 'nullable|json',
            'status'           => 'sometimes|string|in:Active,Inactive',
            'description'      => 'nullable|string',
            'category'         => 'nullable|string|max:255',
            'vendor'           => 'nullable|string|max:255',
            'vendor_website'   => 'nullable|url|max:255',
            'profit_margin'    => 'nullable|numeric|min:0',
            'profit'           => 'nullable|numeric|min:0',
            'subscription_type'=> 'nullable|string|max:255',
        ];
    }

}