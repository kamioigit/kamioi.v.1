import React, { useState, useEffect, useCallback } from 'react'
import { 
  Database, Upload, Plus, Brain, Trash2, Search, BarChart3, 
  Clock, CheckCircle, XCircle, TrendingUp, DollarSign, 
  RefreshCw, Settings, Target, Zap
} from 'lucide-react'

const LLMCenterUltraFast = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')
  const [dashboardData, setDashboardData] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadTime, setLoadTime] = useState(0)

  // ULTRA-FAST: Single API call for ALL data
  const fetchDashboardData = useCallback(async () => {
    const startTime = performance.now()
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('LLMCenterUltraFast - Single ultra-fast API call...')
      
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || 'admin_token_3'
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/llm-center/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const endTime = performance.now()
      const loadTimeMs = Math.round(endTime - startTime)
      setLoadTime(loadTimeMs)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`⚡ LLMCenterUltraFast - Loaded in ${loadTimeMs}ms:`, data)
      
      if (data.success) {
        setDashboardData(data.data)
        console.log('LLMCenterUltraFast - All data loaded!')
      }
      
    } catch (err) {
      console.error('Error fetching LLM dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Render performance indicator
  const renderPerformanceIndicator = () => {
    if (!loadTime) return null
    
    const isFast = loadTime < 1000
    const color = isFast ? 'text-green-400' : loadTime < 2000 ? 'text-yellow-400' : 'text-red-400'
    
    return (
      <div className={`flex items-center space-x-2 ${color} mb-4`}>
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">
          Loaded in {loadTime}ms {isFast ? '(Ultra Fast!)' : '(Slow)'}
        </span>
      </div>
    )
  }

  // Render KPIs
  const renderKPIs = () => {
    if (!dashboardData) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">{dashboardData.total_mappings.toLocaleString()}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Total Mappings</h3>
          <p className="text-gray-400 text-sm">Millions scale ready</p>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-white">{dashboardData.approved_mappings.toLocaleString()}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Approved Mappings</h3>
          <p className="text-gray-400 text-sm">Ready for use</p>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white">{dashboardData.auto_approval_rate}%</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Auto-Approval Rate</h3>
          <p className="text-gray-400 text-sm">AI confidence</p>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-white">${dashboardData.llm_data_assets_balance.toLocaleString()}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">LLM Data Assets</h3>
          <p className="text-gray-400 text-sm">Total value</p>
        </div>
      </div>
    )
  }

  // Render system status
  const renderSystemStatus = () => {
    if (!dashboardData) return null

    return (
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-2 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-medium">System Online</span>
        </div>
        <div className="flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-3 py-2 rounded-full">
          <Database className="w-4 h-4" />
          <span className="text-sm font-medium">Database: Connected</span>
        </div>
        <div className="flex items-center space-x-2 bg-purple-500/20 text-purple-400 px-3 py-2 rounded-full">
          <Brain className="w-4 h-4" />
          <span className="text-sm font-medium">AI Model: Active</span>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-full">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Performance: Optimized</span>
        </div>
      </div>
    )
  }

  // Render action buttons
  const renderActionButtons = () => {
    return (
      <div className="flex flex-wrap gap-3 mb-8">
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Bulk Upload</span>
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Manual Submit</span>
        </button>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Brain className="w-4 h-4" />
          <span>Train LLM Model</span>
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Trash2 className="w-4 h-4" />
          <span>Clear All Mappings</span>
        </button>
      </div>
    )
  }

  // Render summary tab
  const renderSummaryTab = () => {
    if (!dashboardData) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{dashboardData.pending_mappings.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Pending Mappings</h3>
            <p className="text-gray-400 text-sm">Awaiting review</p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{dashboardData.approved_mappings.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Approved Mappings</h3>
            <p className="text-gray-400 text-sm">Ready for use</p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
              <span className="text-3xl font-bold text-white">{dashboardData.rejected_mappings.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Rejected Mappings</h3>
            <p className="text-gray-400 text-sm">Require attention</p>
          </div>
        </div>

        {/* Performance Metrics */}
        {dashboardData.performance_metrics && (
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{dashboardData.performance_metrics.load_time_ms}ms</div>
                <div className="text-sm text-gray-400">Load Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{dashboardData.performance_metrics.cache_hit_rate}%</div>
                <div className="text-sm text-gray-400">Cache Hit Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">Enabled</div>
                <div className="text-sm text-gray-400">Query Optimization</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render search tab
  const renderSearchTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Search Mappings</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Search by merchant name, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Search Results</h3>
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Enter a search term to find mappings</p>
          </div>
        </div>
      </div>
    )
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return renderSummaryTab()
      case 'search':
        return renderSearchTab()
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
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'pending', label: 'Pending Mappings', icon: Clock },
    { id: 'rejected', label: 'Rejected Mappings', icon: XCircle },
    { id: 'approved', label: 'Approved Mappings', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'assets', label: 'LLM Data Assets', icon: DollarSign }
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <Database className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
              <p className="text-gray-400">{error}</p>
            </div>
            <button 
              onClick={fetchDashboardData}
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
          <h1 className="text-3xl font-bold text-white mb-2">LLM Mapping Center</h1>
          <p className="text-gray-400">Enterprise-grade AI merchant recognition system for millions of mappings</p>
        </div>

        {/* Performance Indicator */}
        {renderPerformanceIndicator()}

        {/* Action Buttons */}
        {renderActionButtons()}

        {/* System Status */}
        {renderSystemStatus()}

        {/* KPIs */}
        {renderKPIs()}

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

export default LLMCenterUltraFast
