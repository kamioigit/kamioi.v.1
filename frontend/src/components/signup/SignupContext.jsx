/**
 * SignupContext - State management for the signup wizard
 * Persists to sessionStorage for browser refresh recovery
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SignupContext = createContext(null)

const STORAGE_KEY = 'kamioi_signup_data'

const initialState = {
  // Step 1: Account Type
  accountType: null, // 'individual', 'family', 'business'

  // Step 2: Credentials
  email: '',
  password: '',
  confirmPassword: '',

  // Step 3: Personal Info
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  ssnLast4: '',

  // Step 4: Address
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'USA',

  // Step 5: Subscription
  planId: null,
  billingCycle: 'monthly',
  promoCode: '',

  // Step 6: Bank Connection
  bankConnected: false,
  mxData: null,

  // Family-specific fields
  familyName: '',

  // Business-specific fields
  businessName: '',
  businessType: '',
  ein: '',

  // Metadata
  currentStep: 1,
  completedSteps: [],
  userId: null,
  token: null,
  userGuid: null,
  errors: {},
  isLoading: false
}

export const SignupProvider = ({ children }) => {
  const [formData, setFormData] = useState(initialState)

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Don't restore sensitive data like password
        delete parsed.password
        delete parsed.confirmPassword
        setFormData(prev => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.error('Error loading signup data from storage:', error)
    }
  }, [])

  // Persist to sessionStorage on change (excluding sensitive data)
  useEffect(() => {
    try {
      const toSave = { ...formData }
      delete toSave.password
      delete toSave.confirmPassword
      delete toSave.errors
      delete toSave.isLoading
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (error) {
      console.error('Error saving signup data to storage:', error)
    }
  }, [formData])

  // Update a single field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: null } // Clear error when field is updated
    }))
  }, [])

  // Update multiple fields at once
  const updateFields = useCallback((fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields,
      errors: { ...prev.errors }
    }))
  }, [])

  // Set error for a field
  const setFieldError = useCallback((field, error) => {
    setFormData(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }))
  }, [])

  // Set multiple errors
  const setErrors = useCallback((errors) => {
    setFormData(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors }
    }))
  }, [])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setFormData(prev => ({ ...prev, errors: {} }))
  }, [])

  // Move to next step
  const nextStep = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1,
      completedSteps: [...new Set([...prev.completedSteps, prev.currentStep])]
    }))
  }, [])

  // Move to previous step
  const prevStep = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1)
    }))
  }, [])

  // Go to specific step (only if completed or current)
  const goToStep = useCallback((stepNumber) => {
    setFormData(prev => {
      if (stepNumber <= prev.currentStep || prev.completedSteps.includes(stepNumber)) {
        return { ...prev, currentStep: stepNumber }
      }
      return prev
    })
  }, [])

  // Set loading state
  const setLoading = useCallback((isLoading) => {
    setFormData(prev => ({ ...prev, isLoading }))
  }, [])

  // Store auth data after registration
  const setAuthData = useCallback((userId, token, userGuid) => {
    setFormData(prev => ({
      ...prev,
      userId,
      token,
      userGuid
    }))
  }, [])

  // Reset the entire form
  const resetForm = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setFormData(initialState)
  }, [])

  // Get total steps based on account type
  const getTotalSteps = useCallback(() => {
    return 7 // All account types have 7 steps
  }, [])

  // Check if current step is complete
  const isStepComplete = useCallback((stepNumber) => {
    return formData.completedSteps.includes(stepNumber)
  }, [formData.completedSteps])

  const value = {
    formData,
    updateField,
    updateFields,
    setFieldError,
    setErrors,
    clearErrors,
    nextStep,
    prevStep,
    goToStep,
    setLoading,
    setAuthData,
    resetForm,
    clearSignup: resetForm, // Alias for ReviewStep
    getTotalSteps,
    isStepComplete
  }

  return (
    <SignupContext.Provider value={value}>
      {children}
    </SignupContext.Provider>
  )
}

export const useSignup = () => {
  const context = useContext(SignupContext)
  if (!context) {
    throw new Error('useSignup must be used within a SignupProvider')
  }
  return context
}

export default SignupContext
