import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Notification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Icon mapping based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Background and border colors based on notification type
  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
  }, []);

  const handleMouseEnter = () => {
    setIsVisible(false); // Pause the auto-dismissal
  };

  const handleMouseLeave = () => {
    setIsVisible(true); // Resume the auto-dismissal
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getColors(notification.type)}
        border rounded-lg shadow-lg p-4
        flex items-start justify-between
        max-w-xs w-full
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0">
          {getIcon(notification.type)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Notification;