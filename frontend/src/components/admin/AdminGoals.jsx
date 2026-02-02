import React, { useState } from 'react'
import {
  Target,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  Lightbulb,
  Edit,
  Trash2
} from 'lucide-react'
import RechartsChart from '../common/RechartsChart'
import { useData } from '../../context/DataContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useTheme } from '../../context/ThemeContext'

const AdminGoals = ({ user }) => {
  const { addNotification } = useNotifications()
  const { isLightMode } = useTheme()
  const [showCreateGoal, setShowCreateGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'amount',
    target: '',
    timeframe: '12',
    description: ''
  })

  // Theme helper functions
  const getTextClass = () => isLightMode ? 'text-gray-900' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getSecondaryTextClass = () => isLightMode ? 'text-gray-500' : 'text-gray-300'
  const getCardClass = () => isLightMode
    ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm'
    : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'
  const getInnerCardClass = () => isLightMode
    ? 'bg-gray-50 rounded-lg p-3'
    : 'bg-white/5 rounded-lg p-3'
  const getInputClass = () => isLightMode
    ? 'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500/50'
    : 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50'
  const getModalClass = () => isLightMode
    ? 'bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200'
    : 'bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md mx-4'

  // Goals data from context
  const { goals, setGoals } = useData()

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-500/20 text-red-400'
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'paused': return <Clock className="w-4 h-4" />
      case 'cancelled': return <Trash2 className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getGoalTypeIcon = (type) => {
    switch (type) {
      case 'amount': return <DollarSign className="w-5 h-5" />
      case 'company': return <TrendingUp className="w-5 h-5" />
      case 'count': return <BarChart3 className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const handleCreateGoal = () => {
    console.log('Creating new admin goal:', newGoal)
    setShowCreateGoal(false)
    setNewGoal({
      title: '',
      type: 'amount',
      target: '',
      timeframe: '12',
      description: ''
    })
  }

  const handleEditGoal = (goalId) => {
    addNotification({
      type: 'info',
      title: 'Edit Goal',
      message: `Edit Admin Goal ${goalId} - This would open an edit modal for the admin goal`,
      timestamp: new Date()
    })
  }

  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this admin goal?')) {
      addNotification({
        type: 'success',
        title: 'Goal Deleted',
        message: `Delete Admin Goal ${goalId} - This would delete the admin goal`,
        timestamp: new Date()
      })
    }
  }



  const activeGoals = goals.filter(goal => goal && goal.status === 'active')
  const completedGoals = goals.filter(goal => goal && goal.status === 'completed')
  const totalInvested = goals.reduce((sum, goal) => sum + (goal?.current || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${getTextClass()}`}>Admin Investment Goals</h1>
          <p className={`${getSubtextClass()} mt-1`}>Set and track your admin financial objectives</p>
        </div>
        <button
          onClick={() => setShowCreateGoal(true)}
          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Admin Goal</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${getSubtextClass()} text-sm`}>Active Admin Goals</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{activeGoals.length}</p>
              <p className="text-red-400 text-sm flex items-center mt-1">
                <Target className="w-4 h-4 mr-1" />
                In progress
              </p>
            </div>
            <Target className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${getSubtextClass()} text-sm`}>Total Admin Invested</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>${totalInvested.toLocaleString()}</p>
              <p className="text-green-400 text-sm flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Across all admin goals
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${getSubtextClass()} text-sm`}>Completed Admin Goals</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{completedGoals.length}</p>
              <p className="text-green-400 text-sm flex items-center mt-1">
                <Award className="w-4 h-4 mr-1" />
                Admin achievements
              </p>
            </div>
            <Award className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={getModalClass()}>
            <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Create New Admin Goal</h3>

            <div className="space-y-4">
              <div>
                <label className={`block ${getSubtextClass()} text-sm mb-2`}>Admin Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="Enter admin goal description"
                  className={getInputClass()}
                />
              </div>

              <div>
                <label className={`block ${getSubtextClass()} text-sm mb-2`}>Goal Type</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                  className={getInputClass()}
                >
                  <option value="amount">Total Amount</option>
                  <option value="company">Company-Specific</option>
                  <option value="count">Number of Round-Ups</option>
                </select>
              </div>

              <div>
                <label className={`block ${getSubtextClass()} text-sm mb-2`}>Target</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                  placeholder={newGoal.type === 'amount' ? '10000' : newGoal.type === 'count' ? '200' : '2000'}
                  className={getInputClass()}
                />
              </div>

              <div>
                <label className={`block ${getSubtextClass()} text-sm mb-2`}>Timeframe (months)</label>
                <input
                  type="number"
                  value={newGoal.timeframe}
                  onChange={(e) => setNewGoal({...newGoal, timeframe: e.target.value})}
                  placeholder="12"
                  className={getInputClass()}
                />
              </div>

              <div>
                <label className={`block ${getSubtextClass()} text-sm mb-2`}>Description (optional)</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Why is this admin goal important?"
                  rows={3}
                  className={getInputClass()}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateGoal}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 transition-all"
              >
                Create Admin Goal
              </button>
              <button
                onClick={() => setShowCreateGoal(false)}
                className={`flex-1 rounded-lg px-4 py-2 transition-all ${isLightMode ? 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600' : 'bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-6">
        {goals.map((goal) => (
          <div key={goal.id} className={getCardClass()}>
            <div className="flex items-start justify-between mb-4">
              <div className={`flex items-center space-x-3 ${getSubtextClass()}`}>
                {getGoalTypeIcon(goal.type)}
                <div>
                  <h3 className={`text-xl font-semibold ${getTextClass()}`}>{goal.title}</h3>
                  <p className={`${getSubtextClass()} text-sm`}>
                    {goal.type === 'amount' && `$${goal.target.toLocaleString()} admin target`}
                    {goal.type === 'company' && `${goal.company} stock investment`}
                    {goal.type === 'count' && `${goal.target} admin round-up transactions`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${getStatusColor(goal.status)}`}>
                  {getStatusIcon(goal.status)}
                  <span className="capitalize">{goal.status}</span>
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditGoal(goal.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className={getSubtextClass()}>
                  {goal.type === 'amount' && `$${goal.current.toLocaleString()}`}
                  {goal.type === 'company' && `$${goal.current.toLocaleString()}`}
                  {goal.type === 'count' && `${goal.current} admin transactions`}
                </span>
                <span className={`${getTextClass()} font-semibold`}>{goal.progress}%</span>
              </div>
              <div className={`w-full rounded-full h-2 ${isLightMode ? 'bg-gray-200' : 'bg-white/10'}`}>
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Goal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className={getInnerCardClass()}>
                <p className={`${getSubtextClass()} text-sm`}>Admin Target</p>
                <p className={`${getTextClass()} font-semibold`}>
                  {goal.type === 'amount' && `$${goal.target.toLocaleString()}`}
                  {goal.type === 'company' && `$${goal.target.toLocaleString()}`}
                  {goal.type === 'count' && `${goal.target} transactions`}
                </p>
              </div>
              <div className={getInnerCardClass()}>
                <p className={`${getSubtextClass()} text-sm`}>Timeframe</p>
                <p className={`${getTextClass()} font-semibold`}>{goal.timeframe} months</p>
              </div>
              <div className={getInnerCardClass()}>
                <p className={`${getSubtextClass()} text-sm`}>End Date</p>
                <p className={`${getTextClass()} font-semibold`}>{goal.endDate}</p>
              </div>
            </div>

            {/* AI Recommendations */}
            {goal.aiRecommendations && goal.aiRecommendations.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-red-400" />
                  <h4 className="text-red-400 font-semibold">Admin AI Recommendations</h4>
                </div>
                <ul className="space-y-1">
                  {goal.aiRecommendations.map((rec, index) => (
                    <li key={index} className={`${getSecondaryTextClass()} text-sm`}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Goal Performance Chart */}
      <div className={getCardClass()}>
        <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Admin Goal Progress Over Time</h3>
        {goals.length > 0 ? (
          <RechartsChart
            type="line"
            height={300}
            series={[
              { name: 'Admin Emergency Fund', data: [0, 500, 1000, 1750, 2500, 3250, 3750] },
              { name: 'Admin Platform Fund', data: [] },
              { name: 'Admin Round-Up Count', data: [0, 32, 72, 112, 152, 192, 232, 268] }
            ]}
            options={{
              xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'] },
              title: { text: 'Monthly Admin Progress' }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className={`w-8 h-8 ${getSubtextClass()}`} />
              </div>
              <h4 className={`${getTextClass()} text-lg font-medium mb-2`}>No admin goals yet</h4>
              <p className={`${getSubtextClass()} text-sm`}>Create your first admin goal to see progress tracking</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminGoals
