/**
 * DemoAccessForm - Demo code validation form for the unified auth page
 * Extracted from Login.jsx for use in SignupWizard
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

const DemoAccessForm = ({ onSwitchToSignUp }) => {
  const navigate = useNavigate()

  const [demoData, setDemoData] = useState({
    email: '',
    code: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!demoData.email || !demoData.code) {
      setError('Please enter both email and demo code')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/demo/validate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: demoData.code.trim().toUpperCase(),
          email: demoData.email.trim()
        })
      })

      const data = await response.json()

      if (data.success && data.session) {
        // CRITICAL: Clear any existing auth tokens that would block demo mode
        localStorage.removeItem('kamioi_user_token')
        localStorage.removeItem('kamioi_business_token')
        localStorage.removeItem('kamioi_family_token')
        localStorage.removeItem('kamioi_admin_token')
        localStorage.removeItem('kamioi_user')
        localStorage.removeItem('kamioi_business_user')
        localStorage.removeItem('kamioi_family_user')

        localStorage.setItem('kamioi_demo_token', data.session.token)
        localStorage.setItem('kamioi_demo_expires', data.session.expiresAt)
        localStorage.setItem('kamioi_demo_session', JSON.stringify(data.session))

        // CRITICAL: Set demo mode flags so DataContext uses demo data
        const dashboard = data.session.dashboard || 'user'
        const accountType = dashboard === 'business' ? 'business' : dashboard === 'family' ? 'family' : 'individual'
        localStorage.setItem('kamioi_demo_mode', 'true')
        localStorage.setItem('kamioi_demo_account_type', accountType)

        // Dispatch event so DataContext can reload with demo data
        window.dispatchEvent(new CustomEvent('demoModeChanged'))

        // Navigate to the appropriate demo dashboard based on access level
        navigate(`/demo/${dashboard === 'all' ? 'user' : dashboard}`)
      } else {
        setError(data.error || 'Invalid demo code. Please check and try again.')
      }
    } catch (err) {
      console.error('Demo code validation error:', err)
      setError('Failed to validate demo code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="demo-email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              id="demo-email"
              type="email"
              value={demoData.email}
              onChange={(e) => setDemoData({ ...demoData, email: e.target.value })}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="demo-code" className="block text-sm font-medium text-white mb-2">
              Demo Code
            </label>
            <div className="relative">
              <input
                id="demo-code"
                type="text"
                value={demoData.code}
                onChange={(e) => setDemoData({ ...demoData, code: e.target.value.toUpperCase() })}
                placeholder="Enter your demo code"
                className="w-full px-4 pr-10 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 font-mono text-center tracking-wider"
                disabled={isLoading}
                autoFocus
              />
              <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !demoData.email || !demoData.code}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Validating...</span>
              </>
            ) : (
              <>
                <span>Access Demo Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="pt-6 border-t border-white/10">
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Fully interactive demo with real data</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Switch between User, Family, Business, and Admin views</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Session expires after 4 hours of inactivity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Switch to Sign Up */}
      <div className="text-center mt-8">
        <p className="text-white/50 text-sm">
          Don't have a demo code?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign up for an account
          </button>
        </p>
      </div>
    </>
  )
}

export default DemoAccessForm
