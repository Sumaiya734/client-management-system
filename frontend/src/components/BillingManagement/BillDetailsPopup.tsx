import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatDate } from '../../utils/dateUtils';
import {
  X,
  Download,
  Mail,
  Calendar,
  Package,
  User,
  Phone,
  Globe,
  CreditCard,
  Building2,
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
    return num.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'text-green-600 bg-green-50 border-green-200',
      'partially paid': 'text-blue-600 bg-blue-50 border-blue-200',
      unpaid: 'text-amber-600 bg-amber-50 border-amber-200',
      overdue: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[status.toLowerCase()] || 'text-gray-600 bg-gray-50 border-gray-200';
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
  const billDate = formatDate(bill.billDate || bill.bill_date);
  const dueDate = formatDate(bill.dueDate || bill.due_date);

  const totalAmount = bill.total_amount || parseFloat((bill.totalAmount || '0').replace(/[^0-9.-]+/g, ''));
  const paidAmount = bill.paid_amount || parseFloat((bill.paidAmount || '0').replace(/[^0-9.-]+/g, ''));
  const outstanding = Math.max(0, totalAmount - paidAmount);

  const products = bill.products || [];
  const statusColor = getStatusColor(billStatus);

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-200 ${
        isAnimating 
          ? 'opacity-100 backdrop-blur-sm bg-black/20' 
          : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <PopupAnimation animationType="fadeIn" duration="0.2s">
        <div
          className="w-full max-w-full mx-4 sm:mx-6 md:mx-8 lg:mx-auto lg:max-w-2xl xl:max-w-3xl rounded-lg bg-white shadow-lg flex flex-col"
          style={{ maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 sm:px-6 py-4 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bill #{billNumber}</h2>
              <p className="text-sm text-gray-500 mt-1">PO: {poNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <div className="space-y-6">
              {/* Status & Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Bill Date:</span>
                    <span className="text-sm font-medium">{billDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Due Date:</span>
                    <span className="text-sm font-medium">{dueDate}</span>
                  </div>
                </div>
                
                {/* <div className="flex flex-col sm:items-end">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${statusColor}`}>
                    <span className="text-sm font-medium capitalize">{billStatus}</span>
                  </div>
                  <select
                    value={billStatus}
                    onChange={(e) => setBillStatus(e.target.value)}
                    className="mt-2 w-full sm:w-auto text-sm border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="paid">Paid</option>
                    <option value="partially paid">Partially Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div> */}
              </div>

              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Client Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{clientData.company || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{clientData.contact || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium truncate">{clientData.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{clientData.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              {products.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Products ({products.length})
                    </h3>
                  </div>
                  <div className="divide-y">
                    {products.map((p, i) => (
                      <div key={i} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{p.description}</p>
                          <p className="text-xs text-gray-500">Qty: {p.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">৳{formatCurrency(p.total)}</p>
                          <p className="text-xs text-gray-500">৳{formatCurrency(p.unit_price || p.unitPrice)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-sm font-bold">৳{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Paid Amount:</span>
                    <span className="text-sm font-medium text-green-600">৳{formatCurrency(paidAmount)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-700">Outstanding:</span>
                      <span className={`text-sm font-bold ${outstanding === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ৳{formatCurrency(outstanding)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes here..."
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-4 sm:px-6 py-4 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </PopupAnimation>
    </div>,
    document.body
  );
};

export default BillDetailsPopup;