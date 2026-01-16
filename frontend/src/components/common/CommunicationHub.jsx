import React, { useState, useEffect } from 'react'
import { AlertCircle, Users, MessageSquare, Bell, HelpCircle, X, Send, UserPlus, CheckCircle, AlertTriangle, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import messagingService from '../../services/messagingService'

const CommunicationHub = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { isLightMode } = useTheme()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [activeChannel, setActiveChannel] = useState('general')
  const [channels, setChannels] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardType, setDashboardType] = useState('v1')
  
  // User connection form state
  const [showConnectionForm, setShowConnectionForm] = useState(false)
  const [connectionData, setConnectionData] = useState({
    userId: '',
    email: '',
    inviteCode: ''
  })
  const [connectedUser, setConnectedUser] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [connectionSuccess, setConnectionSuccess] = useState(false)

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'
  
  // Validate user connection
  const validateUserConnection = async () => {
    if (!connectionData.userId || !connectionData.email || !connectionData.inviteCode) {
      setValidationError('All fields are required')
      return false
    }
    
    setIsValidating(true)
    setValidationError('')
    
    try {
      const token = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/messaging/validate-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target_user_id: connectionData.userId,
          target_email: connectionData.email,
          invite_code: connectionData.inviteCode
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setConnectedUser(result.user)
        setConnectionSuccess(true)
        setShowConnectionForm(false)
        setValidationError('')
        
        // Add connected user as a channel
        const userChannel = {
          id: `user-${connectionData.userId}`,
          name: result.user.name || result.user.email || `User ${connectionData.userId}`,
          type: 'user',
          unread: 0,
          userId: connectionData.userId,
          email: connectionData.email
        }
        setChannels(prev => [...prev, userChannel])
        setActiveChannel(userChannel.id)
        
        return true
      } else {
        setValidationError(result.error || 'Invalid connection details. Please verify User ID, Email, and Invite Code.')
        return false
      }
    } catch (error) {
      console.error('Validation error:', error)
      setValidationError('Failed to validate connection. Please try again.')
      return false
    } finally {
      setIsValidating(false)
    }
  }
  
  // Handle connection form input changes
  const handleConnectionInputChange = (field, value) => {
    setConnectionData(prev => ({
      ...prev,
      [field]: value
    }))
    setValidationError('')
  }

  // Initialize messaging service and load channels
  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        setIsLoading(true)
        
        // Connect to messaging service
        await messagingService.connect(user)
        setIsConnected(true)
        
        // Load available channels with cross-dashboard support
        const availableChannels = await messagingService.getAvailableChannels(user)
        setChannels(availableChannels)
        
        // Subscribe to messages for all channels
        const unsubscribe = messagingService.subscribe('all', (message) => {
          if (message.channel === activeChannel) {
            setMessages(prev => [...prev, message])
          }
          
          // Update unread count for other channels
          setChannels(prev => prev.map(channel => 
            channel.id === message.channel && message.channel !== activeChannel
              ? { ...channel, unread: channel.unread + 1 }
              : channel
          ))
        })
        
        setIsLoading(false)
        
        return unsubscribe
      } catch (error) {
        console.error('Failed to initialize messaging:', error)
        setIsLoading(false)
        // Fallback to offline mode
        setChannels([
          { id: 'general', name: 'General', type: 'general', unread: 0 },
          { id: 'support', name: 'Help & Support', type: 'support', unread: 0 }
        ])
      }
    }

    if (isOpen && user) {
      initializeMessaging()
    }
    
    return () => {
      if (!isOpen) {
        messagingService.disconnect()
      }
    }
  }, [isOpen, user, activeChannel])

  // Load messages when channel changes
  useEffect(() => {
    if (activeChannel && isConnected) {
      loadChannelMessages(activeChannel)
    }
  }, [activeChannel, isConnected])


  const loadChannelMessages = async (channel) => {
    try {
      const history = await messagingService.getMessageHistory(channel)
      setMessages(history)
      
      // Mark channel as read
      setChannels(prev => prev.map(ch => 
        ch.id === channel ? { ...ch, unread: 0 } : ch
      ))
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    }
  }

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const messageData = {
          sender: user?.name || 'You',
          senderId: user?.id,
          message: newMessage,
          channel: activeChannel,
          type: 'user'
        }
        
        // Send message through messaging service
        const sentMessage = await messagingService.sendMessage(messageData)
        
        // Add to local messages immediately for better UX
        setMessages(prev => [...prev, sentMessage])
        setNewMessage('')
        
        // If this is a support/admin channel, show confirmation
        if (activeChannel === 'support' || activeChannel === 'admin') {
          const confirmationMessage = {
            id: Date.now() + 1,
            sender: 'System',
            message: 'Your message has been sent to the support team. We\'ll respond as soon as possible.',
            timestamp: new Date().toISOString(),
            channel: activeChannel,
            type: 'system'
          }
          setTimeout(() => {
            setMessages(prev => [...prev, confirmationMessage])
          }, 1000)
        }
        
      } catch (error) {
        console.error('Failed to send message:', error)
        // Show error message
        const errorMessage = {
          id: Date.now(),
          sender: 'System',
          message: 'Failed to send message. Please try again.',
          timestamp: new Date().toISOString(),
          channel: activeChannel,
          type: 'error'
        }
        setMessages(prev => [...prev, errorMessage])
      }
    }
  }

  const getChannelIcon = (type) => {
    switch (type) {
      case 'family':
        return <Users className="w-4 h-4 text-green-500" />
      case 'business':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'admin':
        return <Bell className="w-4 h-4 text-red-500" />
      case 'support':
        return <HelpCircle className="w-4 h-4 text-purple-500" />
      case 'user':
        return <UserPlus className="w-4 h-4 text-yellow-500" />
      case 'general':
        return <MessageSquare className="w-4 h-4 text-gray-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  const getMessageStyle = (messageType) => {
    switch (messageType) {
      case 'system':
        return 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
      case 'error':
        return 'bg-red-500/10 border border-red-500/20 text-red-400'
      case 'admin':
        return 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
      default:
        return ''
    }
  }

  const navigateToDashboard = (channelId) => {
    const [type, version] = channelId.split('-')
    
    let dashboardPath = ''
    switch (type) {
      case 'user':
        dashboardPath = version === 'v2' ? '/v2/user' : '/dashboard'
        break
      case 'family':
        dashboardPath = version === 'v2' ? '/v2/family' : '/family'
        break
      case 'business':
        dashboardPath = version === 'v2' ? '/v2/business' : '/business'
        break
      case 'admin':
        dashboardPath = version === 'v2' ? '/v2/admin' : '/admin'
        break
      default:
        dashboardPath = '/dashboard'
    }
    
    // Navigate to the dashboard
    window.location.href = dashboardPath
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`${getCardClass()} rounded-xl w-full max-w-4xl h-[600px] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className={`text-xl font-bold ${getTextClass()}`}>
                Cross-Dashboard Communication
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs ${getSubtextClass()}`}>
                  {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isLightMode 
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1">
          {/* Channels Sidebar */}
          <div className="w-64 border-r border-white/10 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${getTextClass()}`}>Channels</h3>
              <button
                onClick={() => setShowConnectionForm(true)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                title="Connect to User"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Connection Success Message */}
            {connectionSuccess && (
              <div className="mb-4 p-2 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Connected to {connectedUser?.name || connectedUser?.email}</span>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeChannel === channel.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getChannelIcon(channel.type)}
                    <span className={`font-medium ${getTextClass()}`}>{channel.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {channel.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {channel.unread}
                      </span>
                    )}
                    {channel.id.includes('-v1') || channel.id.includes('-v2') ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigateToDashboard(channel.id)
                        }}
                        className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
                        title="Navigate to Dashboard"
                      >
                        Go
                      </button>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* User Connection Form Modal */}
          {showConnectionForm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
              <div className={`${getCardClass()} rounded-xl w-full max-w-md p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${getTextClass()}`}>Connect to User</h3>
                  <button
                    onClick={() => {
                      setShowConnectionForm(false)
                      setValidationError('')
                      setConnectionData({ userId: '', email: '', inviteCode: '' })
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className={`text-sm ${getSubtextClass()} mb-4`}>
                  Enter the User ID, Email, and Invite Code of the user you want to communicate with.
                </p>
                
                {validationError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">{validationError}</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                      User ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={connectionData.userId}
                      onChange={(e) => handleConnectionInputChange('userId', e.target.value)}
                      placeholder="Enter User ID"
                      className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={connectionData.email}
                      onChange={(e) => handleConnectionInputChange('email', e.target.value)}
                      placeholder="Enter Email"
                      className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                      Invite Code <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={connectionData.inviteCode}
                      onChange={(e) => handleConnectionInputChange('inviteCode', e.target.value)}
                      placeholder="Enter Invite Code"
                      className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => {
                        setShowConnectionForm(false)
                        setValidationError('')
                        setConnectionData({ userId: '', email: '', inviteCode: '' })
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={validateUserConnection}
                      disabled={isValidating || !connectionData.userId || !connectionData.email || !connectionData.inviteCode}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isValidating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Validating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className={`w-16 h-16 ${getSubtextClass()} mb-4`} />
                  <h3 className={`text-lg font-medium ${getTextClass()} mb-2`}>
                    {activeChannel === 'support' ? 'Start a conversation with support' :
                     activeChannel === 'admin' ? 'Admin notifications will appear here' :
                     'No messages yet'}
                  </h3>
                  <p className={`${getSubtextClass()}`}>
                    {activeChannel === 'support' ? 'Ask questions, report issues, or get help' :
                     activeChannel === 'admin' ? 'System notifications and admin messages' :
                     'Send a message to start the conversation'}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex space-x-3 ${message.type === 'system' || message.type === 'error' ? 'justify-center' : ''}`}>
                    {message.type !== 'system' && message.type !== 'error' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        (message.sender || message.from) === 'Admin' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                        (message.sender || message.from) === 'Support' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}>
                        <span className="text-white text-sm font-medium">
                          {(message.sender || message.from)?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div className={`flex-1 ${message.type === 'system' || message.type === 'error' ? 'max-w-md' : ''}`}>
                      {message.type === 'system' || message.type === 'error' ? (
                        <div className={`p-3 rounded-lg text-center ${getMessageStyle(message.type)}`}>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getTextClass()}`}>{message.sender || message.from}</span>
                            <span className={`text-xs ${getSubtextClass()}`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            {(message.sender || message.from) === 'Admin' && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Admin</span>
                            )}
                            {(message.sender || message.from) === 'Support' && (
                              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Support</span>
                            )}
                          </div>
                          <p className={`${getTextClass()} mt-1`}>{message.message}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunicationHub
