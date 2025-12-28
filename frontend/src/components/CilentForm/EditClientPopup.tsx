import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';
import './EditClientPopup.css'; // Ensure this is imported
import { PopupAnimation, useAnimationState } from '../../utils/AnimationUtils';

interface Client {
  id: string | number | null;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

interface EditClientPopupProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (client: Client) => void;
  isEditMode?: boolean;
}

const EditClientPopup: React.FC<EditClientPopupProps> = ({ 
  client, 
  isOpen, 
  onClose, 
  onUpdate, 
  isEditMode = true,
}) => {
  const [formData, setFormData] = useState<Client>(() => {
    // Initialize with default values to prevent undefined values
    return {
      id: client.id || null,
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      status: client.status || 'Active',
    };
  });
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when client prop changes
  useEffect(() => {
    setFormData({
      id: client.id || null,
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      status: client.status || 'Active',
    });
  }, [client]);

  const handleInputChange = (field: keyof Client, value: string) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onUpdate(formData);
    }
  };

  const handleCancel = () => {
    setFormData(client); // Reset form data
    setErrors({}); // Clear errors
    onClose();
  };

  const statusOptions = ['Active', 'Inactive'] as const;

  const { isVisible, isAnimating } = useAnimationState(isOpen);

  if (!isVisible) return null;

  return createPortal(
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      <PopupAnimation animationType="zoomIn" duration="0.3s">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {isEditMode ? 'Edit Client' : 'Add Client'}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {isEditMode ? 'Update client information' : 'Create a new client'}
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
                Name
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
                className={`w-full px-2 py-1.5 border ${errors.company ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
                required
              />
              {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
            </div>
          </div>

          {/* Email and Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email
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
                required
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
              required
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
                <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-md mt-1 text-xs">
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
              {isEditMode ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
      </PopupAnimation>
    </div>,
    document.body
  );
};

export default EditClientPopup;
