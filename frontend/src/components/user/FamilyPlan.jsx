import React, { useState } from 'react'
import { TrendingUp, Users, Settings, PieChart, Shield, UserPlus } from 'lucide-react'
import RechartsChart from '../common/RechartsChart'

const FamilyPlan = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview')

  // Initialize with empty family data - will be populated from API
  const [familyMembers, setFamilyMembers] = useState([])
  const [familyTransactions, setFamilyTransactions] = useState([])

  return (
    <div className="space-y-6">
      {/* Family Plan Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Family Investment Plan</h2>
              <p className="text-gray-300">Manage your family's investments together</p>
            </div>
          </div>
          <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>

        {/* Family Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{familyMembers.length}</div>
            <div className="text-gray-400 text-sm">Family Members</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">$0</div>
            <div className="text-gray-400 text-sm">Total Family Portfolio</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">0</div>
            <div className="text-gray-400 text-sm">Joint Transactions</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">0%</div>
            <div className="text-gray-400 text-sm">Family ROI</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          {['overview', 'members', 'transactions', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-4">
              <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                <PieChart className="w-4 h-4" />
                <span>Family Allocation</span>
              </h4>
              <RechartsChart 
                type="donut"
                height={250}
                series={familyMembers.map(m => m.allocation)}
                options={{
                  labels: familyMembers.map(m => m.name),
                  colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']
                }}
              />
            </div>
            <div className="glass-card p-4">
              <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Family Performance</span>
              </h4>
              <RechartsChart 
                type="line"
                height={250}
                series={[{
                  name: 'Family Portfolio',
                  data: [20000, 21500, 22800, 23400, 24200, 24800, 25430]
                }]}
              />
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            {familyMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-gray-400 text-sm">{member.role} � {member.allocation}% allocation</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {member.allowable && (
                    <span className="text-green-400 text-sm">${member.allowance}/week allowance</span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${
                    member.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {member.status}
                  </span>
                  <button className="text-gray-400 hover:text-white">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-3">
            {familyTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{transaction.merchant}</p>
                    <p className="text-gray-400 text-sm">by {transaction.member}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">${transaction.amount}</p>
                  <p className="text-green-400 text-sm">+${transaction.roundUp} invested in {transaction.stock}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-bold text-white mb-2">Family Settings</h4>
              <p className="text-gray-400 text-sm">Manage your family plan preferences and permissions</p>
            </div>
            <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium">
              Manage Family Settings
            </button>
          </div>
        )}
      </div>

      {/* Educational Section */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Family Investment Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="font-medium text-white mb-1">Teaching Kids About Money</h4>
            <p className="text-gray-400 text-sm">Age-appropriate investment lessons for children</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <h4 className="font-medium text-white mb-1">Family Financial Goals</h4>
            <p className="text-gray-400 text-sm">Set and track shared investment objectives</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="font-medium text-white mb-1">Allowance Management</h4>
            <p className="text-gray-400 text-sm">Automate allowances with round-up investing</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FamilyPlan
