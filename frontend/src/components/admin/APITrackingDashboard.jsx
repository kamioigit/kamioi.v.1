import React, { useState, useEffect, useRef } from 'react'
import { Activity, DollarSign, TrendingUp, AlertTriangle, Clock, Database, RefreshCw, Download, Calendar, Wallet, Edit2, Save, X, ChevronLeft, ChevronRight, CheckCircle, XCircle, Filter, Search, ChevronDown } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useQuery } from '@tanstack/react-query'

const APITrackingDashboard = () => {
  const { isLightMode } = useTheme()
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [recordsPage, setRecordsPage] = useState(1)
  const recordsLimit = 50
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'success', 'failed'
  const [endpointFilter, setEndpointFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [pageTabFilter, setPageTabFilter] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterDropdownRef = useRef(null)
  
  const { data: usageData, isLoading, error, refetch } = useQuery({
    queryKey: ['api-usage', selectedPeriod],
    queryFn: async () => {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      
      const response = await fetch(`${apiBaseUrl}/api/admin/api-usage/stats?days=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  })
  
  const { data: costLimitData } = useQuery({
    queryKey: ['api-usage-limit'],
    queryFn: async () => {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      
      const response = await fetch(`${apiBaseUrl}/api/admin/api-usage/daily-limit`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) return null
      return await response.json()
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // Refresh every minute
  })
  
  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ['api-balance'],
    queryFn: async () => {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      
      const response = await fetch(`${apiBaseUrl}/api/admin/api-usage/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) return null
      return await response.json()
    },
    staleTime: 30000,
    refetchInterval: 60000
  })
  
  const { data: recordsData, isLoading: recordsLoading, refetch: refetchRecords } = useQuery({
    queryKey: ['api-usage-records', recordsPage, selectedPeriod, statusFilter, endpointFilter, userIdFilter, pageTabFilter],
    queryFn: async () => {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      
      // Build query parameters
      const params = new URLSearchParams({
        page: recordsPage.toString(),
        limit: recordsLimit.toString(),
        days: selectedPeriod.toString()
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (endpointFilter.trim()) {
        params.append('endpoint', endpointFilter.trim())
      }
      if (userIdFilter.trim()) {
        params.append('user_id', userIdFilter.trim())
      }
      if (pageTabFilter.trim()) {
        params.append('page_tab', pageTabFilter.trim())
      }
      
      const response = await fetch(`${apiBaseUrl}/api/admin/api-usage/records?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  })
  
  const [isEditingBalance, setIsEditingBalance] = useState(false)
  const [balanceInput, setBalanceInput] = useState('')
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false)
  
  const handleUpdateBalance = async () => {
    const newBalance = parseFloat(balanceInput)
    if (isNaN(newBalance) || newBalance < 0) {
      alert('Please enter a valid balance amount')
      return
    }
    
    setIsUpdatingBalance(true)
    try {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      
      const response = await fetch(`${apiBaseUrl}/api/admin/api-usage/balance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ balance: newBalance })
      })
      
      if (response.ok) {
        setIsEditingBalance(false)
        setBalanceInput('')
        refetchBalance()
        refetch() // Refresh usage stats
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update balance')
      }
    } catch (error) {
      console.error('Error updating balance:', error)
      alert('Failed to update balance')
    } finally {
      setIsUpdatingBalance(false)
    }
  }
  
  useEffect(() => {
    if (balanceData?.data && !isEditingBalance) {
      setBalanceInput(balanceData.data.current_balance?.toFixed(2) || '20.00')
    }
  }, [balanceData, isEditingBalance])
  
  // Reset to page 1 when period or filters change
  useEffect(() => {
    setRecordsPage(1)
  }, [selectedPeriod, statusFilter, endpointFilter, userIdFilter, pageTabFilter])
  
  // Get unique values for filter dropdowns
  const uniqueEndpoints = React.useMemo(() => {
    if (!recordsData?.data?.records) return []
    const endpoints = new Set()
    recordsData.data.records.forEach(r => {
      if (r.endpoint) {
        const endpointName = r.endpoint.split('/').pop() || r.endpoint
        endpoints.add(endpointName)
      }
    })
    return Array.from(endpoints).sort()
  }, [recordsData])
  
  const uniquePageTabs = React.useMemo(() => {
    if (!recordsData?.data?.records) return []
    const tabs = new Set()
    recordsData.data.records.forEach(r => {
      if (r.page_tab && r.page_tab !== 'N/A') {
        tabs.add(r.page_tab)
      }
    })
    return Array.from(tabs).sort()
  }, [recordsData])
  
  const clearFilters = () => {
    setStatusFilter('all')
    setEndpointFilter('')
    setUserIdFilter('')
    setPageTabFilter('')
  }
  
  const hasActiveFilters = statusFilter !== 'all' || endpointFilter.trim() || userIdFilter.trim() || pageTabFilter.trim()
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false)
      }
    }
    
    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown])
  
  const getTextClass = () => (isLightMode ? 'text-gray-900' : 'text-white')
  const getSubtextClass = () => (isLightMode ? 'text-gray-600' : 'text-gray-400')
  const getCardClass = () => `bg-white/10 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/20 ${isLightMode ? 'bg-opacity-80' : 'bg-opacity-10'}`
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount)
  }
  
  if (isLoading) {
    return (
      <div className={getCardClass()}>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className={`w-8 h-8 animate-spin ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
          <span className={`ml-4 ${getTextClass()}`}>Loading API usage data...</span>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={getCardClass()}>
        <div className="text-center py-12">
          <AlertTriangle className={`w-16 h-16 mx-auto mb-4 ${isLightMode ? 'text-red-600' : 'text-red-400'}`} />
          <h3 className={`text-xl font-semibold ${getTextClass()} mb-2`}>Error Loading API Usage</h3>
          <p className={getSubtextClass()}>{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  const stats = usageData?.data || {}
  const limitStatus = costLimitData?.data || {}
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={getCardClass()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${getTextClass()} mb-2`}>
              API Usage & Cost Tracking
            </h1>
            <p className={getSubtextClass()}>
              Monitor AI API calls, costs, and usage statistics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className={`px-4 py-2 rounded-lg ${isLightMode ? 'bg-white border border-gray-300' : 'bg-white/10 border border-white/20'} ${getTextClass()}`}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              onClick={() => refetch()}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isLightMode ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Balance Section */}
      {balanceData?.data && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className={`w-8 h-8 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
                <div>
                  <h3 className={`text-lg font-semibold ${getTextClass()}`}>AI API Balance</h3>
                  {!isEditingBalance ? (
                    <div className="flex items-center space-x-4 mt-2">
                      <div>
                        <p className={`text-sm ${getSubtextClass()}`}>Current Balance</p>
                        <p className={`text-3xl font-bold ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`}>
                          {formatCurrency(balanceData.data.current_balance || 20.0)}
                        </p>
                      </div>
                      <div className="h-12 w-px bg-white/20"></div>
                      <div>
                        <p className={`text-sm ${getSubtextClass()}`}>Total Spent (This Month)</p>
                        <p className={`text-2xl font-bold ${getTextClass()}`}>
                          {formatCurrency(balanceData.data.total_spent || 0)}
                        </p>
                      </div>
                      <div className="h-12 w-px bg-white/20"></div>
                      <div>
                        <p className={`text-sm ${getSubtextClass()}`}>Remaining Balance</p>
                        <p className={`text-2xl font-bold ${
                          (balanceData.data.remaining_balance || 0) < 5 
                            ? (isLightMode ? 'text-red-600' : 'text-red-400')
                            : (isLightMode ? 'text-green-600' : 'text-green-400')
                        }`}>
                          {formatCurrency(balanceData.data.remaining_balance || 20.0)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={balanceInput}
                        onChange={(e) => setBalanceInput(e.target.value)}
                        className={`px-4 py-2 rounded-lg border ${
                          isLightMode 
                            ? 'bg-white border-gray-300 text-gray-900' 
                            : 'bg-white/10 border-white/20 text-white'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter balance"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateBalance}
                        disabled={isUpdatingBalance}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingBalance(false)
                          setBalanceInput(balanceData.data.current_balance?.toFixed(2) || '20.00')
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {!isEditingBalance && (
                <button
                  onClick={() => setIsEditingBalance(true)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isLightMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Update Balance</span>
                </button>
              )}
            </div>
            
            {/* Low Balance Warning */}
            {(balanceData.data.remaining_balance || 0) < 5 && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold">Low Balance Warning</span>
                </div>
                <p className={`text-sm mt-1 ${getSubtextClass()}`}>
                  Your remaining balance is below $5.00. Consider topping up to avoid service interruption.
                </p>
              </div>
            )}
          </div>
        )}
      
      {/* Daily Cost Limit Alert */}
      {limitStatus.limit_exceeded && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold">Daily Cost Limit Exceeded!</span>
            </div>
            <p className={`text-sm mt-2 ${getSubtextClass()}`}>
              Today's cost: {formatCurrency(limitStatus.today_cost)} / Limit: {formatCurrency(limitStatus.daily_limit)}
            </p>
          </div>
        )}
        
        {limitStatus.percentage_used > 80 && !limitStatus.limit_exceeded && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Approaching Daily Limit</span>
            </div>
            <p className={`text-sm mt-2 ${getSubtextClass()}`}>
              {limitStatus.percentage_used.toFixed(1)}% of daily limit used ({formatCurrency(limitStatus.today_cost)} / {formatCurrency(limitStatus.daily_limit)})
            </p>
          </div>
        )}
      
      {/* Key Metrics */}
      <div className={getCardClass()}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${getSubtextClass()}`}>Total API Calls</span>
              <Activity className={`w-5 h-5 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
            </div>
            <p className={`text-2xl font-bold ${getTextClass()}`}>{stats.total_calls?.toLocaleString() || 0}</p>
            <p className={`text-xs mt-1 ${getSubtextClass()}`}>
              {stats.successful_calls || 0} successful, {stats.failed_calls || 0} failed
            </p>
          </div>
          
          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${getSubtextClass()}`}>Total Cost</span>
              <DollarSign className={`w-5 h-5 ${isLightMode ? 'text-green-600' : 'text-green-400'}`} />
            </div>
            <p className={`text-2xl font-bold ${getTextClass()}`}>{formatCurrency(stats.total_cost || 0)}</p>
            <p className={`text-xs mt-1 ${getSubtextClass()}`}>
              Period: {stats.period_days} days
            </p>
          </div>
          
          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${getSubtextClass()}`}>Success Rate</span>
              <TrendingUp className={`w-5 h-5 ${stats.success_rate < 95 ? (isLightMode ? 'text-yellow-600' : 'text-yellow-400') : (isLightMode ? 'text-green-600' : 'text-green-400')}`} />
            </div>
            <p className={`text-2xl font-bold ${getTextClass()}`}>{stats.success_rate?.toFixed(1) || 0}%</p>
            <p className={`text-xs mt-1 ${getSubtextClass()}`}>
              {stats.successful_calls || 0} / {stats.total_calls || 0} calls
            </p>
          </div>
          
          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${getSubtextClass()}`}>Avg Response Time</span>
              <Clock className={`w-5 h-5 ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`} />
            </div>
            <p className={`text-2xl font-bold ${getTextClass()}`}>
              {stats.average_processing_time_ms ? `${stats.average_processing_time_ms.toFixed(0)}ms` : 'N/A'}
            </p>
            <p className={`text-xs mt-1 ${getSubtextClass()}`}>
              Per API call
            </p>
          </div>
        </div>
      </div>
      
      {/* Detailed API Calls Table */}
      <div className={getCardClass()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>API Call History</h3>
          <div className="flex items-center space-x-2">
            {/* Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`px-3 py-1 rounded-lg flex items-center space-x-2 text-sm ${
                  hasActiveFilters
                    ? (isLightMode ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30')
                    : (isLightMode ? 'bg-gray-200 text-gray-700' : 'bg-white/10 text-gray-400 border border-white/20')
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                    isLightMode ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    Active
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showFilterDropdown && (
                <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50 border ${
                  isLightMode ? 'bg-white border-gray-200' : 'bg-gray-800 border-white/20'
                }`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-sm font-semibold ${getTextClass()}`}>Filter Records</h4>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className={`text-xs px-2 py-1 rounded ${
                            isLightMode ? 'text-blue-600 hover:bg-blue-50' : 'text-blue-400 hover:bg-blue-500/10'
                          }`}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {/* Status Filter */}
                      <div>
                        <label className={`block text-xs font-medium ${getSubtextClass()} mb-1`}>
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg text-sm ${
                            isLightMode ? 'bg-white border border-gray-300 text-gray-900' : 'bg-white/10 border border-white/20 text-white'
                          }`}
                        >
                          <option value="all">All Status</option>
                          <option value="success">Success Only</option>
                          <option value="failed">Failed Only</option>
                        </select>
                      </div>
                      
                      {/* Endpoint Filter */}
                      <div>
                        <label className={`block text-xs font-medium ${getSubtextClass()} mb-1`}>
                          Endpoint
                        </label>
                        <div className="relative">
                          <Search className={`absolute left-2 top-2.5 w-4 h-4 ${getSubtextClass()}`} />
                          <input
                            type="text"
                            value={endpointFilter}
                            onChange={(e) => setEndpointFilter(e.target.value)}
                            placeholder="Search endpoint..."
                            className={`w-full pl-8 pr-3 py-2 rounded-lg text-sm ${
                              isLightMode ? 'bg-white border border-gray-300 text-gray-900' : 'bg-white/10 border border-white/20 text-white'
                            }`}
                          />
                        </div>
                      </div>
                      
                      {/* User ID Filter */}
                      <div>
                        <label className={`block text-xs font-medium ${getSubtextClass()} mb-1`}>
                          User ID
                        </label>
                        <div className="relative">
                          <Search className={`absolute left-2 top-2.5 w-4 h-4 ${getSubtextClass()}`} />
                          <input
                            type="text"
                            value={userIdFilter}
                            onChange={(e) => setUserIdFilter(e.target.value)}
                            placeholder="Account # or ID..."
                            className={`w-full pl-8 pr-3 py-2 rounded-lg text-sm ${
                              isLightMode ? 'bg-white border border-gray-300 text-gray-900' : 'bg-white/10 border border-white/20 text-white'
                            }`}
                          />
                        </div>
                      </div>
                      
                      {/* Page Tab Filter */}
                      <div>
                        <label className={`block text-xs font-medium ${getSubtextClass()} mb-1`}>
                          Page/Tab
                        </label>
                        <div className="relative">
                          <Search className={`absolute left-2 top-2.5 w-4 h-4 ${getSubtextClass()}`} />
                          <input
                            type="text"
                            value={pageTabFilter}
                            onChange={(e) => setPageTabFilter(e.target.value)}
                            placeholder="Search page/tab..."
                            className={`w-full pl-8 pr-3 py-2 rounded-lg text-sm ${
                              isLightMode ? 'bg-white border border-gray-300 text-gray-900' : 'bg-white/10 border border-white/20 text-white'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex flex-wrap gap-2">
                          {statusFilter !== 'all' && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              Status: {statusFilter}
                            </span>
                          )}
                          {endpointFilter.trim() && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              Endpoint: {endpointFilter}
                            </span>
                          )}
                          {userIdFilter.trim() && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              User: {userIdFilter}
                            </span>
                          )}
                          {pageTabFilter.trim() && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              Tab: {pageTabFilter}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => refetchRecords()}
              className={`px-3 py-1 rounded-lg flex items-center space-x-2 text-sm ${
                isLightMode ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {recordsLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className={`w-6 h-6 animate-spin ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
            <span className={`ml-3 ${getTextClass()}`}>Loading records...</span>
          </div>
        ) : recordsData?.data?.records && recordsData.data.records.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isLightMode ? 'border-gray-300' : 'border-white/20'}`}>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>Date</th>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>Endpoint</th>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>Message</th>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>Tokens</th>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>Time</th>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>Cost</th>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>Stored</th>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>Tab</th>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>User ID</th>
                    <th className={`text-left py-3 px-4 ${getSubtextClass()} text-xs font-semibold uppercase tracking-wider`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsData.data.records.map((record) => (
                    <tr 
                      key={record.id} 
                      className={`border-b ${isLightMode ? 'border-gray-200 hover:bg-gray-50' : 'border-white/10 hover:bg-white/5'}`}
                    >
                      <td className={`py-3 px-4 ${getTextClass()} text-sm`}>
                        {new Date(record.date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className={`py-3 px-4 ${getTextClass()} text-sm font-mono text-xs`}>
                        {record.endpoint.split('/').pop() || record.endpoint}
                      </td>
                      <td className={`py-3 px-4 ${getTextClass()} text-sm max-w-xs truncate`} title={record.message || 'N/A'}>
                        {record.message || 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${getTextClass()} text-sm`}>
                        {record.total_tokens.toLocaleString()}
                        <span className={`text-xs ml-1 ${getSubtextClass()}`}>
                          ({record.prompt_tokens}+{record.completion_tokens})
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${getTextClass()} text-sm`}>
                        {record.processing_time_ms.toLocaleString()}ms
                      </td>
                      <td className={`py-3 px-4 ${isLightMode ? 'text-green-600' : 'text-green-400'} text-sm font-semibold`}>
                        {formatCurrency(record.cost)}
                      </td>
                      <td className="py-3 px-4">
                        {record.stored ? (
                          <CheckCircle className={`w-5 h-5 ${isLightMode ? 'text-green-600' : 'text-green-400'}`} />
                        ) : (
                          <XCircle className={`w-5 h-5 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </td>
                      <td className={`py-3 px-4 ${getTextClass()} text-sm`}>
                        {record.page_tab}
                      </td>
                      <td className={`py-3 px-4 ${getTextClass()} text-sm`}>
                        {record.user_id}
                      </td>
                      <td className="py-3 px-4">
                        {record.success ? (
                          <span className={`px-2 py-1 rounded text-xs ${
                            isLightMode ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-300'
                          }`}>
                            Success
                          </span>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs ${
                            isLightMode ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-300'
                          }`} title={record.error_message || 'Failed'}>
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {recordsData.data.total_pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                <div className={`text-sm ${getSubtextClass()}`}>
                  Showing {((recordsPage - 1) * recordsLimit) + 1} to {Math.min(recordsPage * recordsLimit, recordsData.data.total)} of {recordsData.data.total} records
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setRecordsPage(p => Math.max(1, p - 1))}
                    disabled={recordsPage === 1}
                    className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
                      recordsPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : isLightMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <span className={`px-3 py-1 ${getTextClass()}`}>
                    Page {recordsPage} of {recordsData.data.total_pages}
                  </span>
                  <button
                    onClick={() => setRecordsPage(p => Math.min(recordsData.data.total_pages, p + 1))}
                    disabled={recordsPage >= recordsData.data.total_pages}
                    className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
                      recordsPage >= recordsData.data.total_pages
                        ? 'opacity-50 cursor-not-allowed'
                        : isLightMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Database className={`w-12 h-12 mx-auto mb-3 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={getSubtextClass()}>No API calls found for the selected period</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default APITrackingDashboard

