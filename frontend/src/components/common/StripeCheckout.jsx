/**
 * Stripe Checkout Component
 * Reusable component for Stripe subscription checkout
 * Can be used in registration page and user dashboard settings
 */

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useAuth } from '../../context/AuthContext'
import { CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

const StripeCheckout = ({ 
  planId, 
  billingCycle = 'monthly',
  onSuccess,
  onCancel,
  buttonText = 'Subscribe Now',
  className = '',
  showPlanDetails = true
}) => {
  const { user: authUser, token: authToken } = useAuth()
  
  // Fallback to localStorage if useAuth doesn't provide token/user
  // Check multiple possible token locations for business users
  const getToken = () => {
    if (authToken) return authToken
    // Check all possible token keys
    const tokenKeys = [
      'kamioi_user_token',
      'kamioi_business_token', 
      'kamioi_family_token',
      'authToken'
    ]
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key)
      if (token) {
        console.log(`StripeCheckout - Found token in ${key}`)
        return token
      }
    }
    console.warn('StripeCheckout - No token found in any location')
    return null
  }
  
  const getUser = () => {
    if (authUser) return authUser
    // Check all possible user keys
    const userKeys = [
      'kamioi_user',
      'kamioi_business_user',
      'kamioi_family_user'
    ]
    for (const key of userKeys) {
      try {
        const userStr = localStorage.getItem(key)
        if (userStr) {
          const parsed = JSON.parse(userStr)
          if (parsed && parsed.id) {
            console.log(`StripeCheckout - Found user in ${key}`)
            return parsed
          }
        }
      } catch (e) {
        console.error(`Error parsing user from ${key}:`, e)
      }
    }
    console.warn('StripeCheckout - No user found in any location')
    return null
  }
  
  const token = getToken()
  const user = getUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stripePublishableKey, setStripePublishableKey] = useState(null)
  const [planDetails, setPlanDetails] = useState(null)

  // Get Stripe config on mount
  useEffect(() => {
    fetchStripeConfig()
    if (planId && token && user) {
      fetchPlanDetails()
    }
  }, [planId, token, user])
  
  // Debug: Log auth state
  useEffect(() => {
    console.log('StripeCheckout - Auth state:', {
      hasAuthUser: !!authUser,
      hasAuthToken: !!authToken,
      hasToken: !!token,
      hasUser: !!user,
      userAccountType: user?.account_type || user?.dashboard,
      userId: user?.id
    })
  }, [authUser, authToken, token, user])

  const fetchStripeConfig = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/stripe/config`)
      const data = await response.json()
      if (data.success) {
        setStripePublishableKey(data.publishable_key)
      }
    } catch (err) {
      console.error('Error fetching Stripe config:', err)
      setError('Failed to load payment system. Please refresh the page.')
    }
  }

  const fetchPlanDetails = async () => {
    try {
      // Determine account type from user data
      const accountType = user?.account_type || user?.dashboard || 'user'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const endpoint = accountType === 'business' 
        ? `${apiBaseUrl}/api/business/subscriptions/plans`
        : `${apiBaseUrl}/api/user/subscriptions/plans`
      
      const response = await fetch(endpoint, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      })
      const data = await response.json()
      if (data.success && data.data) {
        const plan = data.data.find(p => p.id === planId)
        if (plan) {
          setPlanDetails(plan)
        }
      }
    } catch (err) {
      console.error('Error fetching plan details:', err)
    }
  }

  const handleCheckout = async () => {
    if (!planId) {
      setError('Please select a subscription plan')
      return
    }

    // Enhanced auth check with logging
    if (!token) {
      console.error('StripeCheckout handleCheckout - No token:', {
        authToken,
        localStorage_keys: ['kamioi_user_token', 'kamioi_business_token', 'kamioi_family_token', 'authToken'].map(k => ({
          key: k,
          value: localStorage.getItem(k) ? 'EXISTS' : 'NOT FOUND'
        }))
      })
      setError('Please log in to subscribe')
      return
    }

    if (!user) {
      console.error('StripeCheckout handleCheckout - No user:', {
        authUser,
        localStorage_keys: ['kamioi_user', 'kamioi_business_user', 'kamioi_family_user'].map(k => ({
          key: k,
          value: localStorage.getItem(k) ? 'EXISTS' : 'NOT FOUND'
        }))
      })
      setError('Please log in to subscribe')
      return
    }
    
    console.log('StripeCheckout handleCheckout - Proceeding with checkout:', {
      userId: user.id,
      userEmail: user.email,
      accountType: user.account_type || user.dashboard,
      planId: planId
    })

    setLoading(true)
    setError(null)

    try {
      // Determine account type from user data
      const accountType = user?.account_type || user?.dashboard || 'user'
      
      // Create checkout session
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
          account_type: accountType // Pass account type to backend
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getPlanPrice = () => {
    if (!planDetails) return null
    return billingCycle === 'monthly' 
      ? planDetails.price_monthly 
      : planDetails.price_yearly
  }

  if (!stripePublishableKey) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading payment system...</span>
      </div>
    )
  }

  return (
    <div className={`stripe-checkout ${className}`}>
      {showPlanDetails && planDetails && (
        <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">{planDetails.name}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {formatPrice(getPlanPrice())}
            </span>
            <span className="text-gray-400">
              /{billingCycle === 'monthly' ? 'month' : 'year'}
            </span>
          </div>
          {planDetails.features && planDetails.features.length > 0 && (
            <ul className="mt-3 space-y-1">
              {planDetails.features.map((feature, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {!token || !user ? (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">Please log in to subscribe</span>
        </div>
      ) : null}
      
      <button
        onClick={handleCheckout}
        disabled={loading || !planId || !token || !user}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          loading || !planId || !token || !user
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      <p className="mt-3 text-xs text-gray-400 text-center">
        Secure payment powered by Stripe
      </p>
    </div>
  )
}

export default StripeCheckout

