import React, { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchFilter } from '../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const summaryStats = [
    {
      title: 'Total Received',
      value: '$114.99',
      icon: DollarSign,
    },
    {
      title: 'Pending Payments',
      value: '$150.00',
      icon: AlertTriangle,
    },
    {
      title: 'Outstanding Balance',
      value: '$314.98',
      icon: CheckCircle,
    },
    {
      title: 'Total Transactions',
      value: '5',
      icon: FileText,
    }
  ];

  const payments = [
    {
      id: 1,
      poNumber: 'PO-2025-001',
      client: {
        company: 'Acme Corp',
        contact: 'John Smith'
      },
      date: '2025-01-16',
      amount: '$99.99',
      method: 'Credit Card',
      transactionId: 'TXN-2025-001',
      status: 'Completed',
      receipt: 'Generated'
    },
    {
      id: 2,
      poNumber: 'PO-2025-002',
      client: {
        company: 'Tech Solutions Inc',
        contact: 'Sarah Johnson'
      },
      date: '2025-01-12',
      amount: '$15.00',
      method: 'Bank Transfer',
      transactionId: 'TXN-2025-002',
      status: 'Completed',
      receipt: 'Generated'
    },
    {
      id: 3,
      poNumber: 'PO-2024-089',
      client: {
        company: 'Global Dynamics',
        contact: 'Mike Wilson'
      },
      date: '2024-12-15',
      amount: '$150.00',
      method: 'Check',
      transactionId: 'CHK-2024-089',
      status: 'Pending',
      receipt: 'Not Generated'
    }
  ];

  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Pending', label: 'Pending' },
  ];

  const filters = [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Management"
        subtitle="Record payments and track outstanding balances"
        actions={
          <Button icon={<Plus className="h-4 w-4" />}>
            Record Payment
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <stat.icon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by PO number, client, or transaction ID..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Payments ({payments.length})</CardTitle>
          <CardDescription>Track all payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.poNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{payment.client.company}</div>
                      <div className="text-sm text-gray-600">{payment.client.contact}</div>
                    </div>
                  </TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{payment.transactionId}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'Completed' ? 'active' : 'inactive'}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.receipt === 'Generated' ? 'active' : 'inactive'}>
                      {payment.receipt}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Edit payment"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Delete payment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
