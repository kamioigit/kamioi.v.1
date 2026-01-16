// Admin Management API
// This service handles all admin-related API calls

class AdminAPI {
  constructor() {
    // Set baseURL based on current hostname
    if (window.location.hostname === 'admin.kamioi.com') {
      this.baseURL = 'http://admin.kamioi.com/api/admin'
    } else if (window.location.hostname === 'app.kamioi.com') {
      this.baseURL = 'http://app.kamioi.com/api/admin'
    } else {
      // Development fallback
      this.baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111') + '/api/admin'
    }
  }

  // Helper method for making API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('authToken') || localStorage.getItem('kamioi_token')
    
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
      console.error('Admin API request failed:', error)
      throw error
    }
  }

  // Admin Dashboard
  async getAdminDashboard() {
    return this.makeRequest('/dashboard')
  }

  // System Health
  async getSystemHealth() {
    return this.makeRequest('/health')
  }

  // User Management
  async getAllUsers(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/users?${queryParams}`)
  }

  async getUserById(userId) {
    return this.makeRequest(`/users/${userId}`)
  }

  async updateUser(userId, userData) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  async deactivateUser(userId) {
    return this.makeRequest(`/users/${userId}/deactivate`, {
      method: 'PUT'
    })
  }

  async activateUser(userId) {
    return this.makeRequest(`/users/${userId}/activate`, {
      method: 'PUT'
    })
  }

  async deleteUser(userId) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'DELETE'
    })
  }

  // Transaction Management
  async getAllTransactions(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/transactions?${queryParams}`)
  }

  async getTransactionById(transactionId) {
    return this.makeRequest(`/transactions/${transactionId}`)
  }

  async updateTransaction(transactionId, transactionData) {
    return this.makeRequest(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    })
  }

  async deleteTransaction(transactionId) {
    return this.makeRequest(`/transactions/${transactionId}`, {
      method: 'DELETE'
    })
  }

  // System Logs
  async getSystemLogs(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/logs?${queryParams}`)
  }

  async getErrorLogs(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/logs/errors?${queryParams}`)
  }

  async getAuditLogs(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/logs/audit?${queryParams}`)
  }

  // System Configuration
  async getSystemConfig() {
    return this.makeRequest('/config')
  }

  async updateSystemConfig(configData) {
    return this.makeRequest('/config', {
      method: 'PUT',
      body: JSON.stringify(configData)
    })
  }

  async getFeatureFlags() {
    return this.makeRequest('/feature-flags')
  }

  async updateFeatureFlag(flagName, flagData) {
    return this.makeRequest(`/feature-flags/${flagName}`, {
      method: 'PUT',
      body: JSON.stringify(flagData)
    })
  }

  // Analytics and Reports
  async getSystemAnalytics(timeRange = '1m') {
    return this.makeRequest(`/analytics?timeRange=${timeRange}`)
  }

  async getUserAnalytics(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/analytics/users?${queryParams}`)
  }

  async getTransactionAnalytics(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/analytics/transactions?${queryParams}`)
  }

  async getFinancialAnalytics(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/analytics/financial?${queryParams}`)
  }

  async generateReport(reportType, params = {}) {
    return this.makeRequest(`/reports/${reportType}`, {
      method: 'POST',
      body: JSON.stringify(params)
    })
  }

  async getReportById(reportId) {
    return this.makeRequest(`/reports/${reportId}`)
  }

  async downloadReport(reportId, format = 'pdf') {
    return this.makeRequest(`/reports/${reportId}/download?format=${format}`)
  }

  // Support Management
  async getAllSupportTickets(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/support/tickets?${queryParams}`)
  }

  async getSupportTicketById(ticketId) {
    return this.makeRequest(`/support/tickets/${ticketId}`)
  }

  async updateSupportTicket(ticketId, ticketData) {
    return this.makeRequest(`/support/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData)
    })
  }

  async closeSupportTicket(ticketId) {
    return this.makeRequest(`/support/tickets/${ticketId}/close`, {
      method: 'PUT'
    })
  }

  async assignSupportTicket(ticketId, assigneeId) {
    return this.makeRequest(`/support/tickets/${ticketId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigneeId })
    })
  }

  // Notification Management
  async sendSystemNotification(notificationData) {
    return this.makeRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    })
  }

  async getSystemNotifications() {
    return this.makeRequest('/notifications')
  }

  async updateSystemNotification(notificationId, notificationData) {
    return this.makeRequest(`/notifications/${notificationId}`, {
      method: 'PUT',
      body: JSON.stringify(notificationData)
    })
  }

  async deleteSystemNotification(notificationId) {
    return this.makeRequest(`/notifications/${notificationId}`, {
      method: 'DELETE'
    })
  }

  // Security Management
  async getSecurityAlerts() {
    return this.makeRequest('/security/alerts')
  }

  async getSecurityLogs(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/security/logs?${queryParams}`)
  }

  async getFailedLoginAttempts(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/security/failed-logins?${queryParams}`)
  }

  async blockUser(userId, reason) {
    return this.makeRequest(`/security/block-user/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  async unblockUser(userId) {
    return this.makeRequest(`/security/unblock-user/${userId}`, {
      method: 'POST'
    })
  }

  // Backup and Maintenance
  async createSystemBackup() {
    return this.makeRequest('/backup', {
      method: 'POST'
    })
  }

  async getBackupStatus() {
    return this.makeRequest('/backup/status')
  }

  async restoreFromBackup(backupId) {
    return this.makeRequest(`/backup/${backupId}/restore`, {
      method: 'POST'
    })
  }

  async runSystemMaintenance() {
    return this.makeRequest('/maintenance', {
      method: 'POST'
    })
  }

  // API Management
  async getAPIUsageStats(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/api/usage?${queryParams}`)
  }

  async getAPIKeys() {
    return this.makeRequest('/api/keys')
  }

  async createAPIKey(keyData) {
    return this.makeRequest('/api/keys', {
      method: 'POST',
      body: JSON.stringify(keyData)
    })
  }

  async revokeAPIKey(keyId) {
    return this.makeRequest(`/api/keys/${keyId}/revoke`, {
      method: 'PUT'
    })
  }

  // Integration Management
  async getIntegrations() {
    return this.makeRequest('/integrations')
  }

  async updateIntegration(integrationId, integrationData) {
    return this.makeRequest(`/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(integrationData)
    })
  }

  async testIntegration(integrationId) {
    return this.makeRequest(`/integrations/${integrationId}/test`, {
      method: 'POST'
    })
  }

  // Database Management
  async getDatabaseStats() {
    return this.makeRequest('/database/stats')
  }

  async runDatabaseQuery(query) {
    return this.makeRequest('/database/query', {
      method: 'POST',
      body: JSON.stringify({ query })
    })
  }

  async optimizeDatabase() {
    return this.makeRequest('/database/optimize', {
      method: 'POST'
    })
  }

  // Cache Management
  async getCacheStats() {
    return this.makeRequest('/cache/stats')
  }

  async clearCache(cacheType) {
    return this.makeRequest(`/cache/clear?type=${cacheType}`, {
      method: 'POST'
    })
  }

  async warmCache() {
    return this.makeRequest('/cache/warm', {
      method: 'POST'
    })
  }
}

export default new AdminAPI()
