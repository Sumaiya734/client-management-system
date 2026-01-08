import React, { useState, useRef, useEffect } from 'react';

const DropdownMenu = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open || false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onOpenChange) onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const toggleOpen = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, (child) =>
        child.type.displayName === 'DropdownMenuTrigger'
          ? React.cloneElement(child, { onClick: toggleOpen, isOpen })
          : child.type.displayName === 'DropdownMenuContent'
          ? React.cloneElement(child, { isOpen })
          : child
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, onClick, isOpen }) => {
  return React.cloneElement(children, {
    onClick: (e) => {
      if (children.props.onClick) children.props.onClick(e);
      onClick && onClick();
    },
    'aria-expanded': isOpen,
    'aria-haspopup': 'true',
  });
};

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = ({ children, className = '', isOpen }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="options-menu"
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = ({ children, onClick, className = '' }) => {
  return (
    <button
      className={`block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${className}`}
      role="menuitem"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

DropdownMenuItem.displayName = 'DropdownMenuItem';

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger };