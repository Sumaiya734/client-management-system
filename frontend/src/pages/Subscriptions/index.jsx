import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Clock, CheckCircle, FileText } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import SubscriptionModal from '../../components/subscriptions/SubscriptionModal';
import api from '../../api';
import { invoiceApi } from '../../api';
import { useNotification } from '../../components/Notifications';
import { formatDate, formatDateRange } from '../../utils/dateUtils';

export default function Subscriptions() {
  const { showError, showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedTotalAmount, setSelectedTotalAmount] = useState(null);
  const [originalSubscription, setOriginalSubscription] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);

  // Fetch subscriptions from API
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions');
      console.log('Raw API response:', response.data);

      // Transform the API response to ensure client data has proper structure
      const transformedSubscriptions = response.data.map(subscription => {
        console.log('Processing subscription:', subscription);
        console.log('Subscription products:', subscription.products);

        return {
          ...subscription,
          client: {
            ...subscription.client,
            company: subscription.client?.company || subscription.client || 'N/A',
            cli_name: subscription.client?.cli_name || subscription.client?.contact || 'N/A'
          }
        };
      });

      console.log('Transformed subscriptions:', transformedSubscriptions);
      setSubscriptions(transformedSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const summaryStats = [
    {
      title: 'Total Subscriptions',
      value: subscriptions.length.toString(),
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Active',
      value: subscriptions.filter(s => s.products.some(p => p.status === 'Active')).length.toString(),
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Pending',
      value: subscriptions.filter(s => s.products.some(p => p.status === 'Pending')).length.toString(),
      icon: AlertTriangle,
      color: 'orange'
    },
    {
      title: 'Expiring Soon',
      value: subscriptions.filter(s => s.products.some(p => p.status === 'Expiring Soon')).length.toString(),
      icon: Clock,
      color: 'yellow'
    }
  ];

  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Complete', label: 'Complete' },
    { value: 'Active', label: 'Active' },
    { value: 'Expiring Soon', label: 'Expiring Soon' },
    { value: 'Expired', label: 'Expired' },
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
      case 'Active': return 'text-green-600';
      case 'Expiring Soon': return 'text-red-600';
      case 'Expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-gray-200 text-gray-700';
      case 'Expiring Soon': return 'bg-red-100 text-red-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenModal = (product, quantity, subscription, isEdit = false) => {
    setSelectedProduct(product?.name || product);
    setSelectedQuantity(product?.quantity || quantity);

    // Calculate total price for the specific product (Unit Price * Quantity)
    const unitPrice = product.price || (product.sub_total ? product.sub_total / product.quantity : 0);
    const lineTotal = product.sub_total || (unitPrice * quantity);

    setSelectedTotalAmount(lineTotal || subscription?.totalAmount || null);

    setOriginalSubscription(subscription); // Store original subscription context
    setSelectedProductForEdit(product); // Store the specific product being edited

    if (isEdit) {
      // Find the actual subscription record relative to this product if possible
      // For now, we use the main subscription object, but in a real scenario we might need checks
      // Since the backend transforms data, we need to map back or use available fields
      setEditingSubscription({
        id: subscription.id,
        start_date: product.subscription_start || subscription.start_date || (product.dateRange && product.dateRange !== 'N/A' ? product.dateRange.split(' to ')[0] : ''),
        end_date: product.subscription_end || subscription.end_date || (product.dateRange && product.dateRange !== 'N/A' ? product.dateRange.split(' to ')[1] : ''),
        notes: subscription.notes || '', // Notes might be on main subscription
        delivery_date: product.delivery_date || subscription.delivery_date || '',
        total_amount: lineTotal || subscription.total_amount || null,
        // Add other fields if available
      });
    } else {
      setEditingSubscription(null);
    }

    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data) => {
    try {
      // Validate required fields
      if (!data.startDate || !data.endDate) {
        showError('Please select both start and end dates');
        return;
      }

      // Validate that end date is after start date
      if (new Date(data.endDate) <= new Date(data.startDate)) {
        showError('End date must be after start date');
        return;
      }

      // Parse current products status
      let currentProducts = [];
      try {
        if (originalSubscription?.raw_products_subscription_status) {
          // use raw_products_subscription_status which we added in backend transformer
          currentProducts = typeof originalSubscription.raw_products_subscription_status === 'string'
            ? JSON.parse(originalSubscription.raw_products_subscription_status)
            : originalSubscription.raw_products_subscription_status;
        } else if (originalSubscription?.products_subscription_status) {
          currentProducts = typeof originalSubscription.products_subscription_status === 'string'
            ? JSON.parse(originalSubscription.products_subscription_status)
            : originalSubscription.products_subscription_status;
        }
      } catch (e) {
        console.warn("Failed to parse products status", e);
      }

      if (!Array.isArray(currentProducts)) {
        currentProducts = [];
      }

      // Identify the product to update
      const targetProductName = data.product; // Name from modal
      const lineTotalAmount = parseFloat(data.totalAmount.toString().replace(/[^\d.-]/g, '')) || 0;
      const quantity = parseInt(data.quantity) || 1;
      const unitPrice = quantity > 0 ? lineTotalAmount / quantity : 0;

      let productFound = false;
      const updatedProducts = currentProducts.map(p => {
        const pName = p.name || p.product_name;
        // Match by name matching
        if (pName === targetProductName) {
          productFound = true;
          return {
            ...p,
            start_date: data.startDate,
            end_date: data.endDate,
            delivery_date: data.deliveryDate,
            notes: data.notes,
            // Update price info
            price: unitPrice,
            unit_price: unitPrice,
            sub_total: lineTotalAmount,
            quantity: quantity,
            custom_price: data.customPrice ? lineTotalAmount : null, // Persist custom price flag/value for this product
            status: 'Active' // Mark as active when saving
          };
        }
        return p;
      });

      // If product was not in the existing JSON list (e.g. legacy data), add it
      if (!productFound) {
        updatedProducts.push({
          name: targetProductName,
          product_name: targetProductName,
          quantity: quantity,
          start_date: data.startDate,
          end_date: data.endDate,
          delivery_date: data.deliveryDate,
          price: unitPrice,
          unit_price: unitPrice,
          sub_total: lineTotalAmount,
          custom_price: data.customPrice ? lineTotalAmount : null,
          status: 'Active'
        });
      }

      // Calculate the new total amount for the subscription
      // Sum up sub_totals of all products
      const newTotalAmount = updatedProducts.reduce((sum, p) => sum + (parseFloat(p.sub_total) || parseFloat(p.total_amount) || 0), 0);

      // Check if ANY product has custom pricing active to set the subscription-level custom_price
      const hasCustomPricing = updatedProducts.some(p => p.custom_price !== null && p.custom_price !== undefined);

      // Prepare subscription data for API
      // Use conditional logic to only include IDs if they are valid values (not null/undefined/0)
      const clientId = data.originalSubscription?.client_id || originalSubscription?.client_id;
      const productId = data.selectedProductForEdit?.product_id || data.originalSubscription?.product_id || originalSubscription?.product_id;
      const purchaseId = data.originalSubscription?.purchase_id || originalSubscription?.purchase_id;

      const subscriptionData = {
        po_number: data.poNumber || originalSubscription?.poNumber || 'PO-DEFAULT-001',
        start_date: data.startDate,
        end_date: data.endDate,
        status: 'Active',
        notes: data.notes || '',
        quantity: quantity,
        total_amount: newTotalAmount,
        custom_price: hasCustomPricing ? newTotalAmount : null,
        unit_price: unitPrice,
        products_subscription_status: updatedProducts
      };

      if (clientId) subscriptionData.client_id = clientId;
      if (productId) subscriptionData.product_id = productId;
      if (purchaseId) subscriptionData.purchase_id = purchaseId;

      let response;
      if (editingSubscription) {
        // UPDATE existing subscription
        response = await api.put(`/subscriptions/${editingSubscription.id}`, subscriptionData);
        console.log('Subscription updated:', response.data);
      } else {
        // CREATE new subscription
        response = await api.post('/subscriptions', subscriptionData);
        console.log('Subscription created:', response.data);
      }

      // Refresh the subscriptions list
      fetchSubscriptions();

      // Close modal
      setIsModalOpen(false);
      showSuccess('Subscription saved successfully');

    } catch (error) {
      console.error('Error saving subscription:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        showError(`Failed to save subscription: ${error.response.data.message || 'Validation failed'}`);
        if (error.response.data.errors) {
          console.log('Validation Errors:', error.response.data.errors);
        }
      } else {
        showError('Failed to save subscription');
      }
    }
  };

  const handleGenerateInvoiceFromSubscription = async (subscription) => {
    try {
      const response = await invoiceApi.generateFromSubscription({
        subscription_id: subscription.id
      });

      if (response.data.success) {
        showSuccess('Invoice generated successfully');

        // Refresh subscriptions to update UI
        fetchSubscriptions();

        // View the invoice
        const invoiceId = response.data.data.id;
        handleViewInvoiceSubscription(invoiceId);
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      if (error.response) {
        showError(error.response.data.message || 'Failed to generate invoice');
      } else {
        showError('Failed to generate invoice');
      }
    }
  };

  const handleViewInvoiceSubscription = async (invoiceId) => {
    try {
      const response = await invoiceApi.downloadInvoice(invoiceId);

      // Create a temporary URL and open in new tab
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Clean up after a short delay
      setTimeout(() => window.URL.revokeObjectURL(url), 500);
    } catch (error) {
      console.error('Error viewing invoice:', error);
      showError('Failed to view invoice');
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                    Loading subscriptions...
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.filter(subscription => {
                  // Apply status filter
                  if (statusFilter !== 'All Status') {
                    // Check if any product in the subscription matches the status filter
                    return subscription.products.some(product => product.status === statusFilter);
                  }
                  return true; // No filter applied
                }).map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-gray-900">{subscription.poNumber}</div>
                        <div className="text-sm text-gray-600">Delivery Date: {formatDate(subscription.createdDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{subscription.client?.company || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{subscription.client?.cli_name || subscription.client.contact || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-3">
                        {subscription.products && subscription.products.length > 0 ? (
                          subscription.products.map((product, index) => (
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
                                  onClick={() => handleOpenModal(product, product.quantity, subscription, product.action === 'Edit')}
                                >
                                  {product.action}
                                </Button>
                              </div>
                              {product.dateRange && product.dateRange !== 'N/A' && (
                                <div className="text-sm text-gray-600">
                                  {product.dateRange.includes(' to ')
                                    ? formatDateRange(product.dateRange.split(' to ')[0], product.dateRange.split(' to ')[1])
                                    : formatDate(product.dateRange)
                                  }
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm">No products found</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(subscription.progress.status === 'Active' || subscription.progress.status === 'Complete') ? (
                          <CheckCircle className={`h-4 w-4 ${getProgressColor(subscription.progress.status)}`} />
                        ) : (subscription.progress.status === 'Pending' || subscription.progress.status === 'Partial') ? (
                          <AlertTriangle className={`h-4 w-4 ${getProgressColor(subscription.progress.status)}`} />
                        ) : (
                          <Clock className={`h-4 w-4 ${getProgressColor(subscription.progress.status)}`} />
                        )}
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
                      {subscription.invoice && subscription.invoice.length > 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          icon={<FileText className="h-3 w-3" />}
                          onClick={() => handleViewInvoiceSubscription(subscription.invoice[0].id)}
                        >
                          View Bill
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          icon={<FileText className="h-3 w-3" />}
                          disabled={!subscription.canGenerateBill}
                          onClick={() => handleGenerateInvoiceFromSubscription(subscription)}
                        >
                          Generate Bill
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        quantity={selectedQuantity}
        totalAmount={selectedTotalAmount}
        onSubmit={handleModalSubmit}
        poNumber={originalSubscription?.poNumber || 'PO-DEFAULT-001'}
        previousSubscription={editingSubscription}
        originalSubscription={originalSubscription}
        selectedProductForEdit={selectedProductForEdit}
      />
    </div>
  );
}
