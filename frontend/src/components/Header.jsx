import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import { useNotification } from './Notifications';

export default function Header() {
  const { showError, showSuccess } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setConfirmDialog({
      isOpen: true,
      item: null,
      action: 'logout'
    });
  };

  // Confirm logout
  const confirmLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setConfirmDialog({ isOpen: false, item: null, action: null });
    } catch (error) {
      console.error('Logout failed:', error);
      showError('Logout failed: ' + (error.response?.data?.message || error.message));
      setConfirmDialog({ isOpen: false, item: null, action: null });
    }
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, item: null, action: null });
  };

  const displayName = user?.name || user?.email || 'User';
  const userRole = user?.role || 'User';

  return (
    <header className="bg-white border-b border-gray-200 px-5 py-2 h-[54px]">
      <div className="flex items-center justify-between h-full">
        
        {/* Left side – empty for now */}
        <div className="flex items-center space-x-3"></div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">

          {/* Global Search */}
          <GlobalSearch 
            placeholder="Search..." 
            className="w-60"
          />

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <Settings className="h-5 w-5" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
              title={`Logged in as ${displayName} (${userRole})`}
            >
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-700">
                  {displayName}
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${userRole.toLowerCase() === 'admin' ? 'bg-red-100 text-red-800' : userRole.toLowerCase() === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                  {userRole}
                </div>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
      
      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={closeConfirmDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
