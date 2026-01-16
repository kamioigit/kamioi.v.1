import React, { useState, useEffect } from 'react'
import { Play, Filter, Search, RefreshCw, Eye, AlertTriangle, CheckCircle, XCircle, Clock, Database, Activity, BarChart3, TrendingUp, Pause, Settings, X, Target, Timer, Cpu, HardDrive, Zap, Layers, Box, Package, Archive, FileText, Hash, Grid, Network, Globe, Wifi, Signal, Battery, Gauge, Thermometer, Wind, ArrowRight, ArrowDown, ArrowUp, RotateCcw, Upload, Download as DownloadIcon, Cloud, CloudOff, CloudRain, CloudSnow, CloudLightning, TestTube, TestTube2, Beaker, Microscope, Code, Terminal, Monitor, Laptop, Download } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const TestSandbox = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [testQueries, setTestQueries] = useState([])
  const [sandboxEnvs, setSandboxEnvs] = useState([])
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [showQueryModal, setShowQueryModal] = useState(false)
  const [showEnvModal, setShowEnvModal] = useState(false)
  const [selectedEnv, setSelectedEnv] = useState(null)

  useEffect(() => {
    fetchTestData()
    fetchSandboxData()
  }, [])

  const fetchTestData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/test-sandbox`)
      if (response.ok) {
        const data = await response.json()
        setTestQueries(data.testQueries || [])
      }
    } catch (error) {
      console.error('Error fetching test data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSandboxData = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/test-sandbox`)
      if (response.ok) {
        const data = await response.json()
        setSandboxEnvs(data.sandboxEnvs || [])
      }
    } catch (error) {
      console.error('Error fetching sandbox data:', error)
    }
  }

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-green-400'
      case 'failed': return 'text-red-400'
      case 'running': return 'text-blue-400'
      case 'pending': return 'text-yellow-400'
      case 'skipped': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'running': return <Play className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'skipped': return <Pause className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getEnvTypeColor = (type) => {
    switch (type) {
      case 'development': return 'text-green-400'
      case 'staging': return 'text-yellow-400'
      case 'testing': return 'text-blue-400'
      case 'production': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getEnvTypeIcon = (type) => {
    switch (type) {
      case 'development': return <Code className="w-4 h-4" />
      case 'staging': return <Monitor className="w-4 h-4" />
      case 'testing': return <TestTube className="w-4 h-4" />
      case 'production': return <Database className="w-4 h-4" />
      default: return <Laptop className="w-4 h-4" />
    }
  }

  const handleViewQuery = (query) => {
    setSelectedQuery(query)
    setShowQueryModal(true)
  }

  const handleViewEnv = (env) => {
    setSelectedEnv(env)
    setShowEnvModal(true)
  }

  const handleRunQuery = (query) => {
    console.log(`Running query: ${query.name}`)
    // Implement query run logic
  }

  const handleStopQuery = (query) => {
    console.log(`Stopping query: ${query.name}`)
    // Implement query stop logic
  }

  const handleCreateEnv = (env) => {
    console.log(`Creating environment: ${env.name}`)
    // Implement environment creation logic
  }

  const handleDestroyEnv = (env) => {
    console.log(`Destroying environment: ${env.name}`)
    // Implement environment destruction logic
  }

  const filteredQueries = testQueries.filter(query => {
    const matchesSearch = query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        query.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter
    const matchesType = typeFilter === 'all' || query.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredEnvs = sandboxEnvs.filter(env => {
    const matchesSearch = env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        env.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Test & Sandbox</h2>
          <p className={getSubtextClass()}>Canary queries and testing environment management</p>
        </div>
        <button
          onClick={fetchTestData}
          disabled={loading}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Total Queries</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{testQueries.length}</p>
            </div>
            <TestTube className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Passed</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {testQueries.filter(q => q.status === 'passed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Failed</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {testQueries.filter(q => q.status === 'failed').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Environments</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{sandboxEnvs.length}</p>
            </div>
            <Laptop className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search queries and environments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Status</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
          <option value="pending">Pending</option>
          <option value="skipped">Skipped</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Types</option>
          <option value="unit">Unit</option>
          <option value="integration">Integration</option>
          <option value="performance">Performance</option>
          <option value="security">Security</option>
        </select>
      </div>

      {/* Test Queries Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Test Queries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Query</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Duration</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Run</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((query, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{query.name}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{query.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(query.status)}`}>
                      {getStatusIcon(query.status)}
                      <span className="capitalize">{query.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSubtextClass()} bg-white/10`}>
                      {query.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{query.duration}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{query.lastRun}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewQuery(query)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {query.status === 'running' ? (
                        <button
                          onClick={() => handleStopQuery(query)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Stop Query"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRunQuery(query)}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Run Query"
                        >
                          <Play className="w-4 h-4" />
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

      {/* Sandbox Environments Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Sandbox Environments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Environment</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Created</th>
                <th className="text-left p-4 text-gray-400 font-medium">Expires</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnvs.map((env, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{env.name}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{env.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getEnvTypeColor(env.type)}`}>
                      {getEnvTypeIcon(env.type)}
                      <span className="capitalize">{env.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(env.status)}`}>
                      {getStatusIcon(env.status)}
                      <span className="capitalize">{env.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{env.created}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{env.expires}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewEnv(env)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCreateEnv(env)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Create Environment"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDestroyEnv(env)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Destroy Environment"
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

      {/* Query Details Modal */}
      {showQueryModal && selectedQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Query Details</h3>
              <button
                onClick={() => setShowQueryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedQuery.name}</h4>
                <p className={getSubtextClass()}>{selectedQuery.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedQuery.status)}`}>
                    {getStatusIcon(selectedQuery.status)}
                    <span className="capitalize">{selectedQuery.status}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <p className={getTextClass()}>{selectedQuery.type}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Duration</p>
                  <p className={getTextClass()}>{selectedQuery.duration}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Last Run</p>
                  <p className={getTextClass()}>{selectedQuery.lastRun}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRunQuery(selectedQuery)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Query</span>
                </button>
                <button
                  onClick={() => handleStopQuery(selectedQuery)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
                >
                  <Pause className="w-4 h-4" />
                  <span>Stop Query</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environment Details Modal */}
      {showEnvModal && selectedEnv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Environment Details</h3>
              <button
                onClick={() => setShowEnvModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedEnv.name}</h4>
                <p className={getSubtextClass()}>{selectedEnv.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <div className={`flex items-center space-x-2 ${getEnvTypeColor(selectedEnv.type)}`}>
                    {getEnvTypeIcon(selectedEnv.type)}
                    <span className="capitalize">{selectedEnv.type}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedEnv.status)}`}>
                    {getStatusIcon(selectedEnv.status)}
                    <span className="capitalize">{selectedEnv.status}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Created</p>
                  <p className={getTextClass()}>{selectedEnv.created}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Expires</p>
                  <p className={getTextClass()}>{selectedEnv.expires}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCreateEnv(selectedEnv)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Create</span>
                </button>
                <button
                  onClick={() => handleDestroyEnv(selectedEnv)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Destroy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestSandbox
