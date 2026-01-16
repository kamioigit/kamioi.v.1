import React, { useState, useEffect } from 'react'
import { 
  RotateCcw, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  GitBranch,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  Shield,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const MigrationsDrift = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [environmentFilter, setEnvironmentFilter] = useState('all')
  const [migrationData, setMigrationData] = useState(null)
  const [selectedMigration, setSelectedMigration] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  useEffect(() => {
    fetchMigrationData()
  }, [])

  const fetchMigrationData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/database/migrations-drift`)
      if (response.ok) {
        const data = await response.json()
        setMigrationData(data)
      }
    } catch (error) {
      console.error('Failed to fetch migration data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'text-green-400 bg-green-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'failed': return 'text-red-400 bg-red-500/20'
      case 'rolled_back': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'rolled_back': return <RotateCcw className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getEnvironmentColor = (env) => {
    switch (env) {
      case 'production': return 'text-red-400'
      case 'staging': return 'text-yellow-400'
      case 'development': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const filteredMigrations = migrationData?.migrations?.filter(migration => {
    const matchesSearch = migration.migrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         migration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || migration.status === statusFilter
    const matchesEnvironment = environmentFilter === 'all' || migration.environment === environmentFilter
    return matchesSearch && matchesStatus && matchesEnvironment
  }) || []

  const handleViewDetails = (migration) => {
    setSelectedMigration(migration)
    setShowDetails(true)
  }

  const handleApplyMigration = (migration) => {
    console.log(`Applying migration: ${migration.migrationId}`)
    // Implement migration application
  }

  const handleRollbackMigration = (migration) => {
    console.log(`Rolling back migration: ${migration.migrationId}`)
    // Implement migration rollback
  }

  const handleGenerateMigration = () => {
    console.log('Generating new migration')
    // Implement migration generation
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Migrations & Drift</h2>
          <p className={`${getSubtextClass()}`}>
            Schema changes and environment parity ({filteredMigrations.length} migrations)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleGenerateMigration}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
          >
            <GitBranch className="w-4 h-4" />
            <span>Generate Migration</span>
          </button>
          <button 
            onClick={fetchMigrationData}
            disabled={loading}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Migration Overview */}
      {migrationData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <GitBranch className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">
                {migrationData.currentHead}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Current Head</p>
            <p className="text-white text-lg font-semibold">
              {migrationData.unappliedCount} Unapplied
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {migrationData.appliedCount}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Applied</p>
            <p className="text-white text-lg font-semibold">
              {migrationData.failedCount} Failed
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {migrationData.envParity ? 'Yes' : 'No'}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Env Parity</p>
            <p className="text-white text-lg font-semibold">
              {migrationData.destructiveChanges} Destructive
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {migrationData.destructiveChanges}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Destructive Changes</p>
            <p className="text-white text-lg font-semibold">
              {migrationData.requiresApproval ? 'Needs Approval' : 'Ready'}
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
                placeholder="Search migrations..."
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
            <option value="applied">Applied</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="rolled_back">Rolled Back</option>
          </select>
          <select 
            value={environmentFilter}
            onChange={(e) => setEnvironmentFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>
      </div>

      {/* Migrations Table */}
      <div className={`${getCardClass()} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Migration ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Environment</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Applied At</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Duration</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Checksum</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMigrations.map((migration, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <GitBranch className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className={`font-medium ${getTextClass()} font-mono text-sm`}>{migration.migrationId}</div>
                        <div className={`text-sm ${getSubtextClass()}`}>Version: {migration.version}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs">
                      <div className={`${getTextClass()} truncate`}>{migration.description}</div>
                      {migration.destructive && (
                        <span className="text-red-400 text-xs">⚠️ Destructive</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(migration.status)}`}>
                      {getStatusIcon(migration.status)}
                      <span className="capitalize text-sm">{migration.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getEnvironmentColor(migration.environment)}`}>
                      {migration.environment}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{migration.appliedAt ? new Date(migration.appliedAt).toLocaleString() : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white">{migration.duration || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-400 font-mono text-xs">{migration.checksum?.substring(0, 8)}...</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(migration)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {migration.status === 'pending' && (
                        <button
                          onClick={() => handleApplyMigration(migration)}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Apply Migration"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {migration.status === 'applied' && (
                        <button
                          onClick={() => handleRollbackMigration(migration)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Rollback Migration"
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

      {/* Migration Details Modal */}
      {showDetails && selectedMigration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl mx-4 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>
                Migration Details: {selectedMigration.migrationId}
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
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Migration ID</label>
                  <p className={`${getTextClass()} font-mono`}>{selectedMigration.migrationId}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Description</label>
                  <p className={`${getTextClass()}`}>{selectedMigration.description}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Status</label>
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(selectedMigration.status)}`}>
                    {getStatusIcon(selectedMigration.status)}
                    <span className="capitalize text-sm">{selectedMigration.status}</span>
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Environment</label>
                  <p className={`${getTextClass()} ${getEnvironmentColor(selectedMigration.environment)}`}>
                    {selectedMigration.environment}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Applied At</label>
                  <p className={`${getTextClass()}`}>{selectedMigration.appliedAt ? new Date(selectedMigration.appliedAt).toLocaleString() : 'Not applied'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Duration</label>
                  <p className={`${getTextClass()}`}>{selectedMigration.duration || 'N/A'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Checksum</label>
                  <p className={`${getTextClass()} font-mono text-sm`}>{selectedMigration.checksum}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Destructive</label>
                  <p className={`${selectedMigration.destructive ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedMigration.destructive ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => console.log('View DDL for:', selectedMigration.migrationId)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>View DDL</span>
                </button>
                {selectedMigration.status === 'pending' && (
                  <button
                    onClick={() => handleApplyMigration(selectedMigration)}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                  >
                    <Play className="w-4 h-4" />
                    <span>Apply Migration</span>
                  </button>
                )}
                {selectedMigration.status === 'applied' && (
                  <button
                    onClick={() => handleRollbackMigration(selectedMigration)}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Rollback Migration</span>
                  </button>
                )}
                <button
                  onClick={() => console.log('Export migration plan for:', selectedMigration.migrationId)}
                  className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 flex items-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MigrationsDrift

