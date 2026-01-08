import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';

const SubscriptionsTab = ({ loading, subscriptionData }) => {
  return (
    <div className="space-y-6">
      {loading.subscription ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading subscription data...</p>
        </div>
      ) : (
        <>
          {/* Subscription Plan Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionData.planSummary?.length > 0 ? (
              subscriptionData.planSummary.map((plan, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{plan.planName || 'Unknown Plan'}</CardTitle>
                    <CardDescription className="text-xs">Plan details</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Active Subscriptions</p>
                        <p className="text-lg font-bold text-gray-900">{plan.activeSubscriptions || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Monthly Revenue</p>
                        <p className="text-sm font-semibold text-gray-900">${plan.monthlyRevenue?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Avg per Subscription</p>
                        <p className="text-sm font-medium text-gray-900">${plan.avgPerSubscription?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center h-32 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-sm">No subscription plans found for the selected period</p>
              </div>
            )}
          </div>

          {/* Subscription Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Trends</CardTitle>
              <CardDescription>Growth in subscription count over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-50 rounded-lg p-6">
                {subscriptionData.trendData?.length > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet">
                    {/* Calculate dynamic max value for scaling */}
                    {(() => {
                      const maxValue = Math.max(...(subscriptionData.trendData?.map(d => d.value) || [10]), 10);
                      const chartAreaHeight = 200; // 230 - 30
                      const chartBottom = 230;
                      
                      return (
                        <>
                          {/* Y-axis labels - dynamic based on actual data */}
                          <text x="30" y="30" className="text-xs fill-gray-600 font-medium">{maxValue}</text>
                          <text x="30" y="80" className="text-xs fill-gray-600 font-medium">{Math.round(maxValue * 0.75)}</text>
                          <text x="30" y="130" className="text-xs fill-gray-600 font-medium">{Math.round(maxValue * 0.5)}</text>
                          <text x="30" y="180" className="text-xs fill-gray-600 font-medium">{Math.round(maxValue * 0.25)}</text>
                          <text x="30" y="230" className="text-xs fill-gray-600 font-medium">0</text>
                          
                          {/* Grid lines */}
                          <line x1="60" y1="30" x2="560" y2="30" stroke="#e5e7eb" strokeWidth="1" />
                          <line x1="60" y1="80" x2="560" y2="80" stroke="#e5e7eb" strokeWidth="1" />
                          <line x1="60" y1="130" x2="560" y2="130" stroke="#e5e7eb" strokeWidth="1" />
                          <line x1="60" y1="180" x2="560" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                          <line x1="60" y1="230" x2="560" y2="230" stroke="#e5e7eb" strokeWidth="1" />
                          
                          {/* Bars - dynamic based on actual data */}
                          {subscriptionData.trendData?.map((data, index) => {
                            const barHeight = (data.value / maxValue) * chartAreaHeight;
                            const barY = chartBottom - barHeight;
                            const barX = 80 + (index * (400 / Math.max(subscriptionData.trendData.length - 1, 1)));
                            const barWidth = Math.min(50, 400 / subscriptionData.trendData.length);
                            
                            return (
                              <g key={data.month}>
                                <rect
                                  x={barX - barWidth/2}
                                  y={barY}
                                  width={barWidth}
                                  height={barHeight}
                                  fill="#10b981"
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
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500 text-sm">No subscription trend data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SubscriptionsTab;