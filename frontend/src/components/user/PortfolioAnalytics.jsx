import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  DollarSign, 
  BarChart3, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Award,
  Globe
} from 'lucide-react'
import RechartsChart from '../common/RechartsChart'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'

const PortfolioAnalytics = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('1y')
  const [selectedMetric, setSelectedMetric] = useState('performance')
  const { portfolioValue, totalRoundUps, transactions = [], holdings = [] } = useData()
  const { isBlackMode, isLightMode} = useTheme()

  // Calculate analytics data
  const totalInvested = totalRoundUps
  const totalFeesPaid = 0 // TODO: Get from API
  const totalFees = totalFeesPaid
  const netGain = portfolioValue - totalInvested
  const roi = totalInvested > 0 ? ((portfolioValue - totalInvested) / totalInvested) * 100 : 0
  
  // Monthly performance data (will be populated from API)
  const monthlyPerformance = []

  // Sector analysis
  const sectorAnalysis = []

  // Risk metrics
  const riskMetrics = {
    volatility: 0.0,
    sharpeRatio: 0.0,
    maxDrawdown: 0.0,
    beta: 0.0
  }

  // Investment insights
  const insights = []

  const getCardClass = () => {
    if (isBlackMode) return 'bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-gray-800'
    if (isLightMode) return 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200'
    return 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'
  }

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getSubtextClass = () => {
    if (isLightMode) return 'text-gray-600'
    return 'text-gray-400'
  }

  const getSelectClass = () => {
    if (isLightMode) return 'bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
    return 'bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
  }

  const getButtonClass = (isActive) => {
    if (isActive) {
      return 'bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200'
    }
    return isLightMode 
      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all duration-200'
      : 'bg-white/10 text-gray-300 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowUpRight className="w-5 h-5 text-white rotate-180" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${getTextClass()}`}>Portfolio Analytics</h1>
            <p className={getSubtextClass()}>Deep insights into your investment performance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={getSelectClass()}
          >
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="2y">2 Years</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex space-x-2">
        {[
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'allocation', label: 'Allocation', icon: PieChart },
          { id: 'risk', label: 'Risk Analysis', icon: Activity },
          { id: 'insights', label: 'AI Insights', icon: Zap }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedMetric(id)}
            className={getButtonClass(selectedMetric === id)}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Performance Tab */}
      {selectedMetric === 'performance' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Total Return</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                  </p>
                  <p className={`text-sm mt-1 ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {roi >= 0 ? '+' : ''}${netGain.toFixed(2)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${roi >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {roi >= 0 ? 
                    <TrendingUp className="w-6 h-6 text-green-400" /> : 
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  }
                </div>
              </div>
            </div>

            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Total Invested</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                    ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`${getSubtextClass()} text-sm mt-1`}>
                    {transactions.length} transactions
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Current Value</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                    ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`${getSubtextClass()} text-sm mt-1`}>
                    {holdings.length} holdings
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/20">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Total Fees</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                    ${totalFees.toFixed(2)}
                  </p>
                  <p className={`${getSubtextClass()} text-sm mt-1`}>
                    {((totalFees/portfolioValue)*100).toFixed(2)}% of portfolio
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/20">
                  <Target className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className={getCardClass()}>
            <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Portfolio Performance Over Time</h3>
            <RechartsChart 
              type="line" 
              height={300}
              series={[{
                name: 'Portfolio Value',
                data: monthlyPerformance.map(m => m.value)
              }]}
              options={{
                xaxis: {
                  categories: monthlyPerformance.map(m => m.month),
                  labels: {
                    style: {
                      colors: isLightMode ? '#374151' : '#ffffff'
                    }
                  }
                },
                yaxis: {
                  labels: {
                    formatter: function(value) {
                      return '$' + value.toLocaleString('en-US', { 
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })
                    },
                    style: {
                      colors: isLightMode ? '#374151' : '#ffffff'
                    }
                  }
                },
                colors: ['#3b82f6'],
                stroke: {
                  width: 3
                },
                grid: {
                  borderColor: isLightMode ? '#e5e7eb' : '#374151'
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Allocation Tab */}
      {selectedMetric === 'allocation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector Allocation Chart */}
            <div className={getCardClass()}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Sector Allocation</h3>
              <RechartsChart 
                type="donut" 
                height={300}
                series={sectorAnalysis.map(s => s.allocation)}
                options={{
                  labels: sectorAnalysis.map(s => s.sector),
                  colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#f97316', '#ec4899'],
                  legend: {
                    position: 'bottom',
                    labels: {
                      colors: isLightMode ? '#374151' : '#ffffff'
                    }
                  },
                  dataLabels: {
                    enabled: false
                  }
                }}
              />
            </div>

            {/* Sector Performance Table */}
            <div className={getCardClass()}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Sector Performance</h3>
              <div className="space-y-3">
                {sectorAnalysis.map((sector, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{sector.sector}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{sector.allocation}% • ${sector.value.toLocaleString()}</p>
                    </div>
                    <div className={`flex items-center space-x-1 ${sector.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {sector.change >= 0 ? 
                        <ArrowUpRight className="w-4 h-4" /> : 
                        <ArrowDownRight className="w-4 h-4" />
                      }
                      <span className="font-medium">{sector.change >= 0 ? '+' : ''}{sector.change}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Analysis Tab */}
      {selectedMetric === 'risk' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Volatility</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>{riskMetrics.volatility}%</p>
                  <p className={`text-sm mt-1 ${riskMetrics.volatility < 15 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {riskMetrics.volatility < 15 ? 'Low Risk' : 'Moderate Risk'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Sharpe Ratio</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>{riskMetrics.sharpeRatio}</p>
                  <p className={`text-sm mt-1 ${riskMetrics.sharpeRatio > 1.5 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {riskMetrics.sharpeRatio > 1.5 ? 'Excellent' : 'Good'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Max Drawdown</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>{riskMetrics.maxDrawdown}%</p>
                  <p className={`text-sm mt-1 ${riskMetrics.maxDrawdown > -10 ? 'text-green-400' : 'text-red-400'}`}>
                    {riskMetrics.maxDrawdown > -10 ? 'Controlled' : 'High Risk'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-500/20">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>

            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Beta</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>{riskMetrics.beta}</p>
                  <p className={`text-sm mt-1 ${riskMetrics.beta < 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {riskMetrics.beta < 1 ? 'Less Volatile' : 'Market Volatile'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Globe className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {selectedMetric === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <div key={index} className={getCardClass()}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${
                    insight.type === 'success' ? 'bg-green-500/20' :
                    insight.type === 'warning' ? 'bg-yellow-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    <insight.icon className={`w-6 h-6 ${
                      insight.type === 'success' ? 'text-green-400' :
                      insight.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${getTextClass()}`}>{insight.title}</h4>
                    <p className={`${getSubtextClass()} mt-1`}>{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioAnalytics
