import React, { useState, useEffect } from 'react'
import { Settings, User, Shield, Bell, Database, Save, RefreshCw, CheckCircle, AlertTriangle, Info, Upload, Download, Link, Plus, Trash2, CreditCard, DollarSign, Play, Square, X, Building2, Phone } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useModal } from '../../context/ModalContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useAuth } from '../../context/AuthContext'
import MXConnectWidget from '../common/MXConnectWidget'
import StripeSubscriptionManager from '../common/StripeSubscriptionManager'
import StripeCheckout from '../common/StripeCheckout'

// Demo data constants for demo mode
const DEMO_BANK_CONNECTIONS = [
  {
    id: 'demo-bank-1',
    bank_name: 'Chase Business',
    institution_name: 'Chase',
    account_name: 'Business Checking',
    account_type: 'checking',
    masked_account_number: '4523',
    status: 'active'
  },
  {
    id: 'demo-bank-2',
    bank_name: 'Bank of America',
    institution_name: 'Bank of America',
    account_name: 'Business Savings',
    account_type: 'savings',
    masked_account_number: '7891',
    status: 'active'
  }
]

const DEMO_SUBSCRIPTION_PLANS = [
  {
    id: 'plan-starter',
    name: 'Business Starter',
    tier: 'Starter',
    price_monthly: 9.99,
    price_yearly: 99.99,
    features: ['Up to 5 team members', 'Basic analytics', 'Email support']
  },
  {
    id: 'plan-pro',
    name: 'Business Pro',
    tier: 'Professional',
    price_monthly: 29.99,
    price_yearly: 299.99,
    features: ['Up to 25 team members', 'Advanced analytics', 'Priority support', 'Custom reports']
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    tier: 'Enterprise',
    price_monthly: 99.99,
    price_yearly: 999.99,
    features: ['Unlimited team members', 'Full analytics suite', 'Dedicated support', 'API access', 'Custom integrations']
  }
]

const DEMO_CURRENT_SUBSCRIPTION = {
  id: 'demo-sub-1',
  plan_name: 'Business Pro',
  plan_id: 'plan-pro',
  status: 'active',
  billing_cycle: 'monthly',
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  price: 29.99
}

