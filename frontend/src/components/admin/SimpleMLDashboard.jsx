import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  Eye, 
  Lightbulb, 
  Target, 
  BarChart3, 
  RefreshCw, 
  Play, 
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const SimpleMLDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  
  // Stats state
  const [stats, setStats] = useState({
    model_version: 'N/A',
    total_patterns: 0,
    accuracy_rate: '0%',
    learning_rate: '0',
    status: 'offline'
  })
  
  // Recognition state
  const [recognitionQuery, setRecognitionQuery] = useState('')
  const [recognitionResults, setRecognitionResults] = useState([])
  
  // Learning state
  const [learnForm, setLearnForm] = useState({
    merchant: '',
    ticker: '',
    category: '',
    confidence: 0.95
  })
  
  // Feedback state
  const [feedbackForm, setFeedbackForm] = useState({
    merchant: '',
    ticker: '',
    wasCorrect: true,
    userConfidence: 0.5
  })

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'}/api/ml`

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5001)
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/stats`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
        console.log('ML Stats loaded:', data.data)
      } else {
        showNotification('Failed to load ML statistics', 'error')
      }
    } catch (error) {
      console.error('❌ ML Stats error:', error)
      showNotification('Failed to load ML statistics', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRecognition = async () => {
    if (!recognitionQuery.trim()) {
      showNotification('Please enter a merchant name', 'error')
      return
    }
    
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant: recognitionQuery })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRecognitionResults(data.data.matches)
        showNotification(`Found ${data.data.total_matches} matches`, 'success')
      } else {
        showNotification(data.error, 'error')
      }
    } catch (error) {
      console.error('❌ Recognition error:', error)
      showNotification('Recognition test failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLearn = async () => {
    if (!learnForm.merchant || !learnForm.ticker || !learnForm.category) {
      showNotification('Please fill all required fields', 'error')
      return
    }
    
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/learn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(learnForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        showNotification('Pattern learned successfully!', 'success')
        setLearnForm({ merchant: '', ticker: '', category: '', confidence: 0.95 })
        fetchStats() // Refresh stats
      } else {
        showNotification(data.error, 'error')
      }
    } catch (error) {
      console.error('❌ Learn error:', error)
      showNotification('Failed to learn pattern', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async () => {
    if (!feedbackForm.merchant || !feedbackForm.ticker) {
      showNotification('Please fill all required fields', 'error')
      return
    }
    
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        showNotification('Feedback submitted successfully!', 'success')
        setFeedbackForm({ merchant: '', ticker: '', wasCorrect: true, userConfidence: 0.5 })
        fetchStats() // Refresh stats
      } else {
        showNotification(data.error, 'error')
      }
    } catch (error) {
      console.error('❌ Feedback error:', error)
      showNotification('Failed to submit feedback', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRetrain = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/retrain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (data.success) {
        showNotification('Model retraining completed!', 'success')
        fetchStats() // Refresh stats
      } else {
        showNotification(data.error, 'error')
      }
    } catch (error) {
      console.error('❌ Retrain error:', error)
      showNotification('Failed to retrain model', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/export`)
      const data = await response.json()
      
      if (data.success) {
        showNotification(`Exported ${data.data.total_patterns} patterns`, 'success')
        // In a real app, you'd trigger a download here
        console.log('Export data:', data.data)
      } else {
        showNotification(data.error, 'error')
      }
    } catch (error) {
      console.error('❌ Export error:', error)
      showNotification('Failed to export model', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'recognition', label: 'Test Recognition', icon: Eye },
    { id: 'learn', label: 'Learn Patterns', icon: Lightbulb },
    { id: 'feedback', label: 'Feedback', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">ML System Dashboard</h1>
            <p className="text-gray-400 mt-2">Advanced machine learning merchant recognition system</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleRetrain}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Retrain Model</span>
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-1 p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Model Version</p>
                  <p className="text-2xl font-bold text-white">{stats.model_version}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-600 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Patterns</p>
                  <p className="text-2xl font-bold text-white">{stats.total_patterns}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-600 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Accuracy Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.accuracy_rate}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Learning Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.learning_rate}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recognition Tab */}
        {activeTab === 'recognition' && (
          <div className="max-w-2xl">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Test Recognition</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    value={recognitionQuery}
                    onChange={(e) => setRecognitionQuery(e.target.value)}
                    placeholder="Enter merchant name (e.g., STARBUCKS)"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleRecognition}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test Recognition'}
                </button>
              </div>
              
              {recognitionResults.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">Recognition Results</h4>
                  <div className="space-y-2">
                    {recognitionResults.map((result, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-white">{result.merchant_name}</p>
                            <p className="text-gray-400">Ticker: {result.ticker}</p>
                            <p className="text-gray-400">Category: {result.category}</p>
                          </div>
                          <span className="text-green-400 font-semibold">
                            {result.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="max-w-2xl">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Learn New Pattern</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Merchant Name *
                  </label>
                  <input
                    type="text"
                    value={learnForm.merchant}
                    onChange={(e) => setLearnForm({...learnForm, merchant: e.target.value})}
                    placeholder="e.g., MCDONALDS"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ticker Symbol *
                  </label>
                  <input
                    type="text"
                    value={learnForm.ticker}
                    onChange={(e) => setLearnForm({...learnForm, ticker: e.target.value})}
                    placeholder="e.g., MCD"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={learnForm.category}
                    onChange={(e) => setLearnForm({...learnForm, category: e.target.value})}
                    placeholder="e.g., Food & Dining"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confidence: {Math.round(learnForm.confidence * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={learnForm.confidence}
                    onChange={(e) => setLearnForm({...learnForm, confidence: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={handleLearn}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Learning...' : 'Learn Pattern'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="max-w-2xl">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Submit Feedback</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Merchant Name *
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.merchant}
                    onChange={(e) => setFeedbackForm({...feedbackForm, merchant: e.target.value})}
                    placeholder="e.g., STARBUCKS"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ticker Symbol *
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.ticker}
                    onChange={(e) => setFeedbackForm({...feedbackForm, ticker: e.target.value})}
                    placeholder="e.g., SBUX"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Was the prediction correct?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={feedbackForm.wasCorrect}
                        onChange={() => setFeedbackForm({...feedbackForm, wasCorrect: true})}
                        className="mr-2"
                      />
                      <span className="text-green-400">Correct</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!feedbackForm.wasCorrect}
                        onChange={() => setFeedbackForm({...feedbackForm, wasCorrect: false})}
                        className="mr-2"
                      />
                      <span className="text-red-400">Incorrect</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Confidence: {Math.round(feedbackForm.userConfidence * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={feedbackForm.userConfidence}
                    onChange={(e) => setFeedbackForm({...feedbackForm, userConfidence: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={handleFeedback}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Model Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Mappings:</span>
                  <span className="text-white font-semibold">{stats.total_mappings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Approved Mappings:</span>
                  <span className="text-green-400 font-semibold">{stats.approved_mappings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pending Mappings:</span>
                  <span className="text-yellow-400 font-semibold">{stats.pending_mappings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Confidence:</span>
                  <span className="text-blue-400 font-semibold">{stats.average_confidence?.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${stats.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-400">Model Status:</span>
                  <span className="text-white font-semibold capitalize">{stats.status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Database:</span>
                  <span className="text-white font-semibold">Connected</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">API:</span>
                  <span className="text-white font-semibold">Online</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-600' :
            notification.type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <XCircle className="w-5 h-5" />}
              {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span className="text-white font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleMLDashboard
