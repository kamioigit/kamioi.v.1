import React, { useState } from 'react'
import { 
  TrendingUp, 
  PieChart, 
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Search
} from 'lucide-react'
import CompanyLogo from '../common/CompanyLogo'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { useModal } from '../../context/ModalContext'
import { useNotifications } from '../../hooks/useNotifications'

const PortfolioStats = () => {
  const { portfolioValue, holdings, transactions, portfolioStats } = useData()
  const { isLightMode } = useTheme()
  const { addNotification } = useNotifications()
  const { showExportModal } = useModal()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Safe holdings array
  const safeHoldings = Array.isArray(holdings) ? holdings : []

  // Use clean data from DataContext with portfolioStats for correct calculations
  const portfolioData = {
    totalValue: portfolioValue || 0,
    totalShares: safeHoldings.reduce((sum, holding) => sum + (holding.shares || 0), 0),
    totalInvested: portfolioStats?.totalCost || safeHoldings.reduce((sum, holding) => sum + (holding.totalCost || 0), 0),
    totalGains: portfolioStats?.totalGain || 0,
    gainPercentage: portfolioStats?.gainPercentage || 0,
    stocks: safeHoldings
  }

  // Use clean data from DataContext for transaction history
  // Map completed transactions with tickers to show investment history
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  // Create a lookup map of avgCost by ticker from holdings for accurate shares calculation
  const holdingsAvgCostMap = safeHoldings.reduce((map, h) => {
    map[h.symbol] = h.avgCost || 100
    return map
  }, {})

  const transactionHistory = safeTransactions
    .filter(t => t.status === 'completed' && t.ticker)
    .map((t, index) => {
      // Calculate shares using the avgCost from holdings (consistent with holdings calculation)
      const avgCost = holdingsAvgCostMap[t.ticker] || 100
      const shares = (t.roundUp || 0) / avgCost

      return {
        id: t.id || index,
        date: t.date,
        ticker: t.ticker,
        action: 'Buy',
        shares: shares,
        amount: t.roundUp || t.value || 0,
        status: 'completed',
        reason: `Round-up from ${t.merchant || 'purchase'}`
      }
    })

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  const getStatusColor = (status) => {
    switch (status) {
      case 'purchased': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'staged': return 'bg-blue-500/20 text-blue-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      case 'completed': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'purchased': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'staged': return <AlertTriangle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleExportReport = () => {
    showExportModal(
      'Export Portfolio Report',
      'This will download a comprehensive portfolio report including all holdings, transaction history, performance metrics, and analytics. The export will include detailed breakdowns and charts.',
      () => {
        console.log('Exporting portfolio report...')
        addNotification({
          type: 'success',
          title: 'Portfolio Report Exported',
          message: 'Your portfolio report has been exported successfully.',
          timestamp: new Date()
        })
      }
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'stocks', label: 'Stock Holdings', icon: BarChart3 },
    { id: 'transactions', label: 'Transaction History', icon: Target },
    { id: 'performance', label: 'Performance', icon: TrendingUp }
  ]

  // Filter stocks by search term and name
  const filteredStocks = portfolioData.stocks.filter(stock => {
    const matchesSearch = (stock.symbol?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (stock.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    // For stocks, filter by gain/loss status if not 'all'
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'gain' && (stock.change || 0) > 0) ||
                          (statusFilter === 'loss' && (stock.change || 0) < 0)
    return matchesSearch && matchesStatus
  })

  // Filter transactions by search and status
  const filteredTransactions = transactionHistory.filter(transaction => {
    const matchesSearch = (transaction.ticker?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
                          transaction.status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${getCardClass()} rounded-xl p-6 border`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${getTextClass()}`}>
              Portfolio Statistics
            </h1>
            <p className={`${getSubtextClass()}`}>
              Track your stock investments and performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleExportReport} className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{formatCurrency(portfolioData.totalValue)}</div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{formatNumber(portfolioData.totalShares, 4)}</div>
            <div className="text-sm text-gray-400">Total Shares</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{formatCurrency(portfolioData.totalInvested)}</div>
            <div className="text-sm text-gray-400">Total Invested</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${portfolioData.totalGains >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioData.totalGains >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalGains)}
            </div>
            <div className="text-sm text-gray-400">Total Gains</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${getCardClass()} rounded-xl p-6 border`}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Portfolio Breakdown</h3>
              <div className="space-y-3">
                {portfolioData.stocks.length > 0 ? (
                  portfolioData.stocks.map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <CompanyLogo symbol={stock.symbol} size="sm" clickable={true} />
                        </div>
                        <div>
                          <div className="text-white font-medium">{stock.symbol}</div>
                          <div className="text-sm text-gray-400">{formatNumber(stock.shares || 0, 4)} shares</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{formatCurrency(stock.value || 0)}</div>
                        <div className={`text-sm ${(stock.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(stock.change || 0) >= 0 ? '+' : ''}{formatCurrency(stock.change || 0)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PieChart className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className={`text-lg font-medium ${getTextClass()} mb-2`}>No Holdings Yet</h4>
                    <p className={`${getSubtextClass()} mb-4`}>
                      Your portfolio breakdown will appear here once you have investments
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={`${getCardClass()} rounded-xl p-6 border`}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Performance Summary</h3>
              <div className="space-y-4">
                {(() => {
                  if (portfolioData.stocks.length === 0) {
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Best Performer</span>
                          <span className="text-gray-400 font-semibold">No Data</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Worst Performer</span>
                          <span className="text-gray-400 font-semibold">No Data</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Average Gain</span>
                          <span className="text-gray-400 font-semibold">0.00%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Total Holdings</span>
                          <span className="text-gray-400 font-semibold">0</span>
                        </div>
                      </>
                    )
                  }

                  // Calculate performance metrics
                  const bestStock = portfolioData.stocks.reduce((best, stock) => 
                    (stock.change || 0) > (best.change || 0) ? stock : best
                  )
                  const worstStock = portfolioData.stocks.reduce((worst, stock) => 
                    (stock.change || 0) < (worst.change || 0) ? stock : worst
                  )
                  
                  const bestPercentage = ((bestStock.shares || 0) * (bestStock.avgCost || 0)) > 0 
                    ? ((bestStock.change || 0) / ((bestStock.shares || 0) * (bestStock.avgCost || 0))) * 100 
                    : 0
                  
                  const worstPercentage = ((worstStock.shares || 0) * (worstStock.avgCost || 0)) > 0 
                    ? ((worstStock.change || 0) / ((worstStock.shares || 0) * (worstStock.avgCost || 0))) * 100 
                    : 0

                  return (
                    <>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Best Performer</span>
                        <span className="text-green-400 font-semibold">
                          {bestStock.symbol} ({bestPercentage >= 0 ? '+' : ''}{bestPercentage.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Worst Performer</span>
                        <span className="text-red-400 font-semibold">
                          {worstStock.symbol} ({worstPercentage >= 0 ? '+' : ''}{worstPercentage.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Average Gain</span>
                        <span className="text-blue-400 font-semibold">
                          {portfolioData.gainPercentage >= 0 ? '+' : ''}{portfolioData.gainPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Total Holdings</span>
                        <span className="text-white font-semibold">{portfolioData.stocks.length}</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Holdings Tab */}
      {activeTab === 'stocks' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Holdings</option>
                <option value="gain">Gaining</option>
                <option value="loss">Losing</option>
              </select>
            </div>
          </div>

          {/* Stocks Table */}
          <div className={`${getCardClass()} rounded-xl p-6 border`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400">Stock</th>
                    <th className="text-center py-3 px-4 text-gray-400">Shares</th>
                    <th className="text-right py-3 px-4 text-gray-400">Avg Cost</th>
                    <th className="text-right py-3 px-4 text-gray-400">Current Price</th>
                    <th className="text-right py-3 px-4 text-gray-400">Value</th>
                    <th className="text-right py-3 px-4 text-gray-400">Gain/Loss</th>
                    <th className="text-right py-3 px-4 text-gray-400">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.length > 0 ? filteredStocks.map((stock) => (
                    <tr key={stock.symbol} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 flex items-center justify-center">
                            <CompanyLogo symbol={stock.symbol} size="sm" clickable={true} />
                          </div>
                          <div>
                            <div className="text-white font-medium">{stock.symbol}</div>
                            <div className="text-sm text-gray-400">{stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-white">
                        {formatNumber(stock.shares || 0, 4)}
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {formatCurrency(stock.avgCost || 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {formatCurrency(stock.currentPrice || 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {formatCurrency(stock.value || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className={`font-semibold ${(stock.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(stock.change || 0) >= 0 ? '+' : ''}{(stock.change || 0).toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {(stock.allocation || 0).toFixed(1)}%
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
                        No stock holdings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="staged">Staged</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className={`${getCardClass()} rounded-xl p-6 border`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400">Stock</th>
                    <th className="text-left py-3 px-4 text-gray-400">Action</th>
                    <th className="text-center py-3 px-4 text-gray-400">Shares</th>
                    <th className="text-right py-3 px-4 text-gray-400">Amount</th>
                    <th className="text-center py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{transaction.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <CompanyLogo symbol={transaction.ticker} size="sm" clickable={true} />
                          </div>
                          <span className="text-white font-medium">{transaction.ticker}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">{transaction.action}</td>
                      <td className="py-3 px-4 text-center text-white">
                        {formatNumber(transaction.shares || 0, 4)}
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {formatCurrency(transaction.amount || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center space-x-1 ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="capitalize">{transaction.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {transaction.reason}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
                        No completed investment transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${getCardClass()} rounded-xl p-6 border`}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Performance Metrics</h3>
              <div className="space-y-4">
                {(() => {
                  if (portfolioData.stocks.length === 0) {
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Total Return</span>
                          <span className="text-gray-400 font-semibold">0.00%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Best Performer</span>
                          <span className="text-gray-400 font-semibold">No Holdings</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Worst Performer</span>
                          <span className="text-gray-400 font-semibold">No Holdings</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Avg Stock Gain</span>
                          <span className="text-gray-400 font-semibold">0.00%</span>
                        </div>
                      </>
                    )
                  }

                  // Calculate performance metrics from holdings
                  const stockChanges = portfolioData.stocks.map(s => s.change || 0)
                  const avgStockGain = stockChanges.reduce((sum, c) => sum + c, 0) / stockChanges.length

                  const bestStock = portfolioData.stocks.reduce((best, stock) =>
                    (stock.change || 0) > (best.change || 0) ? stock : best
                  )
                  const worstStock = portfolioData.stocks.reduce((worst, stock) =>
                    (stock.change || 0) < (worst.change || 0) ? stock : worst
                  )

                  return (
                    <>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Total Return</span>
                        <span className={`font-semibold ${portfolioData.gainPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {portfolioData.gainPercentage >= 0 ? '+' : ''}{portfolioData.gainPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Best Performer</span>
                        <span className="text-green-400 font-semibold">
                          {bestStock.symbol} (+{(bestStock.change || 0).toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Worst Performer</span>
                        <span className={`font-semibold ${(worstStock.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {worstStock.symbol} ({(worstStock.change || 0) >= 0 ? '+' : ''}{(worstStock.change || 0).toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Avg Stock Gain</span>
                        <span className={`font-semibold ${avgStockGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {avgStockGain >= 0 ? '+' : ''}{avgStockGain.toFixed(2)}%
                        </span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            <div className={`${getCardClass()} rounded-xl p-6 border`}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Risk Analysis</h3>
              <div className="space-y-4">
                {(() => {
                  if (portfolioData.stocks.length === 0) {
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Risk Level</span>
                          <span className="text-gray-400 font-semibold">No Holdings</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Diversification</span>
                          <span className="text-gray-400 font-semibold">No Holdings</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Concentration Risk</span>
                          <span className="text-gray-400 font-semibold">No Holdings</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${getSubtextClass()}`}>Liquidity</span>
                          <span className="text-gray-400 font-semibold">No Holdings</span>
                        </div>
                      </>
                    )
                  }

                  // Calculate risk metrics from holdings
                  const stockCount = portfolioData.stocks.length
                  const maxAllocation = Math.max(...portfolioData.stocks.map(s => s.allocation || 0))

                  // Risk level based on diversification
                  let riskLevel = 'Low'
                  let riskColor = 'text-green-400'
                  if (stockCount < 3 || maxAllocation > 50) {
                    riskLevel = 'High'
                    riskColor = 'text-red-400'
                  } else if (stockCount < 5 || maxAllocation > 30) {
                    riskLevel = 'Medium'
                    riskColor = 'text-yellow-400'
                  }

                  // Diversification score (1-10)
                  const diversificationScore = Math.min(10, stockCount + (10 - maxAllocation / 10))
                  let diversificationLabel = 'Excellent'
                  let diversificationColor = 'text-green-400'
                  if (diversificationScore < 4) {
                    diversificationLabel = 'Poor'
                    diversificationColor = 'text-red-400'
                  } else if (diversificationScore < 7) {
                    diversificationLabel = 'Good'
                    diversificationColor = 'text-yellow-400'
                  }

                  // Concentration risk
                  let concentrationRisk = 'Low'
                  let concentrationColor = 'text-green-400'
                  if (maxAllocation > 40) {
                    concentrationRisk = 'High'
                    concentrationColor = 'text-red-400'
                  } else if (maxAllocation > 25) {
                    concentrationRisk = 'Medium'
                    concentrationColor = 'text-yellow-400'
                  }

                  return (
                    <>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Risk Level</span>
                        <span className={`font-semibold ${riskColor}`}>{riskLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Diversification</span>
                        <span className={`font-semibold ${diversificationColor}`}>
                          {diversificationLabel} ({stockCount} stocks)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Concentration Risk</span>
                        <span className={`font-semibold ${concentrationColor}`}>
                          {concentrationRisk} ({maxAllocation.toFixed(0)}% max)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${getSubtextClass()}`}>Liquidity</span>
                        <span className="text-green-400 font-semibold">High (Public Stocks)</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioStats

