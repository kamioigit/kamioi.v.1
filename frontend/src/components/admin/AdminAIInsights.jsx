import React, { useState, useEffect } from 'react'
import { Brain, Zap, Target, TrendingUp, Upload, Shield, Lightbulb, RefreshCw } from 'lucide-react'
import RechartsChart from '../common/RechartsChart'
import { useData } from '../../context/DataContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useTheme } from '../../context/ThemeContext'

const AdminAIInsights = ({ user }) => {
  const { addNotification } = useNotifications()
  const { isLightMode } = useTheme()
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m')
  const [recommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiInsights, setAiInsights] = useState({
    diversificationScore: 0,
    riskLevel: 'Unknown',
    growthPotential: 'Unknown',
    cashPosition: 0,
    learningProgress: []
  })

  // Theme helper functions
  const getTextClass = () => isLightMode ? 'text-gray-900' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getSecondaryTextClass = () => isLightMode ? 'text-gray-500' : 'text-gray-300'
  const getCardClass = () => isLightMode
    ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm'
    : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'
  const getInnerCardClass = () => isLightMode
    ? 'bg-gray-50 rounded-lg p-4'
    : 'bg-white/5 rounded-lg p-4'
  const getSelectClass = () => isLightMode
    ? 'bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500'
    : 'bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500'

  const { portfolioValue } = useData()

  // Fetch AI insights from API
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken')

        const response = await fetch(`${apiBaseUrl}/api/admin/ai-insights`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setAiInsights({
              diversificationScore: result.data.diversificationScore || 0,
              riskLevel: result.data.riskLevel || 'Unknown',
              growthPotential: result.data.growthPotential || 'Unknown',
              cashPosition: result.data.cashPosition || 0,
              learningProgress: result.data.learningProgress || []
            })
          }
        }
      } catch (error) {
        console.error('Error fetching AI insights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  // Generate portfolio insights from fetched data
  const portfolioInsights = portfolioValue > 0 ? [
    {
      metric: 'Admin Diversification Score',
      value: aiInsights.diversificationScore,
      target: 90,
      status: aiInsights.diversificationScore >= 80 ? 'Excellent' : aiInsights.diversificationScore >= 60 ? 'Good' : 'Needs Work',
      suggestion: aiInsights.diversificationScore < 80 ? 'Consider diversifying across more sectors' : 'Portfolio is well diversified'
    },
    {
      metric: 'Admin Risk Level',
      value: aiInsights.riskLevel,
      target: 'Balanced',
      status: aiInsights.riskLevel === 'Low' || aiInsights.riskLevel === 'Moderate' ? 'Optimal' : 'Review Needed',
      suggestion: `Current risk level is ${aiInsights.riskLevel.toLowerCase()}`
    },
    {
      metric: 'Admin Growth Potential',
      value: aiInsights.growthPotential,
      target: 'High',
      status: aiInsights.growthPotential === 'High' ? 'Excellent' : aiInsights.growthPotential === 'Medium' ? 'Good' : 'Low',
      suggestion: 'Portfolio aligned with growth objectives'
    }
  ] : []

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className={getCardClass()}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Brain className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${getTextClass()}`}>Admin AI Investment Advisor</h2>
            <p className={getSecondaryTextClass()}>Powered by machine learning and admin market analysis</p>
          </div>
        </div>

        {/* Portfolio Health Dashboard */}
        {portfolioInsights.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {portfolioInsights.map((insight, index) => (
              <div key={index} className={getInnerCardClass()}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`${getSubtextClass()} text-sm`}>{insight.metric}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    insight.status === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                    insight.status === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {insight.status}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${getTextClass()} mb-2`}>
                  {typeof insight.value === 'number' ? `${insight.value}/100` : insight.value}
                </div>
                <p className={`${getSubtextClass()} text-sm`}>{insight.suggestion}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${getInnerCardClass()} p-6 mb-6`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className={`w-8 h-8 ${getSubtextClass()}`} />
              </div>
              <h4 className={`${getTextClass()} text-lg font-medium mb-2`}>No admin portfolio data yet</h4>
              <p className={`${getSubtextClass()} text-sm`}>Upload your admin bank statement to get AI insights and recommendations</p>
            </div>
          </div>
        )}

        {/* Market Sentiment */}
        {portfolioValue > 0 && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className={`${getTextClass()} font-medium`}>Admin Market Outlook: Bullish</span>
            </div>
            <p className={`${getSecondaryTextClass()} text-sm`}>
              AI detects positive momentum in technology and healthcare sectors for admin investments.
              Consider increasing admin exposure to growth stocks while maintaining {aiInsights.cashPosition}% cash position.
            </p>
          </div>
        )}
      </div>

      {/* Investment Recommendations */}
      <div className={getCardClass()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${getTextClass()}`}>Admin Smart Recommendations</h3>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className={getSelectClass()}
          >
            <option value="1w">1 Week</option>
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="1y">1 Year</option>
          </select>
        </div>

        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className={`w-8 h-8 ${getSubtextClass()}`} />
              </div>
              <h4 className={`${getTextClass()} text-lg font-medium mb-2`}>No admin recommendations yet</h4>
              <p className={`${getSubtextClass()} text-sm`}>Upload your admin bank statement to get personalized AI investment recommendations</p>
            </div>
          ) : (
            recommendations.map((rec) => (
            <div key={rec.id} className={`${getInnerCardClass()} border-l-4 border-red-500 hover:border-orange-500 transition-all duration-200`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`text-lg font-bold ${
                    rec.action === 'BUY' ? 'text-green-400' :
                    rec.action === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {rec.action} {rec.symbol}
                  </span>
                  <span className={`px-2 py-1 bg-gray-500/20 ${getSecondaryTextClass()} rounded text-sm`}>
                    {rec.sector}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-red-400" />
                    <span className={`${getTextClass()} font-medium`}>${rec.priceTarget}</span>
                  </div>
                  <div className={`${getSubtextClass()} text-sm`}>Current: ${rec.currentPrice}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">{rec.confidence}% Admin Confidence</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-sm">Risk: {rec.risk}</span>
                  </div>
                  <span className={`${getSubtextClass()} text-sm`}>Timeframe: {rec.timeframe}</span>
                </div>
              </div>

              <p className={`${getSecondaryTextClass()} text-sm mb-3`}>{rec.reason}</p>

              <div className="flex space-x-3">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Analyze Admin Stock
                </button>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  View Admin Details
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* AI Learning Section */}
      {portfolioValue > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={getCardClass()}>
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h4 className={`font-bold ${getTextClass()}`}>Admin AI Learning Progress</h4>
            </div>
            <RechartsChart
              type="line"
              height={200}
              series={[{
                name: 'Admin Model Accuracy',
                data: aiInsights.learningProgress.length > 0 ? aiInsights.learningProgress : [0]
              }]}
            />
            <p className={`${getSubtextClass()} text-sm mt-3`}>
              Our AI is learning from your admin investment patterns to provide better recommendations.
            </p>
          </div>

          <div className={getCardClass()}>
            <h4 className={`font-bold ${getTextClass()} mb-4`}>Admin Portfolio Optimization</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={getSubtextClass()}>Current Admin Allocation</span>
                <span className={getTextClass()}>Tech Heavy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={getSubtextClass()}>Suggested Admin Change</span>
                <span className="text-green-400">0% Healthcare</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={getSubtextClass()}>Expected Admin Improvement</span>
                <span className="text-blue-400">0% Returns</span>
              </div>
            </div>
            <button
              onClick={() => addNotification({
                type: 'info',
                title: 'Portfolio Optimization',
                message: 'Admin Portfolio Optimization - This would rebalance your admin portfolio based on AI recommendations',
                timestamp: new Date()
              })}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-lg font-medium mt-4 transition-all duration-200"
            >
              Optimize Admin Portfolio
            </button>
          </div>
        </div>
      ) : (
        <div className={getCardClass()}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className={`w-8 h-8 ${getSubtextClass()}`} />
            </div>
            <h4 className={`${getTextClass()} text-lg font-medium mb-2`}>Admin AI Learning Ready</h4>
            <p className={`${getSubtextClass()} text-sm`}>Start admin investing to enable AI learning and portfolio optimization features</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAIInsights
