<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CurrencyRateService;
use App\Events\CurrencyRateChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

            // Broadcast/internal event: notify listeners that a rate has been created
            try {
                event(new CurrencyRateChanged($currencyRate->currency, $currencyRate->rate, 'created'));
            } catch (\Throwable $e) {
                // Non-blocking: don't fail the request if broadcasting isn't configured
                Log::warning('Failed to dispatch CurrencyRateChanged event (create): ' . $e->getMessage());
            }

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

            // Broadcast/internal event: notify listeners that a rate has been updated
            try {
                event(new CurrencyRateChanged($currencyRate->currency, $currencyRate->rate, 'updated'));
            } catch (\Throwable $e) {
                // Non-blocking: don't fail the request if broadcasting isn't configured
                Log::warning('Failed to dispatch CurrencyRateChanged event (update): ' . $e->getMessage());
            }

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
            // Load the rate first so we can capture its currency/rate for broadcasting after delete
            $currencyRate = $this->currencyRateService->getById($id);
            $deletedCurrency = $currencyRate ? $currencyRate->currency : null;
            $deletedRateVal = $currencyRate ? $currencyRate->rate : null;

            $result = $this->currencyRateService->delete($id);

            // Broadcast/internal event: notify listeners that a rate has been deleted
            try {
                if ($deletedCurrency) {
                    event(new CurrencyRateChanged($deletedCurrency, $deletedRateVal, 'deleted'));
                }
            } catch (\Throwable $e) {
                Log::warning('Failed to dispatch CurrencyRateChanged event (delete): ' . $e->getMessage());
            }

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
    
    /**
     * Get exchange rate history
     */
    public function getHistory(Request $request)
    {
        try {
            $params = [
                'currency' => $request->get('currency'),
                'days' => $request->get('days'),
                'startDate' => $request->get('start_date'),
                'endDate' => $request->get('end_date')
            ];
            
            $history = $this->currencyRateService->getHistory($params);

            return response()->json([
                'success' => true,
                'data' => [
                    'history' => $history
                ],
                'message' => 'Exchange rate history retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve exchange rate history',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Log a rate change manually
     */
    public function logRateChange(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'currency' => 'required|string|max:10',
                'rate' => 'required|numeric',
                'previous_rate' => 'nullable|numeric',
                'change' => 'nullable|numeric',
                'percentage_change' => 'nullable|numeric',
                'trend' => 'nullable|in:up,down,stable',
                'date' => 'nullable|date',
                'updated_by' => 'nullable|exists:users,id'
            ]);
            
            $rateChange = $this->currencyRateService->logRateChange($validatedData);

            return response()->json([
                'success' => true,
                'data' => $rateChange,
                'message' => 'Rate change logged successfully'
            ], 201);

        } catch (\Exception $e) {
            // Extract validation errors if present
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $e->errors()
                ], 422);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to log rate change',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
