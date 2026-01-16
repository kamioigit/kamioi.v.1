// Business Account Management API
// This service handles all business-related API calls

// Ready for backend connection
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'

class BusinessAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/business`
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

  // Business Account Management
  async createBusinessAccount(businessData) {
    return this.makeRequest('/accounts', {
      method: 'POST',
      body: JSON.stringify(businessData)
    })
  }

  async getBusinessAccount(businessId) {
    return this.makeRequest(`/accounts/${businessId}`)
  }

  async updateBusinessAccount(businessId, updateData) {
    return this.makeRequest(`/accounts/${businessId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  async deleteBusinessAccount(businessId) {
    return this.makeRequest(`/accounts/${businessId}`, {
      method: 'DELETE'
    })
  }

  async listBusinessAccounts(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString()
    return this.makeRequest(`/accounts?${queryParams}`)
  }

  // Business Employee Management
  async addEmployee(businessId, employeeData) {
    return this.makeRequest(`/accounts/${businessId}/employees`, {
      method: 'POST',
      body: JSON.stringify(employeeData)
    })
  }

  async getEmployees(businessId) {
    return this.makeRequest(`/accounts/${businessId}/employees`)
  }

  async updateEmployee(businessId, employeeId, updateData) {
    return this.makeRequest(`/accounts/${businessId}/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  async removeEmployee(businessId, employeeId) {
    return this.makeRequest(`/accounts/${businessId}/employees/${employeeId}`, {
      method: 'DELETE'
    })
  }

  async updateEmployeeRole(businessId, employeeId, roleData) {
    return this.makeRequest(`/accounts/${businessId}/employees/${employeeId}/role`, {
      method: 'PUT',
      body: JSON.stringify(roleData)
    })
  }

  // Business Transactions
  async getBusinessTransactions(businessId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString()
    return this.makeRequest(`/accounts/${businessId}/transactions?${queryParams}`)
  }

  async addBusinessTransaction(businessId, transactionData) {
    return this.makeRequest(`/accounts/${businessId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transactionData)
    })
  }

  async updateBusinessTransaction(businessId, transactionId, updateData) {
    return this.makeRequest(`/accounts/${businessId}/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  async deleteBusinessTransaction(businessId, transactionId) {
    return this.makeRequest(`/accounts/${businessId}/transactions/${transactionId}`, {
      method: 'DELETE'
    })
  }

  async categorizeTransaction(businessId, transactionId, categoryData) {
    return this.makeRequest(`/accounts/${businessId}/transactions/${transactionId}/categorize`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    })
  }

  // Business Goals
  async getBusinessGoals(businessId) {
    return this.makeRequest(`/accounts/${businessId}/goals`)
  }

  async createBusinessGoal(businessId, goalData) {
    return this.makeRequest(`/accounts/${businessId}/goals`, {
      method: 'POST',
      body: JSON.stringify(goalData)
    })
  }

  async updateBusinessGoal(businessId, goalId, updateData) {
    return this.makeRequest(`/accounts/${businessId}/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  async deleteBusinessGoal(businessId, goalId) {
    return this.makeRequest(`/accounts/${businessId}/goals/${goalId}`, {
      method: 'DELETE'
    })
  }

  // Business Analytics
  async getBusinessAnalytics(businessId, period = '30d') {
    return this.makeRequest(`/accounts/${businessId}/analytics?period=${period}`)
  }

  async getBusinessPerformance(businessId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString()
    return this.makeRequest(`/accounts/${businessId}/performance?${queryParams}`)
  }

  async getExpenseCategories(businessId) {
    return this.makeRequest(`/accounts/${businessId}/expense-categories`)
  }

  async getInvestmentSummary(businessId) {
    return this.makeRequest(`/accounts/${businessId}/investments`)
  }

  // Business Reports
  async generateBusinessReport(businessId, reportType, options = {}) {
    return this.makeRequest(`/accounts/${businessId}/reports/${reportType}`, {
      method: 'POST',
      body: JSON.stringify(options)
    })
  }

  async exportBusinessData(businessId, format = 'csv', filters = {}) {
    const queryParams = new URLSearchParams({ format, ...filters }).toString()
    return this.makeRequest(`/accounts/${businessId}/export?${queryParams}`)
  }

  async getReportHistory(businessId) {
    return this.makeRequest(`/accounts/${businessId}/reports`)
  }

  // Business Settings
  async getBusinessSettings(businessId) {
    return this.makeRequest(`/accounts/${businessId}/settings`)
  }

  async updateBusinessSettings(businessId, settingsData) {
    return this.makeRequest(`/accounts/${businessId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    })
  }

  async updateInvestmentSettings(businessId, investmentData) {
    return this.makeRequest(`/accounts/${businessId}/settings/investment`, {
      method: 'PUT',
      body: JSON.stringify(investmentData)
    })
  }

  async updateNotificationSettings(businessId, notificationData) {
    return this.makeRequest(`/accounts/${businessId}/settings/notifications`, {
      method: 'PUT',
      body: JSON.stringify(notificationData)
    })
  }

  // Business Integrations
  async getIntegrations(businessId) {
    return this.makeRequest(`/accounts/${businessId}/integrations`)
  }

  async connectIntegration(businessId, integrationType, connectionData) {
    return this.makeRequest(`/accounts/${businessId}/integrations/${integrationType}`, {
      method: 'POST',
      body: JSON.stringify(connectionData)
    })
  }

  async disconnectIntegration(businessId, integrationType) {
    return this.makeRequest(`/accounts/${businessId}/integrations/${integrationType}`, {
      method: 'DELETE'
    })
  }

  async syncIntegration(businessId, integrationType) {
    return this.makeRequest(`/accounts/${businessId}/integrations/${integrationType}/sync`, {
      method: 'POST'
    })
  }

  // Business Permissions
  async getBusinessPermissions(businessId) {
    return this.makeRequest(`/accounts/${businessId}/permissions`)
  }

  async updateBusinessPermissions(businessId, permissionsData) {
    return this.makeRequest(`/accounts/${businessId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissionsData)
    })
  }

  async getEmployeePermissions(businessId, employeeId) {
    return this.makeRequest(`/accounts/${businessId}/employees/${employeeId}/permissions`)
  }

  async updateEmployeePermissions(businessId, employeeId, permissionsData) {
    return this.makeRequest(`/accounts/${businessId}/employees/${employeeId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissionsData)
    })
  }

  // Business Billing
  async getBusinessBilling(businessId) {
    return this.makeRequest(`/accounts/${businessId}/billing`)
  }

  async updateBillingInfo(businessId, billingData) {
    return this.makeRequest(`/accounts/${businessId}/billing`, {
      method: 'PUT',
      body: JSON.stringify(billingData)
    })
  }

  async getBillingHistory(businessId) {
    return this.makeRequest(`/accounts/${businessId}/billing/history`)
  }

  async updateSubscription(businessId, subscriptionData) {
    return this.makeRequest(`/accounts/${businessId}/billing/subscription`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData)
    })
  }

  // Business Audit Logs
  async getAuditLogs(businessId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString()
    return this.makeRequest(`/accounts/${businessId}/audit-logs?${queryParams}`)
  }

  // Business Notifications
  async getBusinessNotifications(businessId) {
    return this.makeRequest(`/accounts/${businessId}/notifications`)
  }

  async markNotificationRead(businessId, notificationId) {
    return this.makeRequest(`/accounts/${businessId}/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  }

  async markAllNotificationsRead(businessId) {
    return this.makeRequest(`/accounts/${businessId}/notifications/read-all`, {
      method: 'PUT'
    })
  }

  // Business Dashboard Data
  async getDashboardData(businessId) {
    return this.makeRequest(`/accounts/${businessId}/dashboard`)
  }

  async getQuickStats(businessId) {
    return this.makeRequest(`/accounts/${businessId}/stats`)
  }

  // Business Validation
  async validateBusinessData(businessData) {
    return this.makeRequest('/validate', {
      method: 'POST',
      body: JSON.stringify(businessData)
    })
  }

  async checkBusinessNameAvailability(businessName) {
    return this.makeRequest(`/validate/name?name=${encodeURIComponent(businessName)}`)
  }

  async checkTaxIdAvailability(taxId) {
    return this.makeRequest(`/validate/tax-id?taxId=${encodeURIComponent(taxId)}`)
  }

  // Business Onboarding
  async getOnboardingStatus(businessId) {
    return this.makeRequest(`/accounts/${businessId}/onboarding`)
  }

  async updateOnboardingStep(businessId, step, data) {
    return this.makeRequest(`/accounts/${businessId}/onboarding/${step}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async completeOnboarding(businessId) {
    return this.makeRequest(`/accounts/${businessId}/onboarding/complete`, {
      method: 'POST'
    })
  }

  // Business Support
  async createSupportTicket(businessId, ticketData) {
    return this.makeRequest(`/accounts/${businessId}/support`, {
      method: 'POST',
      body: JSON.stringify(ticketData)
    })
  }

  async getSupportTickets(businessId) {
    return this.makeRequest(`/accounts/${businessId}/support`)
  }

  async updateSupportTicket(businessId, ticketId, updateData) {
    return this.makeRequest(`/accounts/${businessId}/support/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }
}

// Create and export a singleton instance
const businessAPI = new BusinessAPI()
export default businessAPI

// Export the class for testing purposes
export { BusinessAPI }
