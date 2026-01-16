import React from 'react'
import { 
  LayoutDashboard, 
  Users, 
  PieChart, 
  Target, 
  CreditCard, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Building2,
  Brain,
  Bell
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const BusinessDashboardSidebar = ({ activeTab, onTabChange }) => {

   const { isLightMode } = useTheme()
  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'
  const getActiveClass = () => isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'
  const getHoverClass = () => isLightMode ? 'hover:bg-gray-100' : 'hover:bg-white/10'

  const menuItems = [
    { id: 'dashboard', label: 'Business Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'portfolio', label: 'Business Portfolio', icon: PieChart },
    { id: 'goals', label: 'Business Goals', icon: Target },
    { id: 'ai', label: 'AI Insights', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <aside className={`${getCardClass()} border-r w-64 h-full flex flex-col`}>
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`font-bold text-lg ${getTextClass()}`}>Kamioi Business</h2>
            <p className={`text-xs ${getSubtextClass()}`}>Business Investment Platform</p>
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
          <p>Kamioi Business Platform</p>
          <p>Version 3.0 - Clean Architecture</p>
        </div>
      </div>
    </aside>
  )
}

export default BusinessDashboardSidebar


