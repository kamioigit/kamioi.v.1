import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { User, Users, Building2, Shield, LogOut, Home, LayoutDashboard, PieChart, Settings, Bell, CreditCard, Target, TrendingUp, History } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import { useTheme } from '../../context/ThemeContext'

const DemoDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { demoAccountType, setDemoAccountType, DEMO_DATA } = useDemo()
  const { isLightMode, isBlackMode, isCloudMode } = useTheme()

  // Get demo session from localStorage
  const [demoSession, setDemoSession] = useState(null)

  useEffect(() => {
    const session = localStorage.getItem('kamioi_demo_session')
    if (session) {
      try {
        setDemoSession(JSON.parse(session))
      } catch (e) {
        console.error('Invalid demo session')
      }
    }
  }, [])

  // Determine current view from URL
  const currentView = location.pathname.split('/demo/')[1] || 'user'

  const handleViewChange = (view) => {
    // Update demo account type in context
    if (view === 'user') setDemoAccountType('individual')
    else if (view === 'family') setDemoAccountType('family')
    else if (view === 'business') setDemoAccountType('business')

    navigate(`/demo/${view}`)
  }

  const handleExitDemo = () => {
    localStorage.removeItem('kamioi_demo_session')
    navigate('/login')
  }

  const views = [
    { id: 'user', label: 'Individual', icon: User, color: 'blue' },
    { id: 'family', label: 'Family', icon: Users, color: 'green' },
    { id: 'business', label: 'Business', icon: Building2, color: 'orange' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'purple' }
  ]

  const getButtonClass = (view) => {
    const isActive = currentView === view.id
    const baseClass = 'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium text-sm'

    if (isActive) {
      return `${baseClass} bg-white/20 text-white shadow-lg`
    }
    return `${baseClass} text-white/80 hover:bg-white/10 hover:text-white`
  }

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-100' : isBlackMode ? 'bg-black' : 'gradient-bg'}`}>
      {/* Demo Mode Banner */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Left: Demo Badge */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white font-bold text-sm">DEMO MODE</span>
              </div>
              <span className="text-white/80 text-sm hidden sm:inline">
                Explore the platform with sample data
              </span>
            </div>

            {/* Center: View Switcher */}
            <div className="hidden md:flex items-center space-x-1 bg-black/20 rounded-lg p-1">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => handleViewChange(view.id)}
                  className={getButtonClass(view)}
                >
                  <view.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{view.label}</span>
                </button>
              ))}
            </div>

            {/* Right: Exit Button */}
            <button
              onClick={handleExitDemo}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Demo</span>
            </button>
          </div>

          {/* Mobile View Switcher */}
          <div className="md:hidden flex items-center justify-center space-x-2 pb-3">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => handleViewChange(view.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all text-sm ${
                  currentView === view.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <view.icon className="w-4 h-4" />
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default DemoDashboard
