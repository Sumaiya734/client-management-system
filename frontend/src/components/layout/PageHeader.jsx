import React from 'react';

export const PageHeader = ({ 
  title, 
  subtitle, 
  actions, 
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`} {...props}>
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-white mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
