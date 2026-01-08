import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';

const RevenueAnalysisTab = ({ loading, monthlyRevenueData }) => {
  return (
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
                  {/* Calculate dynamic max revenue for scaling */}
                  {(() => {
                    const maxRevenue = Math.max(...monthlyRevenueData.map(d => d.revenue), 1000);
                    const chartAreaHeight = 190; // 230 - 40
                    const chartBottom = 230;
                    const calculateBarHeight = (value) => (value / maxRevenue) * chartAreaHeight;
                    const calculateBarY = (value) => chartBottom - calculateBarHeight(value);
                    
                    return (
                      <>
                        {/* Y-axis labels - dynamic based on actual data */}
                        <text x="30" y="30" className="text-xs fill-gray-600 font-medium">{maxRevenue.toLocaleString()}</text>
                        <text x="30" y="80" className="text-xs fill-gray-600 font-medium">{(maxRevenue * 0.75).toLocaleString()}</text>
                        <text x="30" y="130" className="text-xs fill-gray-600 font-medium">{(maxRevenue * 0.5).toLocaleString()}</text>
                        <text x="30" y="180" className="text-xs fill-gray-600 font-medium">{(maxRevenue * 0.25).toLocaleString()}</text>
                        <text x="30" y="230" className="text-xs fill-gray-600 font-medium">0</text>
                        
                        {/* Grid lines */}
                        <line x1="60" y1="30" x2="560" y2="30" stroke="#e5e7eb" strokeWidth="1" />
                        <line x1="60" y1="80" x2="560" y2="80" stroke="#e5e7eb" strokeWidth="1" />
                        <line x1="60" y1="130" x2="560" y2="130" stroke="#e5e7eb" strokeWidth="1" />
                        <line x1="60" y1="180" x2="560" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                        <line x1="60" y1="230" x2="560" y2="230" stroke="#e5e7eb" strokeWidth="1" />
                        
                        {/* Bars - dynamic based on actual data */}
                        {monthlyRevenueData.map((data, index) => {
                          const barHeight = calculateBarHeight(data.revenue);
                          const barY = calculateBarY(data.revenue);
                          const barX = 80 + (index * (400 / Math.max(monthlyRevenueData.length - 1, 1)));
                          const barWidth = Math.min(50, 400 / monthlyRevenueData.length);
                          
                          return (
                            <g key={data.month}>
                              <rect
                                x={barX - barWidth/2}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                fill="#8b5cf6"
                                rx="4"
                              />
                              <text
                                x={barX}
                                y={260}
                                textAnchor="middle"
                                className="text-xs fill-gray-600 font-medium"
                              >
                                {data.month}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
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
  );
};

export default RevenueAnalysisTab;