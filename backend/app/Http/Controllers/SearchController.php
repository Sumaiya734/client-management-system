<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    protected $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * Perform search across multiple models
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request)
    {
        try {
            $query = $request->input('q', '');
            $models = $request->input('models', []); // Optional: specify which models to search
            $limit = $request->input('limit', 10); // Optional: limit results per model

            // Validate inputs
            if (empty($query)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search query is required',
                    'data' => []
                ], 400);
            }

            // Ensure models is an array if provided
            if (!is_array($models)) {
                $models = [$models];
            }

            // Perform the search
            try {
                $results = $this->searchService->search($query, $models, $limit);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Search service error: ' . $e->getMessage());
                \Illuminate\Support\Facades\Log::error('Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
                throw $e; // Re-throw the exception to be caught by the outer try-catch
            }

            return response()->json([
                'success' => true,
                'message' => 'Search completed successfully',
                'data' => $results,
                'query' => $query,
                'total_models_searched' => count($results),
                'total_results' => array_sum(array_map(function($modelResults) {
                    return count($modelResults['results']);
                }, $results))
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get list of searchable models
     * 
     * @return JsonResponse
     */
    public function getSearchableModels()
    {
        try {
            $models = $this->searchService->getSearchableModels();

            return response()->json([
                'success' => true,
                'data' => $models
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get searchable models: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
}