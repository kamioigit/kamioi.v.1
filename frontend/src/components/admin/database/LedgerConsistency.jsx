import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Activity,
  BarChart3,
  DollarSign,
  Calculator,
  Shield,
  Lock,
  Unlock,
  Target,
  Timer,
  Cpu,
  HardDrive,
  CreditCard,
  Wallet,
  Banknote,
  Coins,
  Receipt,
  FileText,
  Archive,
  Download,
  X,
  RotateCcw,
  Play
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const LedgerConsistency = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [ledgerChecks, setLedgerChecks] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedCheck, setSelectedCheck] = useState(null)
  const [showCheckModal, setShowCheckModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  useEffect(() => {
    fetchLedgerData()
    fetchTransactionsData()
  }, [])

  const fetchLedgerData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/ledger/consistency`)
      if (response.ok) {
        const data = await response.json()
        setLedgerChecks(data.data?.consistency_checks || [])
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactionsData = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/ledger/consistency`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.data?.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions data:', error)
    }
  }

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'text-green-400'
      case 'invalid': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      case 'pending': return 'text-blue-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4" />
      case 'invalid': return <XCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'error': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'credit': return 'text-green-400'
      case 'debit': return 'text-red-400'
      case 'transfer': return 'text-blue-400'
      case 'refund': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'credit': return <TrendingUp className="w-4 h-4" />
      case 'debit': return <TrendingUp className="w-4 h-4 rotate-180" />
      case 'transfer': return <Activity className="w-4 h-4" />
      case 'refund': return <RotateCcw className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const handleViewCheck = (check) => {
    setSelectedCheck(check)
    setShowCheckModal(true)
  }

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  const handleRunCheck = (check) => {
    console.log(`Running check: ${check.name}`)
    // Implement check run logic
  }

  const handleFixInconsistency = (check) => {
    console.log(`Fixing inconsistency: ${check.name}`)
    // Implement fix logic
  }

  const handleValidateTransaction = (transaction) => {
    console.log(`Validating transaction: ${transaction.id}`)
    // Implement validation logic
  }

  const filteredChecks = ledgerChecks.filter(check => {
    const matchesSearch = check.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        check.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || check.status === statusFilter
    const matchesType = typeFilter === 'all' || check.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Ledger Consistency</h2>
          <p className={getSubtextClass()}>Financial integrity validation and transaction verification</p>
        </div>
        <button
          onClick={fetchLedgerData}
          disabled={loading}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Total Checks</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{ledgerChecks.length}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Valid</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {ledgerChecks.filter(c => c.status === 'valid').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Invalid</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {ledgerChecks.filter(c => c.status === 'invalid').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Transactions</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{transactions.length}</p>
            </div>
            <Receipt className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search checks and transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Status</option>
          <option value="valid">Valid</option>
          <option value="invalid">Invalid</option>
          <option value="warning">Warning</option>
          <option value="pending">Pending</option>
          <option value="error">Error</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Types</option>
          <option value="balance">Balance</option>
          <option value="transaction">Transaction</option>
          <option value="reconciliation">Reconciliation</option>
          <option value="audit">Audit</option>
        </select>
      </div>

      {/* Ledger Checks Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Ledger Integrity Checks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Check</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Run</th>
                <th className="text-left p-4 text-gray-400 font-medium">Result</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.map((check, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{check.name}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{check.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(check.status)}`}>
                      {getStatusIcon(check.status)}
                      <span className="capitalize">{check.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSubtextClass()} bg-white/10`}>
                      {check.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{check.lastRun}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{check.result}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCheck(check)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRunCheck(check)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Run Check"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      {check.status === 'invalid' && (
                        <button
                          onClick={() => handleFixInconsistency(check)}
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                          title="Fix Inconsistency"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">ID</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <span className={`font-mono text-sm ${getTextClass()}`}>{transaction.id}</span>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getTransactionTypeColor(transaction.type)}`}>
                      {getTransactionTypeIcon(transaction.type)}
                      <span className="capitalize">{transaction.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={getTextClass()}>{transaction.amount}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{transaction.date}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="capitalize">{transaction.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewTransaction(transaction)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check Details Modal */}
      {showCheckModal && selectedCheck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Check Details</h3>
              <button
                onClick={() => setShowCheckModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedCheck.name}</h4>
                <p className={getSubtextClass()}>{selectedCheck.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedCheck.status)}`}>
                    {getStatusIcon(selectedCheck.status)}
                    <span className="capitalize">{selectedCheck.status}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <p className={getTextClass()}>{selectedCheck.type}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Last Run</p>
                  <p className={getTextClass()}>{selectedCheck.lastRun}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Result</p>
                  <p className={getTextClass()}>{selectedCheck.result}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRunCheck(selectedCheck)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Check</span>
                </button>
                {selectedCheck.status === 'invalid' && (
                  <button
                    onClick={() => handleFixInconsistency(selectedCheck)}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                  >
                    <Target className="w-4 h-4" />
                    <span>Fix Inconsistency</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Transaction Details</h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>Transaction {selectedTransaction.id}</h4>
                <p className={getSubtextClass()}>{selectedTransaction.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <div className={`flex items-center space-x-2 ${getTransactionTypeColor(selectedTransaction.type)}`}>
                    {getTransactionTypeIcon(selectedTransaction.type)}
                    <span className="capitalize">{selectedTransaction.type}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Amount</p>
                  <p className={getTextClass()}>{selectedTransaction.amount}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Date</p>
                  <p className={getTextClass()}>{selectedTransaction.date}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="capitalize">{selectedTransaction.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleValidateTransaction(selectedTransaction)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>Validate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LedgerConsistency

