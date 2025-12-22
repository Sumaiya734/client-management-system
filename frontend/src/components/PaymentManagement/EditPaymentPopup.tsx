import React, { useState } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';

interface Payment {
  id: number;
  poNumber: string;
  client: {
    company: string;
    contact: string;
  };
  date: string;
  amount: string;
  method: string;
  transactionId: string;
  status: string;
  receipt: string;
}

interface PurchaseOrder {
  poNumber: string;
  client: string;
  totalAmount: string;
  outstandingAmount: string;
}

interface EditPaymentPopupProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (payment: Payment) => void;
  isEditMode?: boolean;
}

const EditPaymentPopup: React.FC<EditPaymentPopupProps> = ({
  payment,
  isOpen,
  onClose,
  onUpdate,
  isEditMode = true,
}) => {
  const [formData, setFormData] = useState({
    purchaseOrder: '',
    paymentDate: '',
    amount: '',
    paymentMethod: '',
    transactionId: '',
    status: 'Completed'
  });

  const [dropdownStates, setDropdownStates] = useState({
    purchaseOrder: false,
    paymentMethod: false,
    status: false
  });

  // Mock purchase orders data
  const purchaseOrders: PurchaseOrder[] = [
    {
      poNumber: 'PO-2025-001',
      client: 'Acme Corp',
      totalAmount: '$99.99',
      outstandingAmount: '$0.00'
    },
    {
      poNumber: 'PO-2025-002',
      client: 'Tech Solutions Inc',
      totalAmount: '$15.00',
      outstandingAmount: '$0.00'
    },
    {
      poNumber: 'PO-2024-089',
      client: 'Global Dynamics',
      totalAmount: '$150.00',
      outstandingAmount: '$150.00'
    }
  ];

  const paymentMethods = ['Credit Card', 'Bank Transfer', 'Check', 'Cash', 'Wire Transfer'];
  const statusOptions = ['Completed', 'Pending', 'Failed', 'Cancelled'];

  // Update form data when payment changes
  React.useEffect(() => {
    if (payment) {
      const selectedPO = purchaseOrders.find(po => po.poNumber === payment.poNumber);
      setFormData({
        purchaseOrder: selectedPO ? `${selectedPO.poNumber} - ${selectedPO.client} (${selectedPO.totalAmount} - Outstanding: ${selectedPO.outstandingAmount})` : '',
        paymentDate: payment.date,
        amount: payment.amount.replace('$', ''),
        paymentMethod: payment.method,
        transactionId: payment.transactionId,
        status: payment.status
      });
    } else {
      // Reset form for new payment
      setFormData({
        purchaseOrder: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMethod: 'Credit Card',
        transactionId: '',
        status: 'Completed'
      });
    }
  }, [payment]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleDropdown = (dropdown: string) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown as keyof typeof prev]
    }));
  };

  const selectOption = (dropdown: string, value: string) => {
    if (dropdown === 'purchaseOrder') {
      const selectedPO = purchaseOrders.find(po => po.poNumber === value.split(' - ')[0]);
      if (selectedPO) {
        handleInputChange('purchaseOrder', `${selectedPO.poNumber} - ${selectedPO.client} (${selectedPO.totalAmount} - Outstanding: ${selectedPO.outstandingAmount})`);
      }
    } else {
      handleInputChange(dropdown, value);
    }
    
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: false
    }));
  };

  const generateTransactionId = () => {
    const prefix = formData.paymentMethod === 'Check' ? 'CHK' : 'TXN';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newTransactionId = `${prefix}-${year}-${randomNum}`;
    handleInputChange('transactionId', newTransactionId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedPayment: Payment = {
      id: payment?.id || Date.now(),
      poNumber: formData.purchaseOrder.split(' - ')[0],
      client: {
        company: formData.purchaseOrder.split(' - ')[1]?.split(' (')[0] || '',
        contact: payment?.client.contact || 'Unknown Contact'
      },
      date: formData.paymentDate,
      amount: `$${formData.amount}`,
      method: formData.paymentMethod,
      transactionId: formData.transactionId,
      status: formData.status,
      receipt: formData.status === 'Completed' ? 'Generated' : 'Not Generated'
    };

    onUpdate(updatedPayment);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Payment' : 'Record Payment'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? 'Update payment information' : 'Record a new payment transaction'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Purchase Order */}
            <div>
              <label htmlFor="purchaseOrder" className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Order
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('purchaseOrder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span className={formData.purchaseOrder ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.purchaseOrder || 'Select purchase order'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${dropdownStates.purchaseOrder ? 'rotate-180' : ''}`} />
                </button>
                {dropdownStates.purchaseOrder && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {purchaseOrders.map((po) => (
                      <button
                        key={po.poNumber}
                        type="button"
                        onClick={() => selectOption('purchaseOrder', po.poNumber)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        <div className="font-medium">{po.poNumber} - {po.client}</div>
                        <div className="text-sm text-gray-600">
                          {po.totalAmount} - Outstanding: {po.outstandingAmount}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Date and Amount Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="paymentDate"
                    value={formData.paymentDate}
                    onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Payment Method and Transaction ID Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('paymentMethod')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                  >
                    <span>{formData.paymentMethod}</span>
                    <ChevronDown size={16} className={`transition-transform ${dropdownStates.paymentMethod ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownStates.paymentMethod && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {paymentMethods.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => selectOption('paymentMethod', method)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="transactionId"
                    value={formData.transactionId}
                    onChange={(e) => handleInputChange('transactionId', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter or generate ID"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateTransactionId}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span>{formData.status}</span>
                  <ChevronDown size={16} className={`transition-transform ${dropdownStates.status ? 'rotate-180' : ''}`} />
                </button>
                {dropdownStates.status && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => selectOption('status', status)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {isEditMode ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaymentPopup;
