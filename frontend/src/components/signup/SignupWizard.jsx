/**
 * SignupWizard - Main orchestrator for the unified auth page
 * Includes tabs for Sign In, Sign Up (wizard), and Demo access
 */

import React, { useState } from 'react'
import { SignupProvider, useSignup } from './SignupContext'
import AccountTypeStep from './steps/AccountTypeStep'
import CredentialsStep from './steps/CredentialsStep'
import PersonalInfoStep from './steps/PersonalInfoStep'
import AddressStep from './steps/AddressStep'
import SubscriptionStep from './steps/SubscriptionStep'
import BankConnectionStep from './steps/BankConnectionStep'
import ReviewStep from './steps/ReviewStep'
import SignInForm from './SignInForm'
import DemoAccessForm from './DemoAccessForm'
import { ArrowLeft, Check, User, Users, Key } from 'lucide-react'

const StepProgress = () => {
  const { formData, goToStep, getTotalSteps } = useSignup()
  const { currentStep, completedSteps } = formData
  const totalSteps = getTotalSteps()

  const stepNames = [
    'Account Type',
    'Credentials',
    'Personal Info',
    'Address',
    'Subscription',
    'Bank Connection',
    'Review'
  ]

  return (
    <div className="mb-8">
      {/* Mobile: Simple progress bar */}
      <div className="md:hidden">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/70">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-white font-medium">{stepNames[currentStep - 1]}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Step indicators */}
      <div className="hidden md:flex justify-between items-center">
        {stepNames.map((name, index) => {
          const stepNumber = index + 1
          const isCompleted = completedSteps.includes(stepNumber)
          const isCurrent = currentStep === stepNumber
          const isClickable = stepNumber <= currentStep || isCompleted

          return (
            <div key={stepNumber} className="flex items-center">
              <button
                onClick={() => isClickable && goToStep(stepNumber)}
                disabled={!isClickable}
                className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-transparent border-white/30 text-white/50'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>
                <span className={`mt-2 text-xs ${isCurrent ? 'text-white' : 'text-white/50'}`}>
                  {name}
                </span>
              </button>
              {stepNumber < totalSteps && (
                <div className={`w-12 h-0.5 mx-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-white/20'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SignupWizardContent = ({ onSwitchToSignIn }) => {
  const { formData, prevStep } = useSignup()
  const { currentStep, accountType } = formData

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AccountTypeStep />
      case 2:
        return <CredentialsStep />
      case 3:
        return <PersonalInfoStep />
      case 4:
        return <AddressStep />
      case 5:
        return <SubscriptionStep />
      case 6:
        return <BankConnectionStep />
      case 7:
        return <ReviewStep />
      default:
        return <AccountTypeStep />
    }
  }

  const getAccountTypeLabel = () => {
    switch (accountType) {
      case 'individual': return 'Individual Account'
      case 'family': return 'Family Account'
      case 'business': return 'Business Account'
      default: return 'Create Account'
    }
  }

  return (
    <>
      {/* Back button and account type indicator */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => currentStep === 1 ? onSwitchToSignIn() : prevStep()}
          className="flex items-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? 'Back to Sign In' : 'Back'}
        </button>
        {accountType && (
          <span className="text-white/70 text-sm">{getAccountTypeLabel()}</span>
        )}
      </div>

      {/* Progress */}
      <StepProgress />

      {/* Step Content */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-white/50 text-sm">
          Already have an account?{' '}
          <button
            onClick={onSwitchToSignIn}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  )
}

// Tab Switcher Component
const TabSwitcher = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white/5 rounded-lg p-1 flex border border-white/10">
        <button
          onClick={() => setActiveTab('signin')}
          className={`px-6 py-2 rounded-md transition-all font-medium ${
            activeTab === 'signin'
              ? 'bg-purple-600 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab('signup')}
          className={`px-6 py-2 rounded-md transition-all font-medium ${
            activeTab === 'signup'
              ? 'bg-purple-600 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setActiveTab('demo')}
          className={`px-6 py-2 rounded-md transition-all flex items-center space-x-2 font-medium ${
            activeTab === 'demo'
              ? 'bg-purple-600 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Demo</span>
        </button>
      </div>
    </div>
  )
}

// Header Component
const AuthHeader = ({ activeTab }) => {
  const getIcon = () => {
    if (activeTab === 'demo') return <Key className="w-8 h-8 text-purple-400" />
    if (activeTab === 'signin') return <User className="w-8 h-8 text-purple-400" />
    return <Users className="w-8 h-8 text-purple-400" />
  }

  const getTitle = () => {
    if (activeTab === 'demo') return 'Demo Access'
    if (activeTab === 'signin') return 'Welcome Back'
    return 'Join Kamioi'
  }

  const getSubtitle = () => {
    if (activeTab === 'demo') return 'Enter your email and demo code to access the dashboard'
    if (activeTab === 'signin') return 'Sign in to your account to continue investing'
    return 'Start your investment journey with round-up investing'
  }

  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{getTitle()}</h1>
      <p className="text-white/70">{getSubtitle()}</p>
    </div>
  )
}

const SignupWizard = () => {
  const [activeTab, setActiveTab] = useState('signup') // 'signin' | 'signup' | 'demo'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <AuthHeader activeTab={activeTab} />

        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content based on active tab */}
        {activeTab === 'signin' && (
          <SignInForm onSwitchToSignUp={() => setActiveTab('signup')} />
        )}

        {activeTab === 'demo' && (
          <DemoAccessForm onSwitchToSignUp={() => setActiveTab('signup')} />
        )}

        {activeTab === 'signup' && (
          <SignupProvider>
            <SignupWizardContent onSwitchToSignIn={() => setActiveTab('signin')} />
          </SignupProvider>
        )}
      </div>
    </div>
  )
}

export default SignupWizard
