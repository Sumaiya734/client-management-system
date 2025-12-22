import React from 'react';

const buttonVariants = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400',
  secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400',
  outline: 'border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
  ghost: 'text-gray-600 hover:bg-gray-100 disabled:text-gray-400',
};

const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
};

export const Button = React.forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  children, 
  disabled, 
  loading, 
  icon, 
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = buttonVariants[variant] || buttonVariants.primary;
  const sizeClasses = buttonSizes[size] || buttonSizes.md;
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
