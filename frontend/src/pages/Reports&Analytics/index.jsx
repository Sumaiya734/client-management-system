import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import api, { currencyRatesApi } from '../../api';
import { useNotification } from '../../components/Notifications';

// Import tab components
import OverviewTab from './components/OverviewTab';
import RevenueAnalysisTab from './components/RevenueAnalysisTab';
import ClientReportsTab from './components/ClientReportsTab';
import SubscriptionsTab from './components/SubscriptionsTab';

const ReportsAnalytics = () => {
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('Overview');
  
  // State variables for API data
  const [metrics, setMetrics] = useState([
    { title: 'Total Revenue', value: '$0', change: 'Loading data...', icon: TrendingUp },
    { title: 'Total Clients', value: '0', change: 'Loading data...', icon: TrendingUp },
    { title: 'Active Subscriptions', value: '0', change: 'Loading data...', icon: TrendingUp },
    { title: 'Avg Revenue/Client', value: '$0', change: 'Loading data...', icon: TrendingUp },
  ]);
  
  const [revenueByCurrency, setRevenueByCurrency] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [overviewRevenueData, setOverviewRevenueData] = useState([]); // Add this for Overview tab
  const [subscriptionDistribution, setSubscriptionDistribution] = useState([]); // Add this for subscription distribution
  const [clientData, setClientData] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState({
    planSummary: [],
    trendData: []
  });
  
  const [loading, setLoading] = useState({
    overview: true,
    revenue: true,
    client: true,
    subscription: true
  });
  
  // State for report filters
  const [reportType, setReportType] = useState('Revenue Report');
  const [currency, setCurrency] = useState('All Currencies');
  const [fromDate, setFromDate] = useState('2025-12-01');
  const [toDate, setToDate] = useState('2026-01-31');
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  
  // Applied filters state (what's actually used in API calls)
  const [appliedFilters, setAppliedFilters] = useState({
    currency: 'All Currencies',
    fromDate: '2025-12-01',
    toDate: '2026-01-31'
  });
  
  // Function to apply filters
  const applyFilters = () => {
    console.log('Applying filters:', { currency, fromDate, toDate });
    setAppliedFilters({
      currency: currency,
      fromDate: fromDate,
      toDate: toDate
    });
  };
  
  // Function to handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      applyFilters();
    }
  };
  
  // Function to check if filters have changed
  const filtersChanged = () => {
    return appliedFilters.currency !== currency || 
           appliedFilters.fromDate !== fromDate || 
           appliedFilters.toDate !== toDate;
  };
  
  // Fetch available currencies on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await currencyRatesApi.getAll();
        const currencies = response.data.map(rate => rate.currency);
        setAvailableCurrencies(currencies);
      } catch (error) {
        console.error('Error fetching currencies:', error);
        // Fallback to default currencies
        setAvailableCurrencies(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY']);
      }
    };
    
    fetchCurrencies();
    
    // Apply initial filters on component mount
    applyFilters();
  }, []);
  
  const tabs = ['Overview', 'Revenue Analysis', 'Client Reports', 'Subscriptions'];
  

  
  // Fetch overview metrics
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(prev => ({ ...prev, overview: true }));
        // Pass filter parameters to the API
        const params = new URLSearchParams({
          start_date: appliedFilters.fromDate,
          end_date: appliedFilters.toDate,
          ...(appliedFilters.currency !== 'All Currencies' && { currency: appliedFilters.currency })
        }).toString();
        
        const response = await api.get(`/reports-overview?${params}`);
        const data = response.data;
        
        setMetrics([
          { 
            title: 'Total Revenue', 
            value: '$' + (parseFloat(data.totalRevenue) || 0).toLocaleString(), 
            change: 'Current period', 
            icon: TrendingUp 
          },
          { 
            title: 'Total Clients', 
            value: data.totalClients?.toString() || '0', 
            change: 'Total registered', 
            icon: TrendingUp 
          },
          { 
            title: 'Active Subscriptions', 
            value: data.activeSubscriptions?.toString() || '0', 
            change: 'Currently active', 
            icon: TrendingUp 
          },
          { 
            title: 'Avg Revenue/Client', 
            value: '$' + (parseFloat(data.avgRevenuePerClient) || 0).toFixed(2), 
            change: 'Per client average', 
            icon: TrendingUp 
          },
        ]);

        // Set subscription distribution data
        setSubscriptionDistribution(data.subscriptionDistribution || []);

        // Also fetch revenue data for the Overview trend chart
        const revenueResponse = await api.get(`/reports-revenue?${params}`);
        const revenueData = revenueResponse.data;
        
        // Process monthly revenue data for the overview chart
        const processedOverviewData = revenueData.monthlyRevenueData.map(item => ({
          ...item,
          revenue: parseFloat(item.revenue) || 0,
          newClients: item.newClients,
          growthRate: item.growthRate
        }));
        
        setOverviewRevenueData(processedOverviewData);
        
        // Set revenue by currency for the overview
        const processedCurrencyData = revenueData.revenueByCurrency.map(item => ({
          currency: item.currency,
          percentage: item.percentage,
          amount: '$' + (parseFloat(item.amount) || 0).toLocaleString()
        }));
        
        setRevenueByCurrency(processedCurrencyData);
        
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(prev => ({ ...prev, overview: false }));
      }
    };
    
    fetchOverview();
  }, [appliedFilters]); // Use appliedFilters instead of individual filter states
  
  // Fetch revenue data when on Revenue Analysis tab
  useEffect(() => {
    if (activeTab === 'Revenue Analysis') {
      const fetchRevenueData = async () => {
        try {
          setLoading(prev => ({ ...prev, revenue: true }));
          // Pass filter parameters to the API
          const params = new URLSearchParams({
            start_date: appliedFilters.fromDate,
            end_date: appliedFilters.toDate,
            ...(appliedFilters.currency !== 'All Currencies' && { currency: appliedFilters.currency })
          }).toString();
          
          const response = await api.get(`/reports-revenue?${params}`);
          const data = response.data;
          
          // Process monthly revenue data
          const processedRevenueData = data.monthlyRevenueData.map(item => ({
            ...item,
            revenue: parseFloat(item.revenue) || 0,
            newClients: item.newClients,
            growthRate: item.growthRate
          }));
          
          setMonthlyRevenueData(processedRevenueData);
          
          // Process revenue by currency
          const processedCurrencyData = data.revenueByCurrency.map(item => ({
            currency: item.currency,
            percentage: item.percentage,
            amount: '$' + (parseFloat(item.amount) || 0).toLocaleString()
          }));
          
          setRevenueByCurrency(processedCurrencyData);
        } catch (error) {
          console.error('Error fetching revenue data:', error);
        } finally {
          setLoading(prev => ({ ...prev, revenue: false }));
        }
      };
      
      fetchRevenueData();
    }
  }, [activeTab, appliedFilters]);
  
  // Fetch client data when on Client Reports tab
  useEffect(() => {
    if (activeTab === 'Client Reports') {
      const fetchClientData = async () => {
        try {
          setLoading(prev => ({ ...prev, client: true }));
          // Pass filter parameters to the API
          const params = new URLSearchParams({
            start_date: appliedFilters.fromDate,
            end_date: appliedFilters.toDate,
            ...(appliedFilters.currency !== 'All Currencies' && { currency: appliedFilters.currency })
          }).toString();
          
          const response = await api.get(`/reports-client?${params}`);
          setClientData(response.data);
        } catch (error) {
          console.error('Error fetching client data:', error);
        } finally {
          setLoading(prev => ({ ...prev, client: false }));
        }
      };
      
      fetchClientData();
    }
  }, [activeTab, appliedFilters]);
  
  // Fetch subscription data when on Subscriptions tab
  useEffect(() => {
    if (activeTab === 'Subscriptions') {
      const fetchSubscriptionData = async () => {
        try {
          setLoading(prev => ({ ...prev, subscription: true }));
          // Pass filter parameters to the API
          const params = new URLSearchParams({
            start_date: appliedFilters.fromDate,
            end_date: appliedFilters.toDate,
            ...(appliedFilters.currency !== 'All Currencies' && { currency: appliedFilters.currency })
          }).toString();
          
          const response = await api.get(`/reports-subscription?${params}`);
          setSubscriptionData(response.data);
        } catch (error) {
          console.error('Error fetching subscription data:', error);
        } finally {
          setLoading(prev => ({ ...prev, subscription: false }));
        }
      };
      
      fetchSubscriptionData();
    }
  }, [activeTab, appliedFilters]);
  
  // Function to handle report generation
  const handleGenerateReport = async () => {
    try {
      // Determine which report type to generate based on the active tab
      let reportType = 'overview';
      if (activeTab === 'Revenue Analysis') reportType = 'revenue';
      if (activeTab === 'Client Reports') reportType = 'client';
      if (activeTab === 'Subscriptions') reportType = 'subscription';
      
      const response = await api.post('/reports-generate', {
        type: reportType,
        start_date: appliedFilters.fromDate,
        end_date: appliedFilters.toDate,
        ...(appliedFilters.currency !== 'All Currencies' && { currency: appliedFilters.currency })
      });
      
      // Refresh the data based on the active tab
      if (reportType === 'overview') {
        // Pass filter parameters to the API
        const params = new URLSearchParams({
          start_date: appliedFilters.fromDate,
          end_date: appliedFilters.toDate,
          ...(appliedFilters.currency !== 'All Currencies' && { currency: appliedFilters.currency })
        }).toString();
        
        const overviewResponse = await api.get(`/reports-overview?${params}`);
        const data = overviewResponse.data;
        
        setMetrics([
          { 
            title: 'Total Revenue', 
            value: '$' + (parseFloat(data.totalRevenue) || 0).toLocaleString(), 
            change: 'Current period', 
            icon: TrendingUp 
          },
          { 
            title: 'Total Clients', 
            value: data.totalClients?.toString() || '0', 
            change: 'Total registered', 
            icon: TrendingUp 
          },
          { 
            title: 'Active Subscriptions', 
            value: data.activeSubscriptions?.toString() || '0', 
            change: 'Currently active', 
            icon: TrendingUp 
          },
          { 
            title: 'Avg Revenue/Client', 
            value: '$' + (parseFloat(data.avgRevenuePerClient) || 0).toFixed(2), 
            change: 'Per client average', 
            icon: TrendingUp 
          },
        ]);
      }
      
      // Show success notification
      showSuccess('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      showError('Error generating report. Please try again.');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header with Action Buttons */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business insights and performance analytics"
        actions={
          <>
            <Button variant="outline">Export Data</Button>
            <Button variant="primary" onClick={handleGenerateReport} className="rounded-full shadow-xl">  
              Generate Report
            </Button>
          </>
        }
      />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-md">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-700">{metric.title}</h3>
              <metric.icon className="h-3 w-3 text-gray-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="h-2.5 w-2.5" />
                {metric.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Report Filters */}
      <Card className="!border-0 !shadow-none">
        <CardHeader className="pb-3 !border-b-0 !shadow-none">
          <CardTitle className="text-base">Report Filters</CardTitle>
        </CardHeader> <br />
        <CardContent className="pt-0 !shadow-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent outline-none text-xs bg-white"
              >
                <option>Revenue Report</option>
                <option>Client Report</option>
                <option>Subscription Report</option>
                <option>Payment Report</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent outline-none text-xs bg-white"
              >
                <option>All Currencies</option>
                {availableCurrencies.map((curr, index) => (
                  <option key={index} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent outline-none text-xs"
              />
            </div>
          </div>
          
          {/* Apply Filters Button */}
          <div className="mt-3 flex items-center justify-between">
            {/* Filter Status Indicator */}
            <div className="text-xs text-gray-600">
              <span className="font-medium">Applied:</span> 
              <span className="ml-1">
                {appliedFilters.fromDate} to {appliedFilters.toDate}
                {appliedFilters.currency !== 'All Currencies' && `, ${appliedFilters.currency}`}
              </span>
              {filtersChanged() && (
                <span className="ml-2 text-orange-600 font-medium">
                  (Pending changes)
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log('Reset button clicked');
                  setCurrency('All Currencies');
                  setFromDate('2025-12-01');
                  setToDate('2026-01-31');
                  // Apply the reset filters immediately
                  setAppliedFilters({
                    currency: 'All Currencies',
                    fromDate: '2025-12-01',
                    toDate: '2026-01-31'
                  });
                }}
                className="text-xs px-3 py-1"
              >
                Reset
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  console.log('Apply button clicked');
                  applyFilters();
                }}
                className={`text-xs px-3 py-1 ${
                  filtersChanged() 
                    ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' 
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {filtersChanged() ? 'Apply' : 'Applied'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-xl'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <OverviewTab 
          loading={loading}
          overviewRevenueData={overviewRevenueData}
          subscriptionDistribution={subscriptionDistribution}
          revenueByCurrency={revenueByCurrency}
        />
      )}

      {activeTab === 'Revenue Analysis' && (
        <RevenueAnalysisTab 
          loading={loading}
          monthlyRevenueData={monthlyRevenueData}
        />
      )}

      {activeTab === 'Client Reports' && (
        <ClientReportsTab 
          loading={loading}
          clientData={clientData}
        />
      )}

      {activeTab === 'Subscriptions' && (
        <SubscriptionsTab 
          loading={loading}
          subscriptionData={subscriptionData}
        />
      )}
    </div>
  );
};

export default ReportsAnalytics;

