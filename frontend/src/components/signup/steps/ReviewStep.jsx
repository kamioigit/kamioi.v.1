/**
 * ReviewStep - Step 7: Review & Confirm
 * Shows summary of all entered data before final submission
 */

import React, { useState } from 'react'
import { useSignup } from '../SignupContext'
import {
  User, Mail, Phone, Calendar, Shield, MapPin,
  CreditCard, Building2, CheckCircle, Edit2,
  Loader2, AlertCircle, ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ReviewStep = () => {
  const { formData, goToStep, clearSignup } = useSignup()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Helper function to get dashboard path based on account type
  const getDashboardPath = () => {
    const userId = formData.userId
    if (!userId) return '/signup' // Fallback if no userId

    switch (formData.accountType) {
      case 'business':
        return `/business/${userId}/`
      case 'family':
        return `/family/${userId}/`
      default:
        return `/dashboard/${userId}/`
    }
  }

  const handleComplete = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const token = formData.token || localStorage.getItem('kamioi_user_token')

      // Try to mark registration as complete (optional - endpoint may not exist)
      try {
        await fetch(`${apiBaseUrl}/api/user/registration/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: formData.userId,
            completedAt: new Date().toISOString()
          })
        })
      } catch (e) {
        // Endpoint doesn't exist yet - that's okay, continue
        console.log('Registration complete endpoint not available, continuing...')
      }

      // Clear signup state
      clearSignup()

      // Navigate directly to the appropriate dashboard based on account type
      // This bypasses ProtectedRoute since the user token is already in localStorage
      const dashboardPath = getDashboardPath()
      console.log('Registration complete, navigating to:', dashboardPath)
      navigate(dashboardPath)
    } catch (error) {
      console.error('Error completing registration:', error)
      // Even if there's an error, the user data was saved in previous steps
      // So we can still navigate them to the dashboard
      clearSignup()
      const dashboardPath = getDashboardPath()
      navigate(dashboardPath)
    } finally {
      setSubmitting(false)
    }
  }

  const accountTypeLabels = {
    individual: 'Individual',
    family: 'Family',
    business: 'Business'
  }

  const Section = ({ title, icon: Icon, onEdit, stepNumber, children }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {onEdit && (
          <button
            onClick={() => goToStep(stepNumber)}
            className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </button>
        )}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )

  const InfoRow = ({ label, value, masked = false }) => (
    <div className="flex justify-between items-center py-1">
      <span className="text-white/60 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">
        {masked ? '••••' : (value || 'Not provided')}
      </span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Review Your Information</h2>
        <p className="text-white/70">Please review your details before completing registration</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-white/70 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Account Type */}
      <Section title="Account Type" icon={Building2} onEdit stepNumber={1}>
        <InfoRow
          label="Type"
          value={accountTypeLabels[formData.accountType] || formData.accountType}
        />
      </Section>

      {/* Account Credentials */}
      <Section title="Account" icon={Mail} onEdit={false}>
        <InfoRow label="Email" value={formData.email} />
        <InfoRow label="Password" value="Set" masked />
      </Section>

      {/* Personal Information */}
      <Section title="Personal Information" icon={User} onEdit stepNumber={3}>
        <InfoRow label="Name" value={`${formData.firstName} ${formData.lastName}`.trim()} />
        <InfoRow label="Phone" value={formatPhone(formData.phone)} />
        <InfoRow label="Date of Birth" value={formatDate(formData.dateOfBirth)} />
        <InfoRow label="SSN (Last 4)" value={formData.ssnLast4 ? '••••' : 'Not provided'} />
      </Section>

      {/* Address */}
      <Section title="Address" icon={MapPin} onEdit stepNumber={4}>
        <InfoRow label="Street" value={formData.address} />
        <InfoRow label="City" value={formData.city} />
        <InfoRow label="State" value={formData.state} />
        <InfoRow label="ZIP Code" value={formData.zipCode} />
        <InfoRow label="Country" value={formData.country} />
      </Section>

      {/* Subscription */}
      <Section title="Subscription" icon={CreditCard} onEdit stepNumber={5}>
        <InfoRow
          label="Billing Cycle"
          value={formData.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
        />
        {formData.promoCode && (
          <InfoRow label="Promo Code" value={formData.promoCode} />
        )}
      </Section>

      {/* Bank Connection */}
      <Section title="Bank Connection" icon={Shield} onEdit stepNumber={6}>
        {formData.bankConnected ? (
          <>
            <div className="flex items-center space-x-2 py-1">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Bank Connected</span>
            </div>
            {formData.mxData?.institution_name && (
              <InfoRow label="Institution" value={formData.mxData.institution_name} />
            )}
          </>
        ) : (
          <InfoRow label="Status" value="Not connected (can add later)" />
        )}
      </Section>

      {/* Terms notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-white/70 text-sm">
          By completing registration, you agree to our{' '}
          <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
        </p>
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={submitting}
        className="w-full py-4 rounded-xl font-semibold text-lg bg-green-500 hover:bg-green-600 text-white transition-all flex items-center justify-center"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Completing Registration...
          </>
        ) : (
          <>
            Complete Registration
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </button>
    </div>
  )
}

export default ReviewStep
