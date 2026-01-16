import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone, Plus, Edit, Trash2, Eye, Play, Pause, BarChart3, Target, DollarSign, Users, Calendar, TrendingUp, TrendingDown, Filter, Search, Download, Upload, Settings, X, CheckCircle, AlertCircle, Clock, Video, Info } from 'lucide-react'

const AdvertisementModule = ({ user }) => {
  const navigate = useNavigate()
  const [activeSubTab, setActiveSubTab] = useState('campaigns')
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [showEditCampaign, setShowEditCampaign] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showCreateCreative, setShowCreateCreative] = useState(false)
  const [showCreateAudience, setShowCreateAudience] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('success')

  const [campaigns, setCampaigns] = useState([])
  const [adCreatives, setAdCreatives] = useState([])
  const [audiences, setAudiences] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch advertisement data with AbortController
  useEffect(() => {
    const abortController = new AbortController()
    fetchAdvertisementData(abortController.signal)
    
    return () => {
      abortController.abort()
    }
  }, [])

  // Notification functions
  const displayNotificationModal = (message, type = 'success') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)
  }

  // Alias used in various buttons
  const showNotificationModal = (message, type = 'success') => displayNotificationModal(message, type)

  const handleNotificationModalClose = () => {
    setShowNotification(false)
    setNotificationMessage('')
  }

  const fetchAdvertisementData = async (signal = null) => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/admin/advertisements/campaigns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3' || localStorage.getItem('authToken') || 'admin_token_3'}`
        },
        signal
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCampaigns(result.data.campaigns)
          setAdCreatives(result.data.creatives)
          setAudiences(result.data.audiences)
          setAnalytics(result.data.analytics)
        }
      }
      if (!signal?.aborted) {
        // Dispatch page load completion event for Loading Report
        window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
          detail: { pageId: 'advertisement' }
        }))
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching advertisement data:', error)
        setError('Failed to fetch advertisement data')
        // Still dispatch completion event even on error
        if (!signal?.aborted) {
          window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
            detail: { pageId: 'advertisement' }
          }))
        }
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-white">Loading advertisement data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 text-red-400 mx-auto mb-4">⚠️</div>
          <h3 className="text-white text-xl font-semibold mb-2">Error Loading Advertisement Data</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null)
              fetchAdvertisementData()
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const renderCampaignsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Campaign Management</h3>
        <button
          onClick={() => setShowCreateCampaign(true)}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-blue-500/20">
              <Megaphone className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {campaigns.length}
          </h3>
          <p className="text-gray-400 text-sm">Total Campaigns</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+8%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            ${campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
          </h3>
          <p className="text-gray-400 text-sm">Total Spent</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+15%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {campaigns.reduce((sum, c) => sum + c.conversions, 0).toLocaleString()}
          </h3>
          <p className="text-gray-400 text-sm">Total Conversions</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Target className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+5%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {(campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length).toFixed(1)}%
          </h3>
          <p className="text-gray-400 text-sm">Avg CTR</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="glass-card">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-white">Active Campaigns</h4>
            <div className="flex space-x-3">
              <button className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg px-3 py-2 text-gray-400 flex items-center space-x-2 transition-all">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-3 py-2 text-green-400 flex items-center space-x-2 transition-all">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm">Campaign</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm">Status</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm">Budget</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm">Spent</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm">CTR</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm">ROAS</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns && campaigns.length > 0 ? campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{campaign.name}</p>
                        <p className="text-gray-400 text-sm">{campaign.type}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">${campaign.budget.toLocaleString()}</td>
                    <td className="px-4 py-3 text-white">${campaign.spent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-white">{campaign.ctr}%</td>
                    <td className="px-4 py-3 text-white">{campaign.roas}x</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setShowAnalytics(true)
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="View Analytics"
                        >
                          <BarChart3 className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setShowEditCampaign(true)
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Edit Campaign"
                        >
                          <Edit className="w-4 h-4 text-yellow-400" />
                        </button>
                        <button
                          onClick={() => {
                            console.log('Pause/Resume campaign:', campaign.id)
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                        >
                          {campaign.status === 'active' ? 
                            <Pause className="w-4 h-4 text-orange-400" /> : 
                            <Play className="w-4 h-4 text-green-400" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Megaphone className="w-12 h-12 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Campaigns Yet</h3>
                        <p className="text-sm mb-4">Create your first campaign to start advertising.</p>
                        <button
                          onClick={() => setShowCreateCampaign(true)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-6 py-3 text-blue-400 flex items-center space-x-2 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create Your First Campaign</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCreativesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Ad Creatives</h3>
        <button
          onClick={() => setShowCreateCreative(true)}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Creative</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(adCreatives || []).map((creative) => (
          <div key={creative.id} className="glass-card p-6">
            <div className="aspect-video bg-white/5 rounded-lg mb-4 flex items-center justify-center">
              {creative.type === 'Video' ? (
                <Play className="w-12 h-12 text-white/50" />
              ) : (
                <Megaphone className="w-12 h-12 text-white/50" />
              )}
            </div>
            <h4 className="text-white font-medium mb-2">{creative.name}</h4>
            <p className="text-gray-400 text-sm mb-4">{creative.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">CTR: {creative.ctr}%</span>
              <span className="text-green-400">{creative.conversions} conversions</span>
            </div>
            <div className="flex space-x-2 mt-4">
              <button 
                onClick={() => showNotificationModal('Edit creative functionality coming soon!', 'info')}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-400 text-sm transition-all"
              >
                Edit
              </button>
              <button 
                onClick={() => showNotificationModal('Creative duplicated successfully!', 'success')}
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-3 py-2 text-green-400 text-sm transition-all"
              >
                Duplicate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAudiencesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Audience Management</h3>
        <button
          onClick={() => setShowCreateAudience(true)}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Audience</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {audiences && audiences.length > 0 ? audiences.map((audience) => (
          <div key={audience.id} className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-white font-medium">{audience.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                audience.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {audience.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Size: {audience.size.toLocaleString()}</p>
            <p className="text-gray-400 text-sm mb-4">{audience.demographics}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {audience.interests.map((interest, index) => (
                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  {interest}
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => showNotificationModal('Edit audience functionality coming soon!', 'info')}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-400 text-sm transition-all"
              >
                Edit
              </button>
              <button 
                onClick={() => showNotificationModal('Audience added to campaign successfully!', 'success')}
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-3 py-2 text-green-400 text-sm transition-all"
              >
                Use in Campaign
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-2 text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Audiences Yet</h3>
              <p className="text-sm">Create your first audience to start targeting your ads effectively.</p>
            </div>
            <button
              onClick={() => setShowCreateAudience(true)}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-6 py-3 text-blue-400 flex items-center space-x-2 transition-all mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Audience</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center space-x-3">
          <Megaphone className="w-8 h-8 text-blue-400" />
          <span>Advertisement Module</span>
        </h2>
        <p className="text-gray-400">
          Manage advertising campaigns, creatives, and audience targeting
        </p>
      </div>

      {/* Sub Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
          { id: 'creatives', label: 'Creatives', icon: Eye },
          { id: 'audiences', label: 'Audiences', icon: Target }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeSubTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-card">
        <div className="p-6">
          {activeSubTab === 'campaigns' && renderCampaignsTab()}
          {activeSubTab === 'creatives' && renderCreativesTab()}
          {activeSubTab === 'audiences' && renderAudiencesTab()}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Campaign</h3>
              <button 
                onClick={() => setShowCreateCampaign(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Type</label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Social Media</option>
                    <option>Google Ads</option>
                    <option>Facebook Ads</option>
                    <option>Display</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50010"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Millennial Investors</option>
                  <option>Small Business Owners</option>
                  <option>Families</option>
                  <option>Custom Audience</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowCreateCampaign(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log('Campaign created')
                  setShowCreateCampaign(false)
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Creative Modal */}
      {showCreateCreative && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Ad Creative</h3>
              <button 
                onClick={() => setShowCreateCreative(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Creative Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter creative name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  placeholder="Describe your ad creative"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Creative Type</label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Image</option>
                    <option>Video</option>
                    <option>Carousel</option>
                    <option>Text</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Square (1:1)</option>
                    <option>Landscape (16:9)</option>
                    <option>Portrait (9:16)</option>
                    <option>Story (9:16)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Creative</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-xs">PNG, JPG, MP4 up to 10MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Call to Action</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Learn More</option>
                  <option>Sign Up</option>
                  <option>Download</option>
                  <option>Shop Now</option>
                  <option>Get Started</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowCreateCreative(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  displayNotificationModal('Ad creative created successfully!', 'success')
                  setShowCreateCreative(false)
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Create Creative
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Audience Modal */}
      {showCreateAudience && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Audience</h3>
              <button 
                onClick={() => setShowCreateAudience(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Audience Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter audience name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  placeholder="Describe your target audience"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age Range</label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>18-24</option>
                    <option>25-34</option>
                    <option>35-44</option>
                    <option>45-54</option>
                    <option>55-64</option>
                    <option>65+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-binary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Interests</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Investing', 'Technology', 'Finance', 'Business', 'Lifestyle', 'Education'].map(interest => (
                    <label key={interest} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-white/20 bg-white/10 text-blue-500" />
                      <span className="text-white text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter target locations (e.g., United States, Canada)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Income Level</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Any</option>
                  <option>$25,000 - $50,000</option>
                  <option>$50,000 - $75,000</option>
                  <option>$75,000 - $100,000</option>
                  <option>$100,000+</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowCreateAudience(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  displayNotificationModal('Audience created successfully!', 'success')
                  setShowCreateAudience(false)
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Create Audience
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
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : notificationType === 'error' ? (
                  <AlertCircle className="w-8 h-8 text-red-400" />
                ) : (
                  <Clock className="w-8 h-8 text-blue-400" />
                )}
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                {notificationType === 'success' ? 'Success!' : 
                 notificationType === 'error' ? 'Error!' : 'Info'}
              </h3>
              <p className="text-white/70 mb-6">{notificationMessage}</p>
              <div className="flex space-x-3">
                <button 
                  onClick={handleNotificationModalClose}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
                >
                  OK
                </button>
                <button 
                  onClick={() => {
                    handleNotificationModalClose()
                    navigate('/admin/notifications')
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
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

export default AdvertisementModule
