import React from 'react';
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
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    // { name: 'Global Search', href: '/search', icon: Search },
    { name: 'Client Management', href: '/clients', icon: Users },
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
  
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  return (
    <div className="w-60 bg-white shadow-sm border-r border-gray-200 min-h-screen flex flex-col">
      {/* Top Section */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Business Manager</h1>
        <div className="text-sm">
          <p className="text-blue-600 font-medium">John Admin</p>
          <p className="text-gray-500">Administrator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section - Logout */}
      <div className="p-3 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
