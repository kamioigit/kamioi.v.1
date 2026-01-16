// Notification Service for managing system-wide notifications
class NotificationService {
  constructor() {
    this.notifications = []
    this.listeners = []
  }

  // Add a new notification
  addNotification(notification) {
    // Ensure message and title are strings, not objects
    const message = typeof notification.message === 'string' 
      ? notification.message 
      : (notification.message?.toString() || '')
    const title = typeof notification.title === 'string'
      ? notification.title
      : (notification.title?.toString() || '')
    
    const newNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: notification.type || 'info',
      read: false,
      action: notification.action || null,
      dashboardType: notification.dashboardType || null,
      ...notification,
      // Override with cleaned values
      title: title,
      message: message
    }

    console.log('🔔 NotificationService - Adding notification:', newNotification)
    this.notifications.unshift(newNotification)
    this.notifyListeners()
    
    // Store in localStorage for persistence
    this.saveToStorage()
    
    return newNotification
  }

  // Get all notifications
  getNotifications(dashboardType = null) {
    if (dashboardType) {
      return this.notifications.filter(n => n.dashboardType === dashboardType)
    }
    return this.notifications
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read)
  }

  // Get unread count
  getUnreadCount(dashboardType = null) {
    if (dashboardType) {
      return this.notifications.filter(n => !n.read && n.dashboardType === dashboardType).length
    }
    return this.notifications.filter(n => !n.read).length
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveToStorage()
      this.notifyListeners()
    }
  }

  // Mark all as read
  markAllAsRead(dashboardType = null) {
    this.notifications.forEach(n => {
      if (!dashboardType || n.dashboardType === dashboardType) {
        n.read = true
      }
    })
    this.saveToStorage()
    this.notifyListeners()
  }

  // Clear notification
  clearNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    this.saveToStorage()
    this.notifyListeners()
  }

  // Clear all notifications
  clearAllNotifications(dashboardType = null) {
    if (dashboardType) {
      this.notifications = this.notifications.filter(n => n.dashboardType !== dashboardType)
    } else {
      this.notifications = []
    }
    this.saveToStorage()
    this.notifyListeners()
  }

  // Add listener for notifications updates
  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  // Subscribe method (alias for addListener)
  subscribe(callback) {
    return this.addListener(callback)
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications))
  }

  // Save to localStorage
  saveToStorage() {
    try {
      // Ensure all notifications have string messages/titles before saving
      const cleanedNotifications = this.notifications.map(n => ({
        ...n,
        message: typeof n.message === 'string' ? n.message : String(n.message || ''),
        title: typeof n.title === 'string' ? n.title : String(n.title || ''),
        timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp
      }))
      localStorage.setItem('kamioi_notifications', JSON.stringify(cleanedNotifications))
    } catch (error) {
      console.error('Failed to save notifications to localStorage:', error)
    }
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('kamioi_notifications')
      console.log('🔔 NotificationService - Loading from localStorage:', stored)
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('🔔 NotificationService - Parsed data:', parsed)
        
        // Handle both array and object formats
        let notificationsArray = []
        if (Array.isArray(parsed)) {
          notificationsArray = parsed
        } else if (parsed && typeof parsed === 'object') {
          // If it's an object, try to extract an array from it
          notificationsArray = parsed.notifications || parsed.data || []
        }
        
        // Fix corrupted message format (character arrays)
        this.notifications = notificationsArray.map(n => {
          const fixedNotification = {
            ...n,
            timestamp: new Date(n.timestamp)
          }
          
          // Fix message if it's stored as character array
          if (n.message && typeof n.message === 'object' && !Array.isArray(n.message)) {
            // Check if it's a character array format
            const keys = Object.keys(n.message).filter(key => !isNaN(key))
            if (keys.length > 0) {
              // Reconstruct string from character array
              const messageArray = keys.map(key => n.message[key])
              fixedNotification.message = messageArray.join('')
            }
          }
          
          // Fix title if it's stored as character array
          if (n.title && typeof n.title === 'object' && !Array.isArray(n.title)) {
            const keys = Object.keys(n.title).filter(key => !isNaN(key))
            if (keys.length > 0) {
              const titleArray = keys.map(key => n.title[key])
              fixedNotification.title = titleArray.join('')
            }
          }
          
          return fixedNotification
        })
        
        console.log('🔔 NotificationService - Loaded notifications:', this.notifications)
      }
    } catch (error) {
      console.error('Failed to load notifications from localStorage:', error)
      this.notifications = []
    }
  }

  // Clear corrupted notifications and start fresh
  clearCorruptedNotifications() {
    try {
      localStorage.removeItem('kamioi_notifications')
      this.notifications = []
      console.log('🔔 NotificationService - Cleared corrupted notifications')
    } catch (error) {
      console.error('Failed to clear corrupted notifications:', error)
    }
  }

  // Initialize service
  init() {
    this.loadFromStorage()
  }

  // Helper methods for common notification types
  showSuccess(title, message, action = null) {
    return this.addNotification({
      type: 'success',
      title,
      message,
      action
    })
  }

  showWarning(title, message, action = null) {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      action
    })
  }

  showError(title, message, action = null) {
    return this.addNotification({
      type: 'error',
      title,
      message,
      action
    })
  }

  showInfo(title, message, action = null) {
    return this.addNotification({
      type: 'info',
      title,
      message,
      action
    })
  }

  // Export/Download notifications
  showExportNotification(title, message, onConfirm) {
    return this.addNotification({
      type: 'info',
      title,
      message,
      action: {
        type: 'export',
        onConfirm
      }
    })
  }
}

// Create singleton instance
const notificationService = new NotificationService()
notificationService.init()

export default notificationService
