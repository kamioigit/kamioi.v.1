import React, { useState } from 'react'
import { ArrowUpRight, TrendingUp, ChevronRight, ChevronLeft, MoreVertical, PieChart, DollarSign } from 'lucide-react'
import RechartsChart from '../common/RechartsChart'
import PortfolioAnalytics from '../user/PortfolioAnalytics'
import CompanyLogo from '../common/CompanyLogo'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../hooks/useNotifications'

const AdminPortfolio = ({ user }) => {
  const { addNotification } = useNotifications()
  const [timeRange, setTimeRange] = useState('1m')
   const { isLightMode } = useTheme()
  const [currentPage, setCurrentPage] = useState(1)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const itemsPerPage = 10
  const { portfolioValue, holdings } = useData()

  // Pagination logic
  const safeHoldings = Array.isArray(holdings) ? holdings : []
  const totalPages = Math.ceil(safeHoldings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentHoldings = safeHoldings.slice(startIndex, endIndex)

  const allocationData = {
    series: safeHoldings.map(h => h.allocation),
    options: {
      chart: {
        type: 'donut',
        background: 'transparent',
        toolbar: {
          show: false
        }
      },
      labels: safeHoldings.map(h => h.symbol),
      colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#f97316', '#ec4899', '#8b5cf6'],
      legend: {
        position: 'bottom',
        labels: {
          colors: isLightMode ? '#374151' : '#ffffff'
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: isLightMode ? ['#ffffff'] : ['#ffffff']
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                color: isLightMode ? '#374151' : '#ffffff'
              },
              value: {
                show: true,
                color: isLightMode ? '#374151' : '#ffffff'
              }
            }
          }
        }
      }
    }
  }

  const getSelectClass = () => {
    if (isLightMode) return 'bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
    return 'bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
  }

  if (showAnalytics) {
    return <PortfolioAnalytics user={user} onBack={() => setShowAnalytics(false)} />
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Portfolio Overview</h2>
            <p className="text-gray-300">Total admin value: ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={getSelectClass()}
            >
              <option value="1d">1D</option>
              <option value="1w">1W</option>
              <option value="1m">1M</option>
              <option value="3m">3M</option>
              <option value="1y">1Y</option>
              <option value="all">All</option>
            </select>
            <button 
              onClick={() => setShowAnalytics(true)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              View Analytics
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className={`w-8 h-8 ${portfolioValue > 0 ? 'text-green-400' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${portfolioValue > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                {portfolioValue > 0 ? '0.00%' : '0.00%'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Today's Gain</p>
            <p className="text-white text-xl font-bold">
              {portfolioValue > 0 ? '$0.00' : '$0.00'}
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <PieChart className={`w-8 h-8 ${holdings.length > 0 ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${holdings.length > 0 ? 'text-blue-400' : 'text-gray-400'}`}>
                {holdings.length} assets
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Diversified</p>
            <p className="text-white text-xl font-bold">
              {holdings.length > 0 ? '18.2% ROI' : 'No investments'}
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <DollarSign className={`w-8 h-8 ${portfolioValue > 0 ? 'text-yellow-400' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${portfolioValue > 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
                {portfolioValue > 0 ? '$0' : '$0'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Cash Available</p>
            <p className="text-white text-xl font-bold">
              {portfolioValue > 0 ? 'Ready to Invest' : 'Start investing'}
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <ArrowUpRight className={`w-8 h-8 ${portfolioValue > 0 ? 'text-purple-400' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${portfolioValue > 0 ? 'text-purple-400' : 'text-gray-400'}`}>
                {portfolioValue > 0 ? '0.00%' : '0.00%'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">YTD Return</p>
            <p className="text-white text-xl font-bold">
              {portfolioValue > 0 ? '$0.00' : '$0.00'}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-4">
            <h3 className="text-lg font-bold text-white mb-4">Admin Portfolio Performance</h3>
                {portfolioValue > 0 ? (
                  <RechartsChart 
                    type="line" 
                    height={250}
                    series={[{
                      name: 'Admin Portfolio Value',
                      data: [portfolioValue * 0.8, portfolioValue * 0.85, portfolioValue * 0.9, portfolioValue * 0.95, portfolioValue]
                    }]}
                    options={{
                      xaxis: {
                        categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Today'],
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
                      colors: ['#ef4444'],
                      stroke: {
                        width: 3
                      },
                      grid: {
                        borderColor: isLightMode ? '#e5e7eb' : '#374151'
                      }
                    }}
                  />
                ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-white text-lg font-medium mb-2">No admin performance data yet</h4>
                  <p className="text-gray-400 text-sm">Start admin investing to see your portfolio performance</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass-card p-4">
            <h3 className="text-lg font-bold text-white mb-4">Admin Asset Allocation</h3>
            {holdings.length > 0 ? (
              <RechartsChart type="donut" height={250} series={allocationData.series} options={allocationData.options} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PieChart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-white text-lg font-medium mb-2">No admin investments yet</h4>
                  <p className="text-gray-400 text-sm">Start by uploading your admin bank statement to begin round-up investments</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Admin Holdings</h3>
          <button 
            onClick={() => addNotification({
              type: 'info',
              title: 'View All Holdings',
              message: 'View All Admin Holdings - This would show a detailed view of all admin holdings',
              timestamp: new Date()
            })}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-3 text-gray-400 font-medium">Asset</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Shares</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Avg Cost</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Current Price</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Value</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Change</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Allocation</th>
                <th className="text-right pb-3 text-gray-400 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <PieChart className="w-8 h-8 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-medium">No admin investments yet</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Start by uploading your admin bank statement to begin round-up investments
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentHoldings.map((holding, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <CompanyLogo 
                        symbol={holding.symbol} 
                        name={holding.name} 
                        size="w-8 h-8"
                      />
                      <div>
                        <p className="text-gray-400 text-sm">{holding.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 text-white">{holding.shares.toFixed(3)}</td>
                  <td className="text-right py-4 text-white">${holding.avgCost.toFixed(2)}</td>
                  <td className="text-right py-4 text-white">${holding.currentPrice.toFixed(2)}</td>
                  <td className="text-right py-4 text-white">${holding.value.toLocaleString()}</td>
                  <td className={`text-right py-4 font-medium ${holding.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.change >= 0 ? '+' : ''}{holding.change}%
                  </td>
                  <td className="text-right py-4 text-white">{holding.allocation.toFixed(2)}%</td>
                  <td className="text-right py-4">
                    <button 
                      onClick={() => console.log('Admin portfolio action for', holding.symbol)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {holdings.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6">
            <div className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Showing {startIndex + 1} to {Math.min(endIndex, holdings.length)} of {holdings.length} holdings
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : isLightMode 
                      ? 'text-gray-600 hover:bg-gray-100' 
                      : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    page === currentPage
                      ? 'bg-red-600 text-white'
                      : isLightMode
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : isLightMode 
                      ? 'text-gray-600 hover:bg-gray-100' 
                      : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => addNotification({
            type: 'info',
            title: 'Auto-Invest Setup',
            message: 'Admin Auto-Invest setup - Configure recurring admin investments',
            timestamp: new Date()
          })}
          className="glass-card p-4 text-left hover:transform hover:scale-105 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <h4 className="font-medium text-white mb-1">Admin Auto-Invest</h4>
          <p className="text-gray-400 text-sm">Set up recurring admin investments</p>
        </button>
        
        <button 
          onClick={() => addNotification({
            type: 'info',
            title: 'Portfolio Rebalancing',
            message: 'Admin Portfolio Rebalancing - Optimize your admin asset allocation',
            timestamp: new Date()
          })}
          className="glass-card p-4 text-left hover:transform hover:scale-105 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
            <PieChart className="w-5 h-5 text-orange-400" />
          </div>
          <h4 className="font-medium text-white mb-1">Rebalance</h4>
          <p className="text-gray-400 text-sm">Optimize your admin portfolio</p>
        </button>
        
        <button 
          onClick={() => addNotification({
            type: 'info',
            title: 'Withdraw Funds',
            message: 'Admin Withdraw Funds - Access your admin investment funds',
            timestamp: new Date()
          })}
          className="glass-card p-4 text-left hover:transform hover:scale-105 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <h4 className="font-medium text-white mb-1">Withdraw</h4>
          <p className="text-gray-400 text-sm">Access your admin funds</p>
        </button>
      </div>
    </div>
  )
}

export default AdminPortfolio
