<?php

namespace App\Services;

use App\Repositories\ProductRepository;
use App\Services\CurrencyRateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
     * Recalculate BDT prices for all products based on current exchange rates
     * This is called when currency rates change to keep product prices up-to-date
     */
    public function recalculateAllProductPrices()
    {
        try {
            // Get all currency rates
            $currencyRates = $this->currencyRateService->getAll();
            $ratesMap = [];
            
            foreach ($currencyRates as $rate) {
                $ratesMap[$rate->currency] = $rate->rate;
            }
            
            // Get current USD rate as default for calculations
            $usdRateValue = $ratesMap['USD'] ?? 110.5;
            // Convert rate to "1 USD = X BDT" format if needed
            $usdToBdtRate = $usdRateValue;
            if ($usdRateValue < 1) {
                $usdToBdtRate = 1 / $usdRateValue;
            }
            
            $updatedCount = 0;

            // Get all products that have base_price and profit_margin
            // Use the Product model directly
            $products = \App\Models\Product::whereNotNull('base_price')
                ->whereNotNull('profit_margin')
                ->get();
            
            foreach ($products as $product) {
                $basePrice = (float) $product->base_price;
                $profitMargin = (float) $product->profit_margin;
                
                // Calculate using formula: base (USD) × rate (BDT) × (1 + profit%)
                $baseInBdt = $basePrice * $usdToBdtRate;
                $newBdtPrice = round($baseInBdt * (1 + $profitMargin / 100));
                
                // Update product BDT price
                $product->bdt_price = $newBdtPrice;
                
                // Update multi_currency prices if they exist
                if (!empty($product->multi_currency)) {
                    $multiCurrency = json_decode($product->multi_currency, true);
                    if (is_array($multiCurrency)) {
                        foreach ($multiCurrency as &$currencyData) {
                            if (isset($currencyData['code']) && isset($ratesMap[$currencyData['code']])) {
                                $currencyRate = $ratesMap[$currencyData['code']];
                                // Convert from base price (USD) to target currency
                                if ($currencyData['code'] === 'USD') {
                                    $currencyData['price'] = $basePrice * (1 + $profitMargin / 100);
                                } else {
                                    // First convert base price to BDT, then to target currency
                                    $priceInBdt = $basePrice * $usdToBdtRate;
                                    $targetCurrencyRate = $currencyRate;
                                    if ($currencyRate < 1) {
                                        $targetCurrencyRate = 1 / $currencyRate; // Convert to "1 unit = X BDT" format
                                    }
                                    $priceInTargetCurrency = $priceInBdt / $targetCurrencyRate;
                                    $currencyData['price'] = $priceInTargetCurrency * (1 + $profitMargin / 100);
                                }
                            }
                        }
                        $product->multi_currency = json_encode($multiCurrency);
                    }
                }
                
                $product->save();
                
                $updatedCount++;
            }

            Log::info("Recalculated prices for {$updatedCount} products using current exchange rates");
            return $updatedCount;
        } catch (\Exception $e) {
            Log::error('Error recalculating product prices: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Calculate prices for a specific product based on currency rates
     */
    public function calculateProductPrices($basePrice, $profitMargin, $multiCurrency = [])
    {
        // Get all currency rates
        $currencyRates = $this->currencyRateService->getAll();
        $ratesMap = [];
        
        foreach ($currencyRates as $rate) {
            $ratesMap[$rate->currency] = $rate->rate;
        }
        
        // Get USD to BDT rate
        $usdRateValue = $ratesMap['USD'] ?? 110.5;
        $usdToBdtRate = $usdRateValue;
        if ($usdRateValue < 1) {
            $usdToBdtRate = 1 / $usdRateValue;
        }
        
        // Calculate BDT price
        $baseInBdt = $basePrice * $usdToBdtRate;
        $bdtPrice = round($baseInBdt * (1 + $profitMargin / 100));
        
        // Update multi_currency prices if they exist
        $updatedMultiCurrency = $multiCurrency;
        if (is_array($multiCurrency)) {
            foreach ($updatedMultiCurrency as &$currencyData) {
                if (isset($currencyData['code']) && isset($ratesMap[$currencyData['code']])) {
                    $currencyRate = $ratesMap[$currencyData['code']];
                    // Convert from base price (USD) to target currency
                    if ($currencyData['code'] === 'USD') {
                        $currencyData['price'] = $basePrice * (1 + $profitMargin / 100);
                    } else {
                        // First convert base price to BDT, then to target currency
                        $priceInBdt = $basePrice * $usdToBdtRate;
                        $targetCurrencyRate = $currencyRate;
                        if ($currencyRate < 1) {
                            $targetCurrencyRate = 1 / $currencyRate; // Convert to "1 unit = X BDT" format
                        }
                        $priceInTargetCurrency = $priceInBdt / $targetCurrencyRate;
                        $currencyData['price'] = $priceInTargetCurrency * (1 + $profitMargin / 100);
                    }
                }
            }
        }
        
        return [
            'bdt_price' => $bdtPrice,
            'multi_currency' => $updatedMultiCurrency
        ];
    }
}