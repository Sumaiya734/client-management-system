import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, FileText, Package, Clock, DollarSign, Building2 } from 'lucide-react';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';
import { formatDate, formatDateRange } from '../../utils/dateUtils';

interface Product {
  id: number;
  product_name?: string;
  quantity?: number;
  subscription_start?: string;
  subscription_end?: string;
  delivery_date?: string;
}

interface Client {
  id: number;
  company: string;
  contact?: string;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  status: string;
  created_at: string;
  client?: Client;
  cli_name?: string;
  products?: Product[];
  total_amount?: number;
  subscription_active?: boolean;
  subscription_type?: string;
  recurring_count?: number;
  delivery_date?: string;
  attachment?: string;
}

interface ViewPurchaseOrderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
}

const ViewPurchaseOrderPopup: React.FC<ViewPurchaseOrderPopupProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
}) => {
  const { isVisible, isAnimating } = useAnimationState(isOpen);

  if (!isOpen && !isAnimating) return null;
  if (!purchaseOrder) return null;

  const formatCurrency = (amount?: number) => {
    const num = amount || 0;
    return num.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { bg: 'bg-green-100 text-green-800', text: 'Approved' },
      delivered: { bg: 'bg-blue-100 text-blue-800', text: 'Delivered' },
      cancelled: { bg: 'bg-red-100 text-red-800', text: 'Cancelled' },
      default: { bg: 'bg-gray-100 text-gray-800', text: status },
    };

    const variant = variants[status?.toLowerCase()] || variants.default;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${variant.bg} ${variant.text}`}>
        {variant.text}
      </span>
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isAnimating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Purchase Order Details</h2>
              <p className="text-slate-300 text-sm mt-1">PO #{purchaseOrder.po_number}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Basic Info Grid */}
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Building2 size={18} />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">PO Number</label>
                  <p className="text-sm font-semibold text-slate-900">{purchaseOrder.po_number}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Status</label>
                  <div>{getStatusBadge(purchaseOrder.status)}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Client</label>
                  <p className="text-sm font-medium text-slate-900">
                    {purchaseOrder.client?.company || purchaseOrder.cli_name || 'N/A'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Calendar size={14} />
                    Delivery Date
                  </label>
                  <p className="text-sm font-medium text-slate-900">
                    {purchaseOrder.delivery_date ? formatDate(purchaseOrder.delivery_date) : 'Not specified'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <DollarSign size={14} />
                    Total Amount
                  </label>
                  <p className="text-lg font-bold text-slate-900">
                    ৳{formatCurrency(purchaseOrder.total_amount)} BDT
                  </p>
                </div>

                <div className="space-y-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={purchaseOrder.subscription_active || false}
                    readOnly
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <label className="ml-2 text-sm font-medium text-slate-700">
                    Subscription Active
                  </label>
                </div>
              </div>
            </section>

            {/* Products Section */}
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Package size={18} />
                Products & Subscription
              </h3>

              {purchaseOrder.products && purchaseOrder.products.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-700">Product</th>
                        <th className="px-4 py-3 text-center font-medium text-slate-700">Quantity</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-700">Schedule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {purchaseOrder.products.map((product, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {product.product_name || 'Unnamed Product'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              ×{product.quantity || 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {product.subscription_start && product.subscription_end ? (
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatDateRange(product.subscription_start, product.subscription_end)}
                              </span>
                            ) : product.delivery_date ? (
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Delivery: {formatDate(product.delivery_date)}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic">No products added</p>
              )}

              {/* Subscription Details */}
              {purchaseOrder.subscription_active && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {purchaseOrder.subscription_type && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Subscription Duration</label>
                      <p className="text-sm font-medium text-slate-900">
                        {purchaseOrder.subscription_type} month{parseInt(purchaseOrder.subscription_type) > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  {purchaseOrder.recurring_count && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Recurring Count</label>
                      <p className="text-sm font-medium text-slate-900">{purchaseOrder.recurring_count}</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Attachment */}
            {purchaseOrder.attachment && (
              <section>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText size={18} />
                  Attachment
                </h3>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">{purchaseOrder.attachment}</p>
                    <p className="text-xs text-slate-500">Uploaded file</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </PopupAnimation>
    </div>,
    document.body
  );
};

export default ViewPurchaseOrderPopup;