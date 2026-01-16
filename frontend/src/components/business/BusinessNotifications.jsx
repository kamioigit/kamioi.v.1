import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info, Bell, X, Download, Search, Settings } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useModal } from '../../context/ModalContext'
import notificationService from '../../services/notificationService'

const BusinessNotifications = ({ user }) => {
  const { notifications: contextNotifications, markAsRead: contextMarkAsRead, clearNotification: contextClearNotification, markAllAsRead: contextMarkAllAsRead } = useNotifications()
  const { showSuccessModal, showErrorModal } = useModal()
  const { isLightMode } = useTheme()
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [exporting, setExporting] = useState(false)

  // Fetch notifications from API on mount and refresh periodically
  useEffect(() => {
    fetchNotifications()
    
    // Refresh notifications every 5 seconds
    const interval = setInterval(() => {
      fetchNotifications()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      console.log('✅ BusinessNotifications: Fetching notifications with token:', token ? 'Token found' : 'No token')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('✅ BusinessNotifications: Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ BusinessNotifications: Response data:', result)
        let backendNotifications = []
        if (result.success && result.notifications) {
          backendNotifications = Array.isArray(result.notifications) ? result.notifications : []
        }
        
        // Also get notifications from localStorage (notificationService)
        const localNotifications = notificationService.getNotifications('business')
        console.log('✅ BusinessNotifications: Backend notifications:', backendNotifications.length, 'Local notifications:', localNotifications.length)
        
        // Merge notifications: backend takes priority, but add local ones that aren't in backend
        const backendIds = new Set(backendNotifications.map(n => n.id))
        const localOnly = localNotifications.filter(n => {
          // Check if this local notification exists in backend by comparing title/message
          return !backendNotifications.some(bn => 
            bn.title === n.title && bn.message === n.message && 
            Math.abs(new Date(bn.created_at) - new Date(n.timestamp)) < 60000 // within 1 minute
          )
        })
        
        // Convert local notifications to backend format
        const formattedLocal = localOnly.map(n => ({
          id: n.id || `local_${n.id}`,
          title: n.title,
          message: n.message,
          type: n.type || 'info',
          read: n.read || false,
          created_at: n.timestamp || new Date().toISOString()
        }))
        
        // Combine and sort by date
        const allNotifications = [...backendNotifications, ...formattedLocal]
          .sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp))
        
        console.log('✅ BusinessNotifications: Total notifications after merge:', allNotifications.length)
        setNotifications(allNotifications)
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('❌ BusinessNotifications: Failed to fetch notifications. Status:', response.status, 'Error:', errorText)
        
        // Fallback to localStorage if backend fails
        const localNotifications = notificationService.getNotifications('business')
        const formattedLocal = localNotifications.map(n => ({
          id: n.id || `local_${n.id}`,
          title: n.title,
          message: n.message,
          type: n.type || 'info',
          read: n.read || false,
          created_at: n.timestamp || new Date().toISOString()
        }))
        setNotifications(formattedLocal)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      
      // Fallback to localStorage if backend fails
      try {
        const localNotifications = notificationService.getNotifications('business')
        const formattedLocal = localNotifications.map(n => ({
          id: n.id || `local_${n.id}`,
          title: n.title,
          message: n.message,
          type: n.type || 'info',
          read: n.read || false,
          created_at: n.timestamp || new Date().toISOString()
        }))
        setNotifications(formattedLocal)
      } catch (localError) {
        console.error('Error loading local notifications:', localError)
        setNotifications([])
      }
    } finally {
      setLoading(false)
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      if (!token) {
        showErrorModal('Error', 'No authentication token found')
        return
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update local state
          setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          ))
          // Also update context if available
          if (contextMarkAsRead) {
            contextMarkAsRead(notificationId)
          }
        } else {
          throw new Error(result.message || 'Failed to mark notification as read')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to mark notification as read' }))
        throw new Error(errorData.message || 'Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      showErrorModal('Error', error.message || 'Failed to mark notification as read. Please try again.')
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      if (!token) {
        showErrorModal('Error', 'No authentication token found')
        return
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update local state
          setNotifications(prev => prev.filter(n => n.id !== notificationId))
          // Also update context if available
          if (contextClearNotification) {
            contextClearNotification(notificationId)
          }
          showSuccessModal('Success', 'Notification deleted successfully')
        } else {
          throw new Error(result.message || 'Failed to delete notification')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete notification' }))
        throw new Error(errorData.message || 'Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      showErrorModal('Error', error.message || 'Failed to delete notification. Please try again.')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      if (!token) {
        showErrorModal('Error', 'No authentication token found')
        return
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update local state
          setNotifications(prev => prev.map(n => ({ ...n, read: true })))
          // Also update context if available
          if (contextMarkAllAsRead) {
            contextMarkAllAsRead()
          }
          showSuccessModal('Success', 'All notifications marked as read')
        } else {
          throw new Error(result.message || 'Failed to mark all notifications as read')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to mark all notifications as read' }))
        throw new Error(errorData.message || 'Failed to mark all notifications as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      showErrorModal('Error', error.message || 'Failed to mark all notifications as read. Please try again.')
    }
  }

  const handleExportNotifications = async () => {
    try {
      setExporting(true)
      const token = localStorage.getItem('kamioi_user_token')
      if (!token) {
        showErrorModal('Error', 'No authentication token found')
        return
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/notifications/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.download_url) {
          // Create download link
          const link = document.createElement('a')
          link.href = result.download_url
          link.download = `business-notifications-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          showSuccessModal('Success', 'Notifications exported successfully!')
        } else if (result.success && result.file_data) {
          // If API returns file data directly, create blob and download
          const blob = new Blob([result.file_data], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `business-notifications-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          showSuccessModal('Success', 'Notifications exported successfully!')
        } else {
          // Fallback: Generate CSV from current notifications
          const csv = generateCSV(notifications)
          const blob = new Blob([csv], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `business-notifications-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          showSuccessModal('Success', 'Notifications exported successfully!')
        }
      } else {
        // Fallback: Generate CSV from current notifications
        const csv = generateCSV(notifications)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `business-notifications-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        showSuccessModal('Success', 'Notifications exported successfully!')
      }
    } catch (error) {
      console.error('Error exporting notifications:', error)
      // Fallback: Generate CSV from current notifications
      try {
        const csv = generateCSV(notifications)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `business-notifications-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        showSuccessModal('Success', 'Notifications exported successfully!')
      } catch (fallbackError) {
        showErrorModal('Error', 'Failed to export notifications. Please try again.')
      }
    } finally {
      setExporting(false)
    }
  }

  const generateCSV = (notifications) => {
    const headers = ['ID', 'Title', 'Message', 'Type', 'Status', 'Created At']
    const rows = notifications.map(n => [
      n.id || '',
      n.title || '',
      n.message || '',
      n.type || '',
      n.read ? 'Read' : 'Unread',
      n.created_at || n.timestamp || ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    return csvContent
  }

  const handleSettingsClick = () => {
    // Navigate to settings page with notifications tab active
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'settings' }))
      // Wait a bit for settings to load, then focus on notifications tab
      setTimeout(() => {
        const notificationsTabButton = document.querySelector('[data-settings-tab="notifications"]')
        if (notificationsTabButton) {
          notificationsTabButton.click()
        }
      }, 500)
    }, 100)
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) || 
      (filter === 'read' && notification.read)
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown'
    
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60)
        return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}d ago`
      }
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-tutorial="notifications-section">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Business Notifications</h1>
          <p className="text-gray-400 mt-1">Stay updated on your business investment activity</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleSettingsClick}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 flex items-center space-x-2 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button 
            onClick={handleExportNotifications}
            disabled={exporting || notifications.length === 0}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
            <span>{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Notifications</p>
              <p className="text-2xl font-bold text-white">{notifications.length}</p>
              <p className="text-blue-400 text-sm flex items-center mt-1">
                <Bell className="w-4 h-4 mr-1" />
                All notifications
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unread Notifications</p>
              <p className="text-2xl font-bold text-white">{notifications.filter(n => !n.read).length}</p>
              <p className="text-orange-400 text-sm flex items-center mt-1">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Needs attention
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Read Notifications</p>
              <p className="text-2xl font-bold text-white">{notifications.filter(n => n.read).length}</p>
              <p className="text-green-400 text-sm flex items-center mt-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                All caught up
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-white">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-400">
                {notifications.filter(n => !n.read).length} unread
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
            
            {notifications.filter(n => !n.read).length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No business notifications yet
          </h3>
          <p className="text-gray-400">
            You'll receive notifications about your business investments, goals, and AI recommendations here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`glass-card p-6 transition-all hover:shadow-lg ${
                !notification.read ? 'ring-2 ring-blue-500/20' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-lg font-semibold ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {formatTime(notification.created_at || notification.timestamp || notification.date)}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className={`mt-2 ${notification.read ? 'text-gray-500' : 'text-gray-300'}`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.type === 'success' ? 'bg-green-500/20 text-green-400' :
                        notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        notification.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {notification.type}
                      </span>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusinessNotifications
