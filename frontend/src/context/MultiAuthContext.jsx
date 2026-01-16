/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const MultiAuthContext = createContext()

export const useMultiAuth = () => {
  const context = useContext(MultiAuthContext)
  if (!context) {
    throw new Error('useMultiAuth must be used within a MultiAuthProvider')
  }
  return context
}

export const MultiAuthProvider = ({ children }) => {
  const [sessions, setSessions] = useState({})
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize multi-session authentication
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load all stored sessions
      const storedSessions = localStorage.getItem('kamioi_sessions')
      let sessionsData = null
      if (storedSessions) {
        sessionsData = JSON.parse(storedSessions)
        setSessions(sessionsData)
        
        // Set the most recent session as active
        const sessionKeys = Object.keys(sessionsData)
        if (sessionKeys.length > 0) {
          const latestSession = sessionKeys.reduce((latest, key) => {
            return sessionsData[key].lastActive > sessionsData[latest].lastActive ? key : latest
          })
          setActiveSession(latestSession)
        }
      }
      
      const loadedKeys = storedSessions ? Object.keys(sessionsData) : []
      console.log('✅ MultiAuth - Initialized with sessions:', loadedKeys)
    } catch (error) {
      console.error('❌ MultiAuth - Initialization error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save sessions to localStorage
  const saveSessions = useCallback((newSessions) => {
    localStorage.setItem('kamioi_sessions', JSON.stringify(newSessions))
    setSessions(newSessions)
  }, [])

  // Login function
  const login = async (email, password, userType = 'user') => {
    try {
      console.log(`🔐 MultiAuth - Attempting ${userType} login for: ${email}`)
      
      // Create session key based on user type and email
      const sessionKey = `${userType}_${email.replace('@', '_').replace('.', '_')}`
      
      // Mock login for now (replace with actual API calls)
      let userData, token
      
      if (userType === 'admin' && email === 'admin@kamioi.com') {
        userData = {
          id: 1,
          email: 'admin@kamioi.com',
          name: 'Admin User',
          role: 'admin',
          dashboard: 'admin'
        }
        token = 'token_1'
      } else if (userType === 'user' && email === 'test1@test1.com') {
        userData = {
          id: 2,
          email: 'test1@test1.com',
          name: 'Test User',
          role: 'user',
          dashboard: 'user'
        }
        token = 'token_2'
      } else {
        throw new Error('Invalid credentials')
      }
      
      // Create new session
      const newSession = {
        user: userData,
        token: token,
        userType: userType,
        lastActive: Date.now(),
        createdAt: Date.now()
      }
      
      // Update sessions
      const updatedSessions = {
        ...sessions,
        [sessionKey]: newSession
      }
      
      saveSessions(updatedSessions)
      setActiveSession(sessionKey)
      
      console.log(`✅ MultiAuth - ${userType} login successful for: ${email}`)
      return { success: true, user: userData, sessionKey }
      
    } catch (error) {
      console.error(`❌ MultiAuth - Login error:`, error)
      return { success: false, error: error.message }
    }
  }

  // Switch active session
  const switchSession = (sessionKey) => {
    if (sessions[sessionKey]) {
      setActiveSession(sessionKey)
      
      // Update last active time
      const updatedSessions = {
        ...sessions,
        [sessionKey]: {
          ...sessions[sessionKey],
          lastActive: Date.now()
        }
      }
      saveSessions(updatedSessions)
      
      console.log(`🔄 MultiAuth - Switched to session: ${sessionKey}`)
    }
  }

  // Logout specific session
  const logoutSession = (sessionKey) => {
    const updatedSessions = { ...sessions }
    delete updatedSessions[sessionKey]
    saveSessions(updatedSessions)
    
    // If we logged out the active session, switch to another
    if (activeSession === sessionKey) {
      const remainingSessions = Object.keys(updatedSessions)
      if (remainingSessions.length > 0) {
        setActiveSession(remainingSessions[0])
      } else {
        setActiveSession(null)
      }
    }
    
    console.log(`🚪 MultiAuth - Logged out session: ${sessionKey}`)
  }

  // Logout all sessions
  const logoutAll = () => {
    localStorage.removeItem('kamioi_sessions')
    setSessions({})
    setActiveSession(null)
    console.log('🚪 MultiAuth - Logged out all sessions')
  }

  // Get current user
  const getCurrentUser = () => {
    if (activeSession && sessions[activeSession]) {
      return sessions[activeSession].user
    }
    return null
  }

  // Get current token
  const getCurrentToken = () => {
    if (activeSession && sessions[activeSession]) {
      return sessions[activeSession].token
    }
    return null
  }

  // Check if user has specific role
  const hasRole = (role) => {
    const currentUser = getCurrentUser()
    return currentUser && currentUser.role === role
  }

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin')
  }

  // Check if user is regular user
  const isUser = () => {
    return hasRole('user')
  }

  // Get all sessions
  const getAllSessions = () => {
    return Object.values(sessions)
  }

  // Get sessions by type
  const getSessionsByType = (userType) => {
    return Object.values(sessions).filter(session => session.userType === userType)
  }

  // Initialize on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const value = {
    // State
    sessions,
    activeSession,
    loading,
    error,
    
    // Current session info
    currentUser: getCurrentUser(),
    currentToken: getCurrentToken(),
    
    // Actions
    login,
    switchSession,
    logoutSession,
    logoutAll,
    
    // Helpers
    hasRole,
    isAdmin,
    isUser,
    getAllSessions,
    getSessionsByType,
    
    // Session management
    getCurrentUser,
    getCurrentToken
  }

  return (
    <MultiAuthContext.Provider value={value}>
      {children}
    </MultiAuthContext.Provider>
  )
}

export default MultiAuthContext


