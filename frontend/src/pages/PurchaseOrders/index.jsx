import React, { useState, useEffect } from 'react';
import { Plus, FileText, Trash2, Eye } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import CreatePurchaseOrderPopup from '../../components/PurchaseOrders/CreatePurchaseOrderPopup';
import ViewPurchaseOrderPopup from '../../components/PurchaseOrders/ViewPurchaseOrderPopup';
import api from '../../api';
import { formatDate, formatDateRange } from '../../utils/dateUtils';
import { useNotification } from '../../components/Notifications';

export default function PurchaseOrders() {
  const { showError, showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(true);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });
  
  // Create PO popup state
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

  // View PO popup state
  const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);

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
      showError('Error loading purchase orders: ' + (error.response?.data?.message || error.message));
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
        formData.append('client_id', orderData.client_id.toString());
        formData.append('product_id', orderData.product_id.toString());
        formData.append('quantity', orderData.quantity.toString());
        formData.append('subscription_active', orderData.subscription_active ? '1' : '0');
        
        // Add subscription fields if they exist
        if (orderData.subscription_type) {
          formData.append('subscription_type', orderData.subscription_type);
        }
        if (orderData.recurring_count) {
          formData.append('recurring_count', orderData.recurring_count.toString());
        }
        if (orderData.delivery_date) {
          formData.append('delivery_date', orderData.delivery_date);
        }
        
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
          status: orderData.status,
          client_id: orderData.client_id,
          product_id: orderData.product_id,
          quantity: parseInt(orderData.quantity, 10),
          subscription_active: Boolean(orderData.subscription_active),
          subscription_type: orderData.subscription_type,
          recurring_count: orderData.recurring_count,
          delivery_date: orderData.delivery_date
        };
        
        console.log('Sending purchase data:', purchaseData);
        
        response = await api.post('/purchases', purchaseData);
      }
      
      // Success → refresh list
      fetchPurchaseOrders();
      setIsCreatePopupOpen(false);
      showSuccess('Purchase order created successfully!');
      console.log('Created purchase:', response.data);
    } catch (error) {
      console.error('Error creating purchase order:', error);

      // Validation error details
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        console.log('Validation errors:', errors);
        const errorMessages = Object.values(errors).flat().join(', ');
        showError('Validation failed: ' + errorMessages);
      } else {
        showError('Failed to create purchase order: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Handle deleting purchase order
  const handleDeletePO = (po) => {
    setConfirmDialog({
      isOpen: true,
      item: po,
      action: 'deletePO'
    });
  };

  // Confirm purchase order deletion
  const confirmDeletePO = async () => {
    const po = confirmDialog.item;
    try {
      await api.delete(`/purchases/${po.id}`);
      fetchPurchaseOrders();
      showSuccess('Purchase order deleted successfully');
      setConfirmDialog({ isOpen: false, item: null, action: null });
    } catch (error) {
      console.error('Error deleting:', error);
      showError('Failed to delete: ' + (error.response?.data?.message || error.message));
      setConfirmDialog({ isOpen: false, item: null, action: null });
    }
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, item: null, action: null });
  };

  // Handle opening view popup
  const handleViewPO = (po) => {
    setSelectedPurchaseOrder(po);
    setIsViewPopupOpen(true);
  };

  // Handle closing view popup
  const handleCloseViewPopup = () => {
    setIsViewPopupOpen(false);
    setSelectedPurchaseOrder(null);
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
                          Created: {formatDate(po.created_at)}
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
                                {product.subscription_start && product.subscription_end 
                                  ? formatDateRange(product.subscription_start, product.subscription_end)
                                  : product.delivery_date 
                                    ? `Delivery: ${formatDate(product.delivery_date)}`
                                    : 'N/A'
                                }
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
                        <Button
                          variant="outline"
                          size="icon"
                          title="View"
                          onClick={() => handleViewPO(po)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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

      {/* View Purchase Order Popup */}
      <ViewPurchaseOrderPopup
        isOpen={isViewPopupOpen}
        onClose={handleCloseViewPopup}
        purchaseOrder={selectedPurchaseOrder}
      />
      
      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete PO <strong>{confirmDialog.item?.po_number}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={closeConfirmDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={confirmDeletePO}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
