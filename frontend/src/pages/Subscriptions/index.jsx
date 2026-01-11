import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Clock, CheckCircle, FileText, Paperclip, Eye } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import SubscriptionModal from '../../components/subscriptions/SubscriptionModal';
import ViewSubscriptionModal from '../../components/subscriptions/ViewSubscriptionModal';
import api from '../../api';
import { invoiceApi } from '../../api';
import { useNotification } from '../../components/Notifications';
import { formatDate, formatDateRange } from '../../utils/dateUtils';
import { useNavigate, useLocation } from 'react-router-dom';

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

  // Renewal state
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [renewals, setRenewals] = useState([]);
  const [renewedItems, setRenewedItems] = useState(new Set()); // Track renewed items

  // Tab state
  const [activeTab, setActiveTab] = useState('subscriptions');

  // Navigate and Location hooks - moved before useEffect that uses them
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL parameters to determine if we should start on renewal tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab === 'renewals') {
      setActiveTab('renewals');
    }
  }, [location.search, navigate]);

  // View subscription modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // Fetch subscriptions based on active tab
  useEffect(() => {
    if (activeTab === 'renewals') {
      fetchRenewalData();
    } else {
      fetchSubscriptions();
    }

    // Clear renewed items when switching tabs
    if (activeTab !== 'renewals') {
      setRenewedItems(new Set());
    }
  }, [activeTab]);

  // Also fetch renewal data when component mounts to ensure consistency
  useEffect(() => {
    fetchRenewalData();
  }, []);

  // Refresh renewal data when renewed items change
  useEffect(() => {
    if (activeTab === 'renewals' && renewedItems.size > 0) {
      // Small delay to allow for backend updates
      const timer = setTimeout(() => {
        fetchRenewalData();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [renewedItems, activeTab]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions');
      console.log('Raw API response:', response.data);

      // Transform the API response to ensure client data has proper structure and products are accessible
      const transformedSubscriptions = response.data.map(subscription => {
        console.log('Processing subscription:', subscription);
        console.log('Subscription products:', subscription.products);

        // Ensure products are properly structured
        let products = [];
        if (subscription.products_subscription_status) {
          if (typeof subscription.products_subscription_status === 'string') {
            try {
              products = JSON.parse(subscription.products_subscription_status);
            } catch (e) {
              console.error('Error parsing products_subscription_status:', e);
              products = [];
            }
          } else {
            products = subscription.products_subscription_status;
          }
        } else if (Array.isArray(subscription.products)) {
          products = subscription.products;
        }

        return {
          ...subscription,
          products: products, // Ensure products are accessible
          raw_products_subscription_status: subscription.products_subscription_status, // Keep original for reference
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

  const fetchRenewalData = async () => {
    try {
      setRenewalLoading(true);
      const response = await api.get('/subscriptions/renewals');
      // The interceptor already normalizes to response.data.data if it exists
      // Convert to array if it's an object (happens if Laravel collection has non-sequential keys)
      let data = response.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = Object.values(data);
      }
      setRenewals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching renewal list:', error);
      showError('Failed to load renewal data');
      setRenewals([]);
    } finally {
      setRenewalLoading(false);
    }
  };

  const summaryStats = [
    {
      title: 'Total Subscriptions',
      value: (subscriptions && subscriptions.length) ? subscriptions.length.toString() : '0',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Active',
      value: (subscriptions && Array.isArray(subscriptions)) ? subscriptions.filter(s => s.products && s.products.some(p => p.status === 'Active')).length.toString() : '0',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Pending',
      value: (subscriptions && Array.isArray(subscriptions)) ? subscriptions.filter(s => s.products && s.products.some(p => p.status === 'Pending')).length.toString() : '0',
      icon: AlertTriangle,
      color: 'orange'
    },
    {
      title: 'Expiring Soon',
      value: (renewals && Array.isArray(renewals)) ? renewals.length.toString() : '0', // Use renewals count instead of local filter
      icon: AlertTriangle,
      color: 'red'
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
      case 'Expiring Soon': return 'bg-red-100 text-red-800'; // Red alert for expiring soon
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttachmentUrl = (attachment) => {
    if (!attachment) return null;

    const baseUrl = (api?.defaults?.baseURL || 'http://localhost:8000').replace(/\/$/, '');
    const raw = String(attachment).trim();

    if (/^https?:\/\//i.test(raw)) {
      try {
        // Validate URL
        // eslint-disable-next-line no-new
        new URL(raw);
        return raw;
      } catch (e) {
        // Handle common case: missing slash after host (e.g. http://localhost:8000purchase_attachments/...)
        return raw.replace(/^(https?:\/\/[^/]+)(?!\/)(.+)$/i, '$1/$2');
      }
    }

    if (raw.startsWith('/')) {
      return `${baseUrl}${raw}`;
    }

    return `${baseUrl}/${raw}`;
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

    // Always treat as an edit/update to the existing subscription record to prevent creating duplicates (new rows)
    // Even if we are "Activating" a pending product, we are updating the existing Subscription/PO record.
    setEditingSubscription({
      id: subscription.id,
      start_date: product.subscription_start || subscription.start_date || (product.dateRange && product.dateRange !== 'N/A' ? product.dateRange.split(' to ')[0] : ''),
      end_date: product.subscription_end || subscription.end_date || (product.dateRange && product.dateRange !== 'N/A' ? product.dateRange.split(' to ')[1] : ''),
      notes: subscription.notes || '', // Notes might be on main subscription
      delivery_date: product.delivery_date || subscription.delivery_date || '',
      total_amount: lineTotal || subscription.total_amount || null,
      custom_price: product.custom_price || null
    });

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

      // Determine if we should UPDATE or CREATE
      // We check for an existing ID in multiple places to be robust
      const existingId = editingSubscription?.id || data.previousSubscription?.id || data.originalSubscription?.id;

      let response;
      if (existingId) {
        // UPDATE existing subscription
        response = await api.put(`/subscriptions/${existingId}`, subscriptionData);
        console.log('Subscription updated:', response.data);
      } else {
        // CREATE new subscription
        response = await api.post('/subscriptions', subscriptionData);
        console.log('Subscription created:', response.data);
      }

      // Refresh the subscriptions list
      fetchSubscriptions();

      // Also refresh renewal data if we are on that tab or to keep counts updated
      fetchRenewalData();

      // If we're on the renewal tab, also track this item as renewed
      if (editingSubscription?.id) {
        setRenewedItems(prev => new Set(prev).add(editingSubscription.id));

        // Refresh the renewal data to reflect the updated subscription status
        if (activeTab === 'renewals') {
          setTimeout(() => {
            fetchRenewalData();
            // Clear the temporary 'Done' indicator after a short delay
            setRenewedItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(editingSubscription.id);
              return newSet;
            });
          }, 500); // Short delay to allow backend to update
        } else {
          // Clear the temporary 'Done' indicator after a delay
          setTimeout(() => {
            setRenewedItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(editingSubscription.id);
              return newSet;
            });
          }, 1000); // Reset after 1 second
        }
      }

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

  // Handle opening view subscription modal
  const handleViewSubscription = (subscription) => {
    // Ensure the subscription data has properly formatted products for the modal
    let products = [];
    if (subscription.products_subscription_status) {
      if (typeof subscription.products_subscription_status === 'string') {
        try {
          products = JSON.parse(subscription.products_subscription_status);
        } catch (e) {
          console.error('Error parsing products_subscription_status:', e);
          products = [];
        }
      } else {
        products = subscription.products_subscription_status;
      }
    } else if (Array.isArray(subscription.products)) {
      products = subscription.products;
    }

    const formattedSubscription = {
      ...subscription,
      products: products
    };

    setSelectedSubscription(formattedSubscription);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Management"
        subtitle="Manage software subscriptions for approved purchase orders"
      />

      {/* === Pill Tabs Navigation === */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-full w-fit">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 text-sm font-medium rounded-full transition ${activeTab === 'subscriptions'
            ? 'bg-white text-gray-900 shadow-xl'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Subscription Management
        </button>
        <button
          onClick={() => {
            setActiveTab('renewals');
            // Update URL to reflect the active tab
            const urlParams = new URLSearchParams(location.search);
            urlParams.set('tab', 'renewals');
            navigate(`${location.pathname}?${urlParams.toString()}`);
          }}
          className={`px-4 py-2 text-sm font-medium rounded-full transition ${activeTab === 'renewals'
            ? 'bg-white text-gray-900 shadow-xl'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Subscription Renewal
        </button>
      </div>

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
        filters={activeTab === 'renewals' ? [] : filters}
      />

      {/* Conditional rendering for Subscription vs Renewal content */}
      {activeTab === 'renewals' ? (
        /* Renewal Content */
        <Card>
          <CardHeader>
            <CardTitle>Renewal Requests ({renewals.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Products</TableHead>
                  <TableHead>Renewal Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renewalLoading ? (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                      Loading renewal list...
                    </TableCell>
                  </TableRow>
                ) : renewals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                      No upcoming renewals
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(renewals) && renewals.length > 0 ?
                    renewals.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{item.product_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(item.renewal_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{item.client?.company || item.client?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-600">{item.client?.cli_name || item.client?.contact || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            item.status === 'Expiring Soon' ? 'destructive' : // Changed to destructive (red) for better alert visibility
                              item.status === 'Active' ? 'success' :
                                item.status === 'Expired' ? 'destructive' : 'secondary'
                          }>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {renewedItems.has(item.id) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="text-green-600"
                            >
                              Done
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenModal(item.product_name, item.quantity, item, true)}
                            >
                              Renew
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                    :
                    <TableRow>
                      <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                        No upcoming renewals
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Original Subscription Content */
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
                  <TableHead>Attachment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center py-8 text-gray-500">
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center py-8 text-gray-500">
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
                          <div className="font-medium text-gray-900">
                            {subscription.client?.company && subscription.client.company !== 'N/A'
                              ? subscription.client.company
                              : (subscription.client?.cli_name || 'N/A')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {subscription.client?.cli_name && subscription.client.cli_name !== 'N/A'
                              ? subscription.client.cli_name
                              : (subscription.client?.contact || 'N/A')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* Products & Subscription Status */}
                        <div className="space-y-2">
                          {subscription.products && subscription.products.length > 0 ? (
                            subscription.products.map((product, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-xl hover:shadow transition"
                              >
                                {/* Left: Product + Qty */}
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 text-sm">
                                      {product.name}
                                    </span>
                                    <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded">
                                      x{product.quantity}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {(product.start_date || product.subscription_start) && (product.end_date || product.subscription_end)
                                      ? formatDateRange(product.start_date || product.subscription_start, product.end_date || product.subscription_end)
                                      : product.delivery_date
                                        ? `Delivery: ${formatDate(product.delivery_date)}`
                                        : 'N/A'}
                                  </div>
                                </div>

                                {/* Middle: Status */}
                                <Badge className={`text-xs ${getStatusBadgeColor(product.status)}`}>
                                  {product.status}
                                </Badge>

                                {/* Right: Action Button */}
                                <Button
                                  variant={product.action === 'Subscribe' ? 'primary' : 'outline'}
                                  size="xs"
                                  className="text-xs"
                                  onClick={() => handleOpenModal(product, product.quantity, subscription, product.action === 'Edit')}
                                >Edit
                                  {product.action}
                                </Button>

                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No products</span>
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
                        {subscription.attachment ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            icon={<Paperclip className="h-3 w-3" />}
                            onClick={() => {
                              const url = getAttachmentUrl(subscription.attachment_url || subscription.attachment);
                              if (url) window.open(url, '_blank');
                            }}
                          >
                            View
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">No attachment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* View Icon */}
                          <button
                            type="button"
                            className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                            title="View"
                            onClick={() => handleViewSubscription(subscription)}
                          >
                            <Eye className="h-4 w-4 text-gray-700" />
                          </button>

                          {/* Invoice Icon */}
                          {subscription.invoice && subscription.invoice.length > 0 ? (
                            <button
                              type="button"
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                              title="View Bill"
                              onClick={() => handleViewInvoiceSubscription(subscription.invoice[0].id)}
                            >
                              <FileText className="h-4 w-4 text-green-600" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
                              title="Generate Bill"
                              disabled={!subscription.canGenerateBill}
                              onClick={() => handleGenerateInvoiceFromSubscription(subscription)}
                            >
                              <FileText className="h-4 w-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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

      {/* View Subscription Modal */}
      <ViewSubscriptionModal
        subscription={selectedSubscription}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSubscription(null);
        }}
      />
    </div>
  );
}
