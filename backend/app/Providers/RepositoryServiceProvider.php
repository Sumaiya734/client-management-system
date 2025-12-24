<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\BaseRepositoryInterface;
use App\Repositories\ClientRepository;
use App\Repositories\ProductRepository;
use App\Repositories\UserRepository;
use App\Models\Client;
use App\Models\Product;
use App\Models\User;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind specific repositories with their models
        $this->app->bind(ClientRepository::class, function ($app) {
            return new ClientRepository(new Client());
        });
        
        $this->app->bind(ProductRepository::class, function ($app) {
            return new ProductRepository(new Product());
        });
        
        $this->app->bind(UserRepository::class, function ($app) {
            return new UserRepository(new User());
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}