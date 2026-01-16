/**
 * Subscription Accounting Utility
 * Automatically creates journal entries for subscription events
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'

/**
 * Get authentication token
 */
const getAuthToken = () => {
  return localStorage.getItem('kamioi_admin_token') || 
         localStorage.getItem('authToken') || 
         'admin_token_3'
}

/**
 * Create journal entry for initial subscription payment
 * Called automatically when a subscription is created
 * Creates entry directly in journal_entries table
 */
export const createSubscriptionPaymentEntry = async (subscriptionData) => {
  try {
    const token = getAuthToken()
    
    const subscriptionId = subscriptionData.id || subscriptionData.subscription_id
    const accountType = (subscriptionData.account_type || 'individual').toLowerCase()
    const amount = parseFloat(subscriptionData.amount || 0)
    const paymentDate = subscriptionData.payment_date || new Date().toISOString()
    const planName = subscriptionData.plan_name || subscriptionData.plan?.name || 'Unknown Plan'
    
    // Account mappings
    const deferredRevenueAccounts = {
      'individual': '23010',
      'family': '23020',
      'business': '23030'
    }
    
    const cashAccount = '10100'
    const deferredAccount = deferredRevenueAccounts[accountType] || '23010'
    
    // Create reference
    const dateObj = new Date(paymentDate)
    const dateStr = dateObj.toISOString().split('T')[0]
    const reference = `SUB-INIT-${subscriptionId}-${dateStr.replace(/-/g, '')}`
    
    // Create description
    const description = `Subscription payment - ${planName} - ${accountType}`
    
    // Format date for backend (YYYY-MM-DD)
    const formattedDate = dateStr
    
    // Create journal entry using the format the backend expects
    // Backend requires: date, transactionType, amount, fromAccount, toAccount, entries[]
    const entryData = {
      date: formattedDate,
      reference: reference,
      description: description,
      transactionType: 'subscription_payment',
      amount: amount,
      fromAccount: cashAccount,
      toAccount: deferredAccount,
      entries: [
        {
          account: cashAccount,
          debit: amount,
          credit: 0,
          description: `Cash received for subscription payment`
        },
        {
          account: deferredAccount,
          debit: 0,
          credit: amount,
          description: `Deferred revenue for ${accountType} subscription`
        }
      ]
    }
    
    console.log('Creating subscription journal entry:', entryData)
    
    const response = await fetch(`${API_BASE_URL}/api/admin/journal-entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entryData)
    })
    
    const result = await response.json()
    console.log('Journal entry creation response:', result)
    
    if (result.success) {
      console.log('✓ Subscription payment entry created:', reference)
      return { success: true, data: { reference, amount, journal_entry_id: result.journal_entry_id } }
    } else {
      console.error('✗ Failed to create payment entry:', result.error)
      return { success: false, error: result.error || 'Failed to create journal entry' }
    }
  } catch (error) {
    console.error('✗ Error creating subscription payment entry:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create journal entry for subscription renewal
 * Called automatically when a subscription auto-renews
 */
export const createSubscriptionRenewalEntry = async (subscriptionData) => {
  try {
    const token = getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions/create-renewal-entry`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription_id: subscriptionData.id || subscriptionData.subscription_id,
        user_id: subscriptionData.user_id,
        user_name: subscriptionData.user_name || subscriptionData.user?.name,
        plan_name: subscriptionData.plan_name || subscriptionData.plan?.name,
        account_type: subscriptionData.account_type || 'individual',
        amount: subscriptionData.amount || 0,
        original_amount: subscriptionData.original_amount,
        discount_amount: subscriptionData.discount_amount,
        renewal_date: subscriptionData.renewal_date || new Date().toISOString()
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('Subscription renewal entry created:', result.data?.reference)
      return result
    } else {
      console.error('Failed to create renewal entry:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Error creating subscription renewal entry:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Handle failed payment
 * Moves deferred revenue to failed payments account
 */
export const handleFailedPayment = async (subscriptionData) => {
  try {
    const token = getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions/handle-failed-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription_id: subscriptionData.id || subscriptionData.subscription_id,
        account_type: subscriptionData.account_type || 'individual',
        amount: subscriptionData.amount || 0
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('Failed payment handled:', subscriptionData.id)
      return result
    } else {
      console.error('Failed to handle failed payment:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Error handling failed payment:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Process daily revenue recognition
 * Can be called manually or scheduled
 */
export const processDailyRevenueRecognition = async (recognitionDate = null) => {
  try {
    const token = getAuthToken()
    
    const body = {}
    if (recognitionDate) {
      body.recognition_date = recognitionDate.toISOString().split('T')[0]
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions/process-daily-recognition`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('Daily recognition processed:', result.data)
      return result
    } else {
      console.error('Failed to process daily recognition:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Error processing daily recognition:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Setup deferred revenue accounts
 * Should be called once during initial setup
 */
export const setupAccountingAccounts = async () => {
  try {
    const token = getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions/setup-accounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('Accounting accounts setup complete')
      return result
    } else {
      console.error('Failed to setup accounts:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Error setting up accounts:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Helper to calculate discount amount from original and net
 */
export const calculateDiscount = (originalAmount, netAmount) => {
  return Math.max(0, originalAmount - netAmount)
}

/**
 * Helper to apply discount to subscription amount
 */
export const applyDiscount = (originalAmount, discountPercent = 0, discountAmount = 0) => {
  if (discountPercent > 0) {
    return originalAmount * (1 - discountPercent / 100)
  } else if (discountAmount > 0) {
    return Math.max(0, originalAmount - discountAmount)
  }
  return originalAmount
}

