import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

const EditUserModal = ({ isOpen, onRequestClose, user, onSave, isAddMode = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    status: 'Active',
    password: '',
  });

  // Initialize form data when user changes or modal opens
  useEffect(() => {
    if (isAddMode) {
      // Reset form for add mode
      setFormData({
        name: '',
        email: '',
        role: 'admin',
        status: 'Active',
        password: '',
      });
    } else if (user) {
      // Populate form for edit mode
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role.toLowerCase() || 'admin',
        status: user.status || 'Active',
        password: '',
      });
    }
  }, [user, isAddMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    // Prepare the data for submission
    const submitData = { ...formData };
    
    // If password is empty in edit mode, don't send it
    if (!isAddMode && !submitData.password) {
      delete submitData.password;
    }
    
    if (onSave) {
      onSave(submitData);
    }
    onRequestClose();
  };

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 50,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '0',
      maxWidth: '420px',
      width: '90%',
      border: 'none',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'User' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Support' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel={isAddMode ? 'Add User' : 'Edit User'}
      ariaHideApp={false}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {isAddMode ? 'Add User' : 'Edit User'}
            </h2>
            <p className="text-sm text-gray-600">
              {isAddMode ? 'Create a new user account' : 'Update user information'}
            </p>
          </div>
          <button
            onClick={onRequestClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              placeholder="Enter email address"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm bg-white"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              placeholder="Enter password"
            />
            {!isAddMode && (
              <p className="text-xs text-gray-500 mt-1">(leave blank to keep current)</p>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestClose}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            className="px-4"
          >
            {isAddMode ? 'Add User' : 'Update User'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditUserModal;

