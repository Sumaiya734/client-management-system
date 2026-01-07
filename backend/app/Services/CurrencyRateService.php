<?php

namespace App\Services;

use App\Models\Currency_rate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            'currency' => 'sometimes|string|max:255|unique:currency_rates,currency,' . $id,
            'rate' => 'sometimes|numeric|min:0',
            'last_updated' => 'nullable|date',
            'change' => 'nullable|numeric',
            'trend' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            throw new \Exception('Validation error: ' . json_encode($validator->errors()));
        }

        $currencyRate->update($data);
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
}