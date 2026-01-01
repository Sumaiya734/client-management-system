import React, { useEffect } from 'react';
import Notification from './Notification';

const NotificationProvider = ({ notifications, removeNotification }) => {
  useEffect(() => {
    const timers = [];

    // Set up auto-dismissal timers for each notification
    notifications.forEach(notification => {
      if (notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);

        timers.push(timer);
      }
    });

    // Cleanup timers when component unmounts or notifications change
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 w-full max-w-sm">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationProvider;