import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../hooks/useNotifications'
import { fixNotifications } from '../../utils/fixNotifications'

// Generate demo notifications for demo mode
const generateDemoNotifications = () => {
  const now = new Date()
  return [
    {
      id: 'demo-1',
      title: 'Portfolio Milestone Reached',
      message: 'Congratulations! Your portfolio has grown by 8.5% this month. Keep up the great investing habits!',
      type: 'success',
      timestamp: new Date(now - 30 * 60 * 1000), // 30 mins ago
      read: false,
      priority: 'high',
      dashboardType: 'user'
    },
    {
      id: 'demo-2',
      title: 'New Round-Up Investment',
      message: 'Your $1.00 round-up from Starbucks has been invested in SBUX. You now own 0.0102 shares.',
      type: 'success',
      timestamp: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      dashboardType: 'user'
    },
    {
      id: 'demo-3',
      title: 'Goal Progress Update',
      message: 'You\'re 65% of the way to your Emergency Fund goal! At this rate, you\'ll reach it in 4 months.',
      type: 'info',
      timestamp: new Date(now - 5 * 60 * 60 * 1000), // 5 hours ago
      read: false,
      dashboardType: 'user'
    },
    {
      id: 'demo-4',
      title: 'AI Recommendation',
      message: 'Based on your spending at Amazon, consider learning about AMZN stock. You could be investing in brands you already use!',
      type: 'info',
      timestamp: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      dashboardType: 'user'
    },
    {
      id: 'demo-5',
      title: 'Market Update',
      message: 'The S&P 500 is up 1.2% today. Your diversified portfolio is benefiting from the market rally.',
      type: 'info',
      timestamp: new Date(now - 26 * 60 * 60 * 1000), // 26 hours ago
      read: true,
      dashboardType: 'user'
    },
    {
      id: 'demo-6',
      title: 'Weekly Summary Available',
      message: 'Your weekly investment summary is ready. You invested $12.00 through round-ups this week across 12 transactions.',
      type: 'success',
      timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      dashboardType: 'user'
    },
    {
      id: 'demo-7',
      title: 'Stock Alert: AAPL',
      message: 'Apple (AAPL) is up 3.5% today after strong earnings report. Your holding is now worth $18.42.',
      type: 'success',
      timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      dashboardType: 'user'
    },
    {
      id: 'demo-8',
      title: 'New Feature: AI Insights',
      message: 'Check out the new AI Insights page for personalized investment recommendations based on your spending habits.',
      type: 'info',
      timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      read: true,
      dashboardType: 'user'
    }
  ]
}

const UserNotifications = () => {
  const { notifications, markAsRead, clearNotification, markAllAsRead } = useNotifications()
  const { isLightMode } = useTheme()
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [demoNotifications, setDemoNotifications] = useState([])

  // Check if in demo mode
  const isDemoMode = localStorage.getItem('kamioi_demo_mode') === 'true'

  // Load demo notifications in demo mode
  useEffect(() => {
    if (isDemoMode && notifications.length === 0) {
      console.log('UserNotifications - Demo mode detected, loading demo notifications')
      setDemoNotifications(generateDemoNotifications())
    }
  }, [isDemoMode, notifications.length])

  // Fix corrupted notifications on component mount (non-demo mode)
  useEffect(() => {
    if (isDemoMode) return // Skip for demo mode

    // Check if notifications are corrupted (empty titles/messages)
    const hasCorruptedNotifications = notifications.some(n =>
      !n.title || !n.message || n.title.trim() === '' || n.message.trim() === ''
    )

    if (hasCorruptedNotifications) {
      console.log('Fixing corrupted notifications...')
      fixNotifications()
      // Don't reload the page - just let the notifications update naturally
    }
  }, [notifications, isDemoMode])

  // Use demo notifications if in demo mode and no real notifications
  const displayNotifications = isDemoMode && notifications.length === 0 ? demoNotifications : notifications

  const getNotificationIcon = (notification) => {
    // Use custom icon if provided, otherwise use type-based icon
    if (notification.icon) {
      return <span className="text-lg">{notification.icon}</span>
    }
    
    switch (notification.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'info': return <Info className="w-5 h-5 text-blue-400" />
      default: return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const filteredNotifications = displayNotifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read
      case 'read': return notification.read
      default: return true
    }
  })

  // Handle demo notification actions
  const handleDemoMarkAsRead = (id) => {
    if (isDemoMode && demoNotifications.length > 0) {
      setDemoNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } else {
      markAsRead(id)
    }
  }

  const handleDemoDelete = (id) => {
    if (isDemoMode && demoNotifications.length > 0) {
      setDemoNotifications(prev => prev.filter(n => n.id !== id))
    } else {
      clearNotification(id)
    }
  }

  const handleDemoMarkAllAsRead = () => {
    if (isDemoMode && demoNotifications.length > 0) {
      setDemoNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } else {
      markAllAsRead()
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now - date) / (1000 * 60))
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const days = Math.floor(diffInHours / 24)
      return `${days}d ago`
    }
  }

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getSubtextClass = () => {
    if (isLightMode) return 'text-gray-600'
    return 'text-gray-400'
  }

  const getCardClass = () => {
    if (isLightMode) return 'bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 text-center'
    return 'bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center'
  }

  const getNotificationCardClass = (isUnread) => {
    const baseClass = isLightMode 
      ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-4 border border-gray-200'
      : 'bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20'
    
    return isUnread ? `${baseClass} border-l-4 border-blue-500` : baseClass
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${getTextClass()}`}>Notifications</h1>
          <p className={`${getSubtextClass()} mt-1`}>Stay updated on your investment activity</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Filter Dropdown */}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={`${isLightMode ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/10 border-white/20 text-white'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          
          {/* Mark All as Read */}
          {displayNotifications.some(n => !n.read) && (
            <button
              onClick={handleDemoMarkAllAsRead}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className={getCardClass()}>
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className={`${getTextClass()} text-lg font-medium mb-2`}>
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications yet'}
            </h3>
            <p className={`${getSubtextClass()} text-sm`}>
              {filter === 'all' ? 
                "You'll receive notifications about your investments, goals, and AI recommendations here" :
                `No ${filter} notifications found`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div key={notification.id} className={getNotificationCardClass(!notification.read)}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`${getTextClass()} font-semibold`}>{notification.title}</h3>
                      <p className={`${getSubtextClass()} mt-1 text-sm`}>{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className={`${getSubtextClass()} text-xs`}>{formatTime(notification.timestamp)}</p>
                        {notification.priority === 'high' && (
                          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => handleDemoMarkAsRead(notification.id)}
                          className={`${getSubtextClass()} hover:text-blue-400 transition-colors`}
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDemoDelete(notification.id)}
                        className={`${getSubtextClass()} hover:text-red-400 transition-colors`}
                        title="Delete notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default UserNotifications


