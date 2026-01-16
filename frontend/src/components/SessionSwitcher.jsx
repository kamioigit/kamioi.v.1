import React, { useState } from 'react'
import { Users, Shield, ChevronDown, LogOut } from 'lucide-react'
import { useMultiAuth } from '../context/MultiAuthContext'

const SessionSwitcher = () => {
  const { 
    sessions, 
    activeSession, 
    currentUser, 
    switchSession, 
    logoutSession, 
    getAllSessions 
  } = useMultiAuth()
  
  const [isOpen, setIsOpen] = useState(false)

  if (!currentUser) {
    return null
  }

  const allSessions = getAllSessions()
  const otherSessions = allSessions.filter(session => 
    session.user.email !== currentUser.email
  )

  const getRoleIcon = (role) => {
    return role === 'admin' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />
  }

  const getRoleColor = (role) => {
    return role === 'admin' ? 'text-red-400' : 'text-blue-400'
  }

  const getRoleBadge = (role) => {
    return role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
  }

  return (
    <div className="relative">
      {/* Current Session Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-all"
      >
        <div className="flex items-center space-x-2">
          {getRoleIcon(currentUser.role)}
          <span className="text-white font-medium">{currentUser.name}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(currentUser.role)}`}>
            {currentUser.role}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-xl border border-white/10 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Active Sessions</h3>
              <span className="text-gray-400 text-sm">{allSessions.length} session{allSessions.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Current Session */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-2">Current Session</div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(currentUser.role)}
                    <div>
                      <div className="text-white font-medium">{currentUser.name}</div>
                      <div className="text-gray-400 text-sm">{currentUser.email}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(currentUser.role)}`}>
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Other Sessions */}
            {otherSessions.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-2">Switch To</div>
                <div className="space-y-2">
                  {otherSessions.map((session, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        switchSession(Object.keys(sessions).find(key => sessions[key] === session))
                        setIsOpen(false)
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(session.user.role)}
                          <div>
                            <div className="text-white font-medium">{session.user.name}</div>
                            <div className="text-gray-400 text-sm">{session.user.email}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(session.user.role)}`}>
                          {session.user.role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    logoutSession(activeSession)
                    setIsOpen(false)
                  }}
                  className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg transition-all text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Current</span>
                </button>
                {allSessions.length > 1 && (
                  <button
                    onClick={() => {
                      // Logout all other sessions
                      allSessions.forEach(session => {
                        if (session.user.email !== currentUser.email) {
                          const sessionKey = Object.keys(sessions).find(key => sessions[key] === session)
                          logoutSession(sessionKey)
                        }
                      })
                      setIsOpen(false)
                    }}
                    className="flex items-center space-x-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-3 py-2 rounded-lg transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Others</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default SessionSwitcher


