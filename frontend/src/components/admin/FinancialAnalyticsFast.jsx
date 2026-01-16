import React, { useState, useEffect, useCallback } from 'react'
import { 
  BarChart3, TrendingUp, Calculator, DollarSign, BookOpen, FileText, 
  Building, Target, Download, Settings, Search, RefreshCw
} from 'lucide-react'

const FinancialAnalyticsFast = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('executive')
  const [financialData, setFinancialData] = useState(null)
  const [glAccounts, setGlAccounts] = useState([])
  const [journalEntries, setJournalEntries] = useState([])

  // Single optimized API call
  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('FinancialAnalyticsFast - Single API call for all data...')
      
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || 'admin_token_3'
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/financial-analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('FinancialAnalyticsFast - Received data:', data)
      
      if (data.success) {
        setGlAccounts(data.data.gl_accounts || [])
        setJournalEntries(data.data.journal_entries || [])
        setFinancialData(data.data.financial_metrics || {})
        console.log('FinancialAnalyticsFast - All data loaded!')
      }
      
    } catch (err) {
      console.error('Error fetching financial data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFinancialData()
  }, [fetchFinancialData])

  // Render Balance Sheet with actual data
  const renderBalanceSheet = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading balance sheet data...</p>
          </div>
        </div>
      )
    }

    const assets = glAccounts.filter(acc => acc.type === 'Asset')
    const liabilities = glAccounts.filter(acc => acc.type === 'Liability')
    const equity = glAccounts.filter(acc => acc.type === 'Equity')

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0)
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0)
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0)

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Balance Sheet</h2>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">ASSETS</h3>
            <div className="space-y-2">
              {assets.map((account, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-300">{account.name} ({account.code})</span>
                  <span className="text-white font-semibold">${account.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4 mt-4">
                <span className="text-green-400 font-semibold text-lg">TOTAL ASSETS</span>
                <span className="text-green-400 font-bold text-xl">${totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">LIABILITIES & EQUITY</h3>
            <div className="space-y-2">
              {liabilities.map((account, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-300">{account.name} ({account.code})</span>
                  <span className="text-white font-semibold">${account.balance.toLocaleString()}</span>
                </div>
              ))}
              {equity.map((account, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-300">{account.name} ({account.code})</span>
                  <span className="text-white font-semibold">${account.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4 mt-4">
                <span className="text-green-400 font-semibold text-lg">TOTAL LIABILITIES & EQUITY</span>
                <span className="text-green-400 font-bold text-xl">${(totalLiabilities + totalEquity).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Journal Entries
  const renderJournalEntries = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading journal entries...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Journal Entries</h2>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400">Reference</th>
                  <th className="text-left py-3 px-4 text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 text-gray-400">From Account</th>
                  <th className="text-left py-3 px-4 text-gray-400">To Account</th>
                  <th className="text-right py-3 px-4 text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {journalEntries.map((entry, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 text-gray-300">{entry.date}</td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-300">{entry.reference}</td>
                    <td className="py-3 px-4 text-white">{entry.description}</td>
                    <td className="py-3 px-4 text-gray-300">{entry.from_account}</td>
                    <td className="py-3 px-4 text-gray-300">{entry.to_account}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-green-400">${entry.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.status === 'posted' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'bs':
        return renderBalanceSheet()
      case 'journal':
        return renderJournalEntries()
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-400">This section is under development</p>
            </div>
          </div>
        )
    }
  }

  // Define tabs array
  const tabs = [
    { id: 'executive', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'pl', label: 'Profit & Loss', icon: TrendingUp },
    { id: 'bs', label: 'Balance Sheet', icon: Calculator },
    { id: 'cf', label: 'Cash Flow', icon: DollarSign },
    { id: 'gl', label: 'General Ledger', icon: BookOpen },
    { id: 'journal', label: 'Journal Entries', icon: FileText },
    { id: 'reconciliation', label: 'Bank Reconciliation', icon: Building },
    { id: 'analytics', label: 'Advanced Analytics', icon: Target },
    { id: 'reports', label: 'Reports & Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <BarChart3 className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
              <p className="text-gray-400">{error}</p>
            </div>
            <button 
              onClick={fetchFinancialData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Financial Analytics</h1>
          <p className="text-gray-400">Comprehensive financial management and reporting system</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <select className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
            <button 
              onClick={fetchFinancialData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderTabContent()}
      </div>
    </div>
  )
}

export default FinancialAnalyticsFast


