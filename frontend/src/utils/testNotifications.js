/**
 * Test utility for the notification system
 * This file can be used to test notifications across all dashboards
 */

import notificationService from '../services/notificationService'

export const testNotificationSystem = () => {
  console.log('🧪 Testing Notification System...')
  
  // Test 1: Create notifications for different dashboards
  console.log('📝 Creating test notifications...')
  
  // User notifications
  notificationService.addNotification({
    title: 'Investment Complete',
    message: 'Your round-up investment of $15.75 has been processed successfully.',
    type: 'success',
    icon: '💰',
    priority: 'normal',
    dashboardType: 'user'
  })
  
  notificationService.addNotification({
    title: 'Portfolio Milestone!',
    message: 'Congratulations! Your portfolio has reached $1,000.',
    type: 'success',
    icon: '🎉',
    priority: 'high',
    dashboardType: 'user'
  })
  
  // Family notifications
  notificationService.addNotification({
    title: 'Family Member Added',
    message: 'Sarah Johnson has joined your family investment plan.',
    type: 'info',
    icon: '👨‍👩‍👧‍👦',
    priority: 'normal',
    dashboardType: 'family'
  })
  
  notificationService.addNotification({
    title: 'Family Goal Achieved',
    message: 'Your family has reached the $5,000 vacation savings goal!',
    type: 'success',
    icon: '🏖️',
    priority: 'high',
    dashboardType: 'family'
  })
  
  // Business notifications
  notificationService.addNotification({
    title: 'Employee Enrollment',
    message: '15 new employees have enrolled in the company investment program.',
    type: 'info',
    icon: '🏢',
    priority: 'normal',
    dashboardType: 'business'
  })
  
  // Admin notifications
  notificationService.addNotification({
    title: 'System Alert',
    message: 'High transaction volume detected. System performance is optimal.',
    type: 'warning',
    icon: '⚠️',
    priority: 'high',
    dashboardType: 'admin'
  })
  
  // Global notifications (appear on all dashboards)
  notificationService.addNotification({
    title: 'Platform Update',
    message: 'New AI features are now available across all dashboards.',
    type: 'info',
    icon: '🚀',
    priority: 'normal'
    // No dashboardType = global notification
  })
  
  console.log('✅ Test notifications created successfully!')
  
  // Test 2: Check notification counts
  console.log('📊 Checking notification counts...')
  const userCount = notificationService.getUnreadCount('user')
  const familyCount = notificationService.getUnreadCount('family')
  const businessCount = notificationService.getUnreadCount('business')
  const adminCount = notificationService.getUnreadCount('admin')
  
  console.log(`User Dashboard: ${userCount} unread notifications`)
  console.log(`Family Dashboard: ${familyCount} unread notifications`)
  console.log(`Business Dashboard: ${businessCount} unread notifications`)
  console.log(`Admin Dashboard: ${adminCount} unread notifications`)
  
  // Test 3: Get statistics
  const stats = notificationService.getStats()
  console.log('📈 Notification Statistics:', stats)
  
  return {
    userCount,
    familyCount,
    businessCount,
    adminCount,
    stats
  }
}

export const testAutoCleanup = () => {
  console.log('🧹 Testing auto-cleanup functionality...')
  
  // Create an expired notification (simulate old notification)
  const expiredNotification = {
    title: 'Old Notification',
    message: 'This notification should be auto-deleted.',
    type: 'info',
    icon: '🗑️',
    priority: 'normal',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // Expired 1 day ago
  }
  
  // Manually add expired notification to localStorage
  const notifications = notificationService.getAllNotifications()
  notifications.push({
    id: 'test-expired-' + Date.now(),
    read: false,
    ...expiredNotification
  })
  localStorage.setItem('kamioi_notifications', JSON.stringify(notifications))
  
  console.log('📝 Added expired notification for testing')
  
  // Trigger cleanup
  notificationService.cleanupExpiredNotifications()
  
  console.log('✅ Auto-cleanup test completed')
}

export const clearTestNotifications = () => {
  console.log('🧹 Clearing all test notifications...')
  notificationService.clearAll()
  console.log('✅ All notifications cleared')
}

// Auto-run tests when this file is imported (for development)
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below to auto-run tests
  // setTimeout(() => testNotificationSystem(), 1000)
}

