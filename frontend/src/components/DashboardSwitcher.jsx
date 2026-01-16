import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Switch, Building, Users, Settings, User } from 'lucide-react'

const DashboardSwitcher = () => {
  const { 
    activeUser, 
    currentDashboard, 
    loggedInUsers, 
    switchDashboard, 
    getAvailableSessions,
    logoutSession 
  } = useAuth()
  
  const [isOpen, setIsOpen] = useState(false)
  
  const availableSessions = getAvailableSessions()
  
  const getDashboardIcon = (dashboard) => {
    switch (dashboard) {
      case 'user':
      case 'individual':
        return <User className="w-4 h-4" />
      case 'family':
        return <Users className="w-4 h-4" />
      case 'business':
        return <Building className="w-4 h-4" />
      case 'admin':
        return <Settings className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }
  
  const getDashboardName = (dashboard) => {
    switch (dashboard) {
      case 'user':
      case 'individual':
        return 'Individual'
      case 'family':
        return 'Family'
      case 'business':
        return 'Business'
      case 'admin':
        return 'Admin'
      default:
        return 'User'
    }
  }
  
  const handleSwitchDashboard = (email, dashboard) => {
    const result = switchDashboard(email, dashboard)
    if (result.success) {
      setIsOpen(false)
      // Reload the page to switch to the new dashboard
      window.location.reload()
    }
  }
  
  const handleLogoutSession = async (email, dashboard) => {
    await logoutSession(email, dashboard)
    if (availableSessions.length <= 1) {
      // If this was the last session, redirect to login
      window.location.href = '/login'
    }
  }
  
  if (availableSessions.length <= 1) {
    return null // Don't show switcher if only one session
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Switch className="w-4 h-4" />
        <span>Switch Dashboard</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Active Sessions
            </h3>
            
            <div className="space-y-2">
              {availableSessions.map((session, index) => (
                <div
                  key={`${session.email}_${session.dashboard}`}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    activeUser?.email === session.email && currentDashboard === session.dashboard
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getDashboardIcon(session.dashboard)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {session.email}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getDashboardName(session.dashboard)} Dashboard
                      </div>
                      <div className="text-xs text-gray-500">
                        Logged in: {new Date(session.loginTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {activeUser?.email === session.email && currentDashboard === session.dashboard ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwitchDashboard(session.email, session.dashboard)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Switch
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleLogoutSession(session.email, session.dashboard)}
                      className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                You can be logged into multiple dashboards simultaneously.
                Switch between them or logout from specific sessions.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardSwitcher


