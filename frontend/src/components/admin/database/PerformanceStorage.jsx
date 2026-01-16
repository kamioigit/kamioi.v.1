import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  HardDrive,
  Cpu,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Zap,
  Activity,
  Target,
  Download,
  Upload
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const PerformanceStorage = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [performanceData, setPerformanceData] = useState(null)
  const [selectedObject, setSelectedObject] = useState(null)
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
      const response = await fetch(`${apiBaseUrl}/api/admin/performance/storage`)
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

  const getBloatColor = (bloat) => {
    if (bloat < 10) return 'text-green-400'
    if (bloat < 20) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getHitRatioColor = (ratio) => {
    if (ratio > 95) return 'text-green-400'
    if (ratio > 90) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getPerformanceIcon = (type) => {
    switch (type) {
      case 'table': return <Database className="w-4 h-4" />
      case 'index': return <Target className="w-4 h-4" />
      case 'partition': return <HardDrive className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const filteredIndexes = performanceData?.indexHealth?.filter(index => {
    const matchesSearch = index.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         index.indexName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || index.type === typeFilter
    return matchesSearch && matchesType
  }) || []

  const handleViewDetails = (object) => {
    setSelectedObject(object)
    setShowDetails(true)
  }

  const handleReindex = (object) => {
    console.log(`Reindexing: ${object.indexName || object.tableName}`)
    // Implement reindex operation
  }

  const handleVacuum = (object) => {
    console.log(`Vacuuming: ${object.tableName}`)
    // Implement vacuum operation
  }

  const handleAnalyze = (object) => {
    console.log(`Analyzing: ${object.tableName}`)
    // Implement analyze operation
  }

  const handleCreatePartition = () => {
    console.log('Creating new partition')
    // Implement partition creation
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Performance & Storage</h2>
          <p className={`${getSubtextClass()}`}>
            Index health and storage optimization ({filteredIndexes.length} objects)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleCreatePartition}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
          >
            <HardDrive className="w-4 h-4" />
            <span>Create Partition</span>
          </button>
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
              <HardDrive className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">
                {performanceData.storageStats?.totalSize || 'N/A'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Total Size</p>
            <p className="text-white text-lg font-semibold">
              {performanceData.storageStats?.bloatPercent || 'N/A'}% Bloat
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <Cpu className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {performanceData.storageStats?.cacheHitRatio || 'N/A'}%
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Cache Hit Ratio</p>
            <p className="text-white text-lg font-semibold">
              {performanceData.storageStats?.lastAnalyze ? new Date(performanceData.storageStats.lastAnalyze).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <Target className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {performanceData.indexHealth?.length || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Indexes</p>
            <p className="text-white text-lg font-semibold">
              {performanceData.indexHealth?.filter(idx => idx.bloatPercent > 20).length || 0} Need Reindex
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">
                {performanceData.storageStats?.bloatPercent || 'N/A'}%
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Storage Bloat</p>
            <p className="text-white text-lg font-semibold">
              {performanceData.indexHealth?.[0]?.lastVacuum ? new Date(performanceData.indexHealth[0].lastVacuum).toLocaleDateString() : 'N/A'}
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
                placeholder="Search objects..."
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
            <option value="table">Tables</option>
            <option value="index">Indexes</option>
            <option value="partition">Partitions</option>
          </select>
        </div>
      </div>

      {/* Index Health Table */}
      <div className={`${getCardClass()} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Object</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Bloat %</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Hit Ratio</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Vacuum</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndexes.map((index, index_idx) => (
                <tr key={index_idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      {getPerformanceIcon('index')}
                      <div>
                        <div className={`font-medium ${getTextClass()}`}>{index.tableName}</div>
                        <div className={`text-sm ${getSubtextClass()} font-mono`}>{index.indexName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                      Index
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${getBloatColor(index.bloatPercent)}`}>
                      {index.bloatPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${getHitRatioColor(index.hitRatio)}`}>
                      {index.hitRatio}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{new Date(index.lastVacuum).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${
                      index.bloatPercent > 20 ? 'text-red-400 bg-red-500/20' :
                      index.bloatPercent > 10 ? 'text-yellow-400 bg-yellow-500/20' :
                      'text-green-400 bg-green-500/20'
                    }`}>
                      {index.bloatPercent > 20 ? <XCircle className="w-4 h-4" /> :
                       index.bloatPercent > 10 ? <AlertTriangle className="w-4 h-4" /> :
                       <CheckCircle className="w-4 h-4" />}
                      <span className="text-sm">
                        {index.bloatPercent > 20 ? 'Critical' :
                         index.bloatPercent > 10 ? 'Warning' :
                         'Healthy'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(index)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReindex(index)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Reindex"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleVacuum(index)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Vacuum"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAnalyze(index)}
                        className="text-purple-400 hover:text-purple-300 p-1"
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

      {/* Storage Statistics */}
      {performanceData?.storageStats && (
        <div className={`${getCardClass()} rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>Storage Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getSubtextClass()}`}>Total Size</label>
              <p className={`${getTextClass()} text-2xl font-bold`}>{performanceData.storageStats.totalSize}</p>
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getSubtextClass()}`}>Bloat Percentage</label>
              <p className={`${getTextClass()} text-2xl font-bold ${getBloatColor(performanceData.storageStats.bloatPercent)}`}>
                {performanceData.storageStats.bloatPercent}%
              </p>
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getSubtextClass()}`}>Cache Hit Ratio</label>
              <p className={`${getTextClass()} text-2xl font-bold ${getHitRatioColor(performanceData.storageStats.cacheHitRatio)}`}>
                {performanceData.storageStats.cacheHitRatio}%
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className={`${getSubtextClass()}`}>Last Analyze</span>
              <span className={`${getTextClass()}`}>
                {new Date(performanceData.storageStats.lastAnalyze).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Object Details Modal */}
      {showDetails && selectedObject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl mx-4 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>
                Object Details: {selectedObject.tableName}
              </h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Table Name</label>
                  <p className={`${getTextClass()}`}>{selectedObject.tableName}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Index Name</label>
                  <p className={`${getTextClass()} font-mono`}>{selectedObject.indexName}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Bloat Percentage</label>
                  <p className={`${getTextClass()} ${getBloatColor(selectedObject.bloatPercent)} text-xl font-bold`}>
                    {selectedObject.bloatPercent}%
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Hit Ratio</label>
                  <p className={`${getTextClass()} ${getHitRatioColor(selectedObject.hitRatio)} text-xl font-bold`}>
                    {selectedObject.hitRatio}%
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Last Vacuum</label>
                  <p className={`${getTextClass()}`}>{new Date(selectedObject.lastVacuum).toLocaleString()}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Status</label>
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded ${
                    selectedObject.bloatPercent > 20 ? 'text-red-400 bg-red-500/20' :
                    selectedObject.bloatPercent > 10 ? 'text-yellow-400 bg-yellow-500/20' :
                    'text-green-400 bg-green-500/20'
                  }`}>
                    {selectedObject.bloatPercent > 20 ? <XCircle className="w-4 h-4" /> :
                     selectedObject.bloatPercent > 10 ? <AlertTriangle className="w-4 h-4" /> :
                     <CheckCircle className="w-4 h-4" />}
                    <span className="text-sm">
                      {selectedObject.bloatPercent > 20 ? 'Critical' :
                       selectedObject.bloatPercent > 10 ? 'Warning' :
                       'Healthy'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Recommendations</label>
                  <div className="space-y-2">
                    {selectedObject.bloatPercent > 20 && (
                      <p className="text-red-400 text-sm">⚠️ Immediate reindex required</p>
                    )}
                    {selectedObject.bloatPercent > 10 && selectedObject.bloatPercent <= 20 && (
                      <p className="text-yellow-400 text-sm">⚠️ Consider reindexing soon</p>
                    )}
                    {selectedObject.hitRatio < 90 && (
                      <p className="text-yellow-400 text-sm">⚠️ Low cache hit ratio</p>
                    )}
                    {selectedObject.bloatPercent <= 10 && selectedObject.hitRatio >= 90 && (
                      <p className="text-green-400 text-sm">✅ Performance is optimal</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleReindex(selectedObject)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span>Reindex</span>
                </button>
                <button
                  onClick={() => handleVacuum(selectedObject)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Vacuum</span>
                </button>
                <button
                  onClick={() => handleAnalyze(selectedObject)}
                  className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 flex items-center space-x-2 transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceStorage

