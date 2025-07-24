import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications, clearAllNotifications as clearAllNotificationsApi } from '../services/notification';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await getNotifications(token);
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const clearAllNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await clearAllNotificationsApi(token);
      setNotifications([]);
    } catch (err) {
      setError(err.message || 'Failed to clear notifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, loading, error, fetchNotifications, clearAllNotifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext); 