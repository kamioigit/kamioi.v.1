import React, { useState, useEffect } from 'react'
import { Server, Search, Filter, RefreshCw, Eye, AlertTriangle, CheckCircle, XCircle, Clock, Database, Activity, BarChart3, TrendingUp, Play, Pause, Settings, X, Target, Timer, Cpu, HardDrive, Zap, Layers, Box, Package, Archive, FileText, Hash, Grid, Network, Globe, Wifi, Signal, Battery, Gauge, Thermometer, Wind, ArrowRight, ArrowDown, ArrowUp, RotateCcw, Upload, Download as DownloadIcon, Cloud, CloudOff, CloudRain, CloudSnow, CloudLightning, Download } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const WarehouseSync = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [syncJobs, setSyncJobs] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const [showWarehouseModal, setShowWarehouseModal] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)

  useEffect(() => {
    fetchSyncJobsData()
    fetchWarehousesData()
  }, [])

  const fetchSyncJobsData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/warehouse-sync`)
      if (response.ok) {
        const data = await response.json()
        setSyncJobs(data.syncJobs || [])
      }
    } catch (error) {
      console.error('Error fetching sync jobs data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWarehousesData = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/warehouse-sync`)
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data.warehouses || [])
      }
    } catch (error) {
      console.error('Error fetching warehouses data:', error)
    }
  }

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400'
      case 'completed': return 'text-blue-400'
      case 'failed': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      case 'paused': return 'text-gray-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getWarehouseTypeColor = (type) => {
    switch (type) {
      case 'snowflake': return 'text-blue-400'
      case 'bigquery': return 'text-green-400'
      case 'redshift': return 'text-red-400'
      case 'databricks': return 'text-purple-400'
      case 'postgres': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getWarehouseTypeIcon = (type) => {
    switch (type) {
      case 'snowflake': return <CloudSnow className="w-4 h-4" />
      case 'bigquery': return <Cloud className="w-4 h-4" />
      case 'redshift': return <CloudLightning className="w-4 h-4" />
      case 'databricks': return <CloudRain className="w-4 h-4" />
      case 'postgres': return <Database className="w-4 h-4" />
      default: return <Server className="w-4 h-4" />
    }
  }

  const handleViewJob = (job) => {
    setSelectedJob(job)
    setShowJobModal(true)
  }

  const handleViewWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse)
    setShowWarehouseModal(true)
  }

  const handleStartJob = (job) => {
    console.log(`Starting job: ${job.name}`)
    // Implement job start logic
  }

  const handleStopJob = (job) => {
    console.log(`Stopping job: ${job.name}`)
    // Implement job stop logic
  }

  const handleRetryJob = (job) => {
    console.log(`Retrying job: ${job.name}`)
    // Implement job retry logic
  }

  const handleTestConnection = (warehouse) => {
    console.log(`Testing connection to: ${warehouse.name}`)
    // Implement connection test logic
  }

  const handleSyncWarehouse = (warehouse) => {
    console.log(`Syncing warehouse: ${warehouse.name}`)
    // Implement warehouse sync logic
  }

  const filteredJobs = syncJobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesType = typeFilter === 'all' || job.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        warehouse.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Warehouse Sync</h2>
          <p className={getSubtextClass()}>ETL job status and data warehouse synchronization</p>
        </div>
        <button
          onClick={fetchSyncJobsData}
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
              <p className={getSubtextClass()}>Total Jobs</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{syncJobs.length}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Running</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {syncJobs.filter(j => j.status === 'running').length}
              </p>
            </div>
            <Play className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Failed</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {syncJobs.filter(j => j.status === 'failed').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Warehouses</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{warehouses.length}</p>
            </div>
            <Server className="w-8 h-8 text-purple-400" />
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
              placeholder="Search jobs and warehouses..."
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
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Types</option>
          <option value="etl">ETL</option>
          <option value="sync">Sync</option>
          <option value="migration">Migration</option>
          <option value="backup">Backup</option>
        </select>
      </div>

      {/* Sync Jobs Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Sync Jobs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Job</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Warehouse</th>
                <th className="text-left p-4 text-gray-400 font-medium">Progress</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Run</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{job.name}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{job.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="capitalize">{job.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSubtextClass()} bg-white/10`}>
                      {job.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getWarehouseTypeIcon(job.warehouseType)}
                      <span className={getSubtextClass()}>{job.warehouse}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{job.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{job.lastRun}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewJob(job)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {job.status === 'running' ? (
                        <button
                          onClick={() => handleStopJob(job)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Stop Job"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartJob(job)}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Start Job"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {job.status === 'failed' && (
                        <button
                          onClick={() => handleRetryJob(job)}
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                          title="Retry Job"
                        >
                          <RotateCcw className="w-4 h-4" />
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

      {/* Warehouses Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Data Warehouses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Warehouse</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Sync</th>
                <th className="text-left p-4 text-gray-400 font-medium">Records</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.map((warehouse, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{warehouse.name}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{warehouse.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getWarehouseTypeColor(warehouse.type)}`}>
                      {getWarehouseTypeIcon(warehouse.type)}
                      <span className="capitalize">{warehouse.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(warehouse.status)}`}>
                      {getStatusIcon(warehouse.status)}
                      <span className="capitalize">{warehouse.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{warehouse.lastSync}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{warehouse.recordCount}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewWarehouse(warehouse)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTestConnection(warehouse)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Test Connection"
                      >
                        <Wifi className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSyncWarehouse(warehouse)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Sync Warehouse"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Job Details</h3>
              <button
                onClick={() => setShowJobModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedJob.name}</h4>
                <p className={getSubtextClass()}>{selectedJob.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedJob.status)}`}>
                    {getStatusIcon(selectedJob.status)}
                    <span className="capitalize">{selectedJob.status}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <p className={getTextClass()}>{selectedJob.type}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Warehouse</p>
                  <p className={getTextClass()}>{selectedJob.warehouse}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Progress</p>
                  <p className={getTextClass()}>{selectedJob.progress}%</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStartJob(selectedJob)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </button>
                <button
                  onClick={() => handleStopJob(selectedJob)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
                >
                  <Pause className="w-4 h-4" />
                  <span>Stop</span>
                </button>
                <button
                  onClick={() => handleRetryJob(selectedJob)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Details Modal */}
      {showWarehouseModal && selectedWarehouse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Warehouse Details</h3>
              <button
                onClick={() => setShowWarehouseModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedWarehouse.name}</h4>
                <p className={getSubtextClass()}>{selectedWarehouse.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <div className={`flex items-center space-x-2 ${getWarehouseTypeColor(selectedWarehouse.type)}`}>
                    {getWarehouseTypeIcon(selectedWarehouse.type)}
                    <span className="capitalize">{selectedWarehouse.type}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedWarehouse.status)}`}>
                    {getStatusIcon(selectedWarehouse.status)}
                    <span className="capitalize">{selectedWarehouse.status}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Last Sync</p>
                  <p className={getTextClass()}>{selectedWarehouse.lastSync}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Records</p>
                  <p className={getTextClass()}>{selectedWarehouse.recordCount}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestConnection(selectedWarehouse)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Wifi className="w-4 h-4" />
                  <span>Test Connection</span>
                </button>
                <button
                  onClick={() => handleSyncWarehouse(selectedWarehouse)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WarehouseSync
