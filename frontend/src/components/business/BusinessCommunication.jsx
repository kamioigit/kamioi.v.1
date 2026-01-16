import React from 'react'
import { Users, Bell, MessageSquare } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const BusinessCommunication = ({ user, onOpenCommunication }) => {
  const { isLightMode } = useTheme()
  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  return (
    <div className="space-y-6">
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h1 className={`text-2xl font-bold ${getTextClass()} mb-4`}>
          Business Communication
        </h1>
        <p className={`${getSubtextClass()} mb-6`}>
          Stay connected with your business team
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={onOpenCommunication}
            className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-left"
          >
            <MessageSquare className="w-6 h-6 text-blue-400 mb-2" />
            <p className={`font-medium ${getTextClass()}`}>Open Chat</p>
            <p className={`text-sm ${getSubtextClass()}`}>Start a conversation</p>
          </button>
          
          <button className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-left">
            <Users className="w-6 h-6 text-green-400 mb-2" />
            <p className={`font-medium ${getTextClass()}`}>Team Members</p>
            <p className={`text-sm ${getSubtextClass()}`}>View all team members</p>
          </button>
          
          <button className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-left">
            <Bell className="w-6 h-6 text-orange-400 mb-2" />
            <p className={`font-medium ${getTextClass()}`}>Notifications</p>
            <p className={`text-sm ${getSubtextClass()}`}>Manage notifications</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BusinessCommunication


