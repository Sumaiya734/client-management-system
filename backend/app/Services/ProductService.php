<?php

namespace App\Services;

use App\Repositories\ProductRepository;
use Illuminate\Http\Request;

class ProductService extends BaseService
{
    public function __construct(ProductRepository $productRepository)
    {
        parent::__construct($productRepository);
    }

    // The base service and repository handle all functionality now
    // Search and pagination are handled by the repository
}