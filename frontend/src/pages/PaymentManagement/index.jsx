import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, CheckCircle, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import EditPaymentPopup from '../../components/PaymentManagement/EditPaymentPopup';
import api from '../../api';
import { formatDate } from '../../utils/dateUtils';
import { useNotification } from '../../components/Notifications';

export default function PaymentManagement() {
  const { showError, showSuccess } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });

  // Payment popup state
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState({
    total_received: 0,
    pending_payments: 0,
    outstanding_balance: 0,
    upcoming_payments: 0,
    total_transactions: 0
  });

  // Fetch payments from API
  useEffect(() => {
    fetchPayments();
  }, []);

  // Set up periodic statistics refresh (every 30 seconds)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!statisticsLoading) {
  //       fetchStatistics();
  //     }
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [statisticsLoading]);

  // Separate function to fetch statistics only
  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      const statsResponse = await api.get('/payment-managements-statistics');
      console.log('Statistics response:', statsResponse);
      
      if (statsResponse.data && statsResponse.data.data) {
        setStatistics(statsResponse.data.data);
        console.log('Statistics updated:', statsResponse.data.data);
      } else if (statsResponse.data) {
        setStatistics(statsResponse.data);
        console.log('Statistics updated directly:', statsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showError('Failed to fetch statistics');
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Function to refresh statistics manually
  const refreshStatistics = async () => {
    try {
      setStatisticsLoading(true);
      await api.post('/payment-managements-refresh-statistics');
      await fetchStatistics();
      showSuccess('Statistics refreshed successfully');
    } catch (error) {
      console.error('Error refreshing statistics:', error);
      showError('Failed to refresh statistics');
    } finally {
      setStatisticsLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('Fetching payments from API...');

      // Fetch payments and statistics separately
      const [paymentsResponse, statsResponse] = await Promise.all([
        api.get('/payment-managements'),
        api.get('/payment-managements-statistics')
      ]);

      console.log('Payments API Response:', paymentsResponse);
      console.log('Statistics API Response:', statsResponse);

      // Handle payments data - check if response includes both data and statistics
      let paymentsData = [];
      if (paymentsResponse.data && paymentsResponse.data.data && paymentsResponse.data.statistics) {
        // Response includes both data and statistics
        paymentsData = paymentsResponse.data.data;
        setStatistics(paymentsResponse.data.statistics);
        console.log('Statistics from payments response:', paymentsResponse.data.statistics);
      } else if (Array.isArray(paymentsResponse.data)) {
        paymentsData = paymentsResponse.data;
        console.log('Payments data is array:', paymentsData);
      } else if (paymentsResponse.data && typeof paymentsResponse.data === 'object') {
        if (paymentsResponse.data.data) {
          paymentsData = paymentsResponse.data.data;
        } else {
          paymentsData = [paymentsResponse.data];
        }
        console.log('Payments data from object:', paymentsData);
      }

      // Handle statistics data from separate call
      if (statsResponse.data && statsResponse.data.data) {
        setStatistics(statsResponse.data.data);
        console.log('Statistics set from separate call:', statsResponse.data.data);
      } else if (statsResponse.data) {
        setStatistics(statsResponse.data);
        console.log('Statistics set directly:', statsResponse.data);
      }

      console.log('Payments data before transformation:', paymentsData);

      // Transform the API response to match the expected format
      const transformedPayments = paymentsData.map(payment => {
        console.log('Processing payment:', payment);
        return {
          id: payment.id,
          poNumber: payment.po_number,
          client_id: payment.client_id,
          client: {
            company: payment.client?.company || payment.client || 'N/A',
            contact: payment.client?.cli_name || payment.client?.contact || 'N/A'
          },
          date: formatDate(payment.date),
          amount: `৳${typeof payment.amount === 'number' ? payment.amount.toFixed(2) : parseFloat(payment.amount || 0).toFixed(2)}`,
          method: payment.method || 'N/A',
          transactionId: payment.transaction_id || 'N/A',
          status: payment.status || 'N/A',
          receipt: payment.receipt || 'Not Generated'
        };
      });
      console.log('Transformed payments:', transformedPayments);
      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      console.error('Error details:', error.response || error.message);
      showError('Failed to fetch payments and statistics');
    } finally {
      setLoading(false);
    }
  };

  const summaryStats = [    //statistices cards
    {
      title: 'Total Received',
      value: `৳${(statistics?.total_received || 0).toFixed(2)}`,
      icon: DollarSign,
    },
    {
      title: 'Pending Payments',
      value: `৳${(statistics?.pending_payments || 0).toFixed(2)}`,
      icon: AlertTriangle,
    },
    {
      title: 'Outstanding Balance',
      value: `৳${(statistics?.outstanding_balance || 0).toFixed(2)}`,
      icon: CheckCircle,
    },
    {
      title: 'Upcoming Payments',
      value: `৳${(statistics?.upcoming_payments || 0).toFixed(2)}`,
      icon: Calendar,
    }
  ];

  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Pending', label: 'Pending' },
  ];

  const filters = [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
    }
  ];

  // Create empty payment template for recording new payments
  const createEmptyPayment = () => ({
    id: Date.now(),
    poNumber: '',
    client_id: 1, // Default client ID
    client: {
      company: '',
      contact: ''
    },
    date: new Date().toISOString().split('T')[0],
    amount: '৳0.00',
    method: 'Credit Card',
    transactionId: '',
    status: 'Completed',
    receipt: 'Not Generated'
  });

  // Debug function to test API connection
  const testApi = async () => {
    try {
      const response = await api.get('/payment-managements');
      console.log('Direct API response:', response);
    } catch (error) {
      console.error('Direct API error:', error);
    }
  };

  // Handle opening popup for recording new payment
  const handleRecordPayment = () => {
    setEditingPayment(createEmptyPayment());
    setIsEditMode(false);
    setIsPaymentPopupOpen(true);
  };

  // Handle opening popup for editing existing payment
  const handleEditPayment = (payment) => {
    // Ensure client_id is available when editing
    const paymentWithClientId = {
      ...payment,
      client_id: payment.client_id || 1
    };
    setEditingPayment(paymentWithClientId);
    setIsEditMode(true);
    setIsPaymentPopupOpen(true);
  };

  // Handle closing payment popup
  const handleClosePaymentPopup = () => {
    setIsPaymentPopupOpen(false);
    setEditingPayment(null);
    setIsEditMode(false);
  };

  // Handle payment submit (both create and update)
  const handlePaymentSubmit = async (paymentData) => {
    try {
      const paymentPayload = {
        po_number: paymentData.poNumber,
        client_id: paymentData.client_id || 1,
        date: paymentData.date,
        amount: parseFloat(paymentData.amount),
        method: paymentData.method,
        transaction_id: paymentData.transactionId,
        status: paymentData.status,
        receipt: paymentData.receipt,
        billing_id: paymentData.billing_id || null  // 
      };

      // Validation
      if (!paymentPayload.po_number?.trim()) {
        showError('Purchase Order is required');
        return;
      }
      if (!paymentPayload.transaction_id?.trim()) {
        showError('Transaction ID is required');
        return;
      }

      let response;
      if (isEditMode) {
        response = await api.put(`/payment-managements/${paymentData.id}`, paymentPayload);
      } else {
        response = await api.post('/payment-managements', paymentPayload);
      }

      console.log('Payment operation response:', response);

      // Check if the response includes updated statistics
      if (response.data && response.data.statistics) {
        setStatistics(response.data.statistics);
        console.log('Statistics updated from response:', response.data.statistics);
      } else {
        // Fallback: fetch statistics separately
        await fetchStatistics();
      }

      // Refresh payments list
      await fetchPayments();
      showSuccess(isEditMode ? 'Payment updated successfully' : 'Payment recorded successfully');
      handleClosePaymentPopup();

    } catch (error) {
      console.error('Error saving payment:', error);
      let errorMessage = 'Failed to save payment';

      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = errors;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError(errorMessage);
    }
  };

  // Handle payment deletion
  const handleDeletePayment = (payment) => {
    setConfirmDialog({
      isOpen: true,
      item: payment,
      action: 'deletePayment'
    });
  };

  // Confirm payment deletion
  const confirmDeletePayment = async () => {
    const payment = confirmDialog.item;
    try {
      const response = await api.delete(`/payment-managements/${payment.id}`);

      console.log('Payment delete response:', response);

      // Check if the response includes updated statistics
      if (response.data && response.data.statistics) {
        setStatistics(response.data.statistics);
        console.log('Statistics updated from delete response:', response.data.statistics);
      } else {
        // Fallback: fetch statistics separately
        await fetchStatistics();
      }

      // Refresh payments list
      await fetchPayments();
      showSuccess('Payment deleted successfully');
      setConfirmDialog({ isOpen: false, item: null, action: null });
      console.log('Deleted payment:', payment);
    } catch (error) {
      console.error('Error deleting payment:', error);
      let errorMessage = 'Failed to delete payment';

      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = errors;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError(errorMessage);
      setConfirmDialog({ isOpen: false, item: null, action: null });
    }
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, item: null, action: null });
  };

  // Test API connection on component mount
  useEffect(() => {
    testApi();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Management"
        subtitle="Record payments and track outstanding balances"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<RefreshCw className={`h-4 w-4 ${statisticsLoading ? 'animate-spin' : ''}`} />}
              onClick={refreshStatistics}className="rounded-full shadow-md"   // pill-shape + shadow
              disabled={statisticsLoading}
              title="Refresh Statistics"
            >
              {statisticsLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={handleRecordPayment}className="rounded-full shadow-xl"   // pill-shape + shadow
            >
              Record Payment
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <stat.icon className="h-5 w-5 text-gray-600" />
                </div>
                {statisticsLoading && (
                  <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statisticsLoading ? '...' : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by PO number, client, or transaction ID..."
        filters={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Payments ({payments.length})</CardTitle>
          <CardDescription>Track all payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="9" className="text-center py-8 text-gray-500">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="9" className="text-center py-8 text-gray-500">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.poNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{payment.client.company}</div>
                        <div className="text-sm text-gray-600">{payment.client.contact}</div>
                      </div>
                    </TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.transactionId}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'Completed' ? 'active' : 'inactive'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.receipt === 'Generated' ? 'active' : 'inactive'}>
                        {payment.receipt}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit payment"
                          onClick={() => handleEditPayment(payment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Delete payment"
                          onClick={() => handleDeletePayment(payment)}
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

      {/* Edit/Record Payment Popup */}
      {editingPayment && (
        <EditPaymentPopup
          payment={editingPayment}
          isOpen={isPaymentPopupOpen}
          onClose={handleClosePaymentPopup}
          onUpdate={handlePaymentSubmit}
          isEditMode={isEditMode}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete payment <strong>{confirmDialog.item?.transactionId}</strong>? This action cannot be undone.
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
                onClick={confirmDeletePayment}
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
