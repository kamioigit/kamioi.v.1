// Family Account Management API
// This service handles all family-related API calls

// Ready for backend connection
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'

class FamilyAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/family`
  }

  // Helper method for making API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('authToken')
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    }

    const config = { ...defaultOptions, ...options }
    
    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Family API request failed:', error)
      throw error
    }
  }

  // Family Dashboard
  async getFamilyDashboard() {
    return this.makeRequest('/dashboard')
  }

  // Family Members Management
  async getFamilyMembers() {
    return this.makeRequest('/members')
  }

  async addFamilyMember(memberData) {
    return this.makeRequest('/members', {
      method: 'POST',
      body: JSON.stringify(memberData)
    })
  }

  async updateFamilyMember(memberId, memberData) {
    return this.makeRequest(`/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    })
  }

  async removeFamilyMember(memberId) {
    return this.makeRequest(`/members/${memberId}`, {
      method: 'DELETE'
    })
  }

  async getFamilyMemberDetails(memberId) {
    return this.makeRequest(`/members/${memberId}`)
  }

  // Family Transactions
  async getFamilyTransactions(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/transactions?${queryParams}`)
  }

  async getFamilyTransactionById(transactionId) {
    return this.makeRequest(`/transactions/${transactionId}`)
  }

  async createFamilyTransaction(transactionData) {
    return this.makeRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    })
  }

  async updateFamilyTransaction(transactionId, transactionData) {
    return this.makeRequest(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    })
  }

  async deleteFamilyTransaction(transactionId) {
    return this.makeRequest(`/transactions/${transactionId}`, {
      method: 'DELETE'
    })
  }

  // Family Goals
  async getFamilyGoals() {
    return this.makeRequest('/goals')
  }

  async createFamilyGoal(goalData) {
    return this.makeRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    })
  }

  async updateFamilyGoal(goalId, goalData) {
    return this.makeRequest(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData)
    })
  }

  async deleteFamilyGoal(goalId) {
    return this.makeRequest(`/goals/${goalId}`, {
      method: 'DELETE'
    })
  }

  async getFamilyGoalProgress(goalId) {
    return this.makeRequest(`/goals/${goalId}/progress`)
  }

  // Family Portfolio
  async getFamilyPortfolio() {
    return this.makeRequest('/portfolio')
  }

  async getFamilyHoldings() {
    return this.makeRequest('/holdings')
  }

  async getFamilyPerformance(timeRange = '1m') {
    return this.makeRequest(`/performance?timeRange=${timeRange}`)
  }

  async getFamilyAssetAllocation() {
    return this.makeRequest('/asset-allocation')
  }

  // Family Analytics
  async getFamilyAnalytics(timeRange = '1m') {
    return this.makeRequest(`/analytics?timeRange=${timeRange}`)
  }

  async getFamilySpendingAnalysis(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/analytics/spending?${queryParams}`)
  }

  async getFamilyInvestmentAnalysis(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/analytics/investments?${queryParams}`)
  }

  // Family Notifications
  async getFamilyNotifications() {
    return this.makeRequest('/notifications')
  }

  async markFamilyNotificationAsRead(notificationId) {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  }

  async markAllFamilyNotificationsAsRead() {
    return this.makeRequest('/notifications/read-all', {
      method: 'PUT'
    })
  }

  // Family Settings
  async getFamilySettings() {
    return this.makeRequest('/settings')
  }

  async updateFamilySettings(settings) {
    return this.makeRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  // Family Permissions
  async getFamilyPermissions() {
    return this.makeRequest('/permissions')
  }

  async updateFamilyPermissions(permissions) {
    return this.makeRequest('/permissions', {
      method: 'PUT',
      body: JSON.stringify(permissions)
    })
  }

  async getMemberPermissions(memberId) {
    return this.makeRequest(`/members/${memberId}/permissions`)
  }

  async updateMemberPermissions(memberId, permissions) {
    return this.makeRequest(`/members/${memberId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissions)
    })
  }

  // Family Round-ups
  async getFamilyRoundUps() {
    return this.makeRequest('/roundups')
  }

  async updateFamilyRoundUpSettings(settings) {
    return this.makeRequest('/roundups/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async getFamilyRoundUpHistory(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/roundups/history?${queryParams}`)
  }

  // Family AI Recommendations
  async getFamilyRecommendations() {
    return this.makeRequest('/recommendations')
  }

  async updateFamilyRecommendationFeedback(recommendationId, feedback) {
    return this.makeRequest(`/recommendations/${recommendationId}/feedback`, {
      method: 'PUT',
      body: JSON.stringify({ feedback })
    })
  }

  // Family Budget Management
  async getFamilyBudgets() {
    return this.makeRequest('/budgets')
  }

  async createFamilyBudget(budgetData) {
    return this.makeRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData)
    })
  }

  async updateFamilyBudget(budgetId, budgetData) {
    return this.makeRequest(`/budgets/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData)
    })
  }

  async deleteFamilyBudget(budgetId) {
    return this.makeRequest(`/budgets/${budgetId}`, {
      method: 'DELETE'
    })
  }

  // Family Reports
  async getFamilyReports() {
    return this.makeRequest('/reports')
  }

  async generateFamilyReport(reportType, params = {}) {
    return this.makeRequest(`/reports/${reportType}`, {
      method: 'POST',
      body: JSON.stringify(params)
    })
  }

  async getFamilyReportById(reportId) {
    return this.makeRequest(`/reports/${reportId}`)
  }

  // Family Activity Log
  async getFamilyActivityLog(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/activity?${queryParams}`)
  }

  // Family Statistics
  async getFamilyStats() {
    return this.makeRequest('/stats')
  }

  async getFamilyMemberStats(memberId) {
    return this.makeRequest(`/members/${memberId}/stats`)
  }

  // Family Export
  async exportFamilyData(format = 'json') {
    return this.makeRequest(`/export?format=${format}`)
  }

  // Family Support
  async createFamilySupportTicket(ticketData) {
    return this.makeRequest('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    })
  }

  async getFamilySupportTickets() {
    return this.makeRequest('/support/tickets')
  }

  async getFamilySupportTicket(ticketId) {
    return this.makeRequest(`/support/tickets/${ticketId}`)
  }

  // Family Invitations
  async sendFamilyInvitation(invitationData) {
    return this.makeRequest('/invitations', {
      method: 'POST',
      body: JSON.stringify(invitationData)
    })
  }

  async getFamilyInvitations() {
    return this.makeRequest('/invitations')
  }

  async acceptFamilyInvitation(invitationId) {
    return this.makeRequest(`/invitations/${invitationId}/accept`, {
      method: 'PUT'
    })
  }

  async declineFamilyInvitation(invitationId) {
    return this.makeRequest(`/invitations/${invitationId}/decline`, {
      method: 'PUT'
    })
  }

  // Family Rewards
  async getFamilyRewards() {
    return this.makeRequest('/rewards')
  }

  async claimFamilyReward(rewardId) {
    return this.makeRequest(`/rewards/${rewardId}/claim`, {
      method: 'POST'
    })
  }

  // Family Educational Content
  async getFamilyEducationalContent() {
    return this.makeRequest('/education')
  }

  async markEducationalContentAsCompleted(contentId) {
    return this.makeRequest(`/education/${contentId}/complete`, {
      method: 'PUT'
    })
  }
}

export default new FamilyAPI()
