import React, { useState, useEffect } from 'react'
import { 
  Copy, 
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
  Shield,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  Zap,
  Activity,
  Target,
  BarChart3,
  TrendingUp,
  Server
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const ReplicationBackups = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [backupData, setBackupData] = useState(null)
  const [selectedBackup, setSelectedBackup] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  useEffect(() => {
    fetchBackupData()
  }, [])

  const fetchBackupData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/replication/backups`)
      if (response.ok) {
        const data = await response.json()
        setBackupData(data)
      }
    } catch (error) {
      console.error('Failed to fetch backup data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      case 'critical': return 'text-red-400 bg-red-500/20'
      case 'paused': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <XCircle className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getLagColor = (lag) => {
    if (lag < 1) return 'text-green-400'
    if (lag < 5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSizeColor = (size) => {
    if (size < 100) return 'text-green-400'
    if (size < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  const filteredBackups = backupData?.backups?.filter(backup => {
    const matchesSearch = backup.snapshotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         backup.environment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || backup.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const handleViewDetails = (backup) => {
    setSelectedBackup(backup)
    setShowDetails(true)
  }

  const handleTriggerSnapshot = () => {
    console.log('Triggering new snapshot')
    // Implement snapshot trigger
  }

  const handleScheduleDrill = () => {
    console.log('Scheduling restore drill')
    // Implement drill scheduling
  }

  const handleVerifyBackup = (backup) => {
    console.log(`Verifying backup: ${backup.snapshotId}`)
    // Implement backup verification
  }

  const handleRestoreDrill = (backup) => {
    console.log(`Running restore drill: ${backup.snapshotId}`)
    // Implement restore drill
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Replication & Backups</h2>
          <p className={`${getSubtextClass()}`}>
            Backup status and replica health ({filteredBackups.length} backups)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleTriggerSnapshot}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
          >
            <HardDrive className="w-4 h-4" />
            <span>Trigger Snapshot</span>
          </button>
          <button 
            onClick={handleScheduleDrill}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
          >
            <Shield className="w-4 h-4" />
            <span>Schedule Drill</span>
          </button>
          <button 
            onClick={fetchBackupData}
            disabled={loading}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Replication & Backup Overview */}
      {backupData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">
                {backupData.replicaLag || 'N/A'}s
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Replica Lag</p>
            <p className="text-white text-lg font-semibold">
              {backupData.syncMode || 'N/A'} Mode
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {backupData.backups?.length || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Total Backups</p>
            <p className="text-white text-lg font-semibold">
              {backupData.lastSnapshotAge || 'N/A'} ago
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {backupData.lastDrillDate || 'N/A'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Last Drill</p>
            <p className="text-white text-lg font-semibold">
              {backupData.drillSuccess ? 'Success' : 'Failed'}
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">
                {backupData.checksumVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Checksum Verified</p>
            <p className="text-white text-lg font-semibold">
              {backupData.totalSize || 'N/A'} Total
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
                placeholder="Search backups..."
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
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Backups Table */}
      <div className={`${getCardClass()} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Snapshot ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Environment</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Start Time</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">End Time</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Size</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">WAL Range</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBackups.map((backup, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className={`font-medium ${getTextClass()} font-mono text-sm`}>{backup.snapshotId}</div>
                        <div className={`text-sm ${getSubtextClass()}`}>Version: {backup.version}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                      {backup.environment}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(backup.status)}`}>
                      {getStatusIcon(backup.status)}
                      <span className="capitalize text-sm">{backup.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{new Date(backup.startTs).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{new Date(backup.endTs).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${getSizeColor(backup.sizeGb)}`}>
                      {backup.sizeGb} GB
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white font-mono text-sm">{backup.walRange}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(backup)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleVerifyBackup(backup)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Verify Backup"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestoreDrill(backup)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Restore Drill"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replication Status */}
      {backupData && (
        <div className={`${getCardClass()} rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>Replication Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getSubtextClass()}`}>Replica Lag</label>
              <p className={`${getTextClass()} text-2xl font-bold ${getLagColor(backupData.replicaLag)}`}>
                {backupData.replicaLag}s
              </p>
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getSubtextClass()}`}>Sync Mode</label>
              <p className={`${getTextClass()} text-2xl font-bold`}>{backupData.syncMode}</p>
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getSubtextClass()}`}>Replay Status</label>
              <p className={`${getTextClass()} text-2xl font-bold ${backupData.replayPaused ? 'text-red-400' : 'text-green-400'}`}>
                {backupData.replayPaused ? 'Paused' : 'Active'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backup Details Modal */}
      {showDetails && selectedBackup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl mx-4 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>
                Backup Details: {selectedBackup.snapshotId}
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
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Snapshot ID</label>
                  <p className={`${getTextClass()} font-mono`}>{selectedBackup.snapshotId}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Environment</label>
                  <p className={`${getTextClass()}`}>{selectedBackup.environment}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Status</label>
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(selectedBackup.status)}`}>
                    {getStatusIcon(selectedBackup.status)}
                    <span className="capitalize text-sm">{selectedBackup.status}</span>
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Size</label>
                  <p className={`${getTextClass()} ${getSizeColor(selectedBackup.sizeGb)} text-xl font-bold`}>
                    {selectedBackup.sizeGb} GB
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Start Time</label>
                  <p className={`${getTextClass()}`}>{new Date(selectedBackup.startTs).toLocaleString()}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>End Time</label>
                  <p className={`${getTextClass()}`}>{new Date(selectedBackup.endTs).toLocaleString()}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>WAL Range</label>
                  <p className={`${getTextClass()} font-mono`}>{selectedBackup.walRange}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Restore Test</label>
                  <p className={`${getTextClass()} ${selectedBackup.restoreTestPassed ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedBackup.restoreTestPassed ? 'Passed' : 'Failed'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleVerifyBackup(selectedBackup)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Backup</span>
                </button>
                <button
                  onClick={() => handleRestoreDrill(selectedBackup)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>Restore Drill</span>
                </button>
                <button
                  onClick={() => console.log('Download backup:', selectedBackup.snapshotId)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReplicationBackups

