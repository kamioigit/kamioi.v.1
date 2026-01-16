import React, { useState, useEffect } from 'react'
import { useTutorial } from '../../context/TutorialContext'
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Sparkles,
  Users,
  Building2,
  User
} from 'lucide-react'

const TutorialTrigger = ({ userType = 'user', className = '' }) => {
  const { 
    startTutorial, 
    isTutorialCompleted, 
    resetTutorial,
    isTutorialActive 
  } = useTutorial()
  
  const [isVisible, setIsVisible] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    // Show tutorial trigger for new users or if tutorial hasn't been completed
    const tutorialId = `${userType}_dashboard`
    const completed = isTutorialCompleted(tutorialId, userType)
    
    // Show if not completed or if user is new (you can add additional logic here)
    setIsVisible(!completed)
  }, [userType, isTutorialCompleted])

  const handleStartTutorial = () => {
    const tutorialId = `${userType}_dashboard`
    const started = startTutorial(tutorialId, userType)
    
    if (started) {
      setShowOptions(false)
    }
  }

  const handleResetTutorial = () => {
    const tutorialId = `${userType}_dashboard`
    resetTutorial(tutorialId, userType)
    setIsVisible(true)
    setShowOptions(false)
  }

  const getTutorialInfo = () => {
    switch (userType) {
      case 'family':
        return {
          title: 'Family Dashboard Tour',
          description: 'Learn how to manage family investments',
          icon: <Users className="w-5 h-5" />,
          color: 'from-green-500 to-emerald-600'
        }
      case 'business':
        return {
          title: 'Business Dashboard Tour',
          description: 'Explore business investment features',
          icon: <Building2 className="w-5 h-5" />,
          color: 'from-purple-500 to-indigo-600'
        }
      default:
        return {
          title: 'Dashboard Tour',
          description: 'Learn how to use your dashboard',
          icon: <User className="w-5 h-5" />,
          color: 'from-blue-500 to-cyan-600'
        }
    }
  }

  const tutorialInfo = getTutorialInfo()

  if (!isVisible || isTutorialActive) return null

  return (
    <div className={`relative ${className}`}>
      {/* Main trigger button */}
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`group relative bg-gradient-to-r ${tutorialInfo.color} text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3`}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Content */}
          <div className="relative flex items-center space-x-3">
            <div className="relative">
              {tutorialInfo.icon}
              {/* Pulsing dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">{tutorialInfo.title}</div>
              <div className="text-xs opacity-90">{tutorialInfo.description}</div>
            </div>
          </div>
        </button>

        {/* Floating sparkles animation */}
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
        </div>
      </div>

      {/* Options dropdown */}
      {showOptions && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Start Tutorial</h4>
                <p className="text-sm text-gray-600">Take a guided tour of your dashboard</p>
              </div>
            </div>

            <button
              onClick={handleStartTutorial}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Tour</span>
            </button>

            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={handleResetTutorial}
                className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Tutorial</span>
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              You can always access this tutorial from the help menu
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  )
}

export default TutorialTrigger

