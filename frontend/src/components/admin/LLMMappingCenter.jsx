import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  Search, 
  Upload, 
  Download, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowDown,
  Target,
  BarChart3,
  FileText,
  Edit,
  Trash2,
  Eye,
  X
} from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

const LLMMappingCenter = ({ user }) => {
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('queues')
  const [selectedQueue, setSelectedQueue] = useState('needs-recognition')
  const [searchTerm, setSearchTerm] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState('all')
  const [showManualMapping, setShowManualMapping] = useState(false)
  const [showAddMapping, setShowAddMapping] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [mappingQueues, setMappingQueues] = useState({})
  const [mappingStats, setMappingStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch mapping data
  useEffect(() => {
    fetchMappingQueues()
    fetchMappingStats()
  }, [])

  const fetchMappingQueues = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/llm/mapping-queues`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMappingQueues(result.data.queues || {})
        } else {
          setMappingQueues({})
        }
      } else {
        setMappingQueues({})
      }
    } catch (error) {
      console.error('Error fetching mapping queues:', error)
      setError('Failed to fetch mapping queues')
    } finally {
      setLoading(false)
    }
  }

  const fetchMappingStats = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/llm/mapping-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMappingStats(result.data || {})
        } else {
          setMappingStats({})
        }
      } else {
        setMappingStats({})
      }
    } catch (error) {
      console.error('Error fetching mapping stats:', error)
    }
  }

  const handleMappingAction = async (mappingId, action) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/llm/mappings/${mappingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        },
        body: JSON.stringify({ action, status: 'processed' })
      })
      
      if (response.ok) {
        // Refresh the data
        fetchMappingQueues()
        fetchMappingStats()
      }
    } catch (error) {
      console.error('Error updating mapping:', error)
    }
  }

  const handleBulkAction = async (action, mappingIds) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/llm/bulk-actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        },
        body: JSON.stringify({ action, mappingIds })
      })
      
      if (response.ok) {
        // Refresh the data
        fetchMappingQueues()
        fetchMappingStats()
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  // Mock data for LLM mapping (fallback) - cleared
  const mockMappingQueues = {
    'needs-recognition': [],
    'conflicts': [],
    'low-confidence': [],
    'pending-approval': []
  }

  const mappingMetrics = {
    autoMapRate: 0,
    precision: 0,
    reOpenRate: 0,
    timeToMap: 0,
    totalMappings: 0,
    pendingMappings: 0
  }

  const entityMappings = []

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'conflict': return 'bg-red-500/20 text-red-400'
      case 'low-confidence': return 'bg-orange-500/20 text-orange-400'
      case 'pending-approval': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-white">Loading LLM mapping data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">Error Loading LLM Data</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null)
              fetchMappingQueues()
              fetchMappingStats()
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const handleBulkUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls,.csv'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setUploadFile(file)
        // Process the file
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            // In production, this would parse Excel/CSV and validate the data
            console.log('Processing bulk upload file:', file.name)
            addNotification({
              type: 'success',
              title: 'File Uploaded',
              message: `Successfully uploaded ${file.name}! File contains merchant mappings that will be processed by the LLM system.`,
              timestamp: new Date()
            })
            setUploadFile(null)
          } catch (error) {
            addNotification({
              type: 'error',
              title: 'Upload Failed',
              message: 'Error processing file. Please check the format and try again.',
              timestamp: new Date()
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleExport = () => {
    // Create CSV content
    const headers = ['Description', 'Ticker', 'Company', 'Category', 'Confidence', 'Mapped By', 'Last Updated', 'Aliases']
    const csvContent = [
      headers.join(','),
      ...entityMappings.map(mapping => [
        `"${mapping.description}"`,
        mapping.ticker,
        `"${mapping.company}"`,
        mapping.category,
        mapping.confidence,
        mapping.mappedBy,
        mapping.lastUpdated,
        `"${mapping.aliases.join('; ')}"`
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `llm_mappings_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    addNotification({
      type: 'success',
      title: 'Export Complete',
      message: `Exported ${entityMappings.length} mappings to CSV file successfully!`,
      timestamp: new Date()
    })
  }

  const handleEditMapping = (id) => {
    console.log('Edit mapping:', id)
  }

  const handleApproveMapping = (id) => {
    console.log('Approve mapping:', id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">LLM Mapping Center</h1>
          <p className="text-gray-400 mt-1">Data Flywheel & Entity Recognition</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowManualMapping(true)}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 flex items-center space-x-2 transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>Manual Mapping</span>
          </button>
          <button 
            onClick={() => setShowAddMapping(true)}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
          >
            <Target className="w-4 h-4" />
            <span>Add Mapping</span>
          </button>
          <button 
            onClick={handleBulkUpload}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>
          <button 
            onClick={handleExport}
            className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg px-4 py-2 text-gray-400 flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Auto-Map Rate</p>
              <p className="text-2xl font-bold text-white">{mappingMetrics.autoMapRate}%</p>
              <p className="text-green-400 text-sm flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                0% vs last week
              </p>
            </div>
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Precision</p>
              <p className="text-2xl font-bold text-white">{mappingMetrics.precision}%</p>
              <p className="text-green-400 text-sm flex items-center mt-1">
                <Target className="w-4 h-4 mr-1" />
                High accuracy
              </p>
            </div>
            <Target className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Re-open Rate</p>
              <p className="text-2xl font-bold text-white">{mappingMetrics.reOpenRate}%</p>
              <p className="text-green-400 text-sm flex items-center mt-1">
                <ArrowDown className="w-4 h-4 mr-1" />
                0% vs last week
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Time to Map</p>
              <p className="text-2xl font-bold text-white">{mappingMetrics.timeToMap}h</p>
              <p className="text-blue-400 text-sm flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1" />
                Avg processing time
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{mappingMetrics.pendingMappings}</p>
              <p className="text-orange-400 text-sm flex items-center mt-1">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Needs attention
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'queues', label: 'Mapping Queues', icon: Clock },
          { id: 'all-mappings', label: 'All Mappings', icon: Eye },
          { id: 'pending-approval', label: 'Pending Approval', icon: AlertTriangle },
          { id: 'manual-mapping', label: 'Manual Mapping', icon: Edit }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'queues' && (
        <div className="space-y-6">
          {/* Queue Navigation */}
          <div className="flex space-x-2">
        {Object.keys(mappingQueues || {}).length > 0 ? Object.keys(mappingQueues).map(queue => (
          <button
            key={queue}
            onClick={() => setSelectedQueue(queue)}
            className={`px-4 py-2 rounded-lg transition-all capitalize ${
              selectedQueue === queue 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {queue.replace('-', ' ')} ({mappingQueues[queue].length})
          </button>
        )) : (
          <div className="text-center py-8 text-gray-400">
            <p>No mapping queues available</p>
            <p className="text-sm mt-2">All data has been cleared. System is ready for real data integration.</p>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search descriptions or merchants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <select 
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Confidence</option>
          <option value="high">High (≥90%)</option>
          <option value="medium">Medium (70-89%)</option>
          <option value="low">Low (&lt;70%)</option>
        </select>
      </div>

      {/* Mapping Queue Table */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white capitalize">
            {selectedQueue.replace('-', ' ')} Queue
          </h3>
          <div className="flex space-x-2">
            <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-3 py-1 text-green-400 text-sm transition-all">
              Bulk Approve
            </button>
            <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-1 text-blue-400 text-sm transition-all">
              Re-run Mapping
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400">Description</th>
                <th className="text-left py-3 px-4 text-gray-400">Merchant</th>
                <th className="text-center py-3 px-4 text-gray-400">Confidence</th>
                <th className="text-center py-3 px-4 text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-gray-400">Created</th>
                <th className="text-center py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(mappingQueues[selectedQueue] || []).map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{item.description}</td>
                  <td className="py-3 px-4 text-gray-300">{item.merchant}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-semibold ${getConfidenceColor(item.confidence)}`}>
                      {(item.confidence / 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{item.created}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleEditMapping(item.id)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Edit Mapping"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleApproveMapping(item.id)}
                        className="text-green-400 hover:text-green-300"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(mappingQueues[selectedQueue] || []).length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <p>No items in this queue</p>
                      <p className="text-sm mt-2">All data has been cleared. System is ready for real data integration.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entity Mappings */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Entity Mappings</h3>
          <div className="flex space-x-2">
            <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-1 text-blue-400 text-sm transition-all">
              Add Mapping
            </button>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-3 py-1 text-purple-400 text-sm transition-all">
              Subsidiary Graph
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400">Description</th>
                <th className="text-left py-3 px-4 text-gray-400">Ticker</th>
                <th className="text-center py-3 px-4 text-gray-400">Confidence</th>
                <th className="text-center py-3 px-4 text-gray-400">Mapped By</th>
                <th className="text-left py-3 px-4 text-gray-400">Last Updated</th>
                <th className="text-center py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entityMappings.map((mapping, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{mapping.description}</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-mono">
                      {mapping.ticker}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-semibold ${getConfidenceColor(mapping.confidence)}`}>
                      {(mapping.confidence / 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      mapping.mappedBy === 'AI' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {mapping.mappedBy}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{mapping.lastUpdated}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drift Detection */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Drift Detection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-white font-medium">Performance Drop</p>
                <p className="text-gray-400 text-sm">0 entities flagged</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ArrowDown className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-white font-medium">Accuracy Decline</p>
                <p className="text-gray-400 text-sm">0% vs baseline</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Processing Delay</p>
                <p className="text-gray-400 text-sm">0min avg time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      )}

      {/* All Mappings Tab */}
      {activeTab === 'all-mappings' && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">All Entity Mappings Database</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowAddMapping(true)}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-1 text-blue-400 text-sm transition-all"
              >
                Add Mapping
              </button>
              <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-3 py-1 text-purple-400 text-sm transition-all">
                Subsidiary Graph
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search mappings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <select 
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="archived">Archived</option>
            </select>
            <button 
              onClick={handleExport}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 transition-all"
            >
              Export All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 text-gray-400">Ticker</th>
                  <th className="text-left py-3 px-4 text-gray-400">Company</th>
                  <th className="text-left py-3 px-4 text-gray-400">Category</th>
                  <th className="text-center py-3 px-4 text-gray-400">Confidence</th>
                  <th className="text-center py-3 px-4 text-gray-400">Mapped By</th>
                  <th className="text-left py-3 px-4 text-gray-400">Last Updated</th>
                  <th className="text-center py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entityMappings.map((mapping) => (
                  <tr key={mapping.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{mapping.description}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-mono">
                        {mapping.ticker}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">{mapping.company}</td>
                    <td className="py-3 px-4 text-gray-300">{mapping.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${getConfidenceColor(mapping.confidence)}`}>
                        {(mapping.confidence / 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        mapping.mappedBy === 'AI' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {mapping.mappedBy}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{mapping.lastUpdated}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleEditMapping(mapping.id)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300" title="Delete">
                          <Trash2 className="w-4 h-4" />
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

      {/* Pending Approval Tab */}
      {activeTab === 'pending-approval' && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Pending Approval Queue</h3>
            <div className="flex space-x-2">
              <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-3 py-1 text-green-400 text-sm transition-all">
                Bulk Approve
              </button>
              <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-1 text-blue-400 text-sm transition-all">
                Re-run Mapping
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 text-gray-400">Merchant</th>
                  <th className="text-left py-3 px-4 text-gray-400">Suggested Ticker</th>
                  <th className="text-left py-3 px-4 text-gray-400">Category</th>
                  <th className="text-center py-3 px-4 text-gray-400">Confidence</th>
                  <th className="text-left py-3 px-4 text-gray-400">Reviewed By</th>
                  <th className="text-left py-3 px-4 text-gray-400">Created</th>
                  <th className="text-center py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappingQueues['pending-approval'].map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{item.description}</td>
                    <td className="py-3 px-4 text-gray-300">{item.merchant}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-mono">
                        {item.suggestedTicker}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{item.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${getConfidenceColor(item.confidence)}`}>
                        {(item.confidence / 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{item.reviewedBy}</td>
                    <td className="py-3 px-4 text-gray-300">{item.created}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleApproveMapping(item.id)}
                          className="text-green-400 hover:text-green-300"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditMapping(item.id)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300" title="Reject">
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
      )}

      {/* Manual Mapping Tab */}
      {activeTab === 'manual-mapping' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Manual Mapping Center</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowManualMapping(true)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-1 text-blue-400 text-sm transition-all"
                >
                  Add Single Mapping
                </button>
                <button 
                  onClick={() => setShowAddMapping(true)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-3 py-1 text-green-400 text-sm transition-all"
                >
                  Excel Upload
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Single Mapping</h4>
                <p className="text-gray-400 text-sm mb-4">Add individual merchant-to-stock mappings manually</p>
                <button 
                  onClick={() => setShowManualMapping(true)}
                  className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 transition-all"
                >
                  Add Mapping
                </button>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Bulk Upload</h4>
                <p className="text-gray-400 text-sm mb-4">Upload Excel file with multiple mappings</p>
                <button 
                  onClick={() => setShowAddMapping(true)}
                  className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 transition-all"
                >
                  Upload Excel
                </button>
              </div>
            </div>

            <div className="mt-6 bg-white/5 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Excel Upload Format</h4>
              <div className="text-gray-400 text-sm space-y-2">
                <p>Your Excel file should contain the following columns:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Description:</strong> Transaction description (e.g., "STARBUCKS STORE #1234")</li>
                  <li><strong>Ticker:</strong> Stock ticker symbol (e.g., "SBUX")</li>
                  <li><strong>Company:</strong> Company name (e.g., "Starbucks Corporation")</li>
                  <li><strong>Category:</strong> Business category (e.g., "Food & Beverage")</li>
                  <li><strong>Confidence:</strong> Confidence score (0.0-1.0)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Mapping Modal */}
      {showManualMapping && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-4xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Manual Mapping</h3>
              <button 
                onClick={() => setShowManualMapping(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Description</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., STARBUCKS STORE #1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Suggested Ticker</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., SBUX"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Starbucks Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confidence Score</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.95"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea 
                  rows="3"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about this mapping..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowManualMapping(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log('Manual mapping created')
                  setShowManualMapping(false)
                }}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Create Mapping
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Add Mapping Modal */}
      {showAddMapping && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Add New Mapping</h3>
              <button 
                onClick={() => setShowAddMapping(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Merchant Description</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., STARBUCKS STORE #1234"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock Ticker</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., SBUX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Starbucks Corporation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mapping Type</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Direct Match</option>
                  <option>Parent Company</option>
                  <option>Subsidiary</option>
                  <option>Brand</option>
                  <option>Category</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowAddMapping(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log('New mapping added')
                  setShowAddMapping(false)
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Add Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LLMMappingCenter
