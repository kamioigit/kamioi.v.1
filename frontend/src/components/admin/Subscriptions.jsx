import React, { useState, useEffect } from 'react'
import { createSubscriptionPaymentEntry } from '../../utils/subscriptionAccounting'
import { CreditCard, Users, TrendingUp, DollarSign, Plus, Edit, Trash2, Eye, BarChart3, Brain, Target, RefreshCw, AlertTriangle, CheckCircle, Clock, Calendar, ArrowUp, ArrowDown, Zap, Shield, Star, Crown, Building2, Home, Users2, Grid, List, Settings, User } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../hooks/useNotifications'

// Master feature lists based on actual dashboard functionality
const FEATURE_LISTS = {
  individual: [
    "Dashboard Overview",
    "Transaction Management",
    "Round-up Auto-Investing",
    "Portfolio Overview",
    "Portfolio Analytics & Statistics",
    "AI-Powered Spending Insights",
    "Investment Goals Tracking",
    "Notifications & Alerts",
    "Settings & Preferences",
    "Fractional Share Investing",
    "Merchant-to-Stock Mapping",
    "Secure Brokerage Integration"
  ],
  family: [
    "Family Dashboard Overview",
    "Family Member Management",
    "Family Transaction Management",
    "Shared Portfolio Overview",
    "Family Round-up Auto-Investing",
    "Family Goals & Savings Tracking",
    "AI-Powered Family Insights",
    "Family Notifications",
    "Family Settings & Preferences",
    "Multi-Account Management",
    "Shared Investment Goals",
    "Family Financial Analytics"
  ],
  business: [
    "Business Dashboard Overview",
    "Team Member Management",
    "Business Transaction Management",
    "Business Analytics Dashboard",
    "Financial Reports & Statements",
    "Business Goals & Objectives",
    "Round-up Auto-Investing",
    "Business Portfolio Overview",
    "Business Notifications",
    "Business Settings & Preferences",
    "Multi-User Access Control",
    "Enterprise Financial Tools",
    "Advanced Reporting",
    "Team Performance Tracking"
  ]
}

