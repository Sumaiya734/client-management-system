<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Currency_rate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CurrencyRateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $currencyRates = Currency_rate::all();
            
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
            $validator = Validator::make($request->all(), [
                'currency' => 'required|string|max:255|unique:currency_rates,currency',
                'rate' => 'required|numeric|min:0',
                'last_updated' => 'nullable|date',
                'change' => 'nullable|numeric',
                'trend' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $currencyRate = Currency_rate::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $currencyRate,
                'message' => 'Currency rate created successfully'
            ], 201);
            
        } catch (\Exception $e) {
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
            $currencyRate = Currency_rate::find($id);

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
            $currencyRate = Currency_rate::find($id);

            if (!$currencyRate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency rate not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'currency' => 'sometimes|string|max:255|unique:currency_rates,currency,' . $id,
                'rate' => 'sometimes|numeric|min:0',
                'last_updated' => 'nullable|date',
                'change' => 'nullable|numeric',
                'trend' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $currencyRate->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $currencyRate,
                'message' => 'Currency rate updated successfully'
            ]);
            
        } catch (\Exception $e) {
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
            $currencyRate = Currency_rate::find($id);

            if (!$currencyRate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency rate not found'
                ], 404);
            }

            $currencyRate->delete();

            return response()->json([
                'success' => true,
                'message' => 'Currency rate deleted successfully'
            ]);
            
        } catch (\Exception $e) {
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
            $query = Currency_rate::query();

            // Search by currency code
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where('currency', 'like', "%{$search}%");
            }

            // Filter by trend
            if ($request->has('trend') && $request->get('trend') !== 'All Trends') {
                $query->where('trend', $request->get('trend'));
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('last_updated', '>=', $request->get('start_date'));
            }
            
            if ($request->has('end_date')) {
                $query->where('last_updated', '<=', $request->get('end_date'));
            }

            $currencyRates = $query->get();

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
            $totalRates = Currency_rate::count();
            $highestRate = Currency_rate::max('rate');
            $lowestRate = Currency_rate::min('rate');
            
            $increasingTrend = Currency_rate::where('trend', 'up')->count();
            $decreasingTrend = Currency_rate::where('trend', 'down')->count();
            $stableTrend = Currency_rate::where('trend', 'stable')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'totalRates' => $totalRates,
                    'highestRate' => $highestRate,
                    'lowestRate' => $lowestRate,
                    'increasingTrend' => $increasingTrend,
                    'decreasingTrend' => $decreasingTrend,
                    'stableTrend' => $stableTrend
                ],
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
