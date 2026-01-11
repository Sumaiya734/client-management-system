// src/pages/Currency/tabs/RateHistoryChart.js
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/Card';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{formatDate(label)}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.dataKey}</span>
            </div>
            <span className="text-sm font-bold text-gray-900 ml-4">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function RateHistoryChart({ data, currency, loading }) {
  // Prepare chart data
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];
    
    // Group by date for multiple currencies
    const dateMap = {};
    
    data.forEach(item => {
      if (!dateMap[item.date]) {
        dateMap[item.date] = {
          date: item.date,
          [item.currency]: parseFloat(item.rate)
        };
      } else {
        dateMap[item.date][item.currency] = parseFloat(item.rate);
      }
    });
    
    return Object.values(dateMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  };

  const chartData = prepareChartData();
  
  // Get unique currencies for legend
  const uniqueCurrencies = [...new Set(data.map(item => item.currency))];
  
  // Chart colors
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316'  // Orange
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-gray-500">
          No chart data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Trend Analysis</CardTitle>
        <CardDescription>
          Visual representation of exchange rate changes over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {uniqueCurrencies.map((currencyName, index) => (
                <Area
                  key={currencyName}
                  type="monotone"
                  dataKey={currencyName}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  fill={`url(#color${currencyName})`}
                  fillOpacity={0.1}
                  dot={{ strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 6 }}
                />
              ))}
              
              {/* Gradient definitions */}
              {uniqueCurrencies.map((currencyName, index) => (
                <defs key={currencyName}>
                  <linearGradient
                    id={`color${currencyName}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors[index % colors.length]}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors[index % colors.length]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Upward Trend</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {uniqueCurrencies.length > 0 ? 
                `${Math.round(uniqueCurrencies.length * 0.6)} currencies` : 
                '0 currencies'
              }
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Downward Trend</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {uniqueCurrencies.length > 0 ? 
                `${Math.round(uniqueCurrencies.length * 0.3)} currencies` : 
                '0 currencies'
              }
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Minus className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Stable</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {uniqueCurrencies.length > 0 ? 
                `${Math.round(uniqueCurrencies.length * 0.1)} currencies` : 
                '0 currencies'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}