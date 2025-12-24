import React, { useState, useEffect } from 'react';
import { X, Download, Mail } from 'lucide-react';
import { billingManagementApi } from '../../api';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';

interface Bill {
  id: number;
  billNumber?: string;
  bill_number?: string;
  client: {
    company?: string;
    contact?: string;
    email?: string;
    phone?: string;
  } | string;
  client_company?: string;
  client_contact?: string;
  poNumber?: string;
  po_number?: string;
  billDate?: string;
  bill_date?: string;
  dueDate?: string;
  due_date?: string;
  totalAmount?: string;
  total_amount?: number;
  paidAmount?: string;
  paid_amount?: number;
  status: string;
  paymentStatus?: string;
  payment_status?: string;
  products?: Array<{
    description: string;
    quantity: number;
    unitPrice?: string;
    unit_price?: number;
    total: string;
  }>;
  subtotal?: string | number;
  tax?: string | number;
  notes?: string;
}

interface BillDetailsPopupProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (bill: Bill) => void;
  onSendEmail?: (bill: Bill) => void;
  onUpdate?: (bill: Bill) => void; // Callback when bill is updated
}

const BillDetailsPopup: React.FC<BillDetailsPopupProps> = ({
  bill,
  isOpen,
  onClose,
  onDownload,
  onSendEmail,
  onUpdate,
}) => {
  const [billStatus, setBillStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Update state when bill changes
  React.useEffect(() => {
    if (bill) {
      setBillStatus(bill.paymentStatus || bill.status || '');
      setNotes(bill.notes || '');
    }
  }, [bill]);

  const statusOptions = ['Paid', 'Partially Paid', 'Unpaid', 'Overdue'];

  const handleDownload = () => {
    if (bill && onDownload) {
      onDownload(bill);
    }
  };

  const handleSendEmail = () => {
    if (bill && onSendEmail) {
      onSendEmail(bill);
    }
  };

  const handleSaveChanges = async () => {
    if (!bill) return;
    
    setIsSaving(true);
    try {
      // Prepare update data
      const updateData = {
        payment_status: billStatus,
        notes: notes,
      };
      
      // Update the bill via API
      const response = await billingManagementApi.update(bill.id, updateData);
      
      // After response interceptor normalization, response.data contains the updated bill
      // Update the bill in the parent component
      if (onUpdate) {
        onUpdate(response.data);
      }
      // Close the popup after successful update
      onClose();
    } catch (error) {
      console.error('Error updating bill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  if (!isVisible || !bill) return null;

  // Format client data (can be object or string)
  const getClientData = () => {
    if (typeof bill.client === 'object' && bill.client !== null) {
      return bill.client;
    } else if (typeof bill.client === 'string') {
      // If client is stored as a string, try to extract company and contact
      return {
        company: bill.client,
        contact: bill.client_contact || '',
        email: '',
        phone: '',
      };
    }
    return {
      company: bill.client_company || '',
      contact: bill.client_contact || '',
    };
  };
  
  const clientData = getClientData();
  
  // Format bill data to handle both API and frontend field names
  const billNumber = bill.billNumber || bill.bill_number || 'N/A';
  const poNumber = bill.poNumber || bill.po_number || 'N/A';
  const billDate = bill.billDate || bill.bill_date || 'N/A';
  const dueDate = bill.dueDate || bill.due_date || 'N/A';
  const totalAmount = bill.totalAmount || `$${bill.total_amount?.toFixed(2) || '0.00'}`;
  const paidAmount = bill.paidAmount || `$${bill.paid_amount?.toFixed(2) || '0.00'}`;
  
  // Use products if available, otherwise show empty array
  const products = bill.products || [];
  
  // Calculate totals
  const subtotal = bill.subtotal !== undefined ? (typeof bill.subtotal === 'string' ? bill.subtotal : `$${bill.subtotal?.toFixed(2) || '0.00'}`) : `$${(parseFloat(totalAmount.replace('$', '')) * 0.95).toFixed(2)}`;
  const tax = bill.tax !== undefined ? (typeof bill.tax === 'string' ? bill.tax : `$${bill.tax?.toFixed(2) || '0.00'}`) : `$${(parseFloat(totalAmount.replace('$', '')) * 0.05).toFixed(2)}`;
  
  const paidNumeric = parseFloat(paidAmount.replace('$', ''));
  const totalNumeric = parseFloat(totalAmount.replace('$', ''));
  const outstanding = (totalNumeric - paidNumeric).toFixed(2);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bill Details - {billNumber}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete bill information and payment history
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bill and Client Information Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Bill Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Number:</label>
                  <div className="text-sm text-gray-900">{billNumber}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PO Number:</label>
                  <div className="text-sm text-gray-900">{poNumber}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Date:</label>
                  <div className="text-sm text-gray-900">{billDate}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date:</label>
                  <div className="text-sm text-gray-900">{dueDate}</div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client:</label>
                  <div className="text-sm text-gray-900">{clientData.company}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact:</label>
                  <div className="text-sm text-gray-900">{clientData.contact}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email:</label>
                  <div className="text-sm text-gray-900">
                    {clientData.email || `${clientData.contact?.toLowerCase().replace(' ', '')}@${clientData.company?.toLowerCase().replace(' ', '')}.com` || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone:</label>
                  <div className="text-sm text-gray-900">
                    {clientData.phone || '+1-234-567-8901'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products/Services Table */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Products/Services</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                        {product.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                        {product.unitPrice}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                        {product.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-8">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                    <span className="text-sm text-gray-900">{subtotal}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-700">Tax:</span>
                    <span className="text-sm text-gray-900">{tax}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-base font-semibold text-gray-900">Total:</span>
                    <span className="text-base font-semibold text-gray-900">{totalAmount}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-700">Paid:</span>
                    <span className="text-sm font-semibold text-green-600">{paidAmount}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-700">Outstanding:</span>
                    <span className="text-sm font-semibold text-red-600">${outstanding}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Status */}
            <div>
              <label htmlFor="billStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Status</label>
                <select
                  id="billStatus"
                  value={billStatus}
                  onChange={(e) => setBillStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Payment received on time"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isSaving}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      </PopupAnimation>
    </div>
  );
};

export default BillDetailsPopup;
