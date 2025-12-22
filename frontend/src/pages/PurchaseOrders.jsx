import React, { useState } from 'react';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchFilter } from '../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const purchaseOrders = [
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
          price: '৳2148.54',
          dateRange: '2025-02-01 to 2026-01-31'
        },
        {
          name: 'ChatGPT Plus',
          quantity: 1,
          price: '৳3094.00',
          dateRange: '2025-02-15 to 2026-02-14'
        }
      ],
      totalAmount: '৳7391.08 BDT',
      statuses: ['Active', 'Active']
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
          price: '৳828.75',
          dateRange: '2025-01-15 to 2025-12-31'
        }
      ],
      totalAmount: '৳4143.75 BDT',
      statuses: ['In Progress', 'Expiring Soon']
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
          price: '৳1657.50',
          dateRange: '2024-12-15 to 2025-12-14'
        },
        {
          name: 'Figma Professional',
          quantity: 3,
          price: '৳1790.10',
          dateRange: '2024-12-20 to 2025-12-19'
        }
      ],
      totalAmount: '৳21945.30 BDT',
      statuses: ['Completed', 'Expired']
    }
  ];

  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Expired', label: 'Expired' },
  ];

  const filters = [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
    }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Active': return 'active';
      case 'In Progress': return 'warning';
      case 'Expiring Soon': return 'danger';
      case 'Completed': return 'success';
      case 'Expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-gray-900 text-white';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Expiring Soon': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Create and manage purchase orders from clients"
        actions={
          <Button icon={<Plus className="h-4 w-4" />}>
            Create PO
          </Button>
        }
      />

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by PO number, client, or product..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders ({purchaseOrders.length})</CardTitle>
          <CardDescription>Manage purchase orders from clients. Use Subscriptions module to manage software subscriptions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Details</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Products & Subscriptions</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-gray-900">{po.poNumber}</div>
                      <div className="text-sm text-gray-600">Created: {po.createdDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{po.client.company}</div>
                      <div className="text-sm text-gray-600">{po.client.contact}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {po.products.map((product, index) => (
                        <div key={index} className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{product.name}</span>
                            <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded">
                              x{product.quantity}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">{product.price} • {product.dateRange}</div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900">{po.totalAmount}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {po.statuses.map((status, index) => (
                        <Badge 
                          key={index}
                          className={`text-xs ${getStatusColor(status)}`}
                        >
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        icon={<FileText className="h-3 w-3" />}
                      >
                        Generate Bill
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Delete purchase order"
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
