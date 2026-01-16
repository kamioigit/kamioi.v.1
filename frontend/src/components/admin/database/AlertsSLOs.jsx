import React, { useState, useEffect } from 'react'
import { AlertTriangle, Search, RefreshCw, Eye, CheckCircle, XCircle, Clock, Database, Activity, BarChart3, TrendingUp, Play, Pause, Settings, X, Target, Timer, Cpu, HardDrive, Zap, Layers, Box, Package, Archive, FileText, Hash, Grid, Network, Globe, Wifi, Signal, Battery, Gauge, Thermometer, Wind, ArrowRight, ArrowDown, ArrowUp, RotateCcw, Upload, Download as DownloadIcon, Cloud, CloudOff, CloudRain, CloudSnow, CloudLightning, TestTube, TestTube2, Beaker, Microscope, Code, Terminal, Monitor, Laptop, Bell, BellRing, BellOff, Volume2, VolumeX, Megaphone, Radio, Tv, Smartphone, Mail, MessageSquare, Phone, Video, Camera, Mic, MicOff, Headphones, Speaker, Volume1, Download } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const AlertsSLOs = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [alerts, setAlerts] = useState([])
  const [slos, setSlos] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showSloModal, setShowSloModal] = useState(false)
  const [selectedSlo, setSelectedSlo] = useState(null)

  useEffect(() => {
    fetchAlertsData()
    fetchSlosData()
  }, [])

  const fetchAlertsData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/alerts-slos`)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Error fetching alerts data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSlosData = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/alerts-slos`)
      if (response.ok) {
        const data = await response.json()
        setSlos(data.slos || [])
      }
    } catch (error) {
      console.error('Error fetching SLOs data:', error)
    }
  }

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-400'
      case 'resolved': return 'text-green-400'
      case 'acknowledged': return 'text-yellow-400'
      case 'suppressed': return 'text-gray-400'
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <BellRing className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      case 'acknowledged': return <Bell className="w-4 h-4" />
      case 'suppressed': return <BellOff className="w-4 h-4" />
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-blue-400'
      case 'info': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Bell className="w-4 h-4" />
      case 'low': return <BellOff className="w-4 h-4" />
      case 'info': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert)
    setShowAlertModal(true)
  }

  const handleViewSlo = (slo) => {
    setSelectedSlo(slo)
    setShowSloModal(true)
  }

  const handleAcknowledgeAlert = (alert) => {
    console.log(`Acknowledging alert: ${alert.id}`)
    // Implement alert acknowledgment logic
  }

  const handleResolveAlert = (alert) => {
    console.log(`Resolving alert: ${alert.id}`)
    // Implement alert resolution logic
  }

  const handleSuppressAlert = (alert) => {
    console.log(`Suppressing alert: ${alert.id}`)
    // Implement alert suppression logic
  }

  const handleUpdateSlo = (slo) => {
    console.log(`Updating SLO: ${slo.name}`)
    // Implement SLO update logic
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter
    const matchesType = typeFilter === 'all' || alert.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredSlos = slos.filter(slo => {
    const matchesSearch = slo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        slo.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Alerts & SLOs</h2>
          <p className={getSubtextClass()}>Thresholds and incident management</p>
        </div>
        <button
          onClick={fetchAlertsData}
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
              <p className={getSubtextClass()}>Active Alerts</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {alerts.filter(a => a.status === 'active').length}
              </p>
            </div>
            <BellRing className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Resolved</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {alerts.filter(a => a.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>SLOs</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{slos.length}</p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Healthy SLOs</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {slos.filter(s => s.status === 'healthy').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
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
              placeholder="Search alerts and SLOs..."
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
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="suppressed">Suppressed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Types</option>
          <option value="performance">Performance</option>
          <option value="availability">Availability</option>
          <option value="error">Error</option>
          <option value="security">Security</option>
        </select>
      </div>

      {/* Alerts Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Active Alerts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Alert</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Severity</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Created</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{alert.title}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{alert.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(alert.status)}`}>
                      {getStatusIcon(alert.status)}
                      <span className="capitalize">{alert.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                      <span className="capitalize">{alert.severity}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSubtextClass()} bg-white/10`}>
                      {alert.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{alert.created}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewAlert(alert)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAcknowledgeAlert(alert)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Acknowledge"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResolveAlert(alert)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Resolve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLOs Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Service Level Objectives</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">SLO</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Target</th>
                <th className="text-left p-4 text-gray-400 font-medium">Current</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Updated</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlos.map((slo, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{slo.name}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{slo.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(slo.status)}`}>
                      {getStatusIcon(slo.status)}
                      <span className="capitalize">{slo.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{slo.target}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{slo.current}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{slo.lastUpdated}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewSlo(slo)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateSlo(slo)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Update SLO"
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

      {/* Alert Details Modal */}
      {showAlertModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Alert Details</h3>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedAlert.title}</h4>
                <p className={getSubtextClass()}>{selectedAlert.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedAlert.status)}`}>
                    {getStatusIcon(selectedAlert.status)}
                    <span className="capitalize">{selectedAlert.status}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Severity</p>
                  <div className={`flex items-center space-x-2 ${getSeverityColor(selectedAlert.severity)}`}>
                    {getSeverityIcon(selectedAlert.severity)}
                    <span className="capitalize">{selectedAlert.severity}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <p className={getTextClass()}>{selectedAlert.type}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Created</p>
                  <p className={getTextClass()}>{selectedAlert.created}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAcknowledgeAlert(selectedAlert)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  <span>Acknowledge</span>
                </button>
                <button
                  onClick={() => handleResolveAlert(selectedAlert)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Resolve</span>
                </button>
                <button
                  onClick={() => handleSuppressAlert(selectedAlert)}
                  className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg px-4 py-2 text-gray-400 flex items-center space-x-2 transition-all"
                >
                  <BellOff className="w-4 h-4" />
                  <span>Suppress</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLO Details Modal */}
      {showSloModal && selectedSlo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>SLO Details</h3>
              <button
                onClick={() => setShowSloModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedSlo.name}</h4>
                <p className={getSubtextClass()}>{selectedSlo.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedSlo.status)}`}>
                    {getStatusIcon(selectedSlo.status)}
                    <span className="capitalize">{selectedSlo.status}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Target</p>
                  <p className={getTextClass()}>{selectedSlo.target}%</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Current</p>
                  <p className={getTextClass()}>{selectedSlo.current}%</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Last Updated</p>
                  <p className={getTextClass()}>{selectedSlo.lastUpdated}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateSlo(selectedSlo)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span>Update SLO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertsSLOs
