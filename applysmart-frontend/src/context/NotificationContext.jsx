import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToNotifications,
  unsubscribeNotifications,
  disconnectSocket,
} from '../services/socketService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  // Track timeout IDs so we can clear them on unmount
  const timeoutsRef = useRef([]);

  useEffect(() => {
    if (!user?.userId) return;

    const userId = user.userId;

    const handleNotification = (notification) => {
      const id = Date.now();

      setNotifications((prev) => [
        { ...notification, id, timestamp: new Date() },
        ...prev,
      ]);

      // Auto-remove after 5 seconds
      const tid = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);

      timeoutsRef.current.push(tid);
    };

    subscribeToNotifications(userId, handleNotification);

    return () => {
      unsubscribeNotifications(userId);
      // Clear all pending auto-remove timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [user?.userId]); // depend only on userId, not the whole user object

  // Full disconnect when the provider itself unmounts (app teardown)
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{ notifications, clearNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};