import React, { useState, useEffect } from 'react';
import { Plus, FileText, Trash2, Eye, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import CreatePurchaseOrderPopup from '../../components/PurchaseOrders/CreatePurchaseOrderPopup';
import ViewPurchaseOrderPopup from '../../components/PurchaseOrders/ViewPurchaseOrderPopup';
import ViewSubscriptionModal from '../../components/subscriptions/ViewSubscriptionModal';
import api, { invoiceApi } from '../../api';
import { formatDate, formatDateRange } from '../../utils/dateUtils';
import { useNotification } from '../../components/Notifications';

export default function PurchaseOrders() {
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null, action: null });
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
  const [isViewSubscriptionOpen, setIsViewSubscriptionOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/purchases');
      setPurchaseOrders(response.data);
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

  const getAttachmentUrl = (attachment) => {
    if (!attachment) return null;

    const baseUrl = (api?.defaults?.baseURL || 'http://localhost:8000').replace(/\/$/, '');
    const raw = String(attachment).trim();

    if (/^https?:\/\//i.test(raw)) {
      try {
        // eslint-disable-next-line no-new
        new URL(raw);
        return raw;
      } catch (e) {
        return raw.replace(/^(https?:\/\/[^/]+)(?!\/)(.+)$/i, '$1/$2');
      }
    }

    if (raw.startsWith('/')) {
      return `${baseUrl}${raw}`;
    }

    return `${baseUrl}/${raw}`;
  };

  const handleCreatePO = () => setIsCreatePopupOpen(true);
  const handleCloseCreatePopup = () => setIsCreatePopupOpen(false);
  const handleCloseViewPopup = () => setIsViewPopupOpen(false);

  const handleCreatePurchaseOrder = async (orderData) => {
    try {
      let response;
      const hasAttachment = orderData.attachment && orderData.attachment instanceof File;

      if (hasAttachment) {
        const formData = new FormData();
        Object.keys(orderData).forEach(key => {
          if (key === 'products') {
            orderData.products.forEach((p, i) => {
              formData.append(`products[${i}][productId]`, p.productId);
              formData.append(`products[${i}][quantity]`, p.quantity);
            });
          } else if (key === 'attachment') {
            if (orderData.attachment) {
              formData.append('attachment', orderData.attachment);
            }
          } else {
            // Only append non-null and non-undefined values
            if (orderData[key] !== null && orderData[key] !== undefined) {
              // Convert boolean to 1/0 for Laravel validation compatibility
              const value = typeof orderData[key] === 'boolean' ? (orderData[key] ? '1' : '0') : orderData[key];
              formData.append(key, value);
            }
          }
        });

        response = await api.post('/purchases', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/purchases', orderData);
      }

      fetchPurchaseOrders();
      setIsCreatePopupOpen(false);
      showSuccess('Purchase order created successfully!');
    } catch (error) {
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || error.message;
      showError('Validation failed: ' + msg);
    }
  };

  const handleDeletePO = (po) => setConfirmDialog({ isOpen: true, item: po, action: 'deletePO' });

  const confirmDeletePO = async () => {
    const po = confirmDialog.item;
    try {
      await api.delete(`/purchases/${po.id}`);
      fetchPurchaseOrders();
      showSuccess('Purchase order deleted successfully');
    } catch (error) {
      showError('Failed to delete: ' + (error.response?.data?.message || error.message));
    } finally {
      setConfirmDialog({ isOpen: false, item: null, action: null });
    }
  };

  const handleViewPO = (po) => {
    setSelectedPurchaseOrder(po);
    setIsViewPopupOpen(true);
  };

  // Handle viewing subscription details
  const handleViewSubscription = (po) => {
    // Format the purchase order data to match subscription format
    const formattedSubscription = {
      ...po,
      products: po.products || [],
      poNumber: po.po_number,
      startDate: po.delivery_date,
      totalAmount: po.total_amount
    };
    
    setSelectedSubscription(formattedSubscription);
    setIsViewSubscriptionOpen(true);
  };

  const handleGenerateInvoiceFromPO = async (po) => {
    try {
      const response = await invoiceApi.generateFromPurchase({ purchase_id: po.id });
      if (response.data.success) {
        showSuccess('Invoice generated successfully');
        fetchPurchaseOrders();
        const invoiceId = response.data.data.id;
        const blob = new Blob([await invoiceApi.downloadInvoice(invoiceId)], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 500);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleViewInvoicePO = async (invoiceId) => {
    try {
      const response = await invoiceApi.downloadInvoice(invoiceId);
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 500);
    } catch (error) {
      console.error('Error viewing invoice:', error);
      showError('Failed to view invoice');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Create and manage purchase orders from clients"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={handleCreatePO}
            className="rounded-full shadow-xl"   // pill-shape + shadow
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
          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">PO Details</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Client</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Products & Subscriptions</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Total Amount</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Status</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Attachment</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">Loading purchase orders...</td>
                  </tr>
                ) : purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">No purchase orders found</td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{po.po_number}</div>
                        <div className="text-xs text-gray-500">Delivery: {formatDate(po.delivery_date)}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{po.client?.company || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{po.client?.cli_name || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-2">
                          {po.products?.length > 0 ? (
                            po.products.map((p, i) => (
                              <div key={i} className="border rounded-md p-2 bg-gray-50 shadow-xl hover:shadow transition">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900 text-sm">{p.product_name}</span>
                                  <Badge className="bg-gray-800 text-white text-xs">x{p.quantity}</Badge>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">৳{formatCurrency(p.sub_total || p.price * p.quantity)}</div>
                                {/* <div className="text-xs text-gray-500 mt-1"> // subscription start and end date
                                  {p.subscription_start && p.subscription_end
                                    ? formatDateRange(p.subscription_start, p.subscription_end)
                                    : p.delivery_date
                                    ? `Delivery: ${formatDate(p.delivery_date)}`
                                    : 'N/A'}
                                </div> */}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">No products</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">৳{formatCurrency(po.total_amount)} BDT</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge className={`text-xs ${getStatusColor(po.status)}`}>{po.status || 'Draft'}</Badge>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {po.attachment ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            icon={<Paperclip className="h-3 w-3" />}
                            onClick={() => {
                              const attachmentUrl = getAttachmentUrl(po.attachment_url || po.attachment);
                              if (attachmentUrl) window.open(attachmentUrl, '_blank');
                            }}
                          >
                            View
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">No attachment</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" title="View" onClick={() => handleViewSubscription(po)}>
                            <Eye className="h-4 w-4" />
                          </Button>

                          {po.invoice?.length > 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              icon={<FileText className="h-3 w-3" />}
                              onClick={() => handleViewInvoicePO(po.invoice[0].id)}
                            >
                              View Bill
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              icon={<FileText className="h-3 w-3" />}
                              onClick={() => handleGenerateInvoiceFromPO(po)}
                            >
                              Generate
                            </Button>
                          )}

                          <Button variant="outline" size="icon" title="Delete" onClick={() => handleDeletePO(po)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CreatePurchaseOrderPopup
        isOpen={isCreatePopupOpen}
        onClose={handleCloseCreatePopup}
        onCreate={handleCreatePurchaseOrder}
      />

      <ViewPurchaseOrderPopup
        isOpen={isViewPopupOpen}
        onClose={handleCloseViewPopup}
        purchaseOrder={selectedPurchaseOrder}
      />

      {/* View Subscription Modal */}
      <ViewSubscriptionModal
        subscription={selectedSubscription}
        isOpen={isViewSubscriptionOpen}
        onClose={() => {
          setIsViewSubscriptionOpen(false);
          setSelectedSubscription(null);
        }}
      />

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete PO <strong>{confirmDialog.item?.po_number}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => setConfirmDialog({ isOpen: false, item: null, action: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
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