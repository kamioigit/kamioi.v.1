import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Lock,
  User,
  Key,
  EyeOff,
  Activity,
  Settings,
  Play,
  Pause,
  Zap,
  BarChart3,
  TrendingUp,
  Server,
  AlertCircle,
  UserCheck,
  UserX,
  Edit
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const SecurityAccess = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [securityData, setSecurityData] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/security/access`)
      if (response.ok) {
        const data = await response.json()
        setSecurityData(data)
      }
    } catch (error) {
      console.error('Failed to fetch security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'admin': return 'text-red-400'
      case 'write': return 'text-yellow-400'
      case 'read': return 'text-blue-400'
      case 'none': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getPIILevelColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-400'
      case 'Moderate': return 'text-yellow-400'
      case 'Low': return 'text-blue-400'
      case 'None': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getSecurityIcon = (type) => {
    switch (type) {
      case 'role': return <User className="w-4 h-4" />
      case 'grant': return <Key className="w-4 h-4" />
      case 'rls': return <Shield className="w-4 h-4" />
      case 'pii': return <EyeOff className="w-4 h-4" />
      default: return <Lock className="w-4 h-4" />
    }
  }

  const getAccessIcon = (access) => {
    switch (access) {
      case 'admin': return <UserCheck className="w-4 h-4" />
      case 'write': return <Edit className="w-4 h-4" />
      case 'read': return <Eye className="w-4 h-4" />
      case 'none': return <UserX className="w-4 h-4" />
      default: return <Lock className="w-4 h-4" />
    }
  }

  const filteredRoles = securityData?.roles?.filter(role => {
    const matchesSearch = role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || role.accessLevel === roleFilter
    return matchesSearch && matchesRole
  }) || []

  const handleViewDetails = (role) => {
    setSelectedRole(role)
    setShowDetails(true)
  }

  const handleRotateCredentials = (role) => {
    console.log(`Rotating credentials for: ${role.roleName}`)
    // Implement credential rotation
  }

  const handleRevokeGrant = (role) => {
    console.log(`Revoking grants for: ${role.roleName}`)
    // Implement grant revocation
  }

  const handleOpenAccessRequest = (role) => {
    console.log(`Opening access request for: ${role.roleName}`)
    // Implement access request
  }

  const handleAuditAccess = (role) => {
    console.log(`Auditing access for: ${role.roleName}`)
    // Implement access audit
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Security & Access</h2>
          <p className={`${getSubtextClass()}`}>
            Roles, grants, and PII monitoring ({filteredRoles.length} roles)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchSecurityData}
            disabled={loading}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Security Overview */}
      {securityData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <User className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">
                {securityData.totalRoles || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Total Roles</p>
            <p className="text-white text-lg font-semibold">
              {securityData.activeRoles || 0} Active
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {securityData.rlsEnabled || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">RLS Enabled</p>
            <p className="text-white text-lg font-semibold">
              {securityData.piiTables || 0} PII Tables
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {securityData.failedAttempts || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Failed Attempts</p>
            <p className="text-white text-lg font-semibold">
              {securityData.expiredAccounts || 0} Expired
            </p>
          </div>
          
          <div className={`${getCardClass()} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <EyeOff className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {securityData.piiAccess || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">PII Access</p>
            <p className="text-white text-lg font-semibold">
              {securityData.unusedRoles || 0} Unused
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
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Access Levels</option>
            <option value="admin">Admin</option>
            <option value="write">Write</option>
            <option value="read">Read</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Roles Table */}
      <div className={`${getCardClass()} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Access Level</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Grants</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">RLS Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">PII Access</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Used</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      {getSecurityIcon('role')}
                      <div>
                        <div className={`font-medium ${getTextClass()}`}>{role.roleName}</div>
                        <div className={`text-sm ${getSubtextClass()}`}>{role.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getAccessIcon(role.accessLevel)}
                      <span className={`font-medium ${getAccessLevelColor(role.accessLevel)}`}>
                        {role.accessLevel}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {role.grants?.slice(0, 3).map((grant, idx) => (
                        <span key={idx} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                          {grant}
                        </span>
                      ))}
                      {role.grants?.length > 3 && (
                        <span className="text-gray-400 text-xs">+{role.grants.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Shield className={`w-4 h-4 ${role.rlsEnabled ? 'text-green-400' : 'text-red-400'}`} />
                      <span className="text-white">{role.rlsEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getPIILevelColor(role.piiLevel)}`}>
                      {role.piiLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{role.lastUsed ? new Date(role.lastUsed).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${
                      role.status === 'active' ? 'text-green-400 bg-green-500/20' :
                      role.status === 'expired' ? 'text-red-400 bg-red-500/20' :
                      'text-yellow-400 bg-yellow-500/20'
                    }`}>
                      {role.status === 'active' ? <CheckCircle className="w-4 h-4" /> :
                     role.status === 'expired' ? <XCircle className="w-4 h-4" /> :
                     <AlertTriangle className="w-4 h-4" />}
                      <span className="capitalize text-sm">{role.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(role)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRotateCredentials(role)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Rotate Credentials"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRevokeGrant(role)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Revoke Grants"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAuditAccess(role)}
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="Audit Access"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PII Access Audit */}
      {securityData?.piiAccess && (
        <div className={`${getCardClass()} rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>PII Access Audit</h3>
          <div className="space-y-4">
            {securityData.piiAccess.map((access, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <EyeOff className="w-5 h-5 text-red-400" />
                  <div>
                    <div className={`font-medium ${getTextClass()}`}>{access.user}</div>
                    <div className={`text-sm ${getSubtextClass()}`}>{access.table} - {access.column}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${getPIILevelColor(access.piiLevel)}`}>
                    {access.piiLevel}
                  </span>
                  <span className="text-white text-sm">
                    {new Date(access.lastAccessed).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => console.log('Audit PII access:', access)}
                    className="text-blue-400 hover:text-blue-300 p-1"
                    title="Audit Access"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Details Modal */}
      {showDetails && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl mx-4 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>
                Role Details: {selectedRole.roleName}
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
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Role Name</label>
                  <p className={`${getTextClass()}`}>{selectedRole.roleName}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Description</label>
                  <p className={`${getTextClass()}`}>{selectedRole.description}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Access Level</label>
                  <div className="flex items-center space-x-2">
                    {getAccessIcon(selectedRole.accessLevel)}
                    <span className={`font-medium ${getAccessLevelColor(selectedRole.accessLevel)}`}>
                      {selectedRole.accessLevel}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>RLS Status</label>
                  <div className="flex items-center space-x-2">
                    <Shield className={`w-4 h-4 ${selectedRole.rlsEnabled ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="text-white">{selectedRole.rlsEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>PII Level</label>
                  <p className={`${getTextClass()} ${getPIILevelColor(selectedRole.piiLevel)}`}>
                    {selectedRole.piiLevel}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Last Used</label>
                  <p className={`${getTextClass()}`}>{selectedRole.lastUsed ? new Date(selectedRole.lastUsed).toLocaleString() : 'Never'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Status</label>
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded ${
                    selectedRole.status === 'active' ? 'text-green-400 bg-green-500/20' :
                    selectedRole.status === 'expired' ? 'text-red-400 bg-red-500/20' :
                    'text-yellow-400 bg-yellow-500/20'
                  }`}>
                    {selectedRole.status === 'active' ? <CheckCircle className="w-4 h-4" /> :
                   selectedRole.status === 'expired' ? <XCircle className="w-4 h-4" /> :
                   <AlertTriangle className="w-4 h-4" />}
                    <span className="capitalize text-sm">{selectedRole.status}</span>
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${getSubtextClass()}`}>Grants</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.grants?.map((grant, idx) => (
                      <span key={idx} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                        {grant}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleRotateCredentials(selectedRole)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span>Rotate Credentials</span>
                </button>
                <button
                  onClick={() => handleRevokeGrant(selectedRole)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
                >
                  <UserX className="w-4 h-4" />
                  <span>Revoke Grants</span>
                </button>
                <button
                  onClick={() => handleAuditAccess(selectedRole)}
                  className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 flex items-center space-x-2 transition-all"
                >
                  <Activity className="w-4 h-4" />
                  <span>Audit Access</span>
                </button>
                <button
                  onClick={() => handleOpenAccessRequest(selectedRole)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Access Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecurityAccess
