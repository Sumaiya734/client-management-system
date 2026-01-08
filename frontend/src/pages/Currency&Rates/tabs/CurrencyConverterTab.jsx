// src/pages/Currency/tabs/CurrencyConverterTab.js
import React, { useState, useEffect, useContext } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { currencyRatesApi } from '../../../api';

export default function CurrencyConverterTab() {
  const [converterData, setConverterData] = useState({
    amount: '100',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    result: ''
  });
  const [exchangeRates, setExchangeRates] = useState([]);
  const [currencies, setCurrencies] = useState(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY']);

  // Fetch exchange rates for converter
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await currencyRatesApi.getAll();
        if (response.data && Array.isArray(response.data)) {
          setExchangeRates(response.data);
          
          // Extract unique currencies from rates
          const uniqueCurrencies = [...new Set(response.data.map(rate => rate.currency))];
          if (uniqueCurrencies.length > 0) {
            setCurrencies(prev => [...new Set(['USD', ...uniqueCurrencies, ...prev])]);
          }
        }
      } catch (err) {
        console.error('Error fetching rates for converter:', err);
      }
    };

    fetchRates();
  }, []);

  // Handle input changes
  const handleConverterChange = (field, value) => {
    setConverterData(prev => ({
      ...prev,
      [field]: value,
      result: '' // Clear result when inputs change
    }));
  };

  // Handle currency conversion
  const handleConvert = () => {
    const amount = parseFloat(converterData.amount) || 0;
    let rate = 1;

    // Find the exchange rate from the loaded rates
    if (converterData.fromCurrency === 'USD' && converterData.toCurrency !== 'USD') {
      // From USD to other currency
      const rateEntry = exchangeRates.find(r => r.currency === converterData.toCurrency);
      if (rateEntry) {
        rate = parseFloat(rateEntry.rate);
      }
    } else if (converterData.toCurrency === 'USD' && converterData.fromCurrency !== 'USD') {
      // From other currency to USD
      const rateEntry = exchangeRates.find(r => r.currency === converterData.fromCurrency);
      if (rateEntry) {
        rate = 1 / parseFloat(rateEntry.rate);
      }
    } else if (converterData.fromCurrency !== 'USD' && converterData.toCurrency !== 'USD') {
      // Between two non-USD currencies
      const fromRateEntry = exchangeRates.find(r => r.currency === converterData.fromCurrency);
      const toRateEntry = exchangeRates.find(r => r.currency === converterData.toCurrency);

      if (fromRateEntry && toRateEntry) {
        const fromToUsdRate = 1 / parseFloat(fromRateEntry.rate); // How much USD equals 1 fromCurrency
        const usdToToRate = parseFloat(toRateEntry.rate); // How much toCurrency equals 1 USD
        rate = fromToUsdRate * usdToToRate; // Combined rate
      }
    }

    const result = (amount * rate).toFixed(2);
    setConverterData(prev => ({
      ...prev,
      result: `${result} ${converterData.toCurrency}`
    }));
  };

  // Swap currencies
  const handleSwapCurrencies = () => {
    setConverterData(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
      result: ''
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
        <CardDescription>Convert between different currencies using current rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={converterData.amount}
              onChange={(e) => handleConverterChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
          </div>

          {/* From Currency */}
          <div>
            <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <select
              id="fromCurrency"
              value={converterData.fromCurrency}
              onChange={(e) => handleConverterChange('fromCurrency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapCurrencies}
              title="Swap currencies"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* To Currency */}
          <div>
            <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <select
              id="toCurrency"
              value={converterData.toCurrency}
              onChange={(e) => handleConverterChange('toCurrency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Convert Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleConvert} className="bg-gray-900 text-white hover:bg-gray-800">
            Convert
          </Button>
        </div>

        {/* Result */}
        {converterData.result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Converted Amount</p>
              <p className="text-2xl font-bold text-gray-900">{converterData.result}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}