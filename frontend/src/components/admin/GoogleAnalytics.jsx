import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Eye, Clock, Globe, Smartphone, Monitor, RefreshCw, DollarSign, Target, Activity, LineChart, MapPin, ArrowUp, ArrowDown, Settings, Save, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const GoogleAnalytics = ({ user }) => {
  const { isLightMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

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

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch GA settings on mount
  useEffect(() => {
    fetchGASettings()
  }, [])

  // Fetch analytics data when settings are loaded
  useEffect(() => {
    if (!settingsLoading && gaSettings.isConfigured) {
      fetchGoogleAnalytics()
    } else if (!settingsLoading && !gaSettings.isConfigured) {
      setLoading(false)
    }
  }, [settingsLoading, gaSettings.isConfigured])

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
          // Reload analytics if now configured
          if (result.data.isConfigured) {
            fetchGoogleAnalytics()
          }
        }
      }
    } catch (error) {
      console.error('Error saving GA settings:', error)
    } finally {
      setSavingSettings(false)
    }
  }

  const fetchGoogleAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/google-analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAnalyticsData(result.data)
        } else {
          setError('Failed to load Google Analytics data')
        }
      } else {
        setError('Network error loading Google Analytics data')
      }
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error)
      setError('Error loading Google Analytics data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    setIsLoading(true)
    fetchGoogleAnalytics().finally(() => setIsLoading(false))
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || '0'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className={getCardClass()}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${getSubtextClass()}`}>{title}</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              <span className="text-sm">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </div>
  )

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
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
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
                Enter both IDs above and click Save. Analytics data will appear after Google processes your traffic.
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
              <li>• Real-time data integration requires Google Analytics API setup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Users" value={formatNumber(analyticsData?.totalUsers)} change={8.2} icon={Users} color="blue" />
        <MetricCard title="Active Users" value={formatNumber(analyticsData?.activeUsers)} change={12.5} icon={Activity} color="green" />
        <MetricCard title="Page Views" value={formatNumber(analyticsData?.pageViews)} change={-2.1} icon={Eye} color="purple" />
        <MetricCard title="Bounce Rate" value={`${analyticsData?.bounceRate || 0}%`} change={-5.3} icon={Target} color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Sessions" value={formatNumber(analyticsData?.sessions)} icon={Clock} color="indigo" />
        <MetricCard title="Avg Session Duration" value={analyticsData?.avgSessionDuration || '0m 0s'} icon={Clock} color="teal" />
        <MetricCard title="Conversion Rate" value="2.8%" icon={TrendingUp} color="red" />
        <MetricCard title="New Users" value={formatNumber(analyticsData?.newUsers)} icon={Users} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Daily Active Users</h3>
          <div className="h-64 flex items-center justify-center">
            <div className={`text-center ${getSubtextClass()}`}>
              <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Connect Google Analytics API for real-time charts</p>
              <p className="text-sm mt-2">Go to Settings tab to configure</p>
            </div>
          </div>
        </div>

        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Device Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <span className={getTextColor()}>Mobile</span>
              </div>
              <span className={`font-semibold ${getTextColor()}`}>{analyticsData?.deviceBreakdown?.mobile || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-green-400" />
                <span className={getTextColor()}>Desktop</span>
              </div>
              <span className={`font-semibold ${getTextColor()}`}>{analyticsData?.deviceBreakdown?.desktop || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-purple-400" />
                <span className={getTextColor()}>Tablet</span>
              </div>
              <span className={`font-semibold ${getTextColor()}`}>{analyticsData?.deviceBreakdown?.tablet || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBusinessMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={formatCurrency(analyticsData?.businessMetrics?.totalRevenue)} change={12.5} icon={DollarSign} color="green" />
        <MetricCard title="Avg Revenue Per User" value={formatCurrency(analyticsData?.businessMetrics?.averageRevenuePerUser)} change={3.2} icon={Users} color="blue" />
        <MetricCard title="Round-up Transactions" value={formatNumber(analyticsData?.businessMetrics?.roundUpTransactions)} change={15.7} icon={Target} color="purple" />
        <MetricCard title="Total Investments" value={formatCurrency(analyticsData?.businessMetrics?.totalInvestments)} change={22.1} icon={TrendingUp} color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="New Signups" value={formatNumber(analyticsData?.businessMetrics?.newSignups)} change={8.9} icon={Users} color="cyan" />
        <MetricCard title="Churn Rate" value={`${analyticsData?.businessMetrics?.churnRate || 0}%`} change={-1.2} icon={Activity} color="red" />
        <MetricCard title="User Retention" value={`${analyticsData?.businessMetrics?.userRetention || 0}%`} change={1.2} icon={Target} color="green" />
      </div>

      <div className={getCardClass()}>
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Investment Performance Over Time</h3>
        <div className="h-64 flex items-center justify-center">
          <div className={`text-center ${getSubtextClass()}`}>
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Connect Google Analytics API for real-time charts</p>
            <p className="text-sm mt-2">Go to Settings tab to configure</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUserBehavior = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Top Pages</h3>
        <div className="space-y-3">
          {analyticsData?.topPages?.map((page, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${getSubtextClass()}`}>#{index + 1}</span>
                <span className={getTextColor()}>{page.page}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${getSubtextClass()}`}>{Math.round((page.views / (analyticsData?.pageViews || 1)) * 100)}%</span>
                <span className={`font-semibold ${getTextColor()}`}>{formatNumber(page.views)}</span>
              </div>
            </div>
          )) || (
            <div className="text-center py-8">
              <p className={`${getSubtextClass()} text-lg`}>No page data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Top Countries</h3>
          <div className="space-y-3">
            {analyticsData?.geographic?.countries?.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className={getTextColor()}>{country.country}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${getSubtextClass()}`}>{country.percentage}%</span>
                  <span className={`font-semibold ${getTextColor()}`}>{formatNumber(country.users)}</span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className={`${getSubtextClass()} text-lg mb-2`}>No Geographic Data</p>
              </div>
            )}
          </div>
        </div>

        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Top Cities</h3>
          <div className="space-y-3">
            {analyticsData?.geographic?.cities?.map((city, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className={getTextColor()}>{city.city}</span>
                </div>
                <span className={`font-semibold ${getTextColor()}`}>{formatNumber(city.users)}</span>
              </div>
            )) || (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className={`${getSubtextClass()} text-lg mb-2`}>No City Data</p>
              </div>
            )}
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Google Analytics...</p>
        </div>
      </div>
    )
  }

  // Not configured - show setup
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
              Connect your Google Analytics account to see real-time website analytics, user behavior, and business metrics.
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

        {/* Show settings tab content */}
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
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={refreshData}
              disabled={isLoading || loading}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'business', label: 'Business Metrics', icon: DollarSign },
            { id: 'behavior', label: 'User Behavior', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
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
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading analytics data...</p>
          </div>
        </div>
      ) : error && activeTab !== 'settings' ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-white/70 mb-4">{error}</p>
            <button
              onClick={fetchGoogleAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'business' && renderBusinessMetrics()}
          {activeTab === 'behavior' && renderUserBehavior()}
          {activeTab === 'settings' && renderSettings()}
        </>
      )}
    </div>
  )
}

export default GoogleAnalytics
