import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface Product {
  id: number | null;
  name: string;
  description: string;
  category: string;
  vendor: string;
  type: string;
  basePrice: string | number;
  profit: string | number;
  bdtPrice: string;
  bdtLabel: string;
  currencies: Array<{ code: string; price: string }>;
  status: string;
}

interface EditProductPopupProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (product: Product) => void;
  isEditMode?: boolean;
}

const EditProductPopup: React.FC<EditProductPopupProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onUpdate, 
  isEditMode = true,
}) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    vendor: '', 
    category: '', 
    subscriptionType: '', 
    description: '', 
    basePrice: '', 
    baseCurrency: 'USD', 
    profitMargin: '', 
    status: 'Active' 
  });

  const [dropdownStates, setDropdownStates] = useState({ 
    category: false, 
    subscriptionType: false, 
    baseCurrency: false, 
    status: false 
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({ 
        name: product.name || '', 
        vendor: product.vendor || '', 
        category: product.category || '', 
        subscriptionType: product.type || '', 
        description: product.description || '', 
        basePrice: typeof product.basePrice === 'string' ? product.basePrice.replace(' USD', '') : product.basePrice.toString(), 
        baseCurrency: 'USD', 
        profitMargin: typeof product.profit === 'string' ? product.profit.replace('%', '') : product.profit.toString(), 
        status: product.status || 'Active' 
      });
    } else {
      // Reset to default values when no product is provided
      setFormData({ 
        name: '', 
        vendor: '', 
        category: '', 
        subscriptionType: '', 
        description: '', 
        basePrice: '', 
        baseCurrency: 'USD', 
        profitMargin: '', 
        status: 'Active' 
      });
    }
  }, [product]);

  const categoryOptions = ['Communication', 'Productivity', 'Design', 'AI Tools', 'Media'];
  const subscriptionTypeOptions = ['Per User', 'Per License', 'Per Editor', 'Per Account'];
  const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  const statusOptions = ['Active', 'Inactive'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleDropdown = (dropdown: string) => {
    setDropdownStates(prev => ({ 
      ...prev, 
      [dropdown]: !prev[dropdown as keyof typeof prev] 
    }));
  };

  const selectOption = (dropdown: string, value: string) => {
    handleInputChange(dropdown === 'subscriptionType' ? 'subscriptionType' : 
                     dropdown === 'baseCurrency' ? 'baseCurrency' : dropdown, value);
    setDropdownStates(prev => ({ 
      ...prev, 
      [dropdown]: false 
    }));
  };

  // Calculate BDT price preview
  const calculateBDTPrice = () => {
    const basePrice = parseFloat(formData.basePrice) || 0;
    const profitMargin = parseFloat(formData.profitMargin) || 0;
    const exchangeRate = 110.5; // USD to BDT rate
    
    const priceWithProfit = basePrice * (1 + profitMargin / 100);
    const bdtPrice = priceWithProfit * exchangeRate;
    
    return { 
      bdtPrice: bdtPrice.toFixed(2), 
      basePrice: basePrice.toFixed(0), 
      exchangeRate: exchangeRate.toFixed(1), 
      profitMargin: profitMargin.toFixed(0) 
    };
  };

  const pricePreview = calculateBDTPrice();
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Vendor is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.basePrice || isNaN(parseFloat(formData.basePrice)) || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Valid base price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (product) {
        const productToSubmit = { 
          id: product.id,
          name: formData.name, 
          description: formData.description, 
          category: formData.category, 
          vendor: formData.vendor, 
          type: formData.subscriptionType, 
          basePrice: parseFloat(formData.basePrice), 
          profit: parseFloat(formData.profitMargin), 
          bdtPrice: `৳${pricePreview.bdtPrice}`, 
          bdtLabel: 'BDT (final price)',
          currencies: [],
          status: formData.status, 
          // API fields
          product_name: formData.name, 
          vendor_type: formData.subscriptionType, 
          base_price: parseFloat(formData.basePrice), 
          bdt_price: parseFloat(pricePreview.bdtPrice), 
          multi_currency: JSON.stringify([]),
        };
        onUpdate(productToSubmit);
      }
    }
  };

  const handleCancel = () => {
    setErrors({}); // Clear errors
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? 'Update product information' : 'Create a new product'}
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
            {/* Product Name and Vendor Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <input
                  type="text"
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.vendor ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {errors.vendor && <p className="mt-1 text-sm text-red-600">{errors.vendor}</p>}
              </div>
            </div>

            {/* Category and Subscription Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('category')}
                    className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between`}
                  >
                    <span>{formData.category}</span>
                    <ChevronDown size={16} className={`transition-transform ${dropdownStates.category ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownStates.category && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {categoryOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => selectOption('category', option)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="subscriptionType" className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Type
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('subscriptionType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                  >
                    <span>{formData.subscriptionType}</span>
                    <ChevronDown size={16} className={`transition-transform ${dropdownStates.subscriptionType ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownStates.subscriptionType && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {subscriptionTypeOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => selectOption('subscriptionType', option)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Base Price, Base Currency, and Profit Margin Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price
                </label>
                <input
                  type="number"
                  id="basePrice"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', e.target.value)}
                  step="0.01"
                  className={`w-full px-3 py-2 border ${errors.basePrice ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {errors.basePrice && <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>}
              </div>
              <div>
                <label htmlFor="baseCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                  Base Currency
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('baseCurrency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                  >
                    <span>{formData.baseCurrency}</span>
                    <ChevronDown size={16} className={`transition-transform ${dropdownStates.baseCurrency ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownStates.baseCurrency && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {currencyOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => selectOption('baseCurrency', option)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="profitMargin" className="block text-sm font-medium text-gray-700 mb-2">
                  Profit Margin (%)
                </label>
                <input
                  type="number"
                  id="profitMargin"
                  value={formData.profitMargin}
                  onChange={(e) => handleInputChange('profitMargin', e.target.value)}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* BDT Price Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                BDT Price Preview (with {pricePreview.profitMargin}% profit)
              </h3>
              <div className="text-lg font-semibold text-gray-900">৳{pricePreview.bdtPrice} BDT</div>
              <div className="text-sm text-gray-600 mt-1">
                Base: {pricePreview.basePrice} USD × Rate: {pricePreview.exchangeRate} × Profit: {pricePreview.profitMargin}%
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
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => selectOption('status', option)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        {option}
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPopup;
