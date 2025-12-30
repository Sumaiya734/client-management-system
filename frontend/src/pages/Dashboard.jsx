import React, { useState, useEffect } from 'react';
import { Users, Package, FileText, DollarSign, TrendingUp, TrendingDown, AlertTriangle, FileBarChart } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { dashboardApi } from '../api';
import { formatDate } from '../utils/dateUtils';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardApi.getDashboardData();
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get stats from API data or fallback to empty values
  const summary = dashboardData?.summary || {};
  const recent = dashboardData?.recent || {};
  
  const stats = [
    { 
      name: 'Total Clients', 
      value: summary.totalClients || 0, 
      change: '+12%', 
      trend: 'up',
      icon: Users, 
      description: 'from last month' 
    },
    { 
      name: 'Active Subscriptions', 
      value: summary.activeSubscriptions || 0, 
      change: '+8%', 
      trend: 'up',
      icon: Package, 
      description: 'from last month' 
    },
    { 
      name: 'Pending Payments', 
      value: summary.pendingPayments || 0, 
      change: '-3%', 
      trend: 'down',
      icon: FileText, 
      description: 'from last month' 
    },
    { 
      name: 'Monthly Revenue', 
      value: summary.monthlyRevenue ? `$${summary.monthlyRevenue.toLocaleString()}` : '$0', 
      change: '+15%', 
      trend: 'up',
      icon: DollarSign, 
      description: 'from last month' 
    },
  ];

  const recentClients = recent.recentClients?.map(client => ({
    name: client.name || client.client_name || 'Unknown Client',
    lastPayment: formatDate(client.created_at),
    status: client.status || 'Active'
  })) || [];

  const recentPayments = recent.recentPayments?.map(payment => ({
    name: payment.client_name || payment.name || 'Unknown Client',
    amount: payment.amount ? `$${payment.amount}` : '$0',
    daysOverdue: payment.days_overdue || 'N/A'
  })) || [];

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening with your business."
          actions={
            <Button size="sm" icon={<FileBarChart className="h-3 w-3" />}>Generate Report</Button>
          }
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening with your business."
          actions={
            <Button size="sm" icon={<FileBarChart className="h-3 w-3" />}>Generate Report</Button>
          }
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-red-600">
            <p>Error loading dashboard data: {error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business."
        actions={
          <Button size="sm" icon={<FileBarChart className="h-3 w-3" />}>Generate Report</Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-2">
            <CardContent className="p-1">
              <div className="flex items-center justify-between mb-1">
                <div className="p-0.5 bg-gray-50 rounded-sm">
                  <stat.icon className="h-3 w-3 text-gray-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-0.5">{stat.name}</p>
                <p className="text-lg font-bold text-gray-900 mb-0.5">{stat.value}</p>
                <div className="flex items-center text-xs">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-2.5 w-2.5 text-green-500 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5 text-red-500 mr-0.5" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 ml-0.5 text-xs">{stat.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Clients and Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="p-3">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-base">Recent Clients</CardTitle>
            <CardDescription className="text-sm">Latest client additions and updates</CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="space-y-2">
              {recentClients.length > 0 ? (
                recentClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">Last payment: {client.lastPayment}</p>
                    </div>
                    <Badge size="sm" variant={client.status === 'Active' ? 'active' : 'inactive'}>
                      {client.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent clients</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-base">Recent Payments</CardTitle>
            <CardDescription className="text-sm">Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="space-y-2">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{payment.name}</h3>
                      <p className="text-sm text-gray-500">{payment.amount}</p>
                    </div>
                    <Badge size="sm" variant="default">
                      {payment.daysOverdue}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent payments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary */}
      <Card className="p-3">
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-base">Payment Summary</CardTitle>
          <CardDescription className="text-sm">Overall payment status and completion rate</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Payment Rate</p>
              <p className="text-lg font-bold text-gray-900">{summary.paymentRate || '0%'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-lg font-bold text-gray-900">{summary.totalBills || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
