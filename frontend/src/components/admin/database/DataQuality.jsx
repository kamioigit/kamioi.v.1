import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  TrendingUp,
  Activity,
  Shield,
  Zap,
  BarChart3,
  Play,
  Pause
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const DataQuality = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [qualityData, setQualityData] = useState(null)
  const [selectedCheck, setSelectedCheck] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  useEffect(() => {
    fetchQualityData()
  }, [])

  const fetchQualityData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/data-quality`)
      if (response.ok) {
        const data = await response.json()
        setQualityData(data)
      }
    } catch (error) {
      console.error('Failed to fetch quality data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-green-400 bg-green-500/20'
      case 'fail': return 'text-red-400 bg-red-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4" />
      case 'fail': return <XCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getCheckTypeIcon = (checkType) => {
    switch (checkType) {
      case 'freshness': return <Clock className="w-4 h-4" />
      case 'null_rate': return <Database className="w-4 h-4" />
      case 'fk_integrity': return <Shield className="w-4 h-4" />
      case 'volume': return <BarChart3 className="w-4 h-4" />
      case 'uniqueness': return <CheckCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const filteredChecks = qualityData?.checks?.filter(check => {
    const matchesSearch = check.objectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.checkType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || check.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const handleViewDetails = (check) => {
    setSelectedCheck(check)
    setShowDetails(true)
  }

  const handleRunCheck = (check) => {
    console.log(`Running check: ${check.checkType} on ${check.objectName}`)
    // Implement check execution
  }

  const handleQuarantineRows = (check) => {
    console.log(`Quarantining bad rows for: ${check.objectName}`)
    // Implement quarantine logic
  }

  const getHealthColor = (health) => {
    if (health >= 95) return 'text-green-400'
    if (health >= 85) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Data Quality & Freshness</h2>
          <p className={`${getSubtextClass()}`}>
            Quality checks and SLA monitoring ({filteredChecks.length} checks)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchQualityData}
            disabled={loading}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quality Overview */}
      {qualityData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className={`text-2xl font-bold ${getHealthColor(qualityData.overallHealth)}`}>
                {qualityData.overallHealth}%
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Overall Health</p>
            <p className="text-white text-lg font-semibold">
              {qualityData.trends?.passingChecks || 0} Passing
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {qualityData.trends?.passingChecks || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Passing Checks</p>
            <p className="text-white text-lg font-semibold">
              {qualityData.trends?.warningChecks || 0} Warnings
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {qualityData.trends?.warningChecks || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Warning Checks</p>
            <p className="text-white text-lg font-semibold">
              {qualityData.trends?.failingChecks || 0} Failing
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <XCircle className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {qualityData.trends?.failingChecks || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Failing Checks</p>
            <p className="text-white text-lg font-semibold">
              Needs Attention
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
                placeholder="Search checks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pass">Passing</option>
            <option value="warning">Warning</option>
            <option value="fail">Failing</option>
          </select>
        </div>
      </div>

      {/* Quality Checks Table */}
      <div className={`${getCardClass()} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Object</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Check Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Value</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Threshold</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Run</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.map((check, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className={`font-medium ${getTextClass()}`}>{check.objectName}</div>
                        <div className={`text-sm ${getSubtextClass()}`}>Check ID: {index + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getCheckTypeIcon(check.checkType)}
                      <span className="text-white capitalize">{check.checkType.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(check.status)}`}>
                      {getStatusIcon(check.status)}
                      <span className="capitalize text-sm">{check.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${check.status === 'fail' ? 'text-red-400' : 'text-white'}`}>
                      {check.value}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-400">{check.threshold}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{new Date(check.lastRun).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(check)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRunCheck(check)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Re-run Check"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      {check.status === 'fail' && (
                        <button
                          onClick={() => handleQuarantineRows(check)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Quarantine Bad Rows"
                        >
                          <Shield className="w-4 h-4" />
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

      {/* Check Details Modal */}
      {showDetails && selectedCheck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-2xl mx-4 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>
                Check Details: {selectedCheck.objectName}
              </h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${getSubtextClass()}`}>Object Name</label>
                <p className={`${getTextClass()}`}>{selectedCheck.objectName}</p>
              </div>
              <div>
                <label className={`text-sm font-medium ${getSubtextClass()}`}>Check Type</label>
                <p className={`${getTextClass()} capitalize`}>{selectedCheck.checkType.replace('_', ' ')}</p>
              </div>
              <div>
                <label className={`text-sm font-medium ${getSubtextClass()}`}>Status</label>
                <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(selectedCheck.status)}`}>
                  {getStatusIcon(selectedCheck.status)}
                  <span className="capitalize text-sm">{selectedCheck.status}</span>
                </div>
              </div>
              <div>
                <label className={`text-sm font-medium ${getSubtextClass()}`}>Current Value</label>
                <p className={`${getTextClass()} ${selectedCheck.status === 'fail' ? 'text-red-400' : 'text-white'}`}>
                  {selectedCheck.value}
                </p>
              </div>
              <div>
                <label className={`text-sm font-medium ${getSubtextClass()}`}>Threshold</label>
                <p className={`${getTextClass()}`}>{selectedCheck.threshold}</p>
              </div>
              <div>
                <label className={`text-sm font-medium ${getSubtextClass()}`}>Last Run</label>
                <p className={`${getTextClass()}`}>{new Date(selectedCheck.lastRun).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleRunCheck(selectedCheck)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Re-run Check</span>
                </button>
                {selectedCheck.status === 'fail' && (
                  <button
                    onClick={() => handleQuarantineRows(selectedCheck)}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Quarantine Rows</span>
                  </button>
                )}
                <button
                  onClick={() => console.log('Create incident for:', selectedCheck.objectName)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Create Incident</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataQuality

