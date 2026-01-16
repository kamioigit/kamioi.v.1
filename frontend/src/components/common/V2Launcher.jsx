import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Sparkles, User, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const V2Launcher = ({ isOpen, onClose }) => {
  const { isBlackMode, isLightMode} = useTheme()

  const getModalClass = () => {
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

  const dashboards = [
    {
      name: 'User V2',
      description: 'Enhanced personal investment management',
      url: '/v2/user',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      name: 'Family V2',
      description: 'Multi-generational family planning',
      url: '/v2/family',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      name: 'Business V2',
      description: 'Team collaboration and analytics',
      url: '/v2/business',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      name: 'Admin V2',
      description: 'System administration and monitoring',
      url: '/v2/admin',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${getModalClass()} rounded-2xl p-8 max-w-4xl w-full mx-4 relative`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 mr-2" />
            <h2 className={`text-3xl font-bold ${getTextClass()}`}>Kamioi V2 Dashboards</h2>
          </div>
          <p className={`text-lg ${getSubtextClass()}`}>
            Next-generation investment management with the same beautiful UI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboards.map((dashboard, index) => (
            <motion.a
              key={dashboard.name}
              href={dashboard.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${getModalClass()} rounded-xl p-6 hover:scale-105 transition-transform duration-200 block`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${dashboard.bgColor}`}>
                  <div className={`w-6 h-6 ${dashboard.color}`} />
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </div>
              
              <div>
                <h3 className={`font-semibold ${getTextClass()} mb-2`}>
                  {dashboard.name}
                </h3>
                <p className={`text-sm ${getSubtextClass()}`}>
                  {dashboard.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className={`${getModalClass()} rounded-xl p-6 mt-6 text-center`}>
          <h3 className={`font-semibold ${getTextClass()} mb-2`}>
            Same Beautiful UI, Enhanced Features
          </h3>
          <p className={`text-sm ${getSubtextClass()}`}>
            All V2 dashboards maintain the exact same glassmorphism design, 
            dark/light/cloud themes, and smooth animations you love.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default V2Launcher

