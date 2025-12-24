import React from 'react';
import { Users, Package, FileText, DollarSign, TrendingUp, TrendingDown, AlertTriangle, FileBarChart } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const stats = [
    { 
      name: 'Total Clients', 
      value: '145', 
      change: '+12%', 
      trend: 'up',
      icon: Users, 
      description: 'from last month' 
    },
    { 
      name: 'Active Subscriptions', 
      value: '89', 
      change: '+8%', 
      trend: 'up',
      icon: Package, 
      description: 'from last month' 
    },
    { 
      name: 'Pending Payments', 
      value: '12', 
      change: '-3%', 
      trend: 'down',
      icon: FileText, 
      description: 'from last month' 
    },
    { 
      name: 'Monthly Revenue', 
      value: '$45,650', 
      change: '+15%', 
      trend: 'up',
      icon: DollarSign, 
      description: 'from last month' 
    },
  ];

  const recentClients = [
    { name: 'Acme Corp', lastPayment: '2025-01-15', status: 'Active' },
    { name: 'Tech Solutions', lastPayment: '2025-01-10', status: 'Pending' },
    { name: 'Global Dynamics', lastPayment: '2025-01-18', status: 'Active' },
  ];

  const upcomingRenewals = [
    { name: 'Acme Corp', plan: 'Premium Plan', renewalDate: '2025-02-01' },
    { name: 'Tech Solutions', plan: 'Basic Plan', renewalDate: '2025-02-05' },
    { name: 'StartupXYZ', plan: 'Enterprise Plan', renewalDate: '2025-02-10' },
  ];

  const overduePayments = [
    { name: 'Old Client Co', amount: '$2500', daysOverdue: '15 days overdue' },
    { name: 'Delayed Corp', amount: '$1800', daysOverdue: '8 days overdue' },
  ];

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

      {/* Recent Clients and Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="p-3">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-base">Recent Clients</CardTitle>
            <CardDescription className="text-sm">Latest client additions and updates</CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="space-y-2">
              {recentClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">Last payment: {client.lastPayment}</p>
                  </div>
                  <Badge size="sm" variant={client.status === 'Active' ? 'active' : 'inactive'}>
                    {client.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-base">Upcoming Renewals</CardTitle>
            <CardDescription className="text-sm">Subscriptions due for renewal soon</CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="space-y-2">
              {upcomingRenewals.map((renewal, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{renewal.name}</h3>
                    <p className="text-sm text-gray-500">{renewal.plan}</p>
                  </div>
                  <Badge size="sm" variant="default">
                    {renewal.renewalDate}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Payments Alert */}
      <Card className="bg-red-50 border-red-200 p-3">
        <CardContent className="p-2">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div className="ml-2 flex-1">
              <h3 className="text-sm font-medium text-red-800">Overdue Payments</h3>
              <p className="text-sm text-red-700 mt-1">These payments require immediate attention</p>
              <div className="mt-2 space-y-2">
                {overduePayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border border-red-200">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{payment.name}</h4>
                      <p className="text-sm text-gray-600">{payment.amount} • {payment.daysOverdue}</p>
                    </div>
                    <Button size="sm">Send Reminder</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
