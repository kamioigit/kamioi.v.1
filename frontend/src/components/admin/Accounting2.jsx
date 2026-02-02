import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  FileText,
  Download,
  Filter,
  Calendar,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Calculator,
  BookOpen,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Trash2,
  Upload,
  Lock,
  Unlock,
  X,
  RefreshCw,
  Clock,
  Building2,
  User,
  Home,
  Briefcase,
  CreditCard as PaymentIcon,
  Settings,
  Target,
  Zap
} from 'lucide-react'
import RechartsChart from '../common/RechartsChart'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'

const Accounting2 = ({ user }) => {
  const { isLightMode } = useTheme()

  // Theme helper functions
  const getTextClass = () => isLightMode ? 'text-gray-900' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode
    ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm'
    : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'
  const getInputClass = () => isLightMode
    ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
  const getSelectClass = () => isLightMode
    ? 'px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedView, setSelectedView] = useState('overview')
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [periodLocked, setPeriodLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [financialData, setFinancialData] = useState(null)
  const [error, setError] = useState(null)
  const [journalEntries, setJournalEntries] = useState([])
  const [entryType, setEntryType] = useState('deposit')
  const [entryAmount, setEntryAmount] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [entryMemo, setEntryMemo] = useState('')
  const [glAccounts, setGlAccounts] = useState([])
  const [locations, setLocations] = useState([])
  const [departments, setDepartments] = useState([])
  const [showGlManager, setShowGlManager] = useState(false)
  const [showLocationManager, setShowLocationManager] = useState(false)
  const [showDepartmentManager, setShowDepartmentManager] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [editingLocation, setEditingLocation] = useState(null)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const { totalRoundUps, reportToAdmin, transactions } = useData()

  // Predefined GL Account Structure
  const predefinedAccounts = [
    // Revenue Accounts (4000s)
    { id: '4060', name: 'Individual Users', type: 'revenue', normal_balance: 'credit', account_number: '4060', description: 'Revenue from individual user subscriptions and fees' },
    { id: '4070', name: 'Family Accounts', type: 'revenue', normal_balance: 'credit', account_number: '4070', description: 'Revenue from family account subscriptions and fees' },
    { id: '4080', name: 'Business Accounts', type: 'revenue', normal_balance: 'credit', account_number: '4080', description: 'Revenue from business account subscriptions and fees' },
    
    // Expense Accounts (5001s)
    { id: '5010', name: 'Payment Processor Fees (Stripe, Plaid, Dwolla)', type: 'expense', normal_balance: 'debit', account_number: '5010', description: 'Fees paid to payment processors' },
    { id: '5040', name: 'Transaction Settlement Fees', type: 'expense', normal_balance: 'debit', account_number: '5040', description: 'Fees for transaction settlement services' },
    { id: '5070', name: 'Alpaca Fees', type: 'expense', normal_balance: 'debit', account_number: '5070', description: 'Fees paid to Alpaca for trading services' },
    
    // Asset Accounts (1000s)
    { id: '1000', name: 'Cash', type: 'asset', normal_balance: 'debit', account_number: '1000', description: 'Cash on hand and in bank accounts' },
    { id: '1100', name: 'Accounts Receivable', type: 'asset', normal_balance: 'debit', account_number: '1100', description: 'Money owed by customers' },
    { id: '1200', name: 'Equipment', type: 'asset', normal_balance: 'debit', account_number: '1200', description: 'Computer equipment and office furniture' },
    
    // Liability Accounts (2000s)
    { id: '2000', name: 'Accounts Payable', type: 'liability', normal_balance: 'credit', account_number: '2000', description: 'Money owed to vendors' },
    { id: '2100', name: 'Accrued Expenses', type: 'liability', normal_balance: 'credit', account_number: '2100', description: 'Expenses incurred but not yet paid' },
    
    // Equity Accounts (3000s)
    { id: '3000', name: 'Owner\'s Equity', type: 'equity', normal_balance: 'credit', account_number: '3000', description: 'Owner\'s investment in the business' },
    { id: '3100', name: 'Retained Earnings', type: 'equity', normal_balance: 'credit', account_number: '3100', description: 'Accumulated profits retained in the business' }
  ]

  // Auto-mapping rules for transactions
  const getAutoMappedAccount = (transaction) => {
    const amount = parseFloat(transaction.amount || 0)
    const fee = parseFloat(transaction.fee || 0)
    const roundUp = parseFloat(transaction.round_up || 0)
    
    // Revenue mapping based on account type
    if (transaction.account_type === 'individual') {
      return { account: '4060', description: 'Individual user revenue' }
    } else if (transaction.account_type === 'family') {
      return { account: '4070', description: 'Family account revenue' }
    } else if (transaction.account_type === 'business') {
      return { account: '4080', description: 'Business account revenue' }
    }
    
    // Default to individual if no account type specified
    return { account: '4060', description: 'Individual user revenue' }
  }

  // Auto-mapping for fees
  const getAutoMappedFeeAccount = (transaction) => {
    const fee = parseFloat(transaction.fee || 0)
    
    if (transaction.payment_processor === 'stripe' || transaction.payment_processor === 'plaid' || transaction.payment_processor === 'dwolla') {
      return { account: '5010', description: 'Payment processor fees' }
    } else if (transaction.payment_processor === 'alpaca') {
      return { account: '5070', description: 'Alpaca trading fees' }
    } else {
      return { account: '5040', description: 'Transaction settlement fees' }
    }
  }

  // Fetch real-time financial data
  useEffect(() => {
    fetchFinancialData()
    initializeAccountingData()
  }, [selectedPeriod])

  const initializeAccountingData = () => {
    // Load from localStorage or initialize with predefined accounts
    const savedAccounts = localStorage.getItem('kamioi_gl_accounts')
    const savedLocations = localStorage.getItem('kamioi_locations')
    const savedDepartments = localStorage.getItem('kamioi_departments')
    
    if (savedAccounts) {
      setGlAccounts(JSON.parse(savedAccounts))
    } else {
      // Initialize with predefined accounts
      setGlAccounts(predefinedAccounts)
      localStorage.setItem('kamioi_gl_accounts', JSON.stringify(predefinedAccounts))
    }
    
    setLocations(savedLocations ? JSON.parse(savedLocations) : [])
    setDepartments(savedDepartments ? JSON.parse(savedDepartments) : [])
  }

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/financial/analytics?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setFinancialData(data)
    } catch (err) {
      console.error('Error fetching financial data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // GL Account Management Functions
  const addGlAccount = (account) => {
    const newAccount = {
      id: `acc_${Date.now()}`,
      ...account,
      created_at: new Date().toISOString()
    }
    const updatedAccounts = [...glAccounts, newAccount]
    setGlAccounts(updatedAccounts)
    localStorage.setItem('kamioi_gl_accounts', JSON.stringify(updatedAccounts))
  }

  const updateGlAccount = (accountId, updates) => {
    const updatedAccounts = glAccounts.map(acc => 
      acc.id === accountId ? { ...acc, ...updates } : acc
    )
    setGlAccounts(updatedAccounts)
    localStorage.setItem('kamioi_gl_accounts', JSON.stringify(updatedAccounts))
  }

  const deleteGlAccount = (accountId) => {
    const updatedAccounts = glAccounts.filter(acc => acc.id !== accountId)
    setGlAccounts(updatedAccounts)
    localStorage.setItem('kamioi_gl_accounts', JSON.stringify(updatedAccounts))
  }

  // Location Management Functions
  const addLocation = (location) => {
    const newLocation = {
      id: `loc_${Date.now()}`,
      ...location,
      created_at: new Date().toISOString()
    }
    const updatedLocations = [...locations, newLocation]
    setLocations(updatedLocations)
    localStorage.setItem('kamioi_locations', JSON.stringify(updatedLocations))
  }

  const updateLocation = (locationId, updates) => {
    const updatedLocations = locations.map(loc => 
      loc.id === locationId ? { ...loc, ...updates } : loc
    )
    setLocations(updatedLocations)
    localStorage.setItem('kamioi_locations', JSON.stringify(updatedLocations))
  }

  const deleteLocation = (locationId) => {
    const updatedLocations = locations.filter(loc => loc.id !== locationId)
    setLocations(updatedLocations)
    localStorage.setItem('kamioi_locations', JSON.stringify(updatedLocations))
  }

  // Department Management Functions
  const addDepartment = (department) => {
    const newDepartment = {
      id: `dept_${Date.now()}`,
      ...department,
      created_at: new Date().toISOString()
    }
    const updatedDepartments = [...departments, newDepartment]
    setDepartments(updatedDepartments)
    localStorage.setItem('kamioi_departments', JSON.stringify(updatedDepartments))
  }

  const updateDepartment = (departmentId, updates) => {
    const updatedDepartments = departments.map(dept => 
      dept.id === departmentId ? { ...dept, ...updates } : dept
    )
    setDepartments(updatedDepartments)
    localStorage.setItem('kamioi_departments', JSON.stringify(updatedDepartments))
  }

  const deleteDepartment = (departmentId) => {
    const updatedDepartments = departments.filter(dept => dept.id !== departmentId)
    setDepartments(updatedDepartments)
    localStorage.setItem('kamioi_departments', JSON.stringify(updatedDepartments))
  }

  // Auto-calculate debit/credit based on entry type and account
  const calculateDebitCredit = (entryType, accountId, amount) => {
    const account = glAccounts.find(acc => acc.id === accountId)
    if (!account || !amount) return { debit: 0, credit: 0 }

    const numAmount = parseFloat(amount)
    const isDebitNormal = account.normal_balance === 'debit'

    switch (entryType) {
      case 'deposit':
        // Cash coming in - debit cash, credit revenue
        return isDebitNormal ? { debit: numAmount, credit: 0 } : { debit: 0, credit: numAmount }
      case 'expense':
        // Money going out - debit expense, credit cash
        return isDebitNormal ? { debit: numAmount, credit: 0 } : { debit: 0, credit: numAmount }
      case 'transfer':
        // Moving money between accounts
        return isDebitNormal ? { debit: numAmount, credit: 0 } : { debit: 0, credit: numAmount }
      case 'payment':
        // Paying bills - debit expense, credit cash
        return isDebitNormal ? { debit: numAmount, credit: 0 } : { debit: 0, credit: numAmount }
      default:
        return { debit: 0, credit: 0 }
    }
  }

  const handleAddJournalEntry = () => {
    if (!entryAmount || !selectedAccount) return

    const { debit, credit } = calculateDebitCredit(entryType, selectedAccount, entryAmount)
    const account = glAccounts.find(acc => acc.id === selectedAccount)
    const location = locations.find(loc => loc.id === selectedLocation)
    const department = departments.find(dept => dept.id === selectedDepartment)

    const newEntry = {
      id: `entry_${Date.now()}`,
      date: new Date().toISOString(),
      entryType,
      account: account?.name || 'Unknown Account',
      accountId: selectedAccount,
      location: location?.name || 'Main Office',
      locationId: selectedLocation,
      department: department?.name || 'General',
      departmentId: selectedDepartment,
      memo: entryMemo,
      debit,
      credit,
      amount: parseFloat(entryAmount)
    }

    setJournalEntries([...journalEntries, newEntry])
    
    // Reset form
    setEntryAmount('')
    setSelectedAccount('')
    setSelectedLocation('')
    setSelectedDepartment('')
    setEntryMemo('')
    setShowAddEntry(false)
  }

  const handleAutoMapTransactions = () => {
    if (!transactions || transactions.length === 0) return

    const autoMappedEntries = transactions.map(transaction => {
      const revenueMapping = getAutoMappedAccount(transaction)
      const feeMapping = getAutoMappedFeeAccount(transaction)
      
      return {
        transaction,
        revenueEntry: {
          account: revenueMapping.account,
          description: revenueMapping.description,
          amount: parseFloat(transaction.amount || 0)
        },
        feeEntry: parseFloat(transaction.fee || 0) > 0 ? {
          account: feeMapping.account,
          description: feeMapping.description,
          amount: parseFloat(transaction.fee || 0)
        } : null
      }
    })

    // Add auto-mapped entries to journal
    const newEntries = autoMappedEntries.flatMap(mapping => {
      const entries = []
      
      // Add revenue entry
      if (mapping.revenueEntry.amount > 0) {
        entries.push({
          id: `auto_rev_${Date.now()}_${Math.random()}`,
          date: new Date().toISOString(),
          entryType: 'deposit',
          account: glAccounts.find(acc => acc.id === mapping.revenueEntry.account)?.name || 'Revenue',
          accountId: mapping.revenueEntry.account,
          location: 'Auto-Mapped',
          department: 'Auto-Mapped',
          memo: mapping.revenueEntry.description,
          debit: 0,
          credit: mapping.revenueEntry.amount,
          amount: mapping.revenueEntry.amount,
          isAutoMapped: true
        })
      }
      
      // Add fee entry if applicable
      if (mapping.feeEntry && mapping.feeEntry.amount > 0) {
        entries.push({
          id: `auto_fee_${Date.now()}_${Math.random()}`,
          date: new Date().toISOString(),
          entryType: 'expense',
          account: glAccounts.find(acc => acc.id === mapping.feeEntry.account)?.name || 'Fee',
          accountId: mapping.feeEntry.account,
          location: 'Auto-Mapped',
          department: 'Auto-Mapped',
          memo: mapping.feeEntry.description,
          debit: mapping.feeEntry.amount,
          credit: 0,
          amount: mapping.feeEntry.amount,
          isAutoMapped: true
        })
      }
      
      return entries
    })

    setJournalEntries([...journalEntries, ...newEntries])
  }

  const renderOverview = () => {
    if (!financialData) return <div className="text-center py-8">Loading financial data...</div>

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={isLightMode ? 'bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm' : 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${getSubtextClass()}`}>Total Revenue</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>${financialData.total_revenue?.toLocaleString() || '0'}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className={isLightMode ? 'bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm' : 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${getSubtextClass()}`}>Net Profit</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>${financialData.net_profit?.toLocaleString() || '0'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className={isLightMode ? 'bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm' : 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${getSubtextClass()}`}>Transactions</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>{financialData.transactions_count?.toLocaleString() || '0'}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className={isLightMode ? 'bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm' : 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${getSubtextClass()}`}>Avg Transaction</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>${financialData.average_transaction?.toFixed(2) || '0'}</p>
              </div>
              <Calculator className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* GL Account Summary */}
        <div className={isLightMode ? 'bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm' : 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'}>
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>GL Account Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {glAccounts.slice(0, 6).map(account => (
              <div key={account.id} className={isLightMode ? 'bg-gray-50 rounded-lg p-4' : 'bg-white/5 rounded-lg p-4'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${getSubtextClass()}`}>{account.name}</p>
                    <p className={`text-xs ${getTextClass()}`}>#{account.account_number}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    account.normal_balance === 'debit'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {account.normal_balance?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Mapping Status */}
        <div className={isLightMode ? 'bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm' : 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'}>
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>Auto-Mapping Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Individual Users → 4060</span>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Family Accounts → 4070</span>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Business Accounts → 4080</span>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-medium">Payment Fees → 5010</span>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-medium">Settlement Fees → 5040</span>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-medium">Alpaca Fees → 5070</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderJournalEntries = () => {
    return (
      <div className="space-y-6">
        {/* Add Journal Entry Button */}
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Journal Entries</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleAutoMapTransactions}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Auto-Map Transactions</span>
            </button>
            <button
              onClick={() => setShowAddEntry(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Journal Entries Table */}
        <div className={isLightMode ? 'bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl overflow-hidden shadow-sm' : 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden'}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isLightMode ? 'bg-gray-50' : 'bg-white/5'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>Type</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>Account</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>Location</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>Department</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>Memo</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>Debit</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>Credit</th>
                </tr>
              </thead>
              <tbody className={isLightMode ? 'divide-y divide-gray-200' : 'divide-y divide-white/10'}>
                {journalEntries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className={`px-6 py-8 text-center ${getSubtextClass()}`}>
                      No journal entries yet. Add entries manually or use Auto-Map Transactions.
                    </td>
                  </tr>
                ) : (
                  journalEntries.map((entry) => (
                    <tr key={entry.id} className={entry.isAutoMapped ? 'bg-blue-500/5' : ''}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getTextClass()}`}>
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          entry.entryType === 'deposit' ? 'bg-green-500/20 text-green-400' :
                          entry.entryType === 'expense' ? 'bg-red-500/20 text-red-400' :
                          entry.entryType === 'transfer' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {entry.entryType?.toUpperCase()}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getTextClass()}`}>{entry.account}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSubtextClass()}`}>{entry.location}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSubtextClass()}`}>{entry.department}</td>
                      <td className={`px-6 py-4 text-sm ${getSubtextClass()}`}>{entry.memo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                        {entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                        {entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderAddJournalEntryModal = () => {
    if (!showAddEntry) return null

    const { debit, credit } = calculateDebitCredit(entryType, selectedAccount, entryAmount)

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={isLightMode ? 'bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg' : 'bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-semibold ${getTextClass()}`}>Add Journal Entry</h2>
            <button
              onClick={() => setShowAddEntry(false)}
              className={isLightMode ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Entry Type Selection */}
            <div>
              <label className={`block text-sm font-medium ${getSubtextClass()} mb-3`}>Entry Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'deposit', label: 'Deposit', icon: TrendingUp, color: 'green' },
                  { value: 'expense', label: 'Expense', icon: TrendingDown, color: 'red' },
                  { value: 'transfer', label: 'Transfer', icon: RefreshCw, color: 'blue' },
                  { value: 'payment', label: 'Payment', icon: CreditCard, color: 'purple' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setEntryType(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      entryType === type.value
                        ? `border-${type.color}-500 bg-${type.color}-500/10`
                        : isLightMode ? 'border-gray-300 hover:border-gray-400' : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <type.icon className={`h-5 w-5 mx-auto mb-2 ${
                      entryType === type.value ? `text-${type.color}-400` : getSubtextClass()
                    }`} />
                    <span className={`text-sm font-medium ${
                      entryType === type.value ? `text-${type.color}-400` : getSubtextClass()
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>Amount</label>
              <input
                type="number"
                value={entryAmount}
                onChange={(e) => setEntryAmount(e.target.value)}
                className={getInputClass()}
                placeholder="Enter amount"
                step="0.01"
              />
            </div>

            {/* Account Selection */}
            <div>
              <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>GL Account</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className={getInputClass()}
              >
                <option value="">Select Account</option>
                {glAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.account_number} - {account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location and Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className={getInputClass()}
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={getInputClass()}
                >
                  <option value="">Select Department</option>
                  {departments.map(department => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>Memo</label>
              <textarea
                value={entryMemo}
                onChange={(e) => setEntryMemo(e.target.value)}
                className={getInputClass()}
                placeholder="Enter memo"
                rows="3"
              />
            </div>

            {/* Auto-calculated Entry Preview */}
            {entryAmount && selectedAccount && (
              <div className={isLightMode ? 'bg-gray-50 border border-gray-200 rounded-lg p-4' : 'bg-white/5 border border-white/20 rounded-lg p-4'}>
                <h4 className={`text-sm font-medium ${getSubtextClass()} mb-2`}>Auto-calculated Entry</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className={`text-xs ${getSubtextClass()}`}>Debit</p>
                    <p className="text-lg font-semibold text-red-400">${debit.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs ${getSubtextClass()}`}>Credit</p>
                    <p className="text-lg font-semibold text-green-400">${credit.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddEntry(false)}
                className={isLightMode ? 'px-4 py-2 text-gray-500 hover:text-gray-900 transition-colors' : 'px-4 py-2 text-gray-400 hover:text-white transition-colors'}
              >
                Cancel
              </button>
              <button
                onClick={handleAddJournalEntry}
                disabled={!entryAmount || !selectedAccount}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightMode ? 'bg-gray-50' : 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isLightMode ? 'border-blue-600' : 'border-white'} mx-auto mb-4`}></div>
          <p className={getTextClass()}>Loading Accounting System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-50' : 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${getTextClass()}`}>Accounting 2</h1>
              <p className={`${getSubtextClass()} mt-2`}>GL Account Structure & Auto-Mapping System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className={`h-5 w-5 ${getSubtextClass()}`} />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className={getSelectClass()}
                >
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className={`flex space-x-1 backdrop-blur-sm rounded-lg p-1 ${isLightMode ? 'bg-white/80 border border-gray-200' : 'bg-white/5 border border-white/10'}`}>
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'journal', label: 'Journal Entries', icon: BookOpen },
              { id: 'accounts', label: 'GL Accounts', icon: FileText },
              { id: 'reports', label: 'Reports', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedView === tab.id
                    ? 'bg-blue-500 text-white'
                    : isLightMode
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {selectedView === 'overview' && renderOverview()}
          {selectedView === 'journal' && renderJournalEntries()}
          {selectedView === 'accounts' && (
            <div className="text-center py-8">
              <p className={getSubtextClass()}>GL Account Management - Coming Soon</p>
            </div>
          )}
          {selectedView === 'reports' && (
            <div className="text-center py-8">
              <p className={getSubtextClass()}>Reports - Coming Soon</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {renderAddJournalEntryModal()}
      </div>
    </div>
  )
}

export default Accounting2
