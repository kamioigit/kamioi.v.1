/**
 * SubscriptionStep - Step 5: Subscription Plan Selection
 * Shows only the plan for the selected account type
 */

import React, { useState, useEffect } from 'react'
import { useSignup } from '../SignupContext'
import { Check, Loader2, Tag } from 'lucide-react'

const SubscriptionStep = () => {
  const { formData, updateField, nextStep, setLoading } = useSignup()
  const [plan, setPlan] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(null)
  const [applyingPromo, setApplyingPromo] = useState(false)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const response = await fetch(`${apiBaseUrl}/api/user/subscriptions/plans`)
        if (response.ok) {
          const data = await response.json()
          const plans = data.plans || []
          const matchingPlan = plans.find(p => p.account_type === formData.accountType)
          if (matchingPlan) {
            setPlan(matchingPlan)
            updateField('planId', matchingPlan.id)
          }
        }
      } catch (error) {
        console.error('Error fetching plan:', error)
      } finally {
        setLoadingPlan(false)
      }
    }
    fetchPlan()
  }, [formData.accountType])

  const handleApplyPromo = async () => {
    if (!formData.promoCode) return

    setApplyingPromo(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/public/promo-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promo_code: formData.promoCode,
          plan_id: plan?.id,
          account_type: formData.accountType
        })
      })
      const data = await response.json()
      if (data.success) {
        setPromoApplied(true)
        setPromoDiscount(data.promo_code)
      } else {
        setPromoApplied(false)
        setPromoDiscount(null)
        alert(data.error || 'Invalid promo code')
      }
    } catch (error) {
      console.error('Error validating promo:', error)
    } finally {
      setApplyingPromo(false)
    }
  }

  const getPrice = () => {
    if (!plan) return 0
    const basePrice = formData.billingCycle === 'yearly'
      ? (plan.price_yearly || plan.price * 10)
      : (plan.price_monthly || plan.price)

    if (promoDiscount) {
      if (promoDiscount.discount_type === 'percentage') {
        return basePrice * (1 - promoDiscount.discount_value / 100)
      } else {
        return Math.max(0, basePrice - promoDiscount.discount_value)
      }
    }
    return basePrice
  }

  const handleContinue = () => {
    nextStep()
  }

  if (loadingPlan) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-white/70">Loading subscription plan...</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">No subscription plan available for this account type.</p>
        <button
          onClick={handleContinue}
          className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold"
        >
          Continue Anyway
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Subscription</h2>
        <p className="text-white/70">Review your {formData.accountType} plan</p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="bg-white/10 rounded-xl p-1 flex">
          <button
            onClick={() => updateField('billingCycle', 'monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              formData.billingCycle === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => updateField('billingCycle', 'yearly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              formData.billingCycle === 'yearly'
                ? 'bg-blue-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plan Card */}
      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500 rounded-2xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            <p className="text-white/70 text-sm">{plan.description || `Perfect for ${formData.accountType} accounts`}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              ${getPrice().toFixed(2)}
            </div>
            <div className="text-white/70 text-sm">
              /{formData.billingCycle === 'yearly' ? 'year' : 'month'}
            </div>
            {promoApplied && (
              <div className="text-green-400 text-xs mt-1">
                {promoDiscount.discount_type === 'percentage'
                  ? `${promoDiscount.discount_value}% off applied!`
                  : `$${promoDiscount.discount_value} off applied!`}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-white/70 text-sm mb-3">Includes:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.features.slice(0, 8).map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-white/80">
                  <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.features.length > 8 && (
              <p className="text-white/50 text-xs mt-2">+ {plan.features.length - 8} more features</p>
            )}
          </div>
        )}
      </div>

      {/* Promo Code */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Promo Code (Optional)
        </label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={formData.promoCode}
              onChange={(e) => {
                updateField('promoCode', e.target.value.toUpperCase())
                setPromoApplied(false)
                setPromoDiscount(null)
              }}
              placeholder="Enter promo code"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            onClick={handleApplyPromo}
            disabled={!formData.promoCode || applyingPromo}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              formData.promoCode && !applyingPromo
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white/5 text-white/50 cursor-not-allowed'
            }`}
          >
            {applyingPromo ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
          </button>
        </div>
        {promoApplied && (
          <p className="text-green-400 text-sm mt-1">Promo code applied successfully!</p>
        )}
      </div>

      {/* 14-day trial notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
        <p className="text-blue-400 font-medium">Start with a 14-day free trial</p>
        <p className="text-white/60 text-sm mt-1">No charge until your trial ends. Cancel anytime.</p>
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-4 rounded-xl font-semibold text-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
      >
        Continue
      </button>
    </div>
  )
}

export default SubscriptionStep
