import React from 'react'
import { TrendingUp } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const BusinessPortfolio = ({ user }) => {
  const { isBlackMode, isLightMode} = useTheme()

  const getCardClass = () => {
    if (isBlackMode) return 'bg-black/20 backdrop-blur-xl border border-white/10'
    if (isLightMode) return 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
    return 'bg-white/10 backdrop-blur-xl border border-white/20'
  }

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getSubtextClass = () => {
    if (isLightMode) return 'text-gray-600'
    return 'text-white/60'
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${getTextClass()}`}>Business Portfolio</h1>
          <p className={`text-sm ${getSubtextClass()}`}>View and manage your business investment portfolio</p>
        </div>
      </div>

      <div className={`${getCardClass()} rounded-xl p-12 text-center`}>
        <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${getSubtextClass()}`} />
        <h3 className={`text-xl font-semibold ${getTextClass()} mb-2`}>Business Portfolio</h3>
        <p className={`${getSubtextClass()} mb-6`}>Monitor your business investment performance and holdings</p>
        <p className={`text-sm ${getSubtextClass()}`}>Coming soon...</p>
      </div>
    </div>
  )
}

export default BusinessPortfolio
