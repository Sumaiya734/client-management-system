import React from 'react';

// Simple Select implementation using native HTML select with Tailwind styling
const Select = ({ children, value, onValueChange, defaultValue }) => {
  const handleChange = (e) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };

  return (
    <select
      value={value || defaultValue || ''}
      onChange={handleChange}
      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
    >
      {children}
    </select>
  );
};

const SelectTrigger = ({ children, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder }) => {
  // This is just a placeholder for compatibility with the component structure
  return null;
};

const SelectContent = ({ children, className = '' }) => {
  // Since we're using native select, this is just a wrapper for compatibility
  return <>{children}</>;
};

const SelectItem = ({ children, value }) => {
  return <option value={value}>{children}</option>;
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };