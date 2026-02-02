import React, { useState, useEffect } from 'react'
import { BarChart3, Users, Eye, Globe, RefreshCw, Settings, Save, CheckCircle, ExternalLink, AlertCircle, ArrowRight } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const GoogleAnalytics = ({ user }) => {
  const { isLightMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  const getTextColor = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200' : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'
  const getInputClass = () => isLightMode ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/10 border-white/20 text-white'

  // GA Settings state
  const [gaSettings, setGaSettings] = useState({
    propertyId: '',
    measurementId: '',
    isConfigured: false,
    trackingEnabled: false
  })
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Analytics status
  const [analyticsStatus, setAnalyticsStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch GA settings on mount
  useEffect(() => {
    fetchGASettings()
  }, [])

  // Fetch analytics status when settings are loaded
  useEffect(() => {
    if (!settingsLoading) {
      fetchAnalyticsStatus()
    }
  }, [settingsLoading])

  const fetchGASettings = async () => {
    try {
      setSettingsLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/google-analytics/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setGaSettings(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching GA settings:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  const fetchAnalyticsStatus = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/google-analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAnalyticsStatus(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching analytics status:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveGASettings = async () => {
    try {
      setSavingSettings(true)
      setSettingsSaved(false)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/google-analytics/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'}`
        },
        body: JSON.stringify(gaSettings)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setGaSettings(result.data)
          setSettingsSaved(true)
          setTimeout(() => setSettingsSaved(false), 3000)
          fetchAnalyticsStatus()
        }
      }
    } catch (error) {
      console.error('Error saving GA settings:', error)
    } finally {
      setSavingSettings(false)
    }
  }

  // Settings Tab Content
  const renderSettings = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 text-blue-400 mr-3" />
          <h3 className={`text-xl font-semibold ${getTextColor()}`}>Google Analytics Configuration</h3>
        </div>

        <div className="space-y-6">
          {/* Property ID */}
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
              Google Analytics Property ID *
            </label>
            <input
              type="text"
              value={gaSettings.propertyId}
              onChange={(e) => setGaSettings(prev => ({ ...prev, propertyId: e.target.value }))}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputClass()}`}
              placeholder="Enter your GA4 Property ID (e.g., 353505238)"
            />
            <p className={`${getSubtextClass()} text-sm mt-2`}>
              Find this in Google Analytics → Admin → Property Settings → Property ID
            </p>
          </div>

          {/* Measurement ID */}
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
              Measurement ID (for tracking)
            </label>
            <input
              type="text"
              value={gaSettings.measurementId}
              onChange={(e) => setGaSettings(prev => ({ ...prev, measurementId: e.target.value }))}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${getInputClass()}`}
              placeholder="G-XXXXXXXXXX"
            />
            <p className={`${getSubtextClass()} text-sm mt-2`}>
              Find this in Google Analytics → Admin → Data Streams → Web → Measurement ID
            </p>
          </div>

          {/* Tracking Toggle */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} border ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
            <div>
              <p className={`font-medium ${getTextColor()}`}>Enable Tracking</p>
              <p className={`text-sm ${getSubtextClass()}`}>Track page views and events on your website</p>
            </div>
            <button
              onClick={() => setGaSettings(prev => ({ ...prev, trackingEnabled: !prev.trackingEnabled }))}
              className={`w-14 h-7 rounded-full transition-colors ${gaSettings.trackingEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${gaSettings.trackingEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Save Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={saveGASettings}
              disabled={savingSettings || !gaSettings.propertyId}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {savingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : settingsSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>

            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Google Analytics</span>
            </a>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className={getCardClass()}>
        <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Setup Instructions</h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Create a Google Analytics 4 Property</p>
              <p className={`${getSubtextClass()} text-sm`}>
                Go to <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">analytics.google.com</a> and create a new GA4 property for your website.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Get Your Property ID</p>
              <p className={`${getSubtextClass()} text-sm`}>
                Go to Admin → Property Settings → Copy the Property ID (numeric value like 353505238)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Get Your Measurement ID</p>
              <p className={`${getSubtextClass()} text-sm`}>
                Go to Admin → Data Streams → Web → Copy the Measurement ID (starts with G-)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">4</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Save Your Settings</p>
              <p className={`${getSubtextClass()} text-sm`}>
                Enter both IDs above and click Save. Your website will start tracking visitors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className={getCardClass()}>
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className={`${getTextColor()} font-medium mb-2`}>Important Notes</h4>
            <ul className={`${getSubtextClass()} text-sm space-y-1`}>
              <li>• Data may take 24-48 hours to appear in Google Analytics</li>
              <li>• The Property ID is numeric (e.g., 353505238)</li>
              <li>• The Measurement ID starts with G- (e.g., G-XXXXXXXXXX)</li>
              <li>• Make sure your domain is added to the data stream</li>
              <li>• View your analytics data directly in Google Analytics dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  // Overview Tab - Show status and link to GA dashboard
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Configuration Status */}
      <div className={getCardClass()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Tracking Status</h3>
          {analyticsStatus?.trackingConfigured ? (
            <span className="flex items-center text-green-400">
              <CheckCircle className="w-5 h-5 mr-2" />
              Configured
            </span>
          ) : (
            <span className="flex items-center text-yellow-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              Not Configured
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'}`}>
            <p className={getSubtextClass()}>Property ID</p>
            <p className={`text-lg font-semibold ${getTextColor()}`}>
              {analyticsStatus?.propertyId || 'Not set'}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'}`}>
            <p className={getSubtextClass()}>Measurement ID</p>
            <p className={`text-lg font-semibold ${getTextColor()}`}>
              {analyticsStatus?.measurementId || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* View Analytics */}
      <div className={getCardClass()}>
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${getTextColor()} mb-4`}>View Your Analytics</h2>
          <p className={`${getSubtextClass()} mb-6 max-w-lg mx-auto`}>
            {analyticsStatus?.trackingConfigured
              ? 'Your Google Analytics tracking is configured. View detailed metrics, user behavior, and traffic data directly in Google Analytics.'
              : 'Configure your Google Analytics Property ID and Measurement ID in the Settings tab to start tracking visitors.'}
          </p>

          {analyticsStatus?.trackingConfigured ? (
            <a
              href={analyticsStatus?.analyticsUrl || 'https://analytics.google.com/'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              <span>Open Google Analytics Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          ) : (
            <button
              onClick={() => setActiveTab('settings')}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Configure Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Features Available in GA */}
      <div className={getCardClass()}>
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Available in Google Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} border ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className={`font-medium ${getTextColor()} mb-1`}>User Analytics</h4>
            <p className={`text-sm ${getSubtextClass()}`}>Track users, sessions, and engagement metrics</p>
          </div>
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} border ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
            <Eye className="w-8 h-8 text-green-400 mb-3" />
            <h4 className={`font-medium ${getTextColor()} mb-1`}>Page Views</h4>
            <p className={`text-sm ${getSubtextClass()}`}>See which pages are most popular</p>
          </div>
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} border ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
            <Globe className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className={`font-medium ${getTextColor()} mb-1`}>Geographic Data</h4>
            <p className={`text-sm ${getSubtextClass()}`}>See where your visitors come from</p>
          </div>
        </div>
      </div>
    </div>
  )

  // User Behavior Tab
  const renderUserBehavior = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
          <h3 className={`text-xl font-semibold ${getTextColor()} mb-2`}>User Behavior Analytics</h3>
          <p className={`${getSubtextClass()} mb-6 max-w-md mx-auto`}>
            View detailed user behavior data including page flows, time on site, bounce rates, and user journeys in Google Analytics.
          </p>
          <a
            href={analyticsStatus?.analyticsUrl || 'https://analytics.google.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View in Google Analytics</span>
          </a>
        </div>
      </div>

      <div className={getCardClass()}>
        <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Reports Available</h4>
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} flex items-center justify-between`}>
            <span className={getTextColor()}>Pages and Screens</span>
            <span className={getSubtextClass()}>Reports → Engagement</span>
          </div>
          <div className={`p-3 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} flex items-center justify-between`}>
            <span className={getTextColor()}>User Flow</span>
            <span className={getSubtextClass()}>Explore → Path Exploration</span>
          </div>
          <div className={`p-3 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} flex items-center justify-between`}>
            <span className={getTextColor()}>Conversions</span>
            <span className={getSubtextClass()}>Reports → Engagement → Conversions</span>
          </div>
          <div className={`p-3 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} flex items-center justify-between`}>
            <span className={getTextColor()}>Demographics</span>
            <span className={getSubtextClass()}>Reports → User → Demographics</span>
          </div>
        </div>
      </div>
    </div>
  )

  // Business Metrics Tab
  const renderBusinessMetrics = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
          <h3 className={`text-xl font-semibold ${getTextColor()} mb-2`}>Business Metrics</h3>
          <p className={`${getSubtextClass()} mb-6 max-w-md mx-auto`}>
            Track revenue, conversions, and business KPIs by setting up custom events and goals in Google Analytics.
          </p>
          <a
            href={analyticsStatus?.analyticsUrl || 'https://analytics.google.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View in Google Analytics</span>
          </a>
        </div>
      </div>

      <div className={getCardClass()}>
        <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Setting Up Business Tracking</h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Configure Conversions</p>
              <p className={`${getSubtextClass()} text-sm`}>
                Set up conversion events for signups, purchases, and key actions in GA Admin → Events → Mark as conversion
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Enable E-commerce Tracking</p>
              <p className={`${getSubtextClass()} text-sm`}>
                For revenue tracking, enable enhanced e-commerce in your data stream settings
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Create Custom Reports</p>
              <p className={`${getSubtextClass()} text-sm`}>
                Use GA4's Explore feature to build custom reports for your business metrics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Loading state
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${isLightMode ? 'border-gray-800' : 'border-white'} mx-auto mb-4`}></div>
          <p className={`${getTextColor()} text-lg`}>Loading Google Analytics...</p>
        </div>
      </div>
    )
  }

  // Not configured - show setup prompt
  if (!gaSettings.isConfigured && activeTab !== 'settings') {
    return (
      <div className="space-y-6">
        <div className={getCardClass()}>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className={`text-2xl font-bold ${getTextColor()} mb-4`}>Configure Google Analytics</h2>
            <p className={`${getSubtextClass()} mb-8 max-w-md mx-auto`}>
              Connect your Google Analytics account to track website visitors and view analytics data.
            </p>
            <button
              onClick={() => setActiveTab('settings')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <Settings className="w-5 h-5" />
              <span>Set Up Google Analytics</span>
            </button>
          </div>
        </div>

        {renderSettings()}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={getCardClass()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${getTextColor()}`}>Google Analytics</h2>
              <p className={getSubtextClass()}>
                Property ID: {gaSettings.propertyId || 'Not configured'}
                {gaSettings.isConfigured && <CheckCircle className="w-4 h-4 text-green-400 inline ml-2" />}
              </p>
            </div>
          </div>
          <a
            href={analyticsStatus?.analyticsUrl || 'https://analytics.google.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Dashboard</span>
          </a>
        </div>

        {/* Tabs */}
        <div className={`flex space-x-1 ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} rounded-lg p-1`}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'behavior', label: 'User Behavior', icon: Users },
            { id: 'business', label: 'Business Metrics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : `${isLightMode ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && activeTab !== 'settings' ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${isLightMode ? 'border-gray-800' : 'border-white'} mx-auto mb-4`}></div>
            <p className={`${getTextColor()} text-lg`}>Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'behavior' && renderUserBehavior()}
          {activeTab === 'business' && renderBusinessMetrics()}
          {activeTab === 'settings' && renderSettings()}
        </>
      )}
    </div>
  )
}

export default GoogleAnalytics
