import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  Package,
  FileText,
  Edit3,
} from 'lucide-react';
import { billingManagementApi } from '../../api';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';

interface Bill {
  id: number;
  billNumber?: string;
  bill_number?: string;
  client: { company?: string; contact?: string; email?: string; phone?: string } | string;
  client_company?: string;
  client_contact?: string;
  poNumber?: string;
  po_number?: string;
  billDate?: string;
  bill_date?: string;
  dueDate?: string;
  due_date?: string;
  total_amount?: number;
  totalAmount?: string;
  paid_amount?: number;
  paidAmount?: string;
  status: string;
  paymentStatus?: string;
  payment_status?: string;
  products?: Array<{
    description: string;
    quantity: number;
    unit_price?: number;
    unitPrice?: string;
    total: string | number;
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
  onUpdate?: (updatedBill: Bill) => void;
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

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  useEffect(() => {
    if (bill) {
      setBillStatus(bill.paymentStatus || bill.payment_status || bill.status || 'Unpaid');
      setNotes(bill.notes || '');
    }
  }, [bill]);

  const handleDownload = () => bill && onDownload?.(bill);
  const handleSendEmail = () => bill && onSendEmail?.(bill);

  const handleSaveChanges = async () => {
    if (!bill) return;
    setIsSaving(true);
    try {
      const updateData = { payment_status: billStatus, notes };
      const response = await billingManagementApi.update(bill.id, updateData);
      onUpdate?.(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating bill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isVisible || !bill) return null;

  const formatCurrency = (amount?: string | number) => {
    const num = typeof amount === 'number' ? amount : parseFloat((amount || '0').toString().replace(/[^0-9.-]+/g, '')) || 0;
    return num.toLocaleString('en-BD');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      'partially paid': 'bg-blue-100 text-blue-800',
      unpaid: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
    };
    const key = status.toLowerCase();
    const badgeClass = styles[key] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>{status}</span>;
  };

  const clientData = typeof bill.client === 'object' && bill.client
    ? bill.client
    : {
        company: (bill as any).client_company || (typeof bill.client === 'string' ? bill.client : 'N/A'),
        contact: (bill as any).client_contact || '',
        email: (bill.client as any)?.email || '',
        phone: (bill.client as any)?.phone || '',
      };

  const billNumber = bill.billNumber || bill.bill_number || 'N/A';
  const poNumber = bill.poNumber || bill.po_number || 'N/A';
  const billDate = bill.billDate || bill.bill_date || 'N/A';
  const dueDate = bill.dueDate || bill.due_date || 'N/A';

  const totalAmount = bill.total_amount || parseFloat((bill.totalAmount || '0').replace(/[^0-9.-]+/g, ''));
  const paidAmount = bill.paid_amount || parseFloat((bill.paidAmount || '0').replace(/[^0-9.-]+/g, ''));
  const outstanding = Math.max(0, totalAmount - paidAmount);

  const products = bill.products || [];

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div
          className="w-full max-w-3xl rounded-xl bg-white shadow-xl max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bill Details</h2>
              <p className="text-xs text-gray-600 mt-1">#{billNumber} • PO: {poNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(95vh-120px)]">
            {/* Bill + Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Number</span>
                  <span className="font-medium">{billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PO Number</span>
                  <span className="font-medium">{poNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-1"><Calendar size={14} /> Bill Date</span>
                  <span className="font-medium">{billDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-1"><Calendar size={14} /> Due Date</span>
                  <span className="font-medium">{dueDate}</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Company</span>
                  <span className="font-medium">{clientData.company || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact</span>
                  <span className="font-medium">{clientData.contact || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{clientData.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{clientData.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                <Package size={16} /> Products
              </h3>
              {products.length > 0 ? (
                <div className="border rounded-md overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700">Item</th>
                        <th className="px-3 py-2 text-center text-gray-700">Qty</th>
                        <th className="px-3 py-2 text-right text-gray-700">Price</th>
                        <th className="px-3 py-2 text-right text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-gray-900">{p.description}</td>
                          <td className="px-3 py-2 text-center">{p.quantity}</td>
                          <td className="px-3 py-2 text-right text-gray-900">৳{formatCurrency(p.unit_price || p.unitPrice)}</td>
                          <td className="px-3 py-2 text-right font-medium">৳{formatCurrency(p.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No items</p>
              )}
            </div>

            {/* Payment Summary */}
            <div className="max-w-xs ml-auto bg-gray-50 rounded-lg p-4 border text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>৳{formatCurrency(bill.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>৳{formatCurrency(bill.tax)}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-medium">
                <span>Total</span>
                <span>৳{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid</span>
                <span className="text-green-600">৳{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-600">Due</span>
                <span className={outstanding === 0 ? 'text-green-600' : 'text-red-600'}>
                  ৳{formatCurrency(outstanding)}
                </span>
              </div>
            </div>

            {/* Status + Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Payment Status</label>
                <div className="flex items-center gap-3">
                  <select
                    value={billStatus}
                    onChange={(e) => setBillStatus(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Paid</option>
                    <option>Partially Paid</option>
                    <option>Unpaid</option>
                    <option>Overdue</option>
                  </select>
                  {getStatusBadge(billStatus)}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <Download size={15} /> PDF
            </button>
            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-gray-800 rounded-md hover:bg-gray-900"
            >
              <Mail size={15} /> Email
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-5 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </PopupAnimation>
    </div>,
    document.body
  );
};

export default BillDetailsPopup;