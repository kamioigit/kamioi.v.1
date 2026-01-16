import React from 'react'
import { LayoutDashboard, Users, Building2, Home, BarChart3, Settings, Shield, Activity, TrendingUp, User } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const AdminDashboardSidebar = ({ activeTab, onTabChange }) => {

 const { isLightMode } = useTheme()
  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'
  const getActiveClass = () => isLightMode ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400'
  const getHoverClass = () => isLightMode ? 'hover:bg-gray-100' : 'hover:bg-white/10'

  const menuItems = [
    { id: 'dashboard', label: 'System Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'businesses', label: 'Business Management', icon: Building2 },
    { id: 'families', label: 'Family Management', icon: Home },
    { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security Management', icon: Shield },
    { id: 'monitoring', label: 'System Monitoring', icon: Activity },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ]

  return (
    <aside className={`${getCardClass()} border-r w-64 h-full flex flex-col`}>
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`font-bold text-lg ${getTextClass()}`}>Kamioi Admin</h2>
            <p className={`text-xs ${getSubtextClass()}`}>System Administration</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? getActiveClass() 
                    : `${getSubtextClass()} ${getHoverClass()}`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className={`text-xs ${getSubtextClass()} text-center`}>
          <p>Kamioi Admin Platform</p>
          <p>Version 3.0 - Clean Architecture</p>
        </div>
      </div>
    </aside>
  )
}

export default AdminDashboardSidebar


