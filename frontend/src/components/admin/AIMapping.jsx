import React, { useState } from 'react'
import { Brain, Upload, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

const AIMapping = () => {
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')

  const mappingQueue = [
    {
      id: 1,
      merchant: 'Local Coffee Shop',
      transaction: 'Coffee Purchase',
      suggestedTicker: 'SBUX',
      confidence: 65,
      status: 'pending',
      date: '2024-01-24'
    },
    {
      id: 2,
      merchant: 'Tech Gadgets Inc',
      transaction: 'Electronics Purchase',
      suggestedTicker: 'AAPL',
      confidence: 42,
      status: 'pending',
      date: '2024-01-24'
    },
    {
      id: 3,
      merchant: 'Fitness World',
      transaction: 'Gym Membership',
      suggestedTicker: 'PLNT',
      confidence: 78,
      status: 'pending',
      date: '2024-01-23'
    },
    {
      id: 4,
      merchant: 'Book Haven',
      transaction: 'Book Purchase',
      suggestedTicker: 'AMZN',
      confidence: 88,
      status: 'completed',
      date: '2024-01-22'
    }
  ]

  const modelMetrics = {
    accuracy: 92.4,
    precision: 89.7,
    recall: 94.2,
    trainingData: '15,432 samples',
    lastTraining: '2024-01-20'
  }

  const filteredMappings = mappingQueue.filter(item =>
    item.merchant.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeTab === 'all' || item.status === activeTab)
  )

  const approveMapping = (id) => {
    addNotification({
      type: 'success',
      title: 'Mapping Approved',
      message: `Mapping ${id} approved and added to training data!`,
      timestamp: new Date()
    })
  }

  const rejectMapping = (id) => {
    addNotification({
      type: 'info',
      title: 'Mapping Rejected',
      message: `Mapping ${id} rejected and sent for review!`,
      timestamp: new Date()
    })
  }

  const uploadTrainingData = () => {
    addNotification({
      type: 'info',
      title: 'Upload Training Data',
      message: 'Training data upload dialog opened!',
      timestamp: new Date()
    })
  }

  return (
    <div className="space-y-6">
      {/* AI Mapping Header */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Brain className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Model Training</h2>
            <p className="text-gray-300">Manage merchant-to-stock mappings and model performance</p>
          </div>
        </div>

        {/* Model Performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{modelMetrics.accuracy}%</div>
            <div className="text-gray-400 text-sm">Accuracy</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{modelMetrics.precision}%</div>
            <div className="text-gray-400 text-sm">Precision</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{modelMetrics.recall}%</div>
            <div className="text-gray-400 text-sm">Recall</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{modelMetrics.trainingData}</div>
            <div className="text-gray-400 text-sm">Training Data</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={uploadTrainingData}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Training Data</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            <Brain className="w-4 h-4" />
            <span>Retrain Model</span>
          </button>
        </div>

        {/* Mapping Queue Tabs */}
        <div className="flex space-x-4 mb-4">
          {['pending', 'completed', 'all'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab} Mappings
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Mapping Queue */}
        <div className="space-y-3">
          {filteredMappings.map(mapping => (
            <div key={mapping.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-white font-medium">{mapping.merchant}</span>
                  <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-sm">
                    {mapping.transaction}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-400">Suggested: <span className="text-white font-mono">{mapping.suggestedTicker}</span></span>
                  <span className="text-gray-400">Confidence: 
                    <span className={
                      mapping.confidence > 75 ? 'text-green-400' :
                      mapping.confidence > 50 ? 'text-yellow-400' : 'text-red-400'
                    }> {mapping.confidence}%</span>
                  </span>
                  <span className="text-gray-400">Date: {mapping.date}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {mapping.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => approveMapping(mapping.id)}
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => rejectMapping(mapping.id)}
                      className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                {mapping.status === 'completed' && (
                  <span className="flex items-center space-x-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Approved</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Training Status */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white mb-1">Model Training Status</h4>
              <p className="text-gray-300 text-sm">Last trained: {modelMetrics.lastTraining}</p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">Scheduled: Daily at 2:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIMapping
