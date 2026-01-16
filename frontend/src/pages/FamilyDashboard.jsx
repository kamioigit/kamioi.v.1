import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import FamilySidebar from '../components/family/FamilySidebar'
import FamilyDashboardHeader from '../components/family/FamilyDashboardHeader'
import FamilyOverview from '../components/family/FamilyOverview'
import FamilyMembers from '../components/family/FamilyMembers'
import FamilyTransactions from '../components/family/FamilyTransactions'
import FamilyPortfolio from '../components/family/FamilyPortfolio'
import FamilyGoals from '../components/family/FamilyGoals'
import FamilyAIInsights from '../components/family/FamilyAIInsights'
import FamilyNotifications from '../components/family/FamilyNotifications'
import FamilySettings from '../components/family/FamilySettings'
import CommunicationHub from '../components/common/CommunicationHub'

const FamilyDashboard = () => {
  const { user, logout } = useAuth()
  const { isDarkMode, isLightMode, isCloudMode } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCommunication, setShowCommunication] = useState(false)

  // macOS-style animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: -20, scale: 0.95 }
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
  }

  const containerVariants = {
    initial: { opacity: 0 },
    in: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  // Listen for custom events to set active tab (from notification bell)
  React.useEffect(() => {
    const handleSetActiveTab = (event) => {
      setActiveTab(event.detail)
    }

    window.addEventListener('setActiveTab', handleSetActiveTab)
    return () => window.removeEventListener('setActiveTab', handleSetActiveTab)
  }, [])

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {(() => {
            switch (activeTab) {
              case 'dashboard':
                return <FamilyOverview user={user} />
              case 'members':
                return <FamilyMembers user={user} />
              case 'transactions':
                return <FamilyTransactions user={user} />
              case 'portfolio':
                return <FamilyPortfolio user={user} />
              case 'goals':
                return <FamilyGoals user={user} />
              case 'ai':
                return <FamilyAIInsights user={user} />
              case 'notifications':
                return <FamilyNotifications user={user} />
              case 'settings':
                return <FamilySettings user={user} />
              default:
                return <FamilyOverview user={user} />
            }
          })()}
        </motion.div>
      </AnimatePresence>
    )
  }

  const getBackgroundClass = () => {
    if (isDarkMode) return 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
    if (isLightMode) return 'bg-gradient-to-br from-gray-100 via-blue-100 to-purple-100'
    if (isCloudMode) return 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
    return 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' // fallback
  }

  return (
    <motion.div 
      className={`flex h-screen ${getBackgroundClass()} overflow-hidden`}
      variants={containerVariants}
      initial="initial"
      animate="in"
    >
      <motion.div variants={itemVariants} className="flex-shrink-0">
        <FamilySidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user}
          onLogout={logout}
          onOpenCommunication={() => setShowCommunication(true)}
        />
      </motion.div>
      
      <motion.div 
        className="flex-1 flex flex-col overflow-hidden h-full"
        variants={itemVariants}
      >
        <motion.div variants={itemVariants} className="flex-shrink-0">
          <FamilyDashboardHeader user={user} activeTab={activeTab} />
        </motion.div>
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <motion.div 
            className="max-w-7xl mx-auto"
            variants={containerVariants}
            initial="initial"
            animate="in"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </motion.div>

      {/* Cross-Dashboard Communication Hub */}
      <CommunicationHub 
        isOpen={showCommunication}
        onClose={() => setShowCommunication(false)}
      />

    </motion.div>
  )
}

export default FamilyDashboard
