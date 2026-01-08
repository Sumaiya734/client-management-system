// src/pages/Currency/tabs/RateHistoryTab.js
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from '../../../components/ui/Card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '../../../components/ui/Table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { 
  Download, 
  Calendar, 
  Filter, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { currencyRatesApi } from '../../../api';
import { useNotification } from '../../../components/Notifications';
import RateHistoryChart from './RateHistoryChart';
import RateHistoryExport from './RateHistoryExport';

export default function RateHistoryTab() {
  const { showError, showSuccess } = useNotification();
  const [rateHistory, setRateHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('ALL');
  const [timeRange, setTimeRange] = useState('7d');
  const [currencies, setCurrencies] = useState([]);
  const [stats, setStats] = useState({
    highest: 0,
    lowest: 0,
    average: 0,
    change: 0
  });

  // Time range options
  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last 1 Year' },
    { value: 'all', label: 'All Time' }
  ];

  // Fetch rate history
  const fetchRateHistory = async () => {
    try {
      setLoading(true);
      const params = {
        currency: selectedCurrency !== 'ALL' ? selectedCurrency : undefined,
        days: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 
              timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : undefined
      };

      const response = await currencyRatesApi.getHistory(params);
      
      if (response.data && Array.isArray(response.data.history)) {
        const historyData = response.data.history.map(item => ({
          id: item.id,
          date: item.date,
          currency: item.currency,
          rate: parseFloat(item.rate).toFixed(4),
          change: parseFloat(item.change).toFixed(4),
          percentageChange: parseFloat(item.percentage_change).toFixed(2),
          trend: item.trend,
          timestamp: item.timestamp
        }));
        
        setRateHistory(historyData);
        
        // Calculate statistics
        if (historyData.length > 0) {
          const rates = historyData.map(item => parseFloat(item.rate));
          const changes = historyData.map(item => parseFloat(item.change));
          
          setStats({
            highest: Math.max(...rates).toFixed(4),
            lowest: Math.min(...rates).toFixed(4),
            average: (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(4),
            change: changes.reduce((a, b) => a + b, 0).toFixed(4)
          });
        }
        
        // Extract unique currencies
        const uniqueCurrencies = [...new Set(historyData.map(item => item.currency))];
        setCurrencies(uniqueCurrencies);
      }
      
      showSuccess('Rate history updated');
    } catch (err) {
      console.error('Error fetching rate history:', err);
      showError('Failed to load rate history');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRateHistory();
  }, [selectedCurrency, timeRange]);

  // Handle refresh
  const handleRefresh = () => {
    fetchRateHistory();
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get change color class
  const getChangeColor = (change) => {
    const numChange = parseFloat(change);
    if (numChange > 0) return 'text-green-600 bg-green-50';
    if (numChange < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Currency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <option value="ALL">All Currencies</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}/BDT
                  </option>
                ))}
              </Select>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <RateHistoryExport 
                data={rateHistory}
                currency={selectedCurrency}
                timeRange={timeRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Highest Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.highest}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lowest Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.lowest}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.average}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Minus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Change</p>
                <p className={`text-2xl font-bold mt-2 ${
                  parseFloat(stats.change) > 0 ? 'text-green-600' : 
                  parseFloat(stats.change) < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {stats.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                parseFloat(stats.change) > 0 ? 'bg-green-100' : 
                parseFloat(stats.change) < 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {parseFloat(stats.change) > 0 ? 
                  <TrendingUp className="h-6 w-6 text-green-600" /> : 
                  parseFloat(stats.change) < 0 ? 
                  <TrendingDown className="h-6 w-6 text-red-600" /> :
                  <Minus className="h-6 w-6 text-gray-600" />
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <RateHistoryChart 
        data={rateHistory}
        currency={selectedCurrency}
        loading={loading}
      />

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rate History Details</CardTitle>
          <CardDescription>
            Showing {rateHistory.length} records for {selectedCurrency === 'ALL' ? 'all currencies' : `${selectedCurrency}/BDT`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : rateHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No historical data available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Currency Pair</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">% Change</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead>Updated By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateHistory.map((history) => (
                    <TableRow key={history.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>{history.date}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(history.timestamp).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{history.currency}/BDT</div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-900">
                        {history.rate}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getChangeColor(history.change)
                        }`}>
                          {parseFloat(history.change) > 0 ? '+' : ''}
                          {history.change}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getChangeColor(history.percentageChange)
                        }`}>
                          {parseFloat(history.percentageChange) > 0 ? '+' : ''}
                          {history.percentageChange}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getTrendIcon(history.trend)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">System</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}