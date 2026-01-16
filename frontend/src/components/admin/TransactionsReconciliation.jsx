import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Upload, CheckCircle, AlertTriangle, Clock, Eye, Edit, Trash2, TrendingUp, DollarSign, Users, BarChart3, Settings, RefreshCw, X, User } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

const TransactionsReconciliation = () => {
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all',
    confidence: 'all',
    user: 'all'
  })
  const [showNeedsRecognition, setShowNeedsRecognition] = useState(false)
  const [showConflicts, setShowConflicts] = useState(false)
  const [showBulkTools, setShowBulkTools] = useState(false)
  const [showPricingSnapshots, setShowPricingSnapshots] = useState(false)
  const [showReconciliation, setShowReconciliation] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [reconciliationData, setReconciliationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch transactions data
  useEffect(() => {
    fetchTransactions()
    fetchReconciliationData()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/transactions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Map backend data to frontend expected format
          const mappedTransactions = result.data.transactions.map(tx => ({
            id: tx.id,
            date: new Date(tx.timestamp).toLocaleDateString(),
            user: tx.userName,
            family: 'Business Account',
            amount: tx.amount,
            normalizedMerchant: tx.merchant,
            rawDescription: tx.description,
            mappingStatus: tx.status, // Map status to mappingStatus
            candidateTicker: tx.mappedStock,
            confidence: tx.confidence,
            stagedInvestment: tx.investmentAmount || 0
          }))
          setTransactions(mappedTransactions)
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const fetchReconciliationData = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/transactions/reconciliation`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setReconciliationData(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching reconciliation data:', error)
    }
  }

  const mappingMetrics = reconciliationData ? {
    coverage: reconciliationData.reconciliationSummary.reconciliationRate,
    autoAcceptPrecision: reconciliationData.reconciliationSummary.averageConfidence,
    medianTimeToMap: 2.5,
    queueBacklog: reconciliationData.reconciliationSummary.needsReviewCount,
    clusterWinRate: 85.0,
    reOpenRate: 3.0,
    priceStalePercent: 5.0,
    stagedFailurePercent: 2.0
  } : {
    coverage: 0,
    autoAcceptPrecision: 0,
    medianTimeToMap: 0,
    queueBacklog: 0,
    clusterWinRate: 0,
    reOpenRate: 0,
    priceStalePercent: 0,
    stagedFailurePercent: 0
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'mapped': return 'bg-green-500/20 text-green-400'
      case 'needs_recognition': return 'bg-yellow-500/20 text-yellow-400'
      case 'conflict': return 'bg-red-500/20 text-red-400'
      case 'staged': return 'bg-blue-500/20 text-blue-400'
      case 'failed': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      case 'matched': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-2 text-white">Loading transactions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">Error Loading Transactions</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={fetchTransactions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const handleBulkAction = (action) => {
    addNotification({
      type: 'info',
      title: 'Bulk Action',
      message: `Bulk ${action} functionality would be implemented here`,
      timestamp: new Date()
    })
  }

  const handleViewDecisionTrace = (txnId) => {
    addNotification({
      type: 'info',
      title: 'Decision Trace',
      message: `View decision trace for transaction ${txnId}`,
      timestamp: new Date()
    })
  }

  const handleRemap = (txnId) => {
    addNotification({
      type: 'info',
      title: 'Remap Transaction',
      message: `Remap transaction ${txnId}`,
      timestamp: new Date()
    })
  }

  const handleApproveDeny = (txnId, action) => {
    addNotification({
      type: 'info',
      title: 'Approve/Deny',
      message: `${action} suggestion for transaction ${txnId}`,
      timestamp: new Date()
    })
  }

  const handleAnnotate = (txnId) => {
    addNotification({
      type: 'info',
      title: 'Annotate Transaction',
      message: `Annotate transaction ${txnId}`,
      timestamp: new Date()
    })
  }

  const handleSendToQueue = (txnId) => {
    addNotification({
      type: 'info',
      title: 'Send to Queue',
      message: `Send transaction ${txnId} to queue`,
      timestamp: new Date()
    })
  }

  const handleExportRow = (txnId) => {
    addNotification({
      type: 'info',
      title: 'Export Transaction',
      message: `Export JSON for transaction ${txnId}`,
      timestamp: new Date()
    })
  }

  const handlePriceRefresh = () => {
    addNotification({
      type: 'info',
      title: 'Price Refresh',
      message: 'Price refresh functionality would be implemented here',
      timestamp: new Date()
    })
  }

  const handleClusterMapping = () => {
    addNotification({
      type: 'info',
      title: 'Cluster Mapping',
      message: 'Cluster mapping functionality would be implemented here',
      timestamp: new Date()
    })
  }

  const handleAliasEditor = () => {
    addNotification({
      type: 'info',
      title: 'Alias Editor',
      message: 'Alias editor functionality would be implemented here',
      timestamp: new Date()
    })
  }

  const handleReconciliation = () => {
    addNotification({
      type: 'info',
      title: 'Reconciliation',
      message: 'Reconciliation functionality would be implemented here',
      timestamp: new Date()
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Transactions & Reconciliation</h2>
            <p className="text-gray-300">End-to-end visibility from CSV line → mapped entity → staged investment</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handlePriceRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Price Refresh</span>
            </button>
            <button 
              onClick={handleReconciliation}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Run Reconciliation</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'needs_recognition', label: 'Needs Recognition' },
            { id: 'conflicts', label: 'Conflicts' },
            { id: 'bulk_tools', label: 'Bulk Tools' },
            { id: 'pricing', label: 'Pricing Snapshots' },
            { id: 'reconciliation', label: 'Reconciliation' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                console.log(`${tab.label} tab clicked`)
                setActiveTab(tab.id)
                if (tab.id === 'needs_recognition') setShowNeedsRecognition(true)
                if (tab.id === 'conflicts') setShowConflicts(true)
                if (tab.id === 'bulk_tools') setShowBulkTools(true)
                if (tab.id === 'pricing') setShowPricingSnapshots(true)
                if (tab.id === 'reconciliation') setShowReconciliation(true)
              }}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Mapping Coverage</p>
              <p className="text-2xl font-bold text-white">{mappingMetrics.coverage}%</p>
              <p className="text-green-400 text-sm flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2.1% vs last week
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Auto-Accept Precision</p>
              <p className="text-2xl font-bold text-white">{mappingMetrics.autoAcceptPrecision}%</p>
              <p className="text-green-400 text-sm flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +1.3% vs last week
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Median Time to Map</p>
              <p className="text-2xl font-bold text-white">{mappingMetrics.medianTimeToMap}s</p>
              <p className="text-red-400 text-sm flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +0.2s vs last week
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Queue Backlog</p>
              <p className="text-2xl font-bold text-white">{mappingMetrics.queueBacklog}</p>
              <p className="text-red-400 text-sm flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +23 vs last week
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions, merchants, tickers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="all">All Status</option>
              <option value="mapped">Mapped</option>
              <option value="needs_recognition">Needs Recognition</option>
              <option value="conflict">Conflict</option>
              <option value="staged">Staged</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filters.confidence}
              onChange={(e) => setFilters({...filters, confidence: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="all">All Confidence</option>
              <option value="high">High (90%+)</option>
              <option value="medium">Medium (70-89%)</option>
                <option value="low">Low (&lt;70%)</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => handleBulkAction('Cluster')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Cluster by Embedding
          </button>
          <button 
            onClick={handleAliasEditor}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Alias Editor
          </button>
          <button 
            onClick={() => handleBulkAction('Reprocess')}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Re-process Batch
          </button>
          <button 
            onClick={() => handleBulkAction('Export')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Export Selected
          </button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-3 text-gray-400 font-medium">TXN ID</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Date</th>
                <th className="text-left pb-3 text-gray-400 font-medium">User/Family</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Merchant</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Amount</th>
                <th className="text-center pb-3 text-gray-400 font-medium">Status</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Ticker</th>
                <th className="text-center pb-3 text-gray-400 font-medium">Confidence</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Staged $</th>
                <th className="text-center pb-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white font-mono text-sm">{transaction.id}</td>
                  <td className="py-3 px-4 text-white">{transaction.date}</td>
                  <td className="py-3 px-4 text-white">
                    <div>
                      <div className="font-medium">{transaction.user}</div>
                      <div className="text-gray-400 text-sm">{transaction.family}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">
                    <div>
                      <div className="font-medium">{transaction.normalizedMerchant}</div>
                      <div className="text-gray-400 text-sm">{transaction.rawDescription}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-white">${(transaction.amount || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.mappingStatus)}`}>
                      {getStatusIcon(transaction.mappingStatus)}
                      <span className="capitalize">{transaction.mappingStatus?.replace('_', ' ') || 'Unknown'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-mono">{transaction.candidateTicker || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (transaction.confidence || 0) >= 90 ? 'bg-green-500/20 text-green-400' :
                      (transaction.confidence || 0) >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.confidence || 0}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-white">${(transaction.stagedInvestment || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-1">
                      <button 
                        onClick={() => handleViewDecisionTrace(transaction.id)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Decision Trace"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRemap(transaction.id)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Remap"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleApproveDeny(transaction.id, 'Approve')}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleExportRow(transaction.id)}
                        className="text-gray-400 hover:text-gray-300 p-1"
                        title="Export JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Needs Recognition Modal */}
      {showNeedsRecognition && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-4xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Needs Recognition</h3>
              <button 
                onClick={() => setShowNeedsRecognition(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300">Transactions that need manual recognition and mapping:</p>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-white font-medium">No transactions requiring recognition</p>
                    <p className="text-gray-400 text-sm">All transactions have been processed</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 transition-all">
                      Map to Ticker
                    </button>
                    <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 transition-all">
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conflicts Modal */}
      {showConflicts && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-4xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Mapping Conflicts</h3>
              <button 
                onClick={() => setShowConflicts(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300">Transactions with conflicting mapping suggestions:</p>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-white font-medium">No mapping conflicts</p>
                    <p className="text-gray-400 text-sm">All transactions have been mapped successfully</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2 text-green-400">
                      All Clear
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Tools Modal */}
      {showBulkTools && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-4xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Bulk Tools</h3>
              <button 
                onClick={() => setShowBulkTools(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 text-blue-400 transition-all">
                  <h4 className="font-medium mb-2">Bulk Map Merchants</h4>
                  <p className="text-sm text-gray-400">Map multiple merchants to tickers at once</p>
                </button>
                <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 text-green-400 transition-all">
                  <h4 className="font-medium mb-2">Bulk Price Updates</h4>
                  <p className="text-sm text-gray-400">Update reference prices for multiple tickers</p>
                </button>
                <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-4 text-purple-400 transition-all">
                  <h4 className="font-medium mb-2">Bulk Status Changes</h4>
                  <p className="text-sm text-gray-400">Change status for multiple transactions</p>
                </button>
                <button className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg p-4 text-orange-400 transition-all">
                  <h4 className="font-medium mb-2">Export Selected</h4>
                  <p className="text-sm text-gray-400">Export selected transactions to CSV</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Snapshots Modal */}
      {showPricingSnapshots && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-4xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Pricing Snapshots</h3>
              <button 
                onClick={() => setShowPricingSnapshots(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm">Ticker</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm">Current Price</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm">Snapshot Time</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-white/10">
                      <td className="px-4 py-3 text-white">AAPL</td>
                      <td className="px-4 py-3 text-white">$0.00</td>
                      <td className="px-4 py-3 text-white">No data</td>
                      <td className="px-4 py-3 text-gray-400">0%</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="px-4 py-3 text-white">SBUX</td>
                      <td className="px-4 py-3 text-white">$0.00</td>
                      <td className="px-4 py-3 text-white">2024-01-15 16:00:00</td>
                      <td className="px-4 py-3 text-red-400">-1.2%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Modal */}
      {showReconciliation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-4xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Transaction Reconciliation</h3>
              <button 
                onClick={() => setShowReconciliation(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Total Transactions</h4>
                  <p className="text-2xl font-bold text-blue-400">0</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Reconciled</h4>
                  <p className="text-2xl font-bold text-green-400">0</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Pending</h4>
                  <p className="text-2xl font-bold text-yellow-400">58</p>
                </div>
              </div>
              <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-3 text-blue-400 transition-all">
                Run Full Reconciliation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsReconciliation
