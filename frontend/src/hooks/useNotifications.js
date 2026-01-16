import { useState, useEffect, useCallback } from 'react'
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Determine dashboard type based on current URL or user role
  const getDashboardType = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin/')) {
      return 'admin';
    } else if (currentPath.includes('/family/')) {
      return 'family';
    } else if (currentPath.includes('/business/')) {
      return 'business';
    }
    return 'user';
  };
  
  const userDashboardType = getDashboardType();

  const getFilteredNotifications = useCallback(() => {
    return notificationService.getNotifications(userDashboardType);
  }, [userDashboardType]);

  const getUnreadCount = useCallback(() => {
    return notificationService.getUnreadCount(userDashboardType);
  }, [userDashboardType]);

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(getFilteredNotifications());
    };

    updateNotifications(); // Load initial notifications
    const unsubscribe = notificationService.subscribe(updateNotifications);

    return () => unsubscribe();
  }, [getFilteredNotifications]);

  const addNotification = useCallback((notification) => {
    notificationService.addNotification({ 
      ...notification, 
      dashboardType: userDashboardType,
      read: false // Ensure notifications start as unread
    });
  }, [userDashboardType]);

  const markAsRead = useCallback((id) => {
    notificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead(userDashboardType);
  }, [userDashboardType]);

  const clearNotification = useCallback((id) => {
    notificationService.clearNotification(id);
  }, []);

  const clearAllNotifications = useCallback(() => {
    notificationService.clearAllNotifications(userDashboardType);
  }, [userDashboardType]);

  return {
    notifications,
    unreadCount: getUnreadCount(),
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };
};
