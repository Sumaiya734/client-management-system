import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import api from '../../api'; // Assuming you have an API module

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('Revenue Analysis');
  
  // State variables for API data
  const [metrics, setMetrics] = useState([
    { title: 'Total Revenue', value: '$0', change: 'Loading...', icon: TrendingUp },
    { title: 'Total Clients', value: '0', change: 'Loading...', icon: TrendingUp },
    { title: 'Active Subscriptions', value: '0', change: 'Loading...', icon: TrendingUp },
    { title: 'Avg Revenue/Client', value: '$0', change: 'Loading...', icon: TrendingUp },
  ]);
  
  const [revenueByCurrency, setRevenueByCurrency] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
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
  
  const tabs = ['Overview', 'Revenue Analysis', 'Client Reports', 'Subscriptions'];
  
  // Calculate bar heights for SVG chart (viewBox: 600x280, chart area: 60-560 x 40-230)
  const maxRevenue = 26000;
  const chartAreaHeight = 190; // 230 - 40
  const chartBottom = 230;
  const calculateBarHeight = (value) => (value / maxRevenue) * chartAreaHeight;
  const calculateBarY = (value) => chartBottom - calculateBarHeight(value);
  
  // Fetch overview metrics
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(prev => ({ ...prev, overview: true }));
        const response = await api.get('/api/reports-overview');
        const data = response.data;
        
        setMetrics([
          { 
            title: 'Total Revenue', 
            value: '$' + data.total_revenue?.toLocaleString() || '0', 
            change: '+18% from last period', 
            icon: TrendingUp 
          },
          { 
            title: 'Total Clients', 
            value: data.total_clients?.toString() || '0', 
            change: '+12% from last period', 
            icon: TrendingUp 
          },
          { 
            title: 'Active Subscriptions', 
            value: data.active_subscriptions?.toString() || '0', 
            change: '+8% from last period', 
            icon: TrendingUp 
          },
          { 
            title: 'Avg Revenue/Client', 
            value: '$' + data.avg_revenue_per_client?.toFixed(2) || '0', 
            change: '+1% from last period', 
            icon: TrendingUp 
          },
        ]);
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(prev => ({ ...prev, overview: false }));
      }
    };
    
    fetchOverview();
  }, []);
  
  // Fetch revenue data when on Revenue Analysis tab
  useEffect(() => {
    if (activeTab === 'Revenue Analysis') {
      const fetchRevenueData = async () => {
        try {
          setLoading(prev => ({ ...prev, revenue: true }));
          const response = await api.get('/api/reports-revenue');
          const data = response.data;
          
          // Process monthly revenue data
          const processedRevenueData = data.monthlyRevenueData.map(item => ({
            ...item,
            revenue: item.revenue,
            newClients: item.newClients,
            growthRate: item.growthRate
          }));
          
          setMonthlyRevenueData(processedRevenueData);
          
          // Process revenue by currency
          const processedCurrencyData = data.revenueByCurrency.map(item => ({
            currency: item.currency,
            percentage: item.percentage,
            amount: '$' + item.amount?.toLocaleString()
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
  }, [activeTab]);
  
  // Fetch client data when on Client Reports tab
  useEffect(() => {
    if (activeTab === 'Client Reports') {
      const fetchClientData = async () => {
        try {
          setLoading(prev => ({ ...prev, client: true }));
          const response = await api.get('/api/reports-client');
          setClientData(response.data);
        } catch (error) {
          console.error('Error fetching client data:', error);
        } finally {
          setLoading(prev => ({ ...prev, client: false }));
        }
      };
      
      fetchClientData();
    }
  }, [activeTab]);
  
  // Fetch subscription data when on Subscriptions tab
  useEffect(() => {
    if (activeTab === 'Subscriptions') {
      const fetchSubscriptionData = async () => {
        try {
          setLoading(prev => ({ ...prev, subscription: true }));
          const response = await api.get('/api/reports-subscription');
          setSubscriptionData(response.data);
        } catch (error) {
          console.error('Error fetching subscription data:', error);
        } finally {
          setLoading(prev => ({ ...prev, subscription: false }));
        }
      };
      
      fetchSubscriptionData();
    }
  }, [activeTab]);
  
  // Function to handle report generation
  const handleGenerateReport = async () => {
    try {
      // Determine which report type to generate based on the active tab
      let reportType = 'overview';
      if (activeTab === 'Revenue Analysis') reportType = 'revenue';
      if (activeTab === 'Client Reports') reportType = 'client';
      if (activeTab === 'Subscriptions') reportType = 'subscription';
      
      const response = await api.post('/api/reports-generate', {
        type: reportType
      });
      
      // Refresh the data based on the active tab
      if (reportType === 'overview') {
        const overviewResponse = await api.get('/api/reports-overview');
        const data = overviewResponse.data;
        
        setMetrics([
          { 
            title: 'Total Revenue', 
            value: '$' + data.total_revenue?.toLocaleString() || '0', 
            change: '+18% from last period', 
            icon: TrendingUp 
          },
          { 
            title: 'Total Clients', 
            value: data.total_clients?.toString() || '0', 
            change: '+12% from last period', 
            icon: TrendingUp 
          },
          { 
            title: 'Active Subscriptions', 
            value: data.active_subscriptions?.toString() || '0', 
            change: '+8% from last period', 
            icon: TrendingUp 
          },
          { 
            title: 'Avg Revenue/Client', 
            value: '$' + data.avg_revenue_per_client?.toFixed(2) || '0', 
            change: '+1% from last period', 
            icon: TrendingUp 
          },
        ]);
      }
      
      // Show success notification or message
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
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
            <Button variant="primary" onClick={handleGenerateReport}>Generate Report</Button>
          </>
        }
      />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-gray-50 rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">{metric.title}</h3>
              <metric.icon className="h-4 w-4 text-gray-600" />
        </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {metric.change}
              </p>
        </div>
        </div>
        ))}
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm bg-white">
            <option>Revenue Report</option>
          </select>
        </div>
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm bg-white">
            <option>All Currencies</option>
          </select>
        </div>
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                defaultValue="2025-01-01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              />
        </div>
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                defaultValue="2025-12-23"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              />
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
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'Revenue Analysis' && (
        <div className="space-y-6">
          {loading.revenue ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading revenue data...</p>
            </div>
          ) : (
            <>
              {/* Monthly Revenue Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Analysis</CardTitle>
                  <CardDescription>Detailed revenue breakdown by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gray-50 rounded-lg p-6">
                    <svg className="w-full h-full" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet">
                      {/* Y-axis labels */}
                      <text x="30" y="30" className="text-xs fill-gray-600 font-medium">26000</text>
                      <text x="30" y="80" className="text-xs fill-gray-600 font-medium">19500</text>
                      <text x="30" y="130" className="text-xs fill-gray-600 font-medium">13000</text>
                      <text x="30" y="180" className="text-xs fill-gray-600 font-medium">6500</text>
                      <text x="30" y="230" className="text-xs fill-gray-600 font-medium">0</text>
                      
                      {/* Grid lines */}
                      <line x1="60" y1="30" x2="560" y2="30" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="60" y1="80" x2="560" y2="80" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="60" y1="130" x2="560" y2="130" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="60" y1="180" x2="560" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="60" y1="230" x2="560" y2="230" stroke="#e5e7eb" strokeWidth="1" />
                      
                      {/* Bars */}
                      {monthlyRevenueData.map((data, index) => {
                        const barHeight = calculateBarHeight(data.revenue);
                        const barY = calculateBarY(data.revenue);
                        const barX = 80 + (index * 80);
                        const barWidth = 50;
                        
                        return (
                          <g key={data.month}>
                            <rect
                              x={barX}
                              y={barY}
                              width={barWidth}
                              height={barHeight}
                              fill="#8b5cf6"
                              rx="4"
                            />
                            <text
                              x={barX + barWidth / 2}
                              y={260}
                              textAnchor="middle"
                              className="text-xs fill-gray-600 font-medium"
                            >
                              {data.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                  <CardDescription>Monthly revenue details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Month</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Revenue</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">New Clients</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Growth Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyRevenueData.map((data, index, array) => {
                          // Calculate growth rate if not provided
                          let growthRate = data.growthRate;
                          if (growthRate === null && index > 0) {
                            const previousRevenue = array[index - 1].revenue;
                            if (previousRevenue > 0) {
                              growthRate = ((data.revenue - previousRevenue) / previousRevenue) * 100;
                            }
                          }
                          
                          return (
                            <tr key={data.month} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900 font-medium">{data.month}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">${data.revenue?.toLocaleString() || '0'}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{data.newClients || '0'}</td>
                              <td className="py-3 px-4 text-sm">
                                {growthRate === null ? (
                                  <span className="text-gray-500">N/A</span>
                                ) : (
                                  <span
                                    className={`font-medium ${
                                      growthRate < 0
                                        ? 'text-white bg-red-500 px-2 py-1 rounded'
                                        : 'text-gray-900'
                                    }`}
                                  >
                                    {growthRate > 0 ? '+' : ''}
                                    {growthRate.toFixed(1)}%
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Client Reports Tab Content */}
      {activeTab === 'Client Reports' && (
        <Card>
          {loading.client ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading client data...</p>
            </div>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Client-wise Subscription Report</CardTitle>
                <CardDescription>Detailed breakdown by client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Subscriptions</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Active Subscriptions</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Revenue</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Last Payment</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientData.map((client) => (
                        <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">{client.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{client.totalSubscriptions || 0}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{client.activeSubscriptions || 0}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">${client.totalRevenue?.toLocaleString() || '0'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{client.lastPayment || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>
                              {client.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}

      {/* Overview Tab Content (Original Charts) */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue and client growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                {loading.overview ? (
                  <p>Loading overview data...</p>
                ) : (
                  <div className="w-full h-full relative">
                    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                      {/* Y-axis labels */}
                      <text x="10" y="20" className="text-xs fill-gray-600">26000</text>
                      <text x="10" y="60" className="text-xs fill-gray-600">19500</text>
                      <text x="10" y="100" className="text-xs fill-gray-600">13000</text>
                      <text x="10" y="140" className="text-xs fill-gray-600">6500</text>
                      <text x="10" y="180" className="text-xs fill-gray-600">0</text>
                      
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="380" y2="20" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="40" y1="60" x2="380" y2="60" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="40" y1="100" x2="380" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="40" y1="140" x2="380" y2="140" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="40" y1="180" x2="380" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                      
                      {/* X-axis labels */}
                      <text x="70" y="195" className="text-xs fill-gray-600">Jan</text>
                      <text x="130" y="195" className="text-xs fill-gray-600">Feb</text>
                      <text x="190" y="195" className="text-xs fill-gray-600">Mar</text>
                      <text x="250" y="195" className="text-xs fill-gray-600">Apr</text>
                      <text x="310" y="195" className="text-xs fill-gray-600">May</text>
                      <text x="370" y="195" className="text-xs fill-gray-600">Jun</text>
                      
                      {/* Revenue line - purple */}
                      <polyline
                        points="70,100 130,80 190,70 250,50 310,60 370,40"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                      />
                      
                      {/* Data points */}
                      <circle cx="70" cy="100" r="4" fill="#8b5cf6" />
                      <circle cx="130" cy="80" r="4" fill="#8b5cf6" />
                      <circle cx="190" cy="70" r="4" fill="#8b5cf6" />
                      <circle cx="250" cy="50" r="4" fill="#8b5cf6" />
                      <circle cx="310" cy="60" r="4" fill="#8b5cf6" />
                      <circle cx="370" cy="40" r="4" fill="#8b5cf6" />
                    </svg>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Two smaller cards */}
          <div className="space-y-6">
            {/* Subscription Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Breakdown by plan type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  {loading.overview ? (
                    <p>Loading overview data...</p>
                  ) : (
                    <div className="relative w-48 h-48">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {/* Multiple slices for pie chart */}
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="#a78bfa"
                          strokeWidth="40"
                          strokeDasharray={`${2 * Math.PI * 80 * 0.4} ${2 * Math.PI * 80}`}
                          strokeDashoffset={-2 * Math.PI * 80 * 0.6}
                          transform="rotate(-90 100 100)"
                        />
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="#c4b5fd"
                          strokeWidth="40"
                          strokeDasharray={`${2 * Math.PI * 80 * 0.3} ${2 * Math.PI * 80}`}
                          strokeDashoffset={-2 * Math.PI * 80 * 0.3}
                          transform="rotate(-90 100 100)"
                        />
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="#ddd6fe"
                          strokeWidth="40"
                          strokeDasharray={`${2 * Math.PI * 80 * 0.3} ${2 * Math.PI * 80}`}
                          strokeDashoffset="0"
                          transform="rotate(-90 100 100)"
                        />
                        <text x="100" y="100" textAnchor="middle" className="text-xs fill-gray-600 font-medium">
                          Basic Plan
                        </text>
                        <text x="100" y="115" textAnchor="middle" className="text-xs fill-gray-500">
                          undefined%
                        </text>
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Currency */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Currency</CardTitle>
                <CardDescription>Multi-currency revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.revenue ? (
                  <div className="flex justify-center items-center h-32">
                    <p>Loading revenue data...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {revenueByCurrency.map((item) => (
                      <div key={item.currency}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{item.currency}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">{item.percentage}%</span>
                            <span className="text-sm font-medium text-gray-900">{item.amount}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-900 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Subscriptions Tab Content */}
      {activeTab === 'Subscriptions' && (
        <div className="space-y-6">
          {loading.subscription ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading subscription data...</p>
            </div>
          ) : (
            <>
              {/* Subscription Plan Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionData.planSummary?.map((plan, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{plan.planName || 'Plan'}</CardTitle>
                      <CardDescription>Subscription details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
                          <p className="text-2xl font-bold text-gray-900">{plan.activeSubscriptions || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                          <p className="text-xl font-semibold text-gray-900">${plan.monthlyRevenue?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Avg per Subscription</p>
                          <p className="text-lg font-medium text-gray-900">${plan.avgPerSubscription?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Subscription Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Trends</CardTitle>
                  <CardDescription>Growth in subscription count over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gray-50 rounded-lg p-6">
                    <svg className="w-full h-full" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet">
                      {/* Y-axis labels */}
                      <text x="30" y="30" className="text-xs fill-gray-600 font-medium">60</text>
                      <text x="30" y="80" className="text-xs fill-gray-600 font-medium">45</text>
                      <text x="30" y="130" className="text-xs fill-gray-600 font-medium">30</text>
                      <text x="30" y="180" className="text-xs fill-gray-600 font-medium">15</text>
                      <text x="30" y="230" className="text-xs fill-gray-600 font-medium">0</text>
                      
                      {/* Grid lines */}
                      <line x1="60" y1="30" x2="560" y2="30" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="60" y1="80" x2="560" y2="80" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="60" y1="130" x2="560" y2="130" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="60" y1="180" x2="560" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="60" y1="230" x2="560" y2="230" stroke="#e5e7eb" strokeWidth="1" />
                      
                      {subscriptionData.trendData?.map((data, index) => {
                        const maxValue = Math.max(...(subscriptionData.trendData?.map(d => d.value) || [60]), 60);
                        const chartAreaHeight = 200; // 230 - 30
                        const chartBottom = 230;
                        const barHeight = (data.value / maxValue) * chartAreaHeight;
                        const barY = chartBottom - barHeight;
                        const barX = 80 + (index * 80);
                        const barWidth = 50;
                        
                        return (
                          <g key={data.month}>
                            <rect
                              x={barX}
                              y={barY}
                              width={barWidth}
                              height={barHeight}
                              fill="#10b981"
                              rx="4"
                            />
                            <text
                              x={barX + barWidth / 2}
                              y={260}
                              textAnchor="middle"
                              className="text-xs fill-gray-600 font-medium"
                            >
                              {data.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;

