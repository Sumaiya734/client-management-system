import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { userManagementApi } from '../../api';

const ManagePermissionsModal = ({ isOpen, onRequestClose, user, onUpdate }) => {
  const [isAdministrator, setIsAdministrator] = useState(false);
  const [permissions, setPermissions] = useState({
    clientManagement: false,
    productManagement: false,
    purchaseOrders: false,
    paymentManagement: false,
    currencyManagement: false,
    reportsAnalytics: false,
    userManagement: false,
    notifications: false,
  });
  const [loading, setLoading] = useState(false);

  // Initialize permissions when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      loadUserPermissions();
    }
  }, [user, isOpen]);

  const loadUserPermissions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await userManagementApi.getPermissions(user.id);
      const { isAdministrator: admin, permissions: userPermissions } = response.data;
      
      setIsAdministrator(admin);
      if (userPermissions) {
        setPermissions(userPermissions);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      // Default to current role if API fails
      const isAdmin = user.role.toLowerCase() === 'admin';
      setIsAdministrator(isAdmin);
    } finally {
      setLoading(false);
    }
  };

  const handleAdministratorChange = (checked) => {
    setIsAdministrator(checked);
    if (checked) {
      // If administrator is checked, uncheck all specific permissions
      setPermissions({
        clientManagement: false,
        productManagement: false,
        purchaseOrders: false,
        paymentManagement: false,
        currencyManagement: false,
        reportsAnalytics: false,
        userManagement: false,
        notifications: false,
      });
    }
  };

  const handlePermissionChange = (permissionKey, checked) => {
    setPermissions({ ...permissions, [permissionKey]: checked });
    if (checked) setIsAdministrator(false);
  };

  const handleUpdate = async () => {
    if (!user || !onUpdate) return;
    
    setLoading(true);
    try {
      const updateData = {
        isAdministrator,
        permissions,
        role: isAdministrator ? 'admin' : user.role.toLowerCase(),
      };
      
      await userManagementApi.updatePermissions(user.id, updateData);
      onUpdate(updateData);
      onRequestClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions. Please try again.');
    } finally {
      setLoading(false);
    }
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
      maxWidth: '390px',
      width: '40%',
      maxHeight: '80vh',
      border: 'none',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      overflow: 'auto',
    },
  };

  const permissionList = [
    { key: 'clientManagement', label: 'Client Management', description: 'Manage client database' },
    { key: 'productManagement', label: 'Product Management', description: 'Manage products and pricing' },
    { key: 'purchaseOrders', label: 'Purchase Orders', description: 'Create and manage POs' },
    { key: 'paymentManagement', label: 'Payment Management', description: 'Record and track payments' },
    { key: 'currencyManagement', label: 'Currency Management', description: 'Manage exchange rates' },
    { key: 'reportsAnalytics', label: 'Reports & Analytics', description: 'View reports and analytics' },
    { key: 'userManagement', label: 'User Management', description: 'Manage users and permissions' },
    { key: 'notifications', label: 'Notifications', description: 'Send notifications and alerts' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Manage Permissions"
      ariaHideApp={false}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Manage Permissions</h2>
            <p className="text-sm text-gray-600">Set specific permissions for {user?.name || 'User'}</p>
          </div>
          <button
            onClick={onRequestClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Administrator Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAdministrator}
              onChange={(e) => handleAdministratorChange(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <span className="text-sm font-medium text-gray-900">Administrator (All Permissions)</span>
          </label>

          {/* Separator */}
          <div className="border-t border-gray-200 my-3"></div>

          {/* Specific Permissions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Or select specific permissions:</h3>
            
            <div className="space-y-2">
              {permissionList.map((permission) => (
                <label key={permission.key} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions[permission.key]}
                    onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                    disabled={isAdministrator || loading}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{permission.label}</span>
                    <p className="text-xs text-gray-500">{permission.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onRequestClose}
            disabled={loading}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={loading}
            size="sm"
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManagePermissionsModal;