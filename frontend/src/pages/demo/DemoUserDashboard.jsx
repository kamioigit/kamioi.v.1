import React, { useState } from 'react'
import {
  Home, PieChart, CreditCard, Target, TrendingUp, Settings, Bell, History,
  DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Sparkles, ChevronRight,
  Plus, Filter, Download, RefreshCw
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import { useTheme } from '../../context/ThemeContext'

const DemoUserDashboard = () => {
  const { DEMO_DATA } = useDemo()
  const { isLightMode, isBlackMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  const data = DEMO_DATA.individual
  const { user, portfolio, transactions, goals, stats } = data

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getCardClass = () => isLightMode
    ? 'bg-white border border-gray-200 shadow-sm'
    : 'bg-white/10 backdrop-blur-xl border border-white/20'

  const getTextColor = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextColor = () => isLightMode ? 'text-gray-600' : 'text-white/70'

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'roundups', label: 'Round-Ups', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
              <Wallet className={`w-6 h-6 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
            </div>
            <span className="text-green-400 text-sm flex items-center">
              <ArrowUpRight className="w-4 h-4" />
              +{portfolio.gainPercent}%
            </span>
          </div>
          <p className={getSubtextColor()}>Portfolio Value</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(portfolio.totalValue)}</p>
        </div>

        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-green-100' : 'bg-green-500/20'}`}>
              <TrendingUp className={`w-6 h-6 ${isLightMode ? 'text-green-600' : 'text-green-400'}`} />
            </div>
            <span className="text-green-400 text-sm flex items-center">
              <ArrowUpRight className="w-4 h-4" />
              All Time
            </span>
          </div>
          <p className={getSubtextColor()}>Total Gain</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(portfolio.totalGain)}</p>
        </div>

        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-purple-100' : 'bg-purple-500/20'}`}>
              <Sparkles className={`w-6 h-6 ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`} />
            </div>
            <span className={`text-sm ${getSubtextColor()}`}>This Month</span>
          </div>
          <p className={getSubtextColor()}>Round-Ups</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(stats.totalRoundups)}</p>
        </div>

        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-orange-100' : 'bg-orange-500/20'}`}>
              <CreditCard className={`w-6 h-6 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`} />
            </div>
            <span className={`text-sm ${getSubtextColor()}`}>Avg: {formatCurrency(stats.averageRoundup)}</span>
          </div>
          <p className={getSubtextColor()}>Transactions</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{stats.transactionsThisMonth}</p>
        </div>
      </div>

      {/* Holdings & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Holdings */}
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>Top Holdings</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {portfolio.holdings.slice(0, 4).map((holding, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isLightMode ? 'bg-gray-100 text-gray-800' : 'bg-white/10 text-white'
                  }`}>
                    {holding.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <p className={`font-medium ${getTextColor()}`}>{holding.ticker}</p>
                    <p className={`text-sm ${getSubtextColor()}`}>{holding.shares.toFixed(3)} shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getTextColor()}`}>{formatCurrency(holding.value)}</p>
                  <p className={`text-sm ${holding.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    +{holding.gainPercent}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>Recent Transactions</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isLightMode ? 'bg-gray-100' : 'bg-white/10'
                  }`}>
                    <CreditCard className={`w-5 h-5 ${getSubtextColor()}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${getTextColor()}`}>{tx.merchant}</p>
                    <p className={`text-sm ${getSubtextColor()}`}>{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getTextColor()}`}>{formatCurrency(tx.amount)}</p>
                  <p className="text-sm text-green-400">+{formatCurrency(tx.roundup)} → {tx.ticker}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Investment Goals</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Add Goal
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className={`${isLightMode ? 'bg-gray-50' : 'bg-white/5'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${getTextColor()}`}>{goal.name}</span>
                <span className={`text-sm ${getSubtextColor()}`}>{goal.progress}%</span>
              </div>
              <div className={`w-full h-2 rounded-full ${isLightMode ? 'bg-gray-200' : 'bg-white/10'}`}>
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className={getSubtextColor()}>{formatCurrency(goal.current)}</span>
                <span className={getSubtextColor()}>{formatCurrency(goal.target)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPortfolio = () => (
    <div className="space-y-6">
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Your Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
                <th className={`text-left py-3 ${getSubtextColor()}`}>Asset</th>
                <th className={`text-right py-3 ${getSubtextColor()}`}>Shares</th>
                <th className={`text-right py-3 ${getSubtextColor()}`}>Value</th>
                <th className={`text-right py-3 ${getSubtextColor()}`}>Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((holding, idx) => (
                <tr key={idx} className={`border-b ${isLightMode ? 'border-gray-100' : 'border-white/5'}`}>
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isLightMode ? 'bg-gray-100 text-gray-800' : 'bg-white/10 text-white'
                      }`}>
                        {holding.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <p className={`font-medium ${getTextColor()}`}>{holding.ticker}</p>
                        <p className={`text-sm ${getSubtextColor()}`}>{holding.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`text-right py-4 ${getTextColor()}`}>{holding.shares.toFixed(3)}</td>
                  <td className={`text-right py-4 ${getTextColor()}`}>{formatCurrency(holding.value)}</td>
                  <td className="text-right py-4">
                    <span className={holding.gain >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(holding.gain)} ({holding.gainPercent}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Transaction History</h3>
          <div className="flex items-center space-x-2">
            <button className={`px-3 py-1.5 rounded-lg text-sm ${isLightMode ? 'bg-gray-100' : 'bg-white/10'} ${getTextColor()}`}>
              <Filter className="w-4 h-4 inline mr-1" /> Filter
            </button>
            <button className={`px-3 py-1.5 rounded-lg text-sm ${isLightMode ? 'bg-gray-100' : 'bg-white/10'} ${getTextColor()}`}>
              <Download className="w-4 h-4 inline mr-1" /> Export
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className={`flex items-center justify-between p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isLightMode ? 'bg-white shadow' : 'bg-white/10'
                }`}>
                  <CreditCard className={`w-6 h-6 ${getSubtextColor()}`} />
                </div>
                <div>
                  <p className={`font-medium ${getTextColor()}`}>{tx.merchant}</p>
                  <p className={`text-sm ${getSubtextColor()}`}>{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${getTextColor()}`}>{formatCurrency(tx.amount)}</p>
                <p className="text-sm text-green-400">Round-up: {formatCurrency(tx.roundup)} → {tx.ticker}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>Your Investment Goals</h3>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Create Goal
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className={`${getCardClass()} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-semibold ${getTextColor()}`}>{goal.name}</h4>
              <Target className={`w-5 h-5 ${getSubtextColor()}`} />
            </div>
            <div className="mb-4">
              <div className="flex items-end justify-between mb-2">
                <span className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(goal.current)}</span>
                <span className={`text-sm ${getSubtextColor()}`}>of {formatCurrency(goal.target)}</span>
              </div>
              <div className={`w-full h-3 rounded-full ${isLightMode ? 'bg-gray-200' : 'bg-white/10'}`}>
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${getSubtextColor()}`}>{goal.progress}% complete</span>
              <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderRoundups = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Total Round-Ups</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(stats.totalRoundups)}</p>
        </div>
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Average Round-Up</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(stats.averageRoundup)}</p>
        </div>
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Top Merchant</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{stats.topMerchant}</p>
        </div>
      </div>
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Round-Up History</h3>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className={`flex items-center justify-between p-3 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
              <div>
                <p className={`font-medium ${getTextColor()}`}>{tx.merchant}</p>
                <p className={`text-sm ${getSubtextColor()}`}>{tx.date}</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-medium">+{formatCurrency(tx.roundup)}</p>
                <p className={`text-sm ${getSubtextColor()}`}>→ {tx.ticker}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Account Settings</h3>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${getTextColor()}`}>Profile Information</p>
                <p className={`text-sm ${getSubtextColor()}`}>{user.name} - {user.email}</p>
              </div>
              <button className="text-blue-400 hover:text-blue-300">Edit</button>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${getTextColor()}`}>Round-Up Settings</p>
                <p className={`text-sm ${getSubtextColor()}`}>Auto-invest enabled</p>
              </div>
              <button className="text-blue-400 hover:text-blue-300">Configure</button>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${getTextColor()}`}>Notifications</p>
                <p className={`text-sm ${getSubtextColor()}`}>Email and push notifications</p>
              </div>
              <button className="text-blue-400 hover:text-blue-300">Manage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'portfolio': return renderPortfolio()
      case 'transactions': return renderTransactions()
      case 'goals': return renderGoals()
      case 'roundups': return renderRoundups()
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isLightMode ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {user.name.charAt(0)}
            </div>
            <div>
              <p className={`font-medium ${getTextColor()}`}>{user.name}</p>
              <p className={`text-sm ${getSubtextColor()}`}>Individual Account</p>
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
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-blue-500/20 text-blue-400'
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
                  ? 'bg-blue-500 text-white'
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

export default DemoUserDashboard
