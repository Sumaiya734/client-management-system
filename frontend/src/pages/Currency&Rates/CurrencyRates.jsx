// src/pages/Currency/CurrencyRates.js
import React, { useState, useRef } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import CurrentRatesTab from './tabs/CurrentRatesTab';
import CurrencyConverterTab from './tabs/CurrencyConverterTab';
import RateHistoryTab from './tabs/RateHistoryTab';
import EditExchangeRatePopup from '../../components/Currency/EditExchangeRatePopup';
import { useNotification } from '../../components/Notifications';


export default function CurrencyRates() {
  const [activeTab, setActiveTab] = useState('Current Rates');
  const currentRatesTabRef = useRef(null);
  
  // State for rate popup
  const [isRatePopupOpen, setIsRatePopupOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { showSuccess, showError } = useNotification();
  
  const tabs = [
    { id: 'Current Rates', label: 'Current Rates' },
    { id: 'Currency Converter', label: 'Currency Converter' },
    { id: 'Rate History', label: 'Rate History' }
  ];

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Create empty rate object
  const createEmptyRate = () => ({
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    currencyPair: 'EUR / BDT',
    rate: '',
    lastUpdated: new Date().toISOString().split('T')[0],
    change: '+0.0000 (0.0%)',
    trend: 'up'
  });
  
  // Handle set rate
  const handleSetRate = () => {
    if (currentRatesTabRef.current && currentRatesTabRef.current.handleSetRate) {
      currentRatesTabRef.current.handleSetRate();
    }
  };

  // Handle rate submit
  const handleRateSubmit = async (rateData) => {
    try {
      // This function will be implemented in the CurrentRatesTab
      // For now, we'll just close the popup
      setIsRatePopupOpen(false);
      setEditingRate(null);
      setIsEditMode(false);
      showSuccess('Exchange rate saved successfully');
    } catch (err) {
      console.error('Error saving exchange rate:', err);
      showError('Failed to save exchange rate');
    }
  };
  
  // Handle close rate popup
  const handleCloseRatePopup = () => {
    setIsRatePopupOpen(false);
    setEditingRate(null);
    setIsEditMode(false);
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
            className="rounded-full shadow-xl"   // pill-shape + shadow
          >
            Set Rate
          </Button>
        }
      />

      {/* Tab Navigation */}
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-xl'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Active Tab */}
      {activeTab === 'Current Rates' && (
        <CurrentRatesTab ref={currentRatesTabRef} />
      )}
      {activeTab === 'Currency Converter' && <CurrencyConverterTab />}
      {activeTab === 'Rate History' && <RateHistoryTab />}
      
      {/* Edit/Set Exchange Rate Popup - only show when not in CurrentRatesTab */}
      {editingRate && isRatePopupOpen && activeTab !== 'Current Rates' && (
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