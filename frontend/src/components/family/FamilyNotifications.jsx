import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info, Bell, X, Filter } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useDemo } from '../../context/DemoContext'

// Generate demo notifications for demo mode
const generateDemoNotifications = () => {
  const now = new Date()
  return [
    {
      id: 'demo-f1',
      title: 'Family Portfolio Milestone',
      message: 'Congratulations! Your family portfolio has reached $100,000 in total value. Amazing teamwork!',
      type: 'success',
      timestamp: new Date(now - 45 * 60 * 1000), // 45 mins ago
      read: false,
      priority: 'high',
      dashboardType: 'family'
    },
    {
      id: 'demo-f2',
      title: 'New Family Member Added',
      message: 'Emma has joined the family investment account. Welcome to the team!',
      type: 'success',
      timestamp: new Date(now - 3 * 60 * 60 * 1000), // 3 hours ago
      read: false,
      dashboardType: 'family'
    },
    {
      id: 'demo-f3',
      title: 'Family Goal Progress',
      message: 'Your Vacation Fund goal is now 75% complete! Just $2,500 more to reach your target.',
      type: 'info',
      timestamp: new Date(now - 8 * 60 * 60 * 1000), // 8 hours ago
      read: false,
      dashboardType: 'family'
    },
    {
      id: 'demo-f4',
      title: 'Combined Round-Up Summary',
      message: 'This week, your family invested $48 through round-ups across 42 transactions. Keep it up!',
      type: 'success',
      timestamp: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      dashboardType: 'family'
    },
    {
      id: 'demo-f5',
      title: 'Family Meeting Reminder',
      message: 'Time for your monthly family finance review! Check the Analytics tab to see your progress.',
      type: 'info',
      timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      dashboardType: 'family'
    },
    {
      id: 'demo-f6',
      title: 'Shared Holdings Update',
      message: 'Your family\'s shared AAPL holdings are up 4.2% this week. Total value: $1,245.',
      type: 'success',
      timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      dashboardType: 'family'
    },
    {
      id: 'demo-f7',
      title: 'New AI Recommendation',
      message: 'Based on your family\'s spending at Costco, consider learning about COST stock together.',
      type: 'info',
      timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      read: true,
      dashboardType: 'family'
    }
  ]
}

const FamilyNotifications = ({ user }) => {
  const { notifications, markAsRead, clearNotification, markAllAsRead } = useNotifications()
  const { isLightMode } = useTheme()
  const { isDemoMode } = useDemo()
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [demoNotifications, setDemoNotifications] = useState([])

  // Load demo notifications in demo mode
  useEffect(() => {
    if (isDemoMode && notifications.length === 0) {
      console.log('FamilyNotifications - Demo mode detected, loading demo notifications')
      setDemoNotifications(generateDemoNotifications())
    }
  }, [isDemoMode, notifications.length])

  // Use demo notifications if in demo mode and no real notifications
  const displayNotifications = isDemoMode && notifications.length === 0 ? demoNotifications : notifications

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
    
    return isUnread ? `${baseClass} border-l-4 border-green-500` : baseClass
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${getTextClass()}`}>Family Notifications</h1>
          <p className={`${getSubtextClass()} mt-1`}>Stay updated on your family investment activity</p>
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
               'No family notifications yet'}
            </h3>
            <p className={`${getSubtextClass()} text-sm`}>
              {filter === 'all' ? 
                "You'll receive notifications about your family investments, goals, and AI recommendations here" :
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

export default FamilyNotifications
