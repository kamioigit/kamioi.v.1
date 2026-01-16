import React, { useState, useEffect } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Activity,
  BarChart3,
  TrendingUp,
  Play,
  Pause,
  X,
  Target,
  Timer,
  Cpu,
  HardDrive,
  Zap,
  Layers,
  Box,
  Package,
  Archive,
  Hash,
  Grid,
  Network,
  Globe,
  Wifi,
  Signal,
  Battery,
  Gauge,
  Thermometer,
  Wind,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  RefreshCw,
  Upload,
  Download,
  Cloud,
  CloudOff,
  CloudRain,
  CloudSnow,
  CloudLightning,
  TestTube,
  Beaker,
  Microscope,
  Code,
  Terminal,
  Monitor,
  Laptop,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Megaphone,
  Radio,
  Tv,
  Smartphone,
  Mail,
  MessageSquare,
  Phone,
  Video,
  Camera,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Volume1,
  File,
  Folder,
  FolderOpen,
  FileImage,
  FileCode,
  FileSpreadsheet,
  FileText,
  Star,
  Bookmark,
  Tag,
  User,
  Calendar,
  Calculator,
  Info,
  AlertTriangle,
  HelpCircle,
  Settings,
  Cog,
  Wrench,
  Hammer,
  Scissors,
  Plus,
  Minus,
  Edit,
  Share,
  Lock,
  Unlock,
  Heart
} from 'lucide-react'

const DocsDictionary = () => {
  const [activeTab, setActiveTab] = useState('documentation')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [selectedDictionary, setSelectedDictionary] = useState(null)

  // Mock data for documentation - cleared
  const documentation = []

  // Mock data for data dictionary - cleared
  const dataDictionary = []

  const categories = [
    { id: 'all', name: 'All Categories', count: documentation.length },
    { id: 'schema', name: 'Schema', count: documentation.filter(d => d.category === 'schema').length },
    { id: 'api', name: 'API', count: documentation.filter(d => d.category === 'api').length },
    { id: 'migration', name: 'Migration', count: documentation.filter(d => d.category === 'migration').length }
  ]

  const types = [
    { id: 'all', name: 'All Types', count: documentation.length },
    { id: 'guide', name: 'Guide', count: documentation.filter(d => d.type === 'guide').length },
    { id: 'reference', name: 'Reference', count: documentation.filter(d => d.type === 'reference').length },
    { id: 'tutorial', name: 'Tutorial', count: documentation.filter(d => d.type === 'tutorial').length }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4" />
      case 'draft': return <Edit className="w-4 h-4" />
      case 'deprecated': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-500'
      case 'draft': return 'text-yellow-500'
      case 'deprecated': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'guide': return <BookOpen className="w-4 h-4" />
      case 'reference': return <FileText className="w-4 h-4" />
      case 'tutorial': return <Play className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  const getDataTypeIcon = (type) => {
    switch (type) {
      case 'integer': return <Hash className="w-4 h-4" />
      case 'varchar': return <FileText className="w-4 h-4" />
      case 'timestamp': return <Clock className="w-4 h-4" />
      case 'boolean': return <CheckCircle className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  const filteredDocs = documentation.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesType = selectedType === 'all' || doc.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const filteredDictionary = dataDictionary.filter(dictionary => {
    const matchesSearch = dictionary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dictionary.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Docs & Data Dictionary</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive documentation and data catalog</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Documentation
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Upload className="w-4 h-4 mr-2 inline" />
            Import Schema
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('documentation')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'documentation'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 mr-2 inline" />
          Documentation
        </button>
        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'dictionary'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 mr-2 inline" />
          Data Dictionary
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Search documentation and dictionary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter className="w-4 h-4 mr-2 inline" />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'documentation' && (
        <div className="space-y-4">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="glass-card p-6 hover:scale-105 transition-all duration-300 border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getTypeIcon(doc.type)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doc.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{doc.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {doc.author}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {doc.lastUpdated}
                    </span>
                    <div className="flex items-center space-x-1">
                      {doc.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'dictionary' && (
        <div className="space-y-4">
          {filteredDictionary.map(item => (
            <div key={item.id} className="glass-card p-6 hover:scale-105 transition-all duration-300 border border-green-500/20 shadow-lg shadow-green-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                    {item.type}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Updated {item.lastUpdated}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Columns</h4>
                <div className="space-y-1">
                  {item.columns.map((column, index) => (
                    <div key={index} className="flex items-center space-x-4 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center space-x-2">
                        {getDataTypeIcon(column.type)}
                        <span className="font-medium text-gray-900 dark:text-white">{column.name}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{column.type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        column.nullable 
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {column.nullable ? 'Nullable' : 'Not Null'}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{column.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto hover:scale-105 transition-all duration-300 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedDoc.title}</h2>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {selectedDoc.author}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedDoc.lastUpdated}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedDoc.status)}`}>
                  {selectedDoc.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{selectedDoc.description}</p>
              <div className="prose dark:prose-invert">
                <p>{selectedDoc.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocsDictionary
