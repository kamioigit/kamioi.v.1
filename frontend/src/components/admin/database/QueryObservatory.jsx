import React, { useState, useEffect } from 'react'
import { Activity, Search, Filter, RefreshCw, Eye, AlertTriangle, CheckCircle, XCircle, Clock, Database, Zap, BarChart3, TrendingUp, Play, Pause, Settings, Download, X, Target, Timer, Cpu, HardDrive, Lock } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const QueryObservatory = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [performanceData, setPerformanceData] = useState(null)
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/performance`)
      if (response.ok) {
        const data = await response.json()
        setPerformanceData(data)
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDurationColor = (duration) => {
    if (duration < 100) return 'text-green-400'
    if (duration < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getPerformanceIcon = (type) => {
    switch (type) {
      case 'slow_query': return <Timer className="w-4 h-4" />
      case 'lock_wait': return <AlertTriangle className="w-4 h-4" />
      case 'deadlock': return <XCircle className="w-4 h-4" />
      case 'temp_file': return <HardDrive className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const filteredQueries = performanceData?.slowQueries?.filter(query => {
    const matchesSearch = query.query.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || query.type === typeFilter
    return matchesSearch && matchesType
  }) || []

  const handleViewDetails = (query) => {
    setSelectedQuery(query)
    setShowDetails(true)
  }

  const handleKillQuery = (query) => {
    console.log(`Killing query: ${query.query}`)
    // Implement query termination
  }

  const handleAnalyzeQuery = (query) => {
    console.log(`Analyzing query: ${query.query}`)
    // Implement query analysis
  }

  const handleIndexAdvisor = (query) => {
    console.log(`Running index advisor for: ${query.query}`)
    // Implement index advisor
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Query Observatory</h2>
          <p className={`${getSubtextClass()}`}>
            Slow queries and performance analysis ({filteredQueries.length} queries)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchPerformanceData}
            disabled={loading}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      {performanceData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <Timer className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {performanceData.slowQueries?.length || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Slow Queries</p>
            <p className="text-white text-lg font-semibold">
              {performanceData.storageStats?.totalSize || 'N/A'}
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <Cpu className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">
                {performanceData.storageStats?.cacheHitRatio || 'N/A'}%
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Cache Hit Ratio</p>
            <p className="text-white text-lg font-semibold">
              {performanceData.storageStats?.bloatPercent || 'N/A'}% Bloat
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <BarChart3 className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {performanceData.indexHealth?.length || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Index Health</p>
            <p className="text-white text-lg font-semibold">
              {performanceData.storageStats?.lastAnalyze ? new Date(performanceData.storageStats.lastAnalyze).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {performanceData.storageStats?.bloatPercent || 'N/A'}%
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Storage Bloat</p>
            <p className="text-white text-lg font-semibold">
              Last Vacuum: {performanceData.indexHealth?.[0]?.lastVacuum ? new Date(performanceData.indexHealth[0].lastVacuum).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${getCardClass()} rounded-xl p-4 border`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="slow_query">Slow Queries</option>
            <option value="lock_wait">Lock Waits</option>
            <option value="deadlock">Deadlocks</option>
            <option value="temp_file">Temp Files</option>
          </select>
        </div>
      </div>

      {/* Slow Queries Table */}
      <div className={`${getCardClass()} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Query</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg Duration</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Count</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Seen</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((query, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="max-w-md">
                      <div className={`font-mono text-sm ${getTextClass()} break-all`}>
                        {query.query.length > 100 ? `${query.query.substring(0, 100)}...` : query.query}
                      </div>
                      <div className={`text-xs ${getSubtextClass()} mt-1`}>
                        {query.query.length > 100 ? 'Click to view full query' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${getDurationColor(query.avgDuration)}`}>
                      {query.avgDuration}ms
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-white">{query.count}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{new Date(query.lastSeen).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getPerformanceIcon(query.type || 'slow_query')}
                      <span className="text-white capitalize">{query.type || 'slow_query'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(query)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAnalyzeQuery(query)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Analyze Query"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleIndexAdvisor(query)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Index Advisor"
                      >
                        <Target className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleKillQuery(query)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Kill Query"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Index Health Table */}
      {performanceData?.indexHealth && (
        <div className={`${getCardClass()} rounded-xl border overflow-hidden`}>
          <div className="p-4 border-b border-white/10">
            <h3 className={`text-lg font-semibold ${getTextClass()}`}>Index Health</h3>
            <p className={`${getSubtextClass()}`}>Index performance and bloat analysis</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Table</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Index</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Bloat %</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Hit Ratio</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Vacuum</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.indexHealth.map((index, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-mono">{index.tableName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-mono text-sm">{index.indexName}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${index.bloatPercent > 20 ? 'text-red-400' : index.bloatPercent > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {index.bloatPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${index.hitRatio > 95 ? 'text-green-400' : index.hitRatio > 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {index.hitRatio}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white">{new Date(index.lastVacuum).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => console.log('Reindex:', index.indexName)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Reindex"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => console.log('Analyze:', index.tableName)}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Analyze"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Query Details Modal */}
      {showDetails && selectedQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-6xl mx-4 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>
                Query Analysis: {selectedQuery.query.substring(0, 50)}...
              </h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className={`text-sm font-medium ${getSubtextClass()}`}>Full Query</label>
                <div className="bg-black/20 rounded-lg p-4 mt-2">
                  <pre className={`font-mono text-sm ${getTextClass()} whitespace-pre-wrap`}>
                    {selectedQuery.query}
                  </pre>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Average Duration</label>
                  <p className={`${getTextClass()} ${getDurationColor(selectedQuery.avgDuration)} text-xl font-bold`}>
                    {selectedQuery.avgDuration}ms
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Execution Count</label>
                  <p className={`${getTextClass()} text-xl font-bold`}>{selectedQuery.count}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Last Seen</label>
                  <p className={`${getTextClass()}`}>{new Date(selectedQuery.lastSeen).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleAnalyzeQuery(selectedQuery)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analyze Query</span>
                </button>
                <button
                  onClick={() => handleIndexAdvisor(selectedQuery)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <Target className="w-4 h-4" />
                  <span>Index Advisor</span>
                </button>
                <button
                  onClick={() => handleKillQuery(selectedQuery)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Kill Query</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QueryObservatory
