import React, { useState, useEffect } from 'react'
import { Key, AlertCircle, Shield, Smartphone, Mail, CheckCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const MultiFactorAuth = ({ onVerify, onCancel, user }) => {
  const { isLightMode } = useTheme()
  const [step, setStep] = useState(1) // 1: Choose method, 2: Enter code, 3: Success
  const [method, setMethod] = useState('') // 'sms', 'email', 'app'
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  const getTextColor = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200' : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'

  // Countdown timer
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [step, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMethodSelect = async (selectedMethod) => {
    setMethod(selectedMethod)
    setStep(2)
    setIsLoading(true)
    setError('')
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/auth/send-mfa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: selectedMethod,
          userId: user?.id || user?.account_number
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsLoading(false)
        setTimeLeft(300)
      } else {
        setError(data.error || 'Failed to send verification code')
        setIsLoading(false)
        setStep(1) // Go back to method selection
      }
    } catch (error) {
      console.error('Error sending MFA code:', error)
      setError('Network error. Please try again.')
      setIsLoading(false)
      setStep(1) // Go back to method selection
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/auth/verify-mfa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          method,
          userId: user?.id || user?.account_number
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsLoading(false)
        setStep(3)
        setTimeout(() => onVerify(), 2000)
      } else {
        setError(data.error || 'Invalid code. Please try again.')
        setCode('')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error verifying MFA code:', error)
      setError('Network error. Please try again.')
      setCode('')
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/auth/resend-mfa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          userId: user?.id || user?.account_number
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsLoading(false)
        setTimeLeft(300)
        setError('')
      } else {
        setError(data.error || 'Failed to resend code')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error resending MFA code:', error)
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className={getCardClass() + ' w-full max-w-md mx-auto shadow-2xl'}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className={`text-xl font-semibold ${getTextColor()} mb-2`}>
              Enable Two-Factor Authentication
            </h3>
            <p className={`${getSubtextClass()} text-sm`}>
              Choose your preferred verification method
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleMethodSelect('sms')}
              disabled={isLoading}
              className="w-full flex items-center space-x-3 p-4 rounded-lg border border-white/20 hover:bg-white/5 transition-all disabled:opacity-50"
            >
              <Smartphone className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <p className={`${getTextColor()} font-medium`}>SMS Text Message</p>
                <p className={`${getSubtextClass()} text-sm`}>Send code to {user?.phone || '+1 (555) 123-4567'}</p>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('email')}
              disabled={isLoading}
              className="w-full flex items-center space-x-3 p-4 rounded-lg border border-white/20 hover:bg-white/5 transition-all disabled:opacity-50"
            >
              <Mail className="w-6 h-6 text-green-400" />
              <div className="text-left">
                <p className={`${getTextColor()} font-medium`}>Email</p>
                <p className={`${getSubtextClass()} text-sm`}>Send code to {user?.email || 'user@example.com'}</p>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('app')}
              disabled={isLoading}
              className="w-full flex items-center space-x-3 p-4 rounded-lg border border-white/20 hover:bg-white/5 transition-all disabled:opacity-50"
            >
              <Key className="w-6 h-6 text-purple-400" />
              <div className="text-left">
                <p className={`${getTextColor()} font-medium`}>Authenticator App</p>
                <p className={`${getSubtextClass()} text-sm`}>Google Authenticator, Authy, etc.</p>
              </div>
            </button>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className={getCardClass() + ' w-full max-w-md mx-auto shadow-2xl'}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {method === 'sms' && <Smartphone className="w-8 h-8 text-blue-400" />}
              {method === 'email' && <Mail className="w-8 h-8 text-green-400" />}
              {method === 'app' && <Key className="w-8 h-8 text-purple-400" />}
            </div>
            <h3 className={`text-xl font-semibold ${getTextColor()} mb-2`}>
              Enter Verification Code
            </h3>
            <p className={`${getSubtextClass()} text-sm`}>
              {method === 'sms' && `We sent a 6-digit code to ${user?.phone || '+1 (555) 123-4567'}`}
              {method === 'email' && `We sent a 6-digit code to ${user?.email || 'user@example.com'}`}
              {method === 'app' && 'Enter the 6-digit code from your authenticator app'}
            </p>
            <p className={`text-blue-400 text-sm mt-2`}>
              Time remaining: {formatTime(timeLeft)}
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLightMode ? 'bg-white text-gray-800' : 'bg-white/10 text-white'
                }`}
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={isLoading || timeLeft > 240}
                className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend code {timeLeft > 240 && `(${formatTime(timeLeft - 240)} remaining)`}
              </button>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={handleVerifyCode}
              disabled={isLoading || code.length !== 6}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className={getCardClass() + ' w-full max-w-md mx-auto shadow-2xl'}>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className={`text-xl font-semibold ${getTextColor()} mb-2`}>
              Verification Successful!
            </h3>
            <p className={`${getSubtextClass()} text-sm`}>
              Two-factor authentication is now enabled for your account.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default MultiFactorAuth
