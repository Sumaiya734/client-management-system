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
  Menu,
  Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/Notifications';
import logo from '../assets/nanosoft logo.png';

export default function Sidebar() {
  const { showError } = useNotification();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
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

  const confirmLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      showError(error.message);
    } finally {
      setConfirmDialog(false);
    }
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-60'
      } bg-white border-r border-gray-200
      h-screen flex flex-col transition-all duration-300 overflow-hidden`}
    >
      {/* Logo + Toggle */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-center relative">
        {!isCollapsed && (
          <img
            src={logo}
            alt="Nanosoft Logo"
            className="h-8 max-w-32 object-contain"
          />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-3 p-1.5 rounded-md hover:bg-gray-100"
        >
          <Menu size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg group relative transition-all
                ${
                  isActive
                    ? 'bg-gray-800 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <item.icon
                size={18}
                className={isActive ? 'text-white' : 'text-gray-500'}
              />

              {!isCollapsed && <span>{item.name}</span>}

              {isCollapsed && (
                <span className="absolute left-16 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 🔻 Compact Logout Section */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={() => setConfirmDialog(true)}
          className="w-full flex items-center gap-3 px-3 py-1.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 group relative"
        >
          <LogOut size={14} className="text-red-500" />
          {!isCollapsed && <span>Logout</span>}

          {isCollapsed && (
            <span className="absolute left-16 ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100">
              Logout
            </span>
          )}
        </button>
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-lg font-semibold mb-3">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
