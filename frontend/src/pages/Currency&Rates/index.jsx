import React, { useState } from 'react';
import { Plus, Edit, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EditExchangeRatePopup from '../../components/Currency/EditExchangeRatePopup';

export default function CurrencyRates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  // Tab state management
  const [activeTab, setActiveTab] = useState('Current Rates');
  
  // Exchange rate popup state
  const [isRatePopupOpen, setIsRatePopupOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Currency converter state
  const [converterData, setConverterData] = useState({
    amount: '100',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    result: ''
  });

  const [exchangeRates, setExchangeRates] = useState([
    {
      id: 1,
      currencyPair: 'EUR / USD',
      rate: '0.8580',
      lastUpdated: '2025-01-20',
      change: '+0.0200 (+2.4%)',
      trend: 'up',
    },
    {
      id: 2,
      currencyPair: 'GBP / USD',
      rate: '0.7500',
      lastUpdated: '2025-01-20',
      change: '-0.0100 (-1.3%)',
      trend: 'down',
    },
    {
      id: 3,
      currencyPair: 'CAD / USD',
      rate: '1.3500',
      lastUpdated: '2025-01-20',
      change: '+0.0300 (+2.3%)',
      trend: 'up',
    },
    {
      id: 4,
      currencyPair: 'AUD / USD',
      rate: '1.4500',
      lastUpdated: '2025-01-20',
      change: '+0.0100 (+0.7%)',
      trend: 'up',
    },
  ]);

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
  const handleRateSubmit = (rateData) => {
    if (isEditMode) {
      // Update existing rate
      setExchangeRates(prevRates => 
        prevRates.map(rate => 
          rate.id === rateData.id ? rateData : rate
        )
      );
      console.log('Updated exchange rate:', rateData);
    } else {
      // Add new rate
      const newRate = {
        ...rateData,
        id: Date.now() // Generate new ID for the rate
      };
      setExchangeRates(prevRates => [...prevRates, newRate]);
      console.log('Set new exchange rate:', newRate);
    }
    
    handleCloseRatePopup();
  };

  // Handle rate deletion
  const handleDeleteRate = (rate) => {
    if (window.confirm(`Are you sure you want to delete the ${rate.currencyPair} exchange rate?`)) {
      setExchangeRates(prevRates => 
        prevRates.filter(r => r.id !== rate.id)
      );
      console.log('Deleted exchange rate:', rate);
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

    // Find the exchange rate (simplified logic)
    if (converterData.fromCurrency === 'USD' && converterData.toCurrency === 'EUR') {
      rate = 0.8580;
    } else if (converterData.fromCurrency === 'EUR' && converterData.toCurrency === 'USD') {
      rate = 1 / 0.8580;
    } else if (converterData.fromCurrency === 'USD' && converterData.toCurrency === 'GBP') {
      rate = 0.7500;
    } else if (converterData.fromCurrency === 'GBP' && converterData.toCurrency === 'USD') {
      rate = 1 / 0.7500;
    }
    // Add more conversion logic as needed

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
