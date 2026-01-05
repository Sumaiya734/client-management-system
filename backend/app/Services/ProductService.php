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
        // Store original base_price to ensure it's not overwritten during currency processing
        $originalBasePrice = $data['base_price'] ?? null;
        
        // Process currencies data first (if present, it takes precedence over multi_currency)
        if (isset($data['currencies'])) {
            $data['multi_currency'] = $this->processCurrenciesData($data['currencies']);
        }
        // Then handle multi_currency data if present (but only if currencies wasn't provided)
        elseif (isset($data['multi_currency'])) {
            // If multi_currency is a JSON string from frontend, decode it to array
            if (is_string($data['multi_currency'])) {
                $decodedData = json_decode($data['multi_currency'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data['multi_currency'] = $decodedData;
                }
            }
        }
        
        // Ensure base_price is preserved after currency processing
        if ($originalBasePrice !== null) {
            $data['base_price'] = $originalBasePrice;
        }
        
        // Ensure base_price is numeric and not a currency code
        if (isset($data['base_price'])) {
            $basePrice = $data['base_price'];
            // If base_price looks like a currency code (non-numeric), preserve the original value
            if (!is_numeric($basePrice)) {
                $data['base_price'] = $originalBasePrice ?? 0;
            } else {
                $data['base_price'] = (float) $basePrice;
            }
        }

        // Calculate profit if base_price and profit_margin are provided
        if (isset($data['base_price']) && isset($data['profit_margin'])) {
            $basePrice = (float) $data['base_price'];
            $profitMargin = (float) $data['profit_margin'];
            $data['profit'] = $basePrice * ($profitMargin / 100);
            
            // Calculate BDT price based on base_price with profit margin applied and converted to BDT
            // Using exchange rate of 110.5 (this should ideally come from settings or be configurable)
            $finalUSD = $basePrice * (1 + $profitMargin / 100);
            $bdtRate = 110.5; // This should be configurable
            $data['bdt_price'] = round($finalUSD * $bdtRate);
        }

        return $this->repository->create($data);
    }

    /**
     * Update an existing product with proper multi_currency handling
     */
    public function update($id, array $data)
    {
        // Store original base_price to ensure it's not overwritten during currency processing
        $originalBasePrice = $data['base_price'] ?? null;
        
        // Process currencies data first (if present, it takes precedence over multi_currency)
        if (isset($data['currencies'])) {
            $data['multi_currency'] = $this->processCurrenciesData($data['currencies']);
        }
        // Then handle multi_currency data if present (but only if currencies wasn't provided)
        elseif (isset($data['multi_currency'])) {
            // If multi_currency is a JSON string from frontend, decode it to array
            if (is_string($data['multi_currency'])) {
                $decodedData = json_decode($data['multi_currency'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data['multi_currency'] = $decodedData;
                }
            }
        }
        
        // Ensure base_price is preserved after currency processing
        if ($originalBasePrice !== null) {
            $data['base_price'] = $originalBasePrice;
        }
        
        // Ensure base_price is numeric and not a currency code
        if (isset($data['base_price'])) {
            $basePrice = $data['base_price'];
            // If base_price looks like a currency code (non-numeric), preserve the original value
            if (!is_numeric($basePrice)) {
                $data['base_price'] = $originalBasePrice ?? 0;
            } else {
                $data['base_price'] = (float) $basePrice;
            }
        }

        // Calculate profit if base_price and profit_margin are provided
        if (isset($data['base_price']) && isset($data['profit_margin'])) {
            $basePrice = (float) $data['base_price'];
            $profitMargin = (float) $data['profit_margin'];
            $data['profit'] = $basePrice * ($profitMargin / 100);
            
            // Calculate BDT price based on base_price with profit margin applied and converted to BDT
            // Using exchange rate of 110.5 (this should ideally come from settings or be configurable)
            $finalUSD = $basePrice * (1 + $profitMargin / 100);
            $bdtRate = 110.5; // This should be configurable
            $data['bdt_price'] = round($finalUSD * $bdtRate);
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