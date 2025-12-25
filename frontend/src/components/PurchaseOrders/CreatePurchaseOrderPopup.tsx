import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Calendar, Plus, Upload, X as XIcon } from 'lucide-react';
import api from '../../api';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';

interface Product {
  id: number;
  name?: string;
  product_name?: string;
  base_price?: number;
  bdt_price?: number;
}

interface Client {
  id: number;
  company: string;
  contact: string;
}

interface CreatePurchaseOrderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (orderData: any) => Promise<any>;
}

const CreatePurchaseOrderPopup: React.FC<CreatePurchaseOrderPopupProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState({
    status: 'Draft',
    client: '',
    clientId: 0,
    product: '',
    productId: 0,
    quantity: 1,
    subscriptionStart: '',
    subscriptionEnd: '',
    subscriptionActive: false,
    attachment: ''
  });

  // শুধু একটা dropdown open থাকবে
  const [openDropdown, setOpenDropdown] = useState<'status' | 'client' | 'product' | null>(null);

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const popupRef = useRef<HTMLDivElement>(null);

  const statusOptions = ['Draft', 'Active', 'In Progress', 'Completed'];

  useEffect(() => {
    if (isOpen) {
      fetchData();
      // Reset form
      setFormData({
        status: 'Draft',
        client: '',
        clientId: 0,
        product: '',
        productId: 0,
        quantity: 1,
        subscriptionStart: '',
        subscriptionEnd: '',
        subscriptionActive: false,
        attachment: ''
      });
      setAttachments([]);
      setOpenDropdown(null);
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, productsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/products')
      ]);

      setClients(clientsRes.data?.data || []);
      setProducts(productsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching clients/products:', error);
      alert('Failed to load clients or products');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (dropdown: 'status' | 'client' | 'product') => {
    setOpenDropdown(prev => prev === dropdown ? null : dropdown);
  };

  const selectClient = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      client: `${client.company} - ${client.contact}`,
      clientId: client.id
    }));
    setOpenDropdown(null);
  };

  const selectProduct = (product: Product) => {
    setFormData(prev => ({
      ...prev,
      product: product.product_name || product.name || 'Unknown Product',
      productId: product.id
    }));
    setOpenDropdown(null);
  };

  const selectStatus = (status: string) => {
    setFormData(prev => ({ ...prev, status }));
    setOpenDropdown(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      status: formData.status,
      client_id: formData.clientId,
      product_id: formData.productId,
      quantity: formData.quantity,
      subscription_start: formData.subscriptionStart,
      subscription_end: formData.subscriptionEnd,
      subscription_active: formData.subscriptionActive ? 1 : 0,
      attachment: formData.attachment
    };

    if (attachments.length > 0) {
      submitData.attachment = attachments[0].name; // পরে real upload করতে পারো
    }

    try {
      await onCreate(submitData);
      onClose();
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip', 'application/x-zip-compressed',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'image/jpeg', 'image/png', 'image/gif'
    ];

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type not allowed: ${file.name}`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div
          ref={popupRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Purchase Order</h2>
              <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new PO</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* PO Number - Disabled */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PO Number</label>
              <input
                type="text"
                value="Auto-generated" readOnly  // aikhne api theke show korbe
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
              />
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown('status')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition"
                >
                  <span>{formData.status}</span>
                  <ChevronDown size={18} className={`transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'status' && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {statusOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => selectStatus(option)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition text-sm"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown('client')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition"
                >
                  <span className={formData.client ? '' : 'text-gray-400'}>
                    {formData.client || 'Select client'}
                  </span>
                  <ChevronDown size={18} className={`transition-transform ${openDropdown === 'client' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'client' && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                    {loading ? (
                      <div className="px-4 py-3 text-center text-gray-500">Loading clients...</div>
                    ) : clients.length === 0 ? (
                      <div className="px-4 py-3 text-center text-gray-500">No clients found</div>
                    ) : (
                      clients.map(client => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => selectClient(client)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition text-sm"
                        >
                          <div className="font-medium">{client.company}</div>
                          <div className="text-xs text-gray-500">{client.contact}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Product Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown('product')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition"
                >
                  <span className={formData.product ? '' : 'text-gray-400'}>
                    {formData.product || 'Select product'}
                  </span>
                  <ChevronDown size={18} className={`transition-transform ${openDropdown === 'product' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'product' && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                    {products.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => selectProduct(product)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition text-sm"
                      >
                        <div>{product.product_name || product.name}</div>
                        <div className="text-xs text-gray-500">৳{product.bdt_price || product.base_price || 'N/A'}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Start</label>
                <input
                  type="date"
                  value={formData.subscriptionStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, subscriptionStart: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription End</label>
                <input
                  type="date"
                  value={formData.subscriptionEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, subscriptionEnd: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.subscriptionActive}
                onChange={(e) => setFormData(prev => ({ ...prev, subscriptionActive: e.target.checked }))}
                className="h-4 w-4 text-gray-900 rounded border-gray-300"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">Subscription Active</label>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                  <span>Click to upload files</span>
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
                <p className="text-xs text-gray-500 mt-2">PDF, DOC, ZIP, Images up to 10MB</p>
              </div>
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button type="button" onClick={() => removeAttachment(i)}>
                        <XIcon className="h-5 w-5 text-red-600 hover:text-red-800" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.clientId || !formData.productId || !formData.subscriptionStart || !formData.subscriptionEnd}
                className="px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Purchase Order
              </button>
            </div>
          </form>
        </div>
      </PopupAnimation>
    </div>
  );
};

export default CreatePurchaseOrderPopup;