import React, { useState } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

const SubscriptionModal = ({ isOpen, onRequestClose, product, quantity, totalAmount, poNumber, onSubmit, previousSubscription = null }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Update effect to handle previousSubscription changes
  React.useEffect(() => {
    if (isOpen && previousSubscription) {
      setStartDate(previousSubscription.start_date ? previousSubscription.start_date.split('T')[0] : '');
      setEndDate(previousSubscription.end_date ? previousSubscription.end_date.split('T')[0] : '');
      setNotes(previousSubscription.notes || '');
    } else if (isOpen) {
      // Reset fields when opening fresh
      setStartDate('');
      setEndDate('');
      setNotes('');
    }
  }, [isOpen, previousSubscription]);

  // Calculate unit price
  const calculateUnitPrice = () => {
    if (!totalAmount || !quantity) return '0.00';
    const numericValue = totalAmount.replace(/[^\d.]/g, '') || '0';
    const total = parseFloat(numericValue) || 0;
    return quantity > 0 ? (total / quantity).toFixed(2) : '0.00';
  };

  const unitPrice = calculateUnitPrice();
  const currency = totalAmount ? totalAmount.match(/[^\d.\s]+/g)?.[0] || '৳' : '৳';
  const currencySuffix = totalAmount ? totalAmount.split(' ').pop() || 'BDT' : 'BDT';

  const handleSubmit = () => {
    onSubmit({
      startDate,
      endDate,
      notes,
      product,
      quantity,
      poNumber
    });
    onRequestClose();
  };

  // COMPACT + WIDER STYLE
  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 50,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '0',
      maxWidth: '500px',           // WIDER
      width: '60%',                // NEAR FULL WIDTH 
      border: 'none',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Subscribe Product"
      ariaHideApp={false}
    >
      <div className="p-4"> {/* reduced from p-5 */}

        {/* HEADER */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{previousSubscription ? 'Edit Subscription' : 'Subscribe Product'}</h2>
            <p className="text-xs text-gray-600">
              {previousSubscription ? 'Update subscription details' : `Configure subscription for ${product} (Quantity: ${quantity})`}
            </p>
          </div>
          <button
            onClick={onRequestClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FORM FIELDS */}
        <div className="space-y-3 mb-3">  {/* reduced spacing */}

          {/* PO Number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">PO Number</label>
            <input
              type="text"
              value={poNumber || ''}
              readOnly
              className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subscription Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subscription End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subscription Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter subscription notes (optional)"
              rows={2}   // made smaller
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none"
            />
          </div>
        </div>

        {/* PRODUCT DETAILS BOX */}
        <div className="bg-gray-50 rounded p-2 mb-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span className="text-gray-900 font-medium">{product}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="text-gray-900 font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unit Price:</span>
              <span className="text-gray-900 font-medium">
                {currency}{unitPrice} {currencySuffix}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-300">
              <span className="text-gray-900 font-semibold">Total:</span>
              <span className="text-gray-900 font-semibold">
                {totalAmount || `${currency}0.00 ${currencySuffix}`}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onRequestClose} size="sm" className="px-3">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} size="sm" className="px-3">
            {previousSubscription ? 'Update Subscription' : 'Activate Subscription'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubscriptionModal;
