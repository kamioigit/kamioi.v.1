import React, { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Target, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  Users, 
  DollarSign,
  Brain,
  BarChart3,
  X
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const OnboardingFlow = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0)
   const { isLightMode } = useTheme()
  const [userPreferences, setUserPreferences] = useState({
    investmentGoals: [],
    riskTolerance: '',
    roundUpAmount: 1,
    notifications: true,
    familyAccount: false
  })

  const getTextColor = () => isLightMode ? 'text-gray-800' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200' : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'

  const steps = [
    {
      title: "Welcome to Kamioi!",
      subtitle: "Let's set up your investment journey",
      icon: <Target className="w-16 h-16 text-blue-400" />,
      content: (
        <div className="text-center space-y-4">
          <p className={`${getSubtextClass()} text-lg`}>
            We'll help you turn everyday purchases into smart investments using AI.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className={`${getTextColor()} font-medium text-sm`}>AI-Powered</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className={`${getTextColor()} font-medium text-sm`}>Smart Investing</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What are your investment goals?",
      subtitle: "Select all that apply",
      icon: <Target className="w-16 h-16 text-green-400" />,
      content: (
        <div className="space-y-3">
          {[
            { id: 'emergency', label: 'Emergency Fund', description: 'Build a safety net for unexpected expenses' },
            { id: 'retirement', label: 'Retirement', description: 'Long-term wealth building for retirement' },
            { id: 'house', label: 'Buy a House', description: 'Save for a down payment on a home' },
            { id: 'education', label: 'Education', description: 'Save for college or skill development' },
            { id: 'travel', label: 'Travel', description: 'Fund your dream vacations' },
            { id: 'business', label: 'Start a Business', description: 'Capital for entrepreneurial ventures' }
          ].map(goal => (
            <button
              key={goal.id}
              onClick={() => {
                const updated = userPreferences.investmentGoals.includes(goal.id)
                  ? userPreferences.investmentGoals.filter(g => g !== goal.id)
                  : [...userPreferences.investmentGoals, goal.id]
                setUserPreferences({ ...userPreferences, investmentGoals: updated })
              }}
              className={`w-full p-4 rounded-lg border transition-all text-left ${
                userPreferences.investmentGoals.includes(goal.id)
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  userPreferences.investmentGoals.includes(goal.id)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-400'
                }`}>
                  {userPreferences.investmentGoals.includes(goal.id) && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <p className={`${getTextColor()} font-medium`}>{goal.label}</p>
                  <p className={`${getSubtextClass()} text-sm`}>{goal.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What's your risk tolerance?",
      subtitle: "This helps us recommend suitable investments",
      icon: <BarChart3 className="w-16 h-16 text-purple-400" />,
      content: (
        <div className="space-y-4">
          {[
            { 
              id: 'conservative', 
              label: 'Conservative', 
              description: 'Low risk, steady growth',
              color: 'green',
              example: 'Bonds, CDs, stable stocks'
            },
            { 
              id: 'moderate', 
              label: 'Moderate', 
              description: 'Balanced risk and growth',
              color: 'blue',
              example: 'Mix of stocks and bonds'
            },
            { 
              id: 'aggressive', 
              label: 'Aggressive', 
              description: 'Higher risk, higher potential returns',
              color: 'red',
              example: 'Growth stocks, emerging markets'
            }
          ].map(risk => (
            <button
              key={risk.id}
              onClick={() => setUserPreferences({ ...userPreferences, riskTolerance: risk.id })}
              className={`w-full p-4 rounded-lg border transition-all text-left ${
                userPreferences.riskTolerance === risk.id
                  ? `border-${risk.color}-500 bg-${risk.color}-500/10`
                  : 'border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  userPreferences.riskTolerance === risk.id
                    ? `border-${risk.color}-500 bg-${risk.color}-500`
                    : 'border-gray-400'
                }`}>
                  {userPreferences.riskTolerance === risk.id && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <p className={`${getTextColor()} font-medium`}>{risk.label}</p>
                  <p className={`${getSubtextClass()} text-sm`}>{risk.description}</p>
                  <p className={`${getSubtextClass()} text-xs mt-1`}>{risk.example}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Set your round-up amount",
      subtitle: "How much extra would you like to invest per transaction?",
      icon: <DollarSign className="w-16 h-16 text-yellow-400" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              ${userPreferences.roundUpAmount}
            </div>
            <p className={`${getSubtextClass()}`}>per transaction</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 5, 10, 25, 50].map(amount => (
              <button
                key={amount}
                onClick={() => setUserPreferences({ ...userPreferences, roundUpAmount: amount })}
                className={`p-4 rounded-lg border transition-all ${
                  userPreferences.roundUpAmount === amount
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="text-lg font-semibold">${amount}</div>
              </button>
            ))}
          </div>
          
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className={`${getSubtextClass()} text-sm text-center`}>
              Example: Buy coffee for $4.50 → Invest ${userPreferences.roundUpAmount} extra
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Enable notifications?",
      subtitle: "Stay updated on your investment progress",
      icon: <Smartphone className="w-16 h-16 text-cyan-400" />,
      content: (
        <div className="space-y-4">
          <div className="p-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Smartphone className="w-8 h-8 text-cyan-400" />
              <div>
                <p className={`${getTextColor()} font-medium`}>Investment Updates</p>
                <p className={`${getSubtextClass()} text-sm`}>Get notified when your investments grow</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className={`${getTextColor()} font-medium`}>Market Insights</p>
                <p className={`${getSubtextClass()} text-sm`}>Weekly AI-powered market analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-400" />
              <div>
                <p className={`${getTextColor()} font-medium`}>Goal Progress</p>
                <p className={`${getSubtextClass()} text-sm`}>Celebrate when you reach milestones</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setUserPreferences({ ...userPreferences, notifications: !userPreferences.notifications })}
            className={`w-full p-4 rounded-lg border transition-all ${
              userPreferences.notifications
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                userPreferences.notifications
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-400'
              }`}>
                {userPreferences.notifications && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <p className={`${getTextColor()} font-medium`}>
                  {userPreferences.notifications ? 'Enable Notifications' : 'Disable Notifications'}
                </p>
                <p className={`${getSubtextClass()} text-sm`}>
                  {userPreferences.notifications 
                    ? 'You\'ll receive helpful updates about your investments'
                    : 'You can change this later in settings'
                  }
                </p>
              </div>
            </div>
          </button>
        </div>
      )
    },
    {
      title: "You're all set!",
      subtitle: "Let's start building your wealth",
      icon: <CheckCircle className="w-16 h-16 text-green-400" />,
      content: (
        <div className="text-center space-y-6">
          <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20">
            <h3 className={`${getTextColor()} font-semibold mb-4`}>Your Investment Profile</h3>
            <div className="space-y-2 text-left">
              <p className={`${getSubtextClass()}`}>
                <span className="font-medium">Goals:</span> {userPreferences.investmentGoals.length} selected
              </p>
              <p className={`${getSubtextClass()}`}>
                <span className="font-medium">Risk Level:</span> {userPreferences.riskTolerance}
              </p>
              <p className={`${getSubtextClass()}`}>
                <span className="font-medium">Round-up:</span> ${userPreferences.roundUpAmount} per transaction
              </p>
              <p className={`${getSubtextClass()}`}>
                <span className="font-medium">Notifications:</span> {userPreferences.notifications ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className={`${getSubtextClass()} text-sm`}>
              🎉 Welcome to Kamioi! Your AI-powered investment journey starts now.
            </p>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(userPreferences)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true
      case 1: return userPreferences.investmentGoals.length > 0
      case 2: return userPreferences.riskTolerance !== ''
      case 3: return true
      case 4: return true
      case 5: return true
      default: return true
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className={getCardClass() + ' shadow-2xl'}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${getTextColor()}`}>Kamioi</h1>
                <p className={`text-sm ${getSubtextClass()}`}>Investment Setup</p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${getSubtextClass()}`}>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className={`text-sm ${getSubtextClass()}`}>
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="text-center mb-8">
            <div className="mb-4">
              {steps[currentStep].icon}
            </div>
            <h2 className={`text-2xl font-bold ${getTextColor()} mb-2`}>
              {steps[currentStep].title}
            </h2>
            <p className={`${getSubtextClass()} text-lg`}>
              {steps[currentStep].subtitle}
            </p>
          </div>

          {/* Step Body */}
          <div className="mb-8">
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingFlow
