import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by checking for auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you would validate the token by making an API call
      // For now, we'll just assume the user is valid if they have a token
      // Set a basic user object if token exists
      setUser({ id: 'temp', name: 'Loading...', email: 'loading...' }); // Placeholder user object
    }
    setLoading(false);
    
    // Listen for auth-expired event
    const handleAuthExpired = () => {
      setUser(null);
    };
    
    window.addEventListener('auth-expired', handleAuthExpired);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      if (response.data.success && response.data.token) {
        // Set user info after successful login
        const user = response.data.user;
        setUser(user);
        return { success: true, user };
      } else {
        return { success: false, message: 'Invalid login response' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // In a real application, you would make an API call to validate the token
        // and get user details, for now we'll just return true if token exists
        return true;
      } catch (error) {
        console.error('Error checking auth status:', error);
        logout();
        return false;
      }
    }
    return false;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Dispatch auth-expired event to ensure all listeners are notified
      window.dispatchEvent(new Event('auth-expired'));
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};