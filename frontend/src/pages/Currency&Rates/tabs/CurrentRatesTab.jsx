// src/pages/Currency/tabs/CurrentRatesTab.js
import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, ArrowUpRight, ArrowDownRight, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { SearchFilter } from '../../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import EditExchangeRatePopup from '../../../components/Currency/EditExchangeRatePopup';
import { currencyRatesApi } from '../../../api';
import { useNotification } from '../../../components/Notifications';

export default function CurrentRatesTab() {
  const { showError, showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isRatePopupOpen, setIsRatePopupOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });

  const scrollContainerRef = useRef(null);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        const response = await currencyRatesApi.getAll();

        if (!response.data || !Array.isArray(response.data)) {
          console.error('API response does not have expected structure:', response);
          setExchangeRates([]);
          return;
        }

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

  // Helper functions
  const extractNumericValue = (changeString) => {
    if (!changeString) return 0;
    const match = changeString.match(/([+-]?\d+\.\d+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const formatChangeDisplay = (changeValue) => {
    if (typeof changeValue === 'string' && changeValue.includes('(')) {
      return changeValue;
    }

    const numValue = parseFloat(changeValue) || 0;
    const percentage = (Math.abs(numValue) * 100).toFixed(1);
    const sign = numValue >= 0 ? '+' : '-';

    return `${sign}${Math.abs(numValue).toFixed(4)} (${sign}${percentage}%)`;
  };

  const createEmptyRate = () => ({
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    currencyPair: 'EUR / BDT',
    rate: '',
    lastUpdated: new Date().toISOString().split('T')[0],
    change: '+0.0000 (0.0%)',
    trend: 'up'
  });

  // Handlers
  const handleSetRate = () => {
    setEditingRate(createEmptyRate());
    setIsEditMode(false);
    setIsRatePopupOpen(true);
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setIsEditMode(true);
    setIsRatePopupOpen(true);
  };

  const handleCloseRatePopup = () => {
    setIsRatePopupOpen(false);
    setEditingRate(null);
    setIsEditMode(false);
  };

  const handleRateSubmit = async (rateData) => {
    try {
      let response = null;
      let updatedCurrency = null;
      let updatedRateValue = null;

      if (isEditMode) {
        const rateToUpdate = exchangeRates.find(r => r.id === rateData.id);
        if (!rateToUpdate) {
          showError('Exchange rate not found');
          return;
        }

        const rateValue = parseFloat(rateData.rate);
        if (isNaN(rateValue) || rateValue < 0) {
          showError('Rate must be a valid number greater than or equal to 0');
          return;
        }

        const backendData = {
          currency: rateData.currency || rateData.currencyPair.split(' / ')[0],
          rate: rateValue,
          last_updated: rateData.lastUpdated,
          change: extractNumericValue(rateData.change) || 0,
          trend: rateData.trend
        };

        response = await currencyRatesApi.update(rateData.id, backendData);

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
        
        updatedCurrency = response.data.currency;
        updatedRateValue = response.data.rate;
        showSuccess('Exchange rate updated successfully');
      } else {
        const rateValue = parseFloat(rateData.rate);
        if (isNaN(rateValue) || rateValue < 0) {
          showError('Rate must be a valid number greater than or equal to 0');
          return;
        }

        const backendData = {
          currency: rateData.currency || rateData.currencyPair.split(' / ')[0],
          rate: rateValue,
          last_updated: rateData.lastUpdated,
          change: extractNumericValue(rateData.change) || 0,
          trend: rateData.trend
        };

        response = await currencyRatesApi.create(backendData);

        const newRate = {
          id: response.data.id,
          currencyPair: `${response.data.currency} / BDT`,
          rate: response.data.rate.toString(),
          lastUpdated: response.data.last_updated,
          change: formatChangeDisplay(response.data.change) || '+0.0000 (0.0%)',
          trend: response.data.trend || 'stable'
        };

        setExchangeRates(prevRates => [...prevRates, newRate]);
        
        updatedCurrency = response.data.currency;
        updatedRateValue = response.data.rate;
        showSuccess('Exchange rate created successfully');
      }

      handleCloseRatePopup();
      
      if (updatedCurrency && updatedRateValue !== null) {
        window.dispatchEvent(new CustomEvent('currencyRateUpdated', { 
          detail: { 
            currency: updatedCurrency,
            rate: updatedRateValue 
          } 
        }));
        
        if (updatedCurrency === 'USD') {
          window.dispatchEvent(new CustomEvent('bdtRateUpdated', { 
            detail: { rate: updatedRateValue } 
          }));
        }
      }
      
    } catch (err) {
      console.error('Error saving exchange rate:', err);
      let errorMessage = 'Failed to save exchange rate';

      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = errors;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showError(errorMessage);
      throw err;
    }
  };

  const handleDeleteRate = (rate) => {
    setConfirmDialog({
      isOpen: true,
      item: rate,
      action: 'deleteRate'
    });
  };

  const confirmDeleteRate = async () => {
    const rate = confirmDialog.item;
    try {
      await currencyRatesApi.delete(rate.id);

      setExchangeRates(prevRates =>
        prevRates.filter(r => r.id !== rate.id)
      );
      showSuccess('Exchange rate deleted successfully');
      setConfirmDialog({ isOpen: false, item: null, action: null });

      const deletedCurrency = rate.currency || (rate.currencyPair && rate.currencyPair.split(' / ')[0]);
      if (deletedCurrency === 'USD') {
        window.dispatchEvent(new CustomEvent('bdtRateUpdated', { detail: { rate: null } }));
      }
    } catch (err) {
      console.error('Error deleting exchange rate:', err);
      let errorMessage = 'Failed to delete exchange rate';

      if (err.response?.data?.errors) {
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

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, item: null, action: null });
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <>
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
            const isZero = !rate.change.match(/[1-9]/);
            const percentageMatch = rate.change.match(/\((.*?)\%\)/);
            const percentage = percentageMatch ? percentageMatch[1] + '%' : '0.00%';

            return (
              <div key={`card-${rate.id}`} className="min-w-[170px] bg-white border border-gray-200 rounded-lg p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow shrink-0">
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

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search currencies..."
        filters={filters}
      />

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
                  <TableRow key={`row-${rate.id}`}>
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
    </>
  );
}