import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Lock, Unlock } from 'lucide-react';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';

const SubscriptionModal = ({
  isOpen,
  onRequestClose,
  product,
  quantity,
  totalAmount: initialTotalAmount,
  poNumber,
  onSubmit,
  previousSubscription = null,
  originalSubscription = null,
  selectedProductForEdit = null,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [customPrice, setCustomPrice] = useState(false);
  const [customTotal, setCustomTotal] = useState(initialTotalAmount || '');

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  useEffect(() => {
    if (isOpen) {
      // Determine the source of truth for product data
      // selectedProductForEdit takes precedence (comes from the specific product row clicked)
      // originalSubscription?.products?.[0] is a fallback
      const productToUse = selectedProductForEdit || originalSubscription?.products?.[0];

      // Helper to safely extract YYYY-MM-DD
      const formatDateStr = (dateStr) => dateStr ? dateStr.split('T')[0] : '';

      // logical precedence: 
      // 1. Existing subscription being edited (previousSubscription)
      // 2. Product data from the PO (productToUse)
      const initialStartDate = formatDateStr(previousSubscription?.start_date) ||
        formatDateStr(productToUse?.subscription_start) ||
        formatDateStr(productToUse?.start_date) || '';

      const initialEndDate = formatDateStr(previousSubscription?.end_date) ||
        formatDateStr(productToUse?.subscription_end) ||
        formatDateStr(productToUse?.end_date) || '';

      const initialDeliveryDate = formatDateStr(previousSubscription?.delivery_date) ||
        formatDateStr(productToUse?.delivery_date) || '';

      const initialNotes = previousSubscription?.notes || originalSubscription?.notes || '';

      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setDeliveryDate(initialDeliveryDate);
      setNotes(initialNotes);

      // Price handling
      const productPrice = productToUse?.price || (productToUse?.sub_total ? productToUse.sub_total / productToUse?.quantity : null);

      const priceToSet = previousSubscription?.total_amount ??
        productToUse?.sub_total ?? // Prefer sub_total for the total calculation
        (productPrice ? productPrice * (quantity || 1) : null) ??
        originalSubscription?.total_amount ??
        initialTotalAmount;

      setCustomTotal(priceToSet);
      setCustomPrice(!!previousSubscription?.custom_price || !!productToUse?.custom_price);
      setAttachment(null);
    }
  }, [isOpen, previousSubscription, originalSubscription, selectedProductForEdit, initialTotalAmount, quantity]);

  const currencyMatch = (initialTotalAmount?.toString() || customTotal?.toString() || '').match(
    /([৳$€£¥₽₹]|BDT|USD|EUR)/
  );
  const currency = currencyMatch ? currencyMatch[0] : '৳';

  const calculateUnitPrice = () => {
    const totalStr = customPrice ? customTotal : initialTotalAmount;
    const numeric = parseFloat((totalStr || '').toString().replace(/[^\d.]/g, '')) || 0;
    return quantity > 0 ? (numeric / quantity).toFixed(0) : '0';
  };

  const unitPrice = calculateUnitPrice();
  const displayTotal = customPrice ? customTotal : initialTotalAmount || `${currency}0`;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachment(file);
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      alert('Start and End dates are required.');
      return;
    }

    onSubmit({
      startDate,
      endDate,
      deliveryDate,
      notes,
      attachment,
      product,
      quantity,
      poNumber,
      totalAmount: displayTotal,
      customPrice,
      unitPrice,
      originalSubscription, // Include original subscription info
      selectedProductForEdit, // Include selected product info
    });

    onRequestClose();
  };

  if (!isVisible) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={onRequestClose}
    >
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div
          className="w-full max-w-4xl bg-white rounded-lg shadow-2xl max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {previousSubscription ? 'Edit Subscription' : 'Create Subscription'}
              </h2>
              <p className="text-xs text-gray-600">
                {product} — {quantity} {quantity > 1 ? 'licenses' : 'license'}
              </p>
              {originalSubscription && (
                <p className="text-xs text-gray-500">
                  PO: {originalSubscription.poNumber || 'N/A'} |
                  Client: {originalSubscription.client?.company || originalSubscription.client?.cli_name || 'N/A'}
                </p>
              )}
            </div>
            <button className="p-1.5 rounded-md hover:bg-gray-200" onClick={onRequestClose}>
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
            {/* Left */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Subscription Period</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Expected Delivery
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border px-3 py-1.5 text-xs resize-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Attachment
                </label>
                <label className="block border border-dashed rounded-md p-2.5 text-center cursor-pointer hover:bg-gray-50">
                  <Upload size={18} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-600 truncate">
                    {attachment ? attachment.name : 'Upload file'}
                  </p>
                  <p className="text-[10px] text-gray-500">PDF, DOC, JPG, PNG</p>
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            {/* Right */}
            <div className="border rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Order Summary</h3>
                <button
                  onClick={() => setCustomPrice(!customPrice)}
                  className="text-xs text-blue-600 flex items-center gap-1"
                >
                  {customPrice ? <Lock size={14} /> : <Unlock size={14} />}
                  {customPrice ? 'Locked' : 'Edit'}
                </button>
              </div>

              <div className="flex justify-between text-xs">
                <span>Product</span>
                <span className="font-medium">{product}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span>Quantity</span>
                <span className="font-medium">{quantity}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span>Unit Price</span>
                <span className="font-medium">{currency}{unitPrice}</span>
              </div>

              {customPrice && (
                <input
                  type="text"
                  value={customTotal}
                  onChange={(e) => setCustomTotal(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-xs"
                />
              )}

              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-blue-600">{displayTotal}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-3 border-t bg-gray-50">
            <button
              onClick={onRequestClose}
              className="px-4 py-2 text-xs border rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {previousSubscription ? 'Update' : 'Activate'}
            </button>
          </div>
        </div>
      </PopupAnimation>
    </div>,
    document.body
  );
};

export default SubscriptionModal;
