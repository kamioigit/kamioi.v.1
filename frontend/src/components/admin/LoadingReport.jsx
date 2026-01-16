import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Database, BarChart3, RefreshCw, Download, Filter, Search, Users, Settings, User } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const LoadingReport = () => {
  const { isLightMode, isDarkMode, isCloudMode } = useTheme()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, slow, fast, errors
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('avgLoadTime') // avgLoadTime, pageLoads, errors
  const [sortOrder, setSortOrder] = useState('desc') // asc, desc
  
  // Use refs to avoid stale closures and ensure data persistence
  const pageLoadTimesRef = useRef({})
  const pageLoadCountsRef = useRef({})
  const errorCountsRef = useRef({})
  const lastUpdateRef = useRef(Date.now())
  const isInitializedRef = useRef(false)
  // 🚀 FIX: Use refs for callbacks to break circular dependencies
  const generateReportsRef = useRef(null)
  const saveToLocalStorageRef = useRef(null)

  const getTextColor = () => (isLightMode ? 'text-gray-800' : 'text-white')
  const getSubtextClass = () => (isLightMode ? 'text-gray-600' : 'text-gray-400')
  const getCardClass = () => `bg-white/10 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/20 ${isLightMode ? 'bg-opacity-80' : 'bg-opacity-10'}`

  // Admin pages list - matches AdminDashboard tabs
  // 🚀 FIX: Move outside component or use useMemo to prevent recreation on every render
  const adminPages = useMemo(() => [
    { id: 'overview', name: 'Platform Overview', category: 'Dashboard' },
    { id: 'financial', name: 'Financial Analytics', category: 'Analytics' },
    { id: 'transactions', name: 'Transactions', category: 'Data' },
    { id: 'investments', name: 'Investment Summary', category: 'Analytics' },
    { id: 'investment-processing', name: 'Investment Processing', category: 'Operations' },
    { id: 'llm', name: 'LLM Center', category: 'AI/ML' },
    { id: 'llm-data', name: 'LLM Data Management', category: 'AI/ML' },
    { id: 'ml-dashboard', name: 'ML Dashboard', category: 'AI/ML' },
    { id: 'users2', name: 'User Management', category: 'Management' },
    { id: 'employees', name: 'Employee Management', category: 'Management' },
    { id: 'consolidated-users', name: 'Consolidated Users', category: 'Management' },
    { id: 'families', name: 'Family Management', category: 'Management' },
    { id: 'businesses', name: 'Business Management', category: 'Management' },
    { id: 'notifications', name: 'Notifications & Messaging', category: 'Communication' },
    { id: 'badges', name: 'Badges', category: 'Features' },
    { id: 'advertisement', name: 'Advertisement', category: 'Marketing' },
    { id: 'content', name: 'Content Management', category: 'Content' },
    { id: 'subscriptions', name: 'Subscriptions', category: 'Billing' },
    { id: 'settings', name: 'System Settings', category: 'Configuration' },
    { id: 'sop', name: 'Standard Operating Procedures', category: 'Documentation' }
  ], [])

  // Load performance data from localStorage
  // 🚀 FIX: Use ref to avoid circular dependency
  const loadPerformanceData = useCallback(() => {
    try {
      // Load page load times
      const savedPageLoadTimes = localStorage.getItem('admin_page_load_times')
      if (savedPageLoadTimes) {
        try {
          pageLoadTimesRef.current = JSON.parse(savedPageLoadTimes)
          console.log('📊 LoadingReport - Loaded page load times:', Object.keys(pageLoadTimesRef.current).length, 'pages')
        } catch (e) {
          console.warn('📊 LoadingReport - Failed to parse page load times, resetting')
          pageLoadTimesRef.current = {}
        }
      }

      // Load page load counts
      const savedPageLoadCounts = localStorage.getItem('admin_page_load_counts')
      if (savedPageLoadCounts) {
        try {
          pageLoadCountsRef.current = JSON.parse(savedPageLoadCounts)
          console.log('📊 LoadingReport - Loaded page load counts:', Object.keys(pageLoadCountsRef.current).length, 'pages')
        } catch (e) {
          console.warn('📊 LoadingReport - Failed to parse page load counts, resetting')
          pageLoadCountsRef.current = {}
        }
      }

      // Load error counts
      const savedErrorCounts = localStorage.getItem('admin_error_counts')
      if (savedErrorCounts) {
        try {
          errorCountsRef.current = JSON.parse(savedErrorCounts)
        } catch (e) {
          errorCountsRef.current = {}
        }
      }

      // Use ref to get latest generateReports, or call directly if ref not set yet
      if (generateReportsRef.current) {
        generateReportsRef.current()
      } else {
        // Fallback: generateReports might not be in ref yet, but it should be defined
        // This ensures reports are generated even if ref timing is off
        setTimeout(() => {
          if (generateReportsRef.current) {
            generateReportsRef.current()
          }
        }, 0)
      }
      setLoading(false)
      isInitializedRef.current = true
      
      // 🚀 FIX: Dispatch admin-page-load-complete event after initialization
      console.log('📊 LoadingReport - Dispatching admin-page-load-complete for loading-report')
      window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
        detail: { pageId: 'loading-report' }
      }))
    } catch (error) {
      console.error('📊 LoadingReport - Error loading performance data:', error)
      setLoading(false)
      isInitializedRef.current = true
      
      // 🚀 FIX: Dispatch admin-page-load-complete even on error
      window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
        detail: { pageId: 'loading-report', error: true }
      }))
    }
  }, []) // Empty deps - use ref for generateReports

  // Save data to localStorage (debounced)
  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('admin_page_load_times', JSON.stringify(pageLoadTimesRef.current))
      localStorage.setItem('admin_page_load_counts', JSON.stringify(pageLoadCountsRef.current))
      localStorage.setItem('admin_error_counts', JSON.stringify(errorCountsRef.current))
      lastUpdateRef.current = Date.now()
    } catch (error) {
      console.error('📊 LoadingReport - Error saving to localStorage:', error)
    }
  }, [])

  // Handle page load events - single unified handler
  // 🚀 FIX: Use refs to avoid circular dependencies - event handlers don't need to be in dependency arrays
  const handlePageLoaded = useCallback((event) => {
    const { pageId, loadTime } = event.detail
    
    if (!pageId) {
      console.warn('📊 LoadingReport - Received event without pageId')
      return
    }

    // Validate loadTime
    const validLoadTime = loadTime && loadTime > 0 ? loadTime : null
    
    console.log('📊 LoadingReport - Received admin-page-loaded:', { pageId, loadTime: validLoadTime })

    // Always update load count
    pageLoadCountsRef.current[pageId] = (pageLoadCountsRef.current[pageId] || 0) + 1

    // Update load times if we have a valid time
    if (validLoadTime) {
      if (!pageLoadTimesRef.current[pageId]) {
        pageLoadTimesRef.current[pageId] = []
      }
      
      pageLoadTimesRef.current[pageId].push(validLoadTime)
      
      // Keep only last 100 load times per page
      if (pageLoadTimesRef.current[pageId].length > 100) {
        pageLoadTimesRef.current[pageId] = pageLoadTimesRef.current[pageId].slice(-100)
      }
    }

    // Save to localStorage (debounced) - use ref to get latest version
    if (saveToLocalStorageRef.current) {
      saveToLocalStorageRef.current()
    }
    
    // Regenerate reports - use ref to get latest version
    if (generateReportsRef.current) {
      generateReportsRef.current()
    }
  }, []) // Empty deps - use refs for latest callbacks

  // 🚀 FIX: Handle admin-page-load-complete events (dispatched by pages)
  const handlePageLoadComplete = useCallback((event) => {
    const { pageId, error } = event.detail
    
    if (!pageId) {
      console.warn('📊 LoadingReport - Received admin-page-load-complete event without pageId')
      return
    }

    console.log('📊 LoadingReport - Received admin-page-load-complete:', { pageId, error })

    // Always update load count (page completed loading, even if with error)
    pageLoadCountsRef.current[pageId] = (pageLoadCountsRef.current[pageId] || 0) + 1

    // If there's an error, increment error count
    if (error) {
      errorCountsRef.current[pageId] = (errorCountsRef.current[pageId] || 0) + 1
    }

    // Save to localStorage (debounced) - use ref to get latest version
    if (saveToLocalStorageRef.current) {
      saveToLocalStorageRef.current()
    }
    
    // Regenerate reports - use ref to get latest version
    if (generateReportsRef.current) {
      generateReportsRef.current()
    }
  }, []) // Empty deps - use refs for latest callbacks

  // Handle page error events
  // 🚀 FIX: Use refs to avoid circular dependencies
  const handlePageError = useCallback((event) => {
    const { pageId } = event.detail
    
    if (!pageId) return

    errorCountsRef.current[pageId] = (errorCountsRef.current[pageId] || 0) + 1
    
    // Use refs to get latest callbacks
    if (saveToLocalStorageRef.current) {
      saveToLocalStorageRef.current()
    }
    if (generateReportsRef.current) {
      generateReportsRef.current()
    }
  }, []) // Empty deps - use refs for latest callbacks

  // Generate reports from collected data
  // 🚀 FIX: adminPages is memoized, so this callback is stable
  const generateReports = useCallback(() => {
    if (!isInitializedRef.current) return

    const reportsData = adminPages.map(page => {
      const loadTimes = pageLoadTimesRef.current[page.id] || []
      const loadCount = pageLoadCountsRef.current[page.id] || 0
      const errorCount = errorCountsRef.current[page.id] || 0

      const avgLoadTime = loadTimes.length > 0
        ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
        : 0

      const minLoadTime = loadTimes.length > 0 ? Math.min(...loadTimes) : 0
      const maxLoadTime = loadTimes.length > 0 ? Math.max(...loadTimes) : 0

      // Determine status
      let status = 'never-loaded'
      if (loadCount > 0) {
        // If page has been loaded but no timing data, show as 'loaded' (not 'never-loaded')
        if (avgLoadTime === 0 || loadTimes.length === 0) {
          status = 'moderate' // Loaded but no timing data - show as moderate
        } else if (avgLoadTime < 500) {
          status = 'fast'
        } else if (avgLoadTime < 2000) {
          status = 'moderate'
        } else {
          status = 'slow'
        }
      }

      return {
        ...page,
        avgLoadTime,
        minLoadTime,
        maxLoadTime,
        loadCount,
        errorCount,
        errorRate: loadCount > 0 ? (errorCount / loadCount) * 100 : 0,
        status
      }
    })

    setReports(reportsData)
  }, [adminPages])
  
  // 🚀 FIX: Update refs when callbacks change - use useEffect to ensure refs are always current
  useEffect(() => {
    generateReportsRef.current = generateReports
    saveToLocalStorageRef.current = saveToLocalStorage
  }, [generateReports, saveToLocalStorage])

  // Initialize on mount
  // 🚀 FIX: Event handlers use refs, so they're stable - only depend on loadPerformanceData
  useEffect(() => {
    loadPerformanceData()

    // Set up event listeners
    // 🚀 FIX: Listen to both admin-page-loaded (with timing) and admin-page-load-complete (from pages)
    console.log('📊 LoadingReport - Setting up event listeners')
    window.addEventListener('admin-page-loaded', handlePageLoaded)
    window.addEventListener('admin-page-error', handlePageError)
    window.addEventListener('admin-page-load-complete', handlePageLoadComplete)

    // Auto-refresh reports every 2 seconds to catch any missed events
    const refreshInterval = setInterval(() => {
      if (isInitializedRef.current && generateReportsRef.current) {
        generateReportsRef.current()
      }
    }, 2000)

    return () => {
      window.removeEventListener('admin-page-loaded', handlePageLoaded)
      window.removeEventListener('admin-page-error', handlePageError)
      window.removeEventListener('admin-page-load-complete', handlePageLoadComplete)
      clearInterval(refreshInterval)
    }
  }, [loadPerformanceData, handlePageLoaded, handlePageError, handlePageLoadComplete]) // Event handlers are stable (empty deps)

  // Filter and sort reports
  const filteredAndSortedReports = reports
    .filter(report => {
      if (filter === 'slow') return report.status === 'slow'
      if (filter === 'fast') return report.status === 'fast'
      if (filter === 'errors') return report.errorCount > 0
      return true
    })
    .filter(report => {
      if (!searchTerm) return true
      return report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             report.category.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'avgLoadTime':
          aValue = a.avgLoadTime
          bValue = b.avgLoadTime
          break
        case 'pageLoads':
          aValue = a.loadCount
          bValue = b.loadCount
          break
        case 'errors':
          aValue = a.errorCount
          bValue = b.errorCount
          break
        default:
          aValue = a.avgLoadTime
          bValue = b.avgLoadTime
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

  // Calculate overall statistics
  const overallStats = {
    totalPages: reports.length,
    loadedPages: reports.filter(r => r.loadCount > 0).length,
    neverLoaded: reports.filter(r => r.loadCount === 0).length,
    avgLoadTime: reports.filter(r => r.loadCount > 0 && r.avgLoadTime > 0).length > 0
      ? reports.filter(r => r.loadCount > 0 && r.avgLoadTime > 0).reduce((sum, r) => sum + r.avgLoadTime, 0) / reports.filter(r => r.loadCount > 0 && r.avgLoadTime > 0).length
      : 0,
    totalErrors: reports.reduce((sum, r) => sum + r.errorCount, 0),
    slowPages: reports.filter(r => r.status === 'slow').length,
    fastPages: reports.filter(r => r.status === 'fast').length
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'fast': return 'text-green-400'
      case 'moderate': return 'text-yellow-400'
      case 'slow': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'fast': return 'bg-green-500/20 border-green-500/30'
      case 'moderate': return 'bg-yellow-500/20 border-yellow-500/30'
      case 'slow': return 'bg-red-500/20 border-red-500/30'
      default: return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const formatTime = (ms) => {
    if (ms === 0 || !ms) return 'N/A'
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const exportReport = () => {
    const csv = [
      ['Page Name', 'Category', 'Avg Load Time (ms)', 'Min Load Time (ms)', 'Max Load Time (ms)', 'Load Count', 'Error Count', 'Error Rate (%)', 'Status'],
      ...filteredAndSortedReports.map(r => [
        r.name,
        r.category,
        r.avgLoadTime.toFixed(2),
        r.minLoadTime.toFixed(2),
        r.maxLoadTime.toFixed(2),
        r.loadCount,
        r.errorCount,
        r.errorRate.toFixed(2),
        r.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-loading-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all performance data? This cannot be undone.')) {
      pageLoadTimesRef.current = {}
      pageLoadCountsRef.current = {}
      errorCountsRef.current = {}
      if (saveToLocalStorageRef.current) {
        saveToLocalStorageRef.current()
      }
      if (generateReportsRef.current) {
        generateReportsRef.current()
      }
    }
  }

  if (loading) {
    return (
      <div className={`${getCardClass()} text-center py-12`}>
        <RefreshCw className={`w-8 h-8 mx-auto mb-4 animate-spin ${getTextColor()}`} />
        <p className={getSubtextClass()}>Loading performance data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={getCardClass()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${getTextColor()} mb-2`}>
              Admin Dashboard Loading Report
            </h1>
            <p className={getSubtextClass()}>
              Performance metrics and load times for all admin pages
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearData}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                isLightMode 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Data</span>
            </button>
            <button
              onClick={exportReport}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                isLightMode 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className={`w-5 h-5 ${getSubtextClass()}`} />
              <span className={`text-sm ${getSubtextClass()}`}>Total Pages</span>
            </div>
            <p className={`text-2xl font-bold ${getTextColor()}`}>{overallStats.totalPages}</p>
          </div>
          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className={`w-5 h-5 text-green-400`} />
              <span className={`text-sm ${getSubtextClass()}`}>Loaded Pages</span>
            </div>
            <p className={`text-2xl font-bold ${getTextColor()}`}>{overallStats.loadedPages}</p>
          </div>
          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className={`w-5 h-5 ${getSubtextClass()}`} />
              <span className={`text-sm ${getSubtextClass()}`}>Avg Load Time</span>
            </div>
            <p className={`text-2xl font-bold ${getTextColor()}`}>
              {formatTime(overallStats.avgLoadTime)}
            </p>
          </div>
          <div className={`${getCardClass()} p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className={`w-5 h-5 text-red-400`} />
              <span className={`text-sm ${getSubtextClass()}`}>Total Errors</span>
            </div>
            <p className={`text-2xl font-bold ${getTextColor()}`}>{overallStats.totalErrors}</p>
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
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                isLightMode 
                  ? 'bg-white border border-gray-300 text-gray-800' 
                  : 'bg-white/10 border border-white/20 text-white'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'fast', 'slow', 'errors'].map(f => (
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

      {/* Reports Table */}
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
                    <span>Page Name</span>
                  </button>
                </th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>Category</th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>
                  <button
                    onClick={() => {
                      setSortBy('avgLoadTime')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="flex items-center space-x-2 hover:opacity-70"
                  >
                    <span>Avg Load Time</span>
                    {sortBy === 'avgLoadTime' && (
                      sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>Min/Max</th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>
                  <button
                    onClick={() => {
                      setSortBy('pageLoads')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="flex items-center space-x-2 hover:opacity-70"
                  >
                    <span>Loads</span>
                  </button>
                </th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>
                  <button
                    onClick={() => {
                      setSortBy('errors')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="flex items-center space-x-2 hover:opacity-70"
                  >
                    <span>Errors</span>
                  </button>
                </th>
                <th className={`text-left py-3 px-4 ${getTextColor()} font-semibold`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className={`text-center py-8 ${getSubtextClass()}`}>
                    No pages found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredAndSortedReports.map((report, index) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b ${isLightMode ? 'border-gray-200' : 'border-white/5'} hover:bg-white/5 transition-colors`}
                  >
                    <td className={`py-4 px-4 ${getTextColor()} font-medium`}>
                      {report.name}
                    </td>
                    <td className={`py-4 px-4 ${getSubtextClass()}`}>
                      {report.category}
                    </td>
                    <td className={`py-4 px-4 ${getTextColor()}`}>
                      {report.avgLoadTime > 0 ? (
                        <span className="font-mono">{formatTime(report.avgLoadTime)}</span>
                      ) : report.loadCount > 0 ? (
                        <span className={getSubtextClass()}>Loaded (no timing)</span>
                      ) : (
                        <span className={getSubtextClass()}>Never loaded</span>
                      )}
                    </td>
                    <td className={`py-4 px-4 ${getSubtextClass()} font-mono text-sm`}>
                      {report.minLoadTime > 0 && report.maxLoadTime > 0 ? (
                        `${formatTime(report.minLoadTime)} / ${formatTime(report.maxLoadTime)}`
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className={`py-4 px-4 ${getTextColor()}`}>
                      {report.loadCount}
                    </td>
                    <td className={`py-4 px-4 ${report.errorCount > 0 ? 'text-red-400' : getTextColor()}`}>
                      {report.errorCount > 0 ? (
                        <span className="font-semibold">{report.errorCount}</span>
                      ) : (
                        report.errorCount
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(report.status)} ${getStatusColor(report.status)}`}>
                        {report.status === 'never-loaded' ? 'Never Loaded' :
                         report.status === 'fast' ? 'Fast' :
                         report.status === 'moderate' ? 'Moderate' : 'Slow'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className={getCardClass()}>
        <h3 className={`text-lg font-semibold ${getTextColor()} mb-3`}>
          How to Use This Report
        </h3>
        <ul className={`space-y-2 ${getSubtextClass()} text-sm`}>
          <li>• Pages are automatically tracked when loaded in the admin dashboard</li>
          <li>• Load times are measured from page mount to data fetch completion</li>
          <li>• Data is stored locally and persists across sessions</li>
          <li>• Use filters to find slow pages or pages with errors</li>
          <li>• Export CSV for detailed analysis or reporting</li>
          <li>• Click "Clear Data" to reset all performance metrics</li>
        </ul>
      </div>
    </div>
  )
}

export default LoadingReport
