import React, { useState, useEffect } from 'react'
import { 
  Table, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Download, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Shield,
  TrendingUp,
  MoreVertical,
  ExternalLink,
  Copy,
  Play,
  Pause
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const SchemaCatalog = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [schemaData, setSchemaData] = useState([])
  const [selectedObject, setSelectedObject] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  useEffect(() => {
    fetchSchemaData()
  }, [])

  const fetchSchemaData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/schema`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSchemaData(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch schema data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      case 'critical': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getPIILevelColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-400'
      case 'Moderate': return 'text-yellow-400'
      case 'Low': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const filteredData = (schemaData || []).filter(item => {
    if (!item || !item.objectName || !item.owner) return false
    const matchesSearch = item.objectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewDetails = (object) => {
    setSelectedObject(object)
    setShowDetails(true)
  }

  const handleAction = (action, object) => {
    console.log(`Action: ${action} on object: ${object.objectName}`)
    // Implement specific actions
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Schema Catalog</h2>
          <p className={`${getSubtextClass()}`}>
            Live registry of tables, views, and indexes ({filteredData.length} objects)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchSchemaData}
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
                placeholder="Search objects..."
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
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="table">Tables</option>
            <option value="view">Views</option>
            <option value="materialized_view">Materialized Views</option>
            <option value="index">Indexes</option>
          </select>
        </div>
      </div>

      {/* Schema Table */}
      <div className={`${getCardClass()} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Object</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Rows</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Size</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Freshness</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Performance</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Security</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className={`font-medium ${getTextClass()}`}>{item.objectName}</div>
                        <div className={`text-sm ${getSubtextClass()}`}>{item.owner}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize text-sm">{item.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {item.rows.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {item.size}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{item.freshness}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{item.performance}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${getPIILevelColor(item.piiLevel)}`}>
                        {item.piiLevel}
                      </span>
                    </div>
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
                        onClick={() => handleAction('analyze', item)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Analyze"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('vacuum', item)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Vacuum"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('reindex', item)}
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="Reindex"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Object Details Modal */}
      {showDetails && selectedObject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl mx-4 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>
                Object Details: {selectedObject.objectName}
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
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Object Name</label>
                  <p className={`${getTextClass()}`}>{selectedObject.objectName}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Type</label>
                  <p className={`${getTextClass()}`}>{selectedObject.type}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Owner</label>
                  <p className={`${getTextClass()}`}>{selectedObject.owner}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Status</label>
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(selectedObject.status)}`}>
                    {getStatusIcon(selectedObject.status)}
                    <span className="capitalize text-sm">{selectedObject.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Rows</label>
                  <p className={`${getTextClass()}`}>{selectedObject.rows.toLocaleString()}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Size</label>
                  <p className={`${getTextClass()}`}>{selectedObject.size}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Growth</label>
                  <p className={`${getTextClass()}`}>{selectedObject.growth}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Freshness</label>
                  <p className={`${getTextClass()}`}>{selectedObject.freshness}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleAction('view_ddl', selectedObject)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View DDL</span>
                </button>
                <button
                  onClick={() => handleAction('sample_data', selectedObject)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Sample Data</span>
                </button>
                <button
                  onClick={() => handleAction('run_checks', selectedObject)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Checks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchemaCatalog

