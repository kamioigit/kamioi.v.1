import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Zap, RefreshCw, Download, Search, Play, Pause, Settings2,
  Server, Wifi, WifiOff, TestTube, BarChart2
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

/**
 * REBUILT LoadingReport Component
 *
 * New Architecture:
 * - Actively tests API endpoints instead of relying on custom events
 * - Uses real HTTP requests to measure actual response times
 * - Stores historical data in localStorage with proper aggregation
 * - Provides on-demand and automated testing capabilities
 */
const LoadingReport = () => {
  const { isLightMode } = useTheme()
  const [testResults, setTestResults] = useState([])
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testingPageId, setTestingPageId] = useState(null)
  const [autoTestEnabled, setAutoTestEnabled] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('avgResponseTime')
  const [sortOrder, setSortOrder] = useState('desc')
  const [lastTestTime, setLastTestTime] = useState(null)
  const [testProgress, setTestProgress] = useState({ current: 0, total: 0 })

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

  const getTextColor = () => (isLightMode ? 'text-gray-800' : 'text-white')
  const getSubtextClass = () => (isLightMode ? 'text-gray-600' : 'text-gray-400')
  const getCardClass = () => `bg-white/10 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/20 ${isLightMode ? 'bg-opacity-80' : 'bg-opacity-10'}`

  // Admin pages with their associated API endpoints to test
  // These endpoints match the actual backend routes in app_clean.py
  const adminPages = useMemo(() => [
    {
      id: 'overview',
      name: 'Platform Overview',
      category: 'Dashboard',
      endpoints: [
        { path: '/api/admin/dashboard/overview', name: 'Dashboard Overview' }
      ]
    },
    {
      id: 'transactions',
      name: 'Transactions',
      category: 'Data',
      endpoints: [
        { path: '/api/admin/transactions', name: 'Transactions List' }
      ]
    },
    {
      id: 'subscriptions',
      name: 'Subscriptions',
      category: 'Billing',
      endpoints: [
        { path: '/api/admin/subscriptions/users', name: 'Subscription Users' },
        { path: '/api/admin/subscriptions/plans', name: 'Subscription Plans' }
      ]
    },
    {
      id: 'investments',
      name: 'Investment Summary',
      category: 'Analytics',
      endpoints: [
        { path: '/api/admin/subscriptions/analytics/overview', name: 'Analytics Overview' }
      ]
    },
    {
      id: 'investment-processing',
      name: 'Investment Processing',
      category: 'Operations',
      endpoints: [
        { path: '/api/admin/llm-center/queue', name: 'Processing Queue' }
      ]
    },
    {
      id: 'llm',
      name: 'LLM Center',
      category: 'AI/ML',
      endpoints: [
        { path: '/api/admin/llm-center/queue', name: 'LLM Queue' },
        { path: '/api/admin/llm-center/processing-stats', name: 'Processing Stats' }
      ]
    },
    {
      id: 'ml-dashboard',
      name: 'ML Dashboard',
      category: 'AI/ML',
      endpoints: [
        { path: '/api/admin/llm-center/transaction-stats', name: 'Transaction Stats' }
      ]
    },
    {
      id: 'llm-data',
      name: 'LLM Data Management',
      category: 'AI/ML',
      endpoints: [
        { path: '/api/llm-data/system-status', name: 'System Status' },
        { path: '/api/llm-data/event-stats', name: 'Event Stats' }
      ]
    },
    {
      id: 'database',
      name: 'Database Management',
      category: 'Data',
      endpoints: [
        { path: '/api/admin/database/stats', name: 'Database Stats' }
      ]
    },
    {
      id: 'consolidated-users',
      name: 'User Management',
      category: 'Management',
      endpoints: [
        { path: '/api/admin/users', name: 'Users List' }
      ]
    },
    {
      id: 'financial',
      name: 'Financial Analytics',
      category: 'Analytics',
      endpoints: [
        { path: '/api/admin/subscriptions/analytics/overview', name: 'Subscription Analytics' }
      ]
    },
    {
      id: 'notifications',
      name: 'Notifications & Messaging',
      category: 'Communication',
      endpoints: [
        { path: '/api/admin/notifications', name: 'Notifications List' },
        { path: '/api/admin/messaging/campaigns', name: 'Messaging Campaigns' }
      ]
    },
    {
      id: 'content',
      name: 'Content Management',
      category: 'Content',
      endpoints: [
        { path: '/api/admin/content/blogs', name: 'Blog Content' }
      ]
    },
    {
      id: 'advertisement',
      name: 'Advertisement',
      category: 'Marketing',
      endpoints: [
        { path: '/api/admin/advertisements/campaigns', name: 'Ad Campaigns' }
      ]
    },
    {
      id: 'badges',
      name: 'Badges',
      category: 'Features',
      endpoints: [
        { path: '/api/admin/badges', name: 'Badges List' }
      ]
    },
    {
      id: 'employees',
      name: 'Employee Management',
      category: 'Management',
      endpoints: [
        { path: '/api/admin/employees', name: 'Employees List' }
      ]
    },
    {
      id: 'settings',
      name: 'System Settings',
      category: 'Configuration',
      endpoints: [
        { path: '/api/admin/settings', name: 'Admin Settings' }
      ]
    },
    {
      id: 'sop',
      name: 'Standard Operating Procedures',
      category: 'Documentation',
      endpoints: [
        { path: '/api/admin/content/pages', name: 'Content Pages' }
      ]
    },
    {
      id: 'loading-report',
      name: 'Loading Report',
      category: 'Monitoring',
      endpoints: [
        { path: '/api/health', name: 'Health Check' }
      ]
    },
    {
      id: 'api-tracking',
      name: 'API Tracking',
      category: 'Monitoring',
      endpoints: [
        { path: '/api/admin/api-usage/records', name: 'API Usage Records' }
      ]
    },
    {
      id: 'error-tracking',
      name: 'Error Tracking',
      category: 'Monitoring',
      endpoints: [
        { path: '/api/admin/db-status', name: 'DB Status' }
      ]
    }
  ], [])

  // Load historical data from localStorage
  const loadHistoricalData = useCallback(() => {
    try {
      const savedData = localStorage.getItem('admin_endpoint_test_results')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setTestResults(parsed.results || [])
        setLastTestTime(parsed.lastTestTime ? new Date(parsed.lastTestTime) : null)
      } else {
        // Initialize with empty results for all pages
        const initialResults = adminPages.map(page => ({
          ...page,
          lastTest: null,
          avgResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0,
          testCount: 0,
          errorCount: 0,
          lastStatus: 'untested',
          endpointResults: page.endpoints.map(ep => ({
            ...ep,
            responseTime: 0,
            status: 'untested',
            error: null
          }))
        }))
        setTestResults(initialResults)
      }
    } catch (error) {
      console.error('Failed to load historical data:', error)
      // Initialize with empty results
      const initialResults = adminPages.map(page => ({
        ...page,
        lastTest: null,
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        testCount: 0,
        errorCount: 0,
        lastStatus: 'untested',
        endpointResults: page.endpoints.map(ep => ({
          ...ep,
          responseTime: 0,
          status: 'untested',
          error: null
        }))
      }))
      setTestResults(initialResults)
    }
  }, [adminPages])

  // Save data to localStorage
  const saveToLocalStorage = useCallback((results) => {
    try {
      localStorage.setItem('admin_endpoint_test_results', JSON.stringify({
        results,
        lastTestTime: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [])

  // Test a single endpoint
  const testEndpoint = async (endpoint) => {
    const token = localStorage.getItem('kamioi_admin_token')
    const startTime = performance.now()

    try {
      const response = await fetch(`${apiBaseUrl}${endpoint.path}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      const endTime = performance.now()
      const responseTime = endTime - startTime

      return {
        ...endpoint,
        responseTime: Math.round(responseTime),
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        error: response.ok ? null : `HTTP ${response.status}`
      }
    } catch (error) {
      const endTime = performance.now()
      const responseTime = endTime - startTime

      return {
        ...endpoint,
        responseTime: Math.round(responseTime),
        status: 'error',
        statusCode: 0,
        error: error.name === 'TimeoutError' ? 'Timeout (30s)' : error.message
      }
    }
  }

  // Test a single page (all its endpoints)
  const testPage = async (page) => {
    const endpointResults = await Promise.all(
      page.endpoints.map(endpoint => testEndpoint(endpoint))
    )

    const successfulResults = endpointResults.filter(r => r.status === 'success')
    const avgTime = successfulResults.length > 0
      ? successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length
      : endpointResults.reduce((sum, r) => sum + r.responseTime, 0) / endpointResults.length

    const hasErrors = endpointResults.some(r => r.status === 'error')

    return {
      ...page,
      lastTest: new Date().toISOString(),
      avgResponseTime: Math.round(avgTime),
      minResponseTime: Math.min(...endpointResults.map(r => r.responseTime)),
      maxResponseTime: Math.max(...endpointResults.map(r => r.responseTime)),
      testCount: (testResults.find(t => t.id === page.id)?.testCount || 0) + 1,
      errorCount: (testResults.find(t => t.id === page.id)?.errorCount || 0) + (hasErrors ? 1 : 0),
      lastStatus: hasErrors ? 'error' : (avgTime > 2000 ? 'slow' : avgTime > 500 ? 'moderate' : 'fast'),
      endpointResults
    }
  }

  // Test a single page by ID
  const testSinglePage = async (pageId) => {
    const page = adminPages.find(p => p.id === pageId)
    if (!page) return

    setTestingPageId(pageId)

    try {
      const result = await testPage(page)

      setTestResults(prev => {
        const updated = prev.map(p => p.id === pageId ? result : p)
        saveToLocalStorage(updated)
        return updated
      })
    } finally {
      setTestingPageId(null)
    }
  }

  // Run full test suite
  const runFullTest = async () => {
    if (isRunningTest) return

    setIsRunningTest(true)
    setTestProgress({ current: 0, total: adminPages.length })

    try {
      const results = []

      for (let i = 0; i < adminPages.length; i++) {
        setTestProgress({ current: i + 1, total: adminPages.length })
        setTestingPageId(adminPages[i].id)

        const result = await testPage(adminPages[i])
        results.push(result)

        // Update state incrementally for visual feedback
        setTestResults(prev => {
          const existing = prev.filter(p => p.id !== adminPages[i].id)
          return [...existing.slice(0, i), result, ...existing.slice(i)]
        })

        // Small delay to prevent overwhelming the server
        if (i < adminPages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      // Sort results back to original order and save
      const sortedResults = adminPages.map(page =>
        results.find(r => r.id === page.id) || {
          ...page,
          lastTest: null,
          avgResponseTime: 0,
          testCount: 0,
          errorCount: 0,
          lastStatus: 'untested',
          endpointResults: []
        }
      )

      setTestResults(sortedResults)
      saveToLocalStorage(sortedResults)
      setLastTestTime(new Date())
    } finally {
      setIsRunningTest(false)
      setTestingPageId(null)
      setTestProgress({ current: 0, total: 0 })
    }
  }

  // Initialize on mount
  useEffect(() => {
    loadHistoricalData()
  }, [loadHistoricalData])

  // Auto-test interval
  useEffect(() => {
    if (!autoTestEnabled) return

    const interval = setInterval(() => {
      if (!isRunningTest) {
        runFullTest()
      }
    }, 60000) // Run every 60 seconds when auto-test is enabled

    return () => clearInterval(interval)
  }, [autoTestEnabled, isRunningTest])

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    return testResults
      .filter(result => {
        if (filter === 'slow') return result.lastStatus === 'slow'
        if (filter === 'fast') return result.lastStatus === 'fast'
        if (filter === 'errors') return result.errorCount > 0 || result.lastStatus === 'error'
        if (filter === 'untested') return result.lastStatus === 'untested'
        return true
      })
      .filter(result => {
        if (!searchTerm) return true
        return result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               result.category.toLowerCase().includes(searchTerm.toLowerCase())
      })
      .sort((a, b) => {
        let aValue, bValue

        switch (sortBy) {
          case 'avgResponseTime':
            aValue = a.avgResponseTime || 0
            bValue = b.avgResponseTime || 0
            break
          case 'testCount':
            aValue = a.testCount || 0
            bValue = b.testCount || 0
            break
          case 'errors':
            aValue = a.errorCount || 0
            bValue = b.errorCount || 0
            break
          case 'name':
            aValue = a.name
            bValue = b.name
            return sortOrder === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue)
          default:
            aValue = a.avgResponseTime || 0
            bValue = b.avgResponseTime || 0
        }

        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      })
  }, [testResults, filter, searchTerm, sortBy, sortOrder])

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const testedPages = testResults.filter(r => r.lastStatus !== 'untested')
    const pagesWithTiming = testedPages.filter(r => r.avgResponseTime > 0)

    return {
      totalPages: testResults.length,
      testedPages: testedPages.length,
      untestedPages: testResults.filter(r => r.lastStatus === 'untested').length,
      avgResponseTime: pagesWithTiming.length > 0
        ? Math.round(pagesWithTiming.reduce((sum, r) => sum + r.avgResponseTime, 0) / pagesWithTiming.length)
        : 0,
      totalErrors: testResults.reduce((sum, r) => sum + (r.errorCount || 0), 0),
      slowPages: testResults.filter(r => r.lastStatus === 'slow').length,
      fastPages: testResults.filter(r => r.lastStatus === 'fast').length,
      errorPages: testResults.filter(r => r.lastStatus === 'error').length
    }
  }, [testResults])

  const getStatusColor = (status) => {
    switch (status) {
      case 'fast': return 'text-green-400'
      case 'moderate': return 'text-yellow-400'
      case 'slow': return 'text-orange-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'fast': return 'bg-green-500/20 border-green-500/30'
      case 'moderate': return 'bg-yellow-500/20 border-yellow-500/30'
      case 'slow': return 'bg-orange-500/20 border-orange-500/30'
      case 'error': return 'bg-red-500/20 border-red-500/30'
      default: return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fast': return <Zap className="w-4 h-4 text-green-400" />
      case 'moderate': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'slow': return <AlertTriangle className="w-4 h-4 text-orange-400" />
      case 'error': return <WifiOff className="w-4 h-4 text-red-400" />
      default: return <Wifi className="w-4 h-4 text-gray-400" />
    }
  }

  const formatTime = (ms) => {
    if (!ms || ms === 0) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const exportReport = () => {
    const csv = [
      ['Page Name', 'Category', 'Avg Response Time (ms)', 'Min (ms)', 'Max (ms)', 'Test Count', 'Errors', 'Status', 'Last Test'],
      ...filteredAndSortedResults.map(r => [
        r.name,
        r.category,
        r.avgResponseTime,
        r.minResponseTime || 0,
        r.maxResponseTime || 0,
        r.testCount,
        r.errorCount,
        r.lastStatus,
        r.lastTest ? new Date(r.lastTest).toISOString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-api-performance-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearData = () => {
    if (window.confirm('Clear all test history? This cannot be undone.')) {
      localStorage.removeItem('admin_endpoint_test_results')
      loadHistoricalData()
      setLastTestTime(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={getCardClass()}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${getTextColor()} mb-2 flex items-center gap-3`}>
              <BarChart2 className="w-8 h-8" />
              Admin API Performance Monitor
            </h1>
            <p className={getSubtextClass()}>
              Real-time API endpoint testing and performance tracking
            </p>
            {lastTestTime && (
              <p className={`text-sm mt-1 ${getSubtextClass()}`}>
                Last full test: {lastTestTime.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAutoTestEnabled(!autoTestEnabled)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                autoTestEnabled
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : isLightMode
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {autoTestEnabled ? <Pause className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
              <span>Auto-test: {autoTestEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={runFullTest}
              disabled={isRunningTest}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                isRunningTest
                  ? 'bg-blue-500/50 text-blue-200 cursor-not-allowed'
                  : isLightMode
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
              }`}
            >
              {isRunningTest ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Testing ({testProgress.current}/{testProgress.total})</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Full Test</span>
                </>
              )}
            </button>

            <button
              onClick={clearData}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                isLightMode
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear</span>
            </button>

            <button
              onClick={exportReport}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                isLightMode
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isRunningTest && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className={getSubtextClass()}>Testing in progress...</span>
              <span className={getTextColor()}>{testProgress.current} / {testProgress.total}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(testProgress.current / testProgress.total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Overall Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <Server className={`w-5 h-5 ${getSubtextClass()}`} />
              <span className={`text-sm ${getSubtextClass()}`}>Total Endpoints</span>
            </div>
            <p className={`text-2xl font-bold ${getTextColor()}`}>{overallStats.totalPages}</p>
          </div>

          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className={`text-sm ${getSubtextClass()}`}>Tested</span>
            </div>
            <p className={`text-2xl font-bold ${getTextColor()}`}>{overallStats.testedPages}</p>
          </div>

          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className={`w-5 h-5 ${getSubtextClass()}`} />
              <span className={`text-sm ${getSubtextClass()}`}>Avg Response</span>
            </div>
            <p className={`text-2xl font-bold ${getTextColor()}`}>
              {formatTime(overallStats.avgResponseTime)}
            </p>
          </div>

          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className={`text-sm ${getSubtextClass()}`}>Fast</span>
            </div>
            <p className={`text-2xl font-bold text-green-400`}>{overallStats.fastPages}</p>
          </div>

          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className={`text-sm ${getSubtextClass()}`}>Slow</span>
            </div>
            <p className={`text-2xl font-bold text-orange-400`}>{overallStats.slowPages}</p>
          </div>

          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <WifiOff className="w-5 h-5 text-red-400" />
              <span className={`text-sm ${getSubtextClass()}`}>Errors</span>
            </div>
            <p className={`text-2xl font-bold text-red-400`}>{overallStats.errorPages}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={getCardClass()}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getSubtextClass()}`} />
            <input
              type="text"
              placeholder="Search pages or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                isLightMode
                  ? 'bg-white border border-gray-300 text-gray-800'
                  : 'bg-white/10 border border-white/20 text-white'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'fast', 'slow', 'errors', 'untested'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-all capitalize ${
                  filter === f
                    ? isLightMode
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                    : isLightMode
                      ? 'bg-white/50 text-gray-700 hover:bg-white/70'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className={getCardClass()}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isLightMode ? 'border-gray-300' : 'border-white/10'}`}>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>
                  <button
                    onClick={() => {
                      setSortBy('name')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="flex items-center space-x-2 hover:opacity-70"
                  >
                    <span>Page / Endpoints</span>
                  </button>
                </th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>Category</th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>
                  <button
                    onClick={() => {
                      setSortBy('avgResponseTime')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="flex items-center space-x-2 hover:opacity-70"
                  >
                    <span>Avg Response</span>
                    {sortBy === 'avgResponseTime' && (
                      sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>Min / Max</th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>
                  <button
                    onClick={() => {
                      setSortBy('testCount')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="flex items-center space-x-2 hover:opacity-70"
                  >
                    <span>Tests</span>
                  </button>
                </th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>Status</th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedResults.length === 0 ? (
                <tr>
                  <td colSpan="7" className={`text-center py-8 ${getSubtextClass()}`}>
                    No results matching your criteria. Run a test to see performance data.
                  </td>
                </tr>
              ) : (
                filteredAndSortedResults.map((result, index) => (
                  <motion.tr
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b ${isLightMode ? 'border-gray-200' : 'border-white/5'} hover:bg-white/5 transition-colors ${
                      testingPageId === result.id ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <td className={`py-4 px-4`}>
                      <div className={`font-medium ${getTextColor()}`}>{result.name}</div>
                      <div className={`text-xs ${getSubtextClass()} mt-1`}>
                        {result.endpoints.length} endpoint{result.endpoints.length !== 1 ? 's' : ''}
                        {result.endpointResults?.length > 0 && (
                          <span className="ml-2">
                            ({result.endpointResults.filter(e => e.status === 'success').length} ok, {result.endpointResults.filter(e => e.status === 'error').length} failed)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`py-4 px-4 ${getSubtextClass()}`}>{result.category}</td>
                    <td className={`py-4 px-4 ${getTextColor()} font-mono`}>
                      {testingPageId === result.id ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Testing...
                        </span>
                      ) : result.avgResponseTime > 0 ? (
                        formatTime(result.avgResponseTime)
                      ) : (
                        <span className={getSubtextClass()}>--</span>
                      )}
                    </td>
                    <td className={`py-4 px-4 ${getSubtextClass()} font-mono text-sm`}>
                      {result.minResponseTime > 0 && result.maxResponseTime > 0 ? (
                        `${formatTime(result.minResponseTime)} / ${formatTime(result.maxResponseTime)}`
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className={`py-4 px-4 ${getTextColor()}`}>{result.testCount || 0}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusBg(result.lastStatus)} ${getStatusColor(result.lastStatus)}`}>
                        {getStatusIcon(result.lastStatus)}
                        {result.lastStatus === 'untested' ? 'Untested' :
                         result.lastStatus === 'fast' ? 'Fast' :
                         result.lastStatus === 'moderate' ? 'Moderate' :
                         result.lastStatus === 'slow' ? 'Slow' : 'Error'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => testSinglePage(result.id)}
                        disabled={isRunningTest || testingPageId === result.id}
                        className={`p-2 rounded-lg transition-all ${
                          testingPageId === result.id
                            ? 'bg-blue-500/20 cursor-not-allowed'
                            : isLightMode
                              ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                              : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
                        }`}
                        title="Test this page"
                      >
                        {testingPageId === result.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* How It Works */}
      <div className={getCardClass()}>
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-3 flex items-center gap-2`}>
          <Activity className="w-5 h-5" />
          How This Works
        </h3>
        <ul className={`space-y-2 ${getSubtextClass()} text-sm`}>
          <li>• <strong>Real API Testing:</strong> Actually sends HTTP requests to each page's backend endpoints</li>
          <li>• <strong>Response Time:</strong> Measures the actual time for the server to respond (in milliseconds)</li>
          <li>• <strong>Status Classification:</strong> Fast (&lt;500ms), Moderate (500-2000ms), Slow (&gt;2000ms), Error (failed)</li>
          <li>• <strong>Run Full Test:</strong> Tests all 21 admin pages sequentially with real API calls</li>
          <li>• <strong>Auto-test Mode:</strong> Automatically runs a full test every 60 seconds when enabled</li>
          <li>• <strong>Per-Page Testing:</strong> Click the test tube icon to test a single page on-demand</li>
          <li>• <strong>Historical Tracking:</strong> Test results are saved locally and persist across sessions</li>
        </ul>
      </div>
    </div>
  )
}

export default LoadingReport
