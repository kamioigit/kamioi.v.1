import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ message = 'Loading...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className={`${sizeClasses[size]} text-blue-400 animate-spin`} />
        </div>
        <p className="text-white text-lg font-medium">{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner


