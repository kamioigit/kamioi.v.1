import React, { useState, useEffect } from 'react'
import { BarChart3, DollarSign, Eye, MousePointer, TrendingUp, Users, Settings, Plus, Edit, Trash2, Play, Pause, RefreshCw, Download, Filter, Calendar, Target, Zap, AlertCircle, CheckCircle, Clock, User } from 'lucide-react'
import RechartsChart from '../common/RechartsChart'
import { useTheme } from '../../context/ThemeContext'

const AdManagement = ({ user }) => {
  const [selectedView, setSelectedView] = useState('overview')
   const { isLightMode } = useTheme()
  const [campaigns, setCampaigns] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)

  useEffect(() => {
    fetchCampaigns()
    fetchAnalytics()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/ads/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ads/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTextClass = () => isLightMode ? 'text-gray-900' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode 
    ? 'bg-white border border-gray-200 shadow-sm' 
    : 'bg-white/10 backdrop-blur-lg border border-white/20'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-2 text-white">Loading ad management...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${getTextClass()}`}>Smart Ads Management</h1>
          <p className={`${getSubtextClass()} mt-1`}>LLM-powered contextual advertising system</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchAnalytics}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setShowCreateCampaign(true)}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2">
        {['overview', 'campaigns', 'analytics', 'inventory', 'targeting'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 rounded-lg transition-all capitalize ${
              selectedView === view 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : `bg-white/5 ${getSubtextClass()} hover:bg-white/10`
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Overview */}
      {selectedView === 'overview' && analytics && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${getCardClass()} p-6 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Total Revenue</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                    ${analytics.summary.total_revenue.toLocaleString()}
                  </p>
                  <p className="text-green-400 text-sm mt-1">+12% vs last month</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className={`${getCardClass()} p-6 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Impressions</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                    {analytics.summary.total_impressions.toLocaleString()}
                  </p>
                  <p className="text-blue-400 text-sm mt-1">Fill Rate: {analytics.summary.fill_rate}%</p>
                </div>
                <Eye className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className={`${getCardClass()} p-6 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Click Rate</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                    {analytics.summary.avg_ctr.toFixed(2)}%
                  </p>
                  <p className="text-purple-400 text-sm mt-1">{analytics.summary.total_clicks.toLocaleString()} clicks</p>
                </div>
                <MousePointer className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className={`${getCardClass()} p-6 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getSubtextClass()} text-sm`}>Avg CPA</p>
                  <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                    ${analytics.summary.avg_cpa.toFixed(2)}
                  </p>
                  <p className="text-orange-400 text-sm mt-1">{analytics.summary.total_conversions} conversions</p>
                </div>
                <Target className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${getCardClass()} p-6 rounded-lg`}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Revenue Timeline</h3>
              <RechartsChart
                type="line"
                height={300}
                data={analytics.timeline}
                series={[
                  { dataKey: 'revenue', name: 'Revenue', stroke: '#10b981' }
                ]}
              />
            </div>

            <div className={`${getCardClass()} p-6 rounded-lg`}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Performance by Slot</h3>
              <RechartsChart
                type="bar"
                height={300}
                data={Object.entries(analytics.by_slot).map(([slot, data]) => ({
                  slot: slot.replace('_', ' ').toUpperCase(),
                  impressions: data.impressions,
                  clicks: data.clicks,
                  revenue: data.revenue
                }))}
                series={[
                  { dataKey: 'revenue', name: 'Revenue', fill: '#8b5cf6' }
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Campaigns */}
      {selectedView === 'campaigns' && (
        <div className="space-y-6">
          <div className={`${getCardClass()} rounded-lg overflow-hidden`}>
            <div className="p-6 border-b border-white/10">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Active Campaigns</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>
                      Campaign
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>
                      Budget
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>
                      Performance
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${getSubtextClass()} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div>
                          <div className={`text-sm font-medium ${getTextClass()}`}>
                            {campaign.name}
                          </div>
                          <div className={`text-sm ${getSubtextClass()}`}>
                            {campaign.type.replace('_', ' ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {campaign.status === 'active' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${getTextClass()}`}>
                          ${campaign.spend_total.toLocaleString()} / ${campaign.budget_total.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(campaign.spend_total / campaign.budget_total) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${getTextClass()}`}>
                          CTR: {campaign.ctr}% | CVR: {campaign.cvr}%
                        </div>
                        <div className={`text-sm ${getSubtextClass()}`}>
                          CPA: ${campaign.cpa}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-400 hover:text-blue-300">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-yellow-400 hover:text-yellow-300">
                            <Pause className="w-4 h-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-300">
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

      {/* Analytics */}
      {selectedView === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${getCardClass()} p-6 rounded-lg`}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Campaign Performance</h3>
              <RechartsChart
                type="donut"
                height={300}
                data={Object.entries(analytics.by_type).map(([type, data]) => ({
                  name: type.replace('_', ' ').toUpperCase(),
                  value: data.revenue
                }))}
              />
            </div>

            <div className={`${getCardClass()} p-6 rounded-lg`}>
              <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Impressions vs Clicks</h3>
              <RechartsChart
                type="line"
                height={300}
                data={analytics.timeline}
                series={[
                  { dataKey: 'impressions', name: 'Impressions', stroke: '#3b82f6' },
                  { dataKey: 'clicks', name: 'Clicks', stroke: '#10b981' }
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Inventory Management */}
      {selectedView === 'inventory' && (
        <div className="space-y-6">
          <div className={`${getCardClass()} p-6 rounded-lg`}>
            <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Ad Slot Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries({
                'ud_top_banner': { name: 'User Top Banner', size: '1200x96', fill: 98.5 },
                'ud_sidebar_card': { name: 'User Sidebar', size: '320x200', fill: 95.2 },
                'ud_inline_card': { name: 'User Inline', size: '600x150', fill: 92.8 },
                'fd_top_banner': { name: 'Family Top Banner', size: '1200x96', fill: 89.3 }
              }).map(([slotId, slot]) => (
                <div key={slotId} className={`${isLightMode ? 'bg-gray-50' : 'bg-white/5'} p-4 rounded-lg`}>
                  <div className={`font-medium ${getTextClass()}`}>{slot.name}</div>
                  <div className={`text-sm ${getSubtextClass()}`}>{slot.size}</div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span className={getSubtextClass()}>Fill Rate</span>
                      <span className={`${slot.fill > 95 ? 'text-green-400' : slot.fill > 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {slot.fill}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${slot.fill > 95 ? 'bg-green-500' : slot.fill > 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${slot.fill}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Targeting */}
      {selectedView === 'targeting' && (
        <div className="space-y-6">
          <div className={`${getCardClass()} p-6 rounded-lg`}>
            <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>LLM-Powered Targeting</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className={`font-medium ${getTextClass()} mb-3`}>Context Labels</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'coffee_spend_high', 'fuel_spike', 'sector_focus', 'roundup_change_intent',
                    'portfolio_view', 'badge_progress', 'family_milestone', 'savings_goal'
                  ].map((label) => (
                    <span key={label} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {label.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className={`font-medium ${getTextClass()} mb-3`}>Targeting Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={getSubtextClass()}>Coffee Spend High</span>
                    <span className="text-green-400">4.2% CTR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={getSubtextClass()}>Portfolio View</span>
                    <span className="text-green-400">3.8% CTR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={getSubtextClass()}>Investment Curious</span>
                    <span className="text-yellow-400">2.9% CTR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdManagement

