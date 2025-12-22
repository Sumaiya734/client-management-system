import React, { useState } from 'react';
import { Package, AlertTriangle, Clock, CheckCircle, FileText } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchFilter } from '../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function Subscriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const summaryStats = [
    {
      title: 'Total POs',
      value: '3',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Pending',
      value: '1',
      icon: AlertTriangle,
      color: 'orange'
    },
    {
      title: 'Partial',
      value: '1',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Complete',
      value: '1',
      icon: CheckCircle,
      color: 'green'
    }
  ];

  const subscriptions = [
    {
      id: 1,
      poNumber: 'PO-2025-001',
      createdDate: '2025-01-15',
      client: {
        company: 'Acme Corp',
        contact: 'John Smith'
      },
      products: [
        {
          name: 'Zoom Pro',
          quantity: 2,
          status: 'Pending',
          action: 'Subscribe'
        },
        {
          name: 'ChatGPT Plus',
          quantity: 1,
          status: 'Active',
          dateRange: '2025-02-15 to 2026-02-14',
          action: 'Edit'
        }
      ],
      progress: {
        status: 'Partial',
        icon: Clock,
        completed: 1,
        total: 2,
        percentage: 50
      },
      totalAmount: '৳7391.08 BDT',
      canGenerateBill: false
    },
    {
      id: 2,
      poNumber: 'PO-2025-002',
      createdDate: '2025-01-10',
      client: {
        company: 'Tech Solutions Inc',
        contact: 'Sarah Johnson'
      },
      products: [
        {
          name: 'Microsoft Teams',
          quantity: 5,
          status: 'Pending',
          action: 'Subscribe'
        }
      ],
      progress: {
        status: 'Pending',
        icon: AlertTriangle,
        completed: 0,
        total: 1,
        percentage: 0
      },
      totalAmount: '৳4143.75 BDT',
      canGenerateBill: false
    },
    {
      id: 3,
      poNumber: 'PO-2024-089',
      createdDate: '2024-12-01',
      client: {
        company: 'Global Dynamics',
        contact: 'Mike Wilson'
      },
      products: [
        {
          name: 'Office 365 Business',
          quantity: 10,
          status: 'Active',
          dateRange: '2024-12-15 to 2025-12-14',
          action: 'Edit'
        },
        {
          name: 'Figma Professional',
          quantity: 3,
          status: 'Active',
          dateRange: '2024-12-20 to 2025-12-19',
          action: 'Edit'
        }
      ],
      progress: {
        status: 'Complete',
        icon: CheckCircle,
        completed: 2,
        total: 2,
        percentage: 100
      },
      totalAmount: '৳21945.30 BDT',
      canGenerateBill: true
    }
  ];

  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Complete', label: 'Complete' },
  ];

  const filters = [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
    }
  ];

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      green: 'text-green-600'
    };
    return colors[color] || 'text-gray-600';
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-orange-600';
      case 'Partial': return 'text-yellow-600';
      case 'Complete': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-gray-900 text-white';
      case 'Pending': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Management"
        subtitle="Manage software subscriptions for approved purchase orders"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <div className="flex items-center">
                <div className="p-2 bg-gray-50 rounded-lg mr-4">
                  <stat.icon className={`h-6 w-6 ${getIconColor(stat.color)}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by PO number, client, or product..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders & Subscriptions ({subscriptions.length})</CardTitle>
          <CardDescription>Manage subscriptions for approved purchase orders</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Details</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Products & Subscription Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-gray-900">{subscription.poNumber}</div>
                      <div className="text-sm text-gray-600">Created: {subscription.createdDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{subscription.client.company}</div>
                      <div className="text-sm text-gray-600">{subscription.client.contact}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-3">
                      {subscription.products.map((product, index) => (
                        <div key={index} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{product.name}</span>
                              <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded">
                                x{product.quantity}
                              </span>
                              <Badge className={`text-xs ${getStatusBadgeColor(product.status)}`}>
                                {product.status}
                              </Badge>
                            </div>
                            <Button 
                              variant={product.action === 'Subscribe' ? 'primary' : 'outline'}
                              size="xs"
                              className="text-xs"
                            >
                              {product.action}
                            </Button>
                          </div>
                          {product.dateRange && (
                            <div className="text-sm text-gray-600">{product.dateRange}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <subscription.progress.icon className={`h-4 w-4 ${getProgressColor(subscription.progress.status)}`} />
                      <div>
                        <div className={`font-medium ${getProgressColor(subscription.progress.status)}`}>
                          {subscription.progress.status}
                        </div>
                        <div className="text-sm text-gray-600">
                          {subscription.progress.completed}/{subscription.progress.total} products ({subscription.progress.percentage}%)
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900">{subscription.totalAmount}</div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      icon={<FileText className="h-3 w-3" />}
                      disabled={!subscription.canGenerateBill}
                    >
                      Generate Bill
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
