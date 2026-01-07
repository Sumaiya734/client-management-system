<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use App\Events\CurrencyRateChanged;
use App\Listeners\UpdateProductPricesOnCurrencyRateChange;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Register event listener for currency rate changes
        // When USD rate changes, automatically recalculate all product BDT prices
        Event::listen(
            CurrencyRateChanged::class,
            UpdateProductPricesOnCurrencyRateChange::class
        );
    }
}
