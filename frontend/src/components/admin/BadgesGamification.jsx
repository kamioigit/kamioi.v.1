import React, { useState, useEffect } from 'react'
import { Image, Plus, Search, Star, Award, Target, TrendingUp, Users, Settings, Upload, BarChart3, Trash2, User, X, Info, Edit } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

const BadgesGamification = ({ user }) => {
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('definitions')
  const [searchTerm, setSearchTerm] = useState('')
  const [badges, setBadges] = useState([])
  const [awardQueue, setAwardQueue] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal states
  const [showCreateBadge, setShowCreateBadge] = useState(false)
  const [showCreateCriteria, setShowCreateCriteria] = useState(false)
  const [showAutoAwardSettings, setShowAutoAwardSettings] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success')

  // Fetch badges and gamification data with AbortController
  useEffect(() => {
    const abortController = new AbortController()
    fetchBadgesData(abortController.signal)
    
    return () => {
      abortController.abort()
    }
  }, [])

  const fetchBadgesData = async (signal = null) => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/badges`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        },
        signal
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setBadges(result.data.badges)
          setAwardQueue(result.data.awardQueue)
          setAnalytics(result.data.analytics)
        }
      }
      if (!signal?.aborted) {
        // Dispatch page load completion event for Loading Report
        window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
          detail: { pageId: 'badges' }
        }))
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching badges data:', error)
        setError('Failed to fetch badges data')
        // Still dispatch completion event even on error
        if (!signal?.aborted) {
          window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
            detail: { pageId: 'badges' }
          }))
        }
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  const handleCreateBadge = async (badgeData) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/badges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        },
        body: JSON.stringify(badgeData)
      })
      
      if (response.ok) {
        // Refresh badges data
        fetchBadgesData()
      }
    } catch (error) {
      console.error('Error creating badge:', error)
    }
  }

  const handleEditBadge = async (badgeId, badgeData) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/badges/${badgeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        },
        body: JSON.stringify(badgeData)
      })
      
      if (response.ok) {
        // Refresh badges data
        fetchBadgesData()
      }
    } catch (error) {
      console.error('Error editing badge:', error)
    }
  }

  const handleApproveAward = async (awardId) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/badges/award-queue/${awardId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })
      
      if (response.ok) {
        // Refresh badges data
        fetchBadgesData()
      }
    } catch (error) {
      console.error('Error approving award:', error)
    }
  }

  const handleAutoAwardToggle = async (badgeId, autoAward) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/badges/${badgeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        },
        body: JSON.stringify({ autoAward })
      })
      
      if (response.ok) {
        // Refresh badges data
        fetchBadgesData()
      }
    } catch (error) {
      console.error('Error toggling auto-award:', error)
    }
  }

  // Notification helper functions
  const displayNotificationModal = (message, type = 'success') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)
  }

  // Alias used in various buttons to trigger notifications
  const showNotificationModal = (message, type = 'success') => displayNotificationModal(message, type)

  const handleNotificationModalClose = () => {
    setShowNotification(false)
    setNotificationMessage('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-white">Loading badges and gamification data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 text-red-400 mx-auto mb-4">⚠️</div>
          <h3 className="text-white text-xl font-semibold mb-2">Error Loading Badges Data</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null)
              fetchBadgesData()
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Badges & Gamification</h2>
            <p className="text-gray-300">Manage badges, achievements, and gamification features</p>
          </div>
        </div>

        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'definitions', label: 'Definitions' },
            { id: 'criteria', label: 'Criteria Builder' },
            { id: 'award_queue', label: 'Award Queue' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'assets', label: 'Assets' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'definitions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Badge Definitions</h3>
              <p className="text-gray-300">Manage badge catalog and criteria</p>
            </div>
            <button 
              onClick={() => setShowCreateBadge(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Badge</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search badges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="glass-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-3 text-gray-400 font-medium">Badge</th>
                    <th className="text-left pb-3 text-gray-400 font-medium">Description</th>
                    <th className="text-left pb-3 text-gray-400 font-medium">Criteria</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Unlocks</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Engagement</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Status</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {badges.map(badge => (
                    <tr key={badge.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <div className="font-medium">{badge.name}</div>
                            <div className="text-gray-400 text-sm">ID: {badge.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">{badge.description}</td>
                      <td className="py-3 px-4 text-white text-sm">{typeof badge.criteria === 'object' ? JSON.stringify(badge.criteria) : badge.criteria || 'No criteria'}</td>
                      <td className="py-3 px-4 text-center text-white">{(badge.unlocks || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-center text-white">{badge.engagement || 0}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          badge.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {badge.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-1">
                          <button 
                            onClick={() => addNotification({
                              type: 'info',
                              title: 'View Analytics',
                              message: `View analytics for ${badge.name}`,
                              timestamp: new Date()
                            })}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditBadge(badge.id)}
                            className="text-yellow-400 hover:text-yellow-300 p-1"
                            title="Edit Badge"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => addNotification({
                              type: 'info',
                              title: 'Delete Badge',
                              message: `Delete badge ${badge.id}`,
                              timestamp: new Date()
                            })}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete Badge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'criteria' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Criteria Builder</h3>
              <p className="text-gray-300">Build complex badge criteria with visual conditions</p>
            </div>
            <button 
              onClick={() => setShowCreateCriteria(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Criteria</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Criteria Builder */}
            <div className="glass-card p-6">
              <h4 className="text-white font-medium mb-4">Visual Criteria Builder</h4>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white text-sm font-medium mb-3">Condition Group</h5>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <select className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>AND</option>
                        <option>OR</option>
                      </select>
                      <span className="text-gray-400 text-sm">All conditions must be met</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                        <select className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                          <option>Investment Count</option>
                          <option>Total Amount</option>
                          <option>Days Active</option>
                          <option>Portfolio Value</option>
                          <option>Round-up Count</option>
                        </select>
                        <select className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                          <option>Greater than</option>
                          <option>Less than</option>
                          <option>Equals</option>
                          <option>Between</option>
                        </select>
                        <input 
                          type="number" 
                          placeholder="10"
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm w-20"
                        />
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                        <select className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                          <option>Portfolio Value</option>
                          <option>Investment Count</option>
                          <option>Total Amount</option>
                          <option>Days Active</option>
                          <option>Round-up Count</option>
                        </select>
                        <select className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                          <option>Greater than</option>
                          <option>Less than</option>
                          <option>Equals</option>
                          <option>Between</option>
                        </select>
                        <input 
                          type="number" 
                          placeholder="1000"
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm w-20"
                        />
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 transition-all text-sm">
                      + Add Condition
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white text-sm font-medium mb-3">Time Constraints</h5>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <label className="text-gray-400 text-sm">Time Period:</label>
                      <select className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>Last year</option>
                        <option>All time</option>
                        <option>Custom range</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="text-gray-400 text-sm">Frequency:</label>
                      <select className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>One-time</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Continuous</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 transition-all">
                    Test Criteria
                  </button>
                  <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 transition-all">
                    Save Criteria
                  </button>
                </div>
              </div>
            </div>

            {/* Criteria Templates */}
            <div className="glass-card p-6">
              <h4 className="text-white font-medium mb-4">Criteria Templates</h4>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white text-sm font-medium mb-2">Investment Milestones</h5>
                  <p className="text-gray-400 text-xs mb-3">Pre-built criteria for investment achievements</p>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      First Investment (≥1 transaction)
                    </button>
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Consistent Saver (≥10 transactions in 30 days)
                    </button>
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Big Spender (≥$100 total invested)
                    </button>
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Diversified Investor (≥3 different sectors)
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white text-sm font-medium mb-2">Engagement Milestones</h5>
                  <p className="text-gray-400 text-xs mb-3">User engagement and activity criteria</p>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Active User (≥7 days active)
                    </button>
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Goal Setter (≥1 investment goal created)
                    </button>
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Social Sharer (≥1 share action)
                    </button>
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Feature Explorer (≥3 features used)
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white text-sm font-medium mb-2">Time-based Milestones</h5>
                  <p className="text-gray-400 text-xs mb-3">Achievements based on time periods</p>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Week Warrior (7 consecutive days)
                    </button>
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Monthly Master (30 days active)
                    </button>
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Year Veteran (365 days active)
                    </button>
                    <button className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded text-white text-sm transition-colors">
                      Streak Keeper (≥5 day streak)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Preview */}
          <div className="glass-card p-6">
            <h4 className="text-white font-medium mb-4">Criteria Preview</h4>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">IF</span>
                <span className="text-white">(Investment Count ≥ 10)</span>
                <span className="text-gray-400">AND</span>
                <span className="text-white">(Portfolio Value ≥ $1000)</span>
                <span className="text-gray-400">AND</span>
                <span className="text-white">(Days Active ≥ 30)</span>
                <span className="text-gray-400">THEN</span>
                <span className="text-green-400 font-medium">Award Badge</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Time Period: Last 90 days | Frequency: One-time | Estimated Users: 0
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'award_queue' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Award Queue</h3>
              <p className="text-gray-300">Pending badge awards and approvals</p>
            </div>
            <button 
              onClick={() => setShowAutoAwardSettings(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>Toggle Auto-Award</span>
            </button>
          </div>

          <div className="glass-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-3 text-gray-400 font-medium">User ID</th>
                    <th className="text-left pb-3 text-gray-400 font-medium">Badge</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left pb-3 text-gray-400 font-medium">Created At</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(awardQueue || []).map(award => (
                    <tr key={award.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white font-mono text-sm">{award.userId}</td>
                      <td className="py-3 px-4 text-white">{award.badgeName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          award.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {award.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white text-sm">{award.createdAt}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-1">
                          <button 
                            onClick={() => handleApproveAward(award.id)}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Approve Award"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => addNotification({
                              type: 'info',
                              title: 'View Details',
                              message: `View details for ${award.id}`,
                              timestamp: new Date()
                            })}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="View Details"
                          >
                            <Target className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Analytics</h3>
            <p className="text-gray-300">Badge performance and engagement metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Badges</p>
                  <p className="text-2xl font-bold text-white">{analytics?.totalBadges || 0}</p>
                </div>
                <Award className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Awards</p>
                  <p className="text-2xl font-bold text-white">{(analytics?.totalAwards || 0).toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Badges/User</p>
                  <p className="text-2xl font-bold text-white">{analytics?.avgBadgesPerUser || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Engagement Lift</p>
                  <p className="text-2xl font-bold text-white">+{analytics?.engagementLift || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Top Performing Badge</h4>
            <p className="text-gray-300">{analytics?.topPerformingBadge || 'No data'}</p>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Badge Assets</h3>
              <p className="text-gray-300">Manage badge icons, images, and visual assets</p>
            </div>
            <button 
              onClick={() => displayNotificationModal('Asset upload functionality coming soon!', 'info')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Asset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Icon Library */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Icon Library</h4>
                <Image className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {['🏆', '⭐', '🎯', '💎', '🔥', '🚀', '💪', '🎉', '🏅', '👑', '💫', '🌟'].map((icon, index) => (
                    <button
                      key={index}
                      onClick={() => showNotificationModal(`Icon ${icon} selected!`, 'success')}
                      className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-2xl transition-colors"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">Click to select an icon for your badge</p>
              </div>
            </div>

            {/* Upload Area */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Custom Upload</h4>
                <Upload className="w-5 h-5 text-green-400" />
              </div>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Upload custom badge icons</p>
                <p className="text-gray-400 text-sm mb-4">PNG, SVG, JPG up to 2MB</p>
                <button 
                  onClick={() => showNotificationModal('File upload functionality coming soon!', 'info')}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 transition-all"
                >
                  Choose Files
                </button>
              </div>
            </div>

            {/* Asset Management */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Asset Management</h4>
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Assets</span>
                  <span className="text-white">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Storage Used</span>
                  <span className="text-white">0 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Last Updated</span>
                  <span className="text-white">Never</span>
                </div>
                <button 
                  onClick={() => displayNotificationModal('Asset management features coming soon!', 'info')}
                  className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 transition-all"
                >
                  Manage Assets
                </button>
              </div>
            </div>
          </div>

          {/* Asset Preview */}
          <div className="glass-card p-6">
            <h4 className="text-white font-medium mb-4">Asset Preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-gray-300 text-sm">Trophy</p>
                <p className="text-gray-400 text-xs">Default</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⭐</div>
                <p className="text-gray-300 text-sm">Star</p>
                <p className="text-gray-400 text-xs">Default</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-gray-300 text-sm">Target</p>
                <p className="text-gray-400 text-xs">Default</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">💎</div>
                <p className="text-gray-300 text-sm">Diamond</p>
                <p className="text-gray-400 text-xs">Default</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <p className="text-gray-300 text-sm">Fire</p>
                <p className="text-gray-400 text-xs">Default</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🚀</div>
                <p className="text-gray-300 text-sm">Rocket</p>
                <p className="text-gray-400 text-xs">Default</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Badge Modal */}
      {showCreateBadge && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Badge</h3>
              <button 
                onClick={() => setShowCreateBadge(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Badge Name</label>
                <input
                  type="text"
                  placeholder="Enter badge name..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter badge description..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Icon</label>
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                    <option value="🏆">🏆 Trophy</option>
                    <option value="⭐">⭐ Star</option>
                    <option value="🎯">🎯 Target</option>
                    <option value="💎">💎 Diamond</option>
                    <option value="🔥">🔥 Fire</option>
                    <option value="🚀">🚀 Rocket</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Category</label>
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                    <option value="investment">Investment</option>
                    <option value="engagement">Engagement</option>
                    <option value="milestone">Milestone</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Criteria</label>
                <textarea
                  rows={2}
                  placeholder="Define badge criteria..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowCreateBadge(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  displayNotificationModal('Badge created successfully!', 'success')
                  setShowCreateBadge(false)
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Create Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Criteria Modal */}
      {showCreateCriteria && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Criteria</h3>
              <button 
                onClick={() => setShowCreateCriteria(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Criteria Name</label>
                <input
                  type="text"
                  placeholder="Enter criteria name..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Condition Type</label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                  <option value="investment_count">Investment Count</option>
                  <option value="portfolio_value">Portfolio Value</option>
                  <option value="days_active">Days Active</option>
                  <option value="transaction_amount">Transaction Amount</option>
                  <option value="goal_completion">Goal Completion</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Operator</label>
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                    <option value=">=">Greater than or equal</option>
                    <option value=">">Greater than</option>
                    <option value="=">Equal to</option>
                    <option value="<=">Less than or equal</option>
                    <option value="<">Less than</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Value</label>
                  <input
                    type="number"
                    placeholder="Enter value..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Time Period</label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                  <option value="all_time">All Time</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_90_days">Last 90 Days</option>
                  <option value="last_year">Last Year</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowCreateCriteria(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  displayNotificationModal('Criteria created successfully!', 'success')
                  setShowCreateCriteria(false)
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Create Criteria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Award Settings Modal */}
      {showAutoAwardSettings && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Auto-Award Settings</h3>
              <button 
                onClick={() => setShowAutoAwardSettings(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-4">Global Auto-Award Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Enable Auto-Award</span>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Auto-approve awards</span>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Send notifications</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-4">Badge-Specific Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏆</span>
                      <span className="text-white">First Investment</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⭐</span>
                      <span className="text-white">Consistent Saver</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🎯</span>
                      <span className="text-white">Goal Achiever</span>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-4">Award Frequency</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Check Interval</label>
                    <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50">
                      <option value="hourly">Hourly</option>
                      <option value="daily" selected>Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Max Awards per Check</label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowAutoAwardSettings(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  displayNotificationModal('Auto-award settings updated successfully!', 'success')
                  setShowAutoAwardSettings(false)
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <Award className="w-8 h-8 text-green-400" />
                ) : notificationType === 'error' ? (
                  <X className="w-8 h-8 text-red-400" />
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

export default BadgesGamification
