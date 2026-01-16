// Transactions Management API
// This service handles all transaction-related API calls

// Ready for backend connection
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'

class TransactionsAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/transactions`
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
      console.error('Transactions API request failed:', error)
      throw error
    }
  }

  // Get all transactions for the authenticated user
  async getTransactions(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  // Get transaction by ID
  async getTransactionById(transactionId) {
    return this.makeRequest(`/${transactionId}`)
  }

  // Create new transaction
  async createTransaction(transactionData) {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    })
  }

  // Update transaction
  async updateTransaction(transactionId, transactionData) {
    return this.makeRequest(`/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    })
  }

  // Delete transaction
  async deleteTransaction(transactionId) {
    return this.makeRequest(`/${transactionId}`, {
      method: 'DELETE'
    })
  }

  // Get transaction statistics
  async getTransactionStats() {
    return this.makeRequest('/stats/overview')
  }

  // Get transactions by type
  async getTransactionsByType(type, params = {}) {
    const queryParams = new URLSearchParams({ type, ...params }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  // Get transactions by status
  async getTransactionsByStatus(status, params = {}) {
    const queryParams = new URLSearchParams({ status, ...params }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  // Get transactions by date range
  async getTransactionsByDateRange(startDate, endDate, params = {}) {
    const queryParams = new URLSearchParams({ 
      startDate, 
      endDate, 
      ...params 
    }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  // Get recent transactions
  async getRecentTransactions(limit = 10) {
    return this.makeRequest(`?limit=${limit}&sort=createdAt&order=desc`)
  }

  // Get pending transactions
  async getPendingTransactions() {
    return this.makeRequest('?status=pending')
  }

  // Get completed transactions
  async getCompletedTransactions(params = {}) {
    const queryParams = new URLSearchParams({ status: 'completed', ...params }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  // Get failed transactions
  async getFailedTransactions() {
    return this.makeRequest('?status=failed')
  }

  // Investment transactions
  async getInvestmentTransactions(params = {}) {
    const queryParams = new URLSearchParams({ type: 'investment', ...params }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  async createInvestmentTransaction(investmentData) {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        type: 'investment',
        ...investmentData
      })
    })
  }

  // Deposit transactions
  async getDepositTransactions(params = {}) {
    const queryParams = new URLSearchParams({ type: 'deposit', ...params }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  async createDepositTransaction(depositData) {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        type: 'deposit',
        ...depositData
      })
    })
  }

  // Withdrawal transactions
  async getWithdrawalTransactions(params = {}) {
    const queryParams = new URLSearchParams({ type: 'withdrawal', ...params }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  async createWithdrawalTransaction(withdrawalData) {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        type: 'withdrawal',
        ...withdrawalData
      })
    })
  }

  // Round-up transactions
  async getRoundUpTransactions(params = {}) {
    const queryParams = new URLSearchParams({ type: 'roundup', ...params }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  async createRoundUpTransaction(roundUpData) {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        type: 'roundup',
        ...roundUpData
      })
    })
  }

  // Fee transactions
  async getFeeTransactions(params = {}) {
    const queryParams = new URLSearchParams({ type: 'fee', ...params }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  async createFeeTransaction(feeData) {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        type: 'fee',
        ...feeData
      })
    })
  }

  // Dividend transactions
  async getDividendTransactions(params = {}) {
    const queryParams = new URLSearchParams({ type: 'dividend', ...params }).toString()
    return this.makeRequest(`?${queryParams}`)
  }

  async createDividendTransaction(dividendData) {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        type: 'dividend',
        ...dividendData
      })
    })
  }

  // Transaction search
  async searchTransactions(searchTerm, params = {}) {
    const queryParams = new URLSearchParams({ search: searchTerm, ...params }).toString()
    return this.makeRequest(`/search?${queryParams}`)
  }

  // Transaction export
  async exportTransactions(format = 'csv', params = {}) {
    const queryParams = new URLSearchParams({ format, ...params }).toString()
    return this.makeRequest(`/export?${queryParams}`)
  }

  // Transaction categories
  async getTransactionCategories() {
    return this.makeRequest('/categories')
  }

  async createTransactionCategory(categoryData) {
    return this.makeRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    })
  }

  async updateTransactionCategory(categoryId, categoryData) {
    return this.makeRequest(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    })
  }

  async deleteTransactionCategory(categoryId) {
    return this.makeRequest(`/categories/${categoryId}`, {
      method: 'DELETE'
    })
  }

  // Transaction tags
  async getTransactionTags() {
    return this.makeRequest('/tags')
  }

  async createTransactionTag(tagData) {
    return this.makeRequest('/tags', {
      method: 'POST',
      body: JSON.stringify(tagData)
    })
  }

  async updateTransactionTag(tagId, tagData) {
    return this.makeRequest(`/tags/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify(tagData)
    })
  }

  async deleteTransactionTag(tagId) {
    return this.makeRequest(`/tags/${tagId}`, {
      method: 'DELETE'
    })
  }

  // Transaction reconciliation
  async reconcileTransactions(reconciliationData) {
    return this.makeRequest('/reconcile', {
      method: 'POST',
      body: JSON.stringify(reconciliationData)
    })
  }

  async getReconciliationStatus() {
    return this.makeRequest('/reconcile/status')
  }

  // Transaction validation
  async validateTransaction(transactionData) {
    return this.makeRequest('/validate', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    })
  }

  // Transaction approval workflow
  async getPendingApprovals() {
    return this.makeRequest('/approvals/pending')
  }

  async approveTransaction(transactionId, approvalData) {
    return this.makeRequest(`/approvals/${transactionId}/approve`, {
      method: 'POST',
      body: JSON.stringify(approvalData)
    })
  }

  async rejectTransaction(transactionId, rejectionData) {
    return this.makeRequest(`/approvals/${transactionId}/reject`, {
      method: 'POST',
      body: JSON.stringify(rejectionData)
    })
  }

  // Transaction notifications
  async getTransactionNotifications() {
    return this.makeRequest('/notifications')
  }

  async markTransactionNotificationAsRead(notificationId) {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  }

  // Transaction analytics
  async getTransactionAnalytics(timeRange = '1m') {
    return this.makeRequest(`/analytics?timeRange=${timeRange}`)
  }

  async getTransactionTrends(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/analytics/trends?${queryParams}`)
  }

  async getTransactionSummary(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.makeRequest(`/analytics/summary?${queryParams}`)
  }

  // Bulk operations
  async bulkUpdateTransactions(transactionIds, updateData) {
    return this.makeRequest('/bulk/update', {
      method: 'POST',
      body: JSON.stringify({
        transactionIds,
        updateData
      })
    })
  }

  async bulkDeleteTransactions(transactionIds) {
    return this.makeRequest('/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({ transactionIds })
    })
  }

  async bulkCreateTransactions(transactionsData) {
    return this.makeRequest('/bulk/create', {
      method: 'POST',
      body: JSON.stringify({ transactions: transactionsData })
    })
  }
}

export default new TransactionsAPI()
