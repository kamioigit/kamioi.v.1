import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react'

const AIAnalytics = ({ isLightMode = false }) => {
  const [aiData, setAiData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const getCardClass = () => {
    return isLightMode 
      ? 'bg-white border border-gray-200 shadow-sm' 
      : 'bg-white/10 backdrop-blur-xl border border-white/20'
  }

  const getTextColor = () => {
    return isLightMode ? 'text-gray-800' : 'text-white'
  }

  const getSecondaryTextColor = () => {
    return isLightMode ? 'text-gray-600' : 'text-gray-300'
  }

  const fetchAIAnalytics = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/ai/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAiData(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Error fetching AI analytics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAIAnalytics()
  }, [])

  const processTierUpdates = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/ai/tier-updates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Tier updates processed:', result)
        // Refresh analytics after processing
        fetchAIAnalytics()
      }
    } catch (err) {
      console.error('Error processing tier updates:', err)
    }
  }

  const updateMarketConditions = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/ai/market-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Market conditions updated:', result)
        // Refresh analytics after update
        fetchAIAnalytics()
      }
    } catch (err) {
      console.error('Error updating market conditions:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span className={getTextColor()}>Loading AI Analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-2`}>AI System Unavailable</h3>
        <p className={getSecondaryTextColor()}>Error: {error}</p>
        <button 
          onClick={fetchAIAnalytics}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!aiData) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-2`}>No AI Data Available</h3>
        <p className={getSecondaryTextColor()}>AI analytics are not available at this time.</p>
      </div>
    )
  }

  const { tier_analytics, market_analytics, ai_recommendations } = aiData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextColor()} flex items-center space-x-2`}>
            <Brain className="w-6 h-6 text-blue-400" />
            <span>AI Analytics Dashboard</span>
          </h2>
          <p className={getSecondaryTextColor()}>
            AI-powered insights and recommendations for optimal fee management
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={processTierUpdates}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Process Tier Updates</span>
          </button>
          <button
            onClick={updateMarketConditions}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Market</span>
          </button>
        </div>
      </div>

      {/* AI System Status */}
      <div className={getCardClass() + ' p-6'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className={`font-semibold ${getTextColor()}`}>AI System Status: Active</span>
          </div>
          {lastUpdated && (
            <span className={getSecondaryTextColor()}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Tier Analytics */}
      {tier_analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={getCardClass() + ' p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getSecondaryTextColor() + ' text-sm'}>Total Users</p>
                <p className={`text-2xl font-bold ${getTextColor()}`}>
                  {tier_analytics.overall_stats?.total_users || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className={getCardClass() + ' p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getSecondaryTextColor() + ' text-sm'}>Average Tier</p>
                <p className={`text-2xl font-bold ${getTextColor()}`}>
                  {tier_analytics.overall_stats?.average_tier?.toFixed(1) || '1.0'}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className={getCardClass() + ' p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getSecondaryTextColor() + ' text-sm'}>Upgraded Users</p>
                <p className={`text-2xl font-bold ${getTextColor()}`}>
                  {tier_analytics.overall_stats?.upgraded_users || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className={getCardClass() + ' p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getSecondaryTextColor() + ' text-sm'}>Max Tier</p>
                <p className={`text-2xl font-bold ${getTextColor()}`}>
                  {tier_analytics.overall_stats?.max_tier || 1}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Market Analytics */}
      {market_analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={getCardClass() + ' p-6'}>
            <h3 className={`text-lg font-semibold ${getTextColor()} mb-4 flex items-center space-x-2`}>
              <Activity className="w-5 h-5" />
              <span>Market Conditions</span>
            </h3>
            
            {market_analytics.latest_conditions && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={getSecondaryTextColor()}>Volatility</span>
                  <span className={`font-semibold ${getTextColor()}`}>
                    {(market_analytics.latest_conditions.volatility * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={getSecondaryTextColor()}>Market Sentiment</span>
                  <span className={`font-semibold ${
                    market_analytics.latest_conditions.market_sentiment === 'positive' ? 'text-green-400' :
                    market_analytics.latest_conditions.market_sentiment === 'negative' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {market_analytics.latest_conditions.market_sentiment}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={getSecondaryTextColor()}>Competitive Position</span>
                  <span className="font-semibold text-blue-400">Competitive</span>
                </div>
              </div>
            )}
          </div>

          <div className={getCardClass() + ' p-6'}>
            <h3 className={`text-lg font-semibold ${getTextColor()} mb-4 flex items-center space-x-2`}>
              <PieChart className="w-5 h-5" />
              <span>Competitive Analysis</span>
            </h3>
            
            {market_analytics.competitive_analysis && (
              <div className="space-y-3">
                {Object.entries(market_analytics.competitive_analysis).map(([accountType, data]) => (
                  <div key={accountType} className="flex justify-between items-center">
                    <span className={getSecondaryTextColor()}>
                      {accountType.charAt(0).toUpperCase() + accountType.slice(1)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${getTextColor()}`}>
                        ${data.our_fee}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        data.status === 'premium' ? 'bg-green-500/20 text-green-400' :
                        data.status === 'competitive' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {data.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {ai_recommendations && ai_recommendations.length > 0 && (
        <div className={getCardClass() + ' p-6'}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4 flex items-center space-x-2`}>
            <Brain className="w-5 h-5" />
            <span>AI Recommendations</span>
          </h3>
          
          <div className="space-y-3">
            {ai_recommendations.slice(0, 5).map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  recommendation.priority === 'high' ? 'bg-red-400' :
                  recommendation.priority === 'medium' ? 'bg-yellow-400' :
                  'bg-green-400'
                }`}></div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${getTextColor()}`}>
                    {recommendation.title}
                  </h4>
                  <p className={getSecondaryTextColor() + ' text-sm'}>
                    {recommendation.description}
                  </p>
                  <p className={getSecondaryTextColor() + ' text-xs mt-1'}>
                    Action: {recommendation.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Trends */}
      {market_analytics?.historical_trends && (
        <div className={getCardClass() + ' p-6'}>
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-4 flex items-center space-x-2`}>
            <TrendingUp className="w-5 h-5" />
            <span>Market Trends (Last 30 Days)</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className={getSecondaryTextColor() + ' text-sm'}>Avg Volatility</p>
              <p className={`text-xl font-bold ${getTextColor()}`}>
                {(market_analytics.historical_trends.reduce((sum, trend) => sum + trend.volatility, 0) / market_analytics.historical_trends.length * 100).toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className={getSecondaryTextColor() + ' text-sm'}>Positive Days</p>
              <p className={`text-xl font-bold ${getTextColor()}`}>
                {market_analytics.historical_trends.filter(trend => trend.sentiment === 'positive').length}
              </p>
            </div>
            <div className="text-center">
              <p className={getSecondaryTextColor() + ' text-sm'}>Data Points</p>
              <p className={`text-xl font-bold ${getTextColor()}`}>
                {market_analytics.historical_trends.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAnalytics
