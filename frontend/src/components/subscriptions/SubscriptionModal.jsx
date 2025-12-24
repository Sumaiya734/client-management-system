import React, { useState } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

const SubscriptionModal = ({ isOpen, onRequestClose, product, quantity, totalAmount, poNumber, onSubmit }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate unit price from total amount
  const calculateUnitPrice = () => {
    if (!totalAmount || !quantity) return '0.00';
    // Extract numeric value from string like "৳4143.75 BDT"
    const numericValue = totalAmount ? totalAmount.replace(/[^\d.]/g, '') : '0';
    const total = parseFloat(numericValue) || 0;
    const unitPrice = quantity > 0 ? (total / quantity).toFixed(2) : '0.00';
    return unitPrice;
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
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '0',
      maxWidth: '480px',
      width: '90%',
      border: 'none',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Subscribe Product</h2>
            <p className="text-sm text-gray-600">Configure subscription for {product} (Quantity: {quantity})</p>
          </div>
          <button
            onClick={onRequestClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-4">
          {/* PO Number - Read-only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PO Number
            </label>
            <input
              type="text"
              value={poNumber || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm"
            />
          </div>
          
          {/* Subscription Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 text-sm"
            />
          </div>

          {/* Subscription End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 text-sm"
            />
          </div>

          {/* Subscription Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter subscription notes (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 resize-none text-sm"
            />
          </div>
        </div>

        {/* Product Details Box */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Product:</span>
              <span className="text-gray-900 font-medium">{product}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity:</span>
              <span className="text-gray-900 font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Unit Price:</span>
              <span className="text-gray-900 font-medium">
                {currency}{unitPrice} {currencySuffix}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-900 font-semibold">Total:</span>
              <span className="text-gray-900 font-semibold">{totalAmount || `${currency}0.00 ${currencySuffix}`}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onRequestClose}
            size="sm"
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            size="sm"
            className="px-4"
          >
            Activate Subscription
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubscriptionModal;
