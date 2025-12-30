import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Upload, X as XIcon } from 'lucide-react';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';
import { vendorApi } from '../../api.js';

interface Product {
  id: number | null;
  name: string;
  description: string;
  category: string;
  vendor: string;
  vendorWebsite: string;
  type: string;
  basePrice: string | number;
  baseCurrency: string;
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
    vendorId: null, // Add vendorId field
    vendorWebsite: '',
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
    status: false,
    vendor: false // Add vendor dropdown state
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // State for vendors
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        vendor: product.vendor || '',
        vendorId: null, // Initialize to null
        vendorWebsite: product.vendorWebsite || '',
        category: product.category || '',
        subscriptionType: product.type || '',
        description: product.description || '',
        basePrice: typeof product.basePrice === 'string' ? product.basePrice.replace(' USD', '') : product.basePrice.toString(),
        baseCurrency: product.baseCurrency || 'USD',
        profitMargin: typeof product.profit === 'string' ? product.profit.replace('%', '') : product.profit.toString(),
        status: product.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        vendor: '',
        vendorId: null, // Initialize to null
        vendorWebsite: '',
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

  // Fetch vendors when component mounts
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const response = await vendorApi.getAll();
        setVendors(response.data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  // Set vendorId when vendors are loaded and product has vendor
  useEffect(() => {
    if (product && vendors.length > 0 && !formData.vendorId) {
      const foundVendor = vendors.find(v => v.name === product.vendor);
      if (foundVendor) {
        setFormData(prev => ({ ...prev, vendorId: foundVendor.id }));
      }
    }
  }, [vendors, product, formData.vendorId]);

  const categoryOptions = ['Communication', 'Productivity', 'Design', 'AI Tools', 'Media'];
  const subscriptionTypeOptions = ['Per User', 'Per License', 'Per Editor', 'Per Account'];
  const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  const statusOptions = ['Active', 'Inactive'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    
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
    if (dropdown === 'vendor') {
      // Find the selected vendor from the vendors array
      const selectedVendor = vendors.find(v => v.id === parseInt(value));
      if (selectedVendor) {
        // Update both vendor name and website when vendor is selected
        setFormData(prev => ({
          ...prev,
          vendor: selectedVendor.name,
          vendorId: selectedVendor.id,
          vendorWebsite: selectedVendor.website || ''
        }));
      }
    } else {
      handleInputChange(
        dropdown === 'subscriptionType' ? 'subscriptionType' : 
        dropdown === 'baseCurrency' ? 'baseCurrency' : dropdown,
        value
      );
    }
    
    setDropdownStates(prev => ({ 
      ...prev, 
      [dropdown]: false 
    }));
  };

  const calculateBDTPrice = () => {
    const basePrice = parseFloat(formData.basePrice) || 0;
    const profitMargin = parseFloat(formData.profitMargin) || 0;
    const exchangeRate = 110.5;
    
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
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.vendor.trim()) newErrors.vendor = 'Vendor is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
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
          vendorWebsite: formData.vendorWebsite,
          type: formData.subscriptionType,
          basePrice: parseFloat(formData.basePrice),
          baseCurrency: formData.baseCurrency,
          profit: parseFloat(formData.profitMargin),
          bdtPrice: `৳${pricePreview.bdtPrice}`,
          bdtLabel: 'BDT (final price)',
          currencies: product.currencies || [],
          status: formData.status,
          product_name: formData.name,
          vendor_type: formData.subscriptionType,
          base_price: parseFloat(formData.basePrice),
          base_currency: formData.baseCurrency,
          bdt_price: parseFloat(pricePreview.bdtPrice),
          multi_currency: JSON.stringify(product.currencies || []),
        };
        onUpdate(productToSubmit);
      }
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  if (!isVisible) return null;

  return createPortal(
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div 
          className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {isEditMode ? 'Update product information' : 'Create a new product'}
            </p>
          </div>

          <button className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 text-sm space-y-4">

          {/* Row: Product Name + Vendor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-2 py-1.5 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md text-sm`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('vendor')}
                  className={`w-full px-2 py-1.5 border ${
                    errors.vendor ? 'border-red-500' : 'border-gray-300'
                  } rounded-md bg-white text-left text-sm flex items-center justify-between`}
                  disabled={loadingVendors}
                >
                  {loadingVendors ? 'Loading vendors...' : (formData.vendor || 'Select vendor')}
                  <ChevronDown size={14} />
                </button>

                {dropdownStates.vendor && !loadingVendors && (
                  <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-md mt-1 text-xs max-h-40 overflow-y-auto">
                    {vendors.map((vendor) => (
                      <button
                        key={vendor.id}
                        type="button"
                        onClick={() => selectOption('vendor', vendor.id.toString())}
                        className="w-full px-2 py-1.5 text-left hover:bg-gray-50"
                      >
                        {vendor.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.vendor && <p className="text-xs text-red-600 mt-1">{errors.vendor}</p>}
            </div>
          </div>

          {/* Vendor Website */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vendor Website</label>
            <input
              type="url"
              value={formData.vendorWebsite}
              onChange={(e) => handleInputChange('vendorWebsite', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              placeholder="https://example.com"
            />
          </div>

          {/* Category + Subscription Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('category')}
                  className={`w-full px-2 py-1.5 border ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  } rounded-md bg-white text-left text-sm flex items-center justify-between`}
                >
                  {formData.category || 'Select category'}
                  <ChevronDown size={14} />
                </button>

                {dropdownStates.category && (
                  <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-md mt-1 text-xs">
                    {categoryOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => selectOption('category', option)}
                        className="w-full px-2 py-1.5 text-left hover:bg-gray-50"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
            </div>

            {/* Subscription Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subscription Type</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('subscriptionType')}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md bg-white text-left text-sm flex items-center justify-between"
                >
                  {formData.subscriptionType || 'Select type'}
                  <ChevronDown size={14} />
                </button>

                {dropdownStates.subscriptionType && (
                  <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-md mt-1 text-xs">
                    {subscriptionTypeOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => selectOption('subscriptionType', option)}
                        type="button"
                        className="w-full px-2 py-1.5 text-left hover:bg-gray-50"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-2 py-1.5 border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } rounded-md text-sm`}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* Base Price / Currency / Profit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Base Price */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Base Price</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                className={`w-full px-2 py-1.5 border ${
                  errors.basePrice ? 'border-red-500' : 'border-gray-300'
                } rounded-md text-sm`}
              />
            </div>

            {/* Base Currency */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Base Currency</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('baseCurrency')}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md bg-white text-left text-sm flex items-center justify-between"
                >
                  {formData.baseCurrency}
                  <ChevronDown size={14} />
                </button>

                {dropdownStates.baseCurrency && (
                  <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-md mt-1 text-xs">
                    {currencyOptions.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => selectOption('baseCurrency', opt)}
                        className="w-full px-2 py-1.5 text-left hover:bg-gray-50"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profit Margin */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Profit Margin (%)</label>
              <input
                type="number"
                value={formData.profitMargin}
                onChange={(e) => handleInputChange('profitMargin', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* BDT Preview */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-xs font-medium text-gray-700 mb-1">
              BDT Price Preview (with {pricePreview.profitMargin}% profit)
            </h3>
            <div className="text-base font-semibold text-gray-900">৳{pricePreview.bdtPrice}</div>
            <div className="text-xs text-gray-600 mt-1">
              Base {pricePreview.basePrice} USD × Rate {pricePreview.exchangeRate}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('status')}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md bg-white text-left text-sm flex items-center justify-between"
              >
                {formData.status}
                <ChevronDown size={14} />
              </button>

              {dropdownStates.status && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-md mt-1 text-xs">
                  {statusOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => selectOption('status', opt)}
                      className="w-full px-2 py-1.5 text-left hover:bg-gray-50"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>

        </form>
      </div>
      </PopupAnimation>
    </div>,
    document.body
  );
};

export default EditProductPopup;