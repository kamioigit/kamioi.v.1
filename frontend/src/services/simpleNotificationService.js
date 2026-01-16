// Simple Notification Service for Testing
class SimpleNotificationService {
  constructor() {
    this.notifications = []
    this.listeners = []
    this.loadFromStorage()
  }

  // Load notifications from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('kamioi_notifications')
      if (stored) {
        this.notifications = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error)
      this.notifications = []
    }
  }

  // Save notifications to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('kamioi_notifications', JSON.stringify(this.notifications))
    } catch (error) {
      console.error('Failed to save notifications to storage:', error)
    }
  }

  // Add a notification
  addNotification(notification) {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }
    
    this.notifications.unshift(newNotification)
    this.saveToStorage()
    this.notifyListeners()
    
    console.log('✅ Notification added:', newNotification.title)
    return newNotification
  }

  // Get all notifications
  getNotifications() {
    return this.notifications
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read)
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
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    this.saveToStorage()
    this.notifyListeners()
  }

  // Get stats
  getStats() {
    const total = this.notifications.length
    const unread = this.notifications.filter(n => !n.read).length
    
    return {
      total,
      unread,
      read: total - unread
    }
  }

  // Delete a specific notification
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    this.saveToStorage()
    this.notifyListeners()
  }

  // Clear all notifications
  clearAll() {
    this.notifications = []
    this.saveToStorage()
    this.notifyListeners()
  }

  // Clear old notifications (older than 7 days)
  clearOld() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    this.notifications = this.notifications.filter(n => 
      new Date(n.timestamp) > sevenDaysAgo
    )
    this.saveToStorage()
    this.notifyListeners()
  }

  // Add listener for changes
  addListener(callback) {
    this.listeners.push(callback)
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback)
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications))
  }

  // Get notifications by dashboard type
  getNotificationsByDashboard(dashboardType) {
    return this.notifications.filter(n => n.dashboardType === dashboardType)
  }

  // Get notifications by type
  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type)
  }
}

// Create singleton instance
const notificationService = new SimpleNotificationService()

export default notificationService
