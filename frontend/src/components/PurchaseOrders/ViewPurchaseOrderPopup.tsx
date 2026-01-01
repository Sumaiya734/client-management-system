import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, FileText } from 'lucide-react';
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

  const formatCurrency = (amount: number) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount || 0);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handlePopupClick = (e: React.MouseEvent) => {
    onClose();
  };

  return createPortal(
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={handlePopupClick}>
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-[98vw] mx-2 max-h-[75vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">View Purchase Order</h2>
              <p className="text-xs text-gray-500 mt-1">Purchase Order Details</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* FORM */}
          <div className="p-4 text-sm space-y-6">

            {/* BASIC INFORMATION */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* PO NUMBER */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">PO Number</label>
                  <div className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100">
                    {purchaseOrder.po_number}
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <div className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100">
                    {purchaseOrder.status}
                  </div>
                </div>

                {/* CLIENT */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Client</label>
                  <div className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100">
                    {purchaseOrder.client?.company || purchaseOrder.cli_name || 'N/A'}
                  </div>
                </div>

                {/* DELIVERY DATE */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Date</label>
                  <div className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100">
                    {purchaseOrder.delivery_date ? formatDate(purchaseOrder.delivery_date) : 'N/A'}
                  </div>
                </div>

                {/* TOTAL AMOUNT */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Amount</label>
                  <div className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100">
                    ৳{formatCurrency(purchaseOrder.total_amount || 0)} BDT
                  </div>
                </div>

                {/* SUBSCRIPTION ACTIVE */}
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={purchaseOrder.subscription_active || false}
                      readOnly
                      className="h-3 w-3 text-gray-900 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-xs font-medium text-gray-700">
                      Subscription Active
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* PRODUCTS */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Products & Subscription</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* PRODUCTS LIST */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Products</label>
                  <div className="space-y-2">
                    {purchaseOrder.products && purchaseOrder.products.length > 0 ? (
                      purchaseOrder.products.map((product, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                          <div className="flex items-center gap-2 mb-2">
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
                      <div className="text-sm text-gray-500">No products</div>
                    )}
                  </div>
                </div>

                {/* SUBSCRIPTION TYPE */}
                {purchaseOrder.subscription_active && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subscription Type</label>
                    <div className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100">
                      {purchaseOrder.subscription_type ? `${purchaseOrder.subscription_type} month${parseInt(purchaseOrder.subscription_type) > 1 ? 's' : ''}` : 'N/A'}
                    </div>
                  </div>
                )}

                {/* RECURRING COUNT */}
                {purchaseOrder.subscription_active && purchaseOrder.recurring_count && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Recurring Count</label>
                    <div className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-100">
                      {purchaseOrder.recurring_count}
                    </div>
                  </div>
                )}

              </div>


            </div>

            {/* ATTACHMENTS */}
            {purchaseOrder.attachment && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Attachments</h3>
                <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{purchaseOrder.attachment}</span>
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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
