import React, { useEffect, useState } from 'react'
import { Settings, User, Bell, Shield, CreditCard, CheckCircle, X, Link, DollarSign, Play, Square, AlertTriangle, Trash2, Plus, Lock, Download, FileText, Smartphone, Key, BellRing } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useModal } from '../../context/ModalContext'
import { useNotifications } from '../../hooks/useNotifications'
import MXConnectWidget from '../common/MXConnectWidget'
import StripeSubscriptionManager from '../common/StripeSubscriptionManager'

// Demo data for settings page
const DEMO_PROFILE_DATA = {
  name: 'Demo User',
  email: 'demo@kamioi.com',
  phone: '(555) 123-4567',
  country: 'United States',
  timezone: 'America/New_York',
  firstName: 'Demo',
  lastName: 'User',
  dob: '1990-01-15',
  ssn: '1234',
  street: '123 Investment Ave',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  annualIncome: '75000',
  employmentStatus: 'Employed',
  employer: 'Tech Company Inc.',
  occupation: 'Software Engineer',
  roundUpAmount: '1.00',
  riskTolerance: 'Moderate'
}

const DEMO_BANK_CONNECTION = {
  id: 'demo_bank_001',
  bank_name: 'Chase',
  institution_name: 'Chase Bank',
  account_name: 'Chase Checking ••••4521',
  account_type: 'Checking',
  status: 'active',
  connected_at: new Date().toISOString()
}

const DEMO_SUBSCRIPTION = {
  id: 'demo_sub_001',
  plan_name: 'Premium',
  status: 'active',
  amount: 9.99,
  billing_period: 'monthly',
  next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  features: ['Unlimited round-ups', 'AI insights', 'Priority support', 'Tax documents']
}

