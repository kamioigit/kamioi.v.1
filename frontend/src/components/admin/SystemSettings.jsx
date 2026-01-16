import React, { useState, useEffect } from 'react'
import { Settings, Save, Users, Building2, AlertTriangle, CheckCircle, RefreshCw, Phone, Info } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const SystemSettings = ({ user }) => {
  const { isLightMode, isDarkMode, isCloudMode } = useTheme()
  const [activeTab, setActiveTab] = useState('system')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // System configuration state
  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    apiRateLimit: 1000,
    maxUsers: 10000,
    securityLevel: 'high',
    version: '1.0.0',
    backupFrequency: 'daily'
  })
  
  // Business settings state
  const [businessSettings, setBusinessSettings] = useState({
    companyName: '',
    supportEmail: '',
    website: '',
    address: '',
    phone: '',
    description: ''
  })

  const getTextColor = () => (isLightMode ? 'text-gray-800' : 'text-white')
  const getSubtextClass = () => (isLightMode ? 'text-gray-600' : 'text-gray-400')
  const getCardClass = () => `bg-white/10 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/20 ${isLightMode ? 'bg-opacity-80' : 'bg-opacity-10'}`

  const fetchSystemSettings = async (signal = null) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken') || 'admin_token_3'
      
      // OPTIMIZED: Parallelize API calls for better performance
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const [systemResponse, businessResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/api/admin/settings/system`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal
        }),
        fetch(`${apiBaseUrl}/api/admin/settings/business`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal
        })
      ])
      
      if (signal?.aborted) return
      
      if (systemResponse.ok) {
        const systemResult = await systemResponse.json()
        if (systemResult.success && systemResult.settings) {
          setSystemConfig({...systemConfig, ...systemResult.settings})
        }
      }

      if (businessResponse.ok) {
        const businessResult = await businessResponse.json()
        if (businessResult.success && businessResult.settings) {
          setBusinessSettings({...businessSettings, ...businessResult.settings})
        }
      } else {
        // Business settings endpoint doesn't exist - that's okay, use defaults
        console.log('Business settings endpoint not available, using defaults')
      }
      
      if (!signal?.aborted) {
        // Dispatch page load completion event for Loading Report
        window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
          detail: { pageId: 'settings' }
        }))
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching system settings:', err)
        setError('Failed to load system settings')
        // Still dispatch completion event even on error
        if (!signal?.aborted) {
          window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
            detail: { pageId: 'settings' }
          }))
        }
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  const saveSystemConfig = async () => {
    setIsSaving(true)
    setSaveStatus(null)
    try {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken') || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/settings/system`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(systemConfig)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSaveStatus('success')
          setTimeout(() => setSaveStatus(null), 3000)
        } else {
          setSaveStatus('error')
        }
      } else {
        setSaveStatus('error')
      }
    } catch (err) {
      console.error('Error saving system config:', err)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const saveBusinessSettings = async () => {
    setIsSaving(true)
    setSaveStatus(null)
    try {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken') || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/settings/business`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(businessSettings)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSaveStatus('success')
          setTimeout(() => setSaveStatus(null), 3000)
        } else {
          setSaveStatus('error')
        }
      } else {
        setSaveStatus('error')
      }
    } catch (err) {
      console.error('Error saving business settings:', err)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    fetchSystemSettings(abortController.signal)
    
    return () => {
      abortController.abort()
    }
  }, [])

  const renderSystemConfigTab = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-4 flex items-center space-x-2`}>
          <Settings className="w-5 h-5" />
          <span>System Configuration</span>
        </h3>
        <p className={`${getSubtextClass()} mb-6`}>Configure global system settings and preferences.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className={`block text-sm font-medium ${getTextColor()}`}>Maintenance Mode</label>
                <p className={`text-xs ${getSubtextClass()}`}>Enable maintenance mode to restrict access</p>
              </div>
              <button
                onClick={() => setSystemConfig({...systemConfig, maintenanceMode: !(systemConfig?.maintenanceMode || false)})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  (systemConfig?.maintenanceMode || false) ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (systemConfig?.maintenanceMode || false) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className={`block text-sm font-medium ${getTextColor()}`}>Registration Enabled</label>
                <p className={`text-xs ${getSubtextClass()}`}>Allow new user registrations</p>
              </div>
              <button
                onClick={() => setSystemConfig({...systemConfig, registrationEnabled: !(systemConfig?.registrationEnabled !== false)})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  (systemConfig?.registrationEnabled !== false) ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (systemConfig?.registrationEnabled !== false) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>API Rate Limit</label>
              <input
                type="number"
                value={systemConfig?.apiRateLimit || 1000}
                onChange={(e) => setSystemConfig({...systemConfig, apiRateLimit: parseInt(e.target.value) || 1000})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className={`text-xs ${getSubtextClass()} mt-1`}>Requests per hour per user</p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Max Users</label>
              <input
                type="number"
                value={systemConfig?.maxUsers || 10000}
                onChange={(e) => setSystemConfig({...systemConfig, maxUsers: parseInt(e.target.value) || 10000})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className={`text-xs ${getSubtextClass()} mt-1`}>Maximum number of users allowed</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Security Level</label>
              <select
                value={systemConfig?.securityLevel || 'high'}
                onChange={(e) => setSystemConfig({...systemConfig, securityLevel: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Version</label>
              <input
                type="text"
                value={systemConfig?.version || '1.0.0'}
                onChange={(e) => setSystemConfig({...systemConfig, version: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Backup Frequency</label>
              <select
                value={systemConfig?.backupFrequency || 'daily'}
                onChange={(e) => setSystemConfig({...systemConfig, backupFrequency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSystemConfig}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save System Config'}</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderBusinessInfoTab = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-4 flex items-center space-x-2`}>
          <Building2 className="w-5 h-5" />
          <span>Business Information</span>
        </h3>
        <p className={`${getSubtextClass()} mb-6`}>Configure your business details and contact information.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Company Name</label>
              <input
                type="text"
                value={businessSettings.companyName}
                onChange={(e) => setBusinessSettings({...businessSettings, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Support Email</label>
              <input
                type="email"
                value={businessSettings.supportEmail}
                onChange={(e) => setBusinessSettings({...businessSettings, supportEmail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="support@company.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Website</label>
              <input
                type="url"
                value={businessSettings.website}
                onChange={(e) => setBusinessSettings({...businessSettings, website: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://company.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Phone</label>
              <input
                type="tel"
                value={businessSettings.phone}
                onChange={(e) => setBusinessSettings({...businessSettings, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Address</label>
              <textarea
                value={businessSettings.address}
                onChange={(e) => setBusinessSettings({...businessSettings, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter business address"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>Description</label>
              <textarea
                value={businessSettings.description}
                onChange={(e) => setBusinessSettings({...businessSettings, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Brief description of your business"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={saveBusinessSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Business Info'}</span>
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className={`text-lg ${getTextColor()}`}>Loading system settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className={`text-lg ${getTextColor()}`}>{error}</p>
          <button 
            onClick={fetchSystemSettings}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 mt-1">Configure global system settings and business information</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'system' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          System Config
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'business' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Business Info
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'system' && renderSystemConfigTab()}
      {activeTab === 'business' && renderBusinessInfoTab()}

      {/* Save Status */}
      {saveStatus && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          saveStatus === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {saveStatus === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>
              {saveStatus === 'success' ? 'Settings saved successfully!' : 'Failed to save settings'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemSettings