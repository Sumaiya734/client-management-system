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

    /**
     * Create a new product with proper multi_currency handling
     */
    public function create(array $data)
    {
        // Process currencies data first (if present, it takes precedence over multi_currency)
        if (isset($data['currencies'])) {
            $data['multi_currency'] = $this->processCurrenciesData($data['currencies']);
        }
        // Then handle multi_currency data if present (but only if currencies wasn't provided)
        elseif (isset($data['multi_currency'])) {
            // Don't process it here, let Laravel's model casting handle it
            // The frontend sends JSON string, and Laravel will handle the conversion
        }

        return $this->repository->create($data);
    }

    /**
     * Update an existing product with proper multi_currency handling
     */
    public function update($id, array $data)
    {
        // Process currencies data first (if present, it takes precedence over multi_currency)
        if (isset($data['currencies'])) {
            $data['multi_currency'] = $this->processCurrenciesData($data['currencies']);
        }
        // Then handle multi_currency data if present (but only if currencies wasn't provided)
        elseif (isset($data['multi_currency'])) {
            // Don't process it here, let Laravel's model casting handle it
            // The frontend sends JSON string, and Laravel will handle the conversion
        }

        return $this->repository->update($id, $data);
    }

    /**
     * Search products with filters
     */
    public function search(Request $request)
    {
        return $this->repository->search($request);
    }

    /**
     * Paginate products with filters
     */
    public function paginate(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        return $this->repository->paginate($request, $perPage);
    }

    /**
     * Process currencies data to ensure proper format for storage
     */
    private function processCurrenciesData($currenciesData)
    {
        if (is_string($currenciesData)) {
            $decodedData = json_decode($currenciesData, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decodedData;
            }
        } elseif (is_array($currenciesData)) {
            return $currenciesData;
        }

        return $currenciesData;
    }
}