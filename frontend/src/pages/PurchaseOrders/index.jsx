import React, { useState, useEffect } from 'react';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import CreatePurchaseOrderPopup from '../../components/PurchaseOrders/CreatePurchaseOrderPopup';
import api from '../../api';

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(true);
  
  // Create PO popup state
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // Fetch purchase orders from API
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/purchases');
      if (response.data.success) {
        setPurchaseOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'N/A';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const startFormatted = startDate.toString() !== 'Invalid Date' ? startDate.toLocaleDateString() : 'Invalid Date';
    const endFormatted = endDate.toString() !== 'Invalid Date' ? endDate.toLocaleDateString() : 'Invalid Date';
    
    return `${startFormatted} to ${endFormatted}`;
  };

  const formatCurrency = (amount) => {
    if (typeof amount === 'number') {
      return amount.toFixed(2);
    } else if (typeof amount === 'string') {
      const parsed = parseFloat(amount);
      return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
    }
    return '0.00';
  };

  // Handle opening create popup
  const handleCreatePO = () => {
    setIsCreatePopupOpen(true);
  };

  // Handle closing create popup
  const handleCloseCreatePopup = () => {
    setIsCreatePopupOpen(false);
  };

  // Handle creating new purchase order
  const handleCreatePurchaseOrder = async (orderData) => {
    try {
      // Format the data for the API
      const purchaseData = {
        po_number: orderData.poNumber,
        status: orderData.status,
        client_id: orderData.clientId,
        product_id: orderData.productId,
        quantity: orderData.quantity,
        subscription_start: orderData.subscriptionStart,
        subscription_end: orderData.subscriptionEnd,
        subscription_active: orderData.subscriptionActive,
        total_amount: 0 // Backend will calculate this
      };
      
      const response = await api.post('/purchases', purchaseData);
      
      if (response.data.success) {
        // Refresh the purchase orders list
        fetchPurchaseOrders();
        console.log('Created new purchase order:', response.data.data);
      } else {
        console.error('Failed to create purchase order:', response.data.message);
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
    }
  };

  // Handle deleting purchase order
  const handleDeletePO = async (po) => {
    if (window.confirm(`Are you sure you want to delete ${po.po_number || po.poNumber}?`)) {
      try {
        const response = await api.delete(`/purchases/${po.id}`);
        if (response.data.success) {
          // Refresh the purchase orders list
          fetchPurchaseOrders();
          console.log('Deleted purchase order:', po);
        } else {
          console.error('Failed to delete purchase order:', response.data.message);
        }
      } catch (error) {
        console.error('Error deleting purchase order:', error);
        alert('Failed to delete purchase order');
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Create and manage purchase orders from clients"
        actions={
          <Button 
            icon={<Plus className="h-4 w-4" />}
            onClick={handleCreatePO}
          >
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                    Loading purchase orders...
                  </TableCell>
                </TableRow>
              ) : purchaseOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-gray-900">{po.po_number || po.poNumber}</div>
                        <div className="text-sm text-gray-600">Created: {po.created_at ? new Date(po.created_at).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{po.client?.company || po.client}</div>
                        <div className="text-sm text-gray-600">{po.client?.contact || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {po.product ? (
                          <div className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{po.product?.product_name || po.product?.name || 'N/A'}</span>
                              <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded">
                                x{po.quantity || 1}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDateRange(po.subscription_start, po.subscription_end)}
                            </div>
                          </div>
                        ) : (
                          <div>N/A</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-900">৳{formatCurrency(po.total_amount || po.totalAmount)} BDT</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`text-xs ${getStatusColor(po.status || 'Draft')}`}
                      >
                        {po.status || 'Draft'}
                      </Badge>
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
                          onClick={() => handleDeletePO(po)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Purchase Order Popup */}
      <CreatePurchaseOrderPopup
        isOpen={isCreatePopupOpen}
        onClose={handleCloseCreatePopup}
        onCreate={handleCreatePurchaseOrder}
      />
    </div>
  );
}
