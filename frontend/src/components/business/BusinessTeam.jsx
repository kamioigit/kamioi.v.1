import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Search, Filter, MoreVertical, Edit, Trash2, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useModal } from '../../context/ModalContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useDemo } from '../../context/DemoContext'

// Demo team members for demo mode
const DEMO_TEAM_MEMBERS = [
  {
    id: 'demo-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    role: 'admin',
    status: 'active',
    portfolioValue: 15230,
    joinDate: '2024-01-15'
  },
  {
    id: 'demo-2',
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    role: 'manager',
    status: 'active',
    portfolioValue: 8450,
    joinDate: '2024-02-20'
  },
  {
    id: 'demo-3',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'employee',
    status: 'active',
    portfolioValue: 3200,
    joinDate: '2024-03-10'
  },
  {
    id: 'demo-4',
    name: 'Emily Chen',
    email: 'emily.chen@company.com',
    role: 'employee',
    status: 'active',
    portfolioValue: 5680,
    joinDate: '2024-04-05'
  }
]

const BusinessTeam = ({ user }) => {
  const { isBlackMode, isLightMode } = useTheme()
  const { showSuccessModal, showErrorModal, showConfirmationModal } = useModal()
  const { addNotification } = useNotifications()
  const { isDemoMode } = useDemo()

  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    role: 'employee',
    permissions: []
  })
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)

      // Use demo data in demo mode
      if (isDemoMode) {
        setTeamMembers(DEMO_TEAM_MEMBERS)
        setLoading(false)
        return
      }

      const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const response = await fetch(`${apiBaseUrl}/api/business/team/members`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(Array.isArray(data.data?.members || data.members) ? (data.data?.members || data.members) : [])
      } else {
        // Fallback to demo data on API error
        if (isDemoMode) {
          setTeamMembers(DEMO_TEAM_MEMBERS)
        } else {
          setTeamMembers([])
        }
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
      // Fallback to demo data on error
      if (isDemoMode) {
        setTeamMembers(DEMO_TEAM_MEMBERS)
      } else {
        setTeamMembers([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()

    // Demo mode - simulate adding member
    if (isDemoMode) {
      const newMember = {
        id: `demo-${Date.now()}`,
        name: memberForm.name,
        email: memberForm.email,
        role: memberForm.role,
        status: 'active',
        portfolioValue: 0,
        joinDate: new Date().toISOString().split('T')[0]
      }
      setTeamMembers(prev => [...prev, newMember])
      showSuccessModal('Success', 'Team member added successfully!')
      addNotification({
        type: 'success',
        title: 'Member Added',
        message: `${memberForm.name} has been added to your team.`,
        timestamp: new Date().toISOString()
      })
      setShowAddModal(false)
      setMemberForm({ name: '', email: '', role: 'employee', permissions: [] })
      return
    }

    try {
      const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const response = await fetch(`${apiBaseUrl}/api/business/team/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberForm)
      })

      if (response.ok) {
        const result = await response.json()
        showSuccessModal('Success', 'Team member added successfully!')
        addNotification({
          type: 'success',
          title: 'Member Added',
          message: `${memberForm.name} has been added to your team.`,
          timestamp: new Date().toISOString()
        })
        setShowAddModal(false)
        setMemberForm({ name: '', email: '', role: 'employee', permissions: [] })
        fetchTeamMembers()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add team member')
      }
    } catch (error) {
      console.error('Error adding team member:', error)
      showErrorModal('Error', error.message || 'Failed to add team member. Please try again.')
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: error.message || 'Failed to add team member.',
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleEditMember = (member) => {
    setEditingMember(member)
    setMemberForm({
      name: member.name || '',
      email: member.email || '',
      role: member.role || 'employee',
      permissions: member.permissions || []
    })
    setShowAddModal(true)
  }

  const handleUpdateMember = async (e) => {
    e.preventDefault()
    if (!editingMember?.id) return

    // Demo mode - simulate updating member
    if (isDemoMode) {
      setTeamMembers(prev => prev.map(m =>
        m.id === editingMember.id
          ? { ...m, name: memberForm.name, email: memberForm.email, role: memberForm.role }
          : m
      ))
      showSuccessModal('Success', 'Team member updated successfully!')
      addNotification({
        type: 'success',
        title: 'Member Updated',
        message: `${memberForm.name}'s information has been updated.`,
        timestamp: new Date().toISOString()
      })
      setShowAddModal(false)
      setEditingMember(null)
      setMemberForm({ name: '', email: '', role: 'employee', permissions: [] })
      return
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/team/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_user_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberForm)
      })

      if (response.ok) {
        showSuccessModal('Success', 'Team member updated successfully!')
        addNotification({
          type: 'success',
          title: 'Member Updated',
          message: `${memberForm.name}'s information has been updated.`,
          timestamp: new Date().toISOString()
        })
        setShowAddModal(false)
        setEditingMember(null)
        setMemberForm({ name: '', email: '', role: 'employee', permissions: [] })
        fetchTeamMembers()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update team member')
      }
    } catch (error) {
      console.error('Error updating team member:', error)
      showErrorModal('Error', error.message || 'Failed to update team member. Please try again.')
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update team member.',
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleDeleteMember = (member) => {
    console.log('🗑️ [BusinessTeam] Delete member clicked:', member)
    showConfirmationModal(
      'Remove Team Member',
      `Are you sure you want to remove ${member.name} from your team? This action cannot be undone.`,
      async () => {
        // Demo mode - simulate deleting member
        if (isDemoMode) {
          setTeamMembers(prev => prev.filter(m => m.id !== member.id))
          showSuccessModal('Success', 'Team member removed successfully!')
          addNotification({
            type: 'success',
            title: 'Member Removed',
            message: `${member.name} has been removed from your team.`,
            timestamp: new Date().toISOString()
          })
          return
        }

        console.log('✅ [BusinessTeam] Confirmation modal confirmed, deleting member:', member.id)
        try {
          const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
          console.log('🔐 [BusinessTeam] Using auth token:', authToken ? 'Token exists' : 'No token')

          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
          const deleteUrl = `${apiBaseUrl}/api/business/team/members/${member.id}`
          console.log('📡 [BusinessTeam] DELETE request to:', deleteUrl)

          const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          })

          console.log('📥 [BusinessTeam] DELETE response status:', response.status, response.statusText)

          if (response.ok) {
            const result = await response.json().catch(() => ({}))
            console.log('✅ [BusinessTeam] Delete successful:', result)
            showSuccessModal('Success', 'Team member removed successfully!')
            addNotification({
              type: 'success',
              title: 'Member Removed',
              message: `${member.name} has been removed from your team.`,
              timestamp: new Date().toISOString()
            })
            // Refresh team members list
            await fetchTeamMembers()
            console.log('🔄 [BusinessTeam] Team members list refreshed')
          } else {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }))
            console.error('❌ [BusinessTeam] Delete failed:', error)
            throw new Error(error.message || error.error || 'Failed to remove team member')
          }
        } catch (error) {
          console.error('❌ [BusinessTeam] Error deleting team member:', error)
          showErrorModal('Error', error.message || 'Failed to remove team member. Please try again.')
          addNotification({
            type: 'error',
            title: 'Remove Failed',
            message: error.message || 'Failed to remove team member.',
            timestamp: new Date().toISOString()
          })
        }
      },
      'warning',
      'Remove'
    )
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingMember(null)
    setMemberForm({ name: '', email: '', role: 'employee', permissions: [] })
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

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = !searchTerm || 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

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
          <h1 className={`text-2xl font-bold ${getTextClass()}`}>Business Team</h1>
          <p className={`text-sm ${getSubtextClass()}`}>Manage your business team members and their permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isLightMode 
                  ? 'bg-gray-100 border-gray-300 text-gray-800' 
                  : 'bg-white/5 border-white/20 text-white'
              }`}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isLightMode 
                ? 'bg-gray-100 border-gray-300 text-gray-800' 
                : 'bg-white/10 border-white/20 text-white'
            }`}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id || member.email || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${getCardClass()} rounded-xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <h3 className={`font-semibold ${getTextClass()}`}>{member.name}</h3>
                  <p className={`text-sm ${getSubtextClass()}`}>{member.email}</p>
                </div>
              </div>
              <button className={`p-2 rounded-lg ${
                isLightMode 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                  : 'bg-white/10 hover:bg-white/20 text-white/80'
              }`}>
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className={`text-sm ${getSubtextClass()}`}>Role</span>
                <span className={`text-sm font-medium ${getTextClass()}`}>{member.role}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${getSubtextClass()}`}>Status</span>
                <span className={`text-sm font-medium ${
                  member.status === 'active' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {member.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${getSubtextClass()}`}>Portfolio Value</span>
                <span className={`text-sm font-medium ${getTextClass()}`}>
                  ${member.portfolioValue?.toLocaleString() || '0'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleEditMember(member)}
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
                onClick={() => handleDeleteMember(member)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isLightMode 
                    ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                }`}
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Remove
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className={`${getCardClass()} rounded-xl p-12 text-center`}>
          <UserPlus className={`w-16 h-16 mx-auto mb-4 ${getSubtextClass()}`} />
          <h3 className={`text-xl font-semibold ${getTextClass()} mb-2`}>No team members found</h3>
          <p className={`${getSubtextClass()} mb-6`}>
            {searchTerm ? 'Try adjusting your search terms' : 'Start building your team by adding members'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Member
          </button>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${isLightMode ? 'bg-white' : 'bg-gray-800'} rounded-xl p-6 w-full max-w-md shadow-xl`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${getTextClass()}`}>
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-lg ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors`}
              >
                <X className={`w-5 h-5 ${getTextClass()}`} />
              </button>
            </div>

            <form onSubmit={editingMember ? handleUpdateMember : handleAddMember} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-300 text-gray-800' 
                      : 'bg-gray-700 border-gray-600 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-300 text-gray-800' 
                      : 'bg-gray-700 border-gray-600 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${getSubtextClass()} mb-2`}>
                  Role
                </label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-300 text-gray-800' 
                      : 'bg-gray-700 border-gray-600 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
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
                  {editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default BusinessTeam