const UserSettings = () => {
  const { isLightMode } = useTheme()
  const { user: authUser, refreshUser } = useAuth()
  const { showSuccessModal, showErrorModal, showConfirmationModal } = useModal()
  const { addNotification } = useNotifications()

  // Check if in demo mode
  const isDemoMode = localStorage.getItem('kamioi_demo_mode') === 'true'

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '', email: '', phone: '', country: '', timezone: '',
    firstName: '', lastName: '', dob: '', ssn: '',
    street: '', city: '', state: '', zip: '',
    annualIncome: '', employmentStatus: '', employer: '', occupation: '',
    roundUpAmount: '1.00', riskTolerance: 'Moderate'
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [, setPlans] = useState([])
  const [, setLoadingPlans] = useState(false)
  const [, setPlansError] = useState(null)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, inApp: true, sms: false })
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [showPasswords] = useState({ current: false, next: false, confirm: false })
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showBankModal, setShowBankModal] = useState(false)
  const [bankConnections, setBankConnections] = useState([])
  const [showRoundUpModal, setShowRoundUpModal] = useState(false)
  const [roundUpAmount, setRoundUpAmount] = useState(1)
  const [roundUpEnabled, setRoundUpEnabled] = useState(true)
  const [savingRoundUp, setSavingRoundUp] = useState(false)

  // New feature states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showDataExportModal, setShowDataExportModal] = useState(false)
  const [showAdvancedNotificationsModal, setShowAdvancedNotificationsModal] = useState(false)
  const [showTaxDocumentsModal, setShowTaxDocumentsModal] = useState(false)
  const [advancedNotificationPrefs, setAdvancedNotificationPrefs] = useState({
    portfolioUpdates: true,
    roundUpConfirmations: true,
    goalProgress: true,
    marketAlerts: false,
    weeklyDigest: true,
    priceAlerts: false
  })
  const [demoSubscription, setDemoSubscription] = useState(null)

  // Fetch full profile data from API
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      if (!token) return

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Profile API response:', result)
        if (result.success) {
          // Handle multiple response formats for backward compatibility
          const p = result.profile || result.data?.profile || result.data || {}
          console.log('Parsed profile data:', p)
          setProfileForm(prev => ({
            ...prev,
            name: p.name || prev.name,
            email: p.email || prev.email,
            phone: p.phone || prev.phone,
            country: p.country || prev.country,
            timezone: p.timezone || prev.timezone,
            firstName: p.firstName || p.first_name || prev.firstName,
            lastName: p.lastName || p.last_name || prev.lastName,
            // Handle dob field name variations
            dob: p.dob || p.dateOfBirth || p.date_of_birth || prev.dob,
            // Handle ssn field name variations (backend uses ssn_last4)
            ssn: p.ssn || p.ssn_last4 || p.ssnLast4 || prev.ssn,
            street: p.street || p.address || prev.street,
            city: p.city || prev.city,
            state: p.state || prev.state,
            zip: p.zip || p.zip_code || p.zipCode || prev.zip,
            annualIncome: p.annualIncome || p.annual_income || prev.annualIncome,
            employmentStatus: p.employmentStatus || p.employment_status || prev.employmentStatus,
            employer: p.employer || prev.employer,
            occupation: p.occupation || prev.occupation,
            roundUpAmount: p.roundUpAmount || p.round_up_amount || prev.roundUpAmount,
            riskTolerance: p.riskTolerance || p.risk_tolerance || prev.riskTolerance
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  useEffect(() => {
    // In demo mode, use demo data
    if (isDemoMode) {
      console.log('Settings - Demo mode detected, loading demo data')
      setProfileForm(DEMO_PROFILE_DATA)
      setBankConnections([DEMO_BANK_CONNECTION])
      setDemoSubscription(DEMO_SUBSCRIPTION)
      setTwoFactorEnabled(true) // Demo has 2FA enabled
      return
    }

    // First set from authUser (basic data)
    setProfileForm(prev => ({
      ...prev,
      name: authUser?.name || prev.name,
      email: authUser?.email || prev.email,
      phone: authUser?.phone || prev.phone,
      country: authUser?.country || prev.country,
      timezone: authUser?.timezone || prev.timezone,
      firstName: authUser?.firstName || prev.firstName,
      lastName: authUser?.lastName || prev.lastName,
      dob: authUser?.dob || prev.dob,
      ssn: authUser?.ssn || prev.ssn,
      street: authUser?.street || prev.street,
      city: authUser?.city || prev.city,
      state: authUser?.state || prev.state,
      zip: authUser?.zip || prev.zip,
      annualIncome: authUser?.annualIncome || prev.annualIncome,
      employmentStatus: authUser?.employmentStatus || prev.employmentStatus,
      employer: authUser?.employer || prev.employer,
      occupation: authUser?.occupation || prev.occupation,
      roundUpAmount: authUser?.roundUpAmount || prev.roundUpAmount,
      riskTolerance: authUser?.riskTolerance || prev.riskTolerance
    }))
    try {
      const savedPrefs = JSON.parse(localStorage.getItem('kamioi_notification_prefs') || 'null')
      if (savedPrefs) setNotificationPrefs(savedPrefs)
    } catch (_) {
      // Ignore malformed stored preferences
    }

    // Load full profile from API (includes all registration data)
    fetchProfile()
    // Load round-up settings
    fetchRoundUpSettings()
    // Load bank connections
    fetchBankConnections()
  }, [authUser, isDemoMode])

  const fetchBankConnections = async () => {
    try {
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      if (!token) return
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/bank-connections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.connections) {
          setBankConnections(Array.isArray(result.connections) ? result.connections : [])
        }
      }
    } catch (error) {
      console.error('Error fetching bank connections:', error)
    }
  }

  const handleDisconnectBank = async (connectionId) => {
    try {
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      // Use correct endpoint for user accounts (not business)
      const response = await fetch(`${apiBaseUrl}/api/user/bank-connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          showSuccessModal('Success', 'Bank account disconnected successfully!')
          addNotification({
            type: 'success',
            title: 'Disconnected',
            message: 'Bank account has been disconnected.',
            timestamp: new Date().toISOString()
          })
          await fetchBankConnections()
        } else {
          throw new Error(result.message || 'Failed to disconnect bank account')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to disconnect bank account' }))
        throw new Error(errorData.message || 'Failed to disconnect bank account')
      }
    } catch (error) {
      console.error('Error disconnecting bank:', error)
      showErrorModal('Error', error.message || 'Failed to disconnect bank account. Please try again.')
    }
  }

  const handleDisconnectClick = (connectionId, accountName) => {
    if (!connectionId) {
      showErrorModal('Error', 'Invalid connection ID. Please try again.')
      return
    }
    showConfirmationModal(
      'Disconnect Bank Account',
      `Are you sure you want to disconnect ${accountName}? This will stop automatic transaction syncing.`,
      async () => {
        await handleDisconnectBank(connectionId)
      },
      'warning',
      'Disconnect'
    )
  }

  const handleMXConnectSuccess = async (data) => {
    try {
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      const account = data.accounts && data.accounts.length > 0 ? data.accounts[0] : {}
      const connectionData = {
        institution_name: 'Chase', // From demo mode
        bank_name: 'Chase',
        account_name: account.account_name || 'Chase Checking',
        account_type: account.account_type || 'checking',
        account_id: account.account_id || 'demo_001',
        member_guid: data.member_guid || '',
        user_guid: data.user_guid || ''
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const saveResponse = await fetch(`${apiBaseUrl}/api/user/bank-connections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(connectionData)
      })

      if (saveResponse.ok) {
        setShowBankModal(false)
        await new Promise(resolve => setTimeout(resolve, 500))
        await fetchBankConnections()
        showSuccessModal('Success', 'Bank account connected successfully!')
      } else {
        throw new Error('Failed to save bank connection')
      }
    } catch (error) {
      console.error('Error saving bank connection:', error)
      showErrorModal('Error', 'Failed to save bank connection. Please try again.')
      setShowBankModal(false)
    }
  }
  
  const fetchRoundUpSettings = async () => {
    try {
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/settings/roundup`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRoundUpAmount(data.round_up_amount || 1)
          setRoundUpEnabled(data.round_up_enabled !== false) // Default to true
        }
      } else {
        // Use defaults if API fails
        const saved = localStorage.getItem('kamioi_round_up_amount')
        const savedEnabled = localStorage.getItem('kamioi_round_up_enabled')
        if (saved) setRoundUpAmount(parseInt(saved))
        if (savedEnabled !== null) setRoundUpEnabled(savedEnabled === 'true')
      }
    } catch (error) {
      console.error('Error fetching round-up settings:', error)
      // Use localStorage fallback
      const saved = localStorage.getItem('kamioi_round_up_amount')
      const savedEnabled = localStorage.getItem('kamioi_round_up_enabled')
      if (saved) setRoundUpAmount(parseInt(saved))
      if (savedEnabled !== null) setRoundUpEnabled(savedEnabled === 'true')
    }
  }
  
  const saveRoundUpSettings = async () => {
    try {
      setSavingRoundUp(true)
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      
      // Save to backend
      const response = await fetch(`${apiBaseUrl}/api/user/settings/roundup`, {
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
      localStorage.setItem('kamioi_round_up_amount', roundUpAmount.toString())
      localStorage.setItem('kamioi_round_up_enabled', roundUpEnabled.toString())
      
      // Dispatch event to update header
      window.dispatchEvent(new CustomEvent('roundUpSettingsUpdated', {
        detail: { amount: roundUpAmount, enabled: roundUpEnabled }
      }))
      
      if (response.ok) {
        setSaveSuccess(true)
        setShowRoundUpModal(false)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        // Still save locally even if backend fails
        setSaveSuccess(true)
        setShowRoundUpModal(false)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error saving round-up settings:', error)
      // Save locally even if backend fails
      localStorage.setItem('kamioi_round_up_amount', roundUpAmount.toString())
      localStorage.setItem('kamioi_round_up_enabled', roundUpEnabled.toString())
      window.dispatchEvent(new CustomEvent('roundUpSettingsUpdated', {
        detail: { amount: roundUpAmount, enabled: roundUpEnabled }
      }))
      setSaveSuccess(true)
      setShowRoundUpModal(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setSavingRoundUp(false)
    }
  }

  const getCardClass = () => (isLightMode ? 'glass-card p-4 rounded-lg border border-gray-200 bg-white/80' : 'glass-card p-4 rounded-lg border border-white/10')
  const getButtonPrimary = () => (isLightMode ? 'mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors' : 'mt-3 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors')
  const getButtonNeutral = () => (isLightMode ? 'px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700' : 'px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white')

  const [, setCurrentSubscription] = useState(null)
  const [, setLoadingSubscription] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage] = useState('')
  const [notificationType] = useState('success')

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true)
      setPlansError(null)
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/subscriptions/plans`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (response.ok) {
        const json = await response.json()
        setPlans(Array.isArray(json.data) ? json.data : [])
      }
    } catch (e) {
      setPlansError('Failed to load plans')
      setPlans([])
    } finally {
      setLoadingPlans(false)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      setLoadingSubscription(true)
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/user/subscriptions/current`, {
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

  useEffect(() => { 
    fetchPlans()
    fetchCurrentSubscription()
  }, [])

  const saveProfile = async () => {
    try {
      setSavingProfile(true)
      setSaveSuccess(false)
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      if (token) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        await fetch(`${apiBaseUrl}/api/user/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: profileForm.name,
            email: profileForm.email,
            phone: profileForm.phone,
            country: profileForm.country,
            timezone: profileForm.timezone,
            firstName: profileForm.firstName,
            lastName: profileForm.lastName,
            dob: profileForm.dob,
            ssn: profileForm.ssn,
            street: profileForm.street,
            city: profileForm.city,
            state: profileForm.state,
            zip: profileForm.zip,
            annualIncome: profileForm.annualIncome,
            employmentStatus: profileForm.employmentStatus,
            employer: profileForm.employer,
            occupation: profileForm.occupation,
            roundUpAmount: profileForm.roundUpAmount,
            riskTolerance: profileForm.riskTolerance
          })
        })
      }
      // Persist locally for immediate UX
      const stored = JSON.parse(localStorage.getItem('kamioi_user') || 'null') || {}
      localStorage.setItem('kamioi_user', JSON.stringify({
        ...stored,
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        country: profileForm.country,
        timezone: profileForm.timezone,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        dob: profileForm.dob,
        ssn: profileForm.ssn,
        street: profileForm.street,
        city: profileForm.city,
        state: profileForm.state,
        zip: profileForm.zip,
        annualIncome: profileForm.annualIncome,
        employmentStatus: profileForm.employmentStatus,
        employer: profileForm.employer,
        occupation: profileForm.occupation,
        roundUpAmount: profileForm.roundUpAmount,
        riskTolerance: profileForm.riskTolerance
      }))
      localStorage.setItem('kamioi_user_profile', JSON.stringify(profileForm))
      setSaveSuccess(true)
      setShowProfileModal(false)
      
      // Refresh user data from API to update throughout the app
      if (refreshUser) {
        try {
          await refreshUser()
          console.log('✅ User data refreshed after profile update')
        } catch (error) {
          console.error('Failed to refresh user data:', error)
        }
      }
      // Ensure dashboards reflect latest profile immediately
      setTimeout(() => {
        try {
          window.dispatchEvent(new Event('kamioi:profile-updated'))
          // Force a soft refresh of contexts if UI doesn't update
          setTimeout(() => { window.location.reload() }, 150)
        } catch(_) {
          // Ignore window dispatch failures
        }
      }, 50)
    } catch (e) {
      // no-op fallback UI handles silently
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-lg shadow-xl border border-blue-500/20">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <Settings className="mr-3 h-8 w-8 text-blue-400" />
          User Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <div className={getCardClass()}>
            <div className="flex items-center mb-4">
              <User className="mr-3 h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Profile</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Manage your personal information and account details
            </p>
            <button onClick={() => setShowProfileModal(true)} className={getButtonPrimary()}>
              Edit Profile
            </button>
          </div>

          {/* Notification Settings */}
          <div className={getCardClass()}>
            <div className="flex items-center mb-4">
              <Bell className="mr-3 h-6 w-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Configure your notification preferences
            </p>
            <button className="mt-3 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors" onClick={() => setShowNotificationsModal(true)}>
              Manage Notifications
            </button>
          </div>

          {/* Security Settings */}
          <div className={getCardClass()}>
            <div className="flex items-center mb-4">
              <Shield className="mr-3 h-6 w-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Security</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Update your password and security settings
            </p>
            <button className="mt-3 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors" onClick={() => setShowSecurityModal(true)}>
              Security Settings
            </button>
          </div>

          {/* Bank Connections */}
          <div className={getCardClass()}>
            <div className="flex items-center mb-4">
              <Link className="mr-3 h-6 w-6 text-blue-300" />
              <h3 className="text-lg font-semibold text-white">Bank Connections</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">Connect or change your linked bank account. This powers automatic transaction syncing.</p>
            
            {/* Connected Accounts */}
            <div className="space-y-3 mb-4">
              {bankConnections.length > 0 ? (
                bankConnections.map((connection) => (
                  <div key={connection.id || connection.account_id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {connection.bank_name || connection.institution_name || 'Bank Account'}
                          {connection.account_type ? ` ${connection.account_type}` : ''}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {connection.account_name || '••••••••'} • {connection.status === 'active' ? 'Connected' : connection.status || 'Connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${
                        connection.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {connection.status === 'active' ? 'Active' : connection.status || 'Active'}
                      </span>
                      <button 
                        onClick={() => {
                          const connectionId = connection.id;
                          const accountName = connection.bank_name || connection.institution_name || connection.account_name || 'Bank Account';
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
                <div className="text-center py-4">
                  <Link className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-400 text-xs">No bank accounts connected</p>
                </div>
              )}
            </div>
            
            <button className="w-full px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center space-x-2" onClick={()=>setShowBankModal(true)}>
              <Plus className="w-4 h-4" />
              <span>Connect Bank Account</span>
            </button>
          </div>

          {/* Round Up Settings */}
          <div className={getCardClass()}>
            <div className="flex items-center mb-4">
              <DollarSign className="mr-3 h-6 w-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Round Up</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Configure your round-up amount and enable/disable automatic round-ups
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">${roundUpAmount}.00</div>
                <div className="text-gray-400 text-xs">
                  {roundUpEnabled ? 'Round-ups enabled' : 'Round-ups disabled'}
                </div>
              </div>
              <button 
                onClick={() => setShowRoundUpModal(true)} 
                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                Configure
              </button>
            </div>
          </div>

          {/* Subscription Settings - Enhanced with Stripe */}
          <div className={getCardClass()}>
            <div className="flex items-center mb-4">
              <CreditCard className="mr-3 h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Subscription</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Manage your subscription with Stripe
            </p>
            
            {/* Stripe Subscription Manager */}
            <StripeSubscriptionManager
              onSubscriptionUpdate={(action) => {
                if (action === 'subscribe') {
                  // Refresh subscription data
                  fetchCurrentSubscription()
                  fetchPlans()
                } else {
                  // Refresh subscription data
                  fetchCurrentSubscription()
                }
              }}
            />
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
          <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" /> Additional Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Two-Factor Authentication */}
            <button
              onClick={() => setShow2FAModal(true)}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-white font-medium text-sm">Two-Factor Authentication</p>
                  {twoFactorEnabled && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Enabled</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs">Enhanced security with 2FA</p>
              </div>
            </button>

            {/* Data Export */}
            <button
              onClick={() => setShowDataExportModal(true)}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Data Export</p>
                <p className="text-gray-400 text-xs">Download transactions & reports</p>
              </div>
            </button>

            {/* Advanced Notifications */}
            <button
              onClick={() => setShowAdvancedNotificationsModal(true)}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <BellRing className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Advanced Notifications</p>
                <p className="text-gray-400 text-xs">Granular alert preferences</p>
              </div>
            </button>

            {/* Tax Documents */}
            <button
              onClick={() => setShowTaxDocumentsModal(true)}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Tax Documents</p>
                <p className="text-gray-400 text-xs">Download 1099 & tax forms</p>
              </div>
            </button>
          </div>
        </div>
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {/* Tabs */}
              <div className="mb-4 flex space-x-2">
                {['Personal & Contact','Address & Financial'].map((label, idx) => (
                  <button key={label} onClick={()=>setProfileForm(p=>({...p, __tab: idx}))} className={`px-3 py-2 rounded-md text-sm ${profileForm.__tab===idx ? 'bg-blue-500/30 text-white border border-blue-400/50' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>{label}</button>
                ))}
              </div>

              {(!profileForm.__tab || profileForm.__tab===0) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Name</label>
                    <input type="text" value={profileForm.name} onChange={(e)=>setProfileForm(p=>({...p,name:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email</label>
                    <input type="email" value={profileForm.email} onChange={(e)=>setProfileForm(p=>({...p,email:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Phone</label>
                    <input type="tel" value={profileForm.phone || ''} onChange={(e)=>setProfileForm(p=>({...p,phone:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">First Name</label>
                      <input type="text" value={profileForm.firstName || ''} onChange={(e)=>setProfileForm(p=>({...p,firstName:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Last Name</label>
                      <input type="text" value={profileForm.lastName || ''} onChange={(e)=>setProfileForm(p=>({...p,lastName:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Date of Birth</label>
                      <input type="date" value={profileForm.dob || ''} onChange={(e)=>setProfileForm(p=>({...p,dob:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">SSN (last 4)</label>
                      <input type="text" maxLength={4} value={profileForm.ssn || ''} onChange={(e)=>setProfileForm(p=>({...p,ssn:e.target.value.replace(/[^0-9]/g,'').slice(-4)}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Country</label>
                    <input type="text" value={profileForm.country || ''} onChange={(e)=>setProfileForm(p=>({...p,country:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Timezone</label>
                    <input type="text" value={profileForm.timezone || ''} onChange={(e)=>setProfileForm(p=>({...p,timezone:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}

              {profileForm.__tab===1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Street</label>
                    <input type="text" value={profileForm.street || ''} onChange={(e)=>setProfileForm(p=>({...p,street:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">City</label>
                      <input type="text" value={profileForm.city || ''} onChange={(e)=>setProfileForm(p=>({...p,city:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">State</label>
                      <input type="text" value={profileForm.state || ''} onChange={(e)=>setProfileForm(p=>({...p,state:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">ZIP</label>
                      <input type="text" value={profileForm.zip || ''} onChange={(e)=>setProfileForm(p=>({...p,zip:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Annual Income</label>
                      <input type="number" value={profileForm.annualIncome || ''} onChange={(e)=>setProfileForm(p=>({...p,annualIncome:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Employment Status</label>
                      <select value={profileForm.employmentStatus || ''} onChange={(e)=>setProfileForm(p=>({...p,employmentStatus:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                        <option value="">Select</option>
                        <option>Employed</option>
                        <option>Self-Employed</option>
                        <option>Student</option>
                        <option>Unemployed</option>
                        <option>Retired</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Employer</label>
                      <input type="text" value={profileForm.employer || ''} onChange={(e)=>setProfileForm(p=>({...p,employer:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Occupation</label>
                      <input type="text" value={profileForm.occupation || ''} onChange={(e)=>setProfileForm(p=>({...p,occupation:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Round‑Up Amount</label>
                      <select value={profileForm.roundUpAmount} onChange={(e)=>setProfileForm(p=>({...p,roundUpAmount:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                        <option value="1.00">$1.00</option>
                        <option value="2.00">$2.00</option>
                        <option value="3.00">$3.00</option>
                        <option value="4.00">$4.00</option>
                        <option value="5.00">$5.00</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Risk Tolerance</label>
                      <select value={profileForm.riskTolerance} onChange={(e)=>setProfileForm(p=>({...p,riskTolerance:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                        <option>Conservative</option>
                        <option>Moderate</option>
                        <option>Aggressive</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={()=>setShowProfileModal(false)} className={getButtonNeutral()}>Cancel</button>
                <button disabled={savingProfile} onClick={saveProfile} className={getButtonPrimary()}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        )}
        {showNotificationsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Notification Preferences</h3>
                <button onClick={() => setShowNotificationsModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-white">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" checked={notificationPrefs.email} onChange={(e)=>setNotificationPrefs(p=>({ ...p, email: e.target.checked }))} />
                  <span>Email</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" checked={notificationPrefs.inApp} onChange={(e)=>setNotificationPrefs(p=>({ ...p, inApp: e.target.checked }))} />
                  <span>In‑app</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" checked={notificationPrefs.sms} onChange={(e)=>setNotificationPrefs(p=>({ ...p, sms: e.target.checked }))} />
                  <span>SMS</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={()=>setShowNotificationsModal(false)} className={getButtonNeutral()}>Close</button>
                <button onClick={()=>{ localStorage.setItem('kamioi_notification_prefs', JSON.stringify(notificationPrefs)); setShowNotificationsModal(false) }} className={getButtonPrimary()}>Save</button>
              </div>
            </div>
          </div>
        )}
        {showSecurityModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Change Password</h3>
                <button onClick={() => setShowSecurityModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Current Password</label>
                  <input type={showPasswords.current ? 'text' : 'password'} value={securityForm.currentPassword} onChange={(e)=>setSecurityForm(p=>({...p,currentPassword:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">New Password</label>
                  <input type={showPasswords.next ? 'text' : 'password'} value={securityForm.newPassword} onChange={(e)=>setSecurityForm(p=>({...p,newPassword:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Confirm Password</label>
                  <input type={showPasswords.confirm ? 'text' : 'password'} value={securityForm.confirmPassword} onChange={(e)=>setSecurityForm(p=>({...p,confirmPassword:e.target.value}))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={()=>setShowSecurityModal(false)} className={getButtonNeutral()}>Cancel</button>
                <button onClick={async ()=>{ try { const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken'); if (token) { const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'; await fetch(`${apiBaseUrl}/api/user/security/change-password`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(securityForm) }); } setShowSecurityModal(false) } catch(_) { setShowSecurityModal(false) } }} className={getButtonPrimary()}>Update Password</button>
              </div>
            </div>
          </div>
        )}
        {saveSuccess && (
          <div className="fixed bottom-4 right-4 bg-white/10 border border-white/20 rounded-lg px-4 py-3 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm">Profile updated</span>
          </div>
        )}
      </div>

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
                  This amount will be added to new transactions only. Existing transactions won&apos;t be affected.
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
              <button onClick={() => setShowRoundUpModal(false)} className={getButtonNeutral()}>Cancel</button>
              <button disabled={savingRoundUp} onClick={saveRoundUpSettings} className={getButtonPrimary()}>
                {savingRoundUp ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MX Connect Modal */}
      {showBankModal && (
        <MXConnectWidget
          isOpen={showBankModal}
          onClose={() => setShowBankModal(false)}
          userType="user"
          onSuccess={handleMXConnectSuccess}
          onError={() => setShowBankModal(false)}
        />
      )}

      {/* Two-Factor Authentication Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-green-400" />
                Two-Factor Authentication
              </h3>
              <button onClick={() => setShow2FAModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 2FA Status */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">2FA Status</p>
                    <p className="text-gray-400 text-sm">
                      {twoFactorEnabled ? 'Your account is protected with 2FA' : '2FA is not enabled'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    twoFactorEnabled ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>

              {twoFactorEnabled ? (
                <>
                  {/* Recovery Codes */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Key className="w-4 h-4 text-blue-400" />
                      <p className="text-white font-medium text-sm">Recovery Codes</p>
                    </div>
                    <p className="text-gray-400 text-xs mb-3">
                      Store these codes safely. Use them to access your account if you lose your device.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456'].map((code, idx) => (
                        <div key={idx} className="px-3 py-2 bg-black/20 rounded font-mono text-sm text-gray-300">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disable 2FA */}
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(false)
                      addNotification({
                        type: 'warning',
                        title: '2FA Disabled',
                        message: 'Two-factor authentication has been disabled.',
                        timestamp: new Date().toISOString()
                      })
                    }}
                    className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Disable 2FA</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Setup Instructions */}
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm">To enable 2FA:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                      <li>Download an authenticator app (Google Authenticator, Authy)</li>
                      <li>Scan the QR code or enter the setup key</li>
                      <li>Enter the 6-digit code to verify</li>
                    </ol>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="p-6 bg-white rounded-lg mx-auto w-fit">
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs text-center">QR Code</span>
                    </div>
                  </div>

                  {/* Setup Key */}
                  <div className="p-3 bg-black/20 rounded-lg text-center">
                    <p className="text-gray-400 text-xs mb-1">Setup Key</p>
                    <p className="font-mono text-white">DEMO-SETUP-KEY-2FA</p>
                  </div>

                  {/* Verification Input */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Enter 6-digit code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Enable Button */}
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(true)
                      addNotification({
                        type: 'success',
                        title: '2FA Enabled',
                        message: 'Two-factor authentication has been enabled for your account.',
                        timestamp: new Date().toISOString()
                      })
                    }}
                    className="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Enable 2FA</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setShow2FAModal(false)} className={getButtonNeutral()}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Data Export Modal */}
      {showDataExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Download className="w-5 h-5 mr-2 text-purple-400" />
                Data Export
              </h3>
              <button onClick={() => setShowDataExportModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Export your data in various formats for your records or tax purposes.
              </p>

              {/* Export Options */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    addNotification({
                      type: 'success',
                      title: 'Export Started',
                      message: 'Your transaction history is being prepared for download.',
                      timestamp: new Date().toISOString()
                    })
                  }}
                  className="w-full p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Transaction History</p>
                        <p className="text-gray-400 text-xs">All transactions as CSV</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    addNotification({
                      type: 'success',
                      title: 'Export Started',
                      message: 'Your portfolio report is being prepared for download.',
                      timestamp: new Date().toISOString()
                    })
                  }}
                  className="w-full p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Portfolio Report</p>
                        <p className="text-gray-400 text-xs">Holdings & performance as PDF</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    addNotification({
                      type: 'success',
                      title: 'Export Started',
                      message: 'Your account data archive is being prepared.',
                      timestamp: new Date().toISOString()
                    })
                  }}
                  className="w-full p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Full Account Data</p>
                        <p className="text-gray-400 text-xs">Complete data archive as JSON</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              </div>

              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  Exports are generated securely and will be emailed to your registered address.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setShowDataExportModal(false)} className={getButtonNeutral()}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Notifications Modal */}
      {showAdvancedNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <BellRing className="w-5 h-5 mr-2 text-yellow-400" />
                Advanced Notifications
              </h3>
              <button onClick={() => setShowAdvancedNotificationsModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Customize which notifications you receive and how often.
              </p>

              {/* Notification Categories */}
              <div className="space-y-3">
                {[
                  { key: 'portfolioUpdates', label: 'Portfolio Updates', desc: 'Daily portfolio value changes' },
                  { key: 'roundUpConfirmations', label: 'Round-Up Confirmations', desc: 'Each time a round-up is invested' },
                  { key: 'goalProgress', label: 'Goal Progress', desc: 'Milestones and achievements' },
                  { key: 'marketAlerts', label: 'Market Alerts', desc: 'Significant market movements' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your week' },
                  { key: 'priceAlerts', label: 'Price Alerts', desc: 'When stocks hit target prices' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium text-sm">{item.label}</p>
                      <p className="text-gray-400 text-xs">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setAdvancedNotificationPrefs(prev => ({
                        ...prev,
                        [item.key]: !prev[item.key]
                      }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        advancedNotificationPrefs[item.key] ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        advancedNotificationPrefs[item.key] ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowAdvancedNotificationsModal(false)} className={getButtonNeutral()}>Cancel</button>
              <button
                onClick={() => {
                  localStorage.setItem('kamioi_advanced_notification_prefs', JSON.stringify(advancedNotificationPrefs))
                  addNotification({
                    type: 'success',
                    title: 'Preferences Saved',
                    message: 'Your notification preferences have been updated.',
                    timestamp: new Date().toISOString()
                  })
                  setShowAdvancedNotificationsModal(false)
                }}
                className={getButtonPrimary()}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Documents Modal */}
      {showTaxDocumentsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
                Tax Documents
              </h3>
              <button onClick={() => setShowTaxDocumentsModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Download your tax documents for filing purposes.
              </p>

              {/* Available Documents */}
              <div className="space-y-3">
                {demoSubscription || isDemoMode ? (
                  <>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Form 1099-DIV</p>
                            <p className="text-gray-400 text-xs">Dividends and Distributions - 2025</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addNotification({
                              type: 'success',
                              title: 'Download Started',
                              message: 'Your Form 1099-DIV is being downloaded.',
                              timestamp: new Date().toISOString()
                            })
                          }}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Form 1099-B</p>
                            <p className="text-gray-400 text-xs">Proceeds from Broker - 2025</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addNotification({
                              type: 'success',
                              title: 'Download Started',
                              message: 'Your Form 1099-B is being downloaded.',
                              timestamp: new Date().toISOString()
                            })
                          }}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Year-End Summary</p>
                            <p className="text-gray-400 text-xs">Annual Investment Summary - 2025</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addNotification({
                              type: 'success',
                              title: 'Download Started',
                              message: 'Your Year-End Summary is being downloaded.',
                              timestamp: new Date().toISOString()
                            })
                          }}
                          className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400 text-sm">No tax documents available yet.</p>
                    <p className="text-gray-500 text-xs mt-1">Documents will be available after tax year ends.</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <p className="text-xs text-yellow-300">
                  Tax documents are typically available by mid-February for the previous tax year.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setShowTaxDocumentsModal(false)} className={getButtonNeutral()}>Close</button>
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

export default UserSettings
