import React, { useState } from 'react'
import { useMultiAuth } from '../context/MultiAuthContext'
import { Check, Users, Shield, User } from 'lucide-react'

const MultiLogin = () => {
  const { login, getAllSessions, currentUser } = useMultiAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const existingSessions = getAllSessions()
  const hasAdminSession = existingSessions.some(s => s.user.role === 'admin')
  const hasUserSession = existingSessions.some(s => s.user.role === 'user')

  const handleLogin = async (userType, email, password) => {
    setLoading(true)
    setError('')
    
    try {
      const result = await login(email, password, userType)
      if (result.success) {
        console.log(`✅ ${userType} login successful`)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const quickLoginOptions = [
    {
      type: 'admin',
      email: 'admin@kamioi.com',
      password: 'admin123',
      label: 'Admin User',
      description: 'Full system access',
      icon: Shield,
      color: 'red',
      disabled: hasAdminSession
    },
    {
      type: 'user',
      email: 'test1@test1.com',
      password: 'test123',
      label: 'Test User',
      description: 'Regular user access',
      icon: Users,
      color: 'blue',
      disabled: hasUserSession
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      red: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
    }
    return colors[color] || colors.blue
  }

  const getIconColor = (color) => {
    const colors = {
      red: 'text-red-400',
      blue: 'text-blue-400'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Multi-Session Login</h1>
          <p className="text-gray-300 text-lg">
            Login as multiple user types for testing and development
          </p>
        </div>

        {/* Current Sessions */}
        {existingSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Active Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {existingSessions.map((session, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    {session.user.role === 'admin' ? (
                      <Shield className="w-6 h-6 text-red-400" />
                    ) : (
                      <Users className="w-6 h-6 text-blue-400" />
                    )}
                    <div>
                      <div className="text-white font-medium">{session.user.name}</div>
                      <div className="text-gray-400 text-sm">{session.user.email}</div>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        session.user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {session.user.role}
                      </div>
                    </div>
                    {session.user.email === currentUser?.email && (
                      <Check className="w-5 h-5 text-green-400 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Login Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickLoginOptions.map((option, index) => {
            const IconComponent = option.icon
            return (
              <div key={index} className="relative">
                <button
                  onClick={() => handleLogin(option.type, option.email, option.password)}
                  disabled={option.disabled || loading}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    option.disabled 
                      ? 'bg-gray-500/20 text-gray-500 border-gray-500/30 cursor-not-allowed' 
                      : getColorClasses(option.color)
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <IconComponent className={`w-8 h-8 ${getIconColor(option.color)}`} />
                    <div className="text-left">
                      <div className="text-xl font-semibold">{option.label}</div>
                      <div className="text-sm opacity-80">{option.description}</div>
                      <div className="text-xs opacity-60 mt-1">{option.email}</div>
                    </div>
                    {option.disabled && (
                      <Check className="w-6 h-6 text-green-400 ml-auto" />
                    )}
                  </div>
                </button>
                
                {option.disabled && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium">
                      Active
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-300 font-medium">Login Error</div>
            <div className="text-red-200 text-sm mt-1">{error}</div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white/5 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">How to Use Multi-Session Login</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>Click on any user type to log in as that user</div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>You can be logged in as multiple user types simultaneously</div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>Use the session switcher in the top-right to switch between users</div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>Each session maintains its own data and permissions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiLogin


