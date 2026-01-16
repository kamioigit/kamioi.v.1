import React, { useState } from 'react'
import { Crown, Settings, Shield, Trash2, User, UserPlus, CheckCircle, XCircle, Edit } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const BusinessMemberManagement = ({ user }) => {
  const [showInviteModal, setShowInviteModal] = useState(false)
   const { isLightMode } = useTheme()
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'business_employee',
    permissions: []
  })

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  // Initialize with empty business members - will be populated from API
  const [businessMembers, setBusinessMembers] = useState([])

  const roleOptions = [
    { value: 'business_admin', label: 'Business Admin', icon: Crown, color: 'text-red-500' },
    { value: 'business_manager', label: 'Business Manager', icon: Shield, color: 'text-blue-500' },
    { value: 'business_employee', label: 'Business Employee', icon: User, color: 'text-green-500' }
  ]

  const permissionOptions = [
    { value: 'view_portfolio', label: 'View Portfolio' },
    { value: 'manage_goals', label: 'Manage Goals' },
    { value: 'invite_members', label: 'Invite Members' },
    { value: 'manage_transactions', label: 'Manage Transactions' },
    { value: 'view_analytics', label: 'View Analytics' },
    { value: 'manage_settings', label: 'Manage Settings' }
  ]

  const getRoleIcon = (role) => {
    const roleOption = roleOptions.find(r => r.value === role)
    if (roleOption) {
      const Icon = roleOption.icon
      return <Icon className={`w-4 h-4 ${roleOption.color}`} />
    }
    return <User className="w-4 h-4 text-gray-500" />
  }

  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find(r => r.value === role)
    return roleOption ? roleOption.label : 'Member'
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>Active</span>
        </span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center space-x-1">
          <XCircle className="w-3 h-3" />
          <span>Pending</span>
        </span>
      case 'inactive':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center space-x-1">
          <XCircle className="w-3 h-3" />
          <span>Inactive</span>
        </span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Unknown</span>
    }
  }

  const handleInviteMember = async (event) => {
    let originalText = 'Send Invite'
    try {
      // Validate invite data
      if (!inviteData.email.trim()) {
        alert('Please enter an email address')
        return
      }
      if (!inviteData.email.includes('@')) {
        alert('Please enter a valid email address')
        return
      }
      if (inviteData.permissions.length === 0) {
        alert('Please select at least one permission')
        return
      }
      
      // Show loading state
      if (event && event.target) {
        const submitButton = event.target
        originalText = submitButton.textContent
        submitButton.textContent = 'Sending Invite...'
        submitButton.disabled = true
      }
      
      // Create member invite object
      const memberData = {
        email: inviteData.email.trim(),
        role: inviteData.role,
        permissions: inviteData.permissions,
        businessId: 'business-123', // This would come from business context
        invitedBy: 'current-admin',
        invitedAt: new Date().toISOString()
      }
      
      // Call backend to send business invite
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/members/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_token')}`
        },
        body: JSON.stringify(memberData)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Reset form and close modal
          setInviteData({ email: '', role: 'business_employee', permissions: [] })
          setShowInviteModal(false)
          
          alert(`Business invitation sent successfully to ${inviteData.email}!`)
        } else {
          throw new Error(result.error || 'Failed to send invitation')
        }
      } else {
        throw new Error('Network error')
      }
      
    } catch (error) {
      console.error('Invite member failed:', error)
      alert('Failed to send business invitation. Please try again.')
    } finally {
      // Reset button state
      if (event && event.target) {
        event.target.textContent = originalText
        event.target.disabled = false
      }
    }
  }

  const handleEditMember = (member) => {
    setSelectedMember(member)
    setShowEditModal(true)
  }

  const handleDeleteMember = async (memberId, event) => {
    let originalText = 'Remove'
    try {
      // Confirm deletion
      const member = businessMembers.find(m => m.id === memberId)
      if (!member) {
        alert('Member not found')
        return
      }
      
      const confirmed = window.confirm(
        `Are you sure you want to remove ${member.name} from the business?\n\nThis will:\n- Remove their access to the business account\n- Stop all their transactions\n- Archive their business data\n\nThis action cannot be undone.`
      )
      
      if (!confirmed) return
      
      // Show loading state
      if (event && event.target) {
        originalText = event.target.textContent
        event.target.textContent = 'Removing...'
        event.target.disabled = true
      }
      
      // Call backend to remove business member
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_token')}`
        },
        body: JSON.stringify({
          businessId: 'business-123',
          removedBy: 'current-admin',
          reason: 'admin_removal'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Remove from local state (you might need to add this to context)
          // removeBusinessMember(memberId)
          
          alert(`${member.name} has been removed from the business.`)
        } else {
          throw new Error(result.error || 'Failed to remove member')
        }
      } else {
        throw new Error('Network error')
      }
      
    } catch (error) {
      console.error('Remove member failed:', error)
      alert('Failed to remove business member. Please try again.')
    } finally {
      // Reset button state
      if (event.target) {
        event.target.textContent = originalText
        event.target.disabled = false
      }
    }
  }

  const handlePermissionChange = (permission, checked) => {
    if (checked) {
      setInviteData({
        ...inviteData,
        permissions: [...inviteData.permissions, permission]
      })
    } else {
      setInviteData({
        ...inviteData,
        permissions: inviteData.permissions.filter(p => p !== permission)
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${getTextClass()} mb-2`}>
              Business Member Management
            </h1>
            <p className={`${getSubtextClass()}`}>
              Manage your business team members and their permissions
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <div className="space-y-4">
          {businessMembers.map((member) => (
            <div key={member.id} className={`p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold ${getTextClass()}`}>{member.name}</h3>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className={`text-sm ${getSubtextClass()}`}>{member.email}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs ${getSubtextClass()}`}>
                        {getRoleLabel(member.role)}
                      </span>
                      <span className={`text-xs ${getSubtextClass()}`}>
                        {member.department}
                      </span>
                      {getStatusBadge(member.status)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditMember(member)}
                    className={`p-2 rounded-lg transition-colors ${
                      isLightMode 
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMember(member.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isLightMode 
                        ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                        : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${getCardClass()} rounded-xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold ${getTextClass()} mb-4`}>
              Invite Business Member
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                  Permissions
                </label>
                <div className="space-y-2">
                  {permissionOptions.map(permission => (
                    <label key={permission.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={inviteData.permissions.includes(permission.value)}
                        onChange={(e) => handlePermissionChange(permission.value, e.target.checked)}
                        className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${getTextClass()}`}>{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${getCardClass()} rounded-xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold ${getTextClass()} mb-4`}>
              Edit Member: {selectedMember.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                  Role
                </label>
                <select
                  defaultValue={selectedMember.role}
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessMemberManagement
