import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import prefetchRegistry from '../../services/prefetchRegistry'
import prefetchService from '../../services/prefetchService'
import { Database, Brain, Search, Activity, RefreshCw, CheckCircle, AlertCircle, Info, Play, Settings, BarChart3, Network, FileText, Users, Clock, XCircle, User } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' // 🚀 PERFORMANCE FIX: Import React Query

const LLMDataManagement = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient() // 🚀 PERFORMANCE FIX: For cache invalidation
  const { isLightMode, isDarkMode, isCloudMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [systemStatus, setSystemStatus] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [eventStats, setEventStats] = useState(null)
  const [vectorEmbeddings, setVectorEmbeddings] = useState(null)
  const [featureStore, setFeatureStore] = useState(null)
  const [manualLoading, setManualLoading] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success') // 'success', 'error', 'info'

  // Register fetch function for prefetching
  useEffect(() => {
    const fetchFn = async () => {
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      if (!token) return null
      
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const headers = { 'Authorization': `Bearer ${token}` }
      
      try {
        const [statusRes, statsRes, vectorsRes, featuresRes] = await Promise.all([
          fetch(`${apiUrl}/api/llm-data/system-status`, { headers }),
          fetch(`${apiUrl}/api/llm-data/event-stats`, { headers }),
          fetch(`${apiUrl}/api/llm-data/vector-embeddings`, { headers }),
          fetch(`${apiUrl}/api/llm-data/feature-store`, { headers })
        ])
        
        const [statusData, statsData, vectorsData, featuresData] = await Promise.all([
          statusRes.ok ? statusRes.json() : null,
          statsRes.ok ? statsRes.json() : null,
          vectorsRes.ok ? vectorsRes.json() : null,
          featuresRes.ok ? featuresRes.json() : null
        ])
        
        return {
          systemStatus: statusData?.data || null,
          eventStats: statsData?.data || null,
          vectorEmbeddings: vectorsData?.data || null,
          featureStore: featuresData?.data || null
        }
      } catch (e) {
        return null
      }
    }
    
    prefetchRegistry.register('llm-data', fetchFn)
  }, [])

  // 🚀 PERFORMANCE FIX: Use React Query for LLM data - proper caching, no unnecessary reloads
  const { data: llmDataManagementData, isLoading: isLoadingLLMDataManagement, error: llmDataManagementError, refetch: refetchLLMDataManagement } = useQuery({
    queryKey: ['llm-data-management'],
    queryFn: async () => {
      // 🚀 FIX: Try multiple token sources and wait a bit if token not immediately available
      let token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      
      // If no token, wait a short time and retry (handles race condition)
      if (!token) {
        await new Promise(resolve => setTimeout(resolve, 100))
        token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      }
      
      if (!token) {
        console.warn('⚠️ LLMDataManagement - No authentication token available, returning empty data')
        return {
          systemStatus: null,
          eventStats: null,
          vectorEmbeddings: null,
          featureStore: null
        }
      }
      
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const headers = { 'Authorization': `Bearer ${token}` }
      
      // Fetch all data in parallel
      const [statusRes, statsRes, vectorsRes, featuresRes] = await Promise.allSettled([
        fetch(`${apiUrl}/api/llm-data/system-status`, { headers }),
        fetch(`${apiUrl}/api/llm-data/event-stats`, { headers }),
        fetch(`${apiUrl}/api/llm-data/vector-embeddings`, { headers }),
        fetch(`${apiUrl}/api/llm-data/feature-store`, { headers })
      ])
      
      const systemStatus = statusRes.status === 'fulfilled' && statusRes.value.ok
        ? (await statusRes.value.json()).data || null
        : null
      
      const eventStats = statsRes.status === 'fulfilled' && statsRes.value.ok
        ? (await statsRes.value.json()).data || null
        : null
      
      const vectorEmbeddings = vectorsRes.status === 'fulfilled' && vectorsRes.value.ok
        ? (await vectorsRes.value.json()).data || null
        : null
      
      const featureStore = featuresRes.status === 'fulfilled' && featuresRes.value.ok
        ? (await featuresRes.value.json()).data || null
        : null
      
      return {
        systemStatus,
        eventStats,
        vectorEmbeddings,
        featureStore
      }
    },
    staleTime: 300000, // 🚀 FIX: 5 minutes - data is fresh for 5 minutes
    cacheTime: 600000, // 10 minutes - keep in cache for 10 minutes
    refetchOnWindowFocus: false, // 🚀 FIX: Don't refetch on window focus
    refetchOnMount: false, // 🚀 FIX: Don't refetch on mount if data is fresh
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      // Update local state from React Query cache
      if (data) {
        if (data.systemStatus) setSystemStatus(data.systemStatus)
        if (data.eventStats) setEventStats(data.eventStats)
        if (data.vectorEmbeddings) setVectorEmbeddings(data.vectorEmbeddings)
        if (data.featureStore) setFeatureStore(data.featureStore)
      }
      
      // Dispatch page load completion event
      window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
        detail: { pageId: 'llm-data' }
      }))
    },
    onError: (error) => {
      // Log error but don't crash the UI
      console.error('❌ LLMDataManagement - Query error:', error)
      // Still dispatch event so loading report knows something happened
      window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
        detail: { pageId: 'llm-data', error: true }
      }))
    }
  })
  
  // 🚀 PERFORMANCE FIX: Map React Query loading to component loading state for backward compatibility
  const loading = isLoadingLLMDataManagement || manualLoading
  
  // 🚀 PERFORMANCE FIX: Only show loading for initial load, not for cached data
  const isInitialLoad = isLoadingLLMDataManagement && !llmDataManagementData
  
  // Update local state when React Query data changes
  useEffect(() => {
    if (llmDataManagementData) {
      if (llmDataManagementData.systemStatus) setSystemStatus(llmDataManagementData.systemStatus)
      if (llmDataManagementData.eventStats) setEventStats(llmDataManagementData.eventStats)
      if (llmDataManagementData.vectorEmbeddings) setVectorEmbeddings(llmDataManagementData.vectorEmbeddings)
      if (llmDataManagementData.featureStore) setFeatureStore(llmDataManagementData.featureStore)
      
      // 🚀 FIX: Dispatch completion event when data is loaded (even from cache)
      // This ensures the event is dispatched even if onSuccess wasn't called (cached data)
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
          detail: { pageId: 'llm-data' }
        }))
      }, 100)
      return () => clearTimeout(timer)
    } else if (!isLoadingLLMDataManagement && llmDataManagementError) {
      // If there's an error and we're not loading, dispatch completion event
      window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
        detail: { pageId: 'llm-data', error: true }
      }))
    }
  }, [llmDataManagementData, isLoadingLLMDataManagement, llmDataManagementError])
  
  // 🚀 PERFORMANCE FIX: Wrapper functions for backward compatibility
  const loadDataFresh = async (abortController) => {
    // React Query handles caching automatically - just trigger a refetch
    await refetchLLMDataManagement()
  }
  
  const fetchSystemStatus = async (signal = null) => {
    // React Query handles this - just trigger a refetch
    await refetchLLMDataManagement()
  }
  
  const fetchEventStats = async (signal = null) => {
    // React Query handles this - just trigger a refetch
    await refetchLLMDataManagement()
  }
  
  const fetchVectorEmbeddings = async (signal = null) => {
    // React Query handles this - just trigger a refetch
    await refetchLLMDataManagement()
  }
  
  const fetchFeatureStore = async (signal = null) => {
    // React Query handles this - just trigger a refetch
    await refetchLLMDataManagement()
  }
  
  // 🚀 DEPRECATED: Old fetch functions removed - now using React Query above

  const initializeSystem = async () => {
    try {
      setManualLoading(true)
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiUrl}/api/llm-data/initialize-system`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        await fetchSystemStatus()
        showNotification('LLM data systems initialized successfully!', 'success')
      } else {
        showNotification('Failed to initialize systems', 'error')
      }
    } catch (error) {
      console.error('Failed to initialize system:', error)
      showNotification('Failed to initialize systems', 'error')
    } finally {
      setManualLoading(false)
    }
  }

  const searchRAG = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setManualLoading(true)
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiUrl}/api/llm-data/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          topK: 5,
          threshold: 0.7
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.data.passages)
      }
    } catch (error) {
      console.error('Failed to search RAG:', error)
    } finally {
      setManualLoading(false)
    }
  }

  const handleRefreshFeatures = async () => {
    try {
      setManualLoading(true)
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiUrl}/api/llm-data/refresh-features`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        showNotification('Features refreshed successfully!', 'success')
        // Refresh feature store data
        await fetchFeatureStore()
      } else {
        showNotification('Failed to refresh features', 'error')
      }
    } catch (error) {
      console.error('Failed to refresh features:', error)
      showNotification('Failed to refresh features', 'error')
    } finally {
      setManualLoading(false)
    }
  }

  const handleRebuildCache = async () => {
    try {
      setManualLoading(true)
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiUrl}/api/llm-data/rebuild-cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        showNotification('Cache rebuilt successfully!', 'success')
        // Refresh feature store data
        await fetchFeatureStore()
      } else {
        showNotification('Failed to rebuild cache', 'error')
      }
    } catch (error) {
      console.error('Failed to rebuild cache:', error)
      showNotification('Failed to rebuild cache', 'error')
    } finally {
      setManualLoading(false)
    }
  }

  const handleConfigureFeatures = async () => {
    try {
      setManualLoading(true)
      const token = localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3'
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiUrl}/api/llm-data/configure-features`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: {
            cache_size: '1GB',
            compute_timeout: 30,
            refresh_interval: 3600,
            storage_optimization: true
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        showNotification('Feature store configured successfully!', 'success')
        // Refresh feature store data
        await fetchFeatureStore()
      } else {
        showNotification('Failed to configure features', 'error')
      }
    } catch (error) {
      console.error('Failed to configure features:', error)
      showNotification('Failed to configure features', 'error')
    } finally {
      setManualLoading(false)
    }
  }

  const getTextClass = () => isLightMode ? 'text-gray-900' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-300'
  const getCardClass = () => isLightMode 
    ? 'bg-white border border-gray-200' 
    : 'bg-white/10 backdrop-blur-md border border-white/20'

  const showNotification = (message, type = 'success') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotificationModal(true)
  }

  const handleNotificationModalClose = () => {
    setShowNotificationModal(false)
    setNotificationMessage('')
  }
  const getBadgeClass = (status) => {
    const baseClass = 'px-2 py-1 rounded-full text-xs font-medium'
    if (status === 'operational') {
      return `${baseClass} bg-green-100 text-green-800`
    } else if (status === 'inactive') {
      return `${baseClass} bg-gray-100 text-gray-600`
    }
    return `${baseClass} bg-yellow-100 text-yellow-800`
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status Cards */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(systemStatus).map(([key, value]) => (
            <div key={key} className={`${getCardClass()} p-4 rounded-lg`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {key === 'system_health' && <Activity className="w-5 h-5 text-green-500" />}
                  {key === 'active_processes' && <Network className="w-5 h-5 text-blue-500" />}
                  {key === 'queue_size' && <FileText className="w-5 h-5 text-purple-500" />}
                  {key === 'uptime' && <Database className="w-5 h-5 text-orange-500" />}
                  <h3 className={`${getTextClass()} font-medium capitalize`}>
                    {key.replace('_', ' ')}
                  </h3>
                </div>
                {key === 'system_health' && (
                  <span className={getBadgeClass(value)}>
                    {value}
                  </span>
                )}
              </div>
              
              <div className={`${getTextClass()} text-2xl font-bold`}>
                {key.includes('last_') || key.includes('updated') || key.includes('processed') || key.includes('indexed') ? 
                  new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) :
                  (typeof value === 'number' ? value.toLocaleString() : value)
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Pipeline Stats */}
      {eventStats && (
        <div className={`${getCardClass()} p-6 rounded-lg`}>
          <h3 className={`${getTextClass()} text-lg font-semibold mb-4 flex items-center`}>
            <Activity className="w-5 h-5 mr-2" />
            Event Pipeline Activity (Last 24h)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`${getTextClass()} text-2xl font-bold`}>
                {eventStats?.events_today || 0}
              </div>
              <div className={`${getSubtextClass()} text-sm`}>
                Events Today
              </div>
              <div className={`${getSubtextClass()} text-xs`}>
                Total: {eventStats?.total_events || 0}
              </div>
            </div>
            <div className="text-center">
              <div className={`${getTextClass()} text-2xl font-bold`}>
                {eventStats?.success_rate || 0}%
              </div>
              <div className={`${getSubtextClass()} text-sm`}>
                Success Rate
              </div>
              <div className={`${getSubtextClass()} text-xs`}>
                Avg: {eventStats?.avg_processing_time || '0ms'}
              </div>
            </div>
            <div className="text-center">
              <div className={`${getTextClass()} text-2xl font-bold`}>
                {eventStats?.processing_rate || '0/min'}
              </div>
              <div className={`${getSubtextClass()} text-sm`}>
                Processing Rate
              </div>
              <div className={`${getSubtextClass()} text-xs`}>
                Queue: {eventStats?.queue_size || 0}
              </div>
            </div>
            <div className="text-center">
              <div className={`${getTextClass()} text-2xl font-bold`}>
                {eventStats?.events_processed?.toLocaleString() || '0'}
              </div>
              <div className={`${getSubtextClass()} text-sm`}>
                Total Processed
              </div>
              <div className={`${getSubtextClass()} text-xs`}>
                Last: {eventStats?.last_processed ? 
                  new Date(eventStats.last_processed).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Never'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`${getCardClass()} p-6 rounded-lg`}>
        <h3 className={`${getTextClass()} text-lg font-semibold mb-4`}>Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={initializeSystem}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Initialize System</span>
          </button>
          
          <button
            onClick={fetchSystemStatus}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderRAGSearch = () => (
    <div className="space-y-6">
      <div className={`${getCardClass()} p-6 rounded-lg`}>
        <h3 className={`${getTextClass()} text-lg font-semibold mb-4 flex items-center`}>
          <Search className="w-5 h-5 mr-2" />
          RAG Collections Search
        </h3>
        
        <div className="flex space-x-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className={`flex-1 px-3 py-2 border rounded-lg ${
              isLightMode 
                ? 'border-gray-300 bg-white text-gray-900' 
                : 'border-white/20 bg-white/10 text-white placeholder-gray-400'
            }`}
            onKeyPress={(e) => e.key === 'Enter' && searchRAG()}
          />
          <button
            onClick={searchRAG}
            disabled={loading || !searchQuery.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </div>

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className={`${getTextClass()} font-medium`}>Search Results:</h4>
            {searchResults.map((result, index) => (
              <div key={index} className={`${isLightMode ? 'bg-gray-50' : 'bg-white/5'} p-4 rounded-lg border ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`${getSubtextClass()} text-sm font-medium`}>
                    ID: {result.id}
                  </span>
                  <span className={`${getSubtextClass()} text-xs`}>
                    Similarity: {((result.score || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className={`${getTextClass()} text-sm`}>{result.content}</p>
                {result.metadata && (
                  <div className={`${getSubtextClass()} text-xs mt-2`}>
                    Source: {result.source} | Category: {result.metadata.category} | Confidence: {((result.metadata.confidence || 0) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderVectorEmbeddings = () => (
    <div className="space-y-6">
      <div className={`${getCardClass()} p-6 rounded-lg`}>
        <h3 className={`${getTextClass()} text-lg font-semibold mb-4 flex items-center`}>
          <Network className="w-5 h-5 mr-2" />
          Vector Embeddings Status
        </h3>
        
        {vectorEmbeddings && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(vectorEmbeddings).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className={`${getTextClass()} text-xl font-bold`}>
                  {key === 'last_update' ? 
                    new Date(value).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) :
                    (typeof value === 'number' ? value.toLocaleString() : value)
                  }
                </div>
                <div className={`${getSubtextClass()} text-sm capitalize`}>
                  {key.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderFeatureStore = () => (
    <div className="space-y-6">
      <div className={`${getCardClass()} p-6 rounded-lg`}>
        <h3 className={`${getTextClass()} text-lg font-semibold mb-4 flex items-center`}>
          <Database className="w-5 h-5 mr-2" />
          Feature Store Management
        </h3>
        
        <div className={`${getSubtextClass()} text-sm mb-6`}>
          The feature store computes and caches user behavioral features, merchant characteristics, 
          and transaction patterns for enhanced LLM context.
        </div>

        {/* Feature Store Stats */}
        {featureStore && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(featureStore).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className={`${getTextClass()} text-xl font-bold`}>
                  {key === 'last_update' ? 
                    new Date(value).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) :
                    (typeof value === 'number' ? value.toLocaleString() : value)
                  }
                </div>
                <div className={`${getSubtextClass()} text-sm capitalize`}>
                  {key.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feature Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${isLightMode ? 'bg-gray-50' : 'bg-white/5'} p-4 rounded-lg border ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
            <h4 className={`${getTextClass()} font-medium mb-3`}>Active Features</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`${getSubtextClass()} text-sm`}>Merchant Patterns</span>
                <span className={`${getTextClass()} text-sm font-medium`}>
                  {featureStore?.merchant_patterns?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${getSubtextClass()} text-sm`}>User Behavior</span>
                <span className={`${getTextClass()} text-sm font-medium`}>
                  {featureStore?.user_behavior?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${getSubtextClass()} text-sm`}>Transaction Features</span>
                <span className={`${getTextClass()} text-sm font-medium`}>
                  {featureStore?.transaction_features?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>

          <div className={`${isLightMode ? 'bg-gray-50' : 'bg-white/5'} p-4 rounded-lg border ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
            <h4 className={`${getTextClass()} font-medium mb-3`}>Feature Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`${getSubtextClass()} text-sm`}>Cache Hit Rate</span>
                <span className={`${getTextClass()} text-sm font-medium`}>
                  {featureStore?.cache_hit_rate?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${getSubtextClass()} text-sm`}>Avg Compute Time</span>
                <span className={`${getTextClass()} text-sm font-medium`}>
                  {featureStore?.avg_compute_time || '0'}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${getSubtextClass()} text-sm`}>Storage Efficiency</span>
                <span className={`${getTextClass()} text-sm font-medium`}>
                  {featureStore?.storage_efficiency?.toFixed(1) || '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Store Actions */}
        <div className="mt-6 flex space-x-3">
          <button 
            onClick={handleRefreshFeatures}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Refresh Features</span>
          </button>
          <button 
            onClick={handleRebuildCache}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            <span>Rebuild Cache</span>
          </button>
          <button 
            onClick={handleConfigureFeatures}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
            <span>Configure</span>
          </button>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'rag-search', label: 'RAG Search', icon: Search },
    { id: 'vector-embeddings', label: 'Vector Embeddings', icon: Network },
    { id: 'feature-store', label: 'Feature Store', icon: Database }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`${getTextClass()} text-2xl font-bold mb-2`}>LLM Data Management</h1>
        <p className={`${getSubtextClass()}`}>
          Manage and monitor the LLM data architecture including vector embeddings, RAG collections, 
          feature store, and event pipeline.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-white/10 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-white/20 text-blue-600 dark:text-blue-400 shadow-sm'
                  : `${getSubtextClass()} hover:text-gray-900 dark:hover:text-white`
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {loading && !systemStatus && !eventStats && !vectorEmbeddings && !featureStore ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className={`${getSubtextClass()}`}>Loading LLM Data Management...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'rag-search' && renderRAGSearch()}
            {activeTab === 'vector-embeddings' && renderVectorEmbeddings()}
            {activeTab === 'feature-store' && renderFeatureStore()}
          </>
        )}
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-xl p-6 border w-full max-w-md mx-4`}>
            <div className="text-center">
              {notificationType === 'success' && <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />}
              {notificationType === 'error' && <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />}
              {notificationType === 'info' && <Info className="w-12 h-12 text-blue-400 mx-auto mb-4" />}
              
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-2`}>Notification</h3>
              <p className={`${getSubtextClass()} mb-6`}>{notificationMessage}</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleNotificationModalClose}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 transition-all"
                >
                  OK
                </button>
                <button
                  onClick={() => {
                    handleNotificationModalClose()
                    // Navigate to notifications page
                    navigate('/admin/notifications')
                  }}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 transition-all"
                >
                  View Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LLMDataManagement

