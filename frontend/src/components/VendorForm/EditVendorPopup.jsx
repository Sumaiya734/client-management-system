import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';

const EditVendorPopup = ({ 
  vendor, 
  isOpen, 
  onClose, 
  onUpdate, 
  isEditMode = true,
}) => {
  const [formData, setFormData] = useState(() => {
    return {
      id: vendor.id || null,
      name: vendor.name || '',
      company: vendor.company || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      website: vendor.website || '',
      contact_person: vendor.contact_person || '',
      status: vendor.status || 'Active',
    };
  });
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      id: vendor.id || null,
      name: vendor.name || '',
      company: vendor.company || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      website: vendor.website || '',
      contact_person: vendor.contact_person || '',
      status: vendor.status || 'Active',
    });
  }, [vendor]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.email.trim()) {
      newErrors.email = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onUpdate({ ...formData });
    }
  };

  const handleCancel = () => {
    setFormData({
      id: vendor.id || null,
      name: vendor.name || '',
      company: vendor.company || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      website: vendor.website || '',
      contact_person: vendor.contact_person || '',
      status: vendor.status || 'Active',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">
              {isEditMode ? 'Edit Vendor' : 'Add Vendor'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-2 py-1 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded text-xs outline-none focus:border-blue-500`}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Contact Person</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-2 py-1 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded text-xs outline-none focus:border-blue-500`}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Status</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-left text-xs flex items-center justify-between"
                >
                  {formData.status}
                  <ChevronDown size={12} className={isStatusDropdownOpen ? 'rotate-180' : ''} />
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute w-full bg-white border border-gray-200 rounded shadow-md mt-1 z-50 overflow-hidden">
                    {['Active', 'Inactive'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { handleInputChange('status', s); setIsStatusDropdownOpen(false); }}
                        className="w-full px-2 py-1 text-left text-xs hover:bg-gray-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
            >
              {isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditVendorPopup;