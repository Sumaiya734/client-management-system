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
    // Initialize with default values to prevent undefined values
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

  // Update form data when vendor prop changes
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Map frontend field names to backend field names
      const backendData = {
        id: formData.id,
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        contact_person: formData.contact_person,
        status: formData.status,
      };
      
      onUpdate(backendData);
    }
  };

  const handleCancel = () => {
    // Reset form data with proper mapping
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
    setErrors({}); // Clear errors
    onClose();
  };

  const statusOptions = ['Active', 'Inactive'];

  if (!isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {isEditMode ? 'Edit Vendor' : 'Add Vendor'}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {isEditMode ? 'Update vendor information' : 'Create a new vendor'}
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
        <form onSubmit={handleSubmit} className="p-4 text-sm space-y-4">
          {/* Name and Company Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-2 py-1.5 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
                required
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="company" className="block text-xs font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Contact Person and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact_person" className="block text-xs font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-2 py-1.5 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
                required
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Phone and Website Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-xs font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md bg-white text-left text-sm flex items-center justify-between"
              >
                <span>{formData.status}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-md mt-1 text-xs z-10">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        handleInputChange('status', status);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="w-full px-2 py-1.5 text-left hover:bg-gray-50"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditMode ? 'Update Vendor' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditVendorPopup;