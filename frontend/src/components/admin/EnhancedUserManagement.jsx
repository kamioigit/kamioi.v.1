import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Filter, Download, Mail, Eye, UserCheck, UserX, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, XCircle, Star, DollarSign, Activity, MapPin, Calendar, Phone, Shield, Zap, Award, Target, BarChart3, Brain, Clock, FileText, MessageSquare, Settings, ChevronDown, ChevronRight, Plus, Minus, Edit, Trash2, Send, TrendingDown, PieChart, LineChart, Database, UserPlus, UserMinus, RotateCcw, X, Building, User, Info } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import GlassModal from '../common/GlassModal'
import { useNotifications } from '../../hooks/useNotifications'

const EnhancedUserManagement = () => {
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('directory')
   const { isLightMode } = useTheme()
  const [userTypeTab, setUserTypeTab] = useState('all') // New state for user type tabs
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageRecipient, setMessageRecipient] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Enhanced user data structure based on specification
  const [enhancedUsers, setEnhancedUsers] = useState([])

  // Load users from localStorage and enhance with AI metrics
  useEffect(() => {
    loadUsers()
    // Dispatch page load completion event with small delay
    const timer = setTimeout(() => {
      console.log('📊 EnhancedUserManagement - Dispatching admin-page-load-complete for users2')
      window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
        detail: { pageId: 'users2' }
      }))
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Helper function to get profile image from localStorage
  const getProfileImageFromStorage = (userId, email) => {
    // Try multiple possible keys
    const possibleKeys = []
    if (userId) possibleKeys.push(`profile_image_${userId}`)
    if (email) possibleKeys.push(`profile_image_${email}`)
    
    for (const key of possibleKeys) {
      const image = localStorage.getItem(key)
      if (image) {
        console.log(`🖼️ Found profile image for user ${userId} with key: ${key}`)
        return image
      }
    }
    return null
  }

  const loadUsers = () => {
    try {
      console.log('🔄 Loading enhanced users...')
      
      const allUsers = []
      
      // Load from all user storage keys
      const individualUsers = JSON.parse(localStorage.getItem('kamioi_users') || '[]')
      const familyUsers = JSON.parse(localStorage.getItem('kamioi_family_users') || '[]')
      const businessUsers = JSON.parse(localStorage.getItem('kamioi_business_users') || '[]')
      const currentUser = JSON.parse(localStorage.getItem('kamioi_user') || 'null')
      
      allUsers.push(...individualUsers, ...familyUsers, ...businessUsers)
      if (currentUser && !allUsers.find(u => u.id === currentUser.id)) {
        allUsers.push(currentUser)
      }
      
      // Filter out admin users
      const regularUsers = allUsers.filter(user => 
        user.role !== 'admin' && 
        user.email !== 'admin@kamioi.com' &&
        user.name !== 'Admin User'
      )
      
      // Use actual user data without mock enhancements
      const enhanced = regularUsers.map(user => ({
        ...user,
        // Basic Information - use actual data only
        fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phone,
        verificationStatus: user.verificationStatus || 'Pending',
        signupDate: user.createdAt || user.signupDate || new Date().toISOString(),
        lastLogin: user.lastLogin || new Date().toISOString(),
        source: user.source || 'Unknown',
        planType: user.accountType || 'Individual',
        memberRole: user.role || 'user',
        roundUpSetting: user.roundUpAmount || 1.00,
        accountStatus: user.status || 'Active',
        kycStatus: user.kycStatus || 'Pending',
        // Load profile image from localStorage
        profileImage: getProfileImageFromStorage(user.id, user.email),
        consentFlags: user.consentFlags || {
          email: false,
          push: false,
          dataUsage: false,
          marketing: false
        },
        
        // Financial & Portfolio Metrics - use actual data only
        totalInvestable: user.totalInvestable || 0,
        totalInvested: user.totalInvested || 0,
        totalRoundUps: user.totalRoundUps || 0,
        totalFeesPaid: user.totalFeesPaid || 0,
        currentPortfolioValue: user.totalPortfolioValue || 0,
        performance30d: user.performance30d || 0,
        performanceYTD: user.performanceYTD || 0,
        numberOfTickers: user.numberOfTickers || 0,
        mostInvestedSectors: user.mostInvestedSectors || [],
        mostInvestedBrands: user.mostInvestedBrands || [],
        averageRoundUpPerMonth: user.averageRoundUpPerMonth || 0,
        timeToFirstInvestment: user.timeToFirstInvestment || 0,
        
        // AI & Behavioral Metrics - use actual data only
        mappingSuccessRate: user.mappingSuccessRate || 0,
        transactionsNeedingReview: user.transactionsNeedingReview || 0,
        aiRecommendationAdoptionRate: user.aiRecommendationAdoptionRate || 0,
        categoriesAnalyzed: user.categoriesAnalyzed || 0,
        categoriesUnrecognized: user.categoriesUnrecognized || 0,
        aiConfidenceDistribution: user.aiConfidenceDistribution || {
          high: 0,
          medium: 0,
          low: 0
        },
        engagementScore: user.engagementScore || 0,
        healthScore: user.healthScore || 0,
        churnRiskLevel: user.churnRiskLevel || 'Unknown',
        
        // Activity Timeline - use actual data only
        activityTimeline: user.activityTimeline || [],
        
        // AI Predictions - use actual data only
        aiPredictions: user.aiPredictions || {
          churnRisk: 0,
          nextInvestmentAmount: 0,
          recommendedSectors: [],
          engagementTrend: 'unknown'
        }
      }))
      
      setEnhancedUsers(enhanced)
      setUsers(enhanced)
      console.log('Enhanced users loaded:', enhanced.length)
    } catch (error) {
      console.error('❌ Error loading enhanced users:', error)
      setEnhancedUsers([])
      setUsers([])
    }
  }


  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || user.accountStatus === statusFilter
    const matchesSegment = segmentFilter === 'all' || user.planType === segmentFilter
    
    // New user type filtering logic
    const matchesUserType = userTypeTab === 'all' || 
      (userTypeTab === 'individual' && (user.planType === 'Individual' || user.planType === 'individual')) ||
      (userTypeTab === 'family' && user.planType === 'family') ||
      (userTypeTab === 'business' && user.planType === 'business')
    
    return matchesSearch && matchesStatus && matchesSegment && matchesUserType
  })

  // Analytics calculations
  const analytics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.accountStatus === 'Active').length,
    familyPlans: users.filter(u => u.planType === 'family').length,
    businessPlans: users.filter(u => u.planType === 'business').length,
    avgPortfolioValue: users.length > 0 ? users.reduce((sum, u) => sum + u.currentPortfolioValue, 0) / users.length : 0,
    totalRoundUps: users.reduce((sum, u) => sum + u.totalRoundUps, 0),
    avgMappingSuccess: users.length > 0 ? users.reduce((sum, u) => sum + u.mappingSuccessRate, 0) / users.length : 0,
    highChurnRisk: users.filter(u => u.churnRiskLevel === 'High').length,
    pendingKYC: users.filter(u => u.kycStatus === 'Pending').length,
    totalFees: users.reduce((sum, u) => sum + u.totalFeesPaid, 0),
    avgEngagementScore: users.length > 0 ? users.reduce((sum, u) => sum + u.engagementScore, 0) / users.length : 0,
    monthlySignups: users.filter(u => {
      const signupDate = new Date(u.signupDate)
      const now = new Date()
      return signupDate.getMonth() === now.getMonth() && signupDate.getFullYear() === now.getFullYear()
    }).length,
    churnRate: 0, // Would need historical data
    aiAdoptionRate: users.length > 0 ? users.reduce((sum, u) => sum + u.aiRecommendationAdoptionRate, 0) / users.length : 0
  }

  // Action handlers
  const handleViewUser = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleEditUser = (user) => {
    console.log('✏️ Editing user:', user.fullName)
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleUserUpdate = (updatedUser) => {
    console.log('💾 Updating user:', updatedUser.fullName)
    const updatedUsers = users.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    )
    setUsers(updatedUsers)
    setEnhancedUsers(updatedUsers)
    
    // Update localStorage
    const accountType = updatedUser.accountType || updatedUser.planType
    let storageKey = 'kamioi_users'
    if (accountType === 'family') storageKey = 'kamioi_family_users'
    else if (accountType === 'business') storageKey = 'kamioi_business_users'
    
    const existingUsers = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const updatedStorageUsers = existingUsers.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    )
    localStorage.setItem(storageKey, JSON.stringify(updatedStorageUsers))
  }

  const handleSuspendUser = (user) => {
    if (confirm(`Are you sure you want to suspend ${user.fullName}?`)) {
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, accountStatus: 'Suspended' } : u
      )
      setUsers(updatedUsers)
      setEnhancedUsers(updatedUsers)
    }
  }

  const handleActivateUser = (user) => {
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, accountStatus: 'Active' } : u
    )
    setUsers(updatedUsers)
    setEnhancedUsers(updatedUsers)
  }

  const handleImpersonateUser = (user) => {
    console.log('🎭 Impersonating user:', user.fullName)
    if (confirm(`Are you sure you want to impersonate ${user.fullName}? This will log you in as this user.`)) {
      // Store current admin user
      const currentAdmin = JSON.parse(localStorage.getItem('kamioi_user') || 'null')
      localStorage.setItem('kamioi_admin_backup', JSON.stringify(currentAdmin))
      
      // Switch to the target user
      localStorage.setItem('kamioi_user', JSON.stringify(user))
      localStorage.setItem('kamioi_token', `token_${user.id}`)
      localStorage.setItem('authToken', `token_${user.id}`)
      
      setSuccessMessage(`Now impersonating ${user.fullName}. You can return to admin by logging out and back in.`)
      setShowSuccessModal(true)
      
      // Redirect to user dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    }
  }

  const handleSendMessage = (user) => {
    console.log('💬 Sending message to:', user.fullName)
    setMessageRecipient(user)
    setMessageText('')
    setShowMessageModal(true)
  }

  const handleSendMessageSubmit = () => {
    if (messageText.trim() && messageRecipient) {
      // Store message in localStorage with proper channel structure
      const messages = JSON.parse(localStorage.getItem('kamioi_messages') || '[]')
      messages.push({
        id: Date.now(),
        from: 'Admin',
        to: messageRecipient.email,
        toName: messageRecipient.fullName,
        message: messageText.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        channel: 'admin', // Add channel so it appears in admin notifications
        type: 'admin_message',
        priority: 'normal'
      })
      localStorage.setItem('kamioi_messages', JSON.stringify(messages))
      
      // Close modal and show success
      setShowMessageModal(false)
      setMessageRecipient(null)
      setMessageText('')
      setSuccessMessage(`Message sent to ${messageRecipient.fullName}!`)
      setShowSuccessModal(true)
    }
  }

  const handleExportUserData = (user) => {
    console.log('📤 Exporting data for:', user.fullName)
    
    // Create CSV data
    const csvData = [
      // Headers
      [
        'Field', 'Value'
      ],
      // Basic Information
      ['User ID', user.id],
      ['Full Name', user.fullName],
      ['Email', user.email],
      ['Phone', user.phone || 'N/A'],
      ['Account Type', user.planType],
      ['Status', user.accountStatus],
      ['Signup Date', new Date(user.signupDate).toLocaleDateString()],
      ['Last Login', new Date(user.lastLogin).toLocaleDateString()],
      // Financial Metrics
      ['Portfolio Value', `$${user.currentPortfolioValue?.toFixed(2) || '0.00'}`],
      ['Total Round-ups', `$${user.totalRoundUps?.toFixed(2) || '0.00'}`],
      ['Total Fees Paid', `$${user.totalFeesPaid?.toFixed(2) || '0.00'}`],
      ['30-Day Performance', `${user.performance30d?.toFixed(1) || '0.0'}%`],
      ['YTD Performance', `${user.performanceYTD?.toFixed(1) || '0.0'}%`],
      // AI Metrics
      ['Health Score', user.healthScore?.toFixed(0) || '0'],
      ['Mapping Success Rate', `${user.mappingSuccessRate?.toFixed(0) || '0'}%`],
      ['Engagement Score', user.engagementScore?.toFixed(0) || '0'],
      ['Churn Risk Level', user.churnRiskLevel || 'Unknown'],
      ['AI Adoption Rate', `${user.aiRecommendationAdoptionRate?.toFixed(0) || '0'}%`],
      // Activity
      ['Total Activities', user.activityTimeline?.length || 0],
      ['AI Adoption Rate', `${user.aiRecommendationAdoptionRate?.toFixed(0) || '0'}%`],
      // Export Info
      ['Export Date', new Date().toLocaleDateString()],
      ['Exported By', 'Admin']
    ]
    
    // Convert to CSV string
    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n')
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${user.fullName.replace(/\s+/g, '_')}_user_data_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    setSuccessMessage(`User data exported as CSV for ${user.fullName}!`)
    setShowSuccessModal(true)
  }

  const handleBulkAction = (action) => {
    console.log('🔄 Bulk action:', action, 'on', selectedUsers.length, 'users')
    // Implement bulk actions
  }

  // Theme helpers
  const getCardClass = () => {
    return isLightMode 
      ? 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg' 
      : 'bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl'
  }

  const getTextClass = () => {
    return isLightMode ? 'text-gray-800' : 'text-white'
  }

  const getSubtextClass = () => {
    return isLightMode ? 'text-gray-600' : 'text-gray-400'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Suspended': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getChurnRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-400'
      case 'Medium': return 'text-yellow-400'
      case 'High': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Render User Directory Tab
  const renderUserDirectory = () => (
    <div className={getCardClass()}>
      {/* Enhanced Search and Filters */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, ID, or AI metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Segments</option>
              <option value="Individual">Individual</option>
              <option value="family">Family</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        {/* User Type Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'all', label: 'All Users', icon: Users },
            { id: 'individual', label: 'Individual Users', icon: UserPlus },
            { id: 'family', label: 'Family Users', icon: Users },
            { id: 'business', label: 'Business Users', icon: Building }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setUserTypeTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                userTypeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Enhanced Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">User Profile</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Financial Metrics</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">AI & Behavioral</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Activity & Engagement</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.fullName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                        onError={(e) => {
                          console.log(`🖼️ Profile image failed to load for user ${user.id}`)
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                        onLoad={() => {
                          console.log(`🖼️ Profile image loaded successfully for user ${user.id}`)
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20 ${user.profileImage ? 'hidden' : ''}`}
                    >
                      {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className={`font-medium ${getTextClass()}`}>{user.fullName}</p>
                      <p className={`text-sm ${getSubtextClass()}`}>{user.email}</p>
                      <p className={`text-xs ${getSubtextClass()}`}>{user.address?.city || 'Unknown'}</p>
                      <p className={`text-xs ${getSubtextClass()}`}>{user.account_number || `ID: ${user.id}`}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className={`font-medium ${getTextClass()}`}>${user.currentPortfolioValue?.toFixed(2) || '0.00'}</p>
                    <p className={`text-sm ${getSubtextClass()}`}>${user.totalRoundUps?.toFixed(2) || '0.00'} round-ups</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">
                        {user.performance30d > 0 ? '+' : ''}{user.performance30d?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <p className={`text-xs ${getSubtextClass()}`}>${user.totalFeesPaid?.toFixed(2) || '0.00'} fees</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className={`text-sm ${getTextClass()}`}>Health: {user.healthScore?.toFixed(0) || '85'}</p>
                    <p className={`text-sm ${getSubtextClass()}`}>Mapping: {user.mappingSuccessRate?.toFixed(0) || '90'}%</p>
                    <p className={`text-xs ${getChurnRiskColor(user.churnRiskLevel)}`}>
                      {user.churnRiskLevel || 'Low'} Risk
                    </p>
                    <p className={`text-xs ${getSubtextClass()}`}>Engagement: {user.engagementScore?.toFixed(0) || '85'}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className={`text-sm ${getTextClass()}`}>{user.activityTimeline?.length || 0} activities</p>
                    <p className={`text-sm ${getSubtextClass()}`}>Last: {new Date(user.lastLogin).toLocaleDateString()}</p>
                    <p className={`text-xs ${getSubtextClass()}`}>AI Adoption: {user.aiRecommendationAdoptionRate?.toFixed(0) || '85'}%</p>
                    <p className={`text-xs ${getSubtextClass()}`}>Source: {user.source}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.accountStatus)}`}>
                    {user.accountStatus}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleViewUser(user)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-blue-400" />
                    </button>
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4 text-green-400" />
                    </button>
                    <button 
                      onClick={() => handleImpersonateUser(user)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
                      title="Impersonate"
                    >
                      <UserCheck className="w-4 h-4 text-purple-400" />
                    </button>
                    <button 
                      onClick={() => handleSendMessage(user)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                    </button>
                    <button 
                      onClick={() => handleExportUserData(user)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
                      title="Export User Data"
                    >
                      <Download className="w-4 h-4 text-yellow-400" />
                    </button>
                    {user.accountStatus === 'Active' ? (
                      <button 
                        onClick={() => handleSuspendUser(user)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
                        title="Suspend"
                      >
                        <UserX className="w-4 h-4 text-red-400" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleActivateUser(user)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
                        title="Activate"
                      >
                        <UserCheck className="w-4 h-4 text-green-400" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // Render User Analytics Tab
  const renderUserAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={getCardClass()}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getSubtextClass()}`}>Total Users</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>{analytics.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm">+{analytics.monthlySignups} this month</span>
            </div>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getSubtextClass()}`}>Active Users</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>{analytics.activeUsers}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm">
                {((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}% active rate
              </span>
            </div>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getSubtextClass()}`}>Avg Portfolio Value</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>${analytics.avgPortfolioValue.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm">+12.5% vs last month</span>
            </div>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getSubtextClass()}`}>AI Adoption Rate</p>
                <p className={`text-2xl font-bold ${getTextClass()}`}>{analytics.aiAdoptionRate.toFixed(1)}%</p>
              </div>
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm">+8.2% vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={getCardClass()}>
          <div className="p-6">
            <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>User Segments</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={getSubtextClass()}>Individual Plans</span>
                <span className={getTextClass()}>{analytics.totalUsers - analytics.familyPlans - analytics.businessPlans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={getSubtextClass()}>Family Plans</span>
                <span className={getTextClass()}>{analytics.familyPlans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={getSubtextClass()}>Business Plans</span>
                <span className={getTextClass()}>{analytics.businessPlans}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="p-6">
            <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>Risk Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-400">Low Risk</span>
                <span className={getTextClass()}>{users.filter(u => u.churnRiskLevel === 'Low').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400">Medium Risk</span>
                <span className={getTextClass()}>{users.filter(u => u.churnRiskLevel === 'Medium').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400">High Risk</span>
                <span className={getTextClass()}>{users.filter(u => u.churnRiskLevel === 'High').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render Activity Timeline Tab
  const renderActivityTimeline = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>User Activity Timeline</h3>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className={`text-lg ${getSubtextClass()}`}>No users found</p>
                <p className={`text-sm ${getSubtextClass()}`}>Create users to see their activity timeline</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className={`font-medium ${getTextClass()}`}>{user.fullName}</p>
                          <p className={`text-sm ${getSubtextClass()}`}>{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${getSubtextClass()}`}>Last Activity</p>
                        <p className={`text-sm ${getTextClass()}`}>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getTextClass()}`}>{user.activityTimeline?.length || 0}</p>
                        <p className={`text-sm ${getSubtextClass()}`}>Total Activities</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getTextClass()}`}>{user.totalRoundUps || 0}</p>
                        <p className={`text-sm ${getSubtextClass()}`}>Round-ups</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getTextClass()}`}>{user.mappingSuccessRate || 0}%</p>
                        <p className={`text-sm ${getSubtextClass()}`}>Mapping Success</p>
                      </div>
                    </div>
                    
                    {user.activityTimeline && user.activityTimeline.length > 0 && (
                      <div className="mt-4">
                        <h4 className={`font-medium ${getTextClass()} mb-2`}>Recent Activities</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {user.activityTimeline.slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-center space-x-3 text-sm">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className={getSubtextClass()}>{activity.type}</span>
                              <span className={getSubtextClass()}>
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Render Admin Tools Tab
  const renderAdminTools = () => (
    <div className="space-y-6">
      {/* System Controls */}
      <div className={getCardClass()}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>System Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to clear all user data? This action cannot be undone.')) {
                  localStorage.removeItem('kamioi_users')
                  localStorage.removeItem('kamioi_family_users')
                  localStorage.removeItem('kamioi_business_users')
                  loadUsers()
                  addNotification({
                    type: 'success',
                    title: 'Data Cleared',
                    message: 'All user data has been cleared.',
                    timestamp: new Date()
                  })
                }
              }}
              className="p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 flex items-center space-x-3 transition-all"
            >
              <Trash2 className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium">Clear All Users</p>
                <p className="text-sm opacity-75">Remove all user data</p>
              </div>
            </button>
            
            <button 
              onClick={() => {
                const data = {
                  users: users,
                  timestamp: new Date().toISOString(),
                  totalUsers: users.length
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `kamioi-users-export-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 flex items-center space-x-3 transition-all"
            >
              <Download className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium">Export All Data</p>
                <p className="text-sm opacity-75">Download user data as JSON</p>
              </div>
            </button>
            
            <button 
              onClick={() => {
                const stats = {
                  totalUsers: users.length,
                  activeUsers: users.filter(u => u.accountStatus === 'Active').length,
                  familyUsers: users.filter(u => u.planType === 'family').length,
                  businessUsers: users.filter(u => u.planType === 'business').length,
                  totalRoundUps: users.reduce((sum, u) => sum + (u.totalRoundUps || 0), 0),
                  totalPortfolioValue: users.reduce((sum, u) => sum + (u.currentPortfolioValue || 0), 0),
                  exportDate: new Date().toISOString()
                }
                console.log('📊 System Statistics:', stats)
                addNotification({
                  type: 'info',
                  title: 'System Statistics',
                  message: `Total Users: ${stats.totalUsers}\nActive Users: ${stats.activeUsers}\nFamily Users: ${stats.familyUsers}\nBusiness Users: ${stats.businessUsers}\nTotal Round-ups: $${stats.totalRoundUps.toFixed(2)}\nTotal Portfolio Value: $${stats.totalPortfolioValue.toFixed(2)}`,
                  timestamp: new Date()
                })
              }}
              className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 flex items-center space-x-3 transition-all"
            >
              <BarChart3 className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium">System Statistics</p>
                <p className="text-sm opacity-75">View system overview</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* User Management Tools */}
      <div className={getCardClass()}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>User Management Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className={`font-medium ${getTextClass()}`}>Bulk Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    const activeUsers = users.filter(u => u.accountStatus === 'Active')
                    if (activeUsers.length === 0) {
                      addNotification({
                        type: 'warning',
                        title: 'No Active Users',
                        message: 'No active users found.',
                        timestamp: new Date()
                      })
                      return
                    }
                    if (confirm(`Are you sure you want to suspend ${activeUsers.length} active users?`)) {
                      const updatedUsers = users.map(u => 
                        u.accountStatus === 'Active' ? { ...u, accountStatus: 'Suspended' } : u
                      )
                      setUsers(updatedUsers)
                      setEnhancedUsers(updatedUsers)
                      addNotification({
                        type: 'success',
                        title: 'Users Suspended',
                        message: `${activeUsers.length} users have been suspended.`,
                        timestamp: new Date()
                      })
                    }
                  }}
                  className="w-full p-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-yellow-400 flex items-center space-x-2 transition-all"
                >
                  <UserX className="w-4 h-4" />
                  <span>Suspend All Active Users</span>
                </button>
                
                <button 
                  onClick={() => {
                    const suspendedUsers = users.filter(u => u.accountStatus === 'Suspended')
                    if (suspendedUsers.length === 0) {
                      addNotification({
                        type: 'warning',
                        title: 'No Suspended Users',
                        message: 'No suspended users found.',
                        timestamp: new Date()
                      })
                      return
                    }
                    if (confirm(`Are you sure you want to activate ${suspendedUsers.length} suspended users?`)) {
                      const updatedUsers = users.map(u => 
                        u.accountStatus === 'Suspended' ? { ...u, accountStatus: 'Active' } : u
                      )
                      setUsers(updatedUsers)
                      setEnhancedUsers(updatedUsers)
                      addNotification({
                        type: 'success',
                        title: 'Users Activated',
                        message: `${suspendedUsers.length} users have been activated.`,
                        timestamp: new Date()
                      })
                    }
                  }}
                  className="w-full p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 flex items-center space-x-2 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Activate All Suspended Users</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className={`font-medium ${getTextClass()}`}>Data Management</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    const csvData = users.map(user => ({
                      id: user.id,
                      name: user.fullName,
                      email: user.email,
                      phone: user.phone,
                      status: user.accountStatus,
                      planType: user.planType,
                      totalRoundUps: user.totalRoundUps || 0,
                      portfolioValue: user.currentPortfolioValue || 0,
                      signupDate: user.signupDate
                    }))
                    
                    const csvContent = [
                      Object.keys(csvData[0] || {}).join(','),
                      ...csvData.map(row => Object.values(row).join(','))
                    ].join('\n')
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `kamioi-users-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="w-full p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 flex items-center space-x-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export as CSV</span>
                </button>
                
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all user statistics? This will set all metrics to zero.')) {
                      const updatedUsers = users.map(user => ({
                        ...user,
                        totalRoundUps: 0,
                        currentPortfolioValue: 0,
                        totalFeesPaid: 0,
                        mappingSuccessRate: 0,
                        engagementScore: 0,
                        healthScore: 0,
                        activityTimeline: []
                      }))
                      setUsers(updatedUsers)
                      setEnhancedUsers(updatedUsers)
                      addNotification({
                        type: 'success',
                        title: 'Statistics Reset',
                        message: 'All user statistics have been reset.',
                        timestamp: new Date()
                      })
                    }
                  }}
                  className="w-full p-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 flex items-center space-x-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Statistics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className={getCardClass()}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${getTextClass()}`}>{users.length}</p>
              <p className={`text-sm ${getSubtextClass()}`}>Total Users</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${getTextClass()}`}>{users.filter(u => u.accountStatus === 'Active').length}</p>
              <p className={`text-sm ${getSubtextClass()}`}>Active Users</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${getTextClass()}`}>{users.reduce((sum, u) => sum + (u.totalRoundUps || 0), 0).toFixed(2)}</p>
              <p className={`text-sm ${getSubtextClass()}`}>Total Round-ups</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${getTextClass()}`}>{users.reduce((sum, u) => sum + (u.currentPortfolioValue || 0), 0).toFixed(2)}</p>
              <p className={`text-sm ${getSubtextClass()}`}>Total Portfolio Value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render AI Insights Tab
  const renderAIInsights = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${getTextClass()} mb-4`}>AI Predictions & Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.slice(0, 6).map(user => (
              <div key={user.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${getTextClass()}`}>{user.fullName}</p>
                    <p className={`text-xs ${getSubtextClass()}`}>{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-xs ${getSubtextClass()}`}>Churn Risk</span>
                    <span className={`text-xs ${getChurnRiskColor(user.churnRiskLevel)}`}>
                      {user.churnRiskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${getSubtextClass()}`}>Health Score</span>
                    <span className={`text-xs ${getTextClass()}`}>{user.healthScore?.toFixed(0) || '85'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${getSubtextClass()}`}>Engagement</span>
                    <span className={`text-xs ${getTextClass()}`}>{user.engagementScore?.toFixed(0) || '85'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${getTextClass()}`}>User Management</h1>
          <p className={`text-lg ${getSubtextClass()}`}>AI-powered user intelligence and management system</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadUsers}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-400 flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Users</span>
          </button>
          <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <button 
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Bulk Actions</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'directory', label: 'User Directory', icon: Users },
          { id: 'analytics', label: 'User Analytics', icon: BarChart3 },
          { id: 'insights', label: 'AI Insights', icon: Brain },
          { id: 'timeline', label: 'Activity Timeline', icon: Clock },
          { id: 'tools', label: 'Admin Tools', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'directory' && renderUserDirectory()}
        {activeTab === 'analytics' && renderUserAnalytics()}
        {activeTab === 'insights' && renderAIInsights()}
        {activeTab === 'timeline' && renderActivityTimeline()}
        {activeTab === 'tools' && renderAdminTools()}
      </AnimatePresence>

      {/* Glass Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        title="Enhanced User Details"
        onUserUpdate={handleUserUpdate}
      />

      {/* Glass Message Modal */}
      <AnimatePresence mode="wait">
        {showMessageModal && (
          <motion.div
            key="message-modal"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              className="glass-modal-container p-6 max-w-md w-full mx-auto"
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                zIndex: 10000
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Send Message
                </h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">
                  Send a message to:
                </p>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  {messageRecipient?.profileImage ? (
                    <img 
                      src={messageRecipient.profileImage} 
                      alt={messageRecipient.fullName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20">
                      {messageRecipient?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{messageRecipient?.fullName}</p>
                    <p className="text-gray-400 text-sm">{messageRecipient?.email}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">
                  Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  autoFocus
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-4 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessageSubmit}
                  disabled={!messageText.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence mode="wait">
        {showSuccessModal && (
          <motion.div
            key="success-modal"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              className="glass-modal-container p-6 max-w-md w-full mx-auto"
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                zIndex: 10000
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Success</span>
                </h3>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-white text-center">
                  {successMessage}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>OK</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedUserManagement
