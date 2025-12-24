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

export default function Subscriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedTotalAmount, setSelectedTotalAmount] = useState(null);
  const [originalSubscription, setOriginalSubscription] = useState(null);
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
      if (response.data.success) {
        // Transform the API response to match the expected format, but keep original data for creation
        const transformedSubscriptions = response.data.data.map(sub => {
          // For now, we'll create a simplified structure
          // In a real app, you'd structure this based on your API response
          return {
            id: sub.id,
            poNumber: sub.po_number,
            createdDate: sub.start_date || 'N/A',
            client: {
              company: sub.client?.company || sub.client || 'N/A',
              contact: sub.client?.contact || 'N/A'
            },
            products: [
              {
                name: sub.product?.product_name || sub.product?.name || 'N/A',
                quantity: sub.quantity || 1,
                status: sub.status || 'Pending',
                dateRange: sub.start_date && sub.end_date ? `${sub.start_date} to ${sub.end_date}` : 'N/A',
                action: sub.status === 'Pending' ? 'Subscribe' : 'Edit'
              }
            ],
            progress: {
              status: sub.status || 'Pending',
              completed: sub.status === 'Active' ? 1 : 0,
              total: 1,
              percentage: sub.status === 'Active' ? 100 : sub.status === 'Pending' ? 0 : 50
            },
            totalAmount: `৳${sub.total_amount !== null && sub.total_amount !== undefined ? (typeof sub.total_amount === 'number' ? sub.total_amount.toFixed(2) : (typeof sub.total_amount === 'string' ? parseFloat(sub.total_amount).toFixed(2) : '0.00')) : '0.00'} BDT`,
            canGenerateBill: sub.status === 'Active',
            // Store original data needed for creating new subscriptions
            client_id: sub.client_id,
            product_id: sub.product_id,
            total_amount: sub.total_amount
          };
        });
        setSubscriptions(transformedSubscriptions);
      }
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
      value: '0',
      icon: Clock,
      color: 'yellow'
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

  const handleOpenModal = (product, quantity, subscription) => {
    setSelectedProduct(product);
    setSelectedQuantity(quantity);
    setSelectedTotalAmount(subscription?.totalAmount || null);
    setOriginalSubscription(subscription); // Store original subscription for client_id and product_id
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data) => {
    try {
      // Validate required fields
      if (!data.startDate || !data.endDate) {
        alert('Please select both start and end dates');
        return;
      }
      
      // Prepare subscription data for API
      const subscriptionData = {
        po_number: data.poNumber || originalSubscription?.poNumber || 'PO-DEFAULT-001',
        client_id: originalSubscription?.client_id || 1, // Use the original client_id from the purchase
        product_id: originalSubscription?.product_id || 1, // Use the original product_id from the purchase
        start_date: data.startDate,
        end_date: data.endDate,
        status: 'Active',
        notes: data.notes || '',
        quantity: data.quantity || originalSubscription?.quantity || 1,
        total_amount: originalSubscription?.total_amount || 0.00 // Use the original total_amount
      };
      
      const response = await api.post('/subscriptions', subscriptionData);
      
      if (response.data.success) {
        console.log('Subscription created:', response.data.data);
        // Refresh the subscriptions list
        fetchSubscriptions();
      } else {
        console.error('Failed to create subscription:', response.data.message);
        alert(`Failed to create subscription: ${response.data.message || 'Validation failed'}`);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        alert(`Failed to create subscription: ${error.response.data.message || 'Validation failed'}`);
      } else {
        alert('Failed to create subscription');
      }
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
                subscriptions.map((subscription) => (
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
                                onClick={() => handleOpenModal(product.name, product.quantity, subscription)}
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
                        {subscription.progress.status === 'Active' ? (
                          <CheckCircle className={`h-4 w-4 ${getProgressColor(subscription.progress.status)}`} />
                        ) : subscription.progress.status === 'Pending' ? (
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
      />
    </div>
  );
}
