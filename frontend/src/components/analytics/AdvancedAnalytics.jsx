import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar, 
  Filter, 
  Download, 
  Eye, 
  BarChart3, 
  PieChart, 
  LineChart,
  Activity,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Award,
  Users,
  Building2
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import RechartsChart from '../common/RechartsChart'

const AdvancedAnalytics = ({ user, accountType = 'individual' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
   const { isLightMode } = useTheme()
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [insights, setInsights] = useState([])

  const getTextColor = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200' : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'

  // Real advanced analytics data
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch advanced analytics data on component mount
  useEffect(() => {
    fetchAdvancedAnalytics()
  }, [])

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/analytics/advanced?accountType=${accountType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_token')}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAnalyticsData(result.data)
        } else {
          console.error('Failed to fetch advanced analytics:', result.error)
          setError('Failed to load advanced analytics data')
        }
      } else {
        console.error('Network error fetching advanced analytics')
        setError('Network error loading advanced analytics data')
      }
    } catch (error) {
      console.error('Error fetching advanced analytics:', error)
      setError('Error loading advanced analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Mock data fallback (only used if API fails)
  const getMockAnalyticsData = () => ({
    performance: {
      totalReturn: 12.5,
      benchmarkReturn: 8.2,
      alpha: 4.3,
      sharpeRatio: 1.8,
      maxDrawdown: -3.2,
      volatility: 15.6
    },
    insights: [
      {
        id: 1,
        type: 'positive',
        title: 'Strong Performance vs Market',
        description: 'Your portfolio is outperforming the S&P 500 by 4.3% this quarter',
        impact: 'high',
        action: 'Consider maintaining current allocation',
        icon: TrendingUp
      },
      {
        id: 2,
        type: 'warning',
        title: 'High Concentration Risk',
        description: '45% of your portfolio is in technology stocks',
        impact: 'medium',
        action: 'Consider diversifying into other sectors',
        icon: AlertTriangle
      },
      {
        id: 3,
        type: 'info',
        title: 'Tax Optimization Opportunity',
        description: 'You could save $240 annually with tax-loss harvesting',
        impact: 'medium',
        action: 'Enable automatic tax-loss harvesting',
        icon: Brain
      },
      {
        id: 4,
        type: 'positive',
        title: 'Consistent Saving Pattern',
        description: 'You\'ve maintained your round-up goal for 45 days straight',
        impact: 'high',
        action: 'Keep up the great work!',
        icon: CheckCircle
      }
    ],
    sectorAllocation: [
      { name: 'Technology', value: 45, change: 2.1, color: '#3b82f6' },
      { name: 'Healthcare', value: 20, change: -0.8, color: '#10b981' },
      { name: 'Finance', value: 15, change: 1.2, color: '#f59e0b' },
      { name: 'Consumer', value: 12, change: -0.5, color: '#ef4444' },
      { name: 'Other', value: 8, change: 0.3, color: '#8b5cf6' }
    ],
    riskMetrics: {
      beta: 1.2,
      correlation: 0.85,
      valueAtRisk: 2.8,
      expectedShortfall: 4.1
    },
    behavioralInsights: {
      averageTransactionSize: 45.50,
      mostActiveDay: 'Friday',
      peakSpendingTime: '12:00 PM',
      topCategories: ['Food & Dining', 'Shopping', 'Entertainment'],
      savingsRate: 8.5
    }
  })

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'info': return <Brain className="w-5 h-5 text-blue-400" />
      default: return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return 'border-green-500/30 bg-green-500/10'
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10'
      case 'info': return 'border-blue-500/30 bg-blue-500/10'
      default: return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="text-center py-16">
        <div className="flex flex-col items-center space-y-6">
          <div className="p-8 rounded-full bg-blue-500/30 border-2 border-blue-500/50">
            <BarChart3 className="w-20 h-20 text-blue-500" />
          </div>
          <div>
            <h3 className={`text-3xl font-bold ${getTextColor()} mb-3`}>Overview Analytics</h3>
            <p className={`${getSubtextClass()} text-xl max-w-lg mx-auto leading-relaxed`}>
              Your comprehensive analytics overview will appear here once you start investing and have transaction data.
            </p>
          </div>
          <div className="mt-8">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl text-lg">
              Start Your First Investment
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="text-center py-16">
        <div className="flex flex-col items-center space-y-6">
          <div className="p-8 rounded-full bg-green-500/30 border-2 border-green-500/50">
            <TrendingUp className="w-20 h-20 text-green-500" />
          </div>
          <div>
            <h3 className={`text-3xl font-bold ${getTextColor()} mb-3`}>Performance Analytics</h3>
            <p className={`${getSubtextClass()} text-xl max-w-lg mx-auto leading-relaxed`}>
              Detailed performance metrics and risk analysis will be available once you have sufficient investment history.
            </p>
          </div>
          <div className="mt-8">
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl text-lg">
              View Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBehavioral = () => (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="text-center py-16">
        <div className="flex flex-col items-center space-y-6">
          <div className="p-8 rounded-full bg-purple-500/30 border-2 border-purple-500/50">
            <Users className="w-20 h-20 text-purple-500" />
          </div>
          <div>
            <h3 className={`text-3xl font-bold ${getTextColor()} mb-3`}>Behavioral Analytics</h3>
            <p className={`${getSubtextClass()} text-xl max-w-lg mx-auto leading-relaxed`}>
              Spending patterns and behavioral insights will be generated as you make transactions and build your investment history.
            </p>
          </div>
          <div className="mt-8">
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl text-lg">
              Start Tracking
            </button>
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
          <p className="text-white text-lg">Loading advanced analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Error Loading Advanced Analytics</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={fetchAdvancedAnalytics}
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
            <Brain className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">No Analytics Data</h3>
          <p className="text-white/70 mb-4">No advanced analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${getTextColor()} flex items-center space-x-3`}>
            <Brain className="w-8 h-8 text-blue-500" />
            <span>Advanced Analytics</span>
          </h1>
          <p className={`${getSubtextClass()} mt-1 text-lg`}>AI-powered insights and performance analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 rounded-lg border-2 border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold ${
              isLightMode ? 'bg-white text-gray-800' : 'bg-white/20 text-white'
            }`}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-6 py-2 flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/10 rounded-lg p-1 border border-white/20">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3, color: 'blue' },
          { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'green' },
          { id: 'behavioral', label: 'Behavioral', icon: Users, color: 'purple' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedMetric(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-semibold ${
              selectedMetric === tab.id
                ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/25`
                : `${getSubtextClass()} hover:bg-white/10 hover:text-white`
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={getCardClass()}>
        {selectedMetric === 'overview' && renderOverview()}
        {selectedMetric === 'performance' && renderPerformance()}
        {selectedMetric === 'behavioral' && renderBehavioral()}
      </div>
    </div>
  )
}

export default AdvancedAnalytics
