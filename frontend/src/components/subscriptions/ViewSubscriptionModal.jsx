import React from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Calendar, FileText, DollarSign } from 'lucide-react';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';
import { formatDate, formatDateRange } from '../../utils/dateUtils';


import { Badge } from '../../components/ui/Badge';

const ViewSubscriptionModal = ({ subscription, isOpen, onClose }) => {
  const { isVisible, isAnimating } = useAnimationState(isOpen);

  if (!isVisible) return null;

  if (!subscription) return null;

  // Format products for display - handling different possible data structures
  let products = [];

  if (subscription.products_subscription_status) {
    // If it's a string, parse it as JSON
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
  } else {
    // Try to get products from the subscription object directly
    products = [];
  }

  const getStatusVariant = (status) => {
    if (!status) return 'default';
    const s = status.toLowerCase();
    if (s === 'active' || s === 'completed') return 'success'; // Green
    if (s === 'pending') return 'warning'; // Yellow
    if (s === 'expired' || s === 'failed') return 'destructive'; // Red
    if (s === 'expiring soon') return 'warning'; // Yellow/Orange
    return 'secondary'; // Gray
  };

  const getStatusColorClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const s = status.toLowerCase();
    if (s === 'active') return 'bg-green-100 text-green-800';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (s === 'expired') return 'bg-red-100 text-red-800';
    if (s === 'expiring soon') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Determine the display status dynamically if the top-level status isn't updated yet
  const getDisplayStatus = () => {
    // If we have explicit 'Active' status on subscription, trust it
    if (subscription.status === 'Active') return 'Active';

    // Otherwise check products - if ANY product is active, display Active
    if (products && products.length > 0) {
      const hasActive = products.some(p => {
        const s = (p.status || p.Status || '').toLowerCase();
        return s === 'active';
      });
      if (hasActive) return 'Active';

      const hasExpiring = products.some(p => {
        const s = (p.status || p.Status || '').toLowerCase();
        return s === 'expiring soon';
      });
      if (hasExpiring) return 'Expiring Soon';
    }

    return subscription.status || 'Pending';
  };

  const displayStatus = getDisplayStatus();

  return createPortal(
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Subscription Details</h2>
              <p className="text-sm text-gray-600 mt-1">View detailed information about the subscription</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">PO Number</h3>
                  <p className="text-lg font-medium text-gray-900">{subscription.poNumber || subscription.po_number || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {subscription.client?.company || subscription.client || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {subscription.client?.cli_name || subscription.client?.contact || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <Badge className={getStatusColorClass(displayStatus)}>
                    {displayStatus}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(subscription.start_date || subscription.startDate)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(subscription.end_date || subscription.endDate)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDateRange(subscription.start_date || subscription.startDate, subscription.end_date || subscription.endDate)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                  <p className="text-lg font-medium text-gray-900">
                    ৳{subscription.total_amount || subscription.totalAmount || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {subscription.notes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{subscription.notes}</p>
              </div>
            )}

            {/* Products Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products & Subscriptions
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products && Array.isArray(products) && products.length > 0 ? (
                      products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {product.name || product.product_name || product.ProductName || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{product.quantity || product.Quantity || 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ৳{typeof (product.price || product.unit_price || product.UnitPrice || 0) === 'number'
                              ? (product.price || product.unit_price || product.UnitPrice || 0).toFixed(2)
                              : parseFloat(product.price || product.unit_price || product.UnitPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ৳{typeof (product.sub_total || product.total || product.SubTotal || 0) === 'number'
                              ? (product.sub_total || product.total || product.SubTotal || 0).toFixed(2)
                              : parseFloat(product.sub_total || product.total || product.SubTotal || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(product.start_date || product.subscription_start || product.StartDate)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(product.end_date || product.subscription_end || product.EndDate)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={getStatusColorClass(product.status || product.Status)}>
                              {(product.status || product.Status) || 'N/A'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">
                          No products found for this subscription
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </PopupAnimation>
    </div>,
    document.body
  );
};

export default ViewSubscriptionModal;