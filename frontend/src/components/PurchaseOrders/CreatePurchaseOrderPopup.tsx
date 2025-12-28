import React, { useState, useEffect } from "react";
import api from '../../api';

interface CreatePurchaseOrderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (orderData: any) => void;
}

interface ProductItem {
  id: string;
  productId: string;
  quantity: number;
  subscriptionStart: string;
  subscriptionEnd: string;
}

interface FormData {
  status: string;
  clientId: string;
  products: ProductItem[];
  subscriptionActive: boolean;
  attachment: File | null;
}

const CreatePurchaseOrderPopup: React.FC<CreatePurchaseOrderPopupProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState<FormData>({
    status: 'Pending',
    clientId: '',
    products: [{
      id: Date.now().toString(),
      productId: '',
      quantity: 1,
      subscriptionStart: '',
      subscriptionEnd: '',
    }],
    subscriptionActive: false,
    attachment: null,
  });

  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, attachment: e.target.files[0] });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClientsAndProducts();
    }
  }, [isOpen]);

  const fetchClientsAndProducts = async () => {
    try {
      setLoading(true);
      const [clientsRes, productsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/products'),
      ]);
      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load clients and products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }

    const clientId = parseInt(formData.clientId);
    if (isNaN(clientId) || clientId <= 0) {
      alert('Please select a valid client');
      return;
    }

    if (formData.products.length === 0 || formData.products.every(p => !p.productId)) {
      alert('Please add at least one product');
      return;
    }

    for (const product of formData.products) {
      const productId = parseInt(product.productId);
      if (isNaN(productId) || productId <= 0) {
        alert('Please select a valid product for each entry');
        return;
      }
      if (!product.subscriptionStart || !product.subscriptionEnd) {
        alert('Please fill in subscription dates for all products');
        return;
      }
      if (new Date(product.subscriptionStart) >= new Date(product.subscriptionEnd)) {
        alert('End date must be after start date');
        return;
      }
    }

    try {
      setLoading(true);
      const orderData = {
        status: formData.status,
        client_id: clientId,
        products: formData.products.map(p => ({
          productId: parseInt(p.productId),
          quantity: p.quantity,
          subscription_start: p.subscriptionStart,
          subscription_end: p.subscriptionEnd,
        })),
        subscription_active: formData.subscriptionActive,
        total_amount: 0,
        attachment: formData.attachment,
      };

      await onCreate(orderData);
      onClose(); // Optional: close on success
    } catch (error) {
      console.error('Error creating PO:', error);
      alert('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      productId: '',
      quantity: 1,
      subscriptionStart: '',
      subscriptionEnd: '',
    };
    setFormData({ ...formData, products: [...formData.products, newProduct] });
  };

  const removeProduct = (index: number) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index),
    });
  };

  const updateProduct = (index: number, field: keyof ProductItem, value: any) => {
    const updated = [...formData.products];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, products: updated });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Create Purchase Order</h3>
            <p className="mt-1 text-sm text-gray-600">Fill in the details to generate a new PO</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-3xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {loading && !clients.length && !products.length ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading clients and products...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">PO Number</label>
                    <input
                      type="text"
                      readOnly
                      value="Auto-generated"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Client <span className="text-red-500">*</span></label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.company || client.cli_name} ({client.contact || client.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Products Section */}
              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Products & Subscriptions</h4>
                <div className="space-y-5">
                  {formData.products.map((product, index) => (
                    <div key={product.id} className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Product {index + 1} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={product.productId}
                            onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.product_name || p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <br />
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                            <input
                              type="date"
                              value={product.subscriptionStart}
                              onChange={(e) => updateProduct(index, 'subscriptionStart', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                            <input
                              type="date"
                              value={product.subscriptionEnd}
                              onChange={(e) => updateProduct(index, 'subscriptionEnd', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          {formData.products.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeProduct(index)}
                              className="mb-1 px-4 py-2.5 text-red-600 hover:bg-red-50 border border-red-300 rounded-xl transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addProduct}
                  className="mt-4 px-5 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Product
                </button>
              </section>

              {/* Additional Options */}
              <section className="space-y-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="subscriptionActive"
                    checked={formData.subscriptionActive}
                    onChange={(e) => setFormData({ ...formData, subscriptionActive: e.target.checked })}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="subscriptionActive" className="ml-3 text-base font-medium text-gray-900">
                    Mark subscription as active
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Optional)</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                  />
                  {formData.attachment && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {formData.attachment.name}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Supported: Images, PDF, Word, Excel</p>
                </div>
              </section>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-8 py-6 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-xl font-medium transition shadow-sm flex items-center gap-2"
          >
            {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderPopup;