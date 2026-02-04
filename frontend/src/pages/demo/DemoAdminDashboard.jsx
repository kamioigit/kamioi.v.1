import React, { useState } from 'react'
import {
  Home, Users, Settings, Shield, BarChart3, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle, Clock, CreditCard, Activity, Database, Server, Eye, UserCheck,
  ArrowUpRight, ArrowDownRight, RefreshCw, FileText
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

// Admin demo data
const ADMIN_DEMO_DATA = {
  stats: {
    totalUsers: 1547,
    activeUsers: 1234,
    newUsersThisMonth: 89,
    totalRevenue: 45678.90,
    monthlyRevenue: 12345.67,
    revenueGrowth: 23.5,
    totalTransactions: 45678,
    activeSubscriptions: 1123
  },
  recentUsers: [
    { id: 1, name: 'John Smith', email: 'john.smith@email.com', accountType: 'individual', status: 'active', joined: '2024-01-20' },
    { id: 2, name: 'Demo Family', email: 'demo.family@email.com', accountType: 'family', status: 'active', joined: '2024-01-19' },
    { id: 3, name: 'ABC Corp', email: 'admin@abccorp.com', accountType: 'business', status: 'active', joined: '2024-01-18' },
    { id: 4, name: 'Jane Doe', email: 'jane.doe@email.com', accountType: 'individual', status: 'pending', joined: '2024-01-17' },
    { id: 5, name: 'XYZ LLC', email: 'contact@xyzllc.com', accountType: 'business', status: 'active', joined: '2024-01-16' }
  ],
  systemHealth: {
    apiStatus: 'healthy',
    dbStatus: 'healthy',
    uptime: '99.98%',
    responseTime: '45ms',
    errorRate: '0.02%'
  },
  recentActivity: [
    { id: 1, type: 'signup', message: 'New user registered: john.smith@email.com', time: '2 minutes ago' },
    { id: 2, type: 'subscription', message: 'Premium subscription activated for Demo Family', time: '15 minutes ago' },
    { id: 3, type: 'transaction', message: '1,234 round-up transactions processed', time: '1 hour ago' },
    { id: 4, type: 'alert', message: 'High API traffic detected - scaling resources', time: '2 hours ago' },
    { id: 5, type: 'system', message: 'Database backup completed successfully', time: '4 hours ago' }
  ]
}

const DemoAdminDashboard = () => {
  const { isLightMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  const { stats, recentUsers, systemHealth, recentActivity } = ADMIN_DEMO_DATA

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getCardClass = () => isLightMode
    ? 'bg-white border border-gray-200 shadow-sm'
    : 'bg-white/10 backdrop-blur-xl border border-white/20'

  const getTextColor = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextColor = () => isLightMode ? 'text-gray-600' : 'text-white/70'

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'system', label: 'System', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'signup': return <UserCheck className="w-5 h-5 text-green-400" />
      case 'subscription': return <CreditCard className="w-5 h-5 text-blue-400" />
      case 'transaction': return <DollarSign className="w-5 h-5 text-purple-400" />
      case 'alert': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'system': return <Server className="w-5 h-5 text-gray-400" />
      default: return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-purple-100' : 'bg-purple-500/20'}`}>
              <Users className={`w-6 h-6 ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`} />
            </div>
            <span className="text-green-400 text-sm flex items-center">
              <ArrowUpRight className="w-4 h-4" />
              +{stats.newUsersThisMonth} this month
            </span>
          </div>
          <p className={getSubtextColor()}>Total Users</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatNumber(stats.totalUsers)}</p>
        </div>

        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-green-100' : 'bg-green-500/20'}`}>
              <DollarSign className={`w-6 h-6 ${isLightMode ? 'text-green-600' : 'text-green-400'}`} />
            </div>
            <span className="text-green-400 text-sm flex items-center">
              <ArrowUpRight className="w-4 h-4" />
              +{stats.revenueGrowth}%
            </span>
          </div>
          <p className={getSubtextColor()}>Monthly Revenue</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(stats.monthlyRevenue)}</p>
        </div>

        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
              <CreditCard className={`w-6 h-6 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
            </div>
          </div>
          <p className={getSubtextColor()}>Active Subscriptions</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatNumber(stats.activeSubscriptions)}</p>
        </div>

        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-orange-100' : 'bg-orange-500/20'}`}>
              <TrendingUp className={`w-6 h-6 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`} />
            </div>
          </div>
          <p className={getSubtextColor()}>Total Transactions</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatNumber(stats.totalTransactions)}</p>
        </div>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>System Health</h3>
            <span className={`px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400`}>
              All Systems Operational
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Server className={`w-5 h-5 ${getSubtextColor()}`} />
                <span className={getTextColor()}>API Status</span>
              </div>
              <span className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-1" /> Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className={`w-5 h-5 ${getSubtextColor()}`} />
                <span className={getTextColor()}>Database</span>
              </div>
              <span className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-1" /> Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className={`w-5 h-5 ${getSubtextColor()}`} />
                <span className={getTextColor()}>Uptime</span>
              </div>
              <span className={getTextColor()}>{systemHealth.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className={`w-5 h-5 ${getSubtextColor()}`} />
                <span className={getTextColor()}>Response Time</span>
              </div>
              <span className={getTextColor()}>{systemHealth.responseTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`w-5 h-5 ${getSubtextColor()}`} />
                <span className={getTextColor()}>Error Rate</span>
              </div>
              <span className="text-green-400">{systemHealth.errorRate}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>Recent Activity</h3>
            <button className="text-purple-400 hover:text-purple-300 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/10'}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${getTextColor()}`}>{activity.message}</p>
                  <p className={`text-xs ${getSubtextColor()}`}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Recent Users</h3>
          <button className="text-purple-400 hover:text-purple-300 text-sm">View All Users</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
                <th className={`text-left py-3 ${getSubtextColor()}`}>User</th>
                <th className={`text-left py-3 ${getSubtextColor()}`}>Account Type</th>
                <th className={`text-left py-3 ${getSubtextColor()}`}>Status</th>
                <th className={`text-left py-3 ${getSubtextColor()}`}>Joined</th>
                <th className={`text-right py-3 ${getSubtextColor()}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className={`border-b ${isLightMode ? 'border-gray-100' : 'border-white/5'}`}>
                  <td className="py-4">
                    <div>
                      <p className={`font-medium ${getTextColor()}`}>{user.name}</p>
                      <p className={`text-sm ${getSubtextColor()}`}>{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.accountType === 'individual' ? 'bg-blue-500/20 text-blue-400' :
                      user.accountType === 'family' ? 'bg-green-500/20 text-green-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {user.accountType}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className={`py-4 ${getSubtextColor()}`}>{user.joined}</td>
                  <td className="py-4 text-right">
                    <button className="text-purple-400 hover:text-purple-300">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>User Management</h3>
        <div className="flex items-center space-x-3">
          <button className={`px-4 py-2 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-white/10'} ${getTextColor()}`}>
            <RefreshCw className="w-4 h-4 inline mr-2" /> Refresh
          </button>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg">
            Export Users
          </button>
        </div>
      </div>
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
                <th className={`text-left py-3 ${getSubtextColor()}`}>User</th>
                <th className={`text-left py-3 ${getSubtextColor()}`}>Account Type</th>
                <th className={`text-left py-3 ${getSubtextColor()}`}>Status</th>
                <th className={`text-left py-3 ${getSubtextColor()}`}>Joined</th>
                <th className={`text-right py-3 ${getSubtextColor()}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className={`border-b ${isLightMode ? 'border-gray-100' : 'border-white/5'}`}>
                  <td className="py-4">
                    <div>
                      <p className={`font-medium ${getTextColor()}`}>{user.name}</p>
                      <p className={`text-sm ${getSubtextColor()}`}>{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.accountType === 'individual' ? 'bg-blue-500/20 text-blue-400' :
                      user.accountType === 'family' ? 'bg-green-500/20 text-green-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {user.accountType}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className={`py-4 ${getSubtextColor()}`}>{user.joined}</td>
                  <td className="py-4 text-right space-x-2">
                    <button className="text-purple-400 hover:text-purple-300">View</button>
                    <button className="text-blue-400 hover:text-blue-300">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold ${getTextColor()}`}>Platform Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Total Revenue</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(stats.totalRevenue)}</p>
          <span className="text-green-400 text-sm">+{stats.revenueGrowth}% this month</span>
        </div>
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Active Users</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatNumber(stats.activeUsers)}</p>
          <span className={`text-sm ${getSubtextColor()}`}>{Math.round(stats.activeUsers/stats.totalUsers*100)}% of total</span>
        </div>
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>New Users</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{stats.newUsersThisMonth}</p>
          <span className={`text-sm ${getSubtextColor()}`}>This month</span>
        </div>
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Transactions</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatNumber(stats.totalTransactions)}</p>
          <span className={`text-sm ${getSubtextColor()}`}>All time</span>
        </div>
      </div>
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h4 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Revenue Chart</h4>
        <div className={`h-64 flex items-center justify-center ${isLightMode ? 'bg-gray-50' : 'bg-white/5'} rounded-lg`}>
          <p className={getSubtextColor()}>Chart visualization would appear here</p>
        </div>
      </div>
    </div>
  )

  const renderSubscriptions = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold ${getTextColor()}`}>Subscription Management</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Active Subscriptions</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatNumber(stats.activeSubscriptions)}</p>
        </div>
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Monthly Revenue</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(stats.monthlyRevenue)}</p>
        </div>
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Churn Rate</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>2.3%</p>
        </div>
      </div>
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h4 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Subscription Plans</h4>
        <div className="space-y-3">
          {['Individual Basic', 'Individual Premium', 'Family Plan', 'Business Plan'].map((plan, idx) => (
            <div key={idx} className={`flex items-center justify-between p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
              <span className={getTextColor()}>{plan}</span>
              <span className={getSubtextColor()}>{Math.floor(Math.random() * 500) + 100} subscribers</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSystem = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold ${getTextColor()}`}>System Status</h3>
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <Server className={`w-6 h-6 ${getSubtextColor()}`} />
              <span className={`font-medium ${getTextColor()}`}>API Server</span>
            </div>
            <span className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" /> Operational
            </span>
          </div>
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <Database className={`w-6 h-6 ${getSubtextColor()}`} />
              <span className={`font-medium ${getTextColor()}`}>Database</span>
            </div>
            <span className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" /> Operational
            </span>
          </div>
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <Activity className={`w-6 h-6 ${getSubtextColor()}`} />
              <span className={`font-medium ${getTextColor()}`}>Background Jobs</span>
            </div>
            <span className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" /> Running
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold ${getTextColor()}`}>Admin Settings</h3>
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="space-y-4">
          {['Platform Settings', 'Email Configuration', 'Payment Gateway', 'Security Settings', 'API Keys'].map((setting, idx) => (
            <div key={idx} className={`flex items-center justify-between p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
              <span className={getTextColor()}>{setting}</span>
              <button className="text-purple-400 hover:text-purple-300">Configure</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'users': return renderUsers()
      case 'analytics': return renderAnalytics()
      case 'subscriptions': return renderSubscriptions()
      case 'system': return renderSystem()
      case 'settings': return renderSettings()
      default: return renderOverview()
    }
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className={`hidden lg:block w-64 min-h-screen ${getCardClass()} border-r`}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isLightMode ? 'bg-purple-100 text-purple-600' : 'bg-purple-500/20 text-purple-400'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-medium ${getTextColor()}`}>Admin Panel</p>
              <p className={`text-sm ${getSubtextColor()}`}>Demo Mode</p>
            </div>
          </div>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? isLightMode
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-purple-500/20 text-purple-400'
                    : `${getTextColor()} hover:${isLightMode ? 'bg-gray-100' : 'bg-white/5'}`
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex overflow-x-auto space-x-2 mb-6 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : `${getCardClass()} ${getTextColor()}`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {renderContent()}
      </main>
    </div>
  )
}

export default DemoAdminDashboard
