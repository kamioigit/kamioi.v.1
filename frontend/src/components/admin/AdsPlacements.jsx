import React, { useState } from 'react'
import { Image, Eye, BarChart3, Trash2, Plus, User, Video, Edit, Monitor } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

const AdsPlacements = ({ user }) => {
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('inventory')
  const [searchTerm, setSearchTerm] = useState('')

  const placements = [
    {
      id: 'PLACE001',
      key: 'user_sidebar_top',
      location: 'User Sidebar Top',
      dimensions: '300x250',
      status: 'active',
      impressions: 0,
      ctr: 2.3,
      conversions: 45
    },
    {
      id: 'PLACE002',
      key: 'family_dashboard_widget',
      location: 'Family Dashboard Widget',
      dimensions: '728x90',
      status: 'active',
      impressions: 89000,
      ctr: 1.8,
      conversions: 32
    }
  ]

  const creatives = [
    {
      id: 'CREATIVE001',
      name: 'Investment Growth Ad',
      type: 'image',
      assetUrl: '/ads/investment-growth.jpg',
      landingUrl: 'https://example.com/investment',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      impressions: 0,
      clicks: 1035
    },
    {
      id: 'CREATIVE002',
      name: 'Family Savings Video',
      type: 'video',
      assetUrl: '/ads/family-savings.mp4',
      landingUrl: 'https://example.com/family',
      status: 'active',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      impressions: 32000,
      clicks: 896
    }
  ]

  const experiments = [
    {
      id: 'EXP001',
      name: 'Sidebar Ad A/B Test',
      placement: 'user_sidebar_top',
      variants: ['control', 'variant_a', 'variant_b'],
      status: 'running',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      winner: null
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'inactive': return 'bg-gray-500/20 text-gray-400'
      case 'running': return 'bg-blue-500/20 text-blue-400'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'html': return <Monitor className="w-4 h-4" />
      default: return <Image className="w-4 h-4" />
    }
  }

  const handleCreatePlacement = () => {
    addNotification({
      type: 'info',
      title: 'Create Placement',
      message: 'Create placement functionality would be implemented here',
      timestamp: new Date()
    })
  }

  const handleCreateCreative = () => {
    addNotification({
      type: 'info',
      title: 'Create Creative',
      message: 'Create creative functionality would be implemented here',
      timestamp: new Date()
    })
  }

  const handleCreateExperiment = () => {
    addNotification({
      type: 'info',
      title: 'Create Experiment',
      message: 'Create experiment functionality would be implemented here',
      timestamp: new Date()
    })
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Ads & Placements</h2>
            <p className="text-gray-300">Manage in-app advertising placements and creatives</p>
          </div>
        </div>

        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'inventory', label: 'Inventory' },
            { id: 'creatives', label: 'Creatives' },
            { id: 'targeting', label: 'Targeting' },
            { id: 'experiments', label: 'Experiments' },
            { id: 'performance', label: 'Performance' }
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

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Placement Inventory</h3>
              <p className="text-gray-300">Manage ad placement locations and specifications</p>
            </div>
            <button 
              onClick={handleCreatePlacement}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Placement</span>
            </button>
          </div>

          <div className="glass-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-3 text-gray-400 font-medium">Placement</th>
                    <th className="text-left pb-3 text-gray-400 font-medium">Location</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Dimensions</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Status</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Impressions</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">CTR</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Conversions</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {placements.map(placement => (
                    <tr key={placement.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white">
                        <div>
                          <div className="font-medium">{placement.key}</div>
                          <div className="text-gray-400 text-sm">ID: {placement.id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">{placement.location}</td>
                      <td className="py-3 px-4 text-center text-white">{placement.dimensions}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(placement.status)}`}>
                          {placement.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-white">{placement.impressions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center text-white">{placement.ctr}%</td>
                      <td className="py-3 px-4 text-center text-white">{placement.conversions}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-1">
                          <button 
                            onClick={() => addNotification({
                              type: 'info',
                              title: 'View Performance',
                              message: `View performance for ${placement.key}`,
                              timestamp: new Date()
                            })}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="View Performance"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => addNotification({
                              type: 'info',
                              title: 'Edit Placement',
                              message: `Edit placement ${placement.id}`,
                              timestamp: new Date()
                            })}
                            className="text-yellow-400 hover:text-yellow-300 p-1"
                            title="Edit Placement"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => addNotification({
                              type: 'info',
                              title: 'Delete Placement',
                              message: `Delete placement ${placement.id}`,
                              timestamp: new Date()
                            })}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete Placement"
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

      {activeTab === 'creatives' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Creatives</h3>
              <p className="text-gray-300">Manage ad creatives and assets</p>
            </div>
            <button 
              onClick={handleCreateCreative}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Creative</span>
            </button>
          </div>

          <div className="glass-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-3 text-gray-400 font-medium">Creative</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Type</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left pb-3 text-gray-400 font-medium">Campaign Period</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Impressions</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Clicks</th>
                    <th className="text-center pb-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creatives.map(creative => (
                    <tr key={creative.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white">
                        <div>
                          <div className="font-medium">{creative.name}</div>
                          <div className="text-gray-400 text-sm">Landing: {creative.landingUrl}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {getTypeIcon(creative.type)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(creative.status)}`}>
                          {creative.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white text-sm">
                        {creative.startDate} - {creative.endDate}
                      </td>
                      <td className="py-3 px-4 text-center text-white">{creative.impressions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center text-white">{creative.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-1">
                          <button 
                            onClick={() => addNotification({
                              type: 'info',
                              title: 'Preview Creative',
                              message: `Preview creative ${creative.id}`,
                              timestamp: new Date()
                            })}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => addNotification({
                              type: 'info',
                              title: 'View Performance',
                              message: `View performance for ${creative.id}`,
                              timestamp: new Date()
                            })}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="View Performance"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => addNotification({
                              type: 'info',
                              title: 'Edit Creative',
                              message: `Edit creative ${creative.id}`,
                              timestamp: new Date()
                            })}
                            className="text-yellow-400 hover:text-yellow-300 p-1"
                            title="Edit Creative"
                          >
                            <Edit className="w-4 h-4" />
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

      {activeTab === 'targeting' && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Targeting</h3>
          <p className="text-gray-300">Ad targeting and audience management functionality would be implemented here</p>
        </div>
      )}

      {activeTab === 'experiments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">A/B Experiments</h3>
              <p className="text-gray-300">Manage ad placement and creative experiments</p>
            </div>
            <button 
              onClick={handleCreateExperiment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Experiment</span>
            </button>
          </div>

          <div className="glass-card p-6">
            <div className="space-y-4">
              {experiments.map(experiment => (
                <div key={experiment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{experiment.name}</h4>
                      <p className="text-gray-400 text-sm">Placement: {experiment.placement}</p>
                      <p className="text-gray-300 text-sm mt-1">Variants: {experiment.variants.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(experiment.status)}`}>
                        {experiment.status}
                      </span>
                      <p className="text-white font-medium mt-1">{experiment.startDate} - {experiment.endDate}</p>
                      <p className="text-gray-400 text-sm">Winner: {experiment.winner || 'TBD'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Performance Dashboard</h3>
          <p className="text-gray-300">Ad performance analytics and reporting functionality would be implemented here</p>
        </div>
      )}
    </div>
  )
}

export default AdsPlacements
