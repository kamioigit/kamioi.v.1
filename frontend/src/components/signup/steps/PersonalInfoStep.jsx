/**
 * PersonalInfoStep - Step 3: Personal Information
 * Collects: Name, Phone, Date of Birth, SSN Last 4
 * CRITICAL: This is where DOB and SSN are collected and saved!
 */

import React, { useState } from 'react'
import { useSignup } from '../SignupContext'
import { User, Phone, Calendar, Shield, Loader2 } from 'lucide-react'

const PersonalInfoStep = () => {
  const { formData, updateField, setErrors, nextStep, setLoading } = useSignup()
  const [saving, setSaving] = useState(false)

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 10
  }

  const validateDOB = (dob) => {
    if (!dob) return false
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 18
  }

  const validateSSN = (ssn) => {
    return /^\d{4}$/.test(ssn)
  }

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    updateField('phone', formatted)
  }

  const handleSSNChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    updateField('ssnLast4', value)
  }

  const handleSubmit = async () => {
    // Validate all fields
    const errors = {}

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number'
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required'
    } else if (!validateDOB(formData.dateOfBirth)) {
      errors.dateOfBirth = 'You must be at least 18 years old'
    }
    if (!validateSSN(formData.ssnLast4)) {
      errors.ssnLast4 = 'Please enter the last 4 digits of your SSN'
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }

    setSaving(true)
    setLoading(true)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const token = formData.token || localStorage.getItem('kamioi_user_token')

      // Update profile with personal info INCLUDING DOB and SSN
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone.replace(/\D/g, ''),
        dateOfBirth: formData.dateOfBirth,
        dob: formData.dateOfBirth, // Send both field names for compatibility
        ssnLast4: formData.ssnLast4,
        ssn_last4: formData.ssnLast4 // Send both field names for compatibility
      }
      console.log('PersonalInfoStep - Sending profile data:', profileData)
      console.log('PersonalInfoStep - Token:', token)

      const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()
      console.log('PersonalInfoStep - Response:', data)

      if (data.success || response.ok) {
        console.log('Personal info saved successfully:', {
          dateOfBirth: formData.dateOfBirth,
          ssnLast4: formData.ssnLast4
        })
        nextStep()
      } else {
        setErrors({ firstName: data.error || 'Failed to save personal information' })
      }
    } catch (error) {
      console.error('Error saving personal info:', error)
      setErrors({ firstName: 'An error occurred. Please try again.' })
    } finally {
      setSaving(false)
      setLoading(false)
    }
  }

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    validatePhone(formData.phone) &&
    validateDOB(formData.dateOfBirth) &&
    validateSSN(formData.ssnLast4)

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-white/70">Tell us a bit about yourself</p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            First Name *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="John"
              className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                formData.errors?.firstName ? 'border-red-500' : 'border-white/20'
              }`}
            />
          </div>
          {formData.errors?.firstName && (
            <p className="text-red-400 text-sm mt-1">{formData.errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            placeholder="Doe"
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.lastName ? 'border-red-500' : 'border-white/20'
            }`}
          />
          {formData.errors?.lastName && (
            <p className="text-red-400 text-sm mt-1">{formData.errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="tel"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="(555) 555-5555"
            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.phone ? 'border-red-500' : 'border-white/20'
            }`}
          />
        </div>
        {formData.errors?.phone && (
          <p className="text-red-400 text-sm mt-1">{formData.errors.phone}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Date of Birth *
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.dateOfBirth ? 'border-red-500' : 'border-white/20'
            }`}
          />
        </div>
        {formData.errors?.dateOfBirth && (
          <p className="text-red-400 text-sm mt-1">{formData.errors.dateOfBirth}</p>
        )}
        <p className="text-white/50 text-xs mt-1">You must be at least 18 years old to sign up</p>
      </div>

      {/* SSN Last 4 */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          SSN (Last 4 Digits) *
        </label>
        <div className="relative">
          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="password"
            inputMode="numeric"
            value={formData.ssnLast4}
            onChange={handleSSNChange}
            placeholder="••••"
            maxLength={4}
            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              formData.errors?.ssnLast4 ? 'border-red-500' : 'border-white/20'
            }`}
          />
        </div>
        {formData.errors?.ssnLast4 && (
          <p className="text-red-400 text-sm mt-1">{formData.errors.ssnLast4}</p>
        )}
        <p className="text-white/50 text-xs mt-1">Required for identity verification. We encrypt and protect your data.</p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium text-sm">Your information is secure</p>
            <p className="text-white/60 text-xs mt-1">
              We use bank-level encryption to protect your personal information. Your data is never shared without your consent.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isFormValid || saving}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center ${
          isFormValid && !saving
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
        }`}
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  )
}

export default PersonalInfoStep