// Create Plan Form Component
const CreatePlanForm = ({ onClose, onSuccess, isLightMode, getTextColor, getSubtextClass }) => {
  const [formData, setFormData] = useState({
    name: '',
    account_type: 'individual',
    tier: 'basic',
    price_monthly: '',
    price_yearly: '',
    selectedFeatures: [],
    is_active: true
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Get available features for selected account type
  const availableFeatures = FEATURE_LISTS[formData.account_type] || []

  // Handle feature checkbox change
  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter(f => f !== feature)
        : [...prev.selectedFeatures, feature]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          account_type: formData.account_type,
          tier: formData.tier,
          price_monthly: parseFloat(formData.price_monthly),
          price_yearly: parseFloat(formData.price_yearly),
          features: formData.selectedFeatures,
          is_active: formData.is_active
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to create plan')
      }
    } catch (error) {
      setError(`Error creating plan: ${error.message || 'Network error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className={`p-3 rounded-lg ${isLightMode ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400'}`}>
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Plan Name *
          </label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Account Type *
          </label>
          <select 
            required
            value={formData.account_type}
            onChange={(e) => {
              // Reset selected features when account type changes
              setFormData({...formData, account_type: e.target.value, selectedFeatures: []})
            }}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
          >
            <option value="individual">Individual</option>
            <option value="family">Family</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
          Tier *
        </label>
        <select 
          required
          value={formData.tier}
          onChange={(e) => setFormData({...formData, tier: e.target.value})}
          className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
        >
          <option value="basic">Basic</option>
          <option value="starter">Starter</option>
          <option value="plus">Plus</option>
          <option value="premium">Premium</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Monthly Price ($) *
          </label>
          <input 
            type="number" 
            step="0.01" 
            required
            value={formData.price_monthly}
            onChange={(e) => setFormData({...formData, price_monthly: e.target.value})}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Yearly Price ($) *
          </label>
          <input 
            type="number" 
            step="0.01" 
            required
            value={formData.price_yearly}
            onChange={(e) => setFormData({...formData, price_yearly: e.target.value})}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-3`}>
          Features ({formData.selectedFeatures.length} selected)
        </label>
        <div className={`border rounded-lg p-4 max-h-64 overflow-y-auto ${isLightMode ? 'bg-gray-50 border-gray-300' : 'bg-gray-800/50 border-gray-600'}`}>
          <div className="space-y-2">
            {availableFeatures.map((feature) => (
              <label 
                key={feature}
                className={`flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-white/5 ${
                  formData.selectedFeatures.includes(feature) 
                    ? (isLightMode ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/20 border-blue-500/50')
                    : (isLightMode ? 'bg-white border-gray-200' : 'bg-gray-700/50 border-gray-600')
                } border`}
              >
                <input
                  type="checkbox"
                  checked={formData.selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={`text-sm ${isLightMode ? 'text-gray-900' : 'text-gray-200'}`}>
                  {feature}
                </span>
              </label>
            ))}
          </div>
        </div>
        {availableFeatures.length === 0 && (
          <p className={`text-sm mt-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Select an account type to see available features
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
          className="w-4 h-4"
        />
        <label className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button 
          type="button"
          onClick={onClose}
          className={`px-4 py-2 rounded-lg border transition-colors ${isLightMode ? 'border-gray-300 hover:bg-gray-50 text-gray-700' : 'border-gray-600 hover:bg-gray-700 text-gray-200'}`}
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Creating...' : 'Create Plan'}
        </button>
      </div>
    </form>
  )
}

// Edit Plan Form Component
const EditPlanForm = ({ plan, onClose, onSuccess, isLightMode, getTextColor, getSubtextClass }) => {
  const [formData, setFormData] = useState({
    name: plan.name || '',
    account_type: plan.account_type || 'individual',
    tier: plan.tier || 'basic',
    price_monthly: plan.price_monthly || '',
    price_yearly: plan.price_yearly || '',
    selectedFeatures: Array.isArray(plan.features) ? plan.features : [],
    is_active: plan.is_active !== undefined ? plan.is_active : true
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Get available features for selected account type
  const availableFeatures = FEATURE_LISTS[formData.account_type] || []

  // Handle feature checkbox change
  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter(f => f !== feature)
        : [...prev.selectedFeatures, feature]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/plans/${plan.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          account_type: formData.account_type,
          tier: formData.tier,
          price_monthly: parseFloat(formData.price_monthly),
          price_yearly: parseFloat(formData.price_yearly),
          features: formData.selectedFeatures,
          is_active: formData.is_active
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to update plan')
      }
    } catch (error) {
      setError(`Error updating plan: ${error.message || 'Network error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className={`p-3 rounded-lg ${isLightMode ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400'}`}>
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Plan Name *
          </label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Account Type *
          </label>
          <select 
            required
            value={formData.account_type}
            onChange={(e) => {
              // Keep existing selected features if they're still valid for new account type
              const newFeatures = FEATURE_LISTS[e.target.value] || []
              setFormData(prev => ({
                ...prev,
                account_type: e.target.value,
                selectedFeatures: prev.selectedFeatures.filter(f => newFeatures.includes(f))
              }))
            }}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
          >
            <option value="individual">Individual</option>
            <option value="family">Family</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
          Tier *
        </label>
        <select 
          required
          value={formData.tier}
          onChange={(e) => setFormData({...formData, tier: e.target.value})}
          className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
        >
          <option value="basic">Basic</option>
          <option value="starter">Starter</option>
          <option value="plus">Plus</option>
          <option value="premium">Premium</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Monthly Price ($) *
          </label>
          <input 
            type="number" 
            step="0.01" 
            required
            value={formData.price_monthly}
            onChange={(e) => setFormData({...formData, price_monthly: e.target.value})}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Yearly Price ($) *
          </label>
          <input 
            type="number" 
            step="0.01" 
            required
            value={formData.price_yearly}
            onChange={(e) => setFormData({...formData, price_yearly: e.target.value})}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-3`}>
          Features ({formData.selectedFeatures.length} selected)
        </label>
        <div className={`border rounded-lg p-4 max-h-64 overflow-y-auto ${isLightMode ? 'bg-gray-50 border-gray-300' : 'bg-gray-800/50 border-gray-600'}`}>
          <div className="space-y-2">
            {availableFeatures.map((feature) => (
              <label 
                key={feature}
                className={`flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-white/5 ${
                  formData.selectedFeatures.includes(feature) 
                    ? (isLightMode ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/20 border-blue-500/50')
                    : (isLightMode ? 'bg-white border-gray-200' : 'bg-gray-700/50 border-gray-600')
                } border`}
              >
                <input
                  type="checkbox"
                  checked={formData.selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={`text-sm ${isLightMode ? 'text-gray-900' : 'text-gray-200'}`}>
                  {feature}
                </span>
              </label>
            ))}
          </div>
        </div>
        {availableFeatures.length === 0 && (
          <p className={`text-sm mt-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Select an account type to see available features
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
          className="w-4 h-4"
        />
        <label className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button 
          type="button"
          onClick={onClose}
          className={`px-4 py-2 rounded-lg border transition-colors ${isLightMode ? 'border-gray-300 hover:bg-gray-50 text-gray-700' : 'border-gray-600 hover:bg-gray-700 text-gray-200'}`}
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

const Subscriptions = ({ user }) => {
  const { isLightMode, isDarkMode, isCloudMode } = useTheme()
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('overview')
  const [userTab, setUserTab] = useState('all') // New state for user sub-tabs
  const [userCurrentPage, setUserCurrentPage] = useState(1) // Pagination state for users tab
  const [userItemsPerPage] = useState(10) // 10 items per page
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Subscription data state
  const [plans, setPlans] = useState([])
  const [userSubscriptions, setUserSubscriptions] = useState([])
  const [analytics, setAnalytics] = useState({
    mrr: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    arpu: 0,
    mrrChange: 0,
    subscriptionsChange: 0,
    churnChange: 0,
    arpuChange: 0
  })
  const [renewalQueue, setRenewalQueue] = useState([])
  const [promoCodes, setPromoCodes] = useState([])
  
  // UI state
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showEditPlan, setShowEditPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [viewMode, setViewMode] = useState('list') // Only 'list' view supported
  const [showCreatePromo, setShowCreatePromo] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success')
  
  const getTextColor = () => (isLightMode ? 'text-gray-800' : 'text-white')
  const getSubtextClass = () => (isLightMode ? 'text-gray-600' : 'text-gray-400')
  const getCardClass = () => `bg-white/10 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/20 ${isLightMode ? 'bg-opacity-80' : 'bg-opacity-10'}`
  const getButtonClass = () => `px-4 py-2 rounded-lg transition-colors ${isLightMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`
  const getSecondaryButtonClass = () => `px-4 py-2 rounded-lg border transition-colors ${isLightMode ? 'border-gray-300 hover:bg-gray-50 text-gray-700' : 'border-white/20 hover:bg-white/10 text-white'}`

  // Fetch subscription data
  const fetchSubscriptionData = async (signal = null) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      
      // Parallelize API calls for better performance
      const [plansResponse, subscriptionsResponse, analyticsResponse, renewalResponse, promoCodesResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/api/admin/subscriptions/plans`, {
          headers: { 'Authorization': `Bearer ${token}` },
          ...(signal && { signal })
        }),
        fetch(`${apiBaseUrl}/api/admin/subscriptions/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
          ...(signal && { signal })
        }),
        fetch(`${apiBaseUrl}/api/admin/subscriptions/analytics/overview`, {
          headers: { 'Authorization': `Bearer ${token}` },
          ...(signal && { signal })
        }),
        fetch(`${apiBaseUrl}/api/admin/subscriptions/renewal-queue`, {
          headers: { 'Authorization': `Bearer ${token}` },
          ...(signal && { signal })
        }),
        fetch(`${apiBaseUrl}/api/admin/subscriptions/promo-codes`, {
          headers: { 'Authorization': `Bearer ${token}` },
          ...(signal && { signal })
        })
      ])
      
      if (plansResponse?.ok) {
        const plansResult = await plansResponse.json()
        if (plansResult.success) {
          setPlans(plansResult.data || [])
        }
      }

      if (subscriptionsResponse?.ok) {
        const subscriptionsResult = await subscriptionsResponse.json()
        if (subscriptionsResult.success) {
          setUserSubscriptions(subscriptionsResult.data || [])
        }
      }

      if (analyticsResponse?.ok) {
        const analyticsResult = await analyticsResponse.json()
        console.log('[Subscriptions] Analytics response:', JSON.stringify(analyticsResult, null, 2))
        if (analyticsResult.success) {
          const analyticsData = analyticsResult.data || {}
          console.log('[Subscriptions] Setting analytics data:', JSON.stringify(analyticsData, null, 2))
          console.log('[Subscriptions] MRR:', analyticsData.mrr, 'Active:', analyticsData.activeSubscriptions, 'Churn:', analyticsData.churnRate, 'ARPU:', analyticsData.arpu)
          setAnalytics(analyticsData)
        } else {
          console.error('[Subscriptions] Analytics API returned success=false:', analyticsResult.error)
        }
      } else if (analyticsResponse) {
        console.error('[Subscriptions] Analytics API failed:', analyticsResponse.status, analyticsResponse.statusText)
        try {
          const errorText = await analyticsResponse.text()
          console.error('[Subscriptions] Analytics API error response:', errorText)
        } catch (e) {
          // Ignore text parsing errors
        }
      }

      if (renewalResponse?.ok) {
        const renewalResult = await renewalResponse.json()
        if (renewalResult.success) {
          setRenewalQueue(renewalResult.data || [])
        }
      }

      if (promoCodesResponse?.ok) {
        const promoCodesResult = await promoCodesResponse.json()
        if (promoCodesResult.success) {
          setPromoCodes(promoCodesResult.data || [])
        }
      }

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to load subscription data')
        console.error('Error fetching subscription data:', err)
      }
    } finally {
      if (!signal || !signal.aborted) {
        setLoading(false)
        // Dispatch page load completion event for Loading Report
        window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
          detail: { pageId: 'subscriptions' }
        }))
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    fetchSubscriptionData(abortController.signal)
    
    return () => {
      abortController.abort()
    }
  }, [])

  // Helper functions
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%'
    return `${value.toFixed(1)}%`
  }

  // Ensure deferred revenue accounts exist in the database
  const ensureDeferredRevenueAccounts = async () => {
    const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
    
    const accountsToCreate = [
      {
        account_number: '23010',
        account_name: 'Deferred Revenue – Individual Accounts',
        account_type: 'Liability',
        category: 'Liabilities',
        normal_balance: 'Credit'
      },
      {
        account_number: '23020',
        account_name: 'Deferred Revenue – Family Accounts',
        account_type: 'Liability',
        category: 'Liabilities',
        normal_balance: 'Credit'
      },
      {
        account_number: '23030',
        account_name: 'Deferred Revenue – Business Accounts',
        account_type: 'Liability',
        category: 'Liabilities',
        normal_balance: 'Credit'
      },
      {
        account_number: '23040',
        account_name: 'Deferred Revenue – Failed Payments',
        account_type: 'Liability',
        category: 'Liabilities',
        normal_balance: 'Credit'
      }
    ]
    
    let created = 0
    for (const account of accountsToCreate) {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const response = await fetch(`${apiBaseUrl}/api/admin/financial/accounts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(account)
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            created++
            console.log(`✓ Created account ${account.account_number}`)
          } else {
            // Account might already exist, that's okay
            if (result.error && !result.error.includes('already exists')) {
              console.warn(`⚠ Account ${account.account_number}: ${result.error}`)
            }
          }
        }
      } catch (error) {
        console.warn(`⚠ Error creating account ${account.account_number}:`, error.message)
      }
    }
    
    return created
  }

  // Create journal entries for existing subscriptions
  const handleCreateSubscriptionEntries = async () => {
    if (!window.confirm('This will create journal entries for all active subscriptions that don\'t have entries yet. Continue?')) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      
      // First, ensure deferred revenue accounts exist
      console.log('Ensuring deferred revenue accounts exist...')
      await ensureDeferredRevenueAccounts()
      
      // Get all active subscriptions
      const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'active')
      
      console.log('Creating journal entries for subscriptions:', activeSubscriptions.length)
      console.log('Subscriptions:', activeSubscriptions)
      
      if (activeSubscriptions.length === 0) {
        setShowNotification(true)
        setNotificationMessage('No active subscriptions found.')
        setNotificationType('error')
        setTimeout(() => setShowNotification(false), 3000)
        setLoading(false)
        return
      }
      
      let created = 0
      let errors = 0
      const errorDetails = []
      
      for (const subscription of activeSubscriptions) {
        try {
          console.log('Creating entry for subscription:', subscription.id, subscription)
          
          const result = await createSubscriptionPaymentEntry({
            id: subscription.id,
            subscription_id: subscription.id,
            user_id: subscription.user_id,
            user_name: subscription.user_name,
            plan_name: subscription.plan_name,
            account_type: subscription.account_type || 'individual',
            amount: subscription.amount || 0,
            payment_date: subscription.subscription_start_date || subscription.created_at || new Date().toISOString()
          })
          
          console.log('Create entry result:', result)
          
          if (result.success) {
            created++
            console.log(`✓ Created entry for subscription ${subscription.id}`)
          } else {
            errors++
            errorDetails.push(`Subscription ${subscription.id}: ${result.error || 'Unknown error'}`)
            console.error(`✗ Failed to create entry for subscription ${subscription.id}:`, result.error)
          }
        } catch (error) {
          errors++
          errorDetails.push(`Subscription ${subscription.id}: ${error.message}`)
          console.error(`✗ Error creating entry for subscription ${subscription.id}:`, error)
        }
      }
      
      console.log(`Summary: ${created} created, ${errors} errors`)
      
      if (created > 0) {
        setShowNotification(true)
        setNotificationMessage(`Created ${created} journal entry/entries. ${errors > 0 ? errors + ' failed.' : ''}`)
        setNotificationType('success')
        setTimeout(() => {
          setShowNotification(false)
          // Refresh Financial Analytics transactions
          window.dispatchEvent(new Event('refreshFinancialTransactions'))
          // Also refresh subscription data
          fetchSubscriptionData()
        }, 3000)
      } else {
        setShowNotification(true)
        const errorMsg = errors > 0 
          ? `Failed to create entries. Errors: ${errorDetails.join('; ')}`
          : 'No entries created. All subscriptions may already have entries.'
        setNotificationMessage(errorMsg)
        setNotificationType('error')
        setTimeout(() => setShowNotification(false), 5000)
      }
    } catch (error) {
      console.error('Error creating subscription entries:', error)
      setShowNotification(true)
      setNotificationMessage(`Error creating journal entries: ${error.message}`)
      setNotificationType('error')
      setTimeout(() => setShowNotification(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Button handlers
  const handleRefreshData = () => {
    fetchSubscriptionData()
  }

  const handleCreatePlan = () => {
    setShowCreatePlan(true)
  }

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan)
    setShowEditPlan(true)
  }

  const handleSavePlan = async () => {
    // This will be handled by the EditPlanForm component
  }

  const handleDeletePlan = (planId) => {
    setPlanToDelete(planId)
    setShowDeleteModal(true)
  }

  const confirmDeletePlan = async () => {
    if (planToDelete) {
      try {
        const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/plans/${planToDelete}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        let result
        try {
          result = await response.json()
        } catch (e) {
          // If response is not JSON, use status text
          const errorMessage = response.statusText || `HTTP ${response.status}`
          addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: `Error deleting plan: ${errorMessage}`,
            timestamp: new Date()
          })
          console.error('Failed to parse response:', e)
          return
        }
        
        if (response.ok && result.success) {
          setShowDeleteModal(false)
          setPlanToDelete(null)
          fetchSubscriptionData() // Refresh data
          // Show success notification modal
          setNotificationMessage(result.message || 'Plan deleted successfully')
          setNotificationType('success')
          setShowNotification(true)
          // Auto-close after 3 seconds
          setTimeout(() => {
            setShowNotification(false)
          }, 3000)
        } else {
          const errorMessage = result.error || result.message || 'Failed to delete plan'
          setNotificationMessage(errorMessage)
          setNotificationType('error')
          setShowNotification(true)
          console.error('Delete plan error:', result)
        }
      } catch (error) {
        console.error('Error deleting plan:', error)
        setNotificationMessage(`Error deleting plan: ${error.message || 'Network error'}`)
        setNotificationType('error')
        setShowNotification(true)
      }
    }
  }


  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Monthly Recurring Revenue</p>
              <p className={`text-2xl font-bold ${getTextColor()}`}>
                {formatCurrency(analytics.mrr || 0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            {(analytics.mrrChange || 0) >= 0 ? (
              <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-400 mr-1" />
            )}
            <span className={(analytics.mrrChange || 0) >= 0 ? "text-green-400" : "text-red-400"}>
              {(analytics.mrrChange || 0) >= 0 ? '+' : ''}{(analytics.mrrChange || 0).toFixed(1)}%
            </span>
            <span className={`ml-2 ${getSubtextClass()}`}>vs last month</span>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Total Subscriptions</p>
              <p className={`text-2xl font-bold ${getTextColor()}`}>
                {analytics.totalSubscriptions || 0}
              </p>
              <p className={`text-xs ${getSubtextClass()} mt-1`}>
                {analytics.activeSubscriptions || 0} active
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            {(analytics.subscriptionsChange || 0) >= 0 ? (
              <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-400 mr-1" />
            )}
            <span className={(analytics.subscriptionsChange || 0) >= 0 ? "text-green-400" : "text-red-400"}>
              {(analytics.subscriptionsChange || 0) >= 0 ? '+' : ''}{(analytics.subscriptionsChange || 0).toFixed(1)}%
            </span>
            <span className={`ml-2 ${getSubtextClass()}`}>vs last month</span>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Churn Rate</p>
              <p className={`text-2xl font-bold ${getTextColor()}`}>
                {formatPercentage(analytics.churnRate || 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-400" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            {(analytics.churnChange || 0) <= 0 ? (
              <ArrowDown className="w-4 h-4 text-green-400 mr-1" />
            ) : (
              <ArrowUp className="w-4 h-4 text-red-400 mr-1" />
            )}
            <span className={(analytics.churnChange || 0) <= 0 ? "text-green-400" : "text-red-400"}>
              {(analytics.churnChange || 0) >= 0 ? '+' : ''}{(analytics.churnChange || 0).toFixed(1)}%
            </span>
            <span className={`ml-2 ${getSubtextClass()}`}>vs last month</span>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Average Revenue Per User</p>
              <p className={`text-2xl font-bold ${getTextColor()}`}>
                {formatCurrency(analytics.arpu || 0)}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            {(analytics.arpuChange || 0) >= 0 ? (
              <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-400 mr-1" />
            )}
            <span className={(analytics.arpuChange || 0) >= 0 ? "text-green-400" : "text-red-400"}>
              {(analytics.arpuChange || 0) >= 0 ? '+' : ''}{(analytics.arpuChange || 0).toFixed(1)}%
            </span>
            <span className={`ml-2 ${getSubtextClass()}`}>vs last month</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={getCardClass()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Recent Activity</h3>
          <button 
            onClick={handleRefreshData}
            className={getSecondaryButtonClass()}
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>
        <div className="space-y-3">
          {(() => {
            // Build comprehensive activity list from multiple sources
            const activities = []
            
            // Add renewal queue activities
            renewalQueue.forEach((renewal, index) => {
              activities.push({
                id: `renewal-${index}`,
                type: 'renewal',
                title: 'Subscription renewal scheduled',
                description: renewal.user_name || 'User',
                date: renewal.scheduled_date || renewal.created_at || new Date(),
                status: renewal.status,
                icon: 'renewal'
              })
            })
            
            // Add subscription activities from userSubscriptions
            userSubscriptions.forEach((subscription) => {
              const createdDate = subscription.created_at || subscription.subscription_start_date
              const updatedDate = subscription.updated_at || subscription.last_payment_date
              
              // Add activation activity if created recently (within last 30 days)
              if (createdDate) {
                const created = new Date(createdDate)
                const daysSinceCreated = (new Date() - created) / (1000 * 60 * 60 * 24)
                if (daysSinceCreated <= 30) {
                  activities.push({
                    id: `activation-${subscription.id}`,
                    type: 'activation',
                    title: 'New subscription activated',
                    description: `${subscription.user_name || 'User'} - ${subscription.plan_name || 'Plan'}`,
                    date: createdDate,
                    status: subscription.status,
                    amount: subscription.amount,
                    icon: 'activation'
                  })
                }
              }
              
              // Add cancellation activity
              if (subscription.cancellation_requested_at) {
                activities.push({
                  id: `cancellation-${subscription.id}`,
                  type: 'cancellation',
                  title: 'Cancellation requested',
                  description: `${subscription.user_name || 'User'} - ${subscription.plan_name || 'Plan'}`,
                  date: subscription.cancellation_requested_at,
                  status: 'cancelling',
                  icon: 'cancellation'
                })
              }
              
              // Add status change activity if updated recently
              if (updatedDate && createdDate && updatedDate !== createdDate) {
                const updated = new Date(updatedDate)
                const daysSinceUpdated = (new Date() - updated) / (1000 * 60 * 60 * 24)
                if (daysSinceUpdated <= 30) {
                  activities.push({
                    id: `update-${subscription.id}`,
                    type: 'update',
                    title: 'Subscription updated',
                    description: `${subscription.user_name || 'User'} - Status: ${subscription.status}`,
                    date: updatedDate,
                    status: subscription.status,
                    icon: 'update'
                  })
                }
              }
            })
            
            // Sort by date (most recent first)
            activities.sort((a, b) => {
              const dateA = new Date(a.date).getTime()
              const dateB = new Date(b.date).getTime()
              return dateB - dateA
            })
            
            // Show only the 5 most recent
            const recentActivities = activities.slice(0, 5)
            
            if (recentActivities.length === 0) {
              return (
                <div className="text-center py-8">
                  <Clock className={`w-12 h-12 ${getSubtextClass()} mx-auto mb-3`} />
                  <p className={`${getSubtextClass()}`}>No recent activity</p>
                  <p className={`text-xs ${getSubtextClass()} mt-2`}>
                    Activity will appear here when subscriptions are created, updated, or renewed
                  </p>
                </div>
              )
            }
            
            return recentActivities.map((activity) => {
              let iconColor = 'bg-blue-400'
              let statusBadge = null
              
              if (activity.type === 'activation') {
                iconColor = 'bg-green-400'
              } else if (activity.type === 'cancellation') {
                iconColor = 'bg-red-400'
              } else if (activity.type === 'renewal') {
                iconColor = 'bg-blue-400'
              } else if (activity.type === 'update') {
                iconColor = 'bg-yellow-400'
              }
              
              if (activity.status) {
                const statusColors = {
                  'active': 'bg-green-500/20 text-green-400',
                  'cancelling': 'bg-yellow-500/20 text-yellow-400',
                  'cancelled': 'bg-red-500/20 text-red-400',
                  'pending': 'bg-yellow-500/20 text-yellow-400',
                  'success': 'bg-green-500/20 text-green-400',
                  'failed': 'bg-red-500/20 text-red-400'
                }
                const statusText = activity.status.charAt(0).toUpperCase() + activity.status.slice(1)
                statusBadge = (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    statusColors[activity.status] || 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {statusText}
                  </span>
                )
              }
              
              const formatActivityDate = (date) => {
                try {
                  const activityDate = new Date(date)
                  const now = new Date()
                  const diffInHours = (now - activityDate) / (1000 * 60 * 60)
                  
                  if (diffInHours < 1) {
                    return 'Just now'
                  } else if (diffInHours < 24) {
                    return `${Math.floor(diffInHours)} hours ago`
                  } else if (diffInHours < 48) {
                    return 'Yesterday'
                  } else {
                    const diffInDays = Math.floor(diffInHours / 24)
                    if (diffInDays < 7) {
                      return `${diffInDays} days ago`
                    } else {
                      return activityDate.toLocaleDateString()
                    }
                  }
                } catch {
                  return 'Unknown date'
                }
              }
              
              return (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${iconColor} rounded-full`}></div>
                    <div>
                      <p className={`text-sm ${getTextColor()}`}>
                        {activity.title}
                      </p>
                      <p className={`text-xs ${getSubtextClass()}`}>
                        {activity.description}
                        {activity.amount && ` • ${formatCurrency(activity.amount)}`}
                      </p>
                      <p className={`text-xs ${getSubtextClass()} mt-1`}>
                        {formatActivityDate(activity.date)}
                      </p>
                    </div>
                  </div>
                  {statusBadge}
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )

  // Render plans tab
  const renderPlans = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Subscription Plans</h3>
          <button 
            onClick={handleCreatePlan}
            className={getButtonClass()}
          >
            Create Plan
          </button>
        </div>

        {plans.length > 0 ? (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className={`${getCardClass()} flex flex-col space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className={`text-lg font-bold ${getTextColor()}`}>
                        {plan.name}
                      </h4>
                      <p className={`text-sm ${getSubtextClass()}`}>
                        {plan.account_type.charAt(0).toUpperCase() + plan.account_type.slice(1)} • {plan.tier}
                      </p>
                    </div>
                  </div>
                
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTextColor()}`}>
                        {formatCurrency(plan.price_monthly)}/month
                      </div>
                      <div className={`text-sm ${getSubtextClass()}`}>
                        {formatCurrency(plan.price_yearly)}/year
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold text-green-400`}>
                        ${(() => {
                          // Calculate total revenue for this plan
                          const planSubscriptions = userSubscriptions.filter(sub => 
                            sub.plan_name === plan.name && sub.account_type === plan.account_type
                          )
                          const totalRevenue = planSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0)
                          return totalRevenue.toFixed(2)
                        })()}
                      </div>
                      <div className={`text-sm ${getSubtextClass()}`}>
                        {(() => {
                          const planSubscriptions = userSubscriptions.filter(sub => 
                            sub.plan_name === plan.name && sub.account_type === plan.account_type
                          )
                          const activeCount = planSubscriptions.filter(sub => sub.status === 'active').length
                          return `${activeCount} active`
                        })()}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditPlan(plan)}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePlan(plan.id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Features Display */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className={`text-sm font-medium ${getTextColor()} mb-2`}>
                    Features ({Array.isArray(plan.features) ? plan.features.length : 0}):
                  </p>
                  {Array.isArray(plan.features) && plan.features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className={`text-xs px-2 py-1 rounded ${isLightMode ? 'bg-blue-50 text-blue-700' : 'bg-blue-500/20 text-blue-300'}`}>
                          {feature}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${getSubtextClass()}`}>No features specified</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={getCardClass()}>
            <p className={getSubtextClass()}>No subscription plans created yet.</p>
          </div>
        )}
      </div>
    )
  }

  // Calculate user metrics by account type
  const getUserMetrics = () => {
    const allUsers = userSubscriptions
    const individualUsers = allUsers.filter(user => user.account_type === 'individual')
    const familyUsers = allUsers.filter(user => user.account_type === 'family')
    const businessUsers = allUsers.filter(user => user.account_type === 'business')
    
    
    const activeUsers = allUsers.filter(user => user.status === 'active')
    const activeIndividual = individualUsers.filter(user => user.status === 'active')
    const activeFamily = familyUsers.filter(user => user.status === 'active')
    const activeBusiness = businessUsers.filter(user => user.status === 'active')
    
    const totalRevenue = allUsers.reduce((sum, user) => sum + (user.amount || 0), 0)
    const individualRevenue = individualUsers.reduce((sum, user) => sum + (user.amount || 0), 0)
    const familyRevenue = familyUsers.reduce((sum, user) => sum + (user.amount || 0), 0)
    const businessRevenue = businessUsers.reduce((sum, user) => sum + (user.amount || 0), 0)
    
    return {
      all: { users: allUsers, active: activeUsers, revenue: totalRevenue },
      individual: { users: individualUsers, active: activeIndividual, revenue: individualRevenue },
      family: { users: familyUsers, active: activeFamily, revenue: familyRevenue },
      business: { users: businessUsers, active: activeBusiness, revenue: businessRevenue }
    }
  }

  const userMetrics = getUserMetrics()
  const currentMetrics = userMetrics[userTab]
  
  // Pagination logic for users tab
  const totalUserPages = Math.ceil(currentMetrics.users.length / userItemsPerPage)
  const userStartIndex = (userCurrentPage - 1) * userItemsPerPage
  const userEndIndex = userStartIndex + userItemsPerPage
  const paginatedUsers = currentMetrics.users.slice(userStartIndex, userEndIndex)
  
  // Reset to page 1 when user tab changes
  useEffect(() => {
    setUserCurrentPage(1)
  }, [userTab])

  // Render users tab
  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${getTextColor()}`}>User Subscriptions</h3>
        <div className="flex space-x-2">
          <button className={getSecondaryButtonClass()}>
Refresh
          </button>
        </div>
      </div>

      {/* User Sub-tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'all', label: 'All Users', count: userMetrics.all.users.length },
          { id: 'individual', label: 'Individual', count: userMetrics.individual.users.length },
          { id: 'family', label: 'Family', count: userMetrics.family.users.length },
          { id: 'business', label: 'Business', count: userMetrics.business.users.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setUserTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              userTab === tab.id
                ? 'bg-blue-500 text-white'
                : `${getSubtextClass()} hover:${getTextColor()}`
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* User List */}
      <div className={getCardClass()}>
        {paginatedUsers.length === 0 ? (
          <p className={`text-center ${getSubtextClass()} py-8`}>No subscriptions found</p>
        ) : (
          <div className="space-y-4">
            {paginatedUsers.map((subscription) => (
              <div 
                key={subscription.id} 
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedUser(subscription)
                  setShowUserDetails(true)
                }}
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <p className={`font-semibold ${getTextColor()}`}>
                      {subscription.user_name || 'Unknown User'}
                    </p>
                    <p className={`text-sm ${getSubtextClass()}`}>
                      {subscription.plan_name || 'No Plan'} • {subscription.account_type}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${getTextColor()}`}>
                    {formatCurrency(subscription.amount || 0)}
                  </p>
                  <p className={`text-sm ${getSubtextClass()}`}>
                    {subscription.status || 'unknown'}
                    {subscription.auto_renewal === false && (
                      <span className="ml-2 text-yellow-500">• Cancelling</span>
                    )}
                  </p>
                  {subscription.cancellation_requested_at && (
                    <p className="text-xs text-yellow-400 mt-1">
                      Cancellation requested
                    </p>
                  )}
                  {subscription.current_period_end && subscription.auto_renewal === false && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ends: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalUserPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setUserCurrentPage(Math.max(1, userCurrentPage - 1))}
              disabled={userCurrentPage === 1}
              className={`px-3 py-1 rounded ${getSecondaryButtonClass()} disabled:opacity-50`}
            >
              Previous
            </button>
            <span className={`text-sm ${getSubtextClass()}`}>
              Page {userCurrentPage} of {totalUserPages}
            </span>
            <button
              onClick={() => setUserCurrentPage(Math.min(totalUserPages, userCurrentPage + 1))}
              disabled={userCurrentPage === totalUserPages}
              className={`px-3 py-1 rounded ${getSecondaryButtonClass()} disabled:opacity-50`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // Render analytics tab
  const renderAnalytics = () => {
    const userMetrics = getUserMetrics()
    
    // Use all.revenue as total (it should include all account types)
    const calculatedTotalRevenue = userMetrics.all?.revenue || 0
    
    // Calculate ARPU (Average Revenue Per User) from actual data
    const totalUsers = userSubscriptions.length
    const calculatedARPU = totalUsers > 0 ? calculatedTotalRevenue / totalUsers : 0
    
    // Count active subscriptions from actual data
    const activeSubscriptionsCount = userSubscriptions.filter(s => s.status === 'active').length
    
    return (
      <div className="space-y-6">
        {/* Revenue by Account Type */}
        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Revenue by Account Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className={`text-sm ${getSubtextClass()}`}>Individual</p>
              <p className={`text-2xl font-bold ${getTextColor()}`}>
                {formatCurrency(userMetrics.individual?.revenue || 0)}
              </p>
              <p className={`text-xs ${getSubtextClass()} mt-1`}>
                {userMetrics.individual?.users?.length || 0} users
              </p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className={`text-sm ${getSubtextClass()}`}>Family</p>
              <p className={`text-2xl font-bold ${getTextColor()}`}>
                {formatCurrency(userMetrics.family?.revenue || 0)}
              </p>
              <p className={`text-xs ${getSubtextClass()} mt-1`}>
                {userMetrics.family?.users?.length || 0} users
              </p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className={`text-sm ${getSubtextClass()}`}>Business</p>
              <p className={`text-2xl font-bold ${getTextColor()}`}>
                {formatCurrency(userMetrics.business?.revenue || 0)}
              </p>
              <p className={`text-xs ${getSubtextClass()} mt-1`}>
                {userMetrics.business?.users?.length || 0} users
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={getCardClass()}>
            <p className={`text-sm ${getSubtextClass()}`}>Total Revenue</p>
            <p className={`text-2xl font-bold ${getTextColor()}`}>
              {formatCurrency(calculatedTotalRevenue)}
            </p>
          </div>
          <div className={getCardClass()}>
            <p className={`text-sm ${getSubtextClass()}`}>Active Subscriptions</p>
            <p className={`text-2xl font-bold ${getTextColor()}`}>
              {activeSubscriptionsCount}
            </p>
          </div>
          <div className={getCardClass()}>
            <p className={`text-sm ${getSubtextClass()}`}>Total Users</p>
            <p className={`text-2xl font-bold ${getTextColor()}`}>
              {userSubscriptions.length || 0}
            </p>
          </div>
          <div className={getCardClass()}>
            <p className={`text-sm ${getSubtextClass()}`}>Average Revenue Per User</p>
            <p className={`text-2xl font-bold ${getTextColor()}`}>
              {formatCurrency(calculatedARPU)}
            </p>
          </div>
        </div>

        {/* Subscription Status Breakdown */}
        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Subscription Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Active</p>
              <p className={`text-xl font-bold text-green-400`}>
                {userSubscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Trialing</p>
              <p className={`text-xl font-bold text-yellow-400`}>
                {userSubscriptions.filter(s => s.status === 'trialing').length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Cancelled</p>
              <p className={`text-xl font-bold text-red-400`}>
                {userSubscriptions.filter(s => s.status === 'cancelled').length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Past Due</p>
              <p className={`text-xl font-bold text-orange-400`}>
                {userSubscriptions.filter(s => s.status === 'past_due').length}
              </p>
            </div>
          </div>
        </div>

        {/* Plans Performance */}
        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Plans Performance</h3>
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <Target className={`w-12 h-12 ${getSubtextClass()} mx-auto mb-3`} />
              <p className={getSubtextClass()}>No plans created yet</p>
              <p className={`text-xs ${getSubtextClass()} mt-2`}>
                Create a plan in the Plans tab to see performance metrics here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => {
                const planSubscriptions = userSubscriptions.filter(sub => 
                  sub.plan_name === plan.name && sub.account_type === plan.account_type
                )
                const planRevenue = planSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0)
                const activeCount = planSubscriptions.filter(sub => sub.status === 'active').length
                
                return (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div>
                      <p className={`font-semibold ${getTextColor()}`}>{plan.name}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>
                        {plan.account_type.charAt(0).toUpperCase() + plan.account_type.slice(1)} • {plan.tier}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getTextColor()}`}>{formatCurrency(planRevenue)}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>
                        {activeCount} active • {planSubscriptions.length} total
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render cancellations tab
  const renderCancellations = () => {
    // Get pending cancellations (cancellation requested but still active)
    const pendingCancellations = userSubscriptions.filter(sub => 
      sub.cancellation_requested_at && 
      (sub.status === 'active' || sub.auto_renewal === false)
    )
    
    // Get cancelled subscriptions
    const cancelledSubscriptions = userSubscriptions.filter(sub => 
      sub.status === 'cancelled'
    )
    
    // Calculate cancellation metrics
    const totalCancellationRequests = pendingCancellations.length
    const totalCancelled = cancelledSubscriptions.length
    const cancellationRate = userSubscriptions.length > 0 
      ? (totalCancelled / userSubscriptions.length) * 100 
      : 0
    
    // Calculate revenue at risk from pending cancellations
    const revenueAtRisk = pendingCancellations.reduce((sum, sub) => sum + (sub.amount || 0), 0)
    
    // Calculate lost revenue from cancelled subscriptions
    const lostRevenue = cancelledSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0)
    
    // Sort by cancellation date (most recent first)
    const sortedPending = [...pendingCancellations].sort((a, b) => {
      const dateA = new Date(a.cancellation_requested_at || 0).getTime()
      const dateB = new Date(b.cancellation_requested_at || 0).getTime()
      return dateB - dateA
    })
    
    const sortedCancelled = [...cancelledSubscriptions].sort((a, b) => {
      const dateA = new Date(a.cancelled_at || a.cancellation_requested_at || 0).getTime()
      const dateB = new Date(b.cancelled_at || b.cancellation_requested_at || 0).getTime()
      return dateB - dateA
    })
    
    const handleReverseCancellation = async (subscription) => {
      if (!window.confirm(`Are you sure you want to reverse the cancellation for ${subscription.user_name || 'this user'}?`)) return
      
      try {
        setLoading(true)
        const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
        
        // This would need a backend endpoint to reverse cancellation
        // For now, we'll just refresh the data
        await fetchSubscriptionData()
        
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 3000)
      } catch (error) {
        console.error('Error reversing cancellation:', error)
        addNotification({
          type: 'error',
          title: 'Reverse Cancellation Failed',
          message: 'Failed to reverse cancellation. Please try again.',
          timestamp: new Date()
        })
      } finally {
        setLoading(false)
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      try {
        return new Date(dateString).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      } catch {
        return dateString
      }
    }
    
    const getDaysUntilCancellation = (subscription) => {
      if (!subscription.current_period_end) return 'N/A'
      try {
        const endDate = new Date(subscription.current_period_end)
        const now = new Date()
        const diffTime = endDate - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? `${diffDays} days` : 'Expired'
      } catch {
        return 'N/A'
      }
    }
    
    return (
      <div className="space-y-6">
        {/* Cancellation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={getCardClass()}>
            <p className={`text-sm ${getSubtextClass()}`}>Pending Cancellations</p>
            <p className={`text-2xl font-bold text-yellow-400`}>
              {totalCancellationRequests}
            </p>
            <p className={`text-xs ${getSubtextClass()} mt-1`}>
              {formatCurrency(revenueAtRisk)} at risk
            </p>
          </div>
          <div className={getCardClass()}>
            <p className={`text-sm ${getSubtextClass()}`}>Total Cancelled</p>
            <p className={`text-2xl font-bold text-red-400`}>
              {totalCancelled}
            </p>
            <p className={`text-xs ${getSubtextClass()} mt-1`}>
              {formatCurrency(lostRevenue)} lost revenue
            </p>
          </div>
          <div className={getCardClass()}>
            <p className={`text-sm ${getSubtextClass()}`}>Cancellation Rate</p>
            <p className={`text-2xl font-bold ${getTextColor()}`}>
              {formatPercentage(cancellationRate)}
            </p>
            <p className={`text-xs ${getSubtextClass()} mt-1`}>
              {totalCancelled} of {userSubscriptions.length} total
            </p>
          </div>
          <div className={getCardClass()}>
            <p className={`text-sm ${getSubtextClass()}`}>Revenue Impact</p>
            <p className={`text-2xl font-bold text-orange-400`}>
              {formatCurrency(revenueAtRisk + lostRevenue)}
            </p>
            <p className={`text-xs ${getSubtextClass()} mt-1`}>
              Total impact
            </p>
          </div>
        </div>

        {/* Pending Cancellations */}
        <div className={getCardClass()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>
              Pending Cancellations
              <span className={`ml-2 text-sm ${getSubtextClass()}`}>
                ({totalCancellationRequests})
              </span>
            </h3>
          </div>
          
          {sortedPending.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className={`w-12 h-12 ${getSubtextClass()} mx-auto mb-3`} />
              <p className={getSubtextClass()}>No pending cancellations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPending.map((subscription) => (
                <div 
                  key={subscription.id} 
                  className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className={`font-semibold ${getTextColor()}`}>
                          {subscription.user_name || 'Unknown User'}
                        </p>
                        <p className={`text-sm ${getSubtextClass()}`}>
                          {subscription.plan_name || 'No Plan'} • {subscription.account_type}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <p className={`text-xs ${getSubtextClass()}`}>
                            Requested: {formatDate(subscription.cancellation_requested_at)}
                          </p>
                          {subscription.current_period_end && (
                            <p className={`text-xs ${getSubtextClass()}`}>
                              Effective: {formatDate(subscription.current_period_end)} ({getDaysUntilCancellation(subscription)})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTextColor()}`}>
                          {formatCurrency(subscription.amount || 0)}/mo
                        </p>
                        <p className={`text-xs ${getSubtextClass()}`}>
                          {subscription.status || 'active'}
                        </p>
                      </div>
                    </div>
                    {subscription.cancellation_reason && (
                      <div className="mt-2 p-2 bg-white/5 rounded">
                        <p className={`text-xs ${getSubtextClass()}`}>
                          <span className="font-medium">Reason:</span> {subscription.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleReverseCancellation(subscription)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      title="Reverse cancellation"
                    >
                      Reverse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancelled Subscriptions */}
        <div className={getCardClass()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>
              Cancelled Subscriptions
              <span className={`ml-2 text-sm ${getSubtextClass()}`}>
                ({totalCancelled})
              </span>
            </h3>
          </div>
          
          {sortedCancelled.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className={`w-12 h-12 ${getSubtextClass()} mx-auto mb-3`} />
              <p className={getSubtextClass()}>No cancelled subscriptions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCancelled.slice(0, 20).map((subscription) => (
                <div 
                  key={subscription.id} 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className={`font-semibold ${getTextColor()}`}>
                          {subscription.user_name || 'Unknown User'}
                        </p>
                        <p className={`text-sm ${getSubtextClass()}`}>
                          {subscription.plan_name || 'No Plan'} • {subscription.account_type}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <p className={`text-xs ${getSubtextClass()}`}>
                            Cancelled: {formatDate(subscription.cancelled_at || subscription.cancellation_requested_at)}
                          </p>
                          {subscription.current_period_end && (
                            <p className={`text-xs ${getSubtextClass()}`}>
                              Ended: {formatDate(subscription.current_period_end)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTextColor()}`}>
                          {formatCurrency(subscription.amount || 0)}/mo
                        </p>
                        <p className={`text-xs text-red-400`}>
                          Cancelled
                        </p>
                      </div>
                    </div>
                    {subscription.cancellation_reason && (
                      <div className="mt-2 p-2 bg-white/5 rounded">
                        <p className={`text-xs ${getSubtextClass()}`}>
                          <span className="font-medium">Reason:</span> {subscription.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sortedCancelled.length > 20 && (
                <div className="text-center pt-4">
                  <p className={getSubtextClass()}>
                    Showing 20 of {sortedCancelled.length} cancelled subscriptions
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }


  // Render promo codes tab
  const renderPromoCodes = () => {
    const handleCreatePromo = () => setShowCreatePromo(true)
    
    const handleDeletePromo = async (promoId) => {
      if (!window.confirm('Are you sure you want to delete this promo code?')) return
      
      try {
        const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/promo-codes/${promoId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          fetchSubscriptionData()
          addNotification({
            type: 'success',
            title: 'Promo Code Deleted',
            message: 'Promo code deleted successfully',
            timestamp: new Date()
          })
        } else {
          const result = await response.json()
          addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: result.error || 'Failed to delete promo code',
            timestamp: new Date()
          })
        }
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: `Error deleting promo code: ${error.message}`,
          timestamp: new Date()
        })
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Promo Codes</h3>
          <button 
            onClick={handleCreatePromo}
            className={getButtonClass()}
          >
            Create Promo Code
          </button>
        </div>

        {promoCodes.length === 0 ? (
          <div className={getCardClass()}>
            <p className={getSubtextClass()}>No promo codes created yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promoCodes.map((promo) => (
              <div key={promo.id} className={`${getCardClass()} flex items-center justify-between`}>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className={`text-lg font-bold ${getTextColor()}`}>
                        {promo.code}
                      </h4>
                      <p className={`text-sm ${getSubtextClass()}`}>
                        {promo.description || 'No description'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      promo.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className={getSubtextClass()}>Discount Type</p>
                      <p className={getTextColor()}>
                        {promo.discount_type === 'free_months' ? 'Free Months' : 'Percentage'}
                      </p>
                    </div>
                    <div>
                      <p className={getSubtextClass()}>Value</p>
                      <p className={getTextColor()}>
                        {promo.discount_type === 'free_months' 
                          ? `${promo.discount_value} month${promo.discount_value !== 1 ? 's' : ''}`
                          : `${promo.discount_value}%`}
                      </p>
                    </div>
                    <div>
                      <p className={getSubtextClass()}>Uses</p>
                      <p className={getTextColor()}>
                        {promo.current_uses || 0} / {promo.max_uses || '∞'}
                      </p>
                    </div>
                    <div>
                      <p className={getSubtextClass()}>Plan</p>
                      <p className={getTextColor()}>
                        {promo.plan_name || 'All Plans'}
                      </p>
                    </div>
                  </div>
                  {promo.account_type && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        promo.account_type === 'individual' ? 'bg-blue-500/20 text-blue-400' :
                        promo.account_type === 'family' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {promo.account_type.charAt(0).toUpperCase() + promo.account_type.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <button 
                    onClick={() => handleDeletePromo(promo.id)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Create Promo Code Form Component
  const CreatePromoCodeForm = ({ onClose, onSuccess, isLightMode, getTextColor, getSubtextClass, plans }) => {
    const [formData, setFormData] = useState({
      code: '',
      description: '',
      discount_type: 'free_months',
      discount_value: 1,
      plan_id: '',
      account_type: '',
      max_uses: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
      e.preventDefault()
      setSaving(true)
      setError('')

      try {
        const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        
        const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/promo-codes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: formData.code,
            description: formData.description,
            discount_type: formData.discount_type,
            discount_value: parseInt(formData.discount_value),
            plan_id: formData.plan_id || null,
            account_type: formData.account_type || null,
            max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
            valid_from: formData.valid_from || null,
            valid_until: formData.valid_until || null,
            is_active: formData.is_active
          })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          onSuccess()
        } else {
          setError(result.error || 'Failed to create promo code')
        }
      } catch (error) {
        setError(`Error creating promo code: ${error.message || 'Network error'}`)
      } finally {
        setSaving(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className={`p-3 rounded-lg ${isLightMode ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400'}`}>
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
              Promo Code *
            </label>
            <input 
              type="text" 
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
              placeholder="SAVE20"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
              Discount Type *
            </label>
            <select 
              required
              value={formData.discount_type}
              onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
              className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
            >
              <option value="free_months">Free Months</option>
            </select>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Number of Free Months *
          </label>
          <input 
            type="number" 
            required
            min="1"
            value={formData.discount_value}
            onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
            Description
          </label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
            rows="2"
            placeholder="Promo code description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
              Plan (Optional)
            </label>
            <select 
              value={formData.plan_id}
              onChange={(e) => setFormData({...formData, plan_id: e.target.value})}
              className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
            >
              <option value="">All Plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.account_type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
              Account Type (Optional)
            </label>
            <select 
              value={formData.account_type}
              onChange={(e) => setFormData({...formData, account_type: e.target.value})}
              className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
            >
              <option value="">All Account Types</option>
              <option value="individual">Individual</option>
              <option value="family">Family</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-2`}>
              Max Uses (Optional)
            </label>
            <input 
              type="number" 
              min="1"
              value={formData.max_uses}
              onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
              className={`w-full p-2 rounded ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'} border`}
              placeholder="Unlimited if empty"
            />
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <input 
              type="checkbox" 
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-4 h-4"
            />
            <label className={`text-sm ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button 
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${getSecondaryButtonClass()}`}
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded-lg ${getButtonClass()} disabled:opacity-50`}
          >
            {saving ? 'Creating...' : 'Create Promo Code'}
          </button>
        </div>
      </form>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className={getTextColor()}>Loading subscription data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className={`${getTextColor()} mb-4`}>{error}</p>
          <button onClick={fetchSubscriptionData} className={getButtonClass()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${getTextColor()}`}>Subscriptions</h1>
          <p className={`text-lg ${getSubtextClass()}`}>
            Manage subscription plans, users, and analytics
          </p>
        </div>
        <button 
          onClick={handleRefreshData}
          className={getSecondaryButtonClass()}
        >
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'plans', label: 'Plans' },
          { id: 'users', label: 'Users' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'cancellations', label: 'Cancellations' },
          { id: 'promo-codes', label: 'Promo Codes' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : `${getTextColor()} hover:bg-white/10`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'plans' && renderPlans()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'cancellations' && renderCancellations()}
      {activeTab === 'promo-codes' && renderPromoCodes()}

      {/* Create Plan Modal */}
      {showCreatePlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isLightMode ? 'bg-white/95 backdrop-blur-xl border-gray-300' : 'bg-gray-800/95 backdrop-blur-xl border-gray-700'} border rounded-2xl p-6 max-w-2xl w-full shadow-2xl`}>
            <h3 className={`text-xl font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'} mb-4`}>Create Subscription Plan</h3>
            <CreatePlanForm 
              onClose={() => setShowCreatePlan(false)}
              onSuccess={() => {
                setShowCreatePlan(false)
                fetchSubscriptionData()
              }}
              isLightMode={isLightMode}
              getTextColor={getTextColor}
              getSubtextClass={getSubtextClass}
            />
          </div>
        </div>
      )}

      {/* Create Promo Code Modal */}
      {showCreatePromo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isLightMode ? 'bg-white/95 backdrop-blur-xl border-gray-300' : 'bg-gray-800/95 backdrop-blur-xl border-gray-700'} border rounded-2xl p-6 max-w-2xl w-full shadow-2xl`}>
            <h3 className={`text-xl font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'} mb-4`}>Create Promo Code</h3>
            <CreatePromoCodeForm 
              onClose={() => setShowCreatePromo(false)}
              onSuccess={() => {
                setShowCreatePromo(false)
                fetchSubscriptionData()
              }}
              isLightMode={isLightMode}
              getTextColor={getTextColor}
              getSubtextClass={getSubtextClass}
              plans={plans}
            />
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditPlan && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isLightMode ? 'bg-white/95 backdrop-blur-xl border-gray-300' : 'bg-gray-800/95 backdrop-blur-xl border-gray-700'} border rounded-2xl p-6 max-w-2xl w-full shadow-2xl`}>
            <h3 className={`text-xl font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'} mb-4`}>Edit Subscription Plan</h3>
            <EditPlanForm 
              plan={selectedPlan}
              onClose={() => {
                setShowEditPlan(false)
                setSelectedPlan(null)
              }}
              onSuccess={() => {
                setShowEditPlan(false)
                setSelectedPlan(null)
                fetchSubscriptionData()
              }}
              isLightMode={isLightMode}
              getTextColor={getTextColor}
              getSubtextClass={getSubtextClass}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${isLightMode ? 'bg-white/95 backdrop-blur-xl border-gray-300' : 'bg-gray-800/95 backdrop-blur-xl border-gray-700'} border rounded-2xl p-6 max-w-md w-full shadow-2xl`}>
            <div className="mb-4">
              <h3 className={`text-xl font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>Delete Subscription Plan</h3>
            </div>
            <p className={`${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-6`}>
              Are you sure you want to delete this subscription plan? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowDeleteModal(false)
                  setPlanToDelete(null)
                }}
                className={`px-4 py-2 rounded-lg border transition-colors ${isLightMode ? 'border-gray-300 hover:bg-gray-50 text-gray-700' : 'border-gray-600 hover:bg-gray-700 text-gray-200'}`}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeletePlan}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Notification Modal - Glass Effect */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity duration-300">
          <div className={`${isLightMode ? 'bg-white/90 backdrop-blur-xl border-gray-300' : 'bg-gray-800/90 backdrop-blur-xl border-gray-700'} border rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100`}>
            <div className="flex items-center space-x-4">
              {notificationType === 'success' ? (
                <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'} mb-1`}>
                  {notificationType === 'success' ? 'Success' : 'Error'}
                </h3>
                <p className={`${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  {notificationMessage}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors font-medium ${
                  notificationType === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Subscriptions
