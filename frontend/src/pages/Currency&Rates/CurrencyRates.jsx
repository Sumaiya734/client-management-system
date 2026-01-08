// src/pages/Currency/CurrencyRates.js
import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import CurrentRatesTab from './tabs/CurrentRatesTab';
import CurrencyConverterTab from './tabs/CurrencyConverterTab';
import RateHistoryTab from './tabs/RateHistoryTab';

export default function CurrencyRates() {
  const [activeTab, setActiveTab] = useState('Current Rates');
  
  const tabs = [
    { id: 'Current Rates', label: 'Current Rates' },
    { id: 'Currency Converter', label: 'Currency Converter' },
    { id: 'Rate History', label: 'Rate History' }
  ];

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Currency & Exchange Rates"
        subtitle="Manage exchange rates and currency conversions"
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {/* Set Rate functionality */}}
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
      {activeTab === 'Current Rates' && <CurrentRatesTab />}
      {activeTab === 'Currency Converter' && <CurrencyConverterTab />}
      {activeTab === 'Rate History' && <RateHistoryTab />}
    </div>
  );
}