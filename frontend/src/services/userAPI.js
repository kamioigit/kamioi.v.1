// User Account Management API
// This service handles all user-related API calls

// Ready for backend connection
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api'

class UserAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/users`
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
      console.error('API request failed:', error)
      throw error
    }
  }

  // User Profile Management
  async getUserProfile(userId) {
    return this.makeRequest(`/${userId}`)
  }

  async updateUserProfile(userId, profileData) {
    return this.makeRequest(`/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  // User Settings
  async updateUserSettings(userId, settings) {
    return this.makeRequest(`/${userId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async getUserSettings(userId) {
    return this.makeRequest(`/${userId}/settings`)
  }

  // User Preferences
  async updateUserPreferences(userId, preferences) {
    return this.makeRequest(`/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    })
  }

  async getUserPreferences(userId) {
    return this.makeRequest(`/${userId}/preferences`)
  }

  // User Notifications
  async getUserNotifications(userId) {
    return this.makeRequest(`/${userId}/notifications`)
  }

  async markNotificationAsRead(userId, notificationId) {
    return this.makeRequest(`/${userId}/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  }

  async markAllNotificationsAsRead(userId) {
    return this.makeRequest(`/${userId}/notifications/read-all`, {
      method: 'PUT'
    })
  }

  // User Goals
  async getUserGoals(userId) {
    return this.makeRequest(`/${userId}/goals`)
  }

  async createUserGoal(userId, goalData) {
    return this.makeRequest(`/${userId}/goals`, {
      method: 'POST',
      body: JSON.stringify(goalData)
    })
  }

  async updateUserGoal(userId, goalId, goalData) {
    return this.makeRequest(`/${userId}/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData)
    })
  }

  async deleteUserGoal(userId, goalId) {
    return this.makeRequest(`/${userId}/goals/${goalId}`, {
      method: 'DELETE'
    })
  }

  // User Portfolio
  async getUserPortfolio(userId) {
    return this.makeRequest(`/${userId}/portfolio`)
  }

  async getUserHoldings(userId) {
    return this.makeRequest(`/${userId}/holdings`)
  }

  async getUserPerformance(userId, timeRange = '1m') {
    return this.makeRequest(`/${userId}/performance?timeRange=${timeRange}`)
  }

  // User Transactions
  async getUserTransactions(userId, params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/${userId}/transactions?${queryParams}`)
  }

  async createUserTransaction(userId, transactionData) {
    return this.makeRequest(`/${userId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transactionData)
    })
  }

  // User Round-ups
  async getUserRoundUps(userId) {
    return this.makeRequest(`/${userId}/roundups`)
  }

  async updateRoundUpSettings(userId, settings) {
    return this.makeRequest(`/${userId}/roundups/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  // User AI Recommendations
  async getUserRecommendations(userId) {
    return this.makeRequest(`/${userId}/recommendations`)
  }

  async updateRecommendationFeedback(userId, recommendationId, feedback) {
    return this.makeRequest(`/${userId}/recommendations/${recommendationId}/feedback`, {
      method: 'PUT',
      body: JSON.stringify({ feedback })
    })
  }

  // User Security
  async enableTwoFactor(userId) {
    return this.makeRequest(`/${userId}/2fa/enable`, {
      method: 'POST'
    })
  }

  async disableTwoFactor(userId, code) {
    return this.makeRequest(`/${userId}/2fa/disable`, {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  async verifyTwoFactor(userId, code) {
    return this.makeRequest(`/${userId}/2fa/verify`, {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  // User Activity Log
  async getUserActivityLog(userId, params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/${userId}/activity?${queryParams}`)
  }

  // User Statistics
  async getUserStats(userId) {
    return this.makeRequest(`/${userId}/stats`)
  }

  async getUserDashboardData(userId) {
    return this.makeRequest(`/${userId}/dashboard`)
  }

  // User Export Data
  async exportUserData(userId, format = 'json') {
    return this.makeRequest(`/${userId}/export?format=${format}`)
  }

  // User Account Management
  async deactivateUserAccount(userId) {
    return this.makeRequest(`/${userId}/deactivate`, {
      method: 'PUT'
    })
  }

  async reactivateUserAccount(userId) {
    return this.makeRequest(`/${userId}/reactivate`, {
      method: 'PUT'
    })
  }

  // User Support
  async createSupportTicket(userId, ticketData) {
    return this.makeRequest(`/${userId}/support/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticketData)
    })
  }

  async getUserSupportTickets(userId) {
    return this.makeRequest(`/${userId}/support/tickets`)
  }

  async getSupportTicket(userId, ticketId) {
    return this.makeRequest(`/${userId}/support/tickets/${ticketId}`)
  }

  // User Referrals
  async getUserReferrals(userId) {
    return this.makeRequest(`/${userId}/referrals`)
  }

  async createUserReferral(userId, referralData) {
    return this.makeRequest(`/${userId}/referrals`, {
      method: 'POST',
      body: JSON.stringify(referralData)
    })
  }

  // User Rewards
  async getUserRewards(userId) {
    return this.makeRequest(`/${userId}/rewards`)
  }

  async claimUserReward(userId, rewardId) {
    return this.makeRequest(`/${userId}/rewards/${rewardId}/claim`, {
      method: 'POST'
    })
  }
}

export default new UserAPI()
