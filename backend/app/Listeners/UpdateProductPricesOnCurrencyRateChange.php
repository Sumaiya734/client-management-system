<?php

namespace App\Listeners;

use App\Events\CurrencyRateChanged;
use App\Services\ProductService;
use Illuminate\Support\Facades\Log;

class UpdateProductPricesOnCurrencyRateChange
{
    protected $productService;

    /**
     * Create the event listener.
     */
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Handle the event.
     * When USD currency rate changes, recalculate all product BDT prices
     */
    public function handle(CurrencyRateChanged $event)
    {
        // Only recalculate product prices when USD rate changes
        // Products are priced in USD, so USD rate changes affect BDT prices
        if ($event->currency === 'USD') {
            try {
                Log::info("USD rate changed to {$event->rate}, recalculating product prices...");
                $updatedCount = $this->productService->recalculateAllProductPrices();
                
                if ($updatedCount !== false) {
                    Log::info("Successfully recalculated BDT prices for {$updatedCount} products");
                } else {
                    Log::warning("Failed to recalculate product prices");
                }
            } catch (\Exception $e) {
                Log::error("Error recalculating product prices: " . $e->getMessage());
                // Don't throw exception - we don't want to break the currency rate update
            }
        }
    }
}

