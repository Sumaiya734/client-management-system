import React from 'react';

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  active: 'bg-gray-900 text-white',
  inactive: 'bg-gray-200 text-gray-700',
};

export const Badge = ({ 
  children, 
  variant = 'default', 
  className = '',
  ...props 
}) => {
  const variantClasses = badgeVariants[variant] || badgeVariants.default;
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
  
  return (
    <span
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
