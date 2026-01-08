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

    /**
     * Search products
     */
    public function search(Request $request)
    {
        try {
            $searchTerm = $request->input('search', '');
            $category = $request->input('category', '');
            $status = $request->input('status', '');
            $limit = $request->input('limit', 50);

            $query = \App\Models\Product::query();

            // Apply search filter
            if (!empty($searchTerm)) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('product_name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('category', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('vendor', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Apply category filter
            if (!empty($category) && $category !== 'All Categories') {
                $query->where('category', $category);
            }

            // Apply status filter
            if (!empty($status) && $status !== 'All Status') {
                $query->where('status', $status);
            }

            $products = $query->orderBy('created_at', 'desc')->limit($limit)->get();

            return \App\Helpers\ResponseHelper::success($products, 'Products retrieved successfully');
        } catch (\Exception $e) {
            return \App\Helpers\ResponseHelper::error('Failed to search products', $e->getMessage());
        }
    }

}