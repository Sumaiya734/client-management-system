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
      setPurchaseOrders(response.data); // response.data is the array after interceptor
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      alert('Error loading purchase orders: ' + (error.response?.data?.message || error.message));
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
    { value: 'Expiring Soon', label: 'Expiring Soon' },
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
    const startFormatted = startDate.toString() !== 'Invalid Date' ? startDate.toLocaleDateString() : 'Invalid';
    const endFormatted = endDate.toString() !== 'Invalid Date' ? endDate.toLocaleDateString() : 'Invalid';
    return `${startFormatted} to ${endFormatted}`;
  };

  const formatCurrency = (amount) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount || 0);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Handle opening create popup
  const handleCreatePO = () => {
    setIsCreatePopupOpen(true);
  };

  // Handle closing create popup
  const handleCloseCreatePopup = () => {
    setIsCreatePopupOpen(false);
  };

  // Handle creating new purchase order - FIXED VERSION
  const handleCreatePurchaseOrder = async (orderData) => {
    try {
      let response;
      
      if (orderData.attachment && orderData.attachment instanceof File) {
        // Use FormData when there's an attachment
        const formData = new FormData();
        formData.append('status', orderData.status);
        formData.append('client_id', orderData.clientId.toString());
        
        // Handle products - convert to the format expected by backend
        if (orderData.products && Array.isArray(orderData.products) && orderData.products.length > 0) {
          orderData.products.forEach((product, index) => {
            formData.append(`products[${index}][productId]`, product.productId.toString());
            formData.append(`products[${index}][quantity]`, product.quantity.toString());
            formData.append(`products[${index}][subscription_start]`, product.subscriptionStart);
            formData.append(`products[${index}][subscription_end]`, product.subscriptionEnd);
          });
        } else {
          // Fallback to single product if no products array
          formData.append('product_id', orderData.productId.toString());
          formData.append('quantity', orderData.quantity.toString());
          formData.append('subscription_start', orderData.subscriptionStart);
          formData.append('subscription_end', orderData.subscriptionEnd);
        }
        
        formData.append('subscription_active', orderData.subscriptionActive ? '1' : '0');
        formData.append('total_amount', '0'); // backend calculate করে নেবে
        if (orderData.attachment) {
          formData.append('attachment', orderData.attachment, orderData.attachment.name);
        }
        
        // Use axios with proper headers for file upload
        response = await api.post('/purchases', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Prepare data exactly as backend expects (no attachment)
        const purchaseData = {
          // po_number পাঠাবে না → backend নিজেই generate করে
          status: orderData.status,
          client_id: orderData.clientId,
          products: orderData.products, // Send products array if available
          subscription_active: orderData.subscriptionActive ? 1 : 0, // boolean → 1/0
          total_amount: 0 // backend calculate করে নেবে
        };
        
        // Only add single product fields if no products array is provided
        if (!orderData.products || !Array.isArray(orderData.products) || orderData.products.length === 0) {
          purchaseData.product_id = orderData.productId;
          purchaseData.quantity = parseInt(orderData.quantity, 10); // নিশ্চিত integer
          purchaseData.subscription_start = orderData.subscriptionStart; // YYYY-MM-DD format হতে হবে
          purchaseData.subscription_end = orderData.subscriptionEnd;     // YYYY-MM-DD format হতে হবে
        }
        
        console.log('Sending purchase data:', purchaseData); // ডিবাগিংয়ের জন্য
        
        response = await api.post('/purchases', purchaseData);
      }
      
      // Success → refresh list
      fetchPurchaseOrders();
      setIsCreatePopupOpen(false); // popup বন্ধ করো
      alert('Purchase order created successfully!');
      console.log('Created purchase:', response.data);
    } catch (error) {
      console.error('Error creating purchase order:', error);

      // Validation error details দেখাও
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        console.log('Validation errors:', errors);
        const errorMessages = Object.values(errors).flat().join(', ');
        alert('Validation failed: ' + errorMessages);
      } else {
        alert('Failed to create purchase order: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Handle deleting purchase order
  const handleDeletePO = async (po) => {
    if (window.confirm(`Are you sure you want to delete PO ${po.po_number || po.poNumber}?`)) {
      try {
        await api.delete(`/purchases/${po.id}`);
        fetchPurchaseOrders();
        alert('Purchase order deleted successfully');
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete: ' + (error.response?.data?.message || error.message));
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
                        <div className="font-semibold text-gray-900">{po.po_number}</div>
                        <div className="text-sm text-gray-600">
                          Created: {po.created_at ? new Date(po.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{po.client?.company || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{po.cli_name || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {po.products && po.products.length > 0 ? (
                          po.products.map((product, index) => (
                            <div key={index} className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {product.product_name || 'N/A'}
                                </span>
                                <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded">
                                  x{product.quantity || 1}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDateRange(product.subscription_start, product.subscription_end)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div>N/A</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-900">
                        ৳{formatCurrency(po.total_amount)} BDT
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(po.status)}`}>
                        {po.status || 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="text-xs" icon={<FileText className="h-3 w-3" />}>
                          Generate Bill
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Delete"
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