/**
 * Notification System Tester Component
 * This component provides buttons to test the notification system
 * It can be temporarily added to any dashboard for testing
 */

import React, { useState } from 'react'
import { Trash2, Plus, User, Bell, TestTube } from 'lucide-react'
import notificationService from '../../services/simpleNotificationService'
import { testNotificationSystem, testAutoCleanup, clearTestNotifications } from '../../utils/simpleTestNotifications'
import NotificationModal from './NotificationModal'

const NotificationTester = ({ dashboardType = 'user' }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' })
  const handleCreateTestNotification = () => {
    const notifications = [
      {
        title: 'Investment Processed',
        message: `Your round-up investment of $${(Math.random() * 50 + 5).toFixed(2)} has been completed.`,
        type: 'success',
        icon: '💰',
        priority: 'normal',
        dashboardType
      },
      {
        title: 'Security Alert',
        message: 'New login detected from Chrome on Windows. If this wasn\'t you, please secure your account.',
        type: 'warning',
        icon: '🔒',
        priority: 'high',
        dashboardType
      },
      {
        title: 'Portfolio Update',
        message: `Your ${dashboardType} portfolio has grown by ${(Math.random() * 10 + 1).toFixed(1)}% this month.`,
        type: 'info',
        icon: '📈',
        priority: 'normal',
        dashboardType
      },
      {
        title: 'Goal Achieved!',
        message: `Congratulations! You've reached your $${Math.floor(Math.random() * 5001 + 1000)} savings goal.`,
        type: 'success',
        icon: '🎉',
        priority: 'high',
        dashboardType
      }
    ]

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
    notificationService.addNotification(randomNotification)
    console.log('✅ Test notification created:', randomNotification.title)
    
    // Show success modal
    setModal({
      isOpen: true,
      title: 'Test Notification Created!',
      message: `Created: "${randomNotification.title}"\nType: ${randomNotification.type}\nDashboard: ${dashboardType}\n\nCheck the Notifications tab to see it.`,
      type: 'success'
    })
  }

  const handleRunFullTest = () => {
    const results = testNotificationSystem()
    console.log('🧪 Full test completed:', results)
    setModal({
      isOpen: true,
      title: 'Notification System Test Complete!',
      message: `User: ${results.userCount} notifications\nFamily: ${results.familyCount} notifications\nBusiness: ${results.businessCount} notifications\nAdmin: ${results.adminCount} notifications\n\nCheck the console for detailed results.`,
      type: 'success'
    })
  }

  const handleTestAutoCleanup = () => {
    testAutoCleanup()
    setModal({
      isOpen: true,
      title: 'Auto-cleanup Test Complete!',
      message: 'Auto-cleanup test completed! Check the console for results.',
      type: 'info'
    })
  }

  const handleClearAll = () => {
    clearTestNotifications()
    setModal({
      isOpen: true,
      title: 'Notifications Cleared!',
      message: 'All notifications cleared!',
      type: 'success'
    })
  }

  const stats = notificationService.getStats()

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <TestTube className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-white font-semibold">Notification System Tester</h3>
            <p className="text-gray-400 text-sm">Test the notification system functionality</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-medium">{stats.total} Total</p>
          <p className="text-blue-400 text-sm">{stats.unread} Unread</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={handleCreateTestNotification}
          className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 flex flex-col items-center space-y-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-medium">Add Test</span>
        </button>

        <button
          onClick={handleRunFullTest}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-3 text-blue-400 flex flex-col items-center space-y-2 transition-all"
        >
          <TestTube className="w-5 h-5" />
          <span className="text-xs font-medium">Full Test</span>
        </button>

        <button
          onClick={handleTestAutoCleanup}
          className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-3 text-yellow-400 flex flex-col items-center space-y-2 transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="text-xs font-medium">Test Cleanup</span>
        </button>

        <button
          onClick={handleClearAll}
          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 flex flex-col items-center space-y-2 transition-all"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-xs font-medium">Clear All</span>
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        <p>• Click "Add Test" to create a random notification for this dashboard</p>
        <p>• Click "Full Test" to create notifications for all dashboards</p>
        <p>• Click "Test Cleanup" to test the 7-day auto-deletion feature</p>
        <p>• Click "Clear All" to remove all notifications</p>
      </div>

      {/* Custom Modal */}
      <NotificationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}

export default NotificationTester

