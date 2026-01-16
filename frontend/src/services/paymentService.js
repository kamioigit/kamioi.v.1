/**
 * Payment Service for Kamioi Platform
 * Handles payment processing and financial transactions
 */

class PaymentService {
  constructor() {
    this.baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111') + '/api'
    this.stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    this.plaidClientId = import.meta.env.VITE_PLAID_CLIENT_ID
  }

  /**
   * Get payment service status
   */
  async getPaymentStatus() {
    try {
      const response = await fetch(`${this.baseURL}/payments/status`)
      return await response.json()
    } catch (error) {
      console.error('Payment status error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Process round-up payment
   */
  async processRoundUpPayment(amount, merchant, ticker, userId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/roundup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, merchant, ticker, userId })
      })
      return await response.json()
    } catch (error) {
      console.error('Round-up payment error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Process investment payment
   */
  async processInvestmentPayment(amount, ticker, userId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/investment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, ticker, userId })
      })
      return await response.json()
    } catch (error) {
      console.error('Investment payment error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Process withdrawal
   */
  async processWithdrawal(amount, accountId, userId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, accountId, userId })
      })
      return await response.json()
    } catch (error) {
      console.error('Withdrawal error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(userId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/methods/${userId}`)
      return await response.json()
    } catch (error) {
      console.error('Payment methods error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(paymentMethodData, userId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...paymentMethodData, userId })
      })
      return await response.json()
    } catch (error) {
      console.error('Add payment method error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(methodId, paymentMethodData) {
    try {
      const response = await fetch(`${this.baseURL}/payments/methods/${methodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentMethodData)
      })
      return await response.json()
    } catch (error) {
      console.error('Update payment method error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(methodId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/methods/${methodId}`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error('Remove payment method error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId, limit = 50, offset = 0) {
    try {
      const response = await fetch(`${this.baseURL}/payments/transactions/${userId}?limit=${limit}&offset=${offset}`)
      return await response.json()
    } catch (error) {
      console.error('Transaction history error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(userId, period = 'month') {
    try {
      const response = await fetch(`${this.baseURL}/payments/analytics/${userId}?period=${period}`)
      return await response.json()
    } catch (error) {
      console.error('Payment analytics error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Process fee payment
   */
  async processFeePayment(amount, feeType, userId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, feeType, userId })
      })
      return await response.json()
    } catch (error) {
      console.error('Fee payment error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get fee structure
   */
  async getFeeStructure() {
    try {
      const response = await fetch(`${this.baseURL}/payments/fees`)
      return await response.json()
    } catch (error) {
      console.error('Fee structure error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Calculate fees
   */
  async calculateFees(amount, transactionType) {
    try {
      const response = await fetch(`${this.baseURL}/payments/calculate-fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, transactionType })
      })
      return await response.json()
    } catch (error) {
      console.error('Fee calculation error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Process refund
   */
  async processRefund(transactionId, amount, reason) {
    try {
      const response = await fetch(`${this.baseURL}/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionId, amount, reason })
      })
      return await response.json()
    } catch (error) {
      console.error('Refund error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get payment status for a specific transaction
   */
  async getTransactionStatus(transactionId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/status/${transactionId}`)
      return await response.json()
    } catch (error) {
      console.error('Transaction status error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(subscriptionId, userId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscriptionId, userId })
      })
      return await response.json()
    } catch (error) {
      console.error('Subscription payment error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get subscription details
   */
  async getSubscriptionDetails(userId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/subscription/${userId}`)
      return await response.json()
    } catch (error) {
      console.error('Subscription details error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, subscriptionData) {
    try {
      const response = await fetch(`${this.baseURL}/payments/subscription/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      })
      return await response.json()
    } catch (error) {
      console.error('Subscription update error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/subscription/${subscriptionId}`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error('Subscription cancellation error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get payment reports
   */
  async getPaymentReports(userId, startDate, endDate) {
    try {
      const response = await fetch(`${this.baseURL}/payments/reports/${userId}?startDate=${startDate}&endDate=${endDate}`)
      return await response.json()
    } catch (error) {
      console.error('Payment reports error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Export payment data
   */
  async exportPaymentData(userId, format = 'csv', startDate, endDate) {
    try {
      const response = await fetch(`${this.baseURL}/payments/export/${userId}?format=${format}&startDate=${startDate}&endDate=${endDate}`)
      return await response.json()
    } catch (error) {
      console.error('Payment export error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Validate payment method
   */
  async validatePaymentMethod(paymentMethodData) {
    try {
      const response = await fetch(`${this.baseURL}/payments/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentMethodData)
      })
      return await response.json()
    } catch (error) {
      console.error('Payment method validation error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get payment limits
   */
  async getPaymentLimits(userId) {
    try {
      const response = await fetch(`${this.baseURL}/payments/limits/${userId}`)
      return await response.json()
    } catch (error) {
      console.error('Payment limits error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Update payment limits
   */
  async updatePaymentLimits(userId, limits) {
    try {
      const response = await fetch(`${this.baseURL}/payments/limits/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(limits)
      })
      return await response.json()
    } catch (error) {
      console.error('Payment limits update error:', error)
      return { status: 'error', message: error.message }
    }
  }
}

// Create singleton instance
const paymentService = new PaymentService()

export default paymentService
