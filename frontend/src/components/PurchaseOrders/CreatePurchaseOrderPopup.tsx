import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Calendar, Plus } from 'lucide-react';
import api from '../../api';

interface Product {
  id: number;
  name?: string;
  product_name?: string;
  price?: string;
  base_price?: string;
}

interface Client {
  id: number;
  company: string;
  contact: string;
}

interface CreatePurchaseOrderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (orderData: any) => void;
}

const CreatePurchaseOrderPopup: React.FC<CreatePurchaseOrderPopupProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState({
    poNumber: '',
    status: 'Draft',
    client: '',
    clientId: 0,
    product: '',
    productId: 0,
    quantity: 1,
    subscriptionStart: '',
    subscriptionEnd: '',
    subscriptionActive: false
  });

  const [dropdownStates, setDropdownStates] = useState({
    status: false,
    client: false,
    product: false
  });

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Status options
  const statusOptions = ['Draft', 'Active', 'In Progress', 'Completed'];
  
  // Fetch clients and products when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsResponse, productsResponse] = await Promise.all([
        api.get('/clients'),
        api.get('/products')
      ]);
      
      // After response interceptor normalization, response.data is the array of clients/products
      setClients(clientsResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
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

  const selectClient = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      client: `${client.company} - ${client.contact}`,
      clientId: client.id
    }));
    setDropdownStates(prev => ({
      ...prev,
      client: false
    }));
  };

  const selectProduct = (product: any) => {
    setFormData(prev => ({
      ...prev,
      product: product.product_name || product.name,
      productId: product.id
    }));
    setDropdownStates(prev => ({
      ...prev,
      product: false
    }));
  };

  const selectStatus = (status: string) => {
    handleInputChange('status', status);
    setDropdownStates(prev => ({
      ...prev,
      status: false
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the data for the API
    const formattedData = {
      poNumber: formData.poNumber,
      status: formData.status,
      client: formData.client,
      clientId: formData.clientId,
      product: formData.product,
      productId: formData.productId,
      quantity: formData.quantity,
      subscriptionStart: formData.subscriptionStart,
      subscriptionEnd: formData.subscriptionEnd,
      subscriptionActive: formData.subscriptionActive
    };
    
    onCreate(formattedData);
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      poNumber: '',
      status: 'Draft',
      client: '',
      clientId: 0,
      product: '',
      productId: 0,
      quantity: 1,
      subscriptionStart: '',
      subscriptionEnd: '',
      subscriptionActive: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Purchase Order</h2>
            <p className="text-sm text-gray-600 mt-1">Enter purchase order information below</p>
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
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PO Number */}
                <div>
                  <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    PO Number
                  </label>
                  <input
                    type="text"
                    id="poNumber"
                    value={formData.poNumber}
                    onChange={(e) => handleInputChange('poNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
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
                        {statusOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => selectStatus(option)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Client - Full Width */}
                <div className="md:col-span-2">
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('client')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                    >
                      <span className={formData.client ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.client || 'Select client'}
                      </span>
                      <ChevronDown size={16} className={`transition-transform ${dropdownStates.client ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownStates.client && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        {loading ? (
                          <div className="px-3 py-2 text-center text-gray-500">Loading clients...</div>
                        ) : clients.length === 0 ? (
                          <div className="px-3 py-2 text-center text-gray-500">No clients found</div>
                        ) : (
                          clients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => selectClient(client)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                            >
                              <div className="font-medium">{client.company}</div>
                              <div className="text-sm text-gray-600">{client.contact}</div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products & Subscriptions Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Products & Subscriptions</h3>
              <div className="space-y-4">
                {/* Product and Quantity Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product */}
                  <div>
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                      Product
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => toggleDropdown('product')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                      >
                        <span className="text-gray-500">
                          {formData.product || 'Select product'}
                        </span>
                        <ChevronDown size={16} className={`transition-transform ${dropdownStates.product ? 'rotate-180' : ''}`} />
                      </button>
                      {dropdownStates.product && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          {loading ? (
                            <div className="px-3 py-2 text-center text-gray-500">Loading products...</div>
                          ) : products.length === 0 ? (
                            <div className="px-3 py-2 text-center text-gray-500">No products found</div>
                          ) : (
                            products.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => selectProduct(product)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                              >
                                <div className="font-medium">{product.product_name || product.name}</div>
                                <div className="text-sm text-gray-600">৳{product.base_price || product.price || '0.00'}</div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Subscription Dates Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subscription Start */}
                  <div>
                    <label htmlFor="subscriptionStart" className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Start
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="subscriptionStart"
                        value={formData.subscriptionStart}
                        onChange={(e) => handleInputChange('subscriptionStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Select date"
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Subscription End */}
                  <div>
                    <label htmlFor="subscriptionEnd" className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription End
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="subscriptionEnd"
                        value={formData.subscriptionEnd}
                        onChange={(e) => handleInputChange('subscriptionEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Select date"
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Subscription Active Checkbox and Add Product Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="subscriptionActive"
                      checked={formData.subscriptionActive}
                      onChange={(e) => handleInputChange('subscriptionActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="subscriptionActive" className="ml-2 text-sm font-medium text-gray-700">
                      Subscription Active
                    </label>
                  </div>
                  
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </button>
                </div>
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
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderPopup;
