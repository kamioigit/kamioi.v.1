import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Clock,
  Activity,
  TrendingUp,
  Bug,
  CheckSquare,
  Square,
  Layers,
  Bell,
  BellOff,
  Settings,
  BarChart3,
  Mail,
  MessageSquare
} from 'lucide-react'

const ErrorTracking = () => {
  const queryClient = useQueryClient()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'

  // State
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    error_type: '',
    severity: '',
    is_resolved: ''
  })
  const [selectedError, setSelectedError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')

  // New state for improvements
  const [selectedErrors, setSelectedErrors] = useState(new Set())
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30)
  const [groupSimilar, setGroupSimilar] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: false,
    emailAddress: '',
    slackEnabled: false,
    slackWebhook: '',
    criticalOnly: true
  })

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || ''
  }

  // Fetch error stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['error-stats'],
    queryFn: async () => {
      const response = await fetch(`${backendBaseUrl}/api/admin/errors/stats`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    },
    staleTime: 30000
  })

  // Fetch errors
  const { data: errorsData, isLoading: errorsLoading, refetch } = useQuery({
    queryKey: ['errors', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20'
      })
      if (filters.error_type) params.append('error_type', filters.error_type)
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.is_resolved) params.append('is_resolved', filters.is_resolved)

      const response = await fetch(`${backendBaseUrl}/api/admin/errors?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data
    },
    staleTime: 30000
  })

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refetch()
      refetchStats()
    }, autoRefreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, autoRefreshInterval, refetch, refetchStats])

  // Dispatch page load completion event for Loading Report
  useEffect(() => {
    if (!statsLoading && !errorsLoading && statsData) {
      window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
        detail: { pageId: 'error-tracking' }
      }))
    }
  }, [statsLoading, errorsLoading, statsData])

  // Test error mutation
  const testErrorMutation = useMutation({
    mutationFn: async ({ severity, message }) => {
      const response = await fetch(`${backendBaseUrl}/api/admin/errors/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ severity, message })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errors'] })
      queryClient.invalidateQueries({ queryKey: ['error-stats'] })
    }
  })

  // Resolve error mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ errorId, notes }) => {
      const response = await fetch(`${backendBaseUrl}/api/admin/errors/${errorId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolution_notes: notes })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errors'] })
      queryClient.invalidateQueries({ queryKey: ['error-stats'] })
      setShowModal(false)
      setSelectedError(null)
      setResolutionNotes('')
    }
  })

  // Bulk resolve mutation
  const bulkResolveMutation = useMutation({
    mutationFn: async (errorIds) => {
      const results = await Promise.all(
        errorIds.map(errorId =>
          fetch(`${backendBaseUrl}/api/admin/errors/${errorId}/resolve`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resolution_notes: 'Bulk resolved' })
          }).then(r => r.json())
        )
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errors'] })
      queryClient.invalidateQueries({ queryKey: ['error-stats'] })
      setSelectedErrors(new Set())
    }
  })

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'error':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleString()
  }

  const handleViewError = (error) => {
    setSelectedError(error)
    setShowModal(true)
    setResolutionNotes('')
  }

  const handleResolve = () => {
    if (selectedError) {
      resolveMutation.mutate({
        errorId: selectedError.id,
        notes: resolutionNotes
      })
    }
  }

  const toggleErrorSelection = (errorId) => {
    const newSelected = new Set(selectedErrors)
    if (newSelected.has(errorId)) {
      newSelected.delete(errorId)
    } else {
      newSelected.add(errorId)
    }
    setSelectedErrors(newSelected)
  }

  const toggleSelectAll = () => {
    if (!errorsData?.data) return
    const unresolvedErrors = errorsData.data.filter(e => !e.is_resolved)
    if (selectedErrors.size === unresolvedErrors.length) {
      setSelectedErrors(new Set())
    } else {
      setSelectedErrors(new Set(unresolvedErrors.map(e => e.id)))
    }
  }

  const handleBulkResolve = () => {
    if (selectedErrors.size > 0) {
      bulkResolveMutation.mutate(Array.from(selectedErrors))
    }
  }

  // Group errors by type and message for deduplication view
  const getGroupedErrors = useCallback(() => {
    if (!errorsData?.data || !groupSimilar) return null

    const groups = {}
    errorsData.data.forEach(error => {
      const key = `${error.error_type}:${error.error_message?.substring(0, 100)}`
      if (!groups[key]) {
        groups[key] = {
          ...error,
          count: 1,
          latestAt: error.created_at,
          ids: [error.id]
        }
      } else {
        groups[key].count++
        groups[key].ids.push(error.id)
        if (new Date(error.created_at) > new Date(groups[key].latestAt)) {
          groups[key].latestAt = error.created_at
        }
      }
    })

    return Object.values(groups).sort((a, b) =>
      new Date(b.latestAt) - new Date(a.latestAt)
    )
  }, [errorsData, groupSimilar])

  // Stats cards data
  const stats = statsData || { total: 0, unresolved: 0, critical: 0, today: 0, by_type: {}, by_severity: {}, recent_trend: [] }
  const groupedErrors = getGroupedErrors()

  // Calculate max value for chart scaling
  const maxTrendValue = Math.max(...(stats.recent_trend?.map(d => d.count) || [0]), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Tracking</h1>
          <p className="text-gray-400">Monitor and manage system errors</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-green-600/50 hover:bg-green-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-400'
            }`}
            title={autoRefresh ? `Auto-refresh every ${autoRefreshInterval}s` : 'Enable auto-refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? `${autoRefreshInterval}s` : 'Auto'}
          </button>

          {/* Group similar toggle */}
          <button
            onClick={() => setGroupSimilar(!groupSimilar)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              groupSimilar
                ? 'bg-purple-600/50 hover:bg-purple-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-400'
            }`}
            title="Group similar errors"
          >
            <Layers className="w-4 h-4" />
            Group
          </button>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-400 rounded-lg transition-colors"
            title="Notification settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => testErrorMutation.mutate({ severity: 'info', message: 'Test error from admin panel' })}
            disabled={testErrorMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/50 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Bug className="w-4 h-4" />
            {testErrorMutation.isPending ? 'Testing...' : 'Test Error'}
          </button>
          <button
            onClick={() => {
              refetch()
              queryClient.invalidateQueries({ queryKey: ['error-stats'] })
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Errors</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Bug className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unresolved</p>
              <p className="text-2xl font-bold text-orange-400">{stats.unresolved}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical</p>
              <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today</p>
              <p className="text-2xl font-bold text-blue-400">{stats.today}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>
      </div>

      {/* Error Trend Chart */}
      {stats.recent_trend && stats.recent_trend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Error Trend (Last 7 Days)</h3>
          </div>
          <div className="flex items-end gap-2 h-32">
            {stats.recent_trend.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-purple-500/50 hover:bg-purple-500 rounded-t transition-colors cursor-pointer relative group"
                  style={{ height: `${Math.max((day.count / maxTrendValue) * 100, 4)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.count} errors
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters and Bulk Actions */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Filters:</span>
            </div>

            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <select
              value={filters.is_resolved}
              onChange={(e) => setFilters({ ...filters, is_resolved: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
            </select>

            <input
              type="text"
              value={filters.error_type}
              onChange={(e) => setFilters({ ...filters, error_type: e.target.value })}
              placeholder="Filter by type..."
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Bulk Actions */}
          {selectedErrors.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{selectedErrors.size} selected</span>
              <button
                onClick={handleBulkResolve}
                disabled={bulkResolveMutation.isPending}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {bulkResolveMutation.isPending ? 'Resolving...' : 'Resolve Selected'}
              </button>
              <button
                onClick={() => setSelectedErrors(new Set())}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-400 rounded-lg text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Errors List */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
        {errorsLoading ? (
          <div className="p-8 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading errors...
          </div>
        ) : errorsData?.data?.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>No errors found</p>
          </div>
        ) : groupSimilar && groupedErrors ? (
          // Grouped view
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Severity</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Type</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Message</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Count</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Latest</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedErrors.map((group, idx) => (
                  <tr key={idx} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      {getSeverityIcon(group.severity)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityBadgeClass(group.severity)}`}>
                        {group.error_type}
                      </span>
                    </td>
                    <td className="p-4 text-white text-sm max-w-xs truncate">
                      {group.error_message}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {group.count}x
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                      {formatDate(group.latestAt)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewError(group)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Normal view with checkboxes
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-4 w-12">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {selectedErrors.size === errorsData?.data?.filter(e => !e.is_resolved).length && selectedErrors.size > 0 ? (
                        <CheckSquare className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Severity</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Type</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Message</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Endpoint</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Time</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {errorsData?.data?.map((error) => (
                  <tr key={error.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      {!error.is_resolved && (
                        <button
                          onClick={() => toggleErrorSelection(error.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {selectedErrors.has(error.id) ? (
                            <CheckSquare className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {getSeverityIcon(error.severity)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityBadgeClass(error.severity)}`}>
                        {error.error_type}
                      </span>
                    </td>
                    <td className="p-4 text-white text-sm max-w-xs truncate">
                      {error.error_message}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {error.endpoint || '-'}
                    </td>
                    <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                      {formatDate(error.created_at)}
                    </td>
                    <td className="p-4">
                      {error.is_resolved ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          Resolved
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          Open
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewError(error)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {errorsData?.meta && !groupSimilar && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              Page {errorsData.meta.page} of {errorsData.meta.total_pages} ({errorsData.meta.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!errorsData.meta.has_prev}
                className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!errorsData.meta.has_next}
                className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Detail Modal */}
      <AnimatePresence>
        {showModal && selectedError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(selectedError.severity)}
                  <h2 className="text-xl font-bold text-white">Error Details</h2>
                  {selectedError.count && (
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      {selectedError.count} occurrences
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Type</label>
                    <p className="text-white">{selectedError.error_type}</p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm">Message</label>
                    <p className="text-white">{selectedError.error_message}</p>
                  </div>

                  {selectedError.endpoint && (
                    <div>
                      <label className="text-gray-400 text-sm">Endpoint</label>
                      <p className="text-white font-mono text-sm">
                        {selectedError.http_method} {selectedError.endpoint}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-gray-400 text-sm">Time</label>
                    <p className="text-white">{formatDate(selectedError.created_at || selectedError.latestAt)}</p>
                  </div>

                  {selectedError.error_stack && (
                    <div>
                      <label className="text-gray-400 text-sm">Stack Trace</label>
                      <pre className="mt-1 p-3 bg-black/50 rounded-lg text-red-400 text-xs overflow-x-auto whitespace-pre-wrap">
                        {selectedError.error_stack}
                      </pre>
                    </div>
                  )}

                  {!selectedError.is_resolved && (
                    <div>
                      <label className="text-gray-400 text-sm">Resolution Notes</label>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Add notes about how this was resolved..."
                        className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                    </div>
                  )}

                  {selectedError.is_resolved && selectedError.resolution_notes && (
                    <div>
                      <label className="text-gray-400 text-sm">Resolution Notes</label>
                      <p className="text-white">{selectedError.resolution_notes}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Resolved at {formatDate(selectedError.resolved_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-white/10">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                {!selectedError.is_resolved && (
                  <button
                    onClick={handleResolve}
                    disabled={resolveMutation.isPending}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {resolveMutation.isPending ? 'Resolving...' : 'Mark as Resolved'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/20 rounded-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Error Tracking Settings</h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Auto-refresh settings */}
                <div>
                  <h3 className="text-white font-medium mb-3">Auto-Refresh</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-gray-300">Enable auto-refresh</span>
                    </label>
                    <select
                      value={autoRefreshInterval}
                      onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                      disabled={!autoRefresh}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <option value="15">15 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="120">2 minutes</option>
                      <option value="300">5 minutes</option>
                    </select>
                  </div>
                </div>

                {/* Notification settings */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.criticalOnly}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          criticalOnly: e.target.checked
                        })}
                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-gray-300">Critical errors only</span>
                    </label>

                    {/* Email notifications */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailEnabled}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            emailEnabled: e.target.checked
                          })}
                          className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                        />
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Email notifications</span>
                      </label>
                      {notificationSettings.emailEnabled && (
                        <input
                          type="email"
                          value={notificationSettings.emailAddress}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            emailAddress: e.target.value
                          })}
                          placeholder="admin@example.com"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      )}
                    </div>

                    {/* Slack notifications */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.slackEnabled}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            slackEnabled: e.target.checked
                          })}
                          className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                        />
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Slack notifications</span>
                      </label>
                      {notificationSettings.slackEnabled && (
                        <input
                          type="url"
                          value={notificationSettings.slackWebhook}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            slackWebhook: e.target.value
                          })}
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Note: Notification settings are stored locally. Backend integration for email/Slack notifications requires additional setup.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-white/10">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('errorTrackingSettings', JSON.stringify({
                      autoRefresh,
                      autoRefreshInterval,
                      notificationSettings
                    }))
                    setShowSettings(false)
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ErrorTracking
