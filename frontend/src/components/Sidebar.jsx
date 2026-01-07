import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Package,
  FileText,
  Calendar,
  CreditCard,
  Wallet,
  DollarSign,
  BarChart3,
  UserCog,
  Bell,
  LogOut,
  Search,
  Menu,
  Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/Notifications';
import logo from '../assets/nanosoft logo.png';

export default function Sidebar() {
  const { showError, showSuccess } = useNotification();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    action: null
  });
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    // { name: 'Global Search', href: '/search', icon: Search },
    { name: 'Client Management', href: '/clients', icon: Users },
    { name: 'Vendor Management', href: '/vendors', icon: Store },
    { name: 'Products & Pricing', href: '/products', icon: Package },
    { name: 'Purchase Orders', href: '/orders', icon: FileText },
    { name: 'Subscriptions', href: '/subscriptions', icon: Calendar },
    { name: 'Billing Management', href: '/billing', icon: CreditCard },
    { name: 'Payment Management', href: '/payments', icon: Wallet },
    { name: 'Currency & Rates', href: '/currency', icon: DollarSign },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { name: 'User Management', href: '/users', icon: UserCog },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

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

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-60'} bg-white shadow-sm border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300`}>
      {/* Top Section - Logo and Toggle */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <img
            src={logo}
            alt="Nanosoft Logo"
            className="w-40 h-10 object-contain"
          />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-3xl transition-colors ${isActive
                ? 'bg-gray-900 text-white font-semibold shadow-xl'
                : 'text-gray-700 hover:bg-gray-400 hover:text-gray-900 hover:shadow-2xl'
                }`}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2 truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section - Logout */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-3xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </button>
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-3xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={closeConfirmDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-3xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
