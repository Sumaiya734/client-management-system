import React, { useState, useEffect } from 'react';
import { Users, Package, FileText, DollarSign, TrendingUp, TrendingDown, AlertTriangle, FileBarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { dashboardApi } from '../api';
import { formatDate } from '../utils/dateUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getDashboardData();
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get stats from API data or fallback to empty values
  const summary = dashboardData?.summary || {};
  const recent = dashboardData?.recent || {};
  
  // Get expiring soon subscriptions
  const expiringSoonSubscriptionsData = dashboardData?.recent?.expiringSoonSubscriptions || [];
  
  const expiringSoonSubscriptions = Array.isArray(expiringSoonSubscriptionsData) ? expiringSoonSubscriptionsData.map(sub => ({
    id: sub.id,
    productName: sub.product_name || 'N/A',
    client: sub.client?.company || sub.client?.cli_name || 'N/A',
    endDate: sub.end_date || 'N/A',
    poNumber: sub.poNumber || 'N/A',
    status: sub.status || 'N/A'
  })) : [];
  
  const handleCardClick = (cardName) => {
    switch(cardName) {
      case 'Total Clients':
        navigate('/clients');
        break;
      case 'Total Vendors':
        navigate('/vendors');
        break;
      case 'Total Products':
        navigate('/products');
        break;
      case 'Total Purchases':
        navigate('/purchases');
        break;
      case 'Active Subscriptions':
        navigate('/subscriptions');
        break;
      case 'Pending Payments':
        navigate('/payments');
        break;
      case 'Monthly Revenue':
        navigate('/reports');
        break;
      case 'Expiring Soon':
        navigate('/subscriptions?tab=renewals');
        break;
      default:
        break;
    }
  };
  
  const stats = [
    { 
      name: 'Total Clients', 
      value: summary.totalClients || 0, 
      change: summary.totalClientsChange || '+0%', 
      trend: summary.totalClientsTrend || 'up',
      icon: Users, 
      description: 'from last month' 
    },
    { 
      name: 'Total Vendors', 
      value: summary.totalVendors || 0, 
      change: summary.totalVendorsChange || '+0%', 
      trend: summary.totalVendorsTrend || 'up',
      icon: Package, 
      description: 'from last month' 
    },
    { 
      name: 'Total Products', 
      value: summary.totalProducts || 0, 
      change: summary.totalProductsChange || '+0%', 
      trend: summary.totalProductsTrend || 'up',
      icon: Package, 
      description: 'from last month' 
    },
    { 
      name: 'Total Purchases', 
      value: summary.totalPurchases || 0, 
      change: summary.totalPurchasesChange || '+0%', 
      trend: summary.totalPurchasesTrend || 'up',
      icon: Package, 
      description: 'from last month' 
    },
    { 
      name: 'Active Subscriptions', 
      value: summary.activeSubscriptions || 0, 
      change: summary.activeSubscriptionsChange || '+0%', 
      trend: summary.activeSubscriptionsTrend || 'up',
      icon: Package, 
      description: 'from last month' 
    },
    { 
      name: 'Pending Payments', 
      value: summary.pendingPayments || 0, 
      change: summary.pendingPaymentsChange || '+0%', 
      trend: summary.pendingPaymentsTrend || 'up',
      icon: FileText, 
      description: 'from last month' 
    },
    { 
      name: 'Monthly Revenue', 
      value: summary.monthlyRevenue ? `$${summary.monthlyRevenue.toLocaleString()}` : '$0', 
      change: summary.monthlyRevenueChange || '+0%', 
      trend: summary.monthlyRevenueTrend || 'up',
      icon: DollarSign, 
      description: 'from last month' 
    },
    { 
      name: 'Expiring Soon', 
      value: summary.expiringSoonSubscriptions || 0, 
      change: summary.expiringSoonSubscriptionsChange || '+0%', 
      trend: summary.expiringSoonSubscriptionsTrend || 'up',
      icon: AlertTriangle, 
      description: 'from last month' 
    },
  ];

  const recentClients = recent.recentClients?.map(client => ({
    name: client.cli_name || client.name || client.client_name || 'Unknown Client',
    lastPayment: formatDate(client.created_at),
    status: client.status || 'Active'
  })) || [];

  const recentPayments = recent.recentPayments?.map(payment => ({
    name: payment.client?.cli_name || payment.client?.name || payment.client_name || payment.name || 'Unknown Client',
    amount: payment.amount ? `$${payment.amount}` : '$0',
    status: payment.status || payment.payment_status || 'Completed',
    date: formatDate(payment.created_at || payment.date || payment.payment_date)
  })) || [];

  const recentBills = recent.recentBills?.map(bill => ({
    name: bill.client?.cli_name || bill.client?.name || bill.client_name || bill.name || 'Unknown Client',
    amount: bill.total_amount ? `$${bill.total_amount}` : '$0',
    status: bill.payment_status || 'N/A'
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

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business."
        actions={
          <>
            <Button size="sm" onClick={refreshDashboard} icon={<TrendingUp className="h-3 w-3" />}>Refresh</Button>
            <Button size="sm" icon={<FileBarChart className="h-3 w-3" />}>Generate Report</Button>
          </>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card 
            key={stat.name} 
            className="p-2 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCardClick(stat.name)}
          >
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

      {/* Recent Clients, Recent Payments, and Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                    <div className="text-right">
                      <Badge size="sm" variant={payment.status === 'Completed' || payment.status === 'Paid' ? 'active' : 'inactive'}>
                        {payment.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{payment.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent payments</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-3">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-base">Recent Bills</CardTitle>
            <CardDescription className="text-sm">Latest billing records</CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="space-y-2">
              {recentBills.length > 0 ? (
                recentBills.map((bill, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{bill.name}</h3>
                      <p className="text-sm text-gray-500">{bill.amount}</p>
                    </div>
                    <Badge size="sm" variant={bill.status === 'Paid' ? 'active' : 'inactive'}>
                      {bill.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent bills</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Subscriptions */}
      <Card className="p-3 border-l-4 border-red-500">
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-base text-red-700">Expiring Soon Subscriptions</CardTitle>
          <CardDescription className="text-sm text-red-600">Subscriptions expiring soon</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-1">
          <div className="space-y-2">
            {expiringSoonSubscriptions.length > 0 ? (
              expiringSoonSubscriptions.map((sub, index) => (
                <div key={sub.id || index} className="flex items-center justify-between py-1">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{sub.productName}</h3>
                    <p className="text-sm text-gray-500">Client: {sub.client}</p>
                    <p className="text-xs text-gray-400">PO: {sub.poNumber} | End: {sub.endDate}</p>
                  </div>
                  <div className="text-right">
                    <Badge size="sm" variant={sub.status === 'Expiring Soon' ? 'destructive' : 'inactive'}>
                      {sub.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No expiring soon subscriptions</p>
            )}
          </div>
        </CardContent>
      </Card>


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
