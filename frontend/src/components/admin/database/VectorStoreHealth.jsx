import React, { useState, useEffect } from 'react'
import { Database, Search, Filter, RefreshCw, Eye, AlertTriangle, CheckCircle, XCircle, Clock, Activity, BarChart3, TrendingUp, Play, Pause, Settings, Download, X, Target, Timer, Cpu, HardDrive, Zap, Layers, Box, Package, Archive, FileText, Hash, Grid, Network, Globe, Wifi, Signal, Battery, Gauge, Thermometer, Wind, RotateCcw, Video } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'

const VectorStoreHealth = () => {
  const [loading, setLoading] = useState(false)
   const { isLightMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [vectorStores, setVectorStores] = useState([])
  const [embeddings, setEmbeddings] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [showStoreModal, setShowStoreModal] = useState(false)
  const [showEmbeddingModal, setShowEmbeddingModal] = useState(false)
  const [selectedEmbedding, setSelectedEmbedding] = useState(null)

  useEffect(() => {
    fetchVectorStoreData()
    fetchEmbeddingsData()
  }, [])

  const fetchVectorStoreData = async () => {
    setLoading(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/vector-store/health`)
      if (response.ok) {
        const data = await response.json()
        setVectorStores(data.data?.collections || [])
      }
    } catch (error) {
      console.error('Error fetching vector store data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmbeddingsData = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/vector-store/embeddings`)
      if (response.ok) {
        const data = await response.json()
        setEmbeddings(data.data?.embeddings || [])
      }
    } catch (error) {
      console.error('Error fetching embeddings data:', error)
    }
  }

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      case 'offline': return 'text-gray-400'
      case 'maintenance': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <XCircle className="w-4 h-4" />
      case 'offline': return <XCircle className="w-4 h-4" />
      case 'maintenance': return <Settings className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getEmbeddingTypeColor = (type) => {
    switch (type) {
      case 'text': return 'text-blue-400'
      case 'image': return 'text-green-400'
      case 'audio': return 'text-yellow-400'
      case 'video': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getEmbeddingTypeIcon = (type) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />
      case 'image': return <Box className="w-4 h-4" />
      case 'audio': return <Zap className="w-4 h-4" />
      case 'video': return <Play className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const handleViewStore = (store) => {
    setSelectedStore(store)
    setShowStoreModal(true)
  }

  const handleViewEmbedding = (embedding) => {
    setSelectedEmbedding(embedding)
    setShowEmbeddingModal(true)
  }

  const handleOptimizeStore = (store) => {
    console.log(`Optimizing store: ${store.name}`)
    // Implement store optimization logic
  }

  const handleRebuildIndex = (store) => {
    console.log(`Rebuilding index for store: ${store.name}`)
    // Implement index rebuild logic
  }

  const handleCleanupEmbeddings = (store) => {
    console.log(`Cleaning up embeddings for store: ${store.name}`)
    // Implement cleanup logic
  }

  const filteredStores = vectorStores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        store.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter
    const matchesType = typeFilter === 'all' || store.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredEmbeddings = embeddings.filter(embedding => {
    const matchesSearch = embedding.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        embedding.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextClass()}`}>Vector Store Health</h2>
          <p className={getSubtextClass()}>Embedding coverage and ANN index health monitoring</p>
        </div>
        <button
          onClick={fetchVectorStoreData}
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
              <p className={getSubtextClass()}>Total Stores</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{vectorStores.length}</p>
            </div>
            <Database className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Healthy</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {vectorStores.filter(s => s.status === 'healthy').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Critical</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>
                {vectorStores.filter(s => s.status === 'critical').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className={`${getCardClass()} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={getSubtextClass()}>Embeddings</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{embeddings.length}</p>
            </div>
            <Layers className="w-8 h-8 text-purple-400" />
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
              placeholder="Search stores and embeddings..."
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
          <option value="healthy">Healthy</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="offline">Offline</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Types</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
        </select>
      </div>

      {/* Vector Stores Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Vector Stores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Store</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Embeddings</th>
                <th className="text-left p-4 text-gray-400 font-medium">Index Health</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Updated</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((store, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{store.name}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{store.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(store.status)}`}>
                      {getStatusIcon(store.status)}
                      <span className="capitalize">{store.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSubtextClass()} bg-white/10`}>
                      {store.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{store.embeddingCount}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{store.indexHealth}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{store.lastUpdated}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewStore(store)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOptimizeStore(store)}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Optimize Store"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRebuildIndex(store)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Rebuild Index"
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

      {/* Embeddings Table */}
      <div className={`${getCardClass()} rounded-lg border`}>
        <div className="p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${getTextClass()}`}>Recent Embeddings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">ID</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Content</th>
                <th className="text-left p-4 text-gray-400 font-medium">Dimensions</th>
                <th className="text-left p-4 text-gray-400 font-medium">Created</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmbeddings.map((embedding, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <span className={`font-mono text-sm ${getTextClass()}`}>{embedding.id}</span>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center space-x-2 ${getEmbeddingTypeColor(embedding.type)}`}>
                      {getEmbeddingTypeIcon(embedding.type)}
                      <span className="capitalize">{embedding.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={getTextClass()}>{embedding.content}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{embedding.dimensions}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={getSubtextClass()}>{embedding.created}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewEmbedding(embedding)}
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

      {/* Store Details Modal */}
      {showStoreModal && selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Store Details</h3>
              <button
                onClick={() => setShowStoreModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>{selectedStore.name}</h4>
                <p className={getSubtextClass()}>{selectedStore.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Status</p>
                  <div className={`flex items-center space-x-2 ${getStatusColor(selectedStore.status)}`}>
                    {getStatusIcon(selectedStore.status)}
                    <span className="capitalize">{selectedStore.status}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <p className={getTextClass()}>{selectedStore.type}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Embeddings</p>
                  <p className={getTextClass()}>{selectedStore.embeddingCount}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Index Health</p>
                  <p className={getTextClass()}>{selectedStore.indexHealth}%</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOptimizeStore(selectedStore)}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Optimize</span>
                </button>
                <button
                  onClick={() => handleRebuildIndex(selectedStore)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Rebuild Index</span>
                </button>
                <button
                  onClick={() => handleCleanupEmbeddings(selectedStore)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
                >
                  <Archive className="w-4 h-4" />
                  <span>Cleanup</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedding Details Modal */}
      {showEmbeddingModal && selectedEmbedding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${getCardClass()} rounded-lg p-6 max-w-2xl w-full mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Embedding Details</h3>
              <button
                onClick={() => setShowEmbeddingModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${getTextClass()}`}>Embedding {selectedEmbedding.id}</h4>
                <p className={getSubtextClass()}>{selectedEmbedding.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={getSubtextClass()}>Type</p>
                  <div className={`flex items-center space-x-2 ${getEmbeddingTypeColor(selectedEmbedding.type)}`}>
                    {getEmbeddingTypeIcon(selectedEmbedding.type)}
                    <span className="capitalize">{selectedEmbedding.type}</span>
                  </div>
                </div>
                <div>
                  <p className={getSubtextClass()}>Dimensions</p>
                  <p className={getTextClass()}>{selectedEmbedding.dimensions}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Created</p>
                  <p className={getTextClass()}>{selectedEmbedding.created}</p>
                </div>
                <div>
                  <p className={getSubtextClass()}>Store</p>
                  <p className={getTextClass()}>{selectedEmbedding.store}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VectorStoreHealth

