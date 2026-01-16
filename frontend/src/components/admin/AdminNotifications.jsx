import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle, X, Info, AlertTriangle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import notificationService from '../../services/simpleNotificationService'

const AdminNotifications = ({ user }) => {
  const [notifications, setNotifications] = useState([])
   const { isLightMode } = useTheme()
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [loading, setLoading] = useState(true)

  // Load notifications on component mount
  useEffect(() => {
    const loadNotifications = () => {
      const allNotifications = notificationService.getNotifications()
      const adminNotifications = allNotifications.filter(n => n.dashboardType === 'admin')
      setNotifications(adminNotifications)
      setLoading(false)
    }

    loadNotifications()
    
    // Listen for notification changes
    const handleNotificationChange = (updatedNotifications) => {
      const adminNotifications = updatedNotifications.filter(n => n.dashboardType === 'admin')
      setNotifications(adminNotifications)
    }
    
    notificationService.addListener(handleNotificationChange)
    
    return () => {
      notificationService.removeListener(handleNotificationChange)
    }
  }, [user?.id])

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

  const handleMarkAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId)
  }

  const handleDeleteNotification = (notificationId) => {
    notificationService.deleteNotification(notificationId)
  }

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead()
  }

  const filteredNotifications = notifications.filter(notification => {
    if (!notification) return false
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
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
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
    
    return isUnread ? `${baseClass} border-l-4 border-red-500` : baseClass
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${getTextClass()} mb-2`}>
            Admin Notifications
          </h1>
          <p className={`${getSubtextClass()}`}>
            Stay updated on your admin investment activity.
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className={`${getCardClass()} backdrop-blur-lg rounded-2xl p-12 text-center border`}>
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-xl font-semibold ${getTextClass()} mb-2`}>
              No admin notifications yet
            </h3>
            <p className={`${getSubtextClass()}`}>
              You'll receive notifications about your admin investments, goals, and AI recommendations here.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <span className={`font-medium ${getTextClass()}`}>
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className={`text-sm ${getSubtextClass()}`}>
                    {notifications.filter(n => n && !n.read).length} unread
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${getCardClass()} ${getTextClass()} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
                
                {notifications.filter(n => n && !n.read).length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${getCardClass()} backdrop-blur-lg rounded-xl p-6 border transition-all hover:shadow-lg ${
                    !notification.read ? 'ring-2 ring-blue-500/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-semibold ${getTextClass()}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getSubtextClass()}`}>
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className={`mt-2 ${getSubtextClass()}`}>
                        {notification.message}
                      </p>
                      
                      {notification.priority && (
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.priority} priority
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminNotifications
