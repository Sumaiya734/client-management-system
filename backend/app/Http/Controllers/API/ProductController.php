<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseAPIController;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ValidationHelper;
use App\Helpers\ResponseHelper;

class ProductController extends BaseAPIController
{
    protected $resourceName = 'Product';
    
    public function __construct(ProductService $productService)
    {
        $this->service = $productService;
        $this->storeRules = [
            'product_name' => 'required|string|max:255',
            'vendor_type' => 'nullable|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'bdt_price' => 'nullable|numeric|min:0',
            'multi_currency' => 'nullable|string',
            'status' => 'required|string|in:Active,Inactive',
        ];
    }
    
    public function update(Request $request, string $id)
    {
        try {
            $resource = $this->service->getById($id);

            if (!$resource) {
                return ResponseHelper::notFound($this->resourceName . ' not found');
            }

            // Define update rules
            $updateRules = [
                'product_name' => 'sometimes|string|max:255',
                'vendor_type' => 'nullable|string|max:255',
                'base_price' => 'sometimes|numeric|min:0',
                'bdt_price' => 'nullable|numeric|min:0',
                'multi_currency' => 'nullable|string',
                'status' => 'sometimes|string|in:Active,Inactive',
            ];

            $validationResult = ValidationHelper::validate($request->all(), $updateRules);
            
            if (!$validationResult['valid']) {
                return ResponseHelper::validationError($validationResult['errors']);
            }

            $updatedResource = $this->service->update($id, $validationResult['validated_data']);

            return ResponseHelper::success($updatedResource, $this->resourceName . ' updated successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to update ' . strtolower($this->resourceName), $e->getMessage());
        }
    }
}
