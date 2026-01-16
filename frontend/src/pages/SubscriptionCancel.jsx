import React from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle, ArrowLeft } from 'lucide-react'

const SubscriptionCancel = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
        <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Subscription Cancelled</h1>
        <p className="text-gray-400 mb-6">
          No charges were made. You can subscribe anytime when you&apos;re ready.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Login</span>
          </button>
          <button
            onClick={() => navigate('/business-registration')}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-semibold transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionCancel


