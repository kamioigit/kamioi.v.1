/**
 * Status Synchronization Service
 * 
 * This service handles real-time status updates across all dashboards.
 * When a transaction status changes in one dashboard, it automatically
 * updates in all other dashboards (User, Family, Business, Admin).
 */

class StatusSyncService {
  constructor() {
    this.listeners = new Map()
    this.statusUpdateQueue = []
    this.isProcessing = false
  }

  /**
   * Subscribe to status updates for a specific dashboard type
   * @param {string} dashboardType - 'user', 'family', 'business', 'admin'
   * @param {Function} callback - Function to call when status updates
   */
  subscribe(dashboardType, callback) {
    if (!this.listeners.has(dashboardType)) {
      this.listeners.set(dashboardType, new Set())
    }
    this.listeners.get(dashboardType).add(callback)
    
    console.log(`📡 StatusSyncService - ${dashboardType} dashboard subscribed to status updates`)
  }

  /**
   * Unsubscribe from status updates
   * @param {string} dashboardType - Dashboard type
   * @param {Function} callback - Callback to remove
   */
  unsubscribe(dashboardType, callback) {
    if (this.listeners.has(dashboardType)) {
      this.listeners.get(dashboardType).delete(callback)
    }
  }

  /**
   * Update transaction status and notify all dashboards
   * @param {string} transactionId - ID of the transaction
   * @param {string} newStatus - New status value
   * @param {string} sourceDashboard - Dashboard that initiated the change
   */
  updateStatus(transactionId, newStatus, sourceDashboard = 'unknown') {
    console.log(`🔄 StatusSyncService - Updating transaction ${transactionId} to status: ${newStatus} (from ${sourceDashboard})`)
    
    // Add to update queue
    this.statusUpdateQueue.push({
      transactionId,
      newStatus,
      sourceDashboard,
      timestamp: Date.now()
    })

    // Process updates
    this.processUpdates()
  }

  /**
   * Process pending status updates
   */
  async processUpdates() {
    if (this.isProcessing || this.statusUpdateQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.statusUpdateQueue.length > 0) {
        const update = this.statusUpdateQueue.shift()
        await this.broadcastUpdate(update)
      }
    } catch (error) {
      console.error('❌ StatusSyncService - Error processing updates:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Broadcast status update to all subscribed dashboards
   * @param {Object} update - Update object with transactionId, newStatus, sourceDashboard
   */
  async broadcastUpdate(update) {
    const { transactionId, newStatus, sourceDashboard } = update

    // Notify all dashboard types
    for (const [dashboardType, callbacks] of this.listeners) {
      // Skip the dashboard that initiated the change to avoid loops
      if (dashboardType === sourceDashboard) {
        continue
      }

      console.log(`📢 StatusSyncService - Broadcasting to ${dashboardType} dashboard: ${transactionId} -> ${newStatus}`)

      // Call all callbacks for this dashboard type
      for (const callback of callbacks) {
        try {
          await callback({
            transactionId,
            newStatus,
            sourceDashboard,
            timestamp: update.timestamp
          })
        } catch (error) {
          console.error(`❌ StatusSyncService - Error notifying ${dashboardType}:`, error)
        }
      }
    }
  }

  /**
   * Get current status of a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {string|null} Current status or null if not found
   */
  getTransactionStatus() {
    // This would typically query the backend/database
    // For now, we'll return null as this is handled by the backend
    return null
  }

  /**
   * Batch update multiple transactions
   * @param {Array} updates - Array of {transactionId, newStatus} objects
   * @param {string} sourceDashboard - Dashboard initiating the changes
   */
  batchUpdate(updates, sourceDashboard = 'unknown') {
    console.log(`🔄 StatusSyncService - Batch updating ${updates.length} transactions from ${sourceDashboard}`)
    
    updates.forEach(update => {
      this.statusUpdateQueue.push({
        ...update,
        sourceDashboard,
        timestamp: Date.now()
      })
    })

    this.processUpdates()
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStats() {
    return {
      totalListeners: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
      pendingUpdates: this.statusUpdateQueue.length,
      isProcessing: this.isProcessing,
      subscribedDashboards: Array.from(this.listeners.keys())
    }
  }
}

// Create singleton instance
const statusSyncService = new StatusSyncService()

export default statusSyncService


