<?php

namespace App\Services;

use App\Models\Currency_rate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class CurrencyRateService extends BaseService
{
    protected $model;

    public function __construct(Currency_rate $model)
    {
        $this->model = $model;
    }

    /**
     * Get all currency rates
     */
    public function getAll()
    {
        return $this->model->all();
    }

    /**
     * Get currency rate by ID
     */
    public function getById($id)
    {
        return $this->model->find($id);
    }

    /**
     * Get currency rate by currency code
     */
    public function getByCurrency($currency)
    {
        return $this->model->where('currency', $currency)->first();
    }

    /**
     * Create a new currency rate
     */
    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'currency' => 'required|string|max:255|unique:currency_rates,currency',
            'rate' => 'required|numeric|min:0',
            'last_updated' => 'nullable|date',
            'change' => 'nullable|numeric',
            'trend' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation error: ' . json_encode($validator->errors()));
        }

        return $this->model->create($data);
    }

    /**
     * Update an existing currency rate
     */
    public function update($id, array $data)
    {
        $currencyRate = $this->model->find($id);

        if (!$currencyRate) {
            throw new \Exception('Currency rate not found');
        }

        $validator = Validator::make($data, [
            'currency' => 'sometimes|string|max:255|unique:currency_rates,currency,' . $id . ',id',
            'rate' => 'sometimes|numeric|min:0',
            'last_updated' => 'nullable|date',
            'change' => 'nullable|numeric',
            'trend' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation error: ' . json_encode($validator->errors()));
        }

        // Store original rate before update to log the change
        $previousRate = $currencyRate->rate;
        
        $currencyRate->update($data);
        
        // Log the rate change if the rate has changed
        $newRate = $currencyRate->rate;
        if ($previousRate != $newRate) {
            // Create a record in exchange_rate_history table
            $userId = Auth::check() ? Auth::id() : null; // Get the currently authenticated user ID
            
            $exchangeRateHistory = new \App\Models\ExchangeRateHistory();
            $exchangeRateHistory->currency = $currencyRate->currency;
            $exchangeRateHistory->rate = $newRate;
            $exchangeRateHistory->previous_rate = $previousRate;
            $exchangeRateHistory->change = $newRate - $previousRate;
            $exchangeRateHistory->percentage_change = $previousRate != 0 ? (($newRate - $previousRate) / $previousRate) * 100 : 0;
            $exchangeRateHistory->trend = $newRate > $previousRate ? 'up' : ($newRate < $previousRate ? 'down' : 'stable');
            $exchangeRateHistory->date = now()->toDateString();
            $exchangeRateHistory->timestamp = now();
            $exchangeRateHistory->updated_by = $userId;
            $exchangeRateHistory->save();
        }
        
        return $currencyRate;
    }

    /**
     * Delete a currency rate
     */
    public function delete($id)
    {
        $currencyRate = $this->model->find($id);

        if (!$currencyRate) {
            throw new \Exception('Currency rate not found');
        }

        return $currencyRate->delete();
    }

    /**
     * Search currency rates with filters
     */
    public function search(Request $request)
    {
        $query = $this->model->query();

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

        return $query->get();
    }

    /**
     * Get currency rates summary
     */
    public function getSummary()
    {
        $totalRates = $this->model->count();
        $highestRate = $this->model->max('rate');
        $lowestRate = $this->model->min('rate');
        
        $increasingTrend = $this->model->where('trend', 'up')->count();
        $decreasingTrend = $this->model->where('trend', 'down')->count();
        $stableTrend = $this->model->where('trend', 'stable')->count();

        return [
            'totalRates' => $totalRates,
            'highestRate' => $highestRate,
            'lowestRate' => $lowestRate,
            'increasingTrend' => $increasingTrend,
            'decreasingTrend' => $decreasingTrend,
            'stableTrend' => $stableTrend
        ];
    }
    
    /**
     * Get exchange rate history for a specific currency or all currencies
     */
    public function getHistory($params = [])
    {
        $query = \App\Models\ExchangeRateHistory::query();
        
        if (isset($params['currency']) && $params['currency'] !== 'ALL') {
            $query->where('currency', $params['currency']);
        }
        
        if (isset($params['days'])) {
            $days = $params['days'];
            $query->where('date', '>=', now()->subDays($days)->toDateString());
        }
        
        if (isset($params['startDate'])) {
            $query->where('date', '>=', $params['startDate']);
        }
        
        if (isset($params['endDate'])) {
            $query->where('date', '<=', $params['endDate']);
        }
        
        return $query->orderBy('date', 'desc')->orderBy('timestamp', 'desc')->get();
    }
    
    /**
     * Log a rate change manually
     */
    public function logRateChange(array $data)
    {
        return \App\Models\ExchangeRateHistory::create($data);
    }
}