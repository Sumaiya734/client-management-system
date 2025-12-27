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

const CreatePurchaseOrderPopup: React.FC<CreatePurchaseOrderPopupProps> = ({ isOpen, onClose, onCreate }) => {
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
      const file = e.target.files[0];
      // Validate file type if needed
      setFormData({ ...formData, attachment: file });
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
      
      // Fetch clients
      const clientsResponse = await api.get('/clients');
      setClients(clientsResponse.data || []);
      
      // Fetch products
      const productsResponse = await api.get('/products');
      setProducts(productsResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching clients and products:', error);
      alert('Failed to load clients and products');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }
    
    // Validate that client ID is valid
    const clientId = parseInt(formData.clientId);
    if (isNaN(clientId) || clientId <= 0) {
      alert('Please select a valid client');
      return;
    }
    
    // Validate products - at least one product must be selected
    if (formData.products.length === 0 || formData.products.every(product => !product.productId)) {
      alert('Please add at least one product');
      return;
    }
    
    // Validate each product
    for (const product of formData.products) {
      const productId = parseInt(product.productId);
      if (isNaN(productId) || productId <= 0) {
        alert('Please select a valid product for each entry');
        return;
      }
      
      if (!product.subscriptionStart || !product.subscriptionEnd) {
        alert('Please fill in subscription start and end dates for all products');
        return;
      }
      
      if (new Date(product.subscriptionStart) >= new Date(product.subscriptionEnd)) {
        alert('Subscription end date must be after subscription start date for all products');
        return;
      }
    }
    
    try {
      setLoading(true);
      
      // Prepare data for API submission
      const orderData = {
        status: formData.status,
        client_id: clientId,
        products: formData.products.map(product => ({
          productId: parseInt(product.productId),
          quantity: product.quantity,
          subscription_start: product.subscriptionStart,
          subscription_end: product.subscriptionEnd,
        })),
        subscription_active: formData.subscriptionActive,
        total_amount: 0, // Backend will calculate this
        attachment: formData.attachment, // Include attachment file
      };
      
      await onCreate(orderData);
      
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start pb-4 mb-4 border-b border-gray-200">
            <div>
              <h5 className="text-xl font-bold text-gray-900">
                Create New Purchase Order
              </h5>
              <p className="text-sm text-gray-500">
                Enter purchase order information below
              </p>
            </div>
            <button 
              className="text-gray-500 hover:text-gray-700 text-2xl font-light leading-none"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Basic Information */}
            <h6 className="font-bold mb-3">Basic Information</h6>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="mb-4 md:mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value="Auto-generated"
                  readOnly
                  placeholder="Will be auto-generated"
                />
              </div>

              <div className="mb-4 md:mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              <div className="mb-4 md:mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company || client.cli_name} ({client.contact || client.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products & Subscriptions */}
            <h6 className="font-bold mb-3">Products & Subscriptions</h6>
            
            {formData.products.map((product, index) => (
              <div key={product.id} className="p-4 border border-gray-200 rounded-lg mb-4">
                <div className="mb-4 md:mb-0 md:w-1/2 md:pr-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product {index + 1}</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    value={product.productId}
                    onChange={(e) => {
                      const updatedProducts = [...formData.products];
                      updatedProducts[index] = { ...updatedProducts[index], productId: e.target.value };
                      setFormData({ ...formData, products: updatedProducts });
                    }}
                  >
                    <option value="">Select product</option>
                    {products.map((productOption) => (
                      <option key={productOption.id} value={productOption.id}>
                        {productOption.product_name || productOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 md:mb-0 md:w-1/2 md:pl-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
                    value={product.quantity} 
                    onChange={(e) => {
                      const updatedProducts = [...formData.products];
                      updatedProducts[index] = { ...updatedProducts[index], quantity: parseInt(e.target.value) || 1 };
                      setFormData({ ...formData, products: updatedProducts });
                    }}
                  />
                </div>

                <div className="mb-4 md:mb-0 md:w-1/2 md:pr-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Start</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
                    value={product.subscriptionStart}
                    onChange={(e) => {
                      const updatedProducts = [...formData.products];
                      updatedProducts[index] = { ...updatedProducts[index], subscriptionStart: e.target.value };
                      setFormData({ ...formData, products: updatedProducts });
                    }}
                  />
                </div>

                <div className="mb-4 md:mb-0 md:w-1/2 md:pl-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription End</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
                    value={product.subscriptionEnd}
                    onChange={(e) => {
                      const updatedProducts = [...formData.products];
                      updatedProducts[index] = { ...updatedProducts[index], subscriptionEnd: e.target.value };
                      setFormData({ ...formData, products: updatedProducts });
                    }}
                  />
                </div>
                
                {formData.products.length > 1 && (
                  <div className="mt-2">
                    <button 
                      type="button" 
                      className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      onClick={() => {
                        const updatedProducts = formData.products.filter((_, i) => i !== index);
                        setFormData({ ...formData, products: updatedProducts });
                      }}
                    >
                      Remove Product
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Add Product Button */}
            <div className="flex items-center gap-3 mb-3">
              <button 
                type="button" 
                className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const newProduct: ProductItem = {
                    id: Date.now().toString(),
                    productId: '',
                    quantity: 1,
                    subscriptionStart: '',
                    subscriptionEnd: '',
                  };
                  setFormData({
                    ...formData,
                    products: [...formData.products, newProduct]
                  });
                }}
              >
                + Add Product
              </button>
            </div>
            
            {/* Subscription Active */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  type="checkbox"
                  id="active"
                  checked={formData.subscriptionActive}
                  onChange={(e) => setFormData({...formData, subscriptionActive: e.target.checked})}
                />
                <label className="ml-2 block text-sm text-gray-700" htmlFor="active">
                  Subscription Active
                </label>
              </div>
            </div>
            
            {/* Attachment Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 font-bold">Attachment</label>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                />
                {formData.attachment && (
                  <div className="text-green-600">
                    <small className="text-sm">{formData.attachment.name}</small>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Upload supporting documents (images, PDFs, DOC, XLS)
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button 
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              type="button" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderPopup;