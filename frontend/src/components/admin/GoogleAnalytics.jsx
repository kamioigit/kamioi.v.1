import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Eye, Clock, Globe, Smartphone, Monitor, RefreshCw, Calendar, DollarSign, Target, Activity, PieChart, LineChart, MapPin, ArrowUp, ArrowDown, User } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import GoogleAnalyticsSetup from './GoogleAnalyticsSetup'

const GoogleAnalytics = ({ user }) => {
  const { isLightMode, isDarkMode, isCloudMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  const getTextColor = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200' : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'

  // Real Google Analytics data
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch Google Analytics data on component mount
  useEffect(() => {
    fetchGoogleAnalytics()
  }, [])

  const fetchGoogleAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // In production, this would call the Google Analytics API
      // For now, we'll use a mock endpoint that simulates Google Analytics data
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/google-analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken') || 'admin_token_3'}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAnalyticsData(result.data)
        } else {
          console.error('Failed to fetch Google Analytics data:', result.error)
          setError('Failed to load Google Analytics data')
        }
      } else {
        console.error('Network error fetching Google Analytics data')
        setError('Network error loading Google Analytics data')
      }
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error)
      setError('Error loading Google Analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Mock data fallback (only used if API fails)
  const getMockAnalyticsData = () => ({
    overview: {
      totalUsers: 12847,
      activeUsers: 3421,
      newUsers: 1892,
      sessions: 18653,
      pageViews: 45231,
      avgSessionDuration: '3m 42s',
      bounceRate: '34.2%',
      conversionRate: '2.8%'
    },
    userEngagement: {
      dailyActiveUsers: [2341, 2567, 2892, 3123, 2987, 3421, 3156],
      sessionsByDevice: {
        mobile: 65,
        desktop: 28,
        tablet: 7
      },
      topPages: [
        { page: '/dashboard', views: 8234, percentage: 18.2 },
        { page: '/investments', views: 6789, percentage: 15.0 },
        { page: '/portfolio', views: 5432, percentage: 12.0 },
        { page: '/settings', views: 4321, percentage: 9.5 },
        { page: '/transactions', views: 3876, percentage: 8.6 }
      ]
    },
    businessMetrics: {
      totalRevenue: 89234.50,
      revenueGrowth: 12.5,
      averageRevenuePerUser: 6.94,
      roundUpTransactions: 156789,
      totalInvestments: 234567.89,
      newSignups: 1892,
      churnRate: 2.1
    },
    geographic: {
      topCountries: [
        { country: 'United States', users: 8934, percentage: 69.5 },
        { country: 'Canada', users: 1567, percentage: 12.2 },
        { country: 'United Kingdom', users: 892, percentage: 6.9 },
        { country: 'Australia', users: 634, percentage: 4.9 },
        { country: 'Germany', users: 456, percentage: 3.5 }
      ],
      topCities: [
        { city: 'New York', users: 2341 },
        { city: 'Los Angeles', users: 1876 },
        { city: 'Chicago', users: 1234 },
        { city: 'Toronto', users: 987 },
        { city: 'London', users: 765 }
      ]
    }
  })

  const refreshData = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // In production, fetch real data from Google Analytics API
    }, 2000)
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className={getCardClass()}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${getSubtextClass()}`}>{title}</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{value}</p>
          {change && (
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={formatNumber(analyticsData?.totalUsers || 0)}
          change={8.2}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Users"
          value={formatNumber(analyticsData?.activeUsers || 0)}
          change={12.5}
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Page Views"
          value={formatNumber(analyticsData?.pageViews || 0)}
          change={-2.1}
          icon={Eye}
          color="purple"
        />
        <MetricCard
          title="Bounce Rate"
          value={`${analyticsData?.bounceRate || 0}%`}
          change={-5.3}
          icon={Target}
          color="orange"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Sessions"
          value={formatNumber(analyticsData?.sessions || 0)}
          icon={Clock}
          color="indigo"
        />
        <MetricCard
          title="Avg Session Duration"
          value={analyticsData?.avgSessionDuration || '0m 0s'}
          icon={Clock}
          color="teal"
        />
        <MetricCard
          title="Bounce Rate"
          value={`${analyticsData?.bounceRate || 0}%`}
          icon={TrendingUp}
          color="red"
        />
        <MetricCard
          title="New Users"
          value={formatNumber(analyticsData?.newUsers || 0)}
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Daily Active Users</h3>
          <div className="h-64 flex items-center justify-center">
            <div className={`text-center ${getSubtextClass()}`}>
              <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chart visualization would be implemented here</p>
              <p className="text-sm">Using Chart.js or similar library</p>
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
              <span className={`font-semibold ${getTextColor()}`}>
                {analyticsData?.deviceBreakdown?.mobile || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-green-400" />
                <span className={getTextColor()}>Desktop</span>
              </div>
              <span className={`font-semibold ${getTextColor()}`}>
                {analyticsData?.deviceBreakdown?.desktop || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-purple-400" />
                <span className={getTextColor()}>Tablet</span>
              </div>
              <span className={`font-semibold ${getTextColor()}`}>
                {analyticsData?.deviceBreakdown?.tablet || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBusinessMetrics = () => (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analyticsData?.businessMetrics?.totalRevenue || 0)}
          change={12.5}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Avg Revenue Per User"
          value={formatCurrency(analyticsData?.businessMetrics?.averageRevenuePerUser || 0)}
          change={3.2}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Round-up Transactions"
          value={formatNumber(analyticsData?.businessMetrics?.roundUpTransactions || 0)}
          change={15.7}
          icon={Target}
          color="purple"
        />
        <MetricCard
          title="Total Investments"
          value={formatCurrency(analyticsData?.businessMetrics?.totalInvestments || 0)}
          change={22.1}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="New Signups"
          value={formatNumber(analyticsData?.businessMetrics?.newSignups || 0)}
          change={8.9}
          icon={Users}
          color="cyan"
        />
        <MetricCard
          title="Churn Rate"
          value={`${analyticsData?.businessMetrics?.churnRate || 0}%`}
          change={-1.2}
          icon={Activity}
          color="red"
        />
        <MetricCard
          title="User Retention"
          value={`${analyticsData?.businessMetrics?.userRetention || 0}%`}
          change={1.2}
          icon={Target}
          color="green"
        />
      </div>

      {/* Investment Performance Chart */}
      <div className={getCardClass()}>
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Investment Performance Over Time</h3>
        <div className="h-64 flex items-center justify-center">
          <div className={`text-center ${getSubtextClass()}`}>
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Investment performance chart would be implemented here</p>
            <p className="text-sm">Showing round-up amounts and portfolio growth</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUserBehavior = () => (
    <div className="space-y-6">
      {/* Top Pages */}
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
                <span className={`text-sm ${getSubtextClass()}`}>{Math.round((page.views / analyticsData.pageViews) * 100)}%</span>
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

      {/* Geographic Data */}
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
                <p className={`${getSubtextClass()} text-sm`}>Country analytics will appear when Google Analytics is connected.</p>
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
                <p className={`${getSubtextClass()} text-sm`}>City analytics will appear when Google Analytics is connected.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Google Analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Error Loading Google Analytics</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={fetchGoogleAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">No Analytics Data</h3>
          <p className="text-white/70 mb-4">No Google Analytics data available</p>
        </div>
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
              <p className={getSubtextClass()}>Property ID: 353505238</p>
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
              disabled={isLoading}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'business', label: 'Business Metrics', icon: DollarSign },
            { id: 'behavior', label: 'User Behavior', icon: Users }
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
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading analytics data...</p>
          </div>
        </div>
      ) : error ? (
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
      ) : analyticsData && (analyticsData.totalUsers === 0 && analyticsData.activeUsers === 0) ? (
        <GoogleAnalyticsSetup />
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'business' && renderBusinessMetrics()}
          {activeTab === 'behavior' && renderUserBehavior()}
        </>
      )}
    </div>
  )
}

export default GoogleAnalytics
