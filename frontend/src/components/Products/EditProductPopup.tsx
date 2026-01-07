import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Eye } from 'lucide-react';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';
import { vendorApi, currencyRatesApi } from '../../api.js';

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
  bdtPrice: string | number;
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
    vendorId: null as number | null,
    vendorWebsite: '',
    category: '',
    subscriptionType: '',
    description: '',
    basePrice: '',
    baseCurrency: 'USD',
    profitMargin: '',
    status: 'Active',
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    vendor: false,
    category: false,
    subscriptionType: false,
    baseCurrency: false,
    status: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  const categoryOptions = ['Communication', 'Productivity', 'Design', 'AI Tools', 'Media'];
  const subscriptionTypeOptions = ['Per User', 'Per License', 'Per Editor', 'Per Account'];
  const currencyOptions = ['BDT', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  const statusOptions = ['Active', 'Inactive'];

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const response = await vendorApi.getAll();
        setVendors(response.data || []);
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        vendor: product.vendor || '',
        vendorId: null,
        vendorWebsite: product.vendorWebsite || '',
        category: product.category || '',
        subscriptionType: product.type || '',
        description: product.description || '',
        basePrice: String(product.basePrice).replace(/ USD$/, ''),
        baseCurrency: product.baseCurrency || 'USD',
        profitMargin: String(product.profit).replace('%', ''),
        status: product.status || 'Active',
      });
    } else {
      setFormData({
        name: '',
        vendor: '',
        vendorId: null,
        vendorWebsite: '',
        category: '',
        subscriptionType: '',
        description: '',
        basePrice: '',
        baseCurrency: 'USD',
        profitMargin: '',
        status: 'Active',
      });
    }
  }, [product]);

  useEffect(() => {
    if (product && vendors.length > 0 && formData.vendor && !formData.vendorId) {
      const match = vendors.find((v) => v.name === product.vendor);
      if (match) {
        setFormData((prev) => ({ ...prev, vendorId: match.id, vendorWebsite: match.website || '' }));
      }
    }
  }, [vendors, product, formData.vendor, formData.vendorId]);

  const toggleDropdown = (key: keyof typeof dropdownOpen) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
      ...(key !== 'vendor' && { vendor: false }),
      ...(key !== 'category' && { category: false }),
      ...(key !== 'subscriptionType' && { subscriptionType: false }),
      ...(key !== 'baseCurrency' && { baseCurrency: false }),
      ...(key !== 'status' && { status: false }),
    }));
  };

  const selectOption = (field: string, value: string) => {
    if (field === 'vendor') {
      const selected = vendors.find((v) => v.id === Number(value));
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          vendor: selected.name,
          vendorId: selected.id,
          vendorWebsite: selected.website || '',
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setDropdownOpen((prev) => ({ ...prev, [field === 'vendor' ? 'vendor' : field]: false }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
  };

  const [bdtRate, setBdtRate] = useState(110.5); // Default rate

  useEffect(() => {
    // Fetch the current USD to BDT exchange rate
    const fetchExchangeRate = async () => {
      try {
        const response = await currencyRatesApi.getAll();
        const usdRateData = response.data.find(rate => rate.currency === 'USD');
        if (usdRateData && usdRateData.rate) {
          // In BDT-based system: if 1 BDT = x USD, we store x as the rate
          setBdtRate(parseFloat(usdRateData.rate));
        } else {
          setBdtRate(0.0089); // fallback to approximate rate (1/112.36)
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setBdtRate(110.5); // fallback to default
      }
    };

    fetchExchangeRate();
    
    // Listen for BDT rate update events
    const handleBdtRateUpdate = (e) => {
      if (e.detail && e.detail.rate !== undefined) {
        setBdtRate(parseFloat(e.detail.rate) || 110.5);
      }
    };
    
    window.addEventListener('bdtRateUpdated', handleBdtRateUpdate);
    
    return () => {
      window.removeEventListener('bdtRateUpdated', handleBdtRateUpdate);
    };
  }, []);

  const calculateBDTPrice = () => {
    const base = parseFloat(formData.basePrice) || 0;
    const profit = parseFloat(formData.profitMargin) || 0;
    const rate = bdtRate; // Use dynamic rate (BDT-based system)
    const finalUSD = base * (1 + profit / 100);
    // In BDT-based system: if 1 BDT = x USD, then to convert USD to BDT we divide by x
    const bdt = finalUSD / rate;
    return {
      bdt: Math.round(bdt),
      finalUSD: finalUSD.toFixed(2),
      profit,
    };
  };

  const pricePreview = calculateBDTPrice();

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = 'Product name is required';
    if (!formData.vendor) err.vendor = 'Please select a vendor';
    if (!formData.category) err.category = 'Category is required';
    if (!formData.description.trim()) err.description = 'Description is required';
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) err.basePrice = 'Valid base price required';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Fetch current exchange rate to calculate BDT price
    let currentBdtRate = 110.5; // default fallback
    try {
      const response = await currencyRatesApi.getAll();
      const bdtRateData = response.data.find(rate => rate.currency === 'BDT');
      if (bdtRateData && bdtRateData.rate) {
        currentBdtRate = parseFloat(bdtRateData.rate);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate, using default:', error);
    }

    // Calculate BDT price with current exchange rate (BDT-based system)
    const base = parseFloat(formData.basePrice) || 0;
    const profit = parseFloat(formData.profitMargin) || 0;
    const finalUSD = base * (1 + profit / 100);
    // In BDT-based system: if 1 BDT = x USD, then to convert USD to BDT we divide by x
    const calculatedBdtPrice = Math.round(finalUSD / currentBdtRate);

    const updatedProduct = {
      id: product?.id || null,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      vendor: formData.vendor,
      vendorWebsite: formData.vendorWebsite,
      type: formData.subscriptionType,
      basePrice: parseFloat(formData.basePrice),
      baseCurrency: formData.baseCurrency,
      profit: parseFloat(formData.profitMargin),
      bdtPrice: calculatedBdtPrice,
      bdtLabel: 'Final Price (BDT)',
      currencies: product?.currencies || [],
      status: formData.status,
    };

    onUpdate(updatedProduct as Product);
    onClose();
  };

  if (!isVisible) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div
          className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body - Compact */}
          <form onSubmit={handleSubmit} className="space-y-3 p-4">
            {/* Row 1: Name + Vendor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full rounded-md border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g. Adobe Photoshop"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('vendor')}
                    disabled={loadingVendors}
                    className={`w-full flex justify-between items-center rounded-md border ${
                      errors.vendor ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-1.5 text-sm bg-white`}
                  >
                    <span className={formData.vendor ? '' : 'text-gray-500'}>
                      {loadingVendors ? 'Loading...' : formData.vendor || 'Select vendor'}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  {dropdownOpen.vendor && !loadingVendors && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                      {vendors.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => selectOption('vendor', v.id.toString())}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.vendor && <p className="mt-1 text-xs text-red-600">{errors.vendor}</p>}
              </div>
            </div>

            {/* Vendor Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Website</label>
              <input
                type="url"
                value={formData.vendorWebsite}
                onChange={(e) => handleInputChange('vendorWebsite', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.example.com"
              />
            </div>

            {/* Row 2: Category + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('category')}
                    className="w-full flex justify-between items-center rounded-md border border-gray-inción-300 px-3 py-1.5 text-sm bg-white"
                  >
                    <span className={formData.category ? '' : 'text-gray-500'}>
                      {formData.category || 'Select category'}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  {dropdownOpen.category && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border">
                      {categoryOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => selectOption('category', opt)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Type</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('subscriptionType')}
                    className="w-full flex justify-between items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white"
                  >
                    <span className={formData.subscriptionType ? '' : 'text-gray-500'}>
                      {formData.subscriptionType || 'Select type'}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  {dropdownOpen.subscriptionType && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border">
                      {subscriptionTypeOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => selectOption('subscriptionType', opt)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full rounded-md border ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                } px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Short description..."
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            {/* Pricing Row */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', e.target.value)}
                  className={`w-full rounded-md border ${
                    errors.basePrice ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('baseCurrency')}
                    className="w-full flex justify-between items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white"
                  >
                    {formData.baseCurrency}
                    <ChevronDown size={16} />
                  </button>
                  {dropdownOpen.baseCurrency && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border">
                      {currencyOptions.map((cur) => (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => selectOption('baseCurrency', cur)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                        >
                          {cur}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profit (%)</label>
                <input
                  type="number"
                  value={formData.profitMargin}
                  onChange={(e) => handleInputChange('profitMargin', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20"
                />
              </div>
            </div>

            {/* BDT Preview - Compact */}
            {(formData.basePrice || formData.profitMargin) && (
              <div className="rounded-md bg-blue-50 p-3 border border-blue-200 text-sm">
                <div className="flex items-center gap-2 font-medium text-blue-800 mb-1">
                  <Eye size={14} />
                  Final Price (BDT)
                </div>
                <div className="text-xl font-bold text-blue-900">৳{pricePreview.bdt}</div>
                <p className="text-xs text-gray-600 mt-1">
                  ${pricePreview.finalUSD} × {bdtRate} (+{pricePreview.profit}%)
                </p>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('status')}
                  className="w-full flex justify-between items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white"
                >
                  <span className={formData.status === 'Active' ? 'text-green-600' : 'text-red-600'}>
                    {formData.status}
                  </span>
                  <ChevronDown size={16} />
                </button>
                {dropdownOpen.status && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => selectOption('status', opt)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {isEditMode ? 'Update' : 'Create'}
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