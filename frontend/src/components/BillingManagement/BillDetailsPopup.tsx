import React, { useState } from 'react';
import { X, Download, Mail } from 'lucide-react';

interface Bill {
  id: number;
  billNumber: string;
  client: {
    company: string;
    contact: string;
    email?: string;
    phone?: string;
  };
  poNumber: string;
  billDate: string;
  dueDate: string;
  totalAmount: string;
  paidAmount: string;
  status: string;
  paymentStatus: string;
  products?: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
  subtotal?: string;
  tax?: string;
  notes?: string;
}

interface BillDetailsPopupProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (bill: Bill) => void;
  onSendEmail?: (bill: Bill) => void;
}

const BillDetailsPopup: React.FC<BillDetailsPopupProps> = ({
  bill,
  isOpen,
  onClose,
  onDownload,
  onSendEmail,
}) => {
  const [billStatus, setBillStatus] = useState('');
  const [notes, setNotes] = useState('');

  // Update state when bill changes
  React.useEffect(() => {
    if (bill) {
      setBillStatus(bill.status);
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

  if (!isOpen || !bill) return null;

  // Mock product data if not provided
  const products = bill.products || [
    {
      description: 'Premium Plan',
      quantity: 2,
      unitPrice: '$99.99',
      total: '$199.98'
    },
    {
      description: 'Setup Fee',
      quantity: 1,
      unitPrice: '$50.00',
      total: '$50.00'
    }
  ];

  // Calculate totals
  const subtotal = bill.subtotal || '$249.98';
  const tax = bill.tax || '$24.99';
  const total = bill.totalAmount;
  const paid = bill.paidAmount;
  const paidNumeric = parseFloat(paid.replace('$', ''));
  const totalNumeric = parseFloat(total.replace('$', ''));
  const outstanding = (totalNumeric - paidNumeric).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bill Details - {bill.billNumber}
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
                  <div className="text-sm text-gray-900">{bill.billNumber}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PO Number:</label>
                  <div className="text-sm text-gray-900">{bill.poNumber}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Date:</label>
                  <div className="text-sm text-gray-900">{bill.billDate}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date:</label>
                  <div className="text-sm text-gray-900">{bill.dueDate}</div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client:</label>
                  <div className="text-sm text-gray-900">{bill.client.company}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact:</label>
                  <div className="text-sm text-gray-900">{bill.client.contact}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email:</label>
                  <div className="text-sm text-gray-900">
                    {bill.client.email || `${bill.client.contact.toLowerCase().replace(' ', '')}@${bill.client.company.toLowerCase().replace(' ', '')}.com`}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone:</label>
                  <div className="text-sm text-gray-900">
                    {bill.client.phone || '+1-234-567-8901'}
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
                    <span className="text-base font-semibold text-gray-900">{total}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-700">Paid:</span>
                    <span className="text-sm font-semibold text-green-600">{paid}</span>
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
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailsPopup;
