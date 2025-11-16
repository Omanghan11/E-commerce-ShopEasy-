import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../pages/useAuth';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load read notifications from localStorage
  const getReadNotifications = () => {
    try {
      const read = localStorage.getItem('readNotifications');
      return read ? JSON.parse(read) : [];
    } catch (error) {
      console.error('Error loading read notifications:', error);
      return [];
    }
  };

  // Save read notifications to localStorage
  const saveReadNotifications = (readIds) => {
    try {
      localStorage.setItem('readNotifications', JSON.stringify(readIds));
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const readIds = getReadNotifications();

        // Mark notifications as read based on localStorage
        const notificationsWithReadStatus = data.map(notification => ({
          ...notification,
          read: readIds.includes(notification.id)
        }));

        setNotifications(notificationsWithReadStatus);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    const readIds = getReadNotifications();
    if (!readIds.includes(notificationId)) {
      const newReadIds = [...readIds, notificationId];
      saveReadNotifications(newReadIds);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Optionally call backend to mark as read
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/auth/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error marking notification as read on backend:', error);
      }
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    saveReadNotifications(allIds);
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter(n => !n.read && !n.resolved).length;
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  // Fetch notifications when authenticated
  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  // Refresh notifications more frequently for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(fetchNotifications, 2 * 60 * 1000); // 2 minutes for more real-time updates
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Also refresh when user performs actions (profile updates, etc.)
  const refreshNotifications = () => {
    fetchNotifications();
  };

  // Enhanced refresh for critical actions (immediate + delayed)
  const refreshNotificationsImmediate = () => {
    fetchNotifications(); // Immediate refresh
    setTimeout(fetchNotifications, 1000); // Follow-up refresh after 1 second
  };

  // Refresh notifications when user returns to the tab/window
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFocus = () => {
      fetchNotifications();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  const value = {
    notifications,
    loading,
    fetchNotifications,
    refreshNotifications,
    refreshNotificationsImmediate,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};