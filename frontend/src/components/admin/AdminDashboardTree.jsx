import React, { useState, useEffect } from 'react'
import { TreePine, Activity, Database, Users, DollarSign, Brain, Flag, Bell, Award, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle, Download, RefreshCw, Eye, Settings, BarChart3, Zap, Shield, Globe, Server, Cpu, HardDrive, Wifi, AlertCircle, ChevronDown, ChevronRight, X, FileText, BarChart, Upload, User, Info } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters'

const AdminDashboardTree = ({ user }) => {
  const [selectedNode, setSelectedNode] = useState(null)
   const { isLightMode } = useTheme()
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']))
  const [systemData, setSystemData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  
  // Modal states
  const [showViewDetails, setShowViewDetails] = useState(false)
  const [showExportData, setShowExportData] = useState(false)
  const [showConfigure, setShowConfigure] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success')

  // System health data structure
  const [systemHealth, setSystemHealth] = useState({
    coreEngine: {
      status: 'green',
      roundUpSuccess: 98.5,
      avgProcessingTime: 1.2,
      failedTransactions: 12,
      uptime: 99.9
    },
    database: {
      status: 'green',
      mongoLatency: 45,
      redisHitRate: 94.2,
      vectorLatency: 120,
      connections: 156
    },
    apis: {
      status: 'yellow',
      plaidResponse: 850,
      stripeResponse: 320,
      alpacaResponse: 1200,
      yahooResponse: 2000,
      rateUsage: 78.5
    },
    infrastructure: {
      status: 'green',
      serverUptime: 99.8,
      avgResponseTime: 180,
      loadBalancerTraffic: 2340,
      errorLogs24h: 3,
      errorLogs7d: 18
    }
  })

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/90 backdrop-blur-lg border-gray-200 rounded-xl shadow-xl' : 'bg-white/10 backdrop-blur-lg border-white/20 rounded-xl shadow-2xl'

  const getStatusIcon = (status) => {
    switch (status) {
      case 'green': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'yellow': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'red': return <XCircle className="w-4 h-4 text-red-400" />
      case 'grey': return <Clock className="w-4 h-4 text-gray-400" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return 'text-green-400'
      case 'yellow': return 'text-yellow-400'
      case 'red': return 'text-red-400'
      case 'grey': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  // Notification helper functions
  const showNotificationModal = (message, type = 'success') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)
  }

  const handleNotificationModalClose = () => {
    setShowNotification(false)
    setNotificationMessage('')
  }

  // Button handlers
  const handleViewDetails = () => {
    setShowViewDetails(true)
  }

  const handleExportData = () => {
    setShowExportData(true)
  }

  const handleConfigure = () => {
    setShowConfigure(true)
  }

  // Tree structure data
  const treeData = {
    id: 'root',
    name: 'Kamioi Core Engine',
    icon: TreePine,
    status: 'green',
    children: [
      {
        id: 'transactions',
        name: 'Transactions',
        icon: DollarSign,
        status: 'green',
        children: [
          { id: 'csv-parser', name: 'CSV Upload Parser', status: 'green' },
          { id: 'roundup-math', name: 'Round-Up Math Engine', status: 'green' },
          { id: 'transaction-staging', name: 'Transaction Staging', status: 'green' },
          { id: 'investment-processing', name: 'Investment Processing', status: 'yellow' }
        ]
      },
      {
        id: 'llm-mapping',
        name: 'LLM Mapping',
        icon: Brain,
        status: 'green',
        children: [
          { id: 'ml-dashboard', name: 'ML Dashboard', status: 'green' },
          { id: 'ai-confidence', name: 'AI Confidence Scoring', status: 'green' },
          { id: 'merchant-recognition', name: 'Merchant Recognition', status: 'green' },
          { id: 'category-mapping', name: 'Category Mapping', status: 'yellow' },
          { id: 'manual-override', name: 'Manual Override Queue', status: 'green' }
        ]
      },
      {
        id: 'user-dashboards',
        name: 'User & Family Dashboards',
        icon: Users,
        status: 'green',
        children: [
          { id: 'user-portfolio', name: 'User Portfolio', status: 'green' },
          { id: 'family-goals', name: 'Family Goals', status: 'green' },
          { id: 'roundup-settings', name: 'Round-Up Settings', status: 'green' },
          { id: 'investment-history', name: 'Investment History', status: 'green' }
        ]
      },
      {
        id: 'financials',
        name: 'Financial Analytics',
        icon: TrendingUp,
        status: 'green',
        children: [
          { id: 'revenue-tracking', name: 'Revenue Tracking', status: 'green' },
          { id: 'cost-analysis', name: 'Cost Analysis', status: 'green' },
          { id: 'profit-loss', name: 'P&L Generation', status: 'green' },
          { id: 'expense-categorization', name: 'Expense Categorization', status: 'green' }
        ]
      },
      {
        id: 'crm-notifications',
        name: 'CRM & Notifications',
        icon: Bell,
        status: 'green',
        children: [
          { id: 'onboarding-funnel', name: 'Onboarding Funnel', status: 'green' },
          { id: 'notification-delivery', name: 'Notification Delivery', status: 'green' },
          { id: 'engagement-tracking', name: 'Engagement Tracking', status: 'green' },
          { id: 'support-tickets', name: 'Support Tickets', status: 'yellow' }
        ]
      },
      {
        id: 'feature-flags',
        name: 'Feature Flags',
        icon: Flag,
        status: 'green',
        children: [
          { id: 'user-features', name: 'User Features', status: 'green' },
          { id: 'family-features', name: 'Family Features', status: 'green' },
          { id: 'admin-features', name: 'Admin Features', status: 'green' },
          { id: 'experimental-features', name: 'Experimental Features', status: 'grey' }
        ]
      },
      {
        id: 'ads-badges',
        name: 'Ads & Badges',
        icon: Award,
        status: 'green',
        children: [
          { id: 'badge-system', name: 'Badge System', status: 'green' },
          { id: 'ad-campaigns', name: 'Ad Campaigns', status: 'green' },
          { id: 'gamification', name: 'Gamification Engine', status: 'green' },
          { id: 'reward-system', name: 'Reward System', status: 'green' }
        ]
      },
      {
        id: 'infrastructure',
        name: 'Infrastructure Health',
        icon: Server,
        status: 'yellow',
        children: [
          { id: 'database-health', name: 'Database Health', status: 'green' },
          { id: 'api-health', name: 'API Health', status: 'yellow' },
          { id: 'server-health', name: 'Server Health', status: 'green' },
          { id: 'monitoring', name: 'System Monitoring', status: 'green' }
        ]
      }
    ]
  }

  const fetchSystemData = async () => {
    try {
      setLoading(true)
      // Simulate API calls to get real system data
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/system-health`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSystemData(data)
      } else {
        // Use mock data if API is not available
        setSystemData(systemHealth)
      }
    } catch (error) {
      console.error('Failed to fetch system data:', error)
      setSystemData(systemHealth)
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  useEffect(() => {
    fetchSystemData()
    const interval = setInterval(fetchSystemData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderTreeNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const IconComponent = node.icon

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all hover:bg-white/5 ${
            selectedNode?.id === node.id ? 'bg-blue-500/20' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => {
            setSelectedNode(node)
            if (hasChildren) {
              toggleNode(node.id)
            }
          }}
        >
          {hasChildren && (
            <div className="mr-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-4 mr-2" />}
          
          <div className="flex items-center space-x-3 flex-1">
            {IconComponent ? <IconComponent className="w-5 h-5 text-blue-400" /> : <TreePine className="w-5 h-5 text-blue-400" />}
            <span className={`${getTextClass()} font-medium`}>{node.name}</span>
            {getStatusIcon(node.status)}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderNodeDetails = () => {
    if (!selectedNode) return null

    return (
      <div className={getCardClass()}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            {selectedNode.icon ? <selectedNode.icon className="w-6 h-6 text-blue-400" /> : <TreePine className="w-6 h-6 text-blue-400" />}
            <h3 className={`text-xl font-semibold ${getTextClass()}`}>{selectedNode.name}</h3>
            {getStatusIcon(selectedNode.status)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* System Health Metrics */}
            {selectedNode.id === 'infrastructure' && (
              <>
                <div className="space-y-2">
                  <h4 className={`font-medium ${getTextClass()}`}>Server Uptime</h4>
                  <div className="text-2xl font-bold text-green-400">
                    {formatPercentage(systemHealth.infrastructure.serverUptime)}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium ${getTextClass()}`}>Avg Response Time</h4>
                  <div className="text-2xl font-bold text-blue-400">
                    {systemHealth.infrastructure.avgResponseTime}ms
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium ${getTextClass()}`}>Error Logs (24h)</h4>
                  <div className="text-2xl font-bold text-red-400">
                    {formatNumber(systemHealth.infrastructure.errorLogs24h)}
                  </div>
                </div>
              </>
            )}
            
            {/* Transaction Metrics */}
            {selectedNode.id === 'transactions' && (
              <>
                <div className="space-y-2">
                  <h4 className={`font-medium ${getTextClass()}`}>Success Rate</h4>
                  <div className="text-2xl font-bold text-green-400">
                    {formatPercentage(systemHealth.coreEngine.roundUpSuccess)}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium ${getTextClass()}`}>Avg Processing Time</h4>
                  <div className="text-2xl font-bold text-blue-400">
                    {systemHealth.coreEngine.avgProcessingTime}s
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium ${getTextClass()}`}>Failed Transactions</h4>
                  <div className="text-2xl font-bold text-red-400">
                    {formatNumber(systemHealth.coreEngine.failedTransactions)}
                  </div>
                </div>
              </>
            )}
            
            {/* Database Metrics */}
            {selectedNode.id === 'database-health' && (
              <>
                <div className="space-y-2">
                  <h4 className={`font-medium ${getTextClass()}`}>MongoDB Latency</h4>
                  <div className="text-2xl font-bold text-green-400">
                    {systemHealth.database.mongoLatency}ms
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium ${getTextClass()}`}>Redis Hit Rate</h4>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatPercentage(systemHealth.database.redisHitRate)}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={`font-medium ${getTextClass()}`}>Active Connections</h4>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatNumber(systemHealth.database.connections)}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button 
              onClick={handleViewDetails}
              className={`${showViewDetails ? 'bg-blue-500/40 border-blue-500/50' : 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30'} border rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all`}
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            <button 
              onClick={handleExportData}
              className={`${showExportData ? 'bg-green-500/40 border-green-500/50' : 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30'} border rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all`}
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            <button 
              onClick={handleConfigure}
              className={`${showConfigure ? 'bg-purple-500/40 border-purple-500/50' : 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30'} border rounded-lg px-4 py-2 text-purple-400 flex items-center space-x-2 transition-all`}
            >
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </button>
          </div>

          {/* Inline Details Section */}
          {showViewDetails && (
            <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-semibold ${getTextClass()}`}>System Details - {selectedNode?.name}</h4>
                <button 
                  onClick={() => setShowViewDetails(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* System Health Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <h5 className={`font-medium ${getTextClass()} mb-1 text-sm`}>Status</h5>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedNode?.status)}
                      <span className={`${getTextClass()} capitalize text-sm`}>{selectedNode?.status}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <h5 className={`font-medium ${getTextClass()} mb-1 text-sm`}>Last Updated</h5>
                    <span className={`${getSubtextClass()} text-sm`}>{lastUpdated.toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Key Metrics */}
                {selectedNode?.id === 'infrastructure' && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className={`font-medium ${getTextClass()} mb-3 text-sm`}>Infrastructure Performance</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className={`${getSubtextClass()} text-xs`}>Server Uptime</p>
                        <p className={`${getTextClass()} font-semibold`}>{formatPercentage(systemHealth.infrastructure.serverUptime)}</p>
                      </div>
                      <div>
                        <p className={`${getSubtextClass()} text-xs`}>Avg Response Time</p>
                        <p className={`${getTextClass()} font-semibold`}>{systemHealth.infrastructure.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className={`${getSubtextClass()} text-xs`}>Error Logs (24h)</p>
                        <p className={`${getTextClass()} font-semibold`}>{formatNumber(systemHealth.infrastructure.errorLogs24h)}</p>
                      </div>
                      <div>
                        <p className={`${getSubtextClass()} text-xs`}>Load Balancer Traffic</p>
                        <p className={`${getTextClass()} font-semibold`}>{formatNumber(systemHealth.infrastructure.loadBalancerTraffic)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode?.id === 'api-health' && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className={`font-medium ${getTextClass()} mb-3 text-sm`}>API Performance</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className={`${getSubtextClass()} text-xs`}>Plaid</p>
                        <p className={`${getTextClass()} font-semibold`}>{systemHealth.apis.plaidResponse}ms</p>
                      </div>
                      <div>
                        <p className={`${getSubtextClass()} text-xs`}>Stripe</p>
                        <p className={`${getTextClass()} font-semibold`}>{systemHealth.apis.stripeResponse}ms</p>
                      </div>
                      <div>
                        <p className={`${getSubtextClass()} text-xs`}>Alpaca</p>
                        <p className={`${getTextClass()} font-semibold`}>{systemHealth.apis.alpacaResponse}ms</p>
                      </div>
                      <div>
                        <p className={`${getSubtextClass()} text-xs`}>Yahoo</p>
                        <p className={`${getTextClass()} font-semibold`}>{systemHealth.apis.yahooResponse}ms</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className={`font-medium ${getTextClass()} mb-3 text-sm`}>Recent Activity</h5>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    <div className={`${getSubtextClass()} text-xs`}>System health check completed</div>
                    <div className={`${getSubtextClass()} text-xs`}>API response time: {systemHealth.apis.rateUsage}% rate limit</div>
                    <div className={`${getSubtextClass()} text-xs`}>Database connections: {systemHealth.database.connections} active</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inline Export Data Section */}
          {showExportData && (
            <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-semibold ${getTextClass()}`}>Export System Data</h4>
                <button 
                  onClick={() => setShowExportData(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block ${getSubtextClass()} text-sm mb-2`}>Export Format</label>
                  <select className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg ${getTextClass()} focus:outline-none focus:border-green-500/50`}>
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="xml">XML</option>
                    <option value="pdf">PDF Report</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block ${getSubtextClass()} text-sm mb-2`}>Data Range</label>
                  <select className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg ${getTextClass()} focus:outline-none focus:border-green-500/50`}>
                    <option value="last-hour">Last Hour</option>
                    <option value="last-day">Last 24 Hours</option>
                    <option value="last-week">Last 7 Days</option>
                    <option value="last-month">Last 30 Days</option>
                    <option value="all">All Data</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block ${getSubtextClass()} text-sm mb-2`}>Include</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500" />
                      <span className={getSubtextClass()}>System Health Metrics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500" />
                      <span className={getSubtextClass()}>Performance Data</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500" />
                      <span className={getSubtextClass()}>Error Logs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500" />
                      <span className={getSubtextClass()}>Configuration Settings</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button 
                  onClick={() => setShowExportData(false)}
                  className={`flex-1 bg-white/10 hover:bg-white/20 border border-white/20 ${getTextClass()} py-2 px-4 rounded-lg transition-all`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    showNotificationModal('Data export started! You will receive an email when ready.', 'success')
                    setShowExportData(false)
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all"
                >
                  Export Data
                </button>
              </div>
            </div>
          )}

          {/* Inline Configure Section */}
          {showConfigure && (
            <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-semibold ${getTextClass()}`}>Configure {selectedNode?.name}</h4>
                <button 
                  onClick={() => setShowConfigure(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block ${getSubtextClass()} text-sm mb-2`}>Health Check Interval</label>
                  <select className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg ${getTextClass()} focus:outline-none focus:border-purple-500/50`}>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                    <option value="900">15 minutes</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block ${getSubtextClass()} text-sm mb-2`}>Alert Thresholds</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block ${getSubtextClass()} text-xs mb-1`}>Warning Threshold (ms)</label>
                      <input
                        type="number"
                        defaultValue="1000"
                        className={`w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg ${getTextClass()} focus:outline-none focus:border-purple-500/50`}
                      />
                    </div>
                    <div>
                      <label className={`block ${getSubtextClass()} text-xs mb-1`}>Error Threshold (ms)</label>
                      <input
                        type="number"
                        defaultValue="5001"
                        className={`w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg ${getTextClass()} focus:outline-none focus:border-purple-500/50`}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className={`block ${getSubtextClass()} text-sm mb-2`}>Notifications</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={getSubtextClass()}>Email Alerts</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={getSubtextClass()}>SMS Alerts</span>
                      <input type="checkbox" className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={getSubtextClass()}>Dashboard Notifications</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className={`block ${getSubtextClass()} text-sm mb-2`}>Auto-Recovery</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={getSubtextClass()}>Enable Auto-Restart</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={getSubtextClass()}>Max Restart Attempts</span>
                      <input
                        type="number"
                        defaultValue="3"
                        min="1"
                        max="10"
                        className={`w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg ${getTextClass()} focus:outline-none focus:border-purple-500/50`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button 
                  onClick={() => setShowConfigure(false)}
                  className={`flex-1 bg-white/10 hover:bg-white/20 border border-white/20 ${getTextClass()} py-2 px-4 rounded-lg transition-all`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    showNotificationModal('Configuration saved successfully!', 'success')
                    setShowConfigure(false)
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-all"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className={`${getTextClass()}`}>Loading system health data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <TreePine className="w-8 h-8 text-green-400" />
            <span>Kamioi Admin Dashboard Tree</span>
          </h1>
          <p className="text-gray-400 mt-1">Mission Control Panel - System Health Overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchSystemData}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className={getCardClass()}>
        <div className="p-4">
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-3`}>Status Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className={getSubtextClass()}>Healthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className={getSubtextClass()}>Warning/Latency</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className={getSubtextClass()}>Failed/Error</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className={getSubtextClass()}>Disabled by Feature Flag</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tree Structure */}
        <div className={getCardClass()}>
          <div className="p-6">
            <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>System Tree Structure</h3>
            <div className="space-y-1">
              {renderTreeNode(treeData)}
            </div>
          </div>
        </div>

        {/* Node Details */}
        <div>
          {selectedNode ? (
            renderNodeDetails()
          ) : (
            <div className={getCardClass()}>
              <div className="p-6 text-center">
                <TreePine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className={`text-lg font-semibold ${getTextClass()} mb-2`}>Select a Node</h3>
                <p className={getSubtextClass()}>Click on any node in the tree to view detailed metrics and controls</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={getCardClass()}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-sm ${getSubtextClass()}`}>Core Engine</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>
                  {formatPercentage(systemHealth.coreEngine.roundUpSuccess)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-xs text-gray-400">Round-up success rate</p>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-sm ${getSubtextClass()}`}>Database</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>
                  {systemHealth.database.mongoLatency}ms
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-xs text-gray-400">MongoDB latency</p>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-sm ${getSubtextClass()}`}>API Health</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>
                  {formatPercentage(systemHealth.apis.rateUsage)}
                </p>
              </div>
              <Globe className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-xs text-gray-400">Rate limit usage</p>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-sm ${getSubtextClass()}`}>Infrastructure</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>
                  {formatPercentage(systemHealth.infrastructure.serverUptime)}
                </p>
              </div>
              <Server className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-xs text-gray-400">Server uptime</p>
          </div>
        </div>
      </div>



      {/* Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                notificationType === 'success' ? 'bg-green-500/20' : 
                notificationType === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20'
              }`}>
                {notificationType === 'success' ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : notificationType === 'error' ? (
                  <XCircle className="w-8 h-8 text-red-400" />
                ) : (
                  <Settings className="w-8 h-8 text-blue-400" />
                )}
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">
                {notificationType === 'success' ? 'Success!' : 
                 notificationType === 'error' ? 'Error!' : 'Info'}
              </h3>
              <p className="text-gray-300 mb-6">{notificationMessage}</p>
              <button 
                onClick={handleNotificationModalClose}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardTree
