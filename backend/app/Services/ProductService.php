<?php

namespace App\Services;

use App\Repositories\ProductRepository;
use App\Services\CurrencyRateService;
use Illuminate\Http\Request;

class ProductService extends BaseService
{
    protected $currencyRateService;

    public function __construct(ProductRepository $productRepository, CurrencyRateService $currencyRateService)
    {
        parent::__construct($productRepository);
        $this->currencyRateService = $currencyRateService;
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
            
            // Calculate BDT price using formula: base price × currency rate (BDT) × (1 + profit%)
            // Using dynamic exchange rate from currency rates
            $usdRate = $this->currencyRateService->getByCurrency('USD');
            if ($usdRate) {
                $rate = $usdRate->rate;
                // Convert rate to "1 USD = X BDT" format if needed
                // If rate < 1, it's "1 BDT = rate USD", convert to "1 USD = 1/rate BDT"
                if ($rate < 1) {
                    $usdToBdtRate = 1 / $rate;
                } else {
                    $usdToBdtRate = $rate; // Already in "1 USD = rate BDT" format
                }
            } else {
                $usdToBdtRate = 110.5; // Fallback: 1 USD = 110.5 BDT
            }
            
            // Formula: base (USD) × rate (BDT) × (1 + profit%)
            $baseInBdt = $basePrice * $usdToBdtRate;
            $data['bdt_price'] = round($baseInBdt * (1 + $profitMargin / 100));
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
            
            // Calculate BDT price using formula: base price × currency rate (BDT) × (1 + profit%)
            // Using dynamic exchange rate from currency rates
            $usdRate = $this->currencyRateService->getByCurrency('USD');
            if ($usdRate) {
                $rate = $usdRate->rate;
                // Convert rate to "1 USD = X BDT" format if needed
                // If rate < 1, it's "1 BDT = rate USD", convert to "1 USD = 1/rate BDT"
                if ($rate < 1) {
                    $usdToBdtRate = 1 / $rate;
                } else {
                    $usdToBdtRate = $rate; // Already in "1 USD = rate BDT" format
                }
            } else {
                $usdToBdtRate = 110.5; // Fallback: 1 USD = 110.5 BDT
            }
            
            // Formula: base (USD) × rate (BDT) × (1 + profit%)
            $baseInBdt = $basePrice * $usdToBdtRate;
            $data['bdt_price'] = round($baseInBdt * (1 + $profitMargin / 100));
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

    /**
     * Recalculate BDT prices for all products based on current USD exchange rate
     * This is called when currency rates change to keep product prices up-to-date
     */
    public function recalculateAllProductPrices()
    {
        try {
            // Get current USD rate
            $usdRate = $this->currencyRateService->getByCurrency('USD');
            if (!$usdRate) {
                \Log::warning('USD rate not found, cannot recalculate product prices');
                return false;
            }

            $bdtConversionRate = $usdRate->rate;
            $updatedCount = 0;

            // Get all products that have base_price and profit_margin
            // Use the Product model directly
            $products = \App\Models\Product::whereNotNull('base_price')
                ->whereNotNull('profit_margin')
                ->get();

            // Convert rate to "1 USD = X BDT" format if needed
            $usdToBdtRate = $bdtConversionRate;
            if ($bdtConversionRate < 1) {
                // Convert from "1 BDT = rate USD" to "1 USD = 1/rate BDT"
                $usdToBdtRate = 1 / $bdtConversionRate;
            }
            
            foreach ($products as $product) {
                $basePrice = (float) $product->base_price;
                $profitMargin = (float) $product->profit_margin;
                
                // Calculate using formula: base (USD) × rate (BDT) × (1 + profit%)
                $baseInBdt = $basePrice * $usdToBdtRate;
                $newBdtPrice = round($baseInBdt * (1 + $profitMargin / 100));
                
                // Update product BDT price
                $product->bdt_price = $newBdtPrice;
                $product->save();
                
                $updatedCount++;
            }

            \Log::info("Recalculated BDT prices for {$updatedCount} products using USD rate: {$bdtConversionRate}");
            return $updatedCount;
        } catch (\Exception $e) {
            \Log::error('Error recalculating product prices: ' . $e->getMessage());
            return false;
        }
    }
}