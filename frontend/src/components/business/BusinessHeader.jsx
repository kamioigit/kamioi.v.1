import React from 'react'
import { Sun, Moon, Search, Bell, Cloud, Settings, User } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../hooks/useNotifications'

const BusinessHeader = ({ user, activeTab, onToggleSidebar }) => {
  const { isBlackMode, isLightMode, isCloudMode, toggleTheme } = useTheme()
  const { unreadCount } = useNotifications()

  const getHeaderClass = () => {
    if (isBlackMode) return 'bg-black/20 backdrop-blur-lg rounded-2xl p-4 mb-6 mx-6 mt-4 border border-gray-800'
    if (isLightMode) return 'bg-white/80 backdrop-blur-lg rounded-2xl p-4 mb-6 mx-6 mt-4 border border-gray-200'
    if (isCloudMode) return 'bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 mx-6 mt-4 border border-white/20'
    return 'bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 mx-6 mt-4 border border-white/20'
  }

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getSearchInputClass = () => {
    if (isLightMode) return 'bg-gray-100 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400'
    return 'bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-purple-400'
  }

  const getSearchIconClass = () => {
    if (isLightMode) return 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4'
    return 'absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4'
  }

  const getIconClass = () => {
    if (isLightMode) return 'p-2 text-gray-600 hover:text-gray-800 transition-colors'
    return 'p-2 text-white/80 hover:text-white transition-colors'
  }

  const getUserNameClass = () => {
    if (isLightMode) return 'text-gray-800 font-medium'
    return 'text-white font-medium'
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Business Overview'
      case 'transactions': return 'Business Transactions'
      case 'team': return 'Team Management'
      case 'goals': return 'Business Goals'
      case 'analytics': return 'Business Analytics'
      case 'reports': return 'Business Reports'
      case 'settings': return 'Business Settings'
      default: return 'Business Dashboard'
    }
  }

  const handleNotifications = () => {
    // Navigate to notifications in the business dashboard
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'notifications' }))
    }, 100)
  }

  return (
    <header className={`${getHeaderClass()} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={getSearchIconClass()} />
            <input
              type="text"
              placeholder="Search business investments..."
              className={getSearchInputClass()}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={getIconClass()}
            title={`Current: ${isBlackMode ? 'dark' : isLightMode ? 'light' : 'cloud'} - Click to cycle through themes`}
          >
            {isBlackMode ? <Moon className="w-5 h-5" /> : 
             isLightMode ? <Sun className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button 
            onClick={handleNotifications}
            className={`${getIconClass()} relative`}
            title={`View Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">B</span>
            </div>
            <span className={getUserNameClass()}>Business User</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default BusinessHeader
