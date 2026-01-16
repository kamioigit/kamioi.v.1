import React from 'react'
import { useTheme } from '../../context/ThemeContext'

const SystemAnalytics = ({ user }) => {
  const getTextClass = () => isLightMode ? 'text-gray-800' : 'text-white'
   const { isLightMode } = useTheme()
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white/80 backdrop-blur-lg border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/20'

  return (
    <div className="space-y-6">
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h1 className={`text-2xl font-bold ${getTextClass()} mb-4`}>
          System Analytics
        </h1>
        <p className={`${getSubtextClass()}`}>
          Comprehensive analytics and insights for the entire platform
        </p>
      </div>
    </div>
  )
}

export default SystemAnalytics


