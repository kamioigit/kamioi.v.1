import React, { useState } from 'react'
import { Save, TrendingUp, Users, Settings, PieChart, DollarSign } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { useTheme } from '../../context/ThemeContext'

const FeeConfiguration = () => {
  const { addNotification } = useNotifications()
  const { isLightMode } = useTheme()

  // Theme helper functions
  const getTextClass = () => isLightMode ? 'text-gray-900' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getSecondaryTextClass = () => isLightMode ? 'text-gray-500' : 'text-gray-300'
  const getCardClass = () => isLightMode
    ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm'
    : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'
  const getInnerCardClass = () => isLightMode
    ? 'bg-gray-50 rounded-lg p-4 border border-gray-200'
    : 'bg-white/5 rounded-lg p-4 border border-white/10'
  const getInputClass = () => isLightMode
    ? 'w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  const [feeSettings, setFeeSettings] = useState({
    roundUpFee: 0.25,
    monthlyFee: 0.00,
    familyPlanFee: 9.99,
    premiumFee: 19.99,
    withdrawalFee: 1.00
  })

  const revenueStats = [
    { period: 'Today', amount: 245.50, transactions: 124 },
    { period: 'This Week', amount: 1845.25, transactions: 892 },
    { period: 'This Month', amount: 7892.40, transactions: 3845 },
    { period: 'Total', amount: 28450.75, transactions: 12458 }
  ]

  const handleFeeChange = (key, value) => {
    setFeeSettings(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }))
  }

  const saveSettings = () => {
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Fee settings saved successfully!',
      timestamp: new Date()
    })
  }

  return (
    <div className="space-y-6">
      {/* Fee Configuration Header */}
      <div className={getCardClass()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${getTextClass()}`}>Fee Configuration</h2>
            <p className={getSecondaryTextClass()}>Manage platform pricing and fee structures</p>
          </div>
          <button
            onClick={saveSettings}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>

        {/* Fee Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {Object.entries(feeSettings).map(([key, value]) => (
            <div key={key} className={getInnerCardClass()}>
              <label className={`block ${getSubtextClass()} text-sm mb-2 capitalize`}>
                {key.replace(/([A-Z])/g, ' $1')}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleFeeChange(key, e.target.value)}
                  className={getInputClass()}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Statistics */}
        <div className={getCardClass()}>
          <h3 className={`text-lg font-bold ${getTextClass()} mb-4 flex items-center space-x-2`}>
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span>Revenue Analytics</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {revenueStats.map((stat, index) => (
              <div key={index} className={`text-center p-4 ${getInnerCardClass()}`}>
                <div className="text-2xl font-bold text-green-400 mb-1">${stat.amount.toLocaleString()}</div>
                <div className={`${getSubtextClass()} text-sm`}>{stat.period}</div>
                <div className={`${getSecondaryTextClass()} text-xs mt-1`}>{stat.transactions.toLocaleString()} transactions</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${getCardClass()} text-center`}>
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className={`font-bold ${getTextClass()} mb-2`}>Individual Plan</h4>
            <div className={`text-3xl font-bold ${getTextClass()} mb-4`}>Free</div>
            <ul className={`${getSecondaryTextClass()} text-sm space-y-2 mb-6`}>
              <li>Basic round-up investing</li>
              <li>AI recommendations</li>
              <li>Standard support</li>
            </ul>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
              Configure
            </button>
          </div>

          <div className={`${getCardClass()} text-center border-2 border-green-500`}>
            <PieChart className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className={`font-bold ${getTextClass()} mb-2`}>Family Plan</h4>
            <div className={`text-3xl font-bold ${getTextClass()} mb-4`}>${feeSettings.familyPlanFee}/month</div>
            <ul className={`${getSecondaryTextClass()} text-sm space-y-2 mb-6`}>
              <li>Everything in Individual</li>
              <li>Up to 6 family members</li>
              <li>Parental controls</li>
              <li>Priority support</li>
            </ul>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">
              Configure
            </button>
          </div>

          <div className={`${getCardClass()} text-center`}>
            <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className={`font-bold ${getTextClass()} mb-2`}>Premium Plan</h4>
            <div className={`text-3xl font-bold ${getTextClass()} mb-4`}>${feeSettings.premiumFee}/month</div>
            <ul className={`${getSecondaryTextClass()} text-sm space-y-2 mb-6`}>
              <li>Everything in Family</li>
              <li>Advanced analytics</li>
              <li>Tax optimization</li>
              <li>24/7 premium support</li>
            </ul>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeeConfiguration
