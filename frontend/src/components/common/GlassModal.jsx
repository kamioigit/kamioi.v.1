import React from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

const GlassModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  confirmText = 'OK',
  onConfirm,
  cancelText,
  onCancel,
  showCloseButton = true
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-400" />
      default:
        return <Info className="w-6 h-6 text-blue-400" />
    }
  }

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="glass-card rounded-2xl shadow-2xl border border-white/20 p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className={`text-xl font-bold ${getTitleColor()}`}>
              {title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Information')}
            </h3>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-white text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          {onCancel && cancelText && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 hover:border-white/30 transition-all duration-200"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              type === 'success'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : type === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : type === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GlassModal
