import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const sessionId = searchParams.get('session_id')
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    // Optionally verify the session with backend
    const verifySession = async () => {
      if (sessionId) {
        try {
          // You can add a backend endpoint to verify the session if needed
          // For now, we'll just wait a moment and redirect
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (error) {
          console.error('Error verifying session:', error)
        }
      }
      setVerifying(false)
      
      // Redirect to dashboard after a few seconds
      const timer = setTimeout(() => {
        if (user?.id) {
          navigate(`/dashboard/${user.id}`)
        } else {
          navigate('/login')
        }
      }, 3000)

      return () => clearTimeout(timer)
    }

    verifySession()
  }, [sessionId, navigate, user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
        {verifying ? (
          <>
            <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">Verifying Subscription...</h1>
            <p className="text-gray-400">Please wait while we confirm your payment</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Subscription Successful!</h1>
            <p className="text-gray-400 mb-6">
              Your subscription has been activated. You now have access to all premium features.
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-green-400 text-sm">
                Redirecting to your dashboard in a few seconds...
              </p>
            </div>
            <button
              onClick={() => {
                if (user?.id) {
                  navigate(`/dashboard/${user.id}`)
                } else {
                  navigate('/login')
                }
              }}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default SubscriptionSuccess


