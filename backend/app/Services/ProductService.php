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
        // Store originals
        $originalBasePrice = $data['base_price'] ?? null;
        $baseCurrency = $data['base_currency'] ?? 'USD';

        // Process multi_currency (same as before)
        if (isset($data['currencies'])) {
            $data['multi_currency'] = $this->processCurrenciesData($data['currencies']);
        } elseif (isset($data['multi_currency'])) {
            if (is_string($data['multi_currency'])) {
                $decodedData = json_decode($data['multi_currency'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data['multi_currency'] = $decodedData;
                }
            }
        }

        // Preserve base_price
        if ($originalBasePrice !== null) {
            $data['base_price'] = $originalBasePrice;
        }

        // Ensure numeric
        if (isset($data['base_price'])) {
            $basePrice = $data['base_price'];
            if (!is_numeric($basePrice)) {
                $data['base_price'] = $originalBasePrice ?? 0;
            } else {
                $data['base_price'] = (float) $basePrice;
            }
        }

        $data['base_currency'] = $baseCurrency;

        // Calculate profit and bdt_price using dynamic base currency
        if (isset($data['base_price']) && (isset($data['profit_margin']) || isset($data['profit']))) {
            $basePrice = (float) $data['base_price'];
            $profitMargin = (float) ($data['profit_margin'] ?? 0);

            if (isset($data['profit']) && $basePrice > 0) {
                $profitMargin = ((float)$data['profit'] / $basePrice) * 100;
                $data['profit_margin'] = $profitMargin;
            }

            $data['profit'] = $basePrice * ($profitMargin / 100);

            // Get rate for base_currency to BDT
            $rateRecord = $this->currencyRateService->getByCurrency($baseCurrency);
            $rateValue = $rateRecord ? $rateRecord->rate : ($baseCurrency === 'USD' ? 122.2 : 1); // fallback current rate ~122.2
            $baseToBdtRate = $rateValue < 1 ? 1 / $rateValue : $rateValue;

            $baseInBdt = $basePrice * $baseToBdtRate;
            $data['bdt_price'] = round($baseInBdt * (1 + $profitMargin / 100));
        }

        return $this->repository->create($data);
    }

    /**
     * Update an existing product (similar fixes as create)
     */
    public function update($id, array $data)
    {
        // Same logic as create
        $originalBasePrice = $data['base_price'] ?? null;
        $baseCurrency = $data['base_currency'] ?? null;

        if (isset($data['currencies'])) {
            $data['multi_currency'] = $this->processCurrenciesData($data['currencies']);
        } elseif (isset($data['multi_currency'])) {
            if (is_string($data['multi_currency'])) {
                $decodedData = json_decode($data['multi_currency'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data['multi_currency'] = $decodedData;
                }
            }
        }

        if ($originalBasePrice !== null) {
            $data['base_price'] = $originalBasePrice;
        }

        if (isset($data['base_price'])) {
            $basePrice = $data['base_price'];
            if (!is_numeric($basePrice)) {
                $data['base_price'] = $originalBasePrice ?? 0;
            } else {
                $data['base_price'] = (float) $basePrice;
            }
        }

        // If base_currency provided, use it; else fetch from existing product
        if ($baseCurrency) {
            $data['base_currency'] = $baseCurrency;
        } else {
            $existing = $this->repository->find($id);
            $data['base_currency'] = $existing->base_currency ?? 'USD';
        }

        if (isset($data['base_price']) && (isset($data['profit_margin']) || isset($data['profit']))) {
            $basePrice = (float) $data['base_price'];
            $profitMargin = (float) ($data['profit_margin'] ?? 0);

            if (isset($data['profit']) && $basePrice > 0) {
                $profitMargin = ((float)$data['profit'] / $basePrice) * 100;
                $data['profit_margin'] = $profitMargin;
            }

            $data['profit'] = $basePrice * ($profitMargin / 100);

            $baseCurrency = $data['base_currency'];
            $rateRecord = $this->currencyRateService->getByCurrency($baseCurrency);
            $rateValue = $rateRecord ? $rateRecord->rate : ($baseCurrency === 'USD' ? 122.2 : 1);
            $baseToBdtRate = $rateValue < 1 ? 1 / $rateValue : $rateValue;

            $baseInBdt = $basePrice * $baseToBdtRate;
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
        // unchanged
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
        // Updated to support any base_currency
        try {
            $currencyRates = $this->currencyRateService->getAll();
            $ratesMap = [];
            foreach ($currencyRates as $rate) {
                $toBdt = $rate->rate;
                if ($toBdt < 1) $toBdt = 1 / $toBdt;
                $ratesMap[$rate->currency] = $toBdt;
            }

            $products = \App\Models\Product::whereNotNull('base_price')
                ->whereNotNull('profit_margin')
                ->get();

            $updatedCount = 0;
            foreach ($products as $product) {
                $baseCurrency = $product->base_currency ?? 'USD';
                $baseToBdtRate = $ratesMap[$baseCurrency] ?? ($baseCurrency === 'USD' ? 122.2 : 1);

                $basePrice = (float) $product->base_price;
                $profitMargin = (float) $product->profit_margin;

                $baseInBdt = $basePrice * $baseToBdtRate;
                $newBdtPrice = round($baseInBdt * (1 + $profitMargin / 100));

                $product->bdt_price = $newBdtPrice;

                // Update multi_currency if needed (logic can be enhanced similarly)
                // ... (keep or improve as needed)

                $product->save();
                $updatedCount++;
            }

            Log::info("Recalculated prices for {$updatedCount} products");
            return $updatedCount;
        } catch (\Exception $e) {
            Log::error('Error recalculating: ' . $e->getMessage());
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
            $toBdt = $rate->rate;
            if ($toBdt < 1) $toBdt = 1 / $toBdt;
            $ratesMap[$rate->currency] = $toBdt;
        }
        
        // Calculate BDT price using base currency
        $baseCurrency = 'USD'; // Default, but could be passed as parameter
        $baseToBdtRate = $ratesMap[$baseCurrency] ?? 122.2;

        $baseInBdt = $basePrice * $baseToBdtRate;
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
                        $priceInBdt = $basePrice * $baseToBdtRate;
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