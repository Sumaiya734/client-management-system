import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EditExchangeRatePopup from '../../components/Currency/EditExchangeRatePopup';
import { currencyRatesApi } from '../../api';

export default function CurrencyRates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  // Tab state management
  const [activeTab, setActiveTab] = useState('Current Rates');
  
  // Exchange rate popup state
  const [isRatePopupOpen, setIsRatePopupOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // API data state
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch exchange rates from API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        const response = await currencyRatesApi.getAll();
        
        // Check if response has the expected structure (after axios interceptor normalizes it)
        if (!response.data || !Array.isArray(response.data)) {
          console.error('API response does not have expected structure:', response);
          setExchangeRates([]);
          return;
        }
        
        // Transform the API response to match frontend format
        const transformedRates = response.data.map(rate => ({
          id: rate.id,
          currencyPair: `${rate.currency} / USD`,
          rate: rate.rate.toString(),
          lastUpdated: rate.last_updated,
          change: formatChangeDisplay(rate.change) || '+0.0000 (0.0%)',
          trend: rate.trend || 'stable'
        }));
        
        setExchangeRates(transformedRates);
        setError(null);
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        let errorMessage = 'Failed to load exchange rates';
        
        if (err.response?.data?.errors) {
          // Handle validation errors
          const errors = err.response.data.errors;
          if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(', ');
          } else {
            errorMessage = errors;
          }
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExchangeRates();
  }, []);

  // Currency converter state
  const [converterData, setConverterData] = useState({
    amount: '100',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    result: ''
  });
  
  // Helper function to extract numeric value from change string (e.g., '+0.0200 (+2.4%)' -> 0.0200)
  const extractNumericValue = (changeString) => {
    if (!changeString) return 0;
    const match = changeString.match(/([+-]?\d+\.\d+)/);
    return match ? parseFloat(match[1]) : 0;
  };
  
  // Helper function to format change value for display
  const formatChangeDisplay = (changeValue) => {
    if (typeof changeValue === 'string' && changeValue.includes('(')) {
      // Already in display format like '+0.0200 (+2.4%)'
      return changeValue;
    }
    
    // Convert numeric value to display format
    const numValue = parseFloat(changeValue) || 0;
    const percentage = (Math.abs(numValue) * 100).toFixed(1);
    const sign = numValue >= 0 ? '+' : '-';
    
    return `${sign}${Math.abs(numValue).toFixed(4)} (${sign}${percentage}%)`;
  };



  // Historical exchange rate data
  const rateHistory = [
    {
      date: '2025-01-15',
      eurUsd: '0.8300',
      gbpUsd: '0.7600',
      cadUsd: '1.3200',
      audUsd: '1.4400'
    },
    {
      date: '2025-01-16',
      eurUsd: '0.8400',
      gbpUsd: '0.7500',
      cadUsd: '1.3300',
      audUsd: '1.4300'
    },
    {
      date: '2025-01-17',
      eurUsd: '0.8400',
      gbpUsd: '0.7600',
      cadUsd: '1.3400',
      audUsd: '1.4400'
    },
    {
      date: '2025-01-18',
      eurUsd: '0.8500',
      gbpUsd: '0.7500',
      cadUsd: '1.3500',
      audUsd: '1.4500'
    },
    {
      date: '2025-01-19',
      eurUsd: '0.8300',
      gbpUsd: '0.7600',
      cadUsd: '1.3200',
      audUsd: '1.4400'
    },
    {
      date: '2025-01-20',
      eurUsd: '0.8500',
      gbpUsd: '0.7500',
      cadUsd: '1.3500',
      audUsd: '1.4500'
    }
  ];

  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const filters = [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
    }
  ];

  const tabs = [
    { id: 'Current Rates', label: 'Current Rates' },
    { id: 'Currency Converter', label: 'Currency Converter' },
    { id: 'Rate History', label: 'Rate History' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'];

  // Create empty rate template for setting new rates
  const createEmptyRate = () => ({
    id: Date.now(),
    currencyPair: 'EUR / USD',
    rate: '',
    lastUpdated: new Date().toISOString().split('T')[0],
    change: '+0.0000 (0.0%)',
    trend: 'up'
  });

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Handle opening popup for setting new rate
  const handleSetRate = () => {
    setEditingRate(createEmptyRate());
    setIsEditMode(false);
    setIsRatePopupOpen(true);
  };

  // Handle opening popup for editing existing rate
  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setIsEditMode(true);
    setIsRatePopupOpen(true);
  };

  // Handle closing rate popup
  const handleCloseRatePopup = () => {
    setIsRatePopupOpen(false);
    setEditingRate(null);
    setIsEditMode(false);
  };

  // Handle rate submit (both create and update)
  const handleRateSubmit = async (rateData) => {
    try {
      if (isEditMode) {
        // Update existing rate
        const rateToUpdate = exchangeRates.find(r => r.id === rateData.id);
        if (rateToUpdate) {
          // Transform the frontend format to backend format
          const rateValue = parseFloat(rateData.rate);
          if (isNaN(rateValue) || rateValue < 0) {
            alert('Rate must be a valid number greater than or equal to 0');
            return;
          }
          
          const backendData = {
            currency: rateData.currencyPair.split(' / ')[0],
            rate: rateValue,
            last_updated: rateData.lastUpdated,
            change: extractNumericValue(rateData.change) || 0,
            trend: rateData.trend
          };
          
          await currencyRatesApi.update(rateData.id, backendData);
          
          // Update the local state
          setExchangeRates(prevRates => 
            prevRates.map(rate => 
              rate.id === rateData.id ? rateData : rate
            )
          );
          console.log('Updated exchange rate:', rateData);
        }
      } else {
        // Add new rate
        // Transform the frontend format to backend format
        const backendData = {
          currency: rateData.currencyPair.split(' / ')[0],
          rate: parseFloat(rateData.rate),
          last_updated: rateData.lastUpdated,
          change: extractNumericValue(rateData.change) || 0,
          trend: rateData.trend
        };
        
        const response = await currencyRatesApi.create(backendData);
        
        // Transform the response to match frontend format
        const newRate = {
          id: response.data.data.id,
          currencyPair: `${response.data.data.currency} / USD`,
          rate: response.data.data.rate.toString(),
          lastUpdated: response.data.data.last_updated,
          change: formatChangeDisplay(response.data.data.change) || '+0.0000 (0.0%)',
          trend: response.data.data.trend || 'stable'
        };
        
        setExchangeRates(prevRates => [...prevRates, newRate]);
        console.log('Set new exchange rate:', newRate);
      }
      
      handleCloseRatePopup();
    } catch (err) {
      console.error('Error saving exchange rate:', err);
      let errorMessage = 'Failed to save exchange rate';
      
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = errors;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(errorMessage);
    }
  };

  // Handle rate deletion
  const handleDeleteRate = async (rate) => {
    if (window.confirm(`Are you sure you want to delete the ${rate.currencyPair} exchange rate?`)) {
      try {
        await currencyRatesApi.delete(rate.id);
        
        setExchangeRates(prevRates => 
          prevRates.filter(r => r.id !== rate.id)
        );
        console.log('Deleted exchange rate:', rate);
      } catch (err) {
        console.error('Error deleting exchange rate:', err);
        let errorMessage = 'Failed to delete exchange rate';
        
        if (err.response?.data?.errors) {
          // Handle validation errors
          const errors = err.response.data.errors;
          if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(', ');
          } else {
            errorMessage = errors;
          }
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        alert(errorMessage);
      }
    }
  };

  // Handle currency converter input changes
  const handleConverterChange = (field, value) => {
    setConverterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle currency conversion
  const handleConvert = () => {
    const amount = parseFloat(converterData.amount) || 0;
    let rate = 1;

    // Find the exchange rate from the loaded rates
    if (converterData.fromCurrency === 'USD' && converterData.toCurrency !== 'USD') {
      // From USD to other currency
      const rateEntry = exchangeRates.find(r => r.currencyPair === `${converterData.toCurrency} / USD`);
      if (rateEntry) {
        rate = parseFloat(rateEntry.rate);
      }
    } else if (converterData.toCurrency === 'USD' && converterData.fromCurrency !== 'USD') {
      // From other currency to USD
      const rateEntry = exchangeRates.find(r => r.currencyPair === `${converterData.fromCurrency} / USD`);
      if (rateEntry) {
        rate = 1 / parseFloat(rateEntry.rate);
      }
    } else if (converterData.fromCurrency !== 'USD' && converterData.toCurrency !== 'USD') {
      // Between two non-USD currencies
      const fromRateEntry = exchangeRates.find(r => r.currencyPair === `${converterData.fromCurrency} / USD`);
      const toRateEntry = exchangeRates.find(r => r.currencyPair === `${converterData.toCurrency} / USD`);
      
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
    <div className="space-y-6">
      <PageHeader
        title="Currency & Exchange Rates"
        subtitle="Manage exchange rates and currency conversions"
        actions={
          <Button 
            icon={<Plus className="h-4 w-4" />}
            onClick={handleSetRate}
          >
            Set Rate
          </Button>
        }
      />

      {/* Tab Navigation - Pill-shaped buttons matching Figma design */}
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current Rates Tab Content */}
      {activeTab === 'Current Rates' && (
        <>
          <SearchFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search currencies..."
            filters={filters}
          />

          <Card>
            <CardHeader>
              <CardTitle>Current Exchange Rates ({exchangeRates.length})</CardTitle>
              <CardDescription>All rates are relative to USD (Base: 1 USD)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  {error}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exchangeRates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>{rate.currencyPair}</TableCell>
                        <TableCell>{rate.rate}</TableCell>
                        <TableCell>{rate.lastUpdated}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${rate.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                            {rate.change}
                          </span>
                        </TableCell>
                        <TableCell>
                          {rate.trend === 'up' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              title="Edit rate"
                              onClick={() => handleEditRate(rate)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              title="Delete rate"
                              onClick={() => handleDeleteRate(rate)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Currency Converter Tab Content */}
      {activeTab === 'Currency Converter' && (
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
      )}

      {/* Rate History Tab Content */}
      {activeTab === 'Rate History' && (
        <Card>
          <CardHeader>
            <CardTitle>Exchange Rate History</CardTitle>
            <CardDescription>Historical exchange rates for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>EUR/USD</TableHead>
                  <TableHead>GBP/USD</TableHead>
                  <TableHead>CAD/USD</TableHead>
                  <TableHead>AUD/USD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateHistory.map((history, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{history.date}</TableCell>
                    <TableCell>{history.eurUsd}</TableCell>
                    <TableCell>{history.gbpUsd}</TableCell>
                    <TableCell>{history.cadUsd}</TableCell>
                    <TableCell>{history.audUsd}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit/Set Exchange Rate Popup */}
      {editingRate && (
        <EditExchangeRatePopup
          rate={editingRate}
          isOpen={isRatePopupOpen}
          onClose={handleCloseRatePopup}
          onUpdate={handleRateSubmit}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}
