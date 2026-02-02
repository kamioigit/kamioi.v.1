import React, { useState, useEffect } from 'react'
import { Image, Plus, Search, Star, Award, Target, TrendingUp, Users, Settings, Upload, BarChart3, Trash2, User, X, Info, Edit } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { useTheme } from '../../context/ThemeContext'

const BadgesGamification = ({ user }) => {
  const { addNotification } = useNotifications()
  const { isLightMode } = useTheme()
  const [activeTab, setActiveTab] = useState('definitions')
  const [searchTerm, setSearchTerm] = useState('')
  const [badges, setBadges] = useState([])
  const [awardQueue, setAwardQueue] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Theme helper functions
  const getTextClass = () => isLightMode ? 'text-gray-900' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getSecondaryTextClass = () => isLightMode ? 'text-gray-500' : 'text-gray-300'
  const getCardClass = () => isLightMode
    ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm'
    : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'
  const getInnerCardClass = () => isLightMode
    ? 'bg-gray-50 rounded-lg p-4'
    : 'bg-white/5 rounded-lg p-4'
  const getInputClass = () => isLightMode
    ? 'w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500/50'
    : 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50'
  const getSelectClass = () => isLightMode
    ? 'px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
  const getBorderClass = () => isLightMode ? 'border-gray-200' : 'border-white/10'
  const getHoverBgClass = () => isLightMode ? 'hover:bg-gray-50' : 'hover:bg-white/5'
  const getModalClass = () => isLightMode
    ? 'bg-white border border-gray-200 rounded-2xl p-6 shadow-xl'
    : 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl'
  
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
        <span className={`ml-2 ${getTextClass()}`}>Loading badges and gamification data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 text-red-400 mx-auto mb-4">⚠️</div>
          <h3 className={`${getTextClass()} text-xl font-semibold mb-2`}>Error Loading Badges Data</h3>
          <p className={`${getSubtextClass()} mb-4`}>{error}</p>
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
      <div className={getCardClass()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${getTextClass()}`}>Badges & Gamification</h2>
            <p className={getSecondaryTextClass()}>Manage badges, achievements, and gamification features</p>
          </div>
        </div>

        <div className={`flex space-x-1 ${isLightMode ? 'bg-gray-100' : 'bg-white/5'} rounded-lg p-1`}>
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
                  : `${getSubtextClass()} ${isLightMode ? 'hover:text-gray-900 hover:bg-gray-200' : 'hover:text-white hover:bg-white/5'}`
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
              <h3 className={`text-xl font-bold ${getTextClass()}`}>Badge Definitions</h3>
              <p className={getSecondaryTextClass()}>Manage badge catalog and criteria</p>
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
              className={`w-full pl-10 pr-4 py-2 ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-white/10 border-white/20 text-white'} border rounded-lg placeholder-gray-400 focus:outline-none focus:border-blue-500/50`}
            />
          </div>

          <div className={getCardClass()}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${getBorderClass()}`}>
                    <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Badge</th>
                    <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Description</th>
                    <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Criteria</th>
                    <th className={`text-center pb-3 ${getSubtextClass()} font-medium`}>Unlocks</th>
                    <th className={`text-center pb-3 ${getSubtextClass()} font-medium`}>Engagement</th>
                    <th className={`text-center pb-3 ${getSubtextClass()} font-medium`}>Status</th>
                    <th className={`text-center pb-3 ${getSubtextClass()} font-medium`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {badges.map(badge => (
                    <tr key={badge.id} className={`border-b ${getBorderClass()} last:border-b-0 ${getHoverBgClass()} transition-colors`}>
                      <td className={`py-3 px-4 ${getTextClass()}`}>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <div className="font-medium">{badge.name}</div>
                            <div className={`${getSubtextClass()} text-sm`}>ID: {badge.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${getTextClass()}`}>{badge.description}</td>
                      <td className={`py-3 px-4 ${getTextClass()} text-sm`}>{typeof badge.criteria === 'object' ? JSON.stringify(badge.criteria) : badge.criteria || 'No criteria'}</td>
                      <td className={`py-3 px-4 text-center ${getTextClass()}`}>{(badge.unlocks || 0).toLocaleString()}</td>
                      <td className={`py-3 px-4 text-center ${getTextClass()}`}>{badge.engagement || 0}%</td>
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
              <h3 className={`text-xl font-bold ${getTextClass()}`}>Criteria Builder</h3>
              <p className={getSecondaryTextClass()}>Build complex badge criteria with visual conditions</p>
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
            <div className={getCardClass()}>
              <h4 className={`${getTextClass()} font-medium mb-4`}>Visual Criteria Builder</h4>

              <div className="space-y-4">
                <div className={getInnerCardClass()}>
                  <h5 className={`${getTextClass()} text-sm font-medium mb-3`}>Condition Group</h5>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <select className={`${getSelectClass()} text-sm`}>
                        <option>AND</option>
                        <option>OR</option>
                      </select>
                      <span className={`${getSubtextClass()} text-sm`}>All conditions must be met</span>
                    </div>

                    <div className="space-y-2">
                      <div className={`flex items-center space-x-2 p-3 ${getInnerCardClass()}`}>
                        <select className={`px-2 py-1 ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-white/10 border-white/20 text-white'} border rounded text-sm`}>
                          <option>Investment Count</option>
                          <option>Total Amount</option>
                          <option>Days Active</option>
                          <option>Portfolio Value</option>
                          <option>Round-up Count</option>
                        </select>
                        <select className={`px-2 py-1 ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-white/10 border-white/20 text-white'} border rounded text-sm`}>
                          <option>Greater than</option>
                          <option>Less than</option>
                          <option>Equals</option>
                          <option>Between</option>
                        </select>
                        <input
                          type="number"
                          placeholder="10"
                          className={`px-2 py-1 ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-white/10 border-white/20 text-white'} border rounded text-sm w-20`}
                        />
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className={`flex items-center space-x-2 p-3 ${getInnerCardClass()}`}>
                        <select className={`px-2 py-1 ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-white/10 border-white/20 text-white'} border rounded text-sm`}>
                          <option>Portfolio Value</option>
                          <option>Investment Count</option>
                          <option>Total Amount</option>
                          <option>Days Active</option>
                          <option>Round-up Count</option>
                        </select>
                        <select className={`px-2 py-1 ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-white/10 border-white/20 text-white'} border rounded text-sm`}>
                          <option>Greater than</option>
                          <option>Less than</option>
                          <option>Equals</option>
                          <option>Between</option>
                        </select>
                        <input
                          type="number"
                          placeholder="1000"
                          className={`px-2 py-1 ${isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-white/10 border-white/20 text-white'} border rounded text-sm w-20`}
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

                <div className={getInnerCardClass()}>
                  <h5 className={`${getTextClass()} text-sm font-medium mb-3`}>Time Constraints</h5>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <label className={`${getSubtextClass()} text-sm`}>Time Period:</label>
                      <select className={`${getSelectClass()} text-sm`}>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>Last year</option>
                        <option>All time</option>
                        <option>Custom range</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className={`${getSubtextClass()} text-sm`}>Frequency:</label>
                      <select className={`${getSelectClass()} text-sm`}>
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
            <div className={getCardClass()}>
              <h4 className={`${getTextClass()} font-medium mb-4`}>Criteria Templates</h4>

              <div className="space-y-4">
                <div className={getInnerCardClass()}>
                  <h5 className={`${getTextClass()} text-sm font-medium mb-2`}>Investment Milestones</h5>
                  <p className={`${getSubtextClass()} text-xs mb-3`}>Pre-built criteria for investment achievements</p>
                  <div className="space-y-2">
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      First Investment (≥1 transaction)
                    </button>
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Consistent Saver (≥10 transactions in 30 days)
                    </button>
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Big Spender (≥$100 total invested)
                    </button>
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Diversified Investor (≥3 different sectors)
                    </button>
                  </div>
                </div>

                <div className={getInnerCardClass()}>
                  <h5 className={`${getTextClass()} text-sm font-medium mb-2`}>Engagement Milestones</h5>
                  <p className={`${getSubtextClass()} text-xs mb-3`}>User engagement and activity criteria</p>
                  <div className="space-y-2">
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Active User (≥7 days active)
                    </button>
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Goal Setter (≥1 investment goal created)
                    </button>
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Social Sharer (≥1 share action)
                    </button>
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Feature Explorer (≥3 features used)
                    </button>
                  </div>
                </div>

                <div className={getInnerCardClass()}>
                  <h5 className={`${getTextClass()} text-sm font-medium mb-2`}>Time-based Milestones</h5>
                  <p className={`${getSubtextClass()} text-xs mb-3`}>Achievements based on time periods</p>
                  <div className="space-y-2">
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Week Warrior (7 consecutive days)
                    </button>
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Monthly Master (30 days active)
                    </button>
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Year Veteran (365 days active)
                    </button>
                    <button className={`w-full text-left p-2 ${getInnerCardClass()} ${getHoverBgClass()} ${getTextClass()} text-sm transition-colors`}>
                      Streak Keeper (≥5 day streak)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Preview */}
          <div className={getCardClass()}>
            <h4 className={`${getTextClass()} font-medium mb-4`}>Criteria Preview</h4>
            <div className={getInnerCardClass()}>
              <div className="flex items-center space-x-2 text-sm flex-wrap">
                <span className={getSubtextClass()}>IF</span>
                <span className={getTextClass()}>(Investment Count ≥ 10)</span>
                <span className={getSubtextClass()}>AND</span>
                <span className={getTextClass()}>(Portfolio Value ≥ $1000)</span>
                <span className={getSubtextClass()}>AND</span>
                <span className={getTextClass()}>(Days Active ≥ 30)</span>
                <span className={getSubtextClass()}>THEN</span>
                <span className="text-green-400 font-medium">Award Badge</span>
              </div>
              <div className={`mt-2 text-xs ${getSubtextClass()}`}>
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
              <h3 className={`text-xl font-bold ${getTextClass()}`}>Award Queue</h3>
              <p className={getSecondaryTextClass()}>Pending badge awards and approvals</p>
            </div>
            <button
              onClick={() => setShowAutoAwardSettings(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>Toggle Auto-Award</span>
            </button>
          </div>

          <div className={getCardClass()}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${getBorderClass()}`}>
                    <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>User ID</th>
                    <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Badge</th>
                    <th className={`text-center pb-3 ${getSubtextClass()} font-medium`}>Status</th>
                    <th className={`text-left pb-3 ${getSubtextClass()} font-medium`}>Created At</th>
                    <th className={`text-center pb-3 ${getSubtextClass()} font-medium`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(awardQueue || []).map(award => (
                    <tr key={award.id} className={`border-b ${getBorderClass()} last:border-b-0 ${getHoverBgClass()} transition-colors`}>
                      <td className={`py-3 px-4 ${getTextClass()} font-mono text-sm`}>{award.userId}</td>
                      <td className={`py-3 px-4 ${getTextClass()}`}>{award.badgeName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          award.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {award.status}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${getTextClass()} text-sm`}>{award.createdAt}</td>
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
            <h3 className={`text-xl font-bold ${getTextClass()}`}>Analytics</h3>
            <p className={getSecondaryTextClass()}>Badge performance and engagement metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Total Badges</p>
                  <p className={`text-2xl font-bold ${getTextClass()}`}>{analytics?.totalBadges || 0}</p>
                </div>
                <Award className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Total Awards</p>
                  <p className={`text-2xl font-bold ${getTextClass()}`}>{(analytics?.totalAwards || 0).toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Avg Badges/User</p>
                  <p className={`text-2xl font-bold ${getTextClass()}`}>{analytics?.avgBadgesPerUser || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className={getCardClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Engagement Lift</p>
                  <p className={`text-2xl font-bold ${getTextClass()}`}>+{analytics?.engagementLift || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className={getCardClass()}>
            <h4 className={`text-lg font-semibold ${getTextClass()} mb-4`}>Top Performing Badge</h4>
            <p className={getSecondaryTextClass()}>{analytics?.topPerformingBadge || 'No data'}</p>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-xl font-bold ${getTextClass()}`}>Badge Assets</h3>
              <p className={getSecondaryTextClass()}>Manage badge icons, images, and visual assets</p>
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
            <div className={getCardClass()}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`${getTextClass()} font-medium`}>Icon Library</h4>
                <Image className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {['🏆', '⭐', '🎯', '💎', '🔥', '🚀', '💪', '🎉', '🏅', '👑', '💫', '🌟'].map((icon, index) => (
                    <button
                      key={index}
                      onClick={() => showNotificationModal(`Icon ${icon} selected!`, 'success')}
                      className={`w-12 h-12 ${isLightMode ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/10 hover:bg-white/20'} rounded-lg flex items-center justify-center text-2xl transition-colors`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <p className={`${getSubtextClass()} text-sm`}>Click to select an icon for your badge</p>
              </div>
            </div>

            {/* Upload Area */}
            <div className={getCardClass()}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`${getTextClass()} font-medium`}>Custom Upload</h4>
                <Upload className="w-5 h-5 text-green-400" />
              </div>
              <div className={`border-2 border-dashed ${isLightMode ? 'border-gray-300' : 'border-white/20'} rounded-lg p-8 text-center`}>
                <Upload className={`w-12 h-12 ${getSubtextClass()} mx-auto mb-4`} />
                <p className={`${getSecondaryTextClass()} mb-2`}>Upload custom badge icons</p>
                <p className={`${getSubtextClass()} text-sm mb-4`}>PNG, SVG, JPG up to 2MB</p>
                <button
                  onClick={() => showNotificationModal('File upload functionality coming soon!', 'info')}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 transition-all"
                >
                  Choose Files
                </button>
              </div>
            </div>

            {/* Asset Management */}
            <div className={getCardClass()}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`${getTextClass()} font-medium`}>Asset Management</h4>
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={getSecondaryTextClass()}>Total Assets</span>
                  <span className={getTextClass()}>0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={getSecondaryTextClass()}>Storage Used</span>
                  <span className={getTextClass()}>0 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={getSecondaryTextClass()}>Last Updated</span>
                  <span className={getTextClass()}>Never</span>
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
          <div className={getCardClass()}>
            <h4 className={`${getTextClass()} font-medium mb-4`}>Asset Preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className={getInnerCardClass() + ' text-center'}>
                <div className="text-3xl mb-2">🏆</div>
                <p className={`${getSecondaryTextClass()} text-sm`}>Trophy</p>
                <p className={`${getSubtextClass()} text-xs`}>Default</p>
              </div>
              <div className={getInnerCardClass() + ' text-center'}>
                <div className="text-3xl mb-2">⭐</div>
                <p className={`${getSecondaryTextClass()} text-sm`}>Star</p>
                <p className={`${getSubtextClass()} text-xs`}>Default</p>
              </div>
              <div className={getInnerCardClass() + ' text-center'}>
                <div className="text-3xl mb-2">🎯</div>
                <p className={`${getSecondaryTextClass()} text-sm`}>Target</p>
                <p className={`${getSubtextClass()} text-xs`}>Default</p>
              </div>
              <div className={getInnerCardClass() + ' text-center'}>
                <div className="text-3xl mb-2">💎</div>
                <p className={`${getSecondaryTextClass()} text-sm`}>Diamond</p>
                <p className={`${getSubtextClass()} text-xs`}>Default</p>
              </div>
              <div className={getInnerCardClass() + ' text-center'}>
                <div className="text-3xl mb-2">🔥</div>
                <p className={`${getSecondaryTextClass()} text-sm`}>Fire</p>
                <p className={`${getSubtextClass()} text-xs`}>Default</p>
              </div>
              <div className={getInnerCardClass() + ' text-center'}>
                <div className="text-3xl mb-2">🚀</div>
                <p className={`${getSecondaryTextClass()} text-sm`}>Rocket</p>
                <p className={`${getSubtextClass()} text-xs`}>Default</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Badge Modal */}
      {showCreateBadge && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className={`${getModalClass()} w-full max-w-2xl mx-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Create New Badge</h3>
              <button
                onClick={() => setShowCreateBadge(false)}
                className={`${getSubtextClass()} ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Badge Name</label>
                <input
                  type="text"
                  placeholder="Enter badge name..."
                  className={getInputClass()}
                />
              </div>

              <div>
                <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter badge description..."
                  className={getInputClass()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Icon</label>
                  <select className={getInputClass()}>
                    <option value="🏆">🏆 Trophy</option>
                    <option value="⭐">⭐ Star</option>
                    <option value="🎯">🎯 Target</option>
                    <option value="💎">💎 Diamond</option>
                    <option value="🔥">🔥 Fire</option>
                    <option value="🚀">🚀 Rocket</option>
                  </select>
                </div>

                <div>
                  <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Category</label>
                  <select className={getInputClass()}>
                    <option value="investment">Investment</option>
                    <option value="engagement">Engagement</option>
                    <option value="milestone">Milestone</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Criteria</label>
                <textarea
                  rows={2}
                  placeholder="Define badge criteria..."
                  className={getInputClass()}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateBadge(false)}
                className={`flex-1 ${isLightMode ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'} border py-2 px-4 rounded-lg transition-all`}
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
          <div className={`${getModalClass()} w-full max-w-2xl mx-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Create New Criteria</h3>
              <button
                onClick={() => setShowCreateCriteria(false)}
                className={`${getSubtextClass()} ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Criteria Name</label>
                <input
                  type="text"
                  placeholder="Enter criteria name..."
                  className={getInputClass()}
                />
              </div>

              <div>
                <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Condition Type</label>
                <select className={getInputClass()}>
                  <option value="investment_count">Investment Count</option>
                  <option value="portfolio_value">Portfolio Value</option>
                  <option value="days_active">Days Active</option>
                  <option value="transaction_amount">Transaction Amount</option>
                  <option value="goal_completion">Goal Completion</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Operator</label>
                  <select className={getInputClass()}>
                    <option value=">=">Greater than or equal</option>
                    <option value=">">Greater than</option>
                    <option value="=">Equal to</option>
                    <option value="<=">Less than or equal</option>
                    <option value="<">Less than</option>
                  </select>
                </div>

                <div>
                  <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Value</label>
                  <input
                    type="number"
                    placeholder="Enter value..."
                    className={getInputClass()}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Time Period</label>
                <select className={getInputClass()}>
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
                className={`flex-1 ${isLightMode ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'} border py-2 px-4 rounded-lg transition-all`}
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
          <div className={`${getModalClass()} w-full max-w-2xl mx-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Auto-Award Settings</h3>
              <button
                onClick={() => setShowAutoAwardSettings(false)}
                className={`${getSubtextClass()} ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className={`${getTextClass()} font-medium mb-4`}>Global Auto-Award Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={getSecondaryTextClass()}>Enable Auto-Award</span>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={getSecondaryTextClass()}>Auto-approve awards</span>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={getSecondaryTextClass()}>Send notifications</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`${getTextClass()} font-medium mb-4`}>Badge-Specific Settings</h4>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-3 ${getInnerCardClass()}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏆</span>
                      <span className={getTextClass()}>First Investment</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                  <div className={`flex items-center justify-between p-3 ${getInnerCardClass()}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⭐</span>
                      <span className={getTextClass()}>Consistent Saver</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                  <div className={`flex items-center justify-between p-3 ${getInnerCardClass()}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🎯</span>
                      <span className={getTextClass()}>Goal Achiever</span>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`${getTextClass()} font-medium mb-4`}>Award Frequency</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Check Interval</label>
                    <select className={getInputClass()}>
                      <option value="hourly">Hourly</option>
                      <option value="daily" selected>Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block ${getSecondaryTextClass()} text-sm mb-2`}>Max Awards per Check</label>
                    <input
                      type="number"
                      defaultValue="100"
                      className={getInputClass()}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAutoAwardSettings(false)}
                className={`flex-1 ${isLightMode ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'} border py-2 px-4 rounded-lg transition-all`}
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
          <div className={`${getModalClass()} w-full max-w-md mx-auto`}>
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
              <h3 className={`${getTextClass()} text-lg font-semibold mb-2`}>
                {notificationType === 'success' ? 'Success!' :
                 notificationType === 'error' ? 'Error!' : 'Info'}
              </h3>
              <p className={`${getSecondaryTextClass()} mb-6`}>{notificationMessage}</p>
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
