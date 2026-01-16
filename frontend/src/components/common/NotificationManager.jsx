import React, { useState, useEffect } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationToast from './NotificationToast'

const NotificationManager = () => {
  // Add safety check for useNotifications
  let notifications = []
  let markAsRead = () => {}
  
  try {
    const notificationHook = useNotifications()
    notifications = notificationHook.notifications || []
    markAsRead = notificationHook.markAsRead || (() => {})
  } catch (error) {
    console.warn('NotificationManager: useNotifications hook not available:', error)
  }
  const [activeNotifications, setActiveNotifications] = useState([])

  useEffect(() => {
    // Get unread notifications and add them to active notifications
    const unreadNotifications = notifications.filter(n => !n.read)
    
    // Add new notifications to active list
    unreadNotifications.forEach(notification => {
      if (!activeNotifications.find(n => n.id === notification.id)) {
        setActiveNotifications(prev => [...prev, notification])
      }
    })
  }, [notifications, activeNotifications])

  const handleCloseNotification = (notificationId) => {
    // Mark notification as read when closed
    markAsRead(notificationId)
    
    setActiveNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    )
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {activeNotifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index
          }}
        >
          <NotificationToast
            notification={notification}
            onClose={handleCloseNotification}
            duration={5001}
          />
        </div>
      ))}
    </div>
  )
}

export default NotificationManager
