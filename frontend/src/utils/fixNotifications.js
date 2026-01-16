// Fix corrupted notifications in localStorage
export const fixNotifications = () => {
  try {
    // Clear corrupted notifications
    localStorage.removeItem('kamioi_notifications')
    
    // Create some proper test notifications
    const testNotifications = [
      {
        id: 'welcome-1',
        title: 'Welcome to Kamioi!',
        message: 'Your account has been successfully created. Start by setting up your investment goals.',
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        dashboardType: 'user'
      },
      {
        id: 'investment-1',
        title: 'Investment Opportunity',
        message: 'New investment opportunities are available based on your risk profile.',
        type: 'info',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: false,
        dashboardType: 'user'
      },
      {
        id: 'goal-1',
        title: 'Goal Progress Update',
        message: 'You\'re 25% towards your retirement goal. Keep up the great work!',
        type: 'success',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        read: true,
        dashboardType: 'user'
      },
      {
        id: 'ai-1',
        title: 'AI Insights Available',
        message: 'New AI-powered insights are ready for your portfolio review.',
        type: 'info',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        read: false,
        dashboardType: 'user'
      },
      {
        id: 'transaction-1',
        title: 'Transaction Processed',
        message: 'Your round-up investment of $12.50 has been successfully processed.',
        type: 'success',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        read: true,
        dashboardType: 'user'
      }
    ]
    
    // Store the test notifications
    localStorage.setItem('kamioi_notifications', JSON.stringify(testNotifications))
    
    console.log('✅ Notifications fixed! Added', testNotifications.length, 'test notifications')
    return testNotifications
  } catch (error) {
    console.error('❌ Failed to fix notifications:', error)
    return []
  }
}

// Clear all notifications
export const clearAllNotifications = () => {
  try {
    localStorage.removeItem('kamioi_notifications')
    console.log('✅ All notifications cleared')
  } catch (error) {
    console.error('❌ Failed to clear notifications:', error)
  }
}


