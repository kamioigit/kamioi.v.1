import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTutorial } from '../../context/TutorialContext'
import { useAuth } from '../../context/AuthContext'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  SkipForward,
  Target,
  Sparkles,
  ArrowRight,
  User,
  CheckCircle
} from 'lucide-react'

const TutorialSidebar = () => {
  const { user } = useAuth()
  const {
    isTutorialActive,
    currentTutorial,
    currentStep,
    getCurrentStep,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    getTutorialSteps,
    isTutorialCompleted,
    startTutorial
  } = useTutorial()

  const [isVisible, setIsVisible] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  const currentStepData = getCurrentStep()
  const totalSteps = getTutorialSteps(currentTutorial)?.length || 0

  // Show tutorial sidebar for new users who haven't completed the tutorial
  useEffect(() => {
    if (user && user.isNewUser && !isTutorialCompleted('user_dashboard', 'user')) {
      setIsVisible(true)
    }
  }, [user, isTutorialCompleted])

  // Highlight target elements when tutorial is active
  useEffect(() => {
    if (isTutorialActive && currentStepData?.target) {
      const targetElement = document.querySelector(currentStepData.target)
      if (targetElement) {
        // Add highlight class
        targetElement.classList.add('tutorial-highlight')
        
        // Scroll to element
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        })

        // Remove highlight when component unmounts or step changes
        return () => {
          targetElement.classList.remove('tutorial-highlight')
        }
      }
    }
  }, [isTutorialActive, currentStepData])

  const handleStartTutorial = () => {
    setShowWelcome(false)
    startTutorial('user_dashboard', 'user')
  }

  const handleSkipTutorial = () => {
    completeTutorial()
    setIsVisible(false)
  }

  const handleCompleteTutorial = () => {
    completeTutorial()
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-96 z-50 pointer-events-auto"
      >
        {/* Glass sidebar */}
        <div className="h-full tutorial-sidebar relative">
          <div className="h-full flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">User {user?.id || '1475'}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Progress line */}
              <div className="mt-4 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: showWelcome ? "0%" : `${((currentStep + 1) / totalSteps) * 100}%` 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {showWelcome ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to Kamioi!</h2>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Let's take a quick tour of your dashboard to help you get started with investing.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-white/70">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Learn about transactions and round-ups</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white/70">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Discover AI mapping features</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white/70">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Explore your portfolio insights</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleStartTutorial}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Tutorial</span>
                    </button>
                    
                    <button
                      onClick={handleSkipTutorial}
                      className="w-full text-white/60 hover:text-white text-sm py-2 transition-colors"
                    >
                      No, thanks!
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step content */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {currentStepData?.title || 'Tutorial Step'}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {currentStepData?.description || 'Let\'s explore this feature together.'}
                    </p>
                  </div>

                  {/* Step indicator */}
                  <div className="flex justify-center space-x-2">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep 
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      {currentStep > 0 && (
                        <button
                          onClick={prevStep}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>
                      )}
                      
                      {currentStep < totalSteps - 1 ? (
                        <button
                          onClick={nextStep}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleCompleteTutorial}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={handleSkipTutorial}
                      className="w-full text-white/60 hover:text-white text-sm py-2 transition-colors"
                    >
                      Skip tutorial
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-white/50 text-xs">
                  Step {currentStep + 1} of {totalSteps}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TutorialSidebar
