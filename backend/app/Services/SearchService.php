<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Subscription;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class SearchService
{
    protected $searchableModels = [
        'clients' => Client::class,
        'products' => Product::class,
        'purchases' => Purchase::class,
        'subscriptions' => Subscription::class,
        'invoices' => Invoice::class,
        'vendors' => Vendor::class,
    ];

    /**
     * Perform search across multiple models
     * 
     * @param string $query The search query
     * @param array $models Models to search in (optional, if empty searches all)
     * @param int $limit Limit results per model
     * @return array Search results
     */
    public function search($query, $models = [], $limit = 10)
    {
        $query = trim($query);
        if (empty($query)) {
            return [];
        }
        
        // Minimum query length to prevent too broad searches
        if (strlen($query) < 2) {
            return [];
        }

        // Create cache key based on query, models, and limit
        $cacheKey = 'search_results_' . md5($query . '_' . serialize($models) . '_' . $limit);
        
        // Try to get results from cache
        $cachedResults = Cache::get($cacheKey);
        if ($cachedResults !== null) {
            return $cachedResults;
        }

        // If no specific models provided, search all
        if (empty($models)) {
            $models = array_keys($this->searchableModels);
        }

        $results = [];

        foreach ($models as $modelKey) {
            if (!isset($this->searchableModels[$modelKey])) {
                continue;
            }

            $modelClass = $this->searchableModels[$modelKey];
            $modelResults = $this->searchInModel($modelClass, $query, $limit);
            
            if (!empty($modelResults)) {
                $results[$modelKey] = [
                    'model' => $modelClass,
                    'results' => $modelResults
                ];
            }
        }

        // Cache results for 5 minutes
        Cache::put($cacheKey, $results, now()->addMinutes(5));

        return $results;
    }

    /**
     * Search in a specific model
     * 
     * @param string $modelClass Model class to search in
     * @param string $query Search query
     * @param int $limit Limit results
     * @return array Search results
     */
    private function searchInModel($modelClass, $query, $limit)
    {
        // Create cache key for this specific model search
        $cacheKey = 'search_model_results_' . md5($modelClass . '_' . $query . '_' . $limit);
        
        // Try to get results from cache
        $cachedResults = Cache::get($cacheKey);
        if ($cachedResults !== null) {
            return $cachedResults;
        }
        
        $model = new $modelClass();
        
        // Define searchable fields for each model
        $searchableFields = $this->getSearchableFields($modelClass);
        
        if (empty($searchableFields)) {
            return [];
        }

        $queryBuilder = $model->newQuery();

        // Escape special characters in the search query to prevent SQL issues
        $escapedQuery = addcslashes($query, '%_\\');

        // Build the search query
        $hasBaseConditions = false;
        foreach ($searchableFields as $index => $field) {
            // Check if this is a dot notation field (relationship.field)
            if (strpos($field, '.') !== false) {
                // This is a relationship field, we'll handle it separately
                continue;
            }
            
            if (!$hasBaseConditions) {
                $queryBuilder->where($field, 'LIKE', "%{$escapedQuery}%");
                $hasBaseConditions = true;
            } else {
                $queryBuilder->orWhere($field, 'LIKE', "%{$escapedQuery}%");
            }
        }
        
        // Handle relationship-based searches
        $relationshipFields = $this->getRelationshipSearchableFields($modelClass);
        if (!empty($relationshipFields)) {
            foreach ($relationshipFields as $relationship => $fields) {
                $queryBuilder->orWhereHas($relationship, function ($q) use ($fields, $escapedQuery) {
                    $q->where(function ($subQuery) use ($fields, $escapedQuery) {
                        foreach ($fields as $index => $field) {
                            if ($index === 0) {
                                $subQuery->where($field, 'LIKE', "%{$escapedQuery}%");
                            } else {
                                $subQuery->orWhere($field, 'LIKE', "%{$escapedQuery}%");
                            }
                        }
                    });
                });
            }
        }

        // Add relationships if needed
        $withRelationships = $this->getWithRelationships($modelClass);
        if (!empty($withRelationships)) {
            // Use select with with() to avoid potential issues with relationships
            $queryBuilder->with($withRelationships);
        }

        try {
            $results = $queryBuilder->limit($limit)->get()->toArray();
            
            // Cache results for 2 minutes (shorter cache for individual models)
            Cache::put($cacheKey, $results, now()->addMinutes(2));
            
            return $results;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Search query failed: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error('Query SQL: ' . $queryBuilder->toSql(), $queryBuilder->getBindings());
            \Illuminate\Support\Facades\Log::error('Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            
            // Return empty array on error
            return [];
        }
    }

    /**
     * Get searchable fields for a model
     * 
     * @param string $modelClass Model class name
     * @return array Searchable fields
     */
    private function getSearchableFields($modelClass)
    {
        switch ($modelClass) {
            case Client::class:
                return ['cli_name', 'company', 'email', 'phone'];
            case Invoice::class:
                return ['invoice_number', 'po_number', 'client_name', 'status', 'payment_status'];
            case Product::class:
                return ['product_name', 'description', 'category', 'vendor'];
            case Purchase::class:
                return ['po_number', 'status', 'cli_name'];
            case Subscription::class:
                return ['po_number', 'status', 'notes'];
            case Vendor::class:
                return ['name', 'company', 'email', 'contact_person'];
            default:
                return [];
        }
    }

    /**
     * Get relationships to include for a model
     * 
     * @param string $modelClass Model class name
     * @return array Relationships to include
     */
    private function getWithRelationships($modelClass)
    {
        switch ($modelClass) {
            case Invoice::class:
                return ['client', 'subscription', 'purchase'];
            case Purchase::class:
                return ['client', 'product'];
            case Subscription::class:
                return ['client', 'product'];
            case Vendor::class:
                return ['products'];
            default:
                return [];
        }
    }
    
    /**
     * Get relationship searchable fields for a model
     * 
     * @param string $modelClass Model class name
     * @return array Relationship searchable fields
     */
    private function getRelationshipSearchableFields($modelClass)
    {
        switch ($modelClass) {
            case Invoice::class:
                return [
                    'client' => ['cli_name', 'company', 'email'],
                    'subscription' => ['po_number'],
                    'purchase' => ['po_number']
                ];
            case Purchase::class:
                return [
                    'client' => ['cli_name', 'company', 'email'],
                    'product' => ['product_name', 'description']
                ];
            case Subscription::class:
                return [
                    'client' => ['cli_name', 'company', 'email'],
                    'product' => ['product_name', 'description']
                ];
            case Vendor::class:
                return [
                    'products' => ['product_name', 'description']
                ];
            default:
                return [];
        }
    }

    /**
     * Get all searchable models
     * 
     * @return array List of searchable models
     */
    public function getSearchableModels()
    {
        return array_keys($this->searchableModels);
    }
}