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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setConfirmDialog({ isOpen: true, item: null, action: 'logout' });
  };

  const confirmLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setConfirmDialog({ isOpen: false, item: null, action: null });
    } catch (error) {
      showError('Logout failed: ' + (error.response?.data?.message || error.message));
      setConfirmDialog({ isOpen: false, item: null, action: null });
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, item: null, action: null });
  };

  const displayName = user?.name || user?.email || 'User';
  const userRole = user?.role || 'User';

  return (
    <header className="bg-white/60 backdrop-blur-xl border-b border-white/40 px-5 py-2 h-[54px] shadow-sm">
      <div className="flex items-center justify-between h-full">

        <div />

        <div className="flex items-center space-x-3">
          <GlobalSearch placeholder="Search..." className="w-60" />

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-800 rounded-md hover:bg-white/40 backdrop-blur-md">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-500 hover:text-gray-800 rounded-md hover:bg-white/40 backdrop-blur-md">
            <Settings className="h-5 w-5" />
          </button>

          {/* User */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/40 backdrop-blur-md"
            >
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">{displayName}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                  userRole.toLowerCase() === 'admin'
                    ? 'bg-red-100 text-red-800'
                    : userRole.toLowerCase() === 'manager'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userRole}
                </div>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white/60 backdrop-blur-xl rounded-xl shadow-xl py-1 z-50 border border-white/40">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-white/40"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/40">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDialog}
                className="px-4 py-2 bg-white/60 rounded-md hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
