<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Subscription;
use Illuminate\Support\Facades\DB;

class SearchService extends BaseService
{
    protected $searchableModels = [
        'clients' => Client::class,
        'products' => Product::class,
        'purchases' => Purchase::class,
        'subscriptions' => Subscription::class,
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
        foreach ($searchableFields as $index => $field) {
            if ($index === 0) {
                $queryBuilder->where($field, 'LIKE', "%{$escapedQuery}%");
            } else {
                $queryBuilder->orWhere($field, 'LIKE', "%{$escapedQuery}%");
            }
        }

        // Add relationships if needed
        $withRelationships = $this->getWithRelationships($modelClass);
        if (!empty($withRelationships)) {
            // Use select with with() to avoid potential issues with relationships
            $queryBuilder->with($withRelationships);
        }

        try {
            return $queryBuilder->limit($limit)->get()->toArray();
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
            case Product::class:
                return ['product_name', 'description', 'category', 'vendor'];
            case Purchase::class:
                return ['po_number', 'status', 'cli_name'];
            case Subscription::class:
                return ['po_number', 'status', 'notes'];
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
            case Purchase::class:
                return ['client', 'product'];
            case Subscription::class:
                return ['client', 'product'];
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