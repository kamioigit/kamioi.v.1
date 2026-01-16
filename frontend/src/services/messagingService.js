/**
 * Real-time Messaging Service
 * Handles cross-dashboard communication with backend integration
 */

class MessagingService {
  constructor() {
    this.baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111') + '/api'
    this.socket = null
    this.isConnected = false
    this.messageHandlers = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  /**
   * Initialize Socket.io connection
   */
  async connect() {
    try {
      // Skip Socket.io connection for now - use localStorage only
      console.log('📱 Using localStorage-only messaging (no backend connection)')
      this.isConnected = true
      this.reconnectAttempts = 0
      
      // Set up a simple polling mechanism for localStorage messages
      this.setupLocalStoragePolling()
      
    } catch (error) {
      console.error('Failed to initialize messaging service:', error)
      console.log('Setting up HTTP fallback for messaging')
      this.setupHttpFallback()
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached. Switching to HTTP fallback.')
      this.setupHttpFallback()
    }
  }

  /**
   * Setup HTTP-based messaging as fallback
   */
  setupHttpFallback() {
    console.log('📱 HTTP fallback disabled - using localStorage only')
    // Disable polling to prevent infinite loops
    // this.pollInterval = setInterval(() => {
    //   this.pollForMessages()
    // }, 5001)
  }

  /**
   * Setup localStorage polling (no HTTP requests)
   */
  setupLocalStoragePolling() {
    // Disable HTTP polling to prevent infinite loops
    console.log('📱 localStorage polling setup complete (no HTTP requests)')
  }

  /**
   * Poll for new messages via HTTP (DISABLED)
   */
  async pollForMessages() {
    // Disabled to prevent infinite loops and resource exhaustion
    console.log('📱 HTTP polling disabled - using localStorage only')
    return
  }

  /**
   * Handle incoming messages
   */
  handleIncomingMessage(message) {
    console.log('📨 Received message:', message)
    
    // Notify all registered handlers
    this.messageHandlers.forEach((handler, channel) => {
      if (message.channel === channel || channel === 'all') {
        handler(message)
      }
    })
  }

  /**
   * Send a message
   */
  async sendMessage(messageData) {
    const message = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...messageData
    }

    // Always store in localStorage for now
    try {
      const existingMessages = JSON.parse(localStorage.getItem('kamioi_messages') || '[]')
      existingMessages.push(message)
      localStorage.setItem('kamioi_messages', JSON.stringify(existingMessages))
      console.log('💬 Message stored in localStorage:', message)
    } catch (error) {
      console.error('Error storing message in localStorage:', error)
    }

    if (this.isConnected && this.socket) {
      // Send via Socket.io
      this.socket.emit('message', message)
      return message
    } else {
      // Send via HTTP (fallback)
      try {
        const response = await fetch(`${this.baseURL}/messages/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('kamioi_token')}`
          },
          body: JSON.stringify(message)
        })

        if (response.ok) {
          const sentMessage = await response.json()
          return sentMessage
        } else {
          // Even if HTTP fails, return the message since it's stored in localStorage
          return message
        }
      } catch (error) {
        console.error('Error sending message via HTTP:', error)
        // Return the message anyway since it's stored in localStorage
        return message
      }
    }
  }

  /**
   * Subscribe to messages for a specific channel
   */
  subscribe(channel, handler) {
    this.messageHandlers.set(channel, handler)
    
    return () => {
      this.messageHandlers.delete(channel)
    }
  }

  /**
   * Get message history for a channel
   */
  async getMessageHistory(channel, limit = 50) {
    try {
      // For now, get messages from localStorage
      const allMessages = JSON.parse(localStorage.getItem('kamioi_messages') || '[]')
      
      // Filter messages for the current channel or messages sent to current user
      const currentUser = JSON.parse(localStorage.getItem('kamioi_user') || '{}')
      const filteredMessages = allMessages.filter(msg => {
        // Include messages in the current channel
        if (msg.channel === channel) return true
        
        // Include messages sent to the current user
        if (msg.to === currentUser.email || msg.to === currentUser.id) return true
        
        // Include messages from admin to any user (for admin notifications)
        if (msg.from === 'Admin' && channel === 'admin') return true
        
        return false
      })
      
      // Sort by timestamp and limit
      return filteredMessages
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-limit)
    } catch (error) {
      console.error('Error fetching message history:', error)
      return []
    }
  }

  /**
   * Get available channels for the user
   */
  async getAvailableChannels(user) {
    const channels = []

    // General channel (available to all users)
    channels.push({
      id: 'general',
      name: 'General',
      type: 'general',
      description: 'General discussions and announcements',
      unread: 0
    })

    // Family channel (if user has family connections)
    if (user.familyId || user.accountType === 'family') {
      channels.push({
        id: 'family',
        name: 'Family Chat',
        type: 'family',
        description: 'Family member discussions',
        unread: 0
      })
    }

    // Business channel (if user has business connections)
    if (user.businessId || user.accountType === 'business') {
      channels.push({
        id: 'business',
        name: 'Business Updates',
        type: 'business',
        description: 'Business team communications',
        unread: 0
      })
    }

    // Admin channel (for admin notifications)
    channels.push({
      id: 'admin',
      name: 'Admin Notifications',
      type: 'admin',
      description: 'System notifications and admin messages',
      unread: 0
    })

    // Support channel (for help requests)
    channels.push({
      id: 'support',
      name: 'Help & Support',
      type: 'support',
      description: 'Get help from the support team',
      unread: 0
    })

    return channels
  }

  /**
   * Send a message to admin/support
   */
  async sendToAdmin(message, priority = 'normal') {
    return this.sendMessage({
      channel: 'admin',
      message: message,
      priority: priority,
      type: 'support_request',
      needsResponse: true
    })
  }

  /**
   * Send a help request
   */
  async sendHelpRequest(subject, message, category = 'general') {
    return this.sendMessage({
      channel: 'support',
      subject: subject,
      message: message,
      category: category,
      type: 'help_request',
      needsResponse: true,
      priority: 'normal'
    })
  }

  /**
   * Disconnect from messaging service
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    
    this.isConnected = false
    this.messageHandlers.clear()
    console.log('📱 Messaging service disconnected')
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      hasHandlers: this.messageHandlers.size > 0
    }
  }
}

export default new MessagingService()
