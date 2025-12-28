<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CurrencyRateService;
use Illuminate\Http\Request;

class CurrencyRateController extends Controller
{
    protected $currencyRateService;
    
    public function __construct(CurrencyRateService $currencyRateService)
    {
        $this->currencyRateService = $currencyRateService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $currencyRates = $this->currencyRateService->getAll();
            
            return response()->json([
                'success' => true,
                'data' => $currencyRates,
                'message' => 'Currency rates retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve currency rates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $currencyRate = $this->currencyRateService->create($request->all());

            return response()->json([
                'success' => true,
                'data' => $currencyRate,
                'message' => 'Currency rate created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            // Extract validation errors from the exception message if present
            $errors = [];
            if (strpos($e->getMessage(), 'Validation error') !== false) {
                $errors = json_decode(substr($e->getMessage(), strpos($e->getMessage(), ':') + 1), true);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $errors
                ], 422);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create currency rate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $currencyRate = $this->currencyRateService->getById($id);

            if (!$currencyRate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency rate not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $currencyRate,
                'message' => 'Currency rate retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve currency rate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $currencyRate = $this->currencyRateService->update($id, $request->all());

            return response()->json([
                'success' => true,
                'data' => $currencyRate,
                'message' => 'Currency rate updated successfully'
            ]);
            
        } catch (\Exception $e) {
            // Extract validation errors from the exception message if present
            $errors = [];
            if (strpos($e->getMessage(), 'Validation error') !== false) {
                $errors = json_decode(substr($e->getMessage(), strpos($e->getMessage(), ':') + 1), true);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $errors
                ], 422);
            }
            
            if (strpos($e->getMessage(), 'Currency rate not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency rate not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update currency rate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $result = $this->currencyRateService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Currency rate deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Currency rate not found') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency rate not found'
                ], 404);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete currency rate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search currency rates with filters
     */
    public function search(Request $request)
    {
        try {
            $currencyRates = $this->currencyRateService->search($request);

            return response()->json([
                'success' => true,
                'data' => $currencyRates,
                'message' => 'Currency rates retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search currency rates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get currency rates summary
     */
    public function summary()
    {
        try {
            $summary = $this->currencyRateService->getSummary();

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Currency rates summary retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve currency rates summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}