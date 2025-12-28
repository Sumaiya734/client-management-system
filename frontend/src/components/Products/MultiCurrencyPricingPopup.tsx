import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';

interface CurrencyPrices {
  USD: string;
  EUR: string;
  GBP: string;
  CAD: string;
  AUD: string;
}

interface Product {
  id: number;
  name: string;
  currencies: Array<{ code: string; price: string }>;
}

interface MultiCurrencyPricingPopupProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (productId: number, prices: CurrencyPrices) => void;
}

const MultiCurrencyPricingPopup: React.FC<MultiCurrencyPricingPopupProps> = ({
  product,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [prices, setPrices] = useState<CurrencyPrices>({
    USD: '',
    EUR: '',
    GBP: '',
    CAD: '',
    AUD: '',
  });

  // Update prices when product changes
  React.useEffect(() => {
    if (product) {
      const currencyMap: CurrencyPrices = {
        USD: '',
        EUR: '',
        GBP: '',
        CAD: '',
        AUD: '',
      };

      // Pre-fill with existing prices
      product.currencies.forEach((currency) => {
        if (currency.code in currencyMap) {
          currencyMap[currency.code as keyof CurrencyPrices] = currency.price;
        }
      });

      // Set default values for missing currencies
      if (!currencyMap.CAD) currencyMap.CAD = '0.00';
      if (!currencyMap.AUD) currencyMap.AUD = '0.00';

      setPrices(currencyMap);
    }
  }, [product]);

  const handlePriceChange = (currency: keyof CurrencyPrices, value: string) => {
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrices(prev => ({
        ...prev,
        [currency]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onUpdate(product.id, prices);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  if (!isVisible || !product) return null;

  return createPortal(
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Multi-Currency Pricing</h2>
            <p className="text-sm text-gray-600 mt-1">
              Set prices for {product.name} in different currencies
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* USD */}
            <div className="flex items-center justify-between">
              <label htmlFor="usd" className="text-sm font-medium text-gray-700 w-12">
                USD
              </label>
              <input
                type="text"
                id="usd"
                value={prices.USD}
                onChange={(e) => handlePriceChange('USD', e.target.value)}
                className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* EUR */}
            <div className="flex items-center justify-between">
              <label htmlFor="eur" className="text-sm font-medium text-gray-700 w-12">
                EUR
              </label>
              <input
                type="text"
                id="eur"
                value={prices.EUR}
                onChange={(e) => handlePriceChange('EUR', e.target.value)}
                className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* GBP */}
            <div className="flex items-center justify-between">
              <label htmlFor="gbp" className="text-sm font-medium text-gray-700 w-12">
                GBP
              </label>
              <input
                type="text"
                id="gbp"
                value={prices.GBP}
                onChange={(e) => handlePriceChange('GBP', e.target.value)}
                className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* CAD */}
            <div className="flex items-center justify-between">
              <label htmlFor="cad" className="text-sm font-medium text-gray-700 w-12">
                CAD
              </label>
              <input
                type="text"
                id="cad"
                value={prices.CAD}
                onChange={(e) => handlePriceChange('CAD', e.target.value)}
                className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* AUD */}
            <div className="flex items-center justify-between">
              <label htmlFor="aud" className="text-sm font-medium text-gray-700 w-12">
                AUD
              </label>
              <input
                type="text"
                id="aud"
                value={prices.AUD}
                onChange={(e) => handlePriceChange('AUD', e.target.value)}
                className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8">
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
              Update Prices
            </button>
          </div>
        </form>
      </div>
      </PopupAnimation>
    </div>,
    document.body
  );
};

export default MultiCurrencyPricingPopup;
