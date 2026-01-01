import React, { createContext, useContext, useReducer } from 'react';
import NotificationProvider from './NotificationProvider';

// Create the context
const NotificationContext = createContext();

// Action types
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS';

// Reducer function to manage notification state
const notificationReducer = (state, action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { id: Date.now(), ...action.payload }]
      };
    case REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload.id)
      };
    case CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  notifications: []
};

// Provider component
export const NotificationProviderWrapper = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Function to add a notification
  const addNotification = (message, type = 'info', duration = 5000) => {
    const notification = {
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    };
    dispatch({ type: ADD_NOTIFICATION, payload: notification });
  };

  // Function to remove a notification
  const removeNotification = (id) => {
    dispatch({ type: REMOVE_NOTIFICATION, payload: { id } });
  };

  // Function to clear all notifications
  const clearNotifications = () => {
    dispatch({ type: CLEAR_NOTIFICATIONS });
  };

  // Function to show success notification
  const showSuccess = (message, duration = 5000) => {
    addNotification(message, 'success', duration);
  };

  // Function to show error notification
  const showError = (message, duration = 7000) => {
    addNotification(message, 'error', duration);
  };

  // Function to show warning notification
  const showWarning = (message, duration = 5000) => {
    addNotification(message, 'warning', duration);
  };

  // Function to show info notification
  const showInfo = (message, duration = 5000) => {
    addNotification(message, 'info', duration);
  };

  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationProvider notifications={state.notifications} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;