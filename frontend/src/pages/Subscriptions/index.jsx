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
      // Transform the API response to ensure client data has proper structure
      const transformedSubscriptions = response.data.map(subscription => ({
        ...subscription,
        client: {
          ...subscription.client,
          company: subscription.client?.company || subscription.client || 'N/A',
          cli_name: subscription.client?.cli_name || subscription.client?.contact || 'N/A'
        }
      }));
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
    setSelectedProduct(product?.name || product);
    setSelectedQuantity(product?.quantity || quantity);
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
        quantity: originalSubscription?.quantity || 1,
        total_amount: originalSubscription?.total_amount || 0.00, // Use the original total_amount
        purchase_id: originalSubscription?.id // Link to the original purchase if available
      };
      
      const response = await api.post('/subscriptions', subscriptionData);
      
      // After response interceptor normalization, response.data contains the created subscription
      console.log('Subscription created:', response.data);
      // Refresh the subscriptions list
      fetchSubscriptions();
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
                        <div className="font-medium text-gray-900">{subscription.client?.company || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{subscription.client?.cli_name || subscription.client.contact || 'N/A'}</div>
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
                                onClick={() => handleOpenModal(product, product.quantity, subscription)}
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
