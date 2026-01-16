import React, { useState, useEffect } from 'react'
import { Building2, TrendingUp, DollarSign, Users, CreditCard, PieChart, BarChart3, LineChart, Calendar, FileText, Settings, Bell, Download, Upload, Plus, Eye, Edit, Trash2, Filter, Search, ChevronDown, ChevronUp, Target, Zap, Shield, Globe, Briefcase, Receipt, Banknote, TrendingDown, AlertCircle, CheckCircle, Clock, Star, Award, Gift, X, Phone } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import RechartsChart from '../common/RechartsChart'
import BankUploadSync from './BankUploadSync'
import BusinessAIInsights from './BusinessAIInsights'
import BusinessTransactions from './BusinessTransactions'
import BusinessNotifications from './BusinessNotifications'

const BusinessDashboard = ({ user, activeTab, setActiveTab, profileImage, onImageUpload, businessMetrics, onTransactionProcessed }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
   const { isLightMode } = useTheme()
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false)
  const [showEditEmployee, setShowEditEmployee] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [showEditTransaction, setShowEditTransaction] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showBankUpload, setShowBankUpload] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState(null)
  const [showBusinessProfile, setShowBusinessProfile] = useState(false)
  const [businessProfile, setBusinessProfile] = useState({
    businessName: user?.businessName || '',
    businessType: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessZipCode: '',
    businessPhone: '',
    businessEmail: user?.email || '',
    businessWebsite: '',
    businessDescription: '',
    businessIndustry: '',
    businessSize: ''
  })
  const { logout } = useAuth()

  const getTextColor = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200' : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'

  // businessMetrics is now passed as a prop from BusinessDashboardPage

  const [expenseCategories, setExpenseCategories] = useState([])

  const [employeeInvestments, setEmployeeInvestments] = useState([])

  const [businessGoals, setBusinessGoals] = useState([])

  const [recentTransactions, setRecentTransactions] = useState([])

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>Business Overview</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              console.log('Bank Upload/Sync button clicked')
              setActiveTab('bank-sync')
            }}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 flex items-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Bank Upload/Sync</span>
          </button>
          <select 
            value={selectedPeriod}
            onChange={(e) => {
              console.log('Period changed to:', e.target.value)
              setSelectedPeriod(e.target.value)
            }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={getCardClass()}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${isLightMode ? 'bg-green-100' : 'bg-green-500/20'}`}>
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{businessMetrics?.monthlyGrowth || 0}%</span>
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${getTextColor()} mb-1`}>
            ${(businessMetrics?.totalRevenue || 0).toLocaleString()}
          </h3>
          <p className={`${getSubtextClass()} text-sm`}>Total Revenue</p>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${isLightMode ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center space-x-1 text-blue-400">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${getTextColor()} mb-1`}>
            ${(businessMetrics?.totalInvestments || 0).toLocaleString()}
          </h3>
          <p className={`${getSubtextClass()} text-sm`}>Total Investments</p>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${isLightMode ? 'bg-purple-100' : 'bg-purple-500/20'}`}>
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center space-x-1 text-purple-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">All Active</span>
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${getTextColor()} mb-1`}>
            {businessMetrics?.activeEmployees || 0}
          </h3>
          <p className={`${getSubtextClass()} text-sm`}>Team Members</p>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${isLightMode ? 'bg-orange-100' : 'bg-orange-500/20'}`}>
              <Award className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex items-center space-x-1 text-orange-400">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Excellent</span>
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${getTextColor()} mb-1`}>
            {businessMetrics?.businessScore || 0}/100
          </h3>
          <p className={`${getSubtextClass()} text-sm`}>Business Score</p>
        </div>
      </div>

      {/* Business Performance Chart */}
      <div className={getCardClass()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-semibold ${getTextColor()}`}>Business Performance</h3>
          <div className="flex space-x-2">
            {['7d', '30d', '90d', '1y'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white'
                    : `${isLightMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        {/* Business Performance Chart */}
        <div className="h-64">
          <RechartsChart
            type="line"
            height={250}
            data={[]}
            series={[
              { dataKey: 'revenue', name: 'Revenue', color: '#3b82f6' },
              { dataKey: 'investments', name: 'Investments', color: '#10b981' }
            ]}
          />
        </div>
      </div>

      {/* Expense Categories */}
      <div className={getCardClass()}>
        <h3 className={`text-xl font-semibold ${getTextColor()} mb-6`}>Expense Categories</h3>
        <div className="space-y-4">
          {expenseCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <div>
                  <p className={`${getTextColor()} font-medium`}>{category.name}</p>
                  <p className={`${getSubtextClass()} text-sm`}>${category.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className={`${getTextColor()} font-semibold`}>{category.percentage}%</span>
                  {category.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTeamTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>Team Investment Management</h3>
        <button 
          onClick={() => {
            console.log('Add Employee button clicked')
            setShowAddEmployee(true)
          }}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Overview */}
        <div className={getCardClass()}>
          <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Team Overview</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={getSubtextClass()}>Total Team Investments</span>
              <span className={`${getTextColor()} font-semibold`}>
                ${employeeInvestments.reduce((sum, emp) => sum + emp.investment, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={getSubtextClass()}>Average Growth</span>
              <span className="text-green-400 font-semibold">
                +{(employeeInvestments.reduce((sum, emp) => sum + emp.growth, 0) / employeeInvestments.length).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={getSubtextClass()}>Active Members</span>
              <span className={`${getTextColor()} font-semibold`}>
                {employeeInvestments.filter(emp => emp.status === 'active').length}
              </span>
            </div>
          </div>
        </div>

        {/* Team Performance Chart */}
        <div className={getCardClass()}>
          <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Team Performance</h4>
          <div className="h-48">
            <RechartsChart
              type="bar"
              height={180}
              data={[]}
              series={[
                { dataKey: 'investment', name: 'Investment', color: '#10b981' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className={getCardClass()}>
        <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Team Members</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-3 text-gray-400 font-medium">Employee</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Role</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Investment</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Growth</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Status</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeInvestments.map((employee, index) => (
                <tr key={index} className="border-b border-white/5 last:border-b-0">
                  <td className="py-3 pr-3">
                    <div>
                      <p className={`${getTextColor()} font-medium`}>{employee.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-300">{employee.role}</td>
                  <td className="py-3 px-3 text-gray-300">${employee.investment.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className="text-green-400 font-semibold">+{employee.growth}%</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      {employee.status}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setShowEmployeeDetails(true)
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setShowEditEmployee(true)
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
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
  )

  const renderGoalsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>Business Goals</h3>
        <button 
          onClick={() => {
            console.log('New Goal button clicked')
            setShowNewGoal(true)
          }}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {businessGoals.map(goal => {
          const progress = (goal.current / goal.target) * 100
          return (
            <div key={goal.id} className={getCardClass()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className={`text-lg font-semibold ${getTextColor()}`}>{goal.title}</h4>
                  <p className={`${getSubtextClass()} text-sm`}>Target: ${goal.target.toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  goal.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {goal.priority}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className={`${getTextColor()} font-semibold`}>
                    ${goal.current.toLocaleString()}
                  </span>
                  <span className={`${getSubtextClass()} text-sm`}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`${getSubtextClass()} text-sm`}>
                  Deadline: {goal.deadline}
                </span>
                <div className="flex space-x-2">
                  <button className="p-1 hover:bg-white/10 rounded transition-colors" title="Edit">
                    <Edit className="w-4 h-4 text-blue-400" />
                  </button>
                  <button className="p-1 hover:bg-white/10 rounded transition-colors" title="View Details">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderTransactionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>Business Transactions</h3>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              console.log('Filter button clicked')
              setShowFilterModal(true)
            }}
            className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg px-4 py-2 text-gray-400 flex items-center space-x-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button 
            onClick={() => {
              console.log('Export button clicked')
              setShowExportModal(true)
            }}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className={getCardClass()}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-3 text-gray-400 font-medium">Date</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Vendor</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Category</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Amount</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Round-up</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Investment</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(transaction => (
                <tr key={transaction.id} className="border-b border-white/5 last:border-b-0">
                  <td className="py-3 pr-3 text-gray-300">{transaction.date}</td>
                  <td className="py-3 px-3">
                    <p className={`${getTextColor()} font-medium`}>{transaction.vendor}</p>
                  </td>
                  <td className="py-3 px-3 text-gray-300">{transaction.category}</td>
                  <td className="py-3 px-3 text-gray-300">${transaction.amount.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className="text-green-400 font-semibold">
                      ${transaction.roundUp}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {transaction.investment}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => {
                          console.log('View transaction details clicked for:', transaction.id)
                          setSelectedTransaction(transaction)
                          setShowTransactionDetails(true)
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Edit transaction clicked for:', transaction.id)
                          setSelectedTransaction(transaction)
                          setShowEditTransaction(true)
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
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
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>Business Analytics</h3>
        <div className="flex space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 rounded-lg ${isLightMode ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/10 border-white/20 text-white'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button 
            onClick={() => {
              console.log('Export analytics report clicked')
              // Add export functionality here
            }}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={getCardClass()}>
          <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Revenue Trends</h4>
          <div className="h-64">
            <RechartsChart
              type="bar"
              height={250}
              data={[]}
              series={[
                { dataKey: 'revenue', name: 'Revenue', color: '#3b82f6' }
              ]}
            />
          </div>
        </div>

        <div className={getCardClass()}>
          <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Investment Distribution</h4>
          <div className="h-64">
            <RechartsChart
              type="donut"
              height={250}
              data={[]}
            />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className={getCardClass()}>
        <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTextColor()} mb-2`}>
              {businessMetrics?.monthlyGrowth || 0}%
            </div>
            <p className={`${getSubtextClass()}`}>Monthly Growth</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTextColor()} mb-2`}>
              ${(businessMetrics?.totalInvestments || 0).toLocaleString()}
            </div>
            <p className={`${getSubtextClass()}`}>Total Investments</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTextColor()} mb-2`}>
              {businessMetrics?.activeEmployees || 0}
            </div>
            <p className={`${getSubtextClass()}`}>Active Team Members</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-xl font-semibold ${getTextColor()}`}>Business Reports</h3>
        <div className="flex space-x-3">
          <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all">
            <Plus className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all">
            <Download className="w-4 h-4" />
            <span>Export All</span>
          </button>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={getCardClass()}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className={`font-semibold ${getTextColor()}`}>Monthly Summary</h4>
          </div>
          <p className={`${getSubtextClass()} text-sm mb-4`}>
            Comprehensive monthly business performance report
          </p>
          <button 
            onClick={() => {
              console.log('Monthly Summary report generation clicked')
              setSelectedReportType('monthly-summary')
              setShowReportModal(true)
            }}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 transition-all"
          >
            Generate Report
          </button>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h4 className={`font-semibold ${getTextColor()}`}>Investment Analysis</h4>
          </div>
          <p className={`${getSubtextClass()} text-sm mb-4`}>
            Detailed analysis of team investment performance
          </p>
          <button 
            onClick={() => {
              console.log('Investment Analysis report generation clicked')
              setSelectedReportType('investment-analysis')
              setShowReportModal(true)
            }}
            className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 transition-all"
          >
            Generate Report
          </button>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className={`font-semibold ${getTextColor()}`}>Team Performance</h4>
          </div>
          <p className={`${getSubtextClass()} text-sm mb-4`}>
            Individual and team investment performance metrics
          </p>
          <button 
            onClick={() => {
              console.log('Team Performance report generation clicked')
              setSelectedReportType('team-performance')
              setShowReportModal(true)
            }}
            className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 transition-all"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className={getCardClass()}>
        <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Recent Reports</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <div>
                <p className={`${getTextColor()} font-medium`}>No reports generated yet</p>
                <p className={`${getSubtextClass()} text-sm`}>Generate your first report</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  console.log('View Monthly Summary report clicked')
                  // Open report viewer
                }}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="View Report"
              >
                <Eye className="w-4 h-4 text-gray-400" />
              </button>
              <button 
                onClick={() => {
                  console.log('Download Monthly Summary report clicked')
                  // Trigger download
                }}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="Download Report"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <p className={`${getTextColor()} font-medium`}>No reports generated yet</p>
                <p className={`${getSubtextClass()} text-sm`}>Generate your first report</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  console.log('View Investment Analysis report clicked')
                  // Open report viewer
                }}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="View Report"
              >
                <Eye className="w-4 h-4 text-gray-400" />
              </button>
              <button 
                onClick={() => {
                  console.log('Download Investment Analysis report clicked')
                  // Trigger download
                }}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="Download Report"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBankSyncTab = () => (
    <div className="space-y-6">
      <BankUploadSync onTransactionProcessed={(transactions) => {
        console.log('Processed transactions:', transactions)
        
        // Update recent transactions
        setRecentTransactions(prev => [...transactions, ...prev])
        
        // Update business metrics
        const totalRoundUps = transactions.reduce((sum, t) => sum + t.roundUp, 0)
        const totalInvestment = transactions.reduce((sum, t) => {
          return sum + Object.values(t.investmentAllocation).reduce((allocSum, alloc) => allocSum + alloc, 0)
        }, 0)
        
        // businessMetrics are now managed by the parent component (BusinessDashboardPage)
        // The onTransactionProcessed callback will handle updating the metrics
        
        // Update expense categories
        const newCategories = transactions.reduce((acc, t) => {
          const existing = acc.find(cat => cat.name === t.category)
          if (existing) {
            existing.amount += Math.abs(t.amount)
          } else {
            acc.push({
              name: t.category,
              amount: Math.abs(t.amount),
              percentage: 0,
              trend: 'up'
            })
          }
          return acc
        }, [...expenseCategories])
        
        // Calculate percentages
        const totalAmount = newCategories.reduce((sum, cat) => sum + cat.amount, 0)
        newCategories.forEach(cat => {
          cat.percentage = totalAmount > 0 ? (cat.amount / totalAmount * 100).toFixed(1) : 0
        })
        
        setExpenseCategories(newCategories)
        
        // Call the parent's transaction processed handler
        if (onTransactionProcessed) {
          onTransactionProcessed(transactions)
        }
        
        // Show success message
        alert(`Successfully processed ${transactions.length} transactions!`)
      }} />
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold ${getTextColor()}`}>Business Settings</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <div className={getCardClass()}>
          <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Business Information</h4>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
                Business Name
              </label>
              <input
                type="text"
                defaultValue="Kamioi Business Solutions"
                className={`w-full px-3 py-2 rounded-lg ${isLightMode ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/10 border-white/20 text-white'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
                Business Type
              </label>
              <select className={`w-full px-3 py-2 rounded-lg ${isLightMode ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/10 border-white/20 text-white'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                <option>LLC</option>
                <option>Corporation</option>
                <option>Partnership</option>
                <option>Sole Proprietorship</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
                Tax ID
              </label>
              <input
                type="text"
                defaultValue="12-3456789"
                className={`w-full px-3 py-2 rounded-lg ${isLightMode ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/10 border-white/20 text-white'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        </div>

        {/* Investment Settings */}
        <div className={getCardClass()}>
          <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Investment Settings</h4>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
                Default Round-up Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="10"
                  defaultValue="1"
                  placeholder="1"
                  className={`w-full pl-8 pr-3 py-2 rounded-lg ${isLightMode ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/10 border-white/20 text-white'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <p className={`text-xs ${getSubtextClass()} mt-1`}>Enter whole dollar amounts only (e.g., 1, 2, 3, 4)</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
                Investment Risk Level
              </label>
              <select className={`w-full px-3 py-2 rounded-lg ${isLightMode ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/10 border-white/20 text-white'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                <option>Conservative</option>
                <option>Moderate</option>
                <option>Aggressive</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className={`block text-sm font-medium ${getTextColor()}`}>
                  Auto-invest Round-ups
                </label>
                <p className={`text-xs ${getSubtextClass()}`}>
                  Automatically invest round-ups
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Business Profile Section */}
      <div className={getCardClass()}>
        <div className="flex justify-between items-center mb-4">
          <h4 className={`text-lg font-semibold ${getTextColor()}`}>Business Profile</h4>
          <button
            onClick={() => {
              console.log('Edit business profile clicked')
              setShowBusinessProfile(true)
            }}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Business Name</label>
            <p className={`${getSubtextClass()}`}>{businessProfile.businessName}</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Business Type</label>
            <p className={`${getSubtextClass()}`}>{businessProfile.businessType}</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Address</label>
            <p className={`${getSubtextClass()}`}>{businessProfile.businessAddress}, {businessProfile.businessCity}, {businessProfile.businessState} {businessProfile.businessZipCode}</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Phone</label>
            <p className={`${getSubtextClass()}`}>{businessProfile.businessPhone}</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Email</label>
            <p className={`${getSubtextClass()}`}>{businessProfile.businessEmail}</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Website</label>
            <p className={`${getSubtextClass()}`}>{businessProfile.businessWebsite}</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Industry</label>
            <p className={`${getSubtextClass()}`}>{businessProfile.businessIndustry}</p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Company Size</label>
            <p className={`${getSubtextClass()}`}>{businessProfile.businessSize}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => {
            console.log('Save settings button clicked')
            // Add save settings functionality here
          }}
          className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-6 py-2 text-green-400 flex items-center space-x-2 transition-all"
        >
          <Settings className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${getTextColor()} flex items-center space-x-3`}>
            <Building2 className="w-8 h-8 text-blue-400" />
            <span>Business Dashboard</span>
          </h1>
          <p className={`${getSubtextClass()} mt-1`}>Manage your business investments, team, and financial goals</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className={`${getTextColor()} font-semibold`}>{user?.businessName || 'Business Account'}</p>
            <p className={`${getSubtextClass()} text-sm`}>Premium Business Account</p>
          </div>
          <div className="relative">
            {profileImage ? (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`p-3 rounded-full ${isLightMode ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
            )}
            <button 
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = onImageUpload
                input.click()
              }}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-blue-600 transition-colors"
              title="Change Profile Picture"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`w-full ${getCardClass()}`}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'team' && renderTeamTab()}
        {activeTab === 'goals' && renderGoalsTab()}
        {activeTab === 'transactions' && <BusinessTransactions user={user} />}
        {activeTab === 'bank-sync' && renderBankSyncTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'reports' && renderReportsTab()}
        {activeTab === 'ai' && <BusinessAIInsights user={user} />}
        {activeTab === 'notifications' && <BusinessNotifications user={user} />}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Add Employee</h3>
              <button 
                onClick={() => setShowAddEmployee(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Employee Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="employee@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Employee</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Engineering, Sales, Marketing"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowAddEmployee(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowAddEmployee(false)
                  // Employee added successfully - could show a toast notification here
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {showNewGoal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">New Business Goal</h3>
              <button 
                onClick={() => setShowNewGoal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal Title</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q1 Revenue Target"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Amount</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea 
                  rows="3"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the business goal..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowNewGoal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowNewGoal(false)
                  // Business goal created successfully - could show a toast notification here
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Employee Details</h3>
              <button 
                onClick={() => setShowEmployeeDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <p className="text-white">{selectedEmployee.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <p className="text-white">{selectedEmployee.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Investment</label>
                <p className="text-white">${selectedEmployee.investment.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Growth</label>
                <p className="text-green-400">+{selectedEmployee.growth}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <p className="text-white">{selectedEmployee.status}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowEmployeeDetails(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployee && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Employee</h3>
              <button 
                onClick={() => setShowEditEmployee(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input 
                  type="text" 
                  defaultValue={selectedEmployee.name}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Employee</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Investment Limit</label>
                <input 
                  type="number" 
                  defaultValue={selectedEmployee.investment}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowEditEmployee(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowEditEmployee(false)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Filter Transactions</h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Last year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="number" 
                    placeholder="Max"
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Categories</option>
                  <option>Office Supplies</option>
                  <option>Marketing</option>
                  <option>Software</option>
                  <option>Travel</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowFilterModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Export Transactions</h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Export Format</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>CSV</option>
                  <option>Excel (.xlsx)</option>
                  <option>PDF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Time</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Last year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Include Fields</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-white text-sm">Transaction Details</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-white text-sm">Investment Data</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-white text-sm">Round-up Amounts</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionDetails && selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Transaction Details</h3>
              <button 
                onClick={() => setShowTransactionDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Vendor</label>
                <p className="text-white">{selectedTransaction.vendor}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                <p className="text-white">${selectedTransaction.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Round-up</label>
                <p className="text-white">${selectedTransaction.roundUp}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Investment</label>
                <p className="text-white">{selectedTransaction.investment}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <p className="text-white">{selectedTransaction.date}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowTransactionDetails(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditTransaction && selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Transaction</h3>
              <button 
                onClick={() => setShowEditTransaction(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vendor</label>
                <input 
                  type="text" 
                  defaultValue={selectedTransaction.vendor}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input 
                  type="number" 
                  defaultValue={selectedTransaction.amount}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Office Supplies</option>
                  <option>Marketing</option>
                  <option>Software</option>
                  <option>Travel</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowEditTransaction(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowEditTransaction(false)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && selectedReportType && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-lg mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Generate {selectedReportType === 'monthly-summary' ? 'Monthly Summary' : 
                         selectedReportType === 'investment-analysis' ? 'Investment Analysis' : 
                         'Team Performance'} Report
              </h3>
              <button 
                onClick={() => {
                  setShowReportModal(false)
                  setSelectedReportType(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Report Period</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                  <option>Custom Range</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Report Format</label>
                <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>PDF</option>
                  <option>Excel (.xlsx)</option>
                  <option>CSV</option>
                </select>
              </div>

              {selectedReportType === 'team-performance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Include Team Members</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-white text-sm">All Team Members</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-white text-sm">John Smith - Manager</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-white text-sm">Sarah Johnson - Employee</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-white text-sm">Mike Davis - Employee</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Report To</label>
                <input 
                  type="email" 
                  placeholder="Enter email address (optional)"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => {
                  setShowReportModal(false)
                  setSelectedReportType(null)
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log(`Generating ${selectedReportType} report`)
                  setShowReportModal(false)
                  setSelectedReportType(null)
                  // Add report generation logic here
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Profile Edit Modal */}
      {showBusinessProfile && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Business Profile</h3>
              <button 
                onClick={() => setShowBusinessProfile(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
                  <input 
                    type="text" 
                    value={businessProfile.businessName}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessName: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
                  <select 
                    value={businessProfile.businessType}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LLC">LLC</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Address</label>
                <input 
                  type="text" 
                  value={businessProfile.businessAddress}
                  onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessAddress: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                  <input 
                    type="text" 
                    value={businessProfile.businessCity}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessCity: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                  <input 
                    type="text" 
                    value={businessProfile.businessState}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessState: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Zip Code</label>
                  <input 
                    type="text" 
                    value={businessProfile.businessZipCode}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessZipCode: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    value={businessProfile.businessPhone}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessPhone: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={businessProfile.businessEmail}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessEmail: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input 
                  type="url" 
                  value={businessProfile.businessWebsite}
                  onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessWebsite: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                  <select 
                    value={businessProfile.businessIndustry}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessIndustry: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Size</label>
                  <select 
                    value={businessProfile.businessSize}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessSize: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="10-50 employees">10-50 employees</option>
                    <option value="50-200 employees">50-200 employees</option>
                    <option value="200+ employees">200+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Description</label>
                <textarea 
                  rows="3"
                  value={businessProfile.businessDescription}
                  onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessDescription: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowBusinessProfile(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log('Business profile saved:', businessProfile)
                  setShowBusinessProfile(false)
                  // Add save logic here
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessDashboard
