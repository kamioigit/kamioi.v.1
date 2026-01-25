/**
 * CredentialsStep - Step 2: Email and Password
 * Creates the user account via /api/user/auth/register
 */

import React, { useState } from 'react'
import { useSignup } from '../SignupContext'
import { Mail, Lock, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'

const CredentialsStep = () => {
  const { formData, updateField, setErrors, setAuthData, nextStep, setLoading } = useSignup()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(null)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
    if (!/[0-9]/.test(password)) errors.push('One number')
    return errors
  }

  const passwordErrors = validatePassword(formData.password)
  const isPasswordValid = passwordErrors.length === 0
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) {
      setEmailAvailable(null)
      return
    }

    setEmailChecking(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      setEmailAvailable(data.available !== false)
    } catch (error) {
      console.error('Error checking email:', error)
      setEmailAvailable(null)
    } finally {
      setEmailChecking(false)
    }
  }

  const handleEmailChange = (e) => {
    const email = e.target.value
    updateField('email', email)
    setEmailAvailable(null)
  }

  const handleEmailBlur = () => {
    if (formData.email) {
      checkEmailAvailability(formData.email)
    }
  }

  const handleSubmit = async () => {
    // Validate
    const errors = {}
    if (!formData.email || !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (emailAvailable === false) {
      errors.email = 'This email is already registered'
    }
    if (!isPasswordValid) {
      errors.password = 'Password does not meet requirements'
    }
    if (!passwordsMatch) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }

    setLoading(true)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          accountType: formData.accountType,
          name: '', // Will be set in PersonalInfoStep
          planId: formData.planId
        })
      })

      const data = await response.json()

      if (data.success) {
        // Store auth data
        const token = data.token || `user_token_${data.userId}`
        localStorage.setItem('kamioi_user_token', token)
        setAuthData(data.userId, token, data.userGuid)
        nextStep()
      } else {
        setErrors({ email: data.error || 'Registration failed. Please try again.' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ email: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = validateEmail(formData.email) && isPasswordValid && passwordsMatch && emailAvailable !== false

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-white/70">Enter your email and create a secure password</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="email"
            value={formData.email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="you@example.com"
            className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.email ? 'border-red-500' : 'border-white/20'
            }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {emailChecking && <Loader2 className="w-5 h-5 text-white/50 animate-spin" />}
            {!emailChecking && emailAvailable === true && <Check className="w-5 h-5 text-green-400" />}
            {!emailChecking && emailAvailable === false && <X className="w-5 h-5 text-red-400" />}
          </div>
        </div>
        {formData.errors?.email && (
          <p className="text-red-400 text-sm mt-1">{formData.errors.email}</p>
        )}
        {emailAvailable === false && !formData.errors?.email && (
          <p className="text-red-400 text-sm mt-1">This email is already registered</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Create a strong password"
            className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.password ? 'border-red-500' : 'border-white/20'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password requirements */}
        {formData.password && (
          <div className="mt-2 space-y-1">
            {[
              { text: 'At least 8 characters', valid: formData.password.length >= 8 },
              { text: 'One uppercase letter', valid: /[A-Z]/.test(formData.password) },
              { text: 'One lowercase letter', valid: /[a-z]/.test(formData.password) },
              { text: 'One number', valid: /[0-9]/.test(formData.password) }
            ].map((req, index) => (
              <div key={index} className="flex items-center text-sm">
                {req.valid ? (
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                ) : (
                  <X className="w-4 h-4 text-white/40 mr-2" />
                )}
                <span className={req.valid ? 'text-green-400' : 'text-white/50'}>{req.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.confirmPassword ? 'border-red-500' : 'border-white/20'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {formData.confirmPassword && (
          <div className="flex items-center mt-2 text-sm">
            {passwordsMatch ? (
              <>
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-green-400">Passwords match</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-red-400 mr-2" />
                <span className="text-red-400">Passwords do not match</span>
              </>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isFormValid || formData.isLoading}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center ${
          isFormValid && !formData.isLoading
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
        }`}
      >
        {formData.isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Creating Account...
          </>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  )
}

export default CredentialsStep
