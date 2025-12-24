import React from 'react';

const GuestLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
};

export default GuestLayout;