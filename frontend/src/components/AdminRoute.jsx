import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { admin, loading, isInitialized } = useAuth()
  
  // Check for admin token in localStorage (most reliable check)
  const hasAdminToken = localStorage.getItem('kamioi_admin_token')
  const hasAdminUserData = localStorage.getItem('kamioi_admin_user')
  
  console.log('🔒 AdminRoute - Check:', {
    hasAdminToken: !!hasAdminToken,
    hasAdminUserData: !!hasAdminUserData,
    admin: !!admin,
    adminObject: admin,
    isInitialized,
    loading
  })
  
  // If we have a token OR admin state, allow access
  // Token is the primary check, admin state is secondary
  const hasValidSession = hasAdminToken || admin
  
  if (hasValidSession) {
    // If AuthContext is still loading, show loading but don't redirect
    if (!isInitialized || loading) {
      console.log('🔒 AdminRoute - Valid session found, waiting for AuthContext initialization...')
      return <div>Loading...</div>
    }
    
    // AuthContext initialized - grant access
    console.log('🔒 AdminRoute - Admin access granted')
    console.log('🔒 AdminRoute - Admin:', admin)
    console.log('🔒 AdminRoute - Token:', hasAdminToken)
    return children
  }
  
  // No valid session - wait for initialization then redirect
  if (!isInitialized || loading) {
    console.log('🔒 AdminRoute - No session, waiting for auth initialization...')
    return <div>Loading...</div>
  }
  
  // No session and initialization complete - redirect to login
  console.log('🔒 AdminRoute - No admin session, redirecting to login')
  console.log('🔒 AdminRoute - Admin from context:', admin)
  console.log('🔒 AdminRoute - Admin token:', hasAdminToken)
  console.log('🔒 AdminRoute - Admin user data:', hasAdminUserData)
  return <Navigate to="/admin-login" replace />
}

export default AdminRoute


