<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductRepository extends BaseRepository
{
    public function __construct(Product $product)
    {
        parent::__construct($product);
    }

    public function search(Request $request)
    {
        $query = $this->model->newQuery();

        // Search by product name or description
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('vendor_type', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->get('category') !== 'All Categories') {
            $query->where('category', $request->get('category'));
        }
        
        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function paginate(Request $request, $perPage = 10)
    {
        $query = $this->model->newQuery();

        // Search by product name or description
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('vendor_type', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->get('category') !== 'All Categories') {
            $query->where('category', $request->get('category'));
        }
        
        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'All Status') {
            $query->where('status', $request->get('status'));
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}