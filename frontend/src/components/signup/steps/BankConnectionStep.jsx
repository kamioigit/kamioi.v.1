/**
 * BankConnectionStep - Step 6: Bank Connection via MX Widget
 * Users can connect their bank or skip this step
 */

import React, { useState } from 'react'
import { useSignup } from '../SignupContext'
import MXConnectWidget from '../../common/MXConnectWidget'
import { Link2, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

const BankConnectionStep = () => {
  const { formData, updateField, nextStep, setLoading } = useSignup()
  const [showWidget, setShowWidget] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const handleMXSuccess = async (data) => {
    console.log('MX Connection successful:', data)
    setConnecting(true)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const token = formData.token || localStorage.getItem('kamioi_user_token')

      // Save bank connection to backend
      const response = await fetch(`${apiBaseUrl}/api/user/bank-connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          member_guid: data.member_guid || '',
          user_guid: data.user_guid || formData.userGuid || '',
          institution_name: data.institution_name || 'Connected Bank',
          accounts: data.accounts || []
        })
      })

      if (response.ok) {
        updateField('bankConnected', true)
        updateField('mxData', {
          member_guid: data.member_guid,
          user_guid: data.user_guid,
          institution_name: data.institution_name,
          accounts: data.accounts,
          connected_at: new Date().toISOString()
        })
        setShowWidget(false)
      } else {
        console.error('Failed to save bank connection')
      }
    } catch (error) {
      console.error('Error saving bank connection:', error)
    } finally {
      setConnecting(false)
    }
  }

  const handleMXError = (error) => {
    console.error('MX Connection error:', error)
    setShowWidget(false)
  }

  const handleMXClose = () => {
    setShowWidget(false)
  }

  const handleSkip = () => {
    nextStep()
  }

  const handleContinue = () => {
    nextStep()
  }

  // Show connected state
  if (formData.bankConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Bank Connected!</h2>
          <p className="text-white/70">Your bank account is now linked</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {formData.mxData?.institution_name || 'Bank Account'} Connected
          </h3>
          <p className="text-white/70 text-sm">
            Your transactions will automatically sync for round-up investing
          </p>
          {formData.mxData?.accounts && formData.mxData.accounts.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.mxData.accounts.map((account, index) => (
                <div key={index} className="bg-white/5 rounded-lg px-4 py-2 text-sm text-white/80">
                  {account.account_name || account.name || `Account ${index + 1}`}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-xl font-semibold text-lg bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center justify-center"
        >
          Continue to Review
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    )
  }

  // Show MX widget
  if (showWidget) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Bank</h2>
          <p className="text-white/70">Securely link your bank account</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 min-h-[500px]">
          <MXConnectWidget
            userGuid={formData.userGuid}
            onSuccess={handleMXSuccess}
            onError={handleMXError}
            onClose={handleMXClose}
            isVisible={true}
            inline={true}
          />
        </div>

        {connecting && (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-white/70">Saving connection...</p>
          </div>
        )}

        <button
          onClick={() => setShowWidget(false)}
          className="w-full py-3 text-white/70 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  // Show connect or skip options
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Bank</h2>
        <p className="text-white/70">Link your bank to enable automatic round-up investing</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Link2 className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">Why Connect Your Bank?</h3>
        <ul className="text-white/70 text-sm space-y-2 mb-6">
          <li>Automatic round-ups on every purchase</li>
          <li>Track your spending and investments in one place</li>
          <li>Secure, read-only connection - we can never move money</li>
          <li>256-bit encryption protects your data</li>
        </ul>

        <button
          onClick={() => setShowWidget(true)}
          className="w-full py-4 rounded-xl font-semibold text-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
        >
          Connect Bank Account
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={handleSkip}
          className="text-white/50 hover:text-white transition-colors text-sm"
        >
          Skip for now - I'll connect later
        </button>
        <p className="text-white/40 text-xs mt-2">
          You can always connect your bank from Settings
        </p>
      </div>
    </div>
  )
}

export default BankConnectionStep
