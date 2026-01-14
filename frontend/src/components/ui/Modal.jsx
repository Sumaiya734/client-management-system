import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className,
  ...props 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        
        {/* Glass Backdrop */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-purple-200/40 via-white/30 to-indigo-200/40 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={cn(
            `
            relative
            w-full
            ${sizeClasses[size]}
            bg-white/40
            backdrop-blur-2xl
            border border-white/30
            rounded-2xl
            shadow-[0_30px_80px_rgba(0,0,0,0.35)]
            transition-all duration-300
            animate-[fadeIn_0.3s_ease-out]
            `,
            className
          )}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/30 bg-white/30 backdrop-blur-md rounded-t-2xl">
            <h3 className="text-xl font-semibold text-gray-800">
              {title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 hover:bg-white/40"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 text-gray-800">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
