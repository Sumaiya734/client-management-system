import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, ChevronRight, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EditExchangeRatePopup from '../../components/Currency/EditExchangeRatePopup';
import { currencyRatesApi } from '../../api';
import { useNotification } from '../../components/Notifications';

export default function CurrencyRates() {
  const { showError, showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });

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
          currencyPair: `${rate.currency} / BDT`,
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
      eurBdt: '0.8300',
      gbpBdt: '0.7600',
      cadBdt: '1.3200',
      audBdt: '1.4400'
    },
    {
      date: '2025-01-16',
      eurBdt: '0.8400',
      gbpBdt: '0.7500',
      cadBdt: '1.3300',
      audBdt: '1.4300'
    },
    {
      date: '2025-01-17',
      eurBdt: '0.8400',
      gbpBdt: '0.7600',
      cadBdt: '1.3400',
      audBdt: '1.4400'
    },
    {
      date: '2025-01-18',
      eurBdt: '0.8500',
      gbpBdt: '0.7500',
      cadBdt: '1.3500',
      audBdt: '1.4500'
    },
    {
      date: '2025-01-19',
      eurBdt: '0.8300',
      gbpBdt: '0.7600',
      cadBdt: '1.3200',
      audBdt: '1.4400'
    },
    {
      date: '2025-01-20',
      eurBdt: '0.8500',
      gbpBdt: '0.7500',
      cadBdt: '1.3500',
      audBdt: '1.4500'
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
    currencyPair: 'EUR / BDT',
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
            showError('Rate must be a valid number greater than or equal to 0');
            return;
          }

          const backendData = {
            currency: rateData.currency || rateData.currencyPair.split(' / ')[0], // Use currency field if available (for BDT rate)
            rate: rateValue,
            last_updated: rateData.lastUpdated,
            change: extractNumericValue(rateData.change) || 0,
            trend: rateData.trend
          };

          const response = await currencyRatesApi.update(rateData.id, backendData);

          // Update the local state with the response data to ensure consistency
          const updatedRate = {
            id: response.data.id,
            currencyPair: `${response.data.currency} / BDT`,
            rate: response.data.rate.toString(),
            lastUpdated: response.data.last_updated,
            change: formatChangeDisplay(response.data.change) || '+0.0000 (0.0%)',
            trend: response.data.trend || 'stable'
          };
          
          setExchangeRates(prevRates =>
            prevRates.map(rate =>
              rate.id === rateData.id ? updatedRate : rate
            )
          );
          console.log('Updated exchange rate:', updatedRate);
        }
      } else {
        // Add new rate
        // Transform the frontend format to backend format
        const backendData = {
          currency: rateData.currency || rateData.currencyPair.split(' / ')[0], // Use currency field if available (for BDT rate)
          rate: parseFloat(rateData.rate),
          last_updated: rateData.lastUpdated,
          change: extractNumericValue(rateData.change) || 0,
          trend: rateData.trend
        };

        const response = await currencyRatesApi.create(backendData);

        // Transform the response to match frontend format
        const newRate = {
          id: response.data.id,
          currencyPair: `${response.data.currency} / BDT`,
          rate: response.data.rate.toString(),
          lastUpdated: response.data.last_updated,
          change: formatChangeDisplay(response.data.change) || '+0.0000 (0.0%)',
          trend: response.data.trend || 'stable'
        };

        setExchangeRates(prevRates => [...prevRates, newRate]);
        console.log('Set new exchange rate:', newRate);
      }

      handleCloseRatePopup();
      
      // Notify other components to refresh BDT prices when USD rate changes (as products are priced in USD)
      if (rateData.currency === 'USD') {
        // Dispatch a custom event to notify other components about the exchange rate change
        window.dispatchEvent(new CustomEvent('bdtRateUpdated', { detail: { rate: rateData.rate } }));
      }
      
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

      showError(errorMessage);
    }
  };

  // Handle rate deletion
  const handleDeleteRate = (rate) => {
    setConfirmDialog({
      isOpen: true,
      item: rate,
      action: 'deleteRate'
    });
  };

  // Confirm rate deletion
  const confirmDeleteRate = async () => {
    const rate = confirmDialog.item;
    try {
      await currencyRatesApi.delete(rate.id);

      setExchangeRates(prevRates =>
        prevRates.filter(r => r.id !== rate.id)
      );
      showSuccess('Exchange rate deleted successfully');
      setConfirmDialog({ isOpen: false, item: null, action: null });
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

      showError(errorMessage);
      setConfirmDialog({ isOpen: false, item: null, action: null });
    }
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, item: null, action: null });
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
      const rateEntry = exchangeRates.find(r => r.currencyPair === `${converterData.toCurrency} / BDT`);
      if (rateEntry) {
        rate = parseFloat(rateEntry.rate);
      }
    } else if (converterData.toCurrency === 'USD' && converterData.fromCurrency !== 'USD') {
      // From other currency to USD
      const rateEntry = exchangeRates.find(r => r.currencyPair === `${converterData.fromCurrency} / BDT`);
      if (rateEntry) {
        rate = 1 / parseFloat(rateEntry.rate);
      }
    } else if (converterData.fromCurrency !== 'USD' && converterData.toCurrency !== 'USD') {
      // Between two non-USD currencies
      const fromRateEntry = exchangeRates.find(r => r.currencyPair === `${converterData.fromCurrency} / BDT`);
      const toRateEntry = exchangeRates.find(r => r.currencyPair === `${converterData.toCurrency} / BDT`);

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

  const scrollContainerRef = useRef(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
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
            className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-xl'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-shadow '
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mini Cards Scrollable Section */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {exchangeRates.map((rate) => {
            const currencyCode = rate.currencyPair.split(' / ')[0];
            const isNegative = rate.change.includes('-');
            const isZero = !rate.change.match(/[1-9]/); // Check if contains non-zero digits
            // Extract percentage from format like "+0.0200 (+2.4%)"
            const percentageMatch = rate.change.match(/\((.*?)\%\)/);
            const percentage = percentageMatch ? percentageMatch[1] + '%' : '0.00%';

            return (
              <div key={rate.id} className="min-w-[170px] bg-white border border-gray-200 rounded-lg p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow shrink-0">
                <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1">
                  {rate.currencyPair}
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">
                  {rate.rate}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">{currencyCode}</span>
                  <div className={`flex items-center text-xs font-medium ${isNegative ? 'text-red-600' : isZero ? 'text-gray-500' : 'text-green-600'}`}>
                    {isZero ? (
                      <ArrowRight className="h-3 w-3 mr-1" />
                    ) : isNegative ? (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    )}
                    {percentage}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {exchangeRates.length > 0 && (
          <button
            onClick={scrollRight}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 z-10 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100 duration-200"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Current Rates Tab Content */}
      {activeTab === 'Current Rates' && (
        <>
          {/* <SearchFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search currencies..."
            filters={filters}
          /> */}

          <Card>
            <CardHeader>
              <CardTitle>Current Exchange Rates ({exchangeRates.length})</CardTitle>
              <CardDescription>All rates are relative to BDT (Base: 1 BDT)</CardDescription>
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
                  <TableHead>EUR/BDT</TableHead>
                  <TableHead>GBP/BDT</TableHead>
                  <TableHead>CAD/BDT</TableHead>
                  <TableHead>AUD/BDT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateHistory.map((history, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{history.date}</TableCell>
                    <TableCell>{history.eurBdt}</TableCell>
                    <TableCell>{history.gbpBdt}</TableCell>
                    <TableCell>{history.cadBdt}</TableCell>
                    <TableCell>{history.audBdt}</TableCell>
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

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the <strong>{confirmDialog.item?.currencyPair}</strong> exchange rate? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={closeConfirmDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={confirmDeleteRate}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
