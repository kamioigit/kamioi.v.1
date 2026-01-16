import React, { useState, useEffect } from 'react'
import { 
  Zap, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Activity,
  BarChart3,
  TrendingUp,
  Play,
  Pause,
  Settings,
  Download,
  X,
  Target,
  Timer,
  Cpu,
  HardDrive,
  GitBranch,
  GitCommit,
  GitMerge,
  Workflow,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  RotateCcw
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const PipelinesEvents = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [pipelines, setPipelines] = useState([])
  const [events, setEvents] = useState([])
  const [selectedPipeline, setSelectedPipeline] = useState(null)
  const [showPipelineModal, setShowPipelineModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    fetchPipelinesData()
    fetchEventsData()
  }, [])

  const fetchPipelinesData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/pipelines/events`)
      if (response.ok) {
        const data = await response.json()
        setPipelines(data.data?.pipelines || [])
      }
    } catch (error) {
      console.error('Error fetching pipelines data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEventsData = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/pipelines/events`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.data?.events || [])
      }
    } catch (error) {
      console.error('Error fetching events data:', error)
    }
  }

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400'
      case 'paused': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      case 'completed': return 'text-blue-400'
      case 'pending': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'error': return <XCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const handleViewPipeline = (pipeline) => {
    setSelectedPipeline(pipeline)
    setShowPipelineModal(true)
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleStartPipeline = (pipeline) => {
    console.log(`Starting pipeline: ${pipeline.name}`)
    // Implement pipeline start logic
  }

  const handleStopPipeline = (pipeline) => {
    console.log(`Stopping pipeline: ${pipeline.name}`)
    // Implement pipeline stop logic
  }

  const handleRestartPipeline = (pipeline) => {
    console.log(`Restarting pipeline: ${pipeline.name}`)
    // Implement pipeline restart logic
  }

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        pipeline.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || pipeline.status === statusFilter
    const matchesType = typeFilter === 'all' || pipeline.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.source.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Pipelines & Events</h2>
          <p className={getSubtextClass()}>Data pipeline monitoring and event tracking</p>
        </div>
        <button
          onClick={fetchPipelinesData}
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
              <p className={getSubtextClass()}>Total Pipelines</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{pipelines.length}</p>
            </div>
            <Workflow className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Running</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {pipelines.filter(p => p.status === 'running').length}
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
                {pipelines.filter(p => p.status === 'failed').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Events (24h)</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{events.length}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
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
              placeholder="Search pipelines and events..."
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
          <option value="paused">Paused</option>
          <option value="failed">Failed</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Types</option>
          <option value="etl">ETL</option>
          <option value="streaming">Streaming</option>
          <option value="batch">Batch</option>
          <option value="realtime">Real-time</option>
        </select>
      </div>

      {/* Pipelines Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Data Pipelines</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Pipeline</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Run</th>
                <th className="text-left p-4 text-gray-400 font-medium">Duration</th>
                <th className="text-left p-4 text-gray-400 font-medium">Events</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPipelines.map((pipeline, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{pipeline.name}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{pipeline.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(pipeline.status)}`}>
                      {getStatusIcon(pipeline.status)}
                      <span className="capitalize">{pipeline.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSubtextClass()} bg-white/10`}>
                      {pipeline.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{pipeline.lastRun}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{pipeline.duration}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{pipeline.eventsCount}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewPipeline(pipeline)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {pipeline.status === 'running' ? (
                        <button
                          onClick={() => handleStopPipeline(pipeline)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Stop Pipeline"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartPipeline(pipeline)}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Start Pipeline"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRestartPipeline(pipeline)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Restart Pipeline"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Recent Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Time</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Source</th>
                <th className="text-left p-4 text-gray-400 font-medium">Message</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{event.timestamp}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getEventTypeColor(event.type)}`}>
                      {getEventTypeIcon(event.type)}
                      <span className="capitalize">{event.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={getSubtextClass()}>{event.source}</span>
                  </td>
                  <td className="p-4">
                    <span className={getTextClass()}>{event.message}</span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipeline Details Modal */}
      {showPipelineModal && selectedPipeline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Pipeline Details</h3>
              <button
                onClick={() => setShowPipelineModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedPipeline.name}</h4>
                <p className={getSubtextClass()}>{selectedPipeline.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedPipeline.status)}`}>
                    {getStatusIcon(selectedPipeline.status)}
                    <span className="capitalize">{selectedPipeline.status}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <p className={getTextClass()}>{selectedPipeline.type}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Last Run</p>
                  <p className={getTextClass()}>{selectedPipeline.lastRun}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Duration</p>
                  <p className={getTextClass()}>{selectedPipeline.duration}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStartPipeline(selectedPipeline)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </button>
                <button
                  onClick={() => handleStopPipeline(selectedPipeline)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
                >
                  <Pause className="w-4 h-4" />
                  <span>Stop</span>
                </button>
                <button
                  onClick={() => handleRestartPipeline(selectedPipeline)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Event Details</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedEvent.message}</h4>
                <p className={getSubtextClass()}>Source: {selectedEvent.source}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <div className={`flex items-center space-x-2 ${getEventTypeColor(selectedEvent.type)}`}>
                    {getEventTypeIcon(selectedEvent.type)}
                    <span className="capitalize">{selectedEvent.type}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Timestamp</p>
                  <p className={getTextClass()}>{selectedEvent.timestamp}</p>
                </div>
              </div>
              {selectedEvent.details && (
                <div>
                  <p className={getSubtextClass()}>Details</p>
                  <p className={getTextClass()}>{selectedEvent.details}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PipelinesEvents
