import React, { useState } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import { currencyRatesApi } from '../../api';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';

const EditExchangeRatePopup = ({
  rate,
  isOpen,
  onClose,
  onUpdate,
  isEditMode = true,
}) => {
  const [formData, setFormData] = useState({
    currency: '',
    rateValue: '',
    date: ''
  });

  const [dropdownStates, setDropdownStates] = useState({
    currency: false
  });

  const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR'];

  // Update form data when rate changes
  React.useEffect(() => {
    if (rate) {
      const currency = rate.currencyPair.split(' / ')[0];
      setFormData({
        currency: currency,
        rateValue: rate.rate,
        date: rate.lastUpdated
      });
    } else {
      // Reset form for new rate
      setFormData({
        currency: 'EUR',
        rateValue: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [rate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleDropdown = (dropdown) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const selectCurrency = (currency) => {
    handleInputChange('currency', currency);
    setDropdownStates(prev => ({
      ...prev,
      currency: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedRate = {
        id: rate?.id || Date.now(),
        currencyPair: `${formData.currency} / USD`,
        rate: formData.rateValue,
        lastUpdated: formData.date,
        change: rate?.change || '+0.0000 (0.0%)',
        trend: rate?.trend || 'up'
      };
      
      onUpdate(updatedRate);
      onClose();
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

  const handleCancel = () => {
    onClose();
  };

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Exchange Rate' : 'Set Exchange Rate'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? 'Update exchange rate' : 'Set new exchange rate'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Currency and Rate Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('currency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                  >
                    <span>{formData.currency}</span>
                    <ChevronDown size={16} className={`transition-transform ${dropdownStates.currency ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownStates.currency && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {currencyOptions.map((currency) => (
                        <button
                          key={currency}
                          type="button"
                          onClick={() => selectCurrency(currency)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rate (to USD) */}
              <div>
                <label htmlFor="rateValue" className="block text-sm font-medium text-gray-700 mb-2">
                  Rate (to USD)
                </label>
                <input
                  type="number"
                  id="rateValue"
                  value={formData.rateValue}
                  onChange={(e) => handleInputChange('rateValue', e.target.value)}
                  step="0.0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.8500"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {isEditMode ? 'Update Rate' : 'Set Rate'}
            </button>
          </div>
        </form>
      </div>
      </PopupAnimation>
    </div>
  );
};

export default EditExchangeRatePopup;