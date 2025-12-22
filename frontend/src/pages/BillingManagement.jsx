import React, { useState } from 'react';
import { FileText, DollarSign, Calendar, Eye, Download, Send } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchFilter } from '../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function BillingManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const summaryStats = [
    {
      title: 'Total Bills',
      value: '3',
      subtext: '1 paid, 1 unpaid',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Total Revenue',
      value: '$1132.93',
      subtext: 'All billed amounts',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Amount Collected',
      value: '$289.97',
      subtext: '25.6% of total revenue',
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Outstanding',
      value: '$842.96',
      subtext: 'Pending collection',
      icon: Calendar,
      color: 'orange'
    }
  ];

  const bills = [
    {
      id: 1,
      billNumber: 'BILL-2025-001',
      client: {
        company: 'Acme Corp',
        contact: 'John Smith'
      },
      poNumber: 'PO-2025-001',
      billDate: '2025-01-20',
      dueDate: '2025-02-19',
      totalAmount: '$274.97',
      paidAmount: '$274.97',
      status: 'Paid',
      paymentStatus: 'Completed'
    },
    {
      id: 2,
      billNumber: 'BILL-2025-002',
      client: {
        company: 'Tech Solutions Inc',
        contact: 'Sarah Johnson'
      },
      poNumber: 'PO-2025-002',
      billDate: '2025-01-18',
      dueDate: '2025-02-17',
      totalAmount: '$32.98',
      paidAmount: '$15.00',
      status: 'Partially Paid',
      paymentStatus: 'Pending'
    },
    {
      id: 3,
      billNumber: 'BILL-2025-003',
      client: {
        company: 'Global Dynamics',
        contact: 'Mike Wilson'
      },
      poNumber: 'PO-2025-003',
      billDate: '2025-01-15',
      dueDate: '2025-02-14',
      totalAmount: '$824.98',
      paidAmount: '$0.00',
      status: 'Unpaid',
      paymentStatus: 'Overdue'
    }
  ];

  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Partially Paid', label: 'Partially Paid' },
    { value: 'Unpaid', label: 'Unpaid' },
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
      green: 'text-green-600',
      orange: 'text-orange-600',
      red: 'text-red-600'
    };
    return colors[color] || 'text-gray-600';
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-gray-900 text-white';
      case 'Completed': return 'bg-gray-900 text-white';
      case 'Partially Paid': return 'bg-gray-200 text-gray-700';
      case 'Pending': return 'bg-gray-200 text-gray-700';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Management"
        subtitle="Generate and manage bills from purchase orders"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" icon={<Download className="h-4 w-4" />}>
              Export Bills
            </Button>
            <Button icon={<FileText className="h-4 w-4" />}>
              Generate Report
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon className={`h-5 w-5 ${getIconColor(stat.color)}`} />
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.subtext}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by bill number, client, or PO..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Bills ({bills.length})</CardTitle>
          <CardDescription>All generated bills and payment status</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Bill Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>
                    <div className="font-semibold text-gray-900">{bill.billNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{bill.client.company}</div>
                      <div className="text-sm text-gray-600">{bill.client.contact}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{bill.poNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-900">{bill.billDate}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-900">{bill.dueDate}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{bill.totalAmount}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{bill.paidAmount}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusBadgeColor(bill.status)}`}>
                      {bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusBadgeColor(bill.paymentStatus)}`}>
                      {bill.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="View bill"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Download bill"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Send bill"
                      >
                        <Send className="h-4 w-4" />
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
