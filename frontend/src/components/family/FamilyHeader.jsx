import React, { useState, useEffect } from 'react'
import { Sun, Moon, Link, Search, Bell, Cloud, Upload, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useData } from '../../context/DataContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useModal } from '../../context/ModalContext'
import ProfileAvatar from '../common/ProfileAvatar'
import notificationService from '../../services/notificationService'
import { DollarSign } from 'lucide-react'

const FamilyHeader = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isBlackMode, toggleTheme, isLightMode, theme } = useTheme()
  const { unreadCount, addNotification } = useNotifications()
  const { addTransactions } = useData()
  const { showSuccessModal } = useModal()
  const [investmentAmount, setInvestmentAmount] = useState('$1')
  const [showInput, setShowInput] = useState(false)
  const [currentInputValue, setCurrentInputValue] = useState('')

  // Get unread notification count from useNotifications hook

  const handleBankSync = async () => {
    try {
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken')
      
      if (!user || !user.id) {
        addNotification({
          type: 'error',
          title: 'Sync Failed',
          message: 'Please log in to sync transactions.',
          timestamp: new Date()
        })
        return
      }

      // Trigger sync by fetching latest transactions
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/family/transactions?sync=true`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (response.ok) {
        const data = await response.json()
        const transactionCount = data.transactions?.length || 0
        
        addNotification({
          type: 'success',
          title: 'Bank Sync Complete',
          message: `Successfully synced ${transactionCount} family transactions.`,
          timestamp: new Date()
        })
        
        // Trigger data refresh
        window.dispatchEvent(new CustomEvent('refreshFamilyData'))
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error('Bank sync error:', error)
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'Unable to sync bank transactions. Please try again later.',
        timestamp: new Date()
      })
    }
  }

  // Load investment amount from localStorage on component mount
  useEffect(() => {
    const savedAmount = localStorage.getItem('kamioi_family_investment_amount')
    if (savedAmount) {
      setInvestmentAmount(savedAmount)
    }
  }, [])

  // When input is shown, initialize currentInputValue
  useEffect(() => {
    if (showInput) {
      setCurrentInputValue(investmentAmount.replace('$', ''))
    }
  }, [showInput, investmentAmount])

  const handleInputChange = (value) => {
    // Only allow whole numbers (no decimal points)
    const numericValue = value.replace(/[^0-9]/g, '')
    setCurrentInputValue(numericValue)
  }

  const handleInputBlur = () => {
    const finalValue = currentInputValue || '1' // Default to "1" if input is empty
    const formattedValue = `$${finalValue}`
    setInvestmentAmount(formattedValue)
    localStorage.setItem('kamioi_family_investment_amount', formattedValue)
    setShowInput(false) // Hide input after blur
  }


  const handleNotifications = () => {
    // Navigate to notifications page in the family dashboard
    navigate('/family')
    // Set active tab to notifications (this will be handled by the dashboard)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'notifications' }))
    }, 100)
  }

  const handleFileUpload = () => {
    // Create a file input element
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.xlsx,.xls'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        // Process the CSV file
        const reader = new FileReader()
        reader.onload = (event) => {
          const csv = event.target.result
          const lines = csv.split('\n')
          const headers = lines[0].split(',')
          
          // Parse CSV data
          const transactions = []
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',')
              if (values.length >= headers.length) {
                const transaction = {}
                headers.forEach((header, index) => {
                  transaction[header.trim()] = values[index]?.trim() || ''
                })
                transactions.push(transaction)
              }
            }
          }
          
          // Add transactions to the system
          const processedTransactions = addTransactions(transactions)
          
          // Show success message with transaction count
          showSuccessModal(
            'Family Transactions Uploaded Successfully',
            `Successfully uploaded ${processedTransactions.length} family transactions from ${file.name}!\n\n✅ Kamioi Family Core Engine Processing:\n• Round-ups: $1.00 per transaction (family setting)\n• Platform fees: $0.25 per transaction (fixed)\n• Total debit: Purchase + Round-up + Fee\n• Investable amount: Entire round-up → fractional shares\n• AI mapping: Merchants → Stock tickers\n• Real-time pricing: Yahoo Finance integration\n\nYour family portfolio has been updated with the new investments!`
          )
          addNotification({
            type: 'success',
            title: 'Family Transactions Processed',
            message: `${processedTransactions.length} family transactions uploaded and processed successfully.`,
            timestamp: new Date()
          })
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const getHeaderClass = () => {
    if (isBlackMode) return 'bg-black/20 backdrop-blur-lg rounded-2xl p-4 mb-6 mx-6 mt-4 border border-gray-800'
    if (isLightMode) return 'bg-white/80 backdrop-blur-lg rounded-2xl p-4 mb-6 mx-6 mt-4 border border-gray-200'
    return 'bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 mx-6 mt-4 border border-white/20'
  }

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getSearchInputClass = () => {
    if (isLightMode) return 'bg-gray-100 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400'
    return 'bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-purple-400'
  }

  const getSearchIconClass = () => {
    if (isLightMode) return 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4'
    return 'absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4'
  }

  const getIconClass = () => {
    if (isLightMode) return 'p-2 text-gray-600 hover:text-gray-800 transition-colors'
    return 'p-2 text-white/80 hover:text-white transition-colors'
  }

  const getUserNameClass = () => {
    if (isLightMode) return 'text-gray-800 font-medium'
    return 'text-white font-medium'
  }

  return (
    <header className={getHeaderClass()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={getSearchIconClass()} />
            <input
              type="text"
              placeholder="Search family investments..."
              className={getSearchInputClass()}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Investment Amount Card */}
          <div className={`px-4 py-2 rounded-lg border flex items-center space-x-2 transition-colors ${
            isLightMode 
              ? 'bg-white border-gray-300 text-gray-800' 
              : 'bg-white/10 border-white/20 text-white'
          }`}>
            <DollarSign className="w-4 h-4" />
            {showInput ? (
              <input
                type="text"
                value={currentInputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                placeholder="Enter amount"
                className={`bg-transparent border-none outline-none w-24 ${
                  isLightMode ? 'text-gray-800' : 'text-white'
                }`}
                autoFocus
              />
            ) : (
              <span 
                onClick={() => setShowInput(true)}
                className="cursor-pointer"
              >
                Invest Amount
              </span>
            )}
          </div>

          {/* Upload Bank File removed for family dashboard */}
          
          <button 
            onClick={handleBankSync}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <Link className="w-4 h-4" />
            <span>Bank Sync</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={getIconClass()}
            title={`Current: ${theme} - Click to cycle through themes`}
          >
            {isBlackMode ? <Moon className="w-5 h-5" /> : 
             isLightMode ? <Sun className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button 
            onClick={handleNotifications}
            className={`${getIconClass()} relative`}
            title={`View Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <ProfileAvatar 
              user={user} 
              size="md" 
              showUploadOnHover={true}
              dashboardType="family"
              onImageUpdate={(imageUrl) => {
                console.log('Family profile image updated:', imageUrl)
                // Could trigger a notification here
                if (imageUrl) {
                  notificationService.createSystemNotification('family_invite', {
                    title: 'Profile Updated',
                    message: 'Your family profile picture has been updated successfully.',
                    type: 'success',
                    icon: '📸',
                    priority: 'normal',
                    dashboardType: 'family'
                  })
                }
              }}
            />
            <span className={getUserNameClass()}>{user?.name || 'Family Member'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default FamilyHeader
