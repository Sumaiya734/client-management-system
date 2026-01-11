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

  const getStatusColorClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const s = status.toLowerCase();
    if (s === 'active') return 'bg-green-100 text-green-800';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (s === 'expired') return 'bg-red-100 text-red-800';
    if (s === 'expiring soon') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getDisplayStatus = () => {
    if (subscription.status === 'Active') return 'Active';

    if (products.length > 0) {
      if (products.some(p => (p.status || '').toLowerCase() === 'active')) return 'Active';
      if (products.some(p => (p.status || '').toLowerCase() === 'expiring soon')) return 'Expiring Soon';
    }
    return subscription.status || 'Pending';
  };

  const displayStatus = getDisplayStatus();

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isAnimating
          ? 'bg-black/20 backdrop-blur-sm opacity-100'
          : 'bg-black/0 opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Subscription Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View detailed subscription information
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">PO Number</p>
                  <p className="text-sm font-medium">
                    {subscription.poNumber || subscription.po_number || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="text-sm font-medium">
                    {subscription.client?.company || subscription.client || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {subscription.client?.cli_name || subscription.client?.contact || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Badge className={getStatusColorClass(displayStatus)}>
                    {displayStatus}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm font-medium">
                    {formatDate(subscription.start_date || subscription.startDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm font-medium">
                    {formatDate(subscription.end_date || subscription.endDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium">
                    {formatDateRange(
                      subscription.start_date || subscription.startDate,
                      subscription.end_date || subscription.endDate
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <DollarSign size={12} />
                    Total Amount
                  </p>
                  <p className="text-sm font-semibold">
                    ৳{subscription.total_amount || subscription.totalAmount || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {subscription.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm bg-gray-50 p-3 rounded-md">
                  {subscription.notes}
                </p>
              </div>
            )}

            {/* Products */}
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Package size={16} />
                Products & Subscriptions
              </h3>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Product', 'Qty', 'Unit', 'Total', 'Start', 'End', 'Status'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {products.length > 0 ? (
                      products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            {product.name || product.product_name || 'N/A'}
                          </td>
                          <td className="px-3 py-2">{product.quantity || 1}</td>
                          <td className="px-3 py-2">৳{Number(product.unit_price || product.price || 0).toFixed(2)}</td>
                          <td className="px-3 py-2">৳{Number(product.sub_total || product.total || 0).toFixed(2)}</td>
                          <td className="px-3 py-2">
                            {formatDate(product.start_date || product.subscription_start)}
                          </td>
                          <td className="px-3 py-2">
                            {formatDate(product.end_date || product.subscription_end)}
                          </td>
                          <td className="px-3 py-2">
                            <Badge className={getStatusColorClass(product.status)}>
                              {product.status || 'N/A'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end px-5 py-3 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md bg-white hover:bg-gray-100"
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
