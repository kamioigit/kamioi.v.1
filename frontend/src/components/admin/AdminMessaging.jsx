import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Send, 
  Users, 
  Bell, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Filter,
  Search,
  Reply,
  Trash2,
  Star,
  Archive
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import messagingService from '../../services/messagingService'

const AdminMessaging = () => {
  const [messages, setMessages] = useState([])
   const { isLightMode } = useTheme()
  const [filteredMessages, setFilteredMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalMessages: 0,
    supportRequests: 0,
    unreadSupport: 0,
    channels: []
  })
  const [isLoading, setIsLoading] = useState(true)

  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border border-gray-200' : 'bg-white/10 backdrop-blur-lg border border-white/20'

  useEffect(() => {
    loadAdminMessages()
    
    // Set up real-time updates
    const unsubscribe = messagingService.subscribe('all', (message) => {
      if (message.channel === 'support' || message.channel === 'admin') {
        loadAdminMessages()
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    filterMessages()
  }, [messages, filter, searchTerm])

  const loadAdminMessages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${messagingService.baseURL}/messages/admin/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load admin messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterMessages = () => {
    let filtered = messages

    // Apply channel filter
    if (filter !== 'all') {
      filtered = filtered.filter(msg => msg && msg.channel === filter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg && msg.message && msg.sender &&
        (msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredMessages(filtered)
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    try {
      const response = await fetch(`${messagingService.baseURL}/messages/admin/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_admin_token') || localStorage.getItem('authToken') || 'admin_token_3' || 'admin_token_3'}`
        },
        body: JSON.stringify({
          originalMessageId: selectedMessage.id,
          reply: replyText,
          adminName: 'Admin Support'
        })
      })

      if (response.ok) {
        setReplyText('')
        setSelectedMessage(null)
        loadAdminMessages()
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return getSubtextClass()
    }
  }

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'support':
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      case 'admin':
        return <Bell className="w-4 h-4 text-red-500" />
      case 'general':
        return <Users className="w-4 h-4 text-blue-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className={`ml-3 ${getTextClass()}`}>Loading messages...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${getTextClass()} mb-2`}>Admin Messaging Center</h1>
        <p className={getSubtextClass()}>Manage user communications and support requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${getCardClass()} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Total Messages</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{stats.totalMessages}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className={`${getCardClass()} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Support Requests</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{stats.supportRequests}</p>
            </div>
            <Bell className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className={`${getCardClass()} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Unread Support</p>
              <p className={`text-2xl font-bold text-red-500`}>{stats.unreadSupport}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className={`${getCardClass()} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getSubtextClass()}`}>Active Channels</p>
              <p className={`text-2xl font-bold ${getTextClass()}`}>{stats.channels.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`${getCardClass()} rounded-lg p-6`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isLightMode 
                  ? 'bg-white border-gray-300 text-gray-800' 
                  : 'bg-gray-800 border-gray-600 text-white'
              }`}
            >
              <option value="all">All Channels</option>
              <option value="support">Support</option>
              <option value="admin">Admin</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isLightMode 
                  ? 'bg-white border-gray-300 text-gray-800' 
                  : 'bg-gray-800 border-gray-600 text-white'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className={`${getCardClass()} rounded-lg`}>
        <div className="p-6 border-b border-white/10">
          <h2 className={`text-xl font-semibold ${getTextClass()}`}>Messages</h2>
        </div>

        <div className="divide-y divide-white/10">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className={`w-16 h-16 ${getSubtextClass()} mx-auto mb-4`} />
              <h3 className={`text-lg font-medium ${getTextClass()} mb-2`}>No messages found</h3>
              <p className={getSubtextClass()}>No messages match your current filters</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-6 hover:bg-white/5 cursor-pointer transition-colors ${
                  !message.read ? 'bg-blue-500/5 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {message.sender.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`font-medium ${getTextClass()}`}>{message.sender}</span>
                        {getChannelIcon(message.channel)}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          message.channel === 'support' ? 'bg-purple-500/20 text-purple-400' :
                          message.channel === 'admin' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {message.channel}
                        </span>
                        {message.priority && (
                          <span className={`text-xs ${getPriorityColor(message.priority)}`}>
                            {message.priority} priority
                          </span>
                        )}
                      </div>
                      
                      <p className={`${getTextClass()} mb-2`}>{message.message}</p>
                      
                      <div className="flex items-center space-x-4 text-xs">
                        <span className={getSubtextClass()}>
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                        {!message.read && (
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-full">
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMessage(message)
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Reply className="w-4 h-4 text-blue-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${getCardClass()} rounded-xl w-full max-w-2xl`}>
            <div className="p-6 border-b border-white/10">
              <h3 className={`text-xl font-semibold ${getTextClass()}`}>Reply to Message</h3>
              <div className="mt-2">
                <p className={`text-sm ${getSubtextClass()}`}>From: {selectedMessage.sender}</p>
                <p className={`text-sm ${getSubtextClass()}`}>Channel: {selectedMessage.channel}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h4 className={`font-medium ${getTextClass()} mb-2`}>Original Message:</h4>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className={getTextClass()}>{selectedMessage.message}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${getTextClass()} mb-2`}>
                  Your Reply:
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isLightMode 
                      ? 'bg-white border-gray-300 text-gray-800' 
                      : 'bg-gray-800 border-gray-600 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isLightMode 
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMessaging

