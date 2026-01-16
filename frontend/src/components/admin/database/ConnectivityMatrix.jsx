import React, { useState, useEffect } from 'react'
import { 
  Network, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Link,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const ConnectivityMatrix = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [connectivityData, setConnectivityData] = useState([])
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  useEffect(() => {
    fetchConnectivityData()
  }, [])

  const fetchConnectivityData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/connectivity-matrix`)
      if (response.ok) {
        const data = await response.json()
        setConnectivityData(data.data?.connections || [])
      }
    } catch (error) {
      console.error('Failed to fetch connectivity data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-400 bg-green-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      case 'error': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getLatencyColor = (latency) => {
    if (latency < 50) return 'text-green-400'
    if (latency < 100) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getErrorRateColor = (rate) => {
    if (rate < 0.01) return 'text-green-400'
    if (rate < 0.05) return 'text-yellow-400'
    return 'text-red-400'
  }

  const filteredData = (connectivityData && Array.isArray(connectivityData) ? connectivityData : []).filter(item => {
    const matchesSearch = item.uiComponent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.viewName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.apiEndpoint?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (connection) => {
    setSelectedConnection(connection)
    setShowDetails(true)
  }

  const handleTestConnection = (connection) => {
    console.log(`Testing connection: ${connection.uiComponent}`)
    // Implement connection test
  }

  const handleViewDDL = (connection) => {
    console.log(`Viewing DDL for: ${connection.viewName}`)
    // Implement DDL viewer
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Connectivity Matrix</h2>
          <p className={`${getSubtextClass()}`}>
            Dashboard dependencies and data lineage ({filteredData.length} connections)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchConnectivityData}
            disabled={loading}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${getCardClass()} rounded-xl p-4 border`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search connections..."
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
            <option value="connected">Connected</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Connectivity Table */}
      <div className={`${getCardClass()} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">UI Component</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">View</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tables Used</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">API Endpoint</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Latency</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Error Rate</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Rows (24h)</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <Network className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className={`font-medium ${getTextClass()}`}>{item.uiComponent}</div>
                        <div className={`text-sm ${getSubtextClass()}`}>Last query: {item.lastSuccessfulQuery ? new Date(item.lastSuccessfulQuery).toLocaleTimeString() : 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-mono text-sm">{item.viewName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(item.tablesUsed && Array.isArray(item.tablesUsed) ? item.tablesUsed : []).map((table, idx) => (
                        <span key={idx} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                          {table}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Link className="w-4 h-4 text-green-400" />
                      <span className="text-white font-mono text-sm">{item.apiEndpoint}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize text-sm">{item.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${getLatencyColor(item.avgLatency)}`}>
                      {item.avgLatency}ms
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${getErrorRateColor(item.errorRate)}`}>
                      {item.errorRate ? (item.errorRate * 100).toFixed(2) : '0.00'}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {item.rowCount24h ? item.rowCount24h.toLocaleString() : '0'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTestConnection(item)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Test Connection"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewDDL(item)}
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="View DDL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connection Details Modal */}
      {showDetails && selectedConnection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl mx-4 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>
                Connection Details: {selectedConnection.uiComponent}
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
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>UI Component</label>
                  <p className={`${getTextClass()}`}>{selectedConnection.uiComponent}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>View Name</label>
                  <p className={`${getTextClass()} font-mono`}>{selectedConnection.viewName}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>API Endpoint</label>
                  <p className={`${getTextClass()} font-mono`}>{selectedConnection.apiEndpoint}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Status</label>
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(selectedConnection.status)}`}>
                    {getStatusIcon(selectedConnection.status)}
                    <span className="capitalize text-sm">{selectedConnection.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Tables Used</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedConnection.tablesUsed.map((table, idx) => (
                      <span key={idx} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                        {table}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Average Latency</label>
                  <p className={`${getTextClass()} ${getLatencyColor(selectedConnection.avgLatency)}`}>
                    {selectedConnection.avgLatency}ms
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Error Rate</label>
                  <p className={`${getTextClass()} ${getErrorRateColor(selectedConnection.errorRate)}`}>
                    {selectedConnection.errorRate ? (selectedConnection.errorRate * 100).toFixed(2) : '0.00'}%
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Rows (24h)</label>
                  <p className={`${getTextClass()}`}>{selectedConnection.rowCount24h ? selectedConnection.rowCount24h.toLocaleString() : '0'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleTestConnection(selectedConnection)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Test Connection</span>
                </button>
                <button
                  onClick={() => handleViewDDL(selectedConnection)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View DDL</span>
                </button>
                <button
                  onClick={() => console.log('Create incident for:', selectedConnection.uiComponent)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
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

export default ConnectivityMatrix

