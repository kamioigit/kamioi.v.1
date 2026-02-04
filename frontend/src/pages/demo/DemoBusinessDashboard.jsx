import React, { useState } from 'react'
import {
  Home, PieChart, Users, Target, Settings, Building2, Briefcase, DollarSign,
  ArrowUpRight, TrendingUp, Wallet, BarChart3, FileText, CreditCard, UserPlus, Crown
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import { useTheme } from '../../context/ThemeContext'

const DemoBusinessDashboard = () => {
  const { DEMO_DATA } = useDemo()
  const { isLightMode, isBlackMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  const data = DEMO_DATA.business
  const { user, team, portfolio, transactions, goals, stats } = data

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
    { id: 'team', label: 'Team', icon: Users },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Business Header */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
              isLightMode ? 'bg-orange-100' : 'bg-orange-500/20'
            }`}>
              <Building2 className={`w-8 h-8 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${getTextColor()}`}>{user.businessName}</h2>
              <p className={getSubtextColor()}>{user.businessType.toUpperCase()} • {stats.teamMembers} team members</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center">
            <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-orange-100' : 'bg-orange-500/20'}`}>
              <Wallet className={`w-6 h-6 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`} />
            </div>
            <span className="text-green-400 text-sm flex items-center">
              <ArrowUpRight className="w-4 h-4" />
              +{portfolio.gainPercent}%
            </span>
          </div>
          <p className={getSubtextColor()}>Business Portfolio</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(portfolio.totalValue)}</p>
        </div>

        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-green-100' : 'bg-green-500/20'}`}>
              <TrendingUp className={`w-6 h-6 ${isLightMode ? 'text-green-600' : 'text-green-400'}`} />
            </div>
          </div>
          <p className={getSubtextColor()}>Total Gain</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(portfolio.totalGain)}</p>
        </div>

        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-purple-100' : 'bg-purple-500/20'}`}>
              <DollarSign className={`w-6 h-6 ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`} />
            </div>
          </div>
          <p className={getSubtextColor()}>Business Round-Ups</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(stats.totalBusinessRoundups)}</p>
        </div>

        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isLightMode ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
              <CreditCard className={`w-6 h-6 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
            </div>
          </div>
          <p className={getSubtextColor()}>Monthly Expenses</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(stats.expensesThisMonth)}</p>
        </div>
      </div>

      {/* Team & Expenses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>Team Members</h3>
            <button className="text-orange-400 hover:text-orange-300 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {team.slice(0, 4).map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isLightMode ? 'bg-gray-100' : 'bg-white/10'
                  }`}>
                    {member.role === 'admin' ? (
                      <Crown className={`w-5 h-5 ${isLightMode ? 'text-yellow-500' : 'text-yellow-400'}`} />
                    ) : (
                      <Briefcase className={`w-5 h-5 ${getSubtextColor()}`} />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${getTextColor()}`}>{member.name}</p>
                    <p className={`text-sm ${getSubtextColor()}`}>{member.title}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  member.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>Recent Expenses</h3>
            <button className="text-orange-400 hover:text-orange-300 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isLightMode ? 'bg-gray-100' : 'bg-white/10'
                  }`}>
                    <CreditCard className={`w-5 h-5 ${getSubtextColor()}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${getTextColor()}`}>{tx.merchant}</p>
                    <p className={`text-sm ${getSubtextColor()}`}>{tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getTextColor()}`}>{formatCurrency(tx.amount)}</p>
                  <p className={`text-sm ${getSubtextColor()}`}>{tx.employee}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Business Goals</h3>
          <button className="text-orange-400 hover:text-orange-300 text-sm">Add Goal</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${getTextColor()}`}>{goal.name}</span>
                <span className={`text-sm ${getSubtextColor()}`}>{goal.progress}%</span>
              </div>
              <div className={`w-full h-2 rounded-full ${isLightMode ? 'bg-gray-200' : 'bg-white/10'}`}>
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
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

      {/* Holdings */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Business Holdings</h3>
          <button className="text-orange-400 hover:text-orange-300 text-sm">Manage</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {portfolio.holdings.map((holding, idx) => (
            <div key={idx} className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                  isLightMode ? 'bg-white shadow' : 'bg-white/10'
                } ${getTextColor()}`}>
                  {holding.ticker.slice(0, 2)}
                </div>
                <div>
                  <p className={`font-medium ${getTextColor()}`}>{holding.ticker}</p>
                  <p className={`text-xs ${getSubtextColor()}`}>{holding.shares.toFixed(3)} shares</p>
                </div>
              </div>
              <p className={`text-lg font-bold ${getTextColor()}`}>{formatCurrency(holding.value)}</p>
              <p className={`text-sm ${holding.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                +{holding.gainPercent}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>Team Members</h3>
        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center">
          <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div key={member.id} className={`${getCardClass()} rounded-xl p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isLightMode ? 'bg-gray-100' : 'bg-white/10'
                }`}>
                  {member.role === 'admin' ? (
                    <Crown className={`w-7 h-7 ${isLightMode ? 'text-yellow-500' : 'text-yellow-400'}`} />
                  ) : (
                    <Briefcase className={`w-7 h-7 ${getSubtextColor()}`} />
                  )}
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${getTextColor()}`}>{member.name}</h4>
                  <p className={`text-sm ${getSubtextColor()}`}>{member.title}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-sm ${getSubtextColor()}`}>{member.email}</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  member.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {member.status}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  isLightMode ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-white/70'
                }`}>
                  {member.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPortfolio = () => (
    <div className="space-y-6">
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Business Portfolio</h3>
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

  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Monthly Expenses</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatCurrency(stats.expensesThisMonth)}</p>
        </div>
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Top Category</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{stats.topCategory}</p>
        </div>
        <div className={`${getCardClass()} rounded-xl p-6`}>
          <p className={getSubtextColor()}>Total Transactions</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{transactions.length}</p>
        </div>
      </div>
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Expense History</h3>
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
                  <p className={`text-sm ${getSubtextColor()}`}>{tx.category} • {tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${getTextColor()}`}>{formatCurrency(tx.amount)}</p>
                <p className={`text-sm ${getSubtextColor()}`}>by {tx.employee}</p>
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
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>Business Goals</h3>
        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
          Create Goal
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${getSubtextColor()}`}>{goal.progress}% complete</span>
              <button className="text-orange-400 hover:text-orange-300 text-sm">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Business Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Monthly Summary', 'Expense Analysis', 'Investment Performance', 'Team Activity', 'Tax Report', 'Custom Report'].map((report, idx) => (
            <div key={idx} className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white/5 hover:bg-white/10'} cursor-pointer transition-all`}>
              <div className="flex items-center space-x-3">
                <FileText className={`w-8 h-8 ${getSubtextColor()}`} />
                <div>
                  <p className={`font-medium ${getTextColor()}`}>{report}</p>
                  <p className={`text-sm ${getSubtextColor()}`}>Generate report</p>
                </div>
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
        <h3 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Business Settings</h3>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${getTextColor()}`}>Business Information</p>
                <p className={`text-sm ${getSubtextColor()}`}>{user.businessName} • {user.businessType.toUpperCase()}</p>
              </div>
              <button className="text-orange-400 hover:text-orange-300">Edit</button>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${getTextColor()}`}>Team Permissions</p>
                <p className={`text-sm ${getSubtextColor()}`}>Manage team member access levels</p>
              </div>
              <button className="text-orange-400 hover:text-orange-300">Configure</button>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${getTextColor()}`}>Expense Categories</p>
                <p className={`text-sm ${getSubtextColor()}`}>Customize expense categorization</p>
              </div>
              <button className="text-orange-400 hover:text-orange-300">Manage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'team': return renderTeam()
      case 'portfolio': return renderPortfolio()
      case 'expenses': return renderExpenses()
      case 'goals': return renderGoals()
      case 'reports': return renderReports()
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
              isLightMode ? 'bg-orange-100 text-orange-600' : 'bg-orange-500/20 text-orange-400'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-medium ${getTextColor()}`}>{user.businessName}</p>
              <p className={`text-sm ${getSubtextColor()}`}>Business Account</p>
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
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-orange-500/20 text-orange-400'
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
                  ? 'bg-orange-500 text-white'
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

export default DemoBusinessDashboard
