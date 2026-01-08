import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';

const OverviewTab = ({ 
  loading, 
  overviewRevenueData, 
  subscriptionDistribution, 
  revenueByCurrency 
}) => {
  return (
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
            ) : overviewRevenueData.length === 0 ? (
              <p className="text-gray-500">No revenue data available for the selected period</p>
            ) : (
              <div className="w-full h-full relative">
                <svg className="w-full h-full" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet">
                  {/* Calculate max revenue for scaling */}
                  {(() => {
                    const maxRevenue = Math.max(...overviewRevenueData.map(d => d.revenue), 1000);
                    const chartAreaHeight = 190; // 230 - 40
                    const chartBottom = 230;
                    const calculateBarHeight = (value) => (value / maxRevenue) * chartAreaHeight;
                    const calculateBarY = (value) => chartBottom - calculateBarHeight(value);
                    
                    return (
                      <>
                        {/* Y-axis labels */}
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
                        
                        {/* Revenue bars and line */}
                        {overviewRevenueData.map((data, index) => {
                          const barHeight = calculateBarHeight(data.revenue);
                          const barY = calculateBarY(data.revenue);
                          const barX = 80 + (index * (480 / Math.max(overviewRevenueData.length - 1, 1)));
                          const barWidth = Math.min(40, 400 / overviewRevenueData.length);
                          
                          return (
                            <g key={data.month}>
                              {/* Revenue bar */}
                              <rect
                                x={barX - barWidth/2}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                fill="#8b5cf6"
                                rx="4"
                                opacity="0.3"
                              />
                              
                              {/* Month label */}
                              <text
                                x={barX}
                                y={260}
                                textAnchor="middle"
                                className="text-xs fill-gray-600 font-medium"
                              >
                                {data.month}
                              </text>
                              
                              {/* Revenue value label */}
                              <text
                                x={barX}
                                y={barY - 5}
                                textAnchor="middle"
                                className="text-xs fill-gray-700 font-medium"
                              >
                                ${data.revenue.toLocaleString()}
                              </text>
                            </g>
                          );
                        })}
                        
                        {/* Revenue trend line */}
                        {overviewRevenueData.length > 1 && (
                          <>
                            <polyline
                              points={overviewRevenueData.map((data, index) => {
                                const x = 80 + (index * (480 / Math.max(overviewRevenueData.length - 1, 1)));
                                const y = calculateBarY(data.revenue);
                                return `${x},${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#8b5cf6"
                              strokeWidth="3"
                            />
                            
                            {/* Data points */}
                            {overviewRevenueData.map((data, index) => {
                              const x = 80 + (index * (480 / Math.max(overviewRevenueData.length - 1, 1)));
                              const y = calculateBarY(data.revenue);
                              return (
                                <circle 
                                  key={`point-${index}`}
                                  cx={x} 
                                  cy={y} 
                                  r="4" 
                                  fill="#8b5cf6" 
                                />
                              );
                            })}
                          </>
                        )}
                      </>
                    );
                  })()}
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
              ) : subscriptionDistribution.length === 0 ? (
                <p className="text-gray-500">No subscription data available</p>
              ) : (
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Generate pie chart slices */}
                    {(() => {
                      let cumulativePercentage = 0;
                      const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
                      
                      return subscriptionDistribution.map((item, index) => {
                        const percentage = item.percentage / 100;
                        const startAngle = cumulativePercentage * 2 * Math.PI;
                        const endAngle = (cumulativePercentage + percentage) * 2 * Math.PI;
                        
                        // Calculate arc path
                        const radius = 80;
                        const centerX = 100;
                        const centerY = 100;
                        
                        const x1 = centerX + radius * Math.cos(startAngle - Math.PI / 2);
                        const y1 = centerY + radius * Math.sin(startAngle - Math.PI / 2);
                        const x2 = centerX + radius * Math.cos(endAngle - Math.PI / 2);
                        const y2 = centerY + radius * Math.sin(endAngle - Math.PI / 2);
                        
                        const largeArcFlag = percentage > 0.5 ? 1 : 0;
                        
                        const pathData = [
                          `M ${centerX} ${centerY}`,
                          `L ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          'Z'
                        ].join(' ');
                        
                        cumulativePercentage += percentage;
                        
                        return (
                          <g key={item.name}>
                            <path
                              d={pathData}
                              fill={colors[index % colors.length]}
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          </g>
                        );
                      });
                    })()}
                    
                    {/* Center text showing the main product */}
                    {subscriptionDistribution.length > 0 && (
                      <>
                        <text x="100" y="95" textAnchor="middle" className="text-xs fill-gray-600 font-medium">
                          {subscriptionDistribution[0].name}
                        </text>
                        <text x="100" y="110" textAnchor="middle" className="text-xs fill-gray-500">
                          {subscriptionDistribution[0].percentage}%
                        </text>
                      </>
                    )}
                  </svg>
                  
                  {/* Legend */}
                  <div className="absolute -bottom-2 left-0 right-0">
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      {subscriptionDistribution.map((item, index) => {
                        const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
                        return (
                          <div key={item.name} className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-gray-600 truncate max-w-20">
                              {item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
            {loading.overview ? (
              <div className="flex justify-center items-center h-32">
                <p>Loading revenue data...</p>
              </div>
            ) : revenueByCurrency.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">No currency data available</p>
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
  );
};

export default OverviewTab;