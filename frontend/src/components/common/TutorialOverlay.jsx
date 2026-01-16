import React, { useState, useEffect, useRef } from 'react'
import { useTutorial } from '../../context/TutorialContext'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  SkipForward,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react'

const TutorialOverlay = () => {
  const {
    isTutorialActive,
    currentTutorial,
    currentStep,
    getCurrentStep,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    getTutorialSteps
  } = useTutorial()

  const [targetElement, setTargetElement] = useState(null)
  const [overlayStyle, setOverlayStyle] = useState({})
  const [tooltipStyle, setTooltipStyle] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)
  const overlayRef = useRef(null)
  const tooltipRef = useRef(null)

  const currentStepData = getCurrentStep()

  useEffect(() => {
    if (!isTutorialActive || !currentStepData) return

    const updateTargetElement = () => {
      const element = document.querySelector(currentStepData.target)
      setTargetElement(element)

      if (element) {
        const rect = element.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        // Create overlay that highlights the target element
        const overlayRect = {
          top: rect.top + scrollTop,
          left: rect.left + scrollLeft,
          width: rect.width,
          height: rect.height
        }

        setOverlayStyle({
          position: 'absolute',
          top: overlayRect.top,
          left: overlayRect.left,
          width: overlayRect.width,
          height: overlayRect.height,
          zIndex: 1000,
          pointerEvents: 'none'
        })

        // Position tooltip based on position preference
        let tooltipPosition = { top: 0, left: 0 }
        const tooltipWidth = 320
        const tooltipHeight = 200
        const margin = 20

        switch (currentStepData.position) {
          case 'top':
            tooltipPosition = {
              top: overlayRect.top - tooltipHeight - margin,
              left: overlayRect.left + (overlayRect.width - tooltipWidth) / 2
            }
            break
          case 'bottom':
            tooltipPosition = {
              top: overlayRect.top + overlayRect.height + margin,
              left: overlayRect.left + (overlayRect.width - tooltipWidth) / 2
            }
            break
          case 'left':
            tooltipPosition = {
              top: overlayRect.top + (overlayRect.height - tooltipHeight) / 2,
              left: overlayRect.left - tooltipWidth - margin
            }
            break
          case 'right':
            tooltipPosition = {
              top: overlayRect.top + (overlayRect.height - tooltipHeight) / 2,
              left: overlayRect.left + overlayRect.width + margin
            }
            break
        }

        // Ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        if (tooltipPosition.left < margin) {
          tooltipPosition.left = margin
        }
        if (tooltipPosition.left + tooltipWidth > viewportWidth - margin) {
          tooltipPosition.left = viewportWidth - tooltipWidth - margin
        }
        if (tooltipPosition.top < margin) {
          tooltipPosition.top = margin
        }
        if (tooltipPosition.top + tooltipHeight > viewportHeight - margin) {
          tooltipPosition.top = viewportHeight - tooltipHeight - margin
        }

        setTooltipStyle({
          position: 'absolute',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          zIndex: 1001
        })

        // Scroll element into view if needed
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        })
      }
    }

    // Small delay to ensure DOM is updated
    const timer = setTimeout(updateTargetElement, 100)
    return () => clearTimeout(timer)
  }, [isTutorialActive, currentStepData, currentStep])

  useEffect(() => {
    if (isTutorialActive) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  if (!isTutorialActive || !currentStepData) return null

  const steps = getTutorialSteps(currentTutorial)
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    setIsAnimating(true)
    setTimeout(() => {
      nextStep()
    }, 150)
  }

  const handlePrev = () => {
    setIsAnimating(true)
    setTimeout(() => {
      prevStep()
    }, 150)
  }

  const handleSkip = () => {
    skipTutorial()
  }

  const handleComplete = () => {
    completeTutorial()
  }

  return (
    <>
      {/* Dark overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] transition-opacity duration-300"
        style={{ opacity: isAnimating ? 0 : 1 }}
      />
      
      {/* Highlighted element overlay */}
      {targetElement && (
        <div
          ref={overlayRef}
          className={`absolute border-4 border-blue-400 rounded-lg bg-blue-400/20 shadow-2xl transition-all duration-300 ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={overlayStyle}
        >
          {/* Pulsing animation */}
          <div className="absolute inset-0 border-4 border-blue-300 rounded-lg animate-ping opacity-75" />
          <div className="absolute inset-0 border-2 border-white rounded-lg animate-pulse" />
        </div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-0 translate-y-2' : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={tooltipStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Action indicator */}
        {currentStepData.action === 'highlight' && (
          <div className="flex items-center space-x-2 text-blue-600 mb-4">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Click to continue</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2">
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium"
              >
                <span>Complete</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Skip option */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors text-sm mx-auto"
          >
            <SkipForward className="w-4 h-4" />
            <span>Skip tutorial</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default TutorialOverlay

