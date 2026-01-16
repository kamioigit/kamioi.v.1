// Simple Test Notifications Utility
import notificationService from '../services/simpleNotificationService'

// Test the notification system
export const testNotificationSystem = () => {
  console.log('🧪 Testing notification system...')
  
  // Create test notifications for different dashboards
  const dashboards = ['user', 'family', 'business', 'admin']
  const results = { userCount: 0, familyCount: 0, businessCount: 0, adminCount: 0 }
  
  dashboards.forEach(dashboard => {
    const testNotification = {
      title: `${dashboard.charAt(0).toUpperCase() + dashboard.slice(1)} Test Notification`,
      message: `This is a test notification for the ${dashboard} dashboard.`,
      type: 'info',
      icon: '🧪',
      priority: 'normal',
      dashboardType: dashboard
    }
    
    notificationService.addNotification(testNotification)
    results[`${dashboard}Count`] = 1
  })
  
  console.log('✅ Test notifications created for all dashboards')
  return results
}

// Test auto-cleanup (simulate 7-day cleanup)
export const testAutoCleanup = () => {
  console.log('🧹 Testing auto-cleanup...')
  
  // Create some old notifications
  const oldNotification = {
    title: 'Old Test Notification',
    message: 'This notification is older than 7 days and should be cleaned up.',
    type: 'info',
    icon: '🗑️',
    priority: 'normal',
    dashboardType: 'user',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
  }
  
  notificationService.addNotification(oldNotification)
  
  // Run cleanup
  notificationService.clearOld()
  
  console.log('✅ Auto-cleanup test completed')
  return { cleaned: 1, remaining: notificationService.getNotifications().length }
}

// Clear all test notifications
export const clearTestNotifications = () => {
  console.log('🗑️ Clearing all test notifications...')
  notificationService.clearAll()
  console.log('✅ All notifications cleared')
  return { cleared: true }
}

export default {
  testNotificationSystem,
  testAutoCleanup,
  clearTestNotifications
}
