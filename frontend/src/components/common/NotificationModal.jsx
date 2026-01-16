import React from 'react'
import { CheckCircle, X, Info, AlertTriangle } from 'lucide-react'

const NotificationModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-400" />
      default:
        return <Info className="w-6 h-6 text-blue-400" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/30'
      case 'warning':
        return 'border-yellow-500/30'
      case 'error':
        return 'border-red-500/30'
      default:
        return 'border-blue-500/30'
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl border ${getBorderColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-gray-300 whitespace-pre-line">
          {message}
        </div>
        
        <div className="flex justify-end mt-6">
          <button 
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationModal
