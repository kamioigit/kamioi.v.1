/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'

const TutorialContext = createContext()

export const useTutorial = () => {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}

export const TutorialProvider = ({ children }) => {
  const [currentTutorial, setCurrentTutorial] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isTutorialActive, setIsTutorialActive] = useState(false)
  const [tutorialProgress, setTutorialProgress] = useState({})
  const [completedTutorials, setCompletedTutorials] = useState(new Set())

  // Load completed tutorials from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kamioi_completed_tutorials')
    if (saved) {
      try {
        setCompletedTutorials(new Set(JSON.parse(saved)))
      } catch (error) {
        console.error('Error loading completed tutorials:', error)
      }
    }
  }, [])

  // Save completed tutorials to localStorage
  const saveCompletedTutorials = (tutorials) => {
    localStorage.setItem('kamioi_completed_tutorials', JSON.stringify([...tutorials]))
  }

  const startTutorial = (tutorialId, userType = 'user') => {
    // Check if tutorial was already completed
    if (completedTutorials.has(`${userType}_${tutorialId}`)) {
      return false
    }

    setCurrentTutorial(tutorialId)
    setCurrentStep(0)
    setIsTutorialActive(true)
    setTutorialProgress(prev => ({
      ...prev,
      [tutorialId]: { currentStep: 0, totalSteps: getTutorialSteps(tutorialId).length }
    }))
    return true
  }

  const nextStep = () => {
    if (currentTutorial) {
      const steps = getTutorialSteps(currentTutorial)
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
        setTutorialProgress(prev => ({
          ...prev,
          [currentTutorial]: { 
            currentStep: currentStep + 1, 
            totalSteps: steps.length 
          }
        }))
      } else {
        completeTutorial()
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setTutorialProgress(prev => ({
        ...prev,
        [currentTutorial]: { 
          currentStep: currentStep - 1, 
          totalSteps: getTutorialSteps(currentTutorial).length 
        }
      }))
    }
  }

  const skipTutorial = () => {
    if (currentTutorial) {
      completeTutorial()
    }
  }

  const completeTutorial = () => {
    if (currentTutorial) {
      const userType = getCurrentUserType()
      const tutorialKey = `${userType}_${currentTutorial}`
      const newCompleted = new Set(completedTutorials)
      newCompleted.add(tutorialKey)
      setCompletedTutorials(newCompleted)
      saveCompletedTutorials(newCompleted)
    }
    
    setCurrentTutorial(null)
    setCurrentStep(0)
    setIsTutorialActive(false)
    setTutorialProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[currentTutorial]
      return newProgress
    })
  }

  const getCurrentUserType = () => {
    // This would typically come from your auth context
    const path = window.location.pathname
    if (path.includes('/admin')) return 'admin'
    if (path.includes('/family')) return 'family'
    if (path.includes('/business')) return 'business'
    return 'user'
  }

  const getTutorialSteps = (tutorialId) => {
    const tutorials = {
      'user_dashboard': [
        {
          id: 'welcome',
          title: 'Welcome to Kamioi!',
          description: 'Let\'s take a quick tour of your dashboard',
          target: '[data-tutorial="welcome-banner"]',
          position: 'bottom',
          action: 'highlight'
        },
        {
          id: 'transactions',
          title: 'Your Transactions',
          description: 'Here you can view and manage all your transactions. Upload bank statements to get started!',
          target: '[data-tutorial="transactions-section"]',
          position: 'right',
          action: 'highlight'
        },
        {
          id: 'mapping',
          title: 'AI Mapping',
          description: 'Our AI automatically maps your purchases to stock ownership. You can also submit manual mappings here.',
          target: '[data-tutorial="mapping-section"]',
          position: 'left',
          action: 'highlight'
        },
        {
          id: 'insights',
          title: 'AI Insights',
          description: 'Get personalized investment insights and track your mapping history.',
          target: '[data-tutorial="insights-section"]',
          position: 'top',
          action: 'highlight'
        },
        {
          id: 'portfolio',
          title: 'Your Portfolio',
          description: 'View your investment portfolio and track your wealth growth over time.',
          target: '[data-tutorial="portfolio-section"]',
          position: 'bottom',
          action: 'highlight'
        }
      ],
      'family_dashboard': [
        {
          id: 'welcome',
          title: 'Family Dashboard',
          description: 'Welcome to your family investment dashboard! Let\'s explore the features.',
          target: '[data-tutorial="family-welcome"]',
          position: 'bottom',
          action: 'highlight'
        },
        {
          id: 'family_members',
          title: 'Family Members',
          description: 'Manage your family members and their individual investment goals.',
          target: '[data-tutorial="family-members"]',
          position: 'right',
          action: 'highlight'
        },
        {
          id: 'family_goals',
          title: 'Family Goals',
          description: 'Set and track family-wide investment goals like education funds and home purchases.',
          target: '[data-tutorial="family-goals"]',
          position: 'left',
          action: 'highlight'
        },
        {
          id: 'family_analytics',
          title: 'Family Analytics',
          description: 'View comprehensive analytics for your entire family\'s investment performance.',
          target: '[data-tutorial="family-analytics"]',
          position: 'top',
          action: 'highlight'
        }
      ],
      'business_dashboard': [
        {
          id: 'welcome',
          title: 'Business Dashboard',
          description: 'Welcome to your business investment platform! Let\'s get you oriented.',
          target: '[data-tutorial="business-welcome"]',
          position: 'bottom',
          action: 'highlight'
        },
        {
          id: 'team_management',
          title: 'Team Management',
          description: 'Manage your team members and their access to business investment features.',
          target: '[data-tutorial="team-management"]',
          position: 'right',
          action: 'highlight'
        },
        {
          id: 'business_goals',
          title: 'Business Goals',
          description: 'Set corporate investment goals and track business financial objectives.',
          target: '[data-tutorial="business-goals"]',
          position: 'left',
          action: 'highlight'
        },
        {
          id: 'business_analytics',
          title: 'Business Analytics',
          description: 'Monitor your business investment performance and financial metrics.',
          target: '[data-tutorial="business-analytics"]',
          position: 'top',
          action: 'highlight'
        },
        {
          id: 'revenue_tracking',
          title: 'Revenue & Expenses',
          description: 'Track business revenue, expenses, and profit margins for better investment decisions.',
          target: '[data-tutorial="revenue-tracking"]',
          position: 'bottom',
          action: 'highlight'
        }
      ]
    }
    return tutorials[tutorialId] || []
  }

  const getCurrentStep = () => {
    if (!currentTutorial) return null
    const steps = getTutorialSteps(currentTutorial)
    return steps[currentStep] || null
  }

  const isTutorialCompleted = (tutorialId, userType = null) => {
    const type = userType || getCurrentUserType()
    return completedTutorials.has(`${type}_${tutorialId}`)
  }

  const resetTutorial = (tutorialId, userType = null) => {
    const type = userType || getCurrentUserType()
    const tutorialKey = `${type}_${tutorialId}`
    const newCompleted = new Set(completedTutorials)
    newCompleted.delete(tutorialKey)
    setCompletedTutorials(newCompleted)
    saveCompletedTutorials(newCompleted)
  }

  const resetAllTutorials = () => {
    setCompletedTutorials(new Set())
    localStorage.removeItem('kamioi_completed_tutorials')
  }

  const value = {
    currentTutorial,
    currentStep,
    isTutorialActive,
    tutorialProgress,
    completedTutorials,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    getCurrentStep,
    isTutorialCompleted,
    resetTutorial,
    resetAllTutorials,
    getTutorialSteps
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  )
}
