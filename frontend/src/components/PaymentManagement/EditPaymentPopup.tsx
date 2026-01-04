import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';
import api from '../../api';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';

interface Payment {
  id?: number;
  poNumber: string;
  client_id: number;
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
  billing_id?: number | null;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  client_id: number;
  client: string;
  total_amount: number;
}

interface EditPaymentPopupProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (payment: Payment & { billing_id?: number | null }) => void;
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
    purchaseOrderId: null as number | null,
    clientId: null as number | null,
    paymentDate: '',
    amount: '',
    paymentMethod: 'Credit Card',
    transactionId: '',
    status: 'Completed',
    outstandingAmount: 0,
    billingId: null as number | null,
  });

  const [dropdownStates, setDropdownStates] = useState({
    purchaseOrder: false,
    paymentMethod: false,
    status: false,
  });

  const [loading, setLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [outstandingAmount, setOutstandingAmount] = useState(0);

  const paymentMethods = ['Credit Card', 'Bank Transfer', 'Check', 'Cash', 'Wire Transfer'];
  const statusOptions = ['Completed', 'Pending', 'Failed', 'Cancelled'];

  // Fetch purchase orders when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchPurchaseOrders();
    }
  }, [isOpen]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/purchases');
      const transformedPOs = response.data.map((po: any) => ({
        id: po.id,
        po_number: po.po_number,
        client_id: po.client_id || po.client?.id || 1,
        client: po.client?.company || po.client || 'N/A',
        total_amount: parseFloat(po.total_amount || 0),
      }));
      setPurchaseOrders(transformedPOs);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch billing info based on selected PO number
  const fetchBillingInfo = async (poNumber: string | number) => {
    try {
      const response = await api.get('/billing-managements');
      const billing = response.data.find(
        (bill: any) =>
          bill.po_number === poNumber || bill.po_number.toString() === poNumber.toString()
      );

      if (billing) {
        const outstanding = parseFloat(billing.total_amount || 0) - parseFloat(billing.paid_amount || 0);
        setOutstandingAmount(outstanding);
        setFormData((prev) => ({
          ...prev,
          outstandingAmount: outstanding,
          billingId: billing.id,
        }));
      } else {
        setOutstandingAmount(0);
        setFormData((prev) => ({
          ...prev,
          outstandingAmount: 0,
          billingId: null,
        }));
      }
    } catch (error) {
      console.error('Error fetching billing info:', error);
      setOutstandingAmount(0);
      setFormData((prev) => ({ ...prev, outstandingAmount: 0, billingId: null }));
    }
  };

  // Reset or populate form when payment prop changes
  useEffect(() => {
    if (payment && purchaseOrders.length > 0) {
      const selectedPO = purchaseOrders.find(
        (po) => po.po_number.toString() === payment.poNumber.toString()
      );

      const displayText = selectedPO
        ? `${selectedPO.po_number} - ${selectedPO.client} ($${selectedPO.total_amount.toFixed(2)})`
        : payment.poNumber;

      setFormData({
        purchaseOrder: displayText,
        purchaseOrderId: selectedPO?.id || null,
        clientId: payment.client_id,
        paymentDate: payment.date,
        amount: payment.amount.replace(/[৳$,]/g, ''),
        paymentMethod: payment.method || 'Credit Card',
        transactionId: payment.transactionId,
        status: payment.status,
        outstandingAmount: 0,
        billingId: payment.billing_id || null,
      });

      // If editing, fetch billing info
      if (selectedPO) fetchBillingInfo(selectedPO.po_number);
    } else if (!payment) {
      // New payment mode
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        purchaseOrder: '',
        purchaseOrderId: null,
        clientId: null,
        paymentDate: today,
        amount: '',
        paymentMethod: 'Credit Card',
        transactionId: '',
        status: 'Completed',
        outstandingAmount: 0,
        billingId: null,
      });
    }
  }, [payment, purchaseOrders]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDropdown = (dropdown: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown as keyof typeof prev],
    }));
  };

  const selectOption = (dropdown: string, value: string) => {
    if (dropdown === 'purchaseOrder') {
      const selectedPO = purchaseOrders.find((po) => po.po_number.toString() === value);
      if (selectedPO) {
        const displayText = `${selectedPO.po_number} - ${selectedPO.client} ($${selectedPO.total_amount.toFixed(2)})`;
        handleInputChange('purchaseOrder', displayText);
        handleInputChange('purchaseOrderId', selectedPO.id);
        handleInputChange('clientId', selectedPO.client_id);

        // অটো Transaction ID = PO Number
        handleInputChange('transactionId', selectedPO.po_number.toString());

        // Fetch billing info
        fetchBillingInfo(selectedPO.po_number);
      }
    } else {
      handleInputChange(dropdown, value);
    }

    setDropdownStates((prev) => ({
      ...prev,
      [dropdown]: false,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Extract PO number
    let poNumber = '';
    if (formData.purchaseOrder.includes(' - ')) {
      poNumber = formData.purchaseOrder.split(' - ')[0];
    } else {
      poNumber = formData.purchaseOrder;
    }

    if (!poNumber.trim()) {
      alert('Purchase Order is required');
      return;
    }

    if (!formData.paymentDate) {
      alert('Payment date is required');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Valid amount is required');
      return;
    }

    // Optional: Warn if exceeding outstanding
    if (outstandingAmount > 0 && amount > outstandingAmount) {
      if (!confirm(`Amount exceeds outstanding balance ($${outstandingAmount.toFixed(2)}). Continue?`)) {
        return;
      }
    }

    const clientId = formData.clientId || payment?.client_id || 1;

    const updatedPayment: Payment & { billing_id?: number | null } = {
      id: payment?.id,
      poNumber: poNumber,
      client_id: clientId,
      client: {
        company: payment?.client.company || 'Unknown Company',
        contact: payment?.client.contact || 'Unknown Contact',
      },
      date: formData.paymentDate,
      amount: amount.toFixed(2),
      method: formData.paymentMethod,
      transactionId: formData.transactionId || poNumber, // fallback to PO
      status: formData.status,
      receipt: formData.status === 'Completed' ? 'Generated' : 'Not Generated',
      billing_id: formData.billingId,
    };

    onUpdate(updatedPayment);
    onClose();
  };

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  if (!isVisible) return null;

  return createPortal(
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Purchase Order Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Order *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('purchaseOrder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                  >
                    <span className={formData.purchaseOrder ? 'text-gray-900' : 'text-gray-500'}>
                      {formData.purchaseOrder || 'Select purchase order'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${dropdownStates.purchaseOrder ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownStates.purchaseOrder && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {loading ? (
                        <div className="px-3 py-2 text-center text-gray-500">Loading...</div>
                      ) : purchaseOrders.length === 0 ? (
                        <div className="px-3 py-2 text-center text-gray-500">No purchase orders found</div>
                      ) : (
                        purchaseOrders.map((po) => (
                          <button
                            key={po.id}
                            type="button"
                            onClick={() => selectOption('purchaseOrder', po.po_number.toString())}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50"
                          >
                            <div className="font-medium">{po.po_number} - {po.client}</div>
                            <div className="text-sm text-gray-600">${po.total_amount.toFixed(2)}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Outstanding Amount Display */}
              {outstandingAmount > 0 && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-blue-900">
                    Outstanding Amount: <span className="font-bold">${outstandingAmount.toFixed(2)}</span>
                  </p>
                </div>
              )}

              {/* Payment Date & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Payment Method & Transaction ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('paymentMethod')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:ring-blue-500 flex justify-between items-center"
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
                            className="w-full px-3 py-2 text-left hover:bg-gray-50"
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => handleInputChange('transactionId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Auto-filled from PO"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:ring-blue-500 flex justify-between items-center"
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
                          className="w-full px-3 py-2 text-left hover:bg-gray-50"
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
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
              >
                {isEditMode ? 'Update Payment' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </PopupAnimation>
    </div>,
    document.body
  );
};

export default EditPaymentPopup;