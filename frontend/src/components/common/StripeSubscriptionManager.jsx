/**
 * Stripe Subscription Manager Component
 * For user dashboard settings - manage existing subscriptions
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CreditCard, Loader2, AlertCircle, Settings, ExternalLink, CheckCircle, User } from 'lucide-react'

const StripeSubscriptionManager = ({ onSubscriptionUpdate }) => {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  const fetchCurrentSubscription = useCallback(async () => {
    try {
      // Get token from context or localStorage fallback
      const authToken = token || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token') || localStorage.getItem('authToken')
      
      if (!authToken) {
        console.warn('No auth token available for subscription fetch')
        setLoadingSubscription(false)
        return
      }
      
      // Try user endpoint first, then business endpoint
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      let response = await fetch(`${apiBaseUrl}/api/user/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      // If 404, try business endpoint
      if (!response.ok && response.status === 404) {
        response = await fetch(`${apiBaseUrl}/api/business/subscriptions/current`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
      }
      
      const data = await response.json()
      if (data.success && data.subscription) {
        setSubscription(data.subscription)
      } else if (data.success === false && data.code === 'NO_CUSTOMER') {
        // User doesn't have a Stripe customer yet - no subscription to manage
        setSubscription(null)
      }
    } catch (err) {
      console.error('Error fetching subscription:', err)
    } finally {
      setLoadingSubscription(false)
    }
  }, [token])

  useEffect(() => {
    // Only fetch if we have a token (from context or localStorage)
    const authToken = token || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token') || localStorage.getItem('authToken')
    if (authToken) {
      fetchCurrentSubscription()
    } else {
      setLoadingSubscription(false)
    }
  }, [token, fetchCurrentSubscription])

  const handleManageSubscription = async () => {
    // Get token from context or localStorage fallback
    const authToken = token || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token') || localStorage.getItem('authToken')
    
    if (!authToken) {
      setError('Please log in')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Determine account type from user data or try both endpoints
      const accountType = user?.account_type || user?.dashboard || 'user'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const endpoint = `${apiBaseUrl}/api/stripe/create-portal-session`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Handle specific error cases
        if (data.code === 'NO_CUSTOMER') {
          throw new Error('You need to subscribe to a plan first before managing your subscription.')
        }
        throw new Error(data.error || 'Failed to create portal session')
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL received')
      }
    } catch (err) {
      console.error('Portal error:', err)
      setError(err.message || 'Failed to open subscription management. Please try again.')
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', label: 'Active' },
      trialing: { color: 'blue', label: 'Trial' },
      past_due: { color: 'yellow', label: 'Past Due' },
      canceled: { color: 'red', label: 'Canceled' },
      unpaid: { color: 'red', label: 'Unpaid' }
    }
    
    const config = statusConfig[status] || { color: 'gray', label: status }
    return (
      <span className={`px-2 py-1 rounded text-xs bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30`}>
        {config.label}
      </span>
    )
  }

  if (loadingSubscription) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-400">Loading subscription...</span>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Subscription</h3>
          <p className="text-gray-400 mb-4">
            You don't have an active subscription. Subscribe to access premium features.
          </p>
          {onSubscriptionUpdate && (
            <button
              onClick={() => onSubscriptionUpdate('subscribe')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              View Plans
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Subscription Management</span>
          </h3>
          {getStatusBadge(subscription.status)}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Plan</label>
            <p className="text-white font-semibold">{subscription.plan_name || 'N/A'}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400">Billing Cycle</label>
            <p className="text-white capitalize">{subscription.billing_cycle || 'monthly'}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400">Amount</label>
            <p className="text-white font-semibold">
              {formatPrice(subscription.amount || 0)} / {subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
            </p>
          </div>

          {subscription.current_period_end && (
            <div>
              <label className="text-sm text-gray-400">
                {subscription.status === 'canceled' ? 'Expires' : 'Renews'} On
              </label>
              <p className="text-white">{formatDate(subscription.current_period_end)}</p>
            </div>
          )}

          {subscription.next_billing_date && subscription.status !== 'canceled' && (
            <div>
              <label className="text-sm text-gray-400">Next Billing Date</label>
              <p className="text-white">{formatDate(subscription.next_billing_date)}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleManageSubscription}
          disabled={loading}
          className={`mt-6 w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all ${
            loading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <ExternalLink className="w-5 h-5" />
              <span>Manage Subscription</span>
            </>
          )}
        </button>

        <p className="mt-3 text-xs text-gray-400 text-center">
          Manage payment methods, update billing, and cancel your subscription
        </p>
      </div>
    </div>
  )
}

export default StripeSubscriptionManager