const BusinessSettings = ({ user }) => {
  // Check if in demo mode
  const isDemoMode = localStorage.getItem('kamioi_demo_mode') === 'true'
  const { showSuccessModal, showErrorModal, showConfirmationModal } = useModal()
  const { addNotification } = useNotifications()
  const { refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Settings state
  const [settings, setSettings] = useState({
    roundup_multiplier: 1.0,
    auto_invest: false,
    notifications: false,
    email_alerts: false,
    theme: 'dark',
    business_sharing: false,
    budget_alerts: false,
    department_limits: {}
  })
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    company_name: '',
    phone: '',
    address: ''
  })
  const [companyLogo, setCompanyLogo] = useState(() => {
    const userId = user?.id || user?.account_number
    if (userId) {
      return localStorage.getItem(`company_logo_${userId}`) || null
    }
    return null
  })
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const logoInputRef = React.useRef(null)

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addNotification({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select an image file'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addNotification({
        type: 'error',
        title: 'File Too Large',
        message: 'Image size must be less than 5MB'
      })
      return
    }

    setIsUploadingLogo(true)

    try {
      // Compress image similar to ProfileAvatar
      const compressImage = (file, maxWidth = 200, maxHeight = 200, quality = 0.8) => {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const img = new Image()
          
          img.onload = () => {
            let { width, height } = img
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
            }
            
            width = Math.max(width, 50)
            height = Math.max(height, 50)
            
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)
            const compressedDataUrl = canvas.toDataURL('image/png', quality)
            resolve(compressedDataUrl)
          }
          
          img.onerror = () => reject(new Error('Failed to load image'))
          img.src = URL.createObjectURL(file)
        })
      }

      const compressedLogo = await compressImage(file)
      const userId = user?.id || user?.account_number
      const storageKey = `company_logo_${userId}`
      
      // Save to localStorage
      localStorage.setItem(storageKey, compressedLogo)
      setCompanyLogo(compressedLogo)
      
      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent('kamioi:company-logo-updated', {
        detail: { logo: compressedLogo, userId }
      }))
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Logo Updated',
        message: 'Company logo has been updated successfully.'
      })
    } catch (error) {
      console.error('Error uploading logo:', error)
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload logo. Please try again.'
      })
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = () => {
    if (window.confirm('Are you sure you want to remove the company logo?')) {
      const userId = user?.id || user?.account_number
      const storageKey = `company_logo_${userId}`
      localStorage.removeItem(storageKey)
      setCompanyLogo(null)
      
      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent('kamioi:company-logo-updated', {
        detail: { logo: null, userId }
      }))
    }
  }
  
  const [security, setSecurity] = useState({
    two_factor_enabled: false,
    password_last_changed: null,
    login_notifications: true,
    session_timeout: 30,
    api_access: false,
    ip_whitelist: []
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    transaction_alerts: true,
    budget_alerts: true,
    investment_alerts: true,
    team_updates: true,
    weekly_reports: true
  })
  
  const [dataSettings, setDataSettings] = useState({
    auto_backup: true,
    backup_frequency: 'daily',
    data_retention_days: 365,
    export_format: 'csv',
    data_sharing: false,
    analytics_tracking: true
  })
  const [showBankModal, setShowBankModal] = useState(false)
  const [bankConnections, setBankConnections] = useState([])
  const [showRoundUpModal, setShowRoundUpModal] = useState(false)
  
  // Debug logging for bank connections state
  useEffect(() => {
    console.log('🔍 BusinessSettings: bankConnections state changed, count:', bankConnections.length, 'connections:', bankConnections);
  }, [bankConnections]);
  const [roundUpAmount, setRoundUpAmount] = useState(1)
  const [roundUpEnabled, setRoundUpEnabled] = useState(true)
  const [savingRoundUp, setSavingRoundUp] = useState(false)
  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly')
  const [promoCode, setPromoCode] = useState('')
  const [validatedPromo, setValidatedPromo] = useState(null)
  const [validatingPromo, setValidatingPromo] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success')
  const [cancelling, setCancelling] = useState(false)

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'bank-connection', label: 'Bank Connection', icon: Link },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Management', icon: Database }
  ]

  useEffect(() => {
    loadSettings()
    fetchPlans()
    fetchCurrentSubscription()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true)

      // Use demo data in demo mode
      if (isDemoMode) {
        setPlans(DEMO_SUBSCRIPTION_PLANS)
        setLoadingPlans(false)
        return
      }

      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/subscriptions/plans`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (response.ok) {
        const json = await response.json()
        setPlans(Array.isArray(json.data) ? json.data : [])
      } else {
        console.error('Failed to fetch plans:', response.status, response.statusText)
        if (isDemoMode) {
          setPlans(DEMO_SUBSCRIPTION_PLANS)
        } else {
          setPlans([])
        }
      }
    } catch (e) {
      console.error('Failed to load plans:', e)
      if (isDemoMode) {
        setPlans(DEMO_SUBSCRIPTION_PLANS)
      } else {
        setPlans([])
      }
    } finally {
      setLoadingPlans(false)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      setLoadingSubscription(true)

      // Use demo data in demo mode
      if (isDemoMode) {
        setCurrentSubscription(DEMO_CURRENT_SUBSCRIPTION)
        setLoadingSubscription(false)
        return
      }

      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/subscriptions/current`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (response.ok) {
        const json = await response.json()
        setCurrentSubscription(json.subscription || null)
      }
    } catch (e) {
      console.error('Failed to fetch current subscription:', e)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const validatePromoCode = async (code, planId) => {
    if (!code || !code.trim()) {
      setPromoError('Please enter a promo code')
      setValidatedPromo(null)
      return false
    }

    try {
      setValidatingPromo(true)
      setPromoError('')
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/subscriptions/validate-promo`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          promo_code: code.toUpperCase().trim(),
          plan_id: planId
        })
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setValidatedPromo(result.promo_code)
        setPromoError('')
        return true
      } else {
        setPromoError(result.error || 'Invalid promo code')
        setValidatedPromo(null)
        return false
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Failed to validate promo code')
      setValidatedPromo(null)
      return false
    } finally {
      setValidatingPromo(false)
    }
  }

  const cancelSubscription = async () => {
    if (!currentSubscription) return

    // Demo mode - simulate cancellation
    if (isDemoMode) {
      setCancelling(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentSubscription({
        ...currentSubscription,
        status: 'cancelled',
        cancel_at_period_end: true
      })
      setNotificationMessage('Subscription will cancel at the end of your billing period')
      setNotificationType('success')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 5000)
      setCancelling(false)
      return
    }

    try {
      setCancelling(true)
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      const result = await response.json()

      if (response.ok && result.success) {
        await fetchCurrentSubscription()
        // Show success notification modal
        setNotificationMessage(result.message || 'Subscription will cancel at the end of your billing period')
        setNotificationType('success')
        setShowNotification(true)
        // Auto-close after 5 seconds
        setTimeout(() => {
          setShowNotification(false)
        }, 5000)
      } else {
        setNotificationMessage(result.error || 'Failed to cancel subscription')
        setNotificationType('error')
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      setNotificationMessage('Failed to cancel subscription. Please try again.')
      setNotificationType('error')
      setShowNotification(true)
    } finally {
      setCancelling(false)
    }
  }

  const subscribeToPlan = async (plan) => {
    // Demo mode - simulate subscription
    if (isDemoMode) {
      setSubscribing(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newSubscription = {
        id: `demo-sub-${Date.now()}`,
        plan_name: plan.name,
        plan_id: plan.id,
        status: 'active',
        billing_cycle: selectedBillingCycle,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        price: selectedBillingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
      }
      setCurrentSubscription(newSubscription)
      setPromoCode('')
      setValidatedPromo(null)
      addNotification({
        type: 'success',
        title: 'Subscription Updated',
        message: `Successfully subscribed to ${plan.name}!`
      })
      setSubscribing(false)
      return
    }

    try {
      setSubscribing(true)
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/subscriptions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          plan_id: plan.id,
          billing_cycle: 'monthly',
          promo_code: validatedPromo ? promoCode.toUpperCase().trim() : null
        })
      })
      const result = await response.json()
      if (response.ok && result.success) {
        const hadPromo = validatedPromo !== null
        await fetchCurrentSubscription()
        setPromoCode('')
        setValidatedPromo(null)
        addNotification({
          type: 'success',
          title: 'Subscription Updated',
          message: `Successfully subscribed to ${plan.name}${hadPromo ? ' with promo code!' : '!'}`
        })
      } else {
        addNotification({
          type: 'error',
          title: 'Subscription Failed',
          message: result.error || 'Failed to subscribe to plan'
        })
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error)
      addNotification({
        type: 'error',
        title: 'Subscription Error',
        message: 'Failed to subscribe to plan. Please try again.'
      })
    } finally {
      setSubscribing(false)
    }
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' })
        return
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'

      // Load general settings
      const settingsResponse = await fetch(`${apiBaseUrl}/api/business/settings`, {
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
          }
        })
      
      if (settingsResponse.ok) {
        const result = await settingsResponse.json()
        if (result.success && result.settings) {
          setSettings(prev => ({ ...prev, ...result.settings }))
          // Set round-up amount from settings
          if (result.settings.roundup_multiplier) {
            setRoundUpAmount(Math.round(result.settings.roundup_multiplier))
          }
        }
      }
      
      // Load round-up settings
      const roundUpResponse = await fetch(`${apiBaseUrl}/api/business/settings/roundup`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (roundUpResponse.ok) {
        const result = await roundUpResponse.json()
        if (result.success) {
          setRoundUpAmount(result.round_up_amount || 1)
          setRoundUpEnabled(result.round_up_enabled !== false)
        }
      } else {
        // Use localStorage fallback
        const saved = localStorage.getItem('kamioi_business_round_up_amount')
        const savedEnabled = localStorage.getItem('kamioi_business_round_up_enabled')
        if (saved) setRoundUpAmount(parseInt(saved))
        if (savedEnabled !== null) setRoundUpEnabled(savedEnabled === 'true')
      }

      // Load account settings
      const accountResponse = await fetch(`${apiBaseUrl}/api/business/settings/account`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (accountResponse.ok) {
        const result = await accountResponse.json()
        if (result.success && result.account) {
          setProfile(prev => ({ ...prev, ...result.account }))
        }
      }

      // Load security settings
      const securityResponse = await fetch(`${apiBaseUrl}/api/business/settings/security`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (securityResponse.ok) {
        const result = await securityResponse.json()
        if (result.success && result.security) {
          setSecurity(prev => ({ ...prev, ...result.security }))
        }
      }

      // Load notification settings
      const notificationResponse = await fetch(`${apiBaseUrl}/api/business/settings/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (notificationResponse.ok) {
        const result = await notificationResponse.json()
        if (result.success && result.notifications) {
          setNotificationSettings(prev => ({ ...prev, ...result.notifications }))
        }
      }

      // Load data settings
      const dataResponse = await fetch(`${apiBaseUrl}/api/business/settings/data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (dataResponse.ok) {
        const result = await dataResponse.json()
        if (result.success && result.data_management) {
          setDataSettings(prev => ({ ...prev, ...result.data_management }))
        }
      }

      // Load bank connections
      if (isDemoMode) {
        setBankConnections(DEMO_BANK_CONNECTIONS)
      } else {
        const bankConnectionsResponse = await fetch(`${apiBaseUrl}/api/business/bank-connections`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (bankConnectionsResponse.ok) {
          const result = await bankConnectionsResponse.json()
          if (result.success && result.connections) {
            setBankConnections(Array.isArray(result.connections) ? result.connections : [])
          }
        }
      }

    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnectBank = async (connectionId) => {
    console.log('✅ BusinessSettings: handleDisconnectBank called with connectionId:', connectionId);

    // Demo mode - simulate disconnecting bank
    if (isDemoMode) {
      setBankConnections(prev => prev.filter(c => c.id !== connectionId));
      showSuccessModal('Success', 'Bank account disconnected successfully!');
      addNotification({
        type: 'success',
        title: 'Disconnected',
        message: 'Bank account has been disconnected.',
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token');
      console.log('✅ BusinessSettings: Using token for DELETE:', token ? 'Token found' : 'No token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      console.log('✅ BusinessSettings: DELETE URL:', `${apiBaseUrl}/api/business/bank-connections/${connectionId}`);
      
      const response = await fetch(`${apiBaseUrl}/api/business/bank-connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ BusinessSettings: DELETE response status:', response.status);
      const responseText = await response.text();
      console.log('✅ BusinessSettings: DELETE response:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          if (result.success) {
            console.log('✅ BusinessSettings: Bank connection deleted successfully');
            showSuccessModal('Success', 'Bank account disconnected successfully!');
            addNotification({
              type: 'success',
              title: 'Disconnected',
              message: 'Bank account has been disconnected.',
              timestamp: new Date().toISOString()
            });
            
            // Refresh bank connections using the same token
            const refreshToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token');
            console.log('✅ BusinessSettings: Refreshing bank connections after delete...');
            const bankConnectionsResponse = await fetch(`${apiBaseUrl}/api/business/bank-connections`, {
              headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (bankConnectionsResponse.ok) {
              const refreshResult = await bankConnectionsResponse.json();
              console.log('✅ BusinessSettings: Refresh result:', refreshResult);
              if (refreshResult.success && refreshResult.connections) {
                setBankConnections(Array.isArray(refreshResult.connections) ? refreshResult.connections : []);
                console.log('✅ BusinessSettings: Bank connections updated, new count:', refreshResult.connections.length);
              }
            } else {
              console.error('❌ BusinessSettings: Failed to refresh connections after delete');
            }
          } else {
            throw new Error(result.message || 'Failed to disconnect bank account');
          }
        } catch (parseError) {
          console.error('❌ BusinessSettings: Error parsing DELETE response:', parseError);
          throw new Error('Invalid response from server');
        }
      } else {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || errorData.error || 'Failed to disconnect bank account');
        } catch (parseError) {
          throw new Error(`Server error: ${response.status} - ${responseText}`);
        }
      }
    } catch (error) {
      console.error('❌ BusinessSettings: Error disconnecting bank:', error);
      console.error('❌ BusinessSettings: Error stack:', error.stack);
      showErrorModal('Error', error.message || 'Failed to disconnect bank account. Please try again.');
      addNotification({
        type: 'error',
        title: 'Disconnect Failed',
        message: error.message || 'Failed to disconnect bank account.',
        timestamp: new Date().toISOString()
      });
    }
  }

  const handleDisconnectClick = (connectionId, accountName) => {
    console.log('✅ BusinessSettings: handleDisconnectClick called with connectionId:', connectionId, 'accountName:', accountName);
    if (!connectionId) {
      console.error('❌ BusinessSettings: No connection ID provided');
      showErrorModal('Error', 'Invalid connection ID. Please try again.');
      return;
    }
    showConfirmationModal(
      'Disconnect Bank Account',
      `Are you sure you want to disconnect ${accountName}? This will stop automatic transaction syncing.`,
      async () => {
        console.log('✅ BusinessSettings: Confirmation modal confirmed, calling handleDisconnectBank');
        await handleDisconnectBank(connectionId);
      },
      'warning',
      'Disconnect'
    );
  }

  const saveSettings = async (settingsType, data) => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    // Demo mode - simulate saving settings
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const settingsTypeName = settingsType.charAt(0).toUpperCase() + settingsType.slice(1).replace(/-/g, ' ')
      const successMsg = `${settingsTypeName} settings saved successfully`
      setMessage({ type: 'success', text: successMsg })
      showSuccessModal('Success', successMsg)
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: successMsg,
        timestamp: new Date().toISOString()
      })
      setSaving(false)
      return
    }

    try {
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      if (!token) {
        const errorMsg = 'No authentication token found'
        setMessage({ type: 'error', text: errorMsg })
        showErrorModal('Error', errorMsg)
        addNotification({
          type: 'error',
          title: 'Save Failed',
          message: errorMsg,
          timestamp: new Date().toISOString()
        })
        return
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const endpoint = settingsType === 'general' 
        ? `${apiBaseUrl}/api/business/settings` 
        : `${apiBaseUrl}/api/business/settings/${settingsType}`
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const settingsTypeName = settingsType.charAt(0).toUpperCase() + settingsType.slice(1).replace(/-/g, ' ')
          const successMsg = `${settingsTypeName} settings saved successfully`
          setMessage({ type: 'success', text: successMsg })
          showSuccessModal('Success', successMsg)
          addNotification({
            type: 'success',
            title: 'Settings Saved',
            message: successMsg,
            timestamp: new Date().toISOString()
          })
          
          // Refresh user data if account settings were updated
          if (settingsType === 'account' && refreshUser) {
            try {
              await refreshUser()
              console.log('✅ User data refreshed after account settings update')
            } catch (error) {
              console.error('Failed to refresh user data:', error)
            }
          }
        } else {
          const errorMsg = result.error || result.message || 'Failed to save settings'
          setMessage({ type: 'error', text: errorMsg })
          showErrorModal('Error', errorMsg)
          addNotification({
            type: 'error',
            title: 'Save Failed',
            message: errorMsg,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save settings' }))
        const errorMsg = errorData.message || errorData.error || 'Failed to save settings'
        setMessage({ type: 'error', text: errorMsg })
        showErrorModal('Error', errorMsg)
        addNotification({
          type: 'error',
          title: 'Save Failed',
          message: errorMsg,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      const errorMsg = error.message || 'Network error. Please check your connection and try again.'
      setMessage({ type: 'error', text: errorMsg })
      showErrorModal('Error', errorMsg)
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: errorMsg,
        timestamp: new Date().toISOString()
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGeneralSave = () => {
    saveSettings('general', settings)
  }

  const handleAccountSave = () => {
    saveSettings('account', profile)
  }

  const handleSecuritySave = () => {
    saveSettings('security', security)
  }

  const handleNotificationSave = () => {
    saveSettings('notifications', notificationSettings)
  }

  const handleDataSave = () => {
    saveSettings('data', dataSettings)
  }

  const saveRoundUpSettings = async () => {
    try {
      setSavingRoundUp(true)
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      
      // Save to backend
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/settings/roundup`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          round_up_amount: roundUpAmount,
          round_up_enabled: roundUpEnabled
        })
      })
      
      // Save to localStorage for immediate UI update
      localStorage.setItem('kamioi_business_round_up_amount', roundUpAmount.toString())
      localStorage.setItem('kamioi_business_round_up_enabled', roundUpEnabled.toString())
      
      // Also update settings state
      setSettings(prev => ({ ...prev, roundup_multiplier: roundUpAmount }))
      
      // Dispatch event to update header
      window.dispatchEvent(new CustomEvent('roundUpSettingsUpdated', {
        detail: { amount: roundUpAmount, enabled: roundUpEnabled, dashboardType: 'business' }
      }))
      
      if (response.ok) {
        showSuccessModal('Settings Saved', 'Round-up settings updated successfully')
        setShowRoundUpModal(false)
      } else {
        showSuccessModal('Settings Saved Locally', 'Round-up settings saved (will sync when connection is restored)')
        setShowRoundUpModal(false)
      }
    } catch (error) {
      console.error('Error saving round-up settings:', error)
      // Save locally even if backend fails
      localStorage.setItem('kamioi_business_round_up_amount', roundUpAmount.toString())
      localStorage.setItem('kamioi_business_round_up_enabled', roundUpEnabled.toString())
      window.dispatchEvent(new CustomEvent('roundUpSettingsUpdated', {
        detail: { amount: roundUpAmount, enabled: roundUpEnabled, dashboardType: 'business' }
      }))
      showSuccessModal('Settings Saved Locally', 'Round-up settings saved locally')
      setShowRoundUpModal(false)
    } finally {
      setSavingRoundUp(false)
    }
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Round Up Settings Card */}
      <div className="glass-card p-6 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Round Up Settings</h3>
          </div>
          <button 
            onClick={() => setShowRoundUpModal(true)} 
            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            Configure
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-3">
          Configure your business round-up amount and enable/disable automatic round-ups
        </p>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <div className="text-white font-semibold">${roundUpAmount}.00</div>
            <div className="text-gray-400 text-xs">
              {roundUpEnabled ? 'Round-ups enabled' : 'Round-ups disabled'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Investment Amount Per Transaction
          </label>
          <input
            type="number"
            step="1"
            min="1"
            max="100"
            value={settings?.roundup_multiplier ?? 1.0}
            onChange={(e) => setSettings({...settings, roundup_multiplier: parseFloat(e.target.value)})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Preferences</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings?.auto_invest ?? false}
              onChange={(e) => setSettings({...settings, auto_invest: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Enable Auto-Invest</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings?.notifications ?? false}
              onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Enable Notifications</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings?.email_alerts ?? false}
              onChange={(e) => setSettings({...settings, email_alerts: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Email Alerts</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings?.business_sharing ?? false}
              onChange={(e) => setSettings({...settings, business_sharing: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Business Data Sharing</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings?.budget_alerts ?? false}
              onChange={(e) => setSettings({...settings, budget_alerts: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Budget Alerts</span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderAccountSettings = () => {
    return (
      <div className="space-y-6">
        {/* Company Logo Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Company Logo
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-32 rounded-lg border-2 border-white/20 bg-white/5 flex items-center justify-center overflow-hidden">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-16 h-16 text-white/40" />
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
              </button>
              {companyLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                >
                  Remove Logo
                </button>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 text-sm text-gray-400">
              <p>Upload your company logo (PNG, JPG, max 5MB)</p>
              <p className="text-xs mt-1">Recommended size: 200x200px</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={profile.company_name}
            onChange={(e) => setProfile({...profile, company_name: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Address
        </label>
        <textarea
          value={profile.address}
          onChange={(e) => setProfile({...profile, address: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    )
  }

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Security Features</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={security.two_factor_enabled}
              onChange={(e) => setSecurity({...security, two_factor_enabled: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Two-Factor Authentication</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={security.login_notifications}
              onChange={(e) => setSecurity({...security, login_notifications: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Login Notifications</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={security.api_access}
              onChange={(e) => setSecurity({...security, api_access: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">API Access</span>
          </label>
        </div>
      </div>
      
        <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          min="5"
          max="480"
          value={security.session_timeout}
          onChange={(e) => setSecurity({...security, session_timeout: parseInt(e.target.value)})}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationSettings.email_notifications}
              onChange={(e) => setNotificationSettings({...notificationSettings, email_notifications: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Email Notifications</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationSettings.push_notifications}
              onChange={(e) => setNotificationSettings({...notificationSettings, push_notifications: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Push Notifications</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationSettings.sms_notifications}
              onChange={(e) => setNotificationSettings({...notificationSettings, sms_notifications: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">SMS Notifications</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationSettings.transaction_alerts}
              onChange={(e) => setNotificationSettings({...notificationSettings, transaction_alerts: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Transaction Alerts</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationSettings.budget_alerts}
              onChange={(e) => setNotificationSettings({...notificationSettings, budget_alerts: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Budget Alerts</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationSettings.investment_alerts}
              onChange={(e) => setNotificationSettings({...notificationSettings, investment_alerts: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Investment Alerts</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationSettings.team_updates}
              onChange={(e) => setNotificationSettings({...notificationSettings, team_updates: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Team Updates</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationSettings.weekly_reports}
              onChange={(e) => setNotificationSettings({...notificationSettings, weekly_reports: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Weekly Reports</span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderSubscriptionSettings = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center mb-4">
          <CreditCard className="mr-3 h-6 w-6 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Subscription</h3>
        </div>
        <p className="text-gray-400 text-sm mb-3">
          Manage your subscription with Stripe
        </p>
        
        {/* Current Subscription - Use Stripe Subscription Manager */}
        {currentSubscription ? (
          <StripeSubscriptionManager
            onSubscriptionUpdate={(action) => {
              if (action === 'subscribe') {
                fetchCurrentSubscription()
                fetchPlans()
              } else {
                fetchCurrentSubscription()
              }
            }}
          />
        ) : (
          <div className="space-y-4">
            {/* No subscription - Show plans to subscribe */}
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-yellow-400 text-sm">No active subscription</div>
            </div>
            
            {/* Available Plans with Stripe Checkout */}
            {loadingPlans ? (
              <div className="text-gray-400 text-sm">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="text-gray-400 text-sm">No plans available yet.</div>
            ) : (
              <div className="space-y-4">
                {/* Billing Cycle Selector */}
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">Select a subscription plan:</p>
                  <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
                    <button
                      type="button"
                      onClick={() => setSelectedBillingCycle('monthly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedBillingCycle === 'monthly'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBillingCycle('yearly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedBillingCycle === 'yearly'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold text-lg">{plan.name}</h4>
                        <div className="flex items-baseline space-x-2">
                          <p className="text-white font-semibold text-xl">
                            ${selectedBillingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly}
                          </p>
                          <p className="text-gray-400 text-sm">/{selectedBillingCycle === 'monthly' ? 'month' : 'year'} • {plan.tier}</p>
                        </div>
                        {selectedBillingCycle === 'yearly' && plan.price_yearly && plan.price_monthly && (
                          <p className="text-sm text-green-400 mt-1">
                            Save ${((plan.price_monthly * 12) - plan.price_yearly).toFixed(2)}/year
                          </p>
                        )}
                        {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="text-sm text-gray-300 flex items-center">
                                <span className="text-green-400 mr-2">✓</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    {/* Stripe Checkout for this plan */}
                    <StripeCheckout
                      planId={plan.id}
                      billingCycle={selectedBillingCycle}
                      buttonText={`Subscribe to ${plan.name}`}
                      showPlanDetails={false}
                      onSuccess={() => {
                        // Refresh subscription data
                        fetchCurrentSubscription()
                        fetchPlans()
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Data Management</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={dataSettings.auto_backup}
              onChange={(e) => setDataSettings({...dataSettings, auto_backup: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Auto Backup</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={dataSettings.data_sharing}
              onChange={(e) => setDataSettings({...dataSettings, data_sharing: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Data Sharing</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={dataSettings.analytics_tracking}
              onChange={(e) => setDataSettings({...dataSettings, analytics_tracking: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-white">Analytics Tracking</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Backup Frequency
          </label>
          <select
            value={dataSettings.backup_frequency}
            onChange={(e) => setDataSettings({...dataSettings, backup_frequency: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Data Retention (days)
          </label>
          <input
            type="number"
            min="30"
            max="3650"
            value={dataSettings.data_retention_days}
            onChange={(e) => setDataSettings({...dataSettings, data_retention_days: parseInt(e.target.value)})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
              </div>
        
              <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Export Format
          </label>
          <select
            value={dataSettings.export_format}
            onChange={(e) => setDataSettings({...dataSettings, export_format: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="xlsx">Excel</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderBankConnectionSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Link className="w-5 h-5 mr-2" />
          Business Bank Account Connections
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Manage your business's connected bank accounts for automatic transaction syncing
        </p>
        
        {/* Connected Accounts */}
        <div className="space-y-4 mb-6">
          {bankConnections.length > 0 ? (
            bankConnections.map((connection) => (
              <div key={connection.id || connection.account_id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {connection.bank_name || connection.institution_name || 'Bank Account'}
                      {connection.account_type ? ` ${connection.account_type}` : ''}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {connection.masked_account_number 
                        ? `****${connection.masked_account_number}` 
                        : connection.account_number 
                        ? `****${connection.account_number.slice(-4)}` 
                        : '••••••••'
                      }
                      {' • '}
                      {connection.status === 'active' ? 'Connected' : connection.status || 'Connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    connection.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {connection.status === 'active' ? 'Active' : connection.status || 'Active'}
                  </span>
                  <button 
                    onClick={() => {
                      const connectionId = connection.id;
                      const accountName = connection.bank_name || connection.institution_name || connection.account_name || 'Bank Account';
                      console.log('✅ BusinessSettings: Delete button clicked, connection:', connection);
                      console.log('✅ BusinessSettings: Using connectionId:', connectionId);
                      handleDisconnectClick(connectionId, accountName);
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Disconnect Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Link className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 text-sm">No bank accounts connected</p>
              <p className="text-gray-500 text-xs mt-2">Connect a bank account to enable automatic transaction syncing</p>
            </div>
          )}
        </div>
        
        {/* Add New Connection */}
        <div className="border-t border-white/10 pt-6">
          <button onClick={()=>setShowBankModal(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Connect New Business Bank Account</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'account':
        return renderAccountSettings()
      case 'bank-connection':
        return renderBankConnectionSettings()
      case 'subscription':
        return renderSubscriptionSettings()
      case 'security':
        return renderSecuritySettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'data':
        return renderDataSettings()
      default:
        return renderGeneralSettings()
    }
  }

  const getSaveHandler = () => {
    switch (activeTab) {
      case 'general':
        return handleGeneralSave
      case 'account':
        return handleAccountSave
      case 'security':
        return handleSecuritySave
      case 'notifications':
        return handleNotificationSave
      case 'data':
        return handleDataSave
      default:
        return handleGeneralSave
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            </div>
    )
  }

  return (
    <div className="space-y-6" data-tutorial="settings-section">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Business Settings</h1>
          <p className="text-gray-400 mt-1">Manage your business account settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={getSaveHandler()}
            disabled={saving}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
                </button>
                    </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
          message.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
          'bg-blue-500/20 border-blue-500/50 text-blue-400'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            {message.type === '' && <Info className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {tabs.find(tab => tab.id === activeTab)?.label} Settings
              </h2>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </div>
      {/* MX Connect Modal */}
      {showBankModal && (
      <MXConnectWidget 
        isOpen={showBankModal} 
        onClose={() => {
          console.log('✅ BusinessSettings: onClose called, closing modal');
          setShowBankModal(false);
        }} 
        userType="business" 
        onSuccess={async (data) => {
          console.log('✅ BusinessSettings: MX Connect success callback triggered');
          console.log('✅ BusinessSettings: Received data:', JSON.stringify(data, null, 2));
          try {
            const refreshToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token');
            console.log('✅ BusinessSettings: Using token:', refreshToken ? 'Token found' : 'No token');
            
            // First, save the connection to the backend
            const account = data.accounts && data.accounts.length > 0 ? data.accounts[0] : {};
            const connectionData = {
              institution_name: 'Chase', // From demo mode
              bank_name: 'Chase',
              account_name: account.account_name || 'Chase Checking',
              account_type: account.account_type || 'checking',
              account_id: account.account_id || 'demo_001',
              member_guid: data.member_guid || '',
              user_guid: data.user_guid || ''
            };
            
            console.log('✅ BusinessSettings: Saving bank connection with data:', JSON.stringify(connectionData, null, 2));
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
            console.log(`✅ BusinessSettings: POST URL: ${apiBaseUrl}/api/business/bank-connections`);
            
            const saveResponse = await fetch(`${apiBaseUrl}/api/business/bank-connections`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(connectionData)
            });
            
            console.log('✅ BusinessSettings: Save response status:', saveResponse.status);
            const saveResponseText = await saveResponse.text();
            console.log('✅ BusinessSettings: Save response text:', saveResponseText);
            
            if (saveResponse.ok) {
              try {
                const saveResult = JSON.parse(saveResponseText);
                console.log('✅ BusinessSettings: Bank connection saved successfully:', saveResult);
              } catch (e) {
                console.log('✅ BusinessSettings: Save response (non-JSON):', saveResponseText);
              }
            } else {
              console.error('❌ BusinessSettings: Failed to save bank connection. Status:', saveResponse.status);
              console.error('❌ BusinessSettings: Response:', saveResponseText);
            }
            
            // Close modal
            console.log('✅ BusinessSettings: Closing modal');
            setShowBankModal(false);
            
            // Wait a moment before refreshing
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Refresh bank connections list
            console.log('✅ BusinessSettings: Refreshing bank connections list...');
            const bankConnectionsResponse = await fetch(`${apiBaseUrl}/api/business/bank-connections`, {
              headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('✅ BusinessSettings: Refresh response status:', bankConnectionsResponse.status);
            
            if (bankConnectionsResponse.ok) {
              const result = await bankConnectionsResponse.json();
              console.log('✅ BusinessSettings: Refresh response:', JSON.stringify(result, null, 2));
              if (result.success && result.connections) {
                console.log('✅ BusinessSettings: Setting bank connections, count:', result.connections.length);
                setBankConnections(Array.isArray(result.connections) ? result.connections : []);
                console.log('✅ BusinessSettings: Bank connections state updated');
              } else {
                console.warn('⚠️ BusinessSettings: No connections in response:', result);
              }
            } else {
              const errorText = await bankConnectionsResponse.text();
              console.error('❌ BusinessSettings: Failed to refresh connections. Status:', bankConnectionsResponse.status);
              console.error('❌ BusinessSettings: Error response:', errorText);
            }
          } catch (error) {
            console.error('❌ BusinessSettings: Error in success callback:', error);
            console.error('❌ BusinessSettings: Error stack:', error.stack);
            // Still close modal even if save/refresh fails
            setShowBankModal(false);
          }
        }} 
        onError={() => {
          console.log('❌ BusinessSettings: onError called, closing modal');
          setShowBankModal(false);
        }} 
      />
      )}
      
      {/* Round Up Settings Modal */}
      {showRoundUpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Round Up Settings</h3>
              <button onClick={() => setShowRoundUpModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-6">
              {/* Round Up Amount */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Round Up Amount (Whole Dollars Only)</label>
                <div className="flex items-center space-x-2">
                  <span className="text-white text-lg">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={roundUpAmount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1
                      if (value >= 1) setRoundUpAmount(value)
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="1"
                  />
                  <span className="text-white text-lg">.00</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  This amount will be added to new transactions only. Existing transactions won't be affected.
                </p>
              </div>
              
              {/* Enable/Disable Toggle */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Round Up Status</label>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">
                      {roundUpEnabled ? 'Round-ups Active' : 'Round-ups Paused'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {roundUpEnabled 
                        ? 'Round-ups will be applied to new transactions'
                        : 'Round-ups are disabled for new transactions'}
                    </div>
                  </div>
                  <button
                    onClick={() => setRoundUpEnabled(!roundUpEnabled)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      roundUpEnabled
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {roundUpEnabled ? (
                      <>
                        <Square className="w-4 h-4" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Enable</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Info Note */}
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  <strong>Note:</strong> Changes apply to new transactions only. Existing transactions will keep their original round-up amounts.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowRoundUpModal(false)} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white">Cancel</button>
              <button disabled={savingRoundUp} onClick={saveRoundUpSettings} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                {savingRoundUp ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Notification Modal - Glass Effect */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-gray-800/90 backdrop-blur-xl border-gray-700 border rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
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
                <h3 className="text-lg font-semibold text-white mb-1">
                  {notificationType === 'success' ? 'Success' : 'Error'}
                </h3>
                <p className="text-gray-300">
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

export default BusinessSettings
