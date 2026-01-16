import React from 'react'
import { Settings, Shield, User, Bell, Info, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const AdminDashboardHeader = ({ user, activeTab }) => {
  const { logoutAdmin } = useAuth()
   const { isLightMode } = useTheme()

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  const handleLogout = () => {
    logoutAdmin()
  }

  return (
    <header className={`${getCardClass()} border-b p-4`}>
      <div className="flex items-center justify-between">
        {/* Left Side - Admin Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-semibold ${getTextClass()}`}>
                Admin Dashboard - {user?.name || 'Admin'}
              </h1>
              <p className={`text-sm ${getSubtextClass()}`}>
                {activeTab === 'dashboard' ? 'System Overview' : 
                 activeTab === 'users' ? 'User Management' :
                 activeTab === 'businesses' ? 'Business Management' :
                 activeTab === 'families' ? 'Family Management' :
                 activeTab === 'analytics' ? 'System Analytics' :
                 activeTab === 'settings' ? 'System Settings' :
                 activeTab === 'security' ? 'Security Management' :
                 activeTab === 'monitoring' ? 'System Monitoring' : 'Admin Dashboard'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className={`p-2 rounded-lg transition-colors ${
            isLightMode 
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
              : 'bg-white/10 hover:bg-white/20 text-gray-300'
          }`}>
            <Bell className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button className={`p-2 rounded-lg transition-colors ${
            isLightMode 
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
              : 'bg-white/10 hover:bg-white/20 text-gray-300'
          }`}>
            <Settings className="w-5 h-5" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`p-2 rounded-lg transition-colors ${
              isLightMode 
                ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
            }`}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminDashboardHeader


