import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckCircle, TrendingUp, Clock, Target, Calendar, Edit, Trash2, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useModal } from '../../context/ModalContext'
import { useNotifications } from '../../hooks/useNotifications'

// Demo business goals for demo mode
const DEMO_BUSINESS_GOALS = [
  {
    id: 'demo-goal-1',
    name: 'Q1 Investment Target',
    description: 'Achieve $50,000 in round-up investments by end of Q1',
    target: 50000,
    current: 32500,
    department: 'Finance',
    deadline: '2025-03-31',
    status: 'in_progress'
  },
  {
    id: 'demo-goal-2',
    name: 'Employee Participation',
    description: 'Get 80% of employees enrolled in the round-up program',
    target: 100,
    current: 65,
    department: 'HR',
    deadline: '2025-06-30',
    status: 'in_progress'
  },
  {
    id: 'demo-goal-3',
    name: 'Monthly Savings Goal',
    description: 'Achieve $5,000 monthly investment consistency',
    target: 5000,
    current: 5000,
    department: 'Finance',
    deadline: '2025-01-31',
    status: 'completed'
  },
  {
    id: 'demo-goal-4',
    name: 'Annual Investment Portfolio',
    description: 'Build $200,000 investment portfolio by year end',
    target: 200000,
    current: 78500,
    department: 'Executive',
    deadline: '2025-12-31',
    status: 'in_progress'
  }
]

const BusinessGoals = ({ user }) => {
  const { isBlackMode, isLightMode } = useTheme()
  const { showSuccessModal, showErrorModal, showConfirmationModal } = useModal()
  const { addNotification } = useNotifications()

  // Check if in demo mode
  const isDemoMode = localStorage.getItem('kamioi_demo_mode') === 'true'

  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [goalForm, setGoalForm] = useState({
    name: '',
    description: '',
    target: '',
    current: 0,
    department: '',
    deadline: '',
    status: 'pending'
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)

      // Use demo data in demo mode
      if (isDemoMode) {
        setGoals(DEMO_BUSINESS_GOALS)
        setLoading(false)
        return
      }

      const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/goals`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setGoals(Array.isArray(data.goals || data.data?.goals) ? (data.goals || data.data.goals) : [])
      } else {
        // Fallback to demo data on error
        if (isDemoMode) {
          setGoals(DEMO_BUSINESS_GOALS)
        } else {
          setGoals([])
        }
      }
    } catch (error) {
      console.error('Error fetching business goals:', error)
      // Fallback to demo data on error
      if (isDemoMode) {
        setGoals(DEMO_BUSINESS_GOALS)
      } else {
        setGoals([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async (e) => {
    e.preventDefault()

    // Demo mode - simulate adding goal
    if (isDemoMode) {
      const newGoal = {
        id: `demo-goal-${Date.now()}`,
        name: goalForm.name,
        description: goalForm.description,
        target: parseFloat(goalForm.target) || 0,
        current: parseFloat(goalForm.current) || 0,
        department: goalForm.department,
        deadline: goalForm.deadline,
        status: goalForm.status
      }
      setGoals(prev => [...prev, newGoal])
      showSuccessModal('Success', 'Business goal created successfully!')
      addNotification({
        type: 'success',
        title: 'Goal Created',
        message: `Goal "${goalForm.name}" has been created.`,
        timestamp: new Date().toISOString()
      })
      setShowGoalModal(false)
      resetGoalForm()
      return
    }

    try {
      const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/goals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...goalForm,
          target: parseFloat(goalForm.target) || 0,
          target_value: parseFloat(goalForm.target) || 0,
          current: parseFloat(goalForm.current) || 0,
          current_value: parseFloat(goalForm.current) || 0
        })
      })

      if (response.ok) {
        const result = await response.json()
        showSuccessModal('Success', 'Business goal created successfully!')
        addNotification({
          type: 'success',
          title: 'Goal Created',
          message: `Goal "${goalForm.name}" has been created.`,
          timestamp: new Date().toISOString()
        })
        setShowGoalModal(false)
        resetGoalForm()
        fetchGoals()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create goal')
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      showErrorModal('Error', error.message || 'Failed to create goal. Please try again.')
      addNotification({
        type: 'error',
        title: 'Create Failed',
        message: error.message || 'Failed to create goal.',
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleEditGoal = (goal) => {
    setEditingGoal(goal)
    setGoalForm({
      name: goal.name || '',
      description: goal.description || '',
      target: goal.target || '',
      current: goal.current || 0,
      department: goal.department || '',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      status: goal.status || 'pending'
    })
    setShowGoalModal(true)
  }

  const handleUpdateGoal = async (e) => {
    e.preventDefault()
    if (!editingGoal?.id) return

    // Demo mode - simulate updating goal
    if (isDemoMode) {
      setGoals(prev => prev.map(g =>
        g.id === editingGoal.id
          ? {
              ...g,
              name: goalForm.name,
              description: goalForm.description,
              target: parseFloat(goalForm.target) || 0,
              current: parseFloat(goalForm.current) || 0,
              department: goalForm.department,
              deadline: goalForm.deadline,
              status: goalForm.status
            }
          : g
      ))
      showSuccessModal('Success', 'Business goal updated successfully!')
      addNotification({
        type: 'success',
        title: 'Goal Updated',
        message: `Goal "${goalForm.name}" has been updated.`,
        timestamp: new Date().toISOString()
      })
      setShowGoalModal(false)
      setEditingGoal(null)
      resetGoalForm()
      return
    }

    try {
      const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...goalForm,
          target: parseFloat(goalForm.target) || 0,
          target_value: parseFloat(goalForm.target) || 0,
          current: parseFloat(goalForm.current) || 0,
          current_value: parseFloat(goalForm.current) || 0
        })
      })

      if (response.ok) {
        showSuccessModal('Success', 'Business goal updated successfully!')
        addNotification({
          type: 'success',
          title: 'Goal Updated',
          message: `Goal "${goalForm.name}" has been updated.`,
          timestamp: new Date().toISOString()
        })
        setShowGoalModal(false)
        setEditingGoal(null)
        resetGoalForm()
        fetchGoals()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update goal')
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      showErrorModal('Error', error.message || 'Failed to update goal. Please try again.')
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update goal.',
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleDeleteGoal = (goal) => {
    showConfirmationModal(
      'Delete Business Goal',
      `Are you sure you want to delete "${goal.name}"? This action cannot be undone.`,
      async () => {
        // Demo mode - simulate deleting goal
        if (isDemoMode) {
          setGoals(prev => prev.filter(g => g.id !== goal.id))
          showSuccessModal('Success', 'Business goal deleted successfully!')
          addNotification({
            type: 'success',
            title: 'Goal Deleted',
            message: `Goal "${goal.name}" has been deleted.`,
            timestamp: new Date().toISOString()
          })
          return
        }

        try {
          const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
          const response = await fetch(`${apiBaseUrl}/api/business/goals/${goal.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            showSuccessModal('Success', 'Business goal deleted successfully!')
            addNotification({
              type: 'success',
              title: 'Goal Deleted',
              message: `Goal "${goal.name}" has been deleted.`,
              timestamp: new Date().toISOString()
            })
            fetchGoals()
          } else {
            const error = await response.json()
            throw new Error(error.message || 'Failed to delete goal')
          }
        } catch (error) {
          console.error('Error deleting goal:', error)
          showErrorModal('Error', error.message || 'Failed to delete goal. Please try again.')
          addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: error.message || 'Failed to delete goal.',
            timestamp: new Date().toISOString()
          })
        }
      }
    )
  }

  const handleUpdateProgress = async (goalId, newProgress) => {
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_user_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...goal,
          current: parseFloat(newProgress)
        })
      })

      if (response.ok) {
        fetchGoals()
        addNotification({
          type: 'success',
          title: 'Progress Updated',
          message: 'Goal progress has been updated.',
          timestamp: new Date().toISOString()
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update progress')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      showErrorModal('Error', error.message || 'Failed to update progress. Please try again.')
    }
  }

  const resetGoalForm = () => {
    setGoalForm({
      name: '',
      description: '',
      target: '',
      current: 0,
      department: '',
      deadline: '',
      status: 'pending'
    })
  }

  const handleCloseModal = () => {
    setShowGoalModal(false)
    setEditingGoal(null)
    resetGoalForm()
  }

  const getCardClass = () => {
    if (isBlackMode) return 'bg-black/20 backdrop-blur-xl border border-white/10'
    if (isLightMode) return 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
    return 'bg-white/10 backdrop-blur-xl border border-white/20'
  }

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getSubtextClass = () => {
    if (isLightMode) return 'text-gray-600'
    return 'text-white/60'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'in_progress': return 'text-blue-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <TrendingUp className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${getTextClass()}`}>Business Goals</h1>
          <p className={`text-sm ${getSubtextClass()}`}>Set and track your business objectives and milestones</p>
        </div>
        <button 
          onClick={() => setShowGoalModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${getCardClass()} rounded-xl p-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className={`font-semibold ${getTextClass()}`}>{goal.name}</h3>
                  <p className={`text-sm ${getSubtextClass()}`}>{goal.department || 'General'}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getStatusColor(goal.status)}`}>
                {getStatusIcon(goal.status)}
                <span className="text-sm font-medium capitalize">{(goal.status || 'active').replace('_', ' ')}</span>
              </div>
            </div>

            {goal.description && (
              <p className={`text-sm ${getSubtextClass()} mb-4`}>{goal.description}</p>
            )}

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={getSubtextClass()}>Progress</span>
                  <span className={getTextClass()}>
                    ${(goal.current || 0).toLocaleString()} / ${(goal.target || 0).toLocaleString()}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  isLightMode ? 'bg-gray-200' : 'bg-white/20'
                }`}>
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((goal.current || 0) / (goal.target || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {goal.deadline && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className={getSubtextClass()}>
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`font-medium ${getTextClass()}`}>
                    {Math.round(((goal.current || 0) / (goal.target || 1)) * 100)}%
                  </span>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => handleEditGoal(goal)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isLightMode 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteGoal(goal)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isLightMode 
                      ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                  }`}
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className={`${getCardClass()} rounded-xl p-12 text-center`}>
          <Target className={`w-16 h-16 mx-auto mb-4 ${getSubtextClass()}`} />
          <h3 className={`text-xl font-semibold ${getTextClass()} mb-2`}>No business goals yet</h3>
          <p className={`${getSubtextClass()} mb-6`}>Set your first business goal to start tracking progress</p>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Goal
          </button>
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${isLightMode ? 'bg-white' : 'bg-gray-800'} rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${getTextClass()}`}>
                {editingGoal ? 'Edit Business Goal' : 'Create Business Goal'}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-lg ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors`}
              >
                <X className={`w-5 h-5 ${getTextClass()}`} />
              </button>
            </div>

            <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-300 text-gray-800' 
                      : 'bg-gray-700 border-gray-600 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Increase Q4 Revenue"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                  Description
                </label>
                <textarea
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  rows="3"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-300 text-gray-800' 
                      : 'bg-gray-700 border-gray-600 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Describe your business goal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                    Target Amount ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={goalForm.target}
                    onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isLightMode 
                        ? 'bg-gray-50 border-gray-300 text-gray-800' 
                        : 'bg-gray-700 border-gray-600 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                    Current Progress ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={goalForm.current}
                    onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isLightMode 
                        ? 'bg-gray-50 border-gray-300 text-gray-800' 
                        : 'bg-gray-700 border-gray-600 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={goalForm.department}
                    onChange={(e) => setGoalForm({ ...goalForm, department: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isLightMode 
                        ? 'bg-gray-50 border-gray-300 text-gray-800' 
                        : 'bg-gray-700 border-gray-600 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g., Sales, Marketing"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isLightMode 
                        ? 'bg-gray-50 border-gray-300 text-gray-800' 
                        : 'bg-gray-700 border-gray-600 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                  Status
                </label>
                <select
                  value={goalForm.status}
                  onChange={(e) => setGoalForm({ ...goalForm, status: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-300 text-gray-800' 
                      : 'bg-gray-700 border-gray-600 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isLightMode 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default BusinessGoals
