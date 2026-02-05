/**
 * SignInForm - Login form component for the unified auth page
 * Extracted from Login.jsx for use in SignupWizard
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import ForgotPassword from '../auth/ForgotPassword'
import { User, AlertCircle } from 'lucide-react'

const SignInForm = ({ onSwitchToSignUp }) => {
  const navigate = useNavigate()
  const { loginUser } = useAuth()
  const { addNotification } = useNotifications()

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleInputChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  // Helper function to get dashboard path
  const getUserDashboardPath = (user) => {
    if (!user) return '/dashboard'

    const dashboard = user.dashboard || user.role
    const userId = user.account_number || user.id || 'unknown'

    switch (dashboard) {
      case 'admin':
      case 'superadmin':
        return `/admin/${userId}/`
      case 'business':
        return `/business/${userId}/`
      case 'family':
        return `/family/${userId}/`
      default:
        return `/dashboard/${userId}/`
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!loginData.email || !loginData.password) {
      setError('Please enter both email and password')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(loginData.email)) {
      setError('Please enter a valid email address')
      return
    }

    // Block demo/test accounts
    const blockedEmails = ['user2@user2.com', 'test@test.com', 'demo@demo.com', 'admin@admin.com']
    if (blockedEmails.includes(loginData.email.toLowerCase())) {
      setError('This account is no longer available. Please use a valid account.')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting login for:', loginData.email)
      const result = await loginUser(loginData.email, loginData.password)

      if (result.success) {
        console.log('Login successful')

        const userId = result.user.account_number || result.user.id

        if (!userId) {
          setError('No user ID found. Please try logging in again.')
          return
        }

        const dashboardPath = getUserDashboardPath(result.user)
        console.log('Redirecting to:', dashboardPath)
        navigate(dashboardPath)
      } else {
        // User-friendly error messages
        const errorMsg = result.error || 'Login failed'
        if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Invalid credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          setError('Account not found. Please check your email address or sign up for a new account.')
        } else if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
          setError('Access denied. Please contact support if you believe this is an error.')
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          setError('Unable to connect to server. Please check your internet connection.')
        } else {
          setError(errorMsg)
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Invalid email or password.')
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your internet connection.')
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                placeholder="Enter your email"
                autoComplete="off"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                placeholder="Enter your password"
                autoComplete="off"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-white/50 text-sm">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Admin Login Link */}
          <div className="text-center">
            <button
              onClick={() => navigate('/admin-login')}
              className="text-white/70 hover:text-white text-sm underline"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* Footer - Switch to Sign Up */}
      <div className="text-center mt-8">
        <p className="text-white/50 text-sm">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </>
  )
}

export default SignInForm
