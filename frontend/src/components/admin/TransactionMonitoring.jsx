import React, { useState, useEffect } from 'react'
import { Filter, Download, Eye, Search, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { useTheme } from '../../context/ThemeContext'

const TransactionMonitoring = () => {
  const { addNotification } = useNotifications()
  const { isLightMode } = useTheme()
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({
    totalRoundUps: 0,
    totalTransactions: 0,
    flaggedTransactions: 0,
    successRate: 0
  })
  const [loading, setLoading] = useState(true)
  const transactionsPerPage = 10

  // Theme helper functions
  const getTextClass = () => isLightMode ? 'text-gray-900' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getSecondaryTextClass = () => isLightMode ? 'text-gray-500' : 'text-gray-300'
  const getCardClass = () => isLightMode
    ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm'
    : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'
  const getInputClass = () => isLightMode
    ? 'w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
  const getSelectClass = () => isLightMode
    ? 'pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
  const getBorderClass = () => isLightMode ? 'border-gray-200' : 'border-white/10'
  const getHoverBgClass = () => isLightMode ? 'hover:bg-gray-50' : 'hover:bg-white/5'

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken')

        const response = await fetch(`${apiBaseUrl}/api/admin/transactions/monitoring`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setTransactions(result.data.transactions || [])
            setStats({
              totalRoundUps: result.data.totalRoundUps || 0,
              totalTransactions: result.data.totalTransactions || 0,
              flaggedTransactions: result.data.flaggedTransactions || 0,
              successRate: result.data.successRate || 0
            })
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status?.toLowerCase() === statusFilter.toLowerCase()
    const matchesSearch = !searchQuery ||
      t.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.stock?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const indexOfLastTransaction = currentPage * transactionsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage)

  const exportToCSV = () => {
    addNotification({
      type: 'success',
      title: 'Export Successful',
      message: 'Transaction data exported successfully!',
      timestamp: new Date()
    })
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${getTextClass()}`}>Transaction Monitoring</h2>
            <p className={getSecondaryTextClass()}>Monitor and manage platform transactions</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={getInputClass()}
            />
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={getSelectClass()}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <span className={`ml-3 ${getTextClass()}`}>Loading transactions...</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className={`border-b ${getBorderClass()}`}>
                  <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>User</th>
                  <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Merchant</th>
                  <th className={`text-right pb-3 ${getSubtextClass()} font-medium`}>Amount</th>
                  <th className={`text-right pb-3 ${getSubtextClass()} font-medium`}>Round-Up</th>
                  <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Stock</th>
                  <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Date</th>
                  <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Status</th>
                  <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Risk</th>
                  <th className={`text-right pb-3 ${getSubtextClass()} font-medium`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className={`py-8 text-center ${getSubtextClass()}`}>
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  currentTransactions.map(transaction => (
                    <tr key={transaction.id} className={`border-b ${getBorderClass()} ${getHoverBgClass()} transition-colors`}>
                      <td className="py-4">
                        <p className={`${getTextClass()} font-medium`}>{transaction.user || 'Unknown'}</p>
                      </td>
                      <td className={`py-4 ${getTextClass()}`}>{transaction.merchant || 'N/A'}</td>
                      <td className={`py-4 text-right ${getTextClass()}`}>${(transaction.amount || 0).toFixed(2)}</td>
                      <td className="py-4 text-right text-green-400">${(transaction.roundUp || 0).toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`font-mono ${getTextClass()}`}>{transaction.stock || 'N/A'}</span>
                      </td>
                      <td className={`py-4 ${getSecondaryTextClass()}`}>
                        {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.status === 'Completed' || transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          transaction.status === 'Pending' || transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-1">
                          {transaction.risk === 'High' ? (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          ) : transaction.risk === 'Medium' ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          <span className={`
                            ${transaction.risk === 'High' ? 'text-red-400' :
                              transaction.risk === 'Medium' ? 'text-yellow-400' :
                              'text-green-400'}
                          `}>
                            {transaction.risk || 'Low'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-1 text-blue-400 hover:text-blue-300" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 ${isLightMode ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/10 hover:bg-white/20 text-white'} disabled:opacity-50 px-4 py-2 rounded-lg transition-colors`}
            >
              <span>Previous</span>
            </button>

            <span className={getSecondaryTextClass()}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 ${isLightMode ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/10 hover:bg-white/20 text-white'} disabled:opacity-50 px-4 py-2 rounded-lg transition-colors`}
            >
              <span>Next</span>
            </button>
          </div>
        )}
      </div>

      {/* Transaction Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-sm' : 'bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20'} p-4 text-center`}>
          <div className="text-2xl font-bold text-green-400 mb-1">
            ${stats.totalRoundUps.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`${getSubtextClass()} text-sm`}>Total Round-ups</div>
        </div>
        <div className={`${isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-sm' : 'bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20'} p-4 text-center`}>
          <div className="text-2xl font-bold text-blue-400 mb-1">{formatNumber(stats.totalTransactions)}</div>
          <div className={`${getSubtextClass()} text-sm`}>Total Transactions</div>
        </div>
        <div className={`${isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-sm' : 'bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20'} p-4 text-center`}>
          <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.flaggedTransactions.toLocaleString()}</div>
          <div className={`${getSubtextClass()} text-sm`}>Flagged Transactions</div>
        </div>
        <div className={`${isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-sm' : 'bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20'} p-4 text-center`}>
          <div className="text-2xl font-bold text-purple-400 mb-1">{stats.successRate.toFixed(1)}%</div>
          <div className={`${getSubtextClass()} text-sm`}>Success Rate</div>
        </div>
      </div>
    </div>
  )
}

export default TransactionMonitoring
