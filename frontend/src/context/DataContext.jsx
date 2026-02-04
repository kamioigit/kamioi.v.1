/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiService from '../services/apiService'
import { getToken, ROLES } from '../services/apiService' // Import getToken and ROLES

const DataContext = createContext()

// Demo data for different account types - matches DemoContext structure
const DEMO_DATA = {
  individual: {
    portfolio: {
      totalValue: 12547.82,
      totalGain: 1847.32,
      gainPercent: 17.24,
      holdings: [
        { symbol: 'AAPL', name: 'Apple Inc.', shares: 5.234, value: 934.12, avgCost: 155.00, currentPrice: 178.50, change: 15.4, allocation: 25 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 2.156, value: 334.89, avgCost: 140.00, currentPrice: 155.35, change: 15.6, allocation: 15 },
        { symbol: 'AMZN', name: 'Amazon.com', shares: 1.892, value: 370.45, avgCost: 175.00, currentPrice: 195.80, change: 16.4, allocation: 20 },
        { symbol: 'MSFT', name: 'Microsoft', shares: 3.445, value: 1421.34, avgCost: 380.00, currentPrice: 412.50, change: 15.2, allocation: 25 },
        { symbol: 'NVDA', name: 'NVIDIA', shares: 0.987, value: 863.45, avgCost: 650.00, currentPrice: 874.80, change: 37.2, allocation: 15 }
      ]
    },
    transactions: [
      { id: 1, merchant: 'Starbucks', description: 'Coffee purchase', amount: 5.75, purchase: 5.75, roundUp: 0.25, round_up: 0.25, ticker: 'SBUX', date: '2024-01-20', status: 'completed', category: 'Food & Drink' },
      { id: 2, merchant: 'Amazon', description: 'Online shopping', amount: 47.32, purchase: 47.32, roundUp: 0.68, round_up: 0.68, ticker: 'AMZN', date: '2024-01-19', status: 'completed', category: 'Shopping' },
      { id: 3, merchant: 'Apple Store', description: 'Electronics', amount: 129.00, purchase: 129.00, roundUp: 1.00, round_up: 1.00, ticker: 'AAPL', date: '2024-01-18', status: 'completed', category: 'Technology' },
      { id: 4, merchant: 'Netflix', description: 'Subscription', amount: 15.99, purchase: 15.99, roundUp: 0.01, round_up: 0.01, ticker: 'NFLX', date: '2024-01-17', status: 'completed', category: 'Entertainment' },
      { id: 5, merchant: 'Uber', description: 'Ride share', amount: 23.45, purchase: 23.45, roundUp: 0.55, round_up: 0.55, ticker: 'UBER', date: '2024-01-16', status: 'completed', category: 'Transportation' },
      { id: 6, merchant: 'Target', description: 'General merchandise', amount: 67.89, purchase: 67.89, roundUp: 0.11, round_up: 0.11, ticker: 'TGT', date: '2024-01-15', status: 'completed', category: 'Shopping' },
      { id: 7, merchant: 'Chipotle', description: 'Restaurant', amount: 12.34, purchase: 12.34, roundUp: 0.66, round_up: 0.66, ticker: 'CMG', date: '2024-01-14', status: 'completed', category: 'Food & Drink' },
      { id: 8, merchant: 'Nike', description: 'Athletic wear', amount: 89.99, purchase: 89.99, roundUp: 0.01, round_up: 0.01, ticker: 'NKE', date: '2024-01-13', status: 'completed', category: 'Shopping' }
    ],
    goals: [
      { id: 1, name: 'Emergency Fund', target: 10000, current: 6500, progress: 65, category: 'Savings' },
      { id: 2, name: 'Vacation Fund', target: 5000, current: 2100, progress: 42, category: 'Travel' },
      { id: 3, name: 'New Car', target: 15000, current: 3200, progress: 21, category: 'Big Purchase' }
    ],
    totalRoundUps: 847.32,
    totalFeesPaid: 42.50
  },
  family: {
    portfolio: {
      totalValue: 28934.56,
      totalGain: 4523.12,
      gainPercent: 18.52,
      holdings: [
        { symbol: 'AAPL', name: 'Apple Inc.', shares: 12.345, value: 2205.67, avgCost: 160.00, currentPrice: 178.70, change: 18.6, allocation: 30 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 5.678, value: 881.45, avgCost: 142.00, currentPrice: 155.25, change: 16.3, allocation: 15 },
        { symbol: 'VTI', name: 'Vanguard Total Stock', shares: 45.234, value: 10234.56, avgCost: 210.00, currentPrice: 226.25, change: 18.1, allocation: 35 },
        { symbol: 'QQQ', name: 'Invesco QQQ', shares: 15.678, value: 6789.12, avgCost: 400.00, currentPrice: 433.00, change: 17.0, allocation: 20 }
      ]
    },
    transactions: [
      { id: 1, merchant: 'Costco', description: 'Groceries', amount: 234.56, purchase: 234.56, roundUp: 0.44, round_up: 0.44, ticker: 'COST', date: '2024-01-20', status: 'completed', category: 'Groceries', member: 'Demo Family Admin' },
      { id: 2, merchant: 'Amazon', description: 'Household items', amount: 89.99, purchase: 89.99, roundUp: 0.01, round_up: 0.01, ticker: 'AMZN', date: '2024-01-19', status: 'completed', category: 'Shopping', member: 'Jane Demo' },
      { id: 3, merchant: 'Target', description: 'School supplies', amount: 45.67, purchase: 45.67, roundUp: 0.33, round_up: 0.33, ticker: 'TGT', date: '2024-01-18', status: 'completed', category: 'Education', member: 'Tommy Demo' },
      { id: 4, merchant: 'Disney+', description: 'Family subscription', amount: 13.99, purchase: 13.99, roundUp: 0.01, round_up: 0.01, ticker: 'DIS', date: '2024-01-17', status: 'completed', category: 'Entertainment', member: 'Demo Family Admin' }
    ],
    goals: [
      { id: 1, name: 'Family Vacation', target: 8000, current: 4500, progress: 56, category: 'Travel' },
      { id: 2, name: 'College Fund', target: 50000, current: 12000, progress: 24, category: 'Education' },
      { id: 3, name: 'Emergency Fund', target: 20000, current: 15000, progress: 75, category: 'Savings' }
    ],
    totalRoundUps: 1892.35,
    totalFeesPaid: 95.50
  },
  business: {
    portfolio: {
      totalValue: 156789.34,
      totalGain: 23456.78,
      gainPercent: 17.58,
      holdings: [
        { symbol: 'SPY', name: 'S&P 500 ETF', shares: 234.567, value: 112345.67, avgCost: 450.00, currentPrice: 478.85, change: 16.2, allocation: 45 },
        { symbol: 'VTI', name: 'Vanguard Total Stock', shares: 89.123, value: 20123.45, avgCost: 210.00, currentPrice: 225.80, change: 20.7, allocation: 25 },
        { symbol: 'BND', name: 'Vanguard Bond ETF', shares: 123.456, value: 9876.54, avgCost: 78.00, currentPrice: 80.00, change: 5.8, allocation: 15 },
        { symbol: 'AAPL', name: 'Apple Inc.', shares: 45.678, value: 8156.78, avgCost: 165.00, currentPrice: 178.55, change: 17.8, allocation: 15 }
      ]
    },
    transactions: [
      { id: 1, merchant: 'AWS', description: 'Cloud Services', amount: 2345.67, purchase: 2345.67, roundUp: 0.33, round_up: 0.33, ticker: 'AMZN', date: '2024-01-20', status: 'completed', category: 'Cloud Services', employee: 'John Manager' },
      { id: 2, merchant: 'Adobe', description: 'Software licenses', amount: 599.88, purchase: 599.88, roundUp: 0.12, round_up: 0.12, ticker: 'ADBE', date: '2024-01-19', status: 'completed', category: 'Software', employee: 'Carol Designer' },
      { id: 3, merchant: 'Office Depot', description: 'Office supplies', amount: 234.56, purchase: 234.56, roundUp: 0.44, round_up: 0.44, ticker: 'ODP', date: '2024-01-18', status: 'completed', category: 'Office Supplies', employee: 'Alice Accountant' },
      { id: 4, merchant: 'Delta Airlines', description: 'Business travel', amount: 567.89, purchase: 567.89, roundUp: 0.11, round_up: 0.11, ticker: 'DAL', date: '2024-01-17', status: 'completed', category: 'Travel', employee: 'Demo Business' },
      { id: 5, merchant: 'WeWork', description: 'Office space', amount: 1500.00, purchase: 1500.00, roundUp: 0.00, round_up: 0.00, ticker: null, date: '2024-01-15', status: 'completed', category: 'Office Space', employee: 'Demo Business' }
    ],
    goals: [
      { id: 1, name: 'Q1 Investment Target', target: 50000, current: 35000, progress: 70, category: 'Investment' },
      { id: 2, name: 'Annual Growth Fund', target: 200000, current: 78000, progress: 39, category: 'Growth' },
      { id: 3, name: 'Emergency Reserve', target: 100000, current: 85000, progress: 85, category: 'Reserve' }
    ],
    totalRoundUps: 12345.67,
    totalFeesPaid: 625.00
  }
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    console.warn('useData must be used within a DataProvider - returning default values')
    // Return default values instead of throwing error
    return {
      transactions: [],
      portfolioValue: 0,
      totalRoundUps: 0,
      holdings: [],
      goals: [],
      recommendations: [],
      notifications: [],
      setTransactions: () => {},
      addTransactions: () => {},
      setPortfolioValue: () => {},
      setTotalRoundUps: () => {},
      setHoldings: () => {},
      setGoals: () => {},
      setRecommendations: () => {},
      setNotifications: () => {}
    }
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([])
  const [holdings, setHoldings] = useState([])
  const [goals, setGoals] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [totalRoundUps, setTotalRoundUps] = useState(0)
  const [totalFeesPaid, setTotalFeesPaid] = useState(0)
  const [adminReports, setAdminReports] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Clear all localStorage data to ensure clean state
  const clearAllLocalStorage = () => {
    const keysToRemove = [
      'kamioi_holdings',
      'kamioi_portfolio_value',
      'kamioi_transactions',
      'kamioi_goals',
      'kamioi_recommendations',
      'kamioi_notifications',
      'kamioi_total_roundups',
      'kamioi_total_fees_paid',
      'kamioi_user_token', // Clear user token
      'kamioi_admin_token' // Clear admin token
    ]
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  // Load data from API - ONLY when explicitly called
  const loadDataFromAPI = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if in demo mode - use demo data instead of API calls
      const isDemoMode = localStorage.getItem('kamioi_demo_mode') === 'true'
      const demoAccountType = localStorage.getItem('kamioi_demo_account_type') || 'individual'

      if (isDemoMode) {
        console.log('DataContext - Demo mode detected, using demo data for:', demoAccountType)
        const demoData = DEMO_DATA[demoAccountType] || DEMO_DATA.individual

        // Set demo data
        setTransactions(demoData.transactions || [])
        setHoldings(demoData.portfolio?.holdings || [])
        setPortfolioValue(demoData.portfolio?.totalValue || 0)
        setGoals(demoData.goals || [])
        setTotalRoundUps(demoData.totalRoundUps || 0)
        setTotalFeesPaid(demoData.totalFeesPaid || 0)
        setRecommendations([])
        setNotifications([])
        setHasLoaded(true)
        setIsLoading(false)
        return
      }

      // Check if user is authenticated before making API calls
      const demoToken = localStorage.getItem('kamioi_demo_token')
      const userToken = getToken(ROLES.USER)
      const adminToken = getToken(ROLES.ADMIN)

      console.log('DataContext - Token check:', { demoToken: !!demoToken, userToken, adminToken, userTokenExists: !!userToken, adminTokenExists: !!adminToken })

      // In demo mode, allow data loading (demo token will be used by axios interceptor)
      if (!demoToken && !userToken && !adminToken) {
        console.log('DataContext - No auth token found, skipping API data load')
        setIsLoading(false)
        return
      }

      // Check if user is admin - admins shouldn't load user data (unless in demo mode)
      if (adminToken && !userToken && !demoToken) { // Only admin logged in (not demo)
        console.log('DataContext - Admin user detected, skipping user data load')
        // Optionally load admin-specific data here
        setIsLoading(false)
        return
      }

      // Try to load from API first
      console.log('DataContext - Starting API calls...')
      
      // Determine if this is a family user based on URL
      const isFamilyUser = window.location.pathname.includes('/family/') || window.location.pathname.includes('/family')
      const isBusinessUser = window.location.pathname.includes('/business/') || window.location.pathname.includes('/business')
      
      // Determine dashboard type
      const dashboardType = isFamilyUser ? 'family' : isBusinessUser ? 'business' : 'user'
      
      console.log('DataContext - User type detection:', { isFamilyUser, isBusinessUser, dashboardType, pathname: window.location.pathname })
      
      // Use API service with dashboard type detection
      const transactionsAPI = apiService.getTransactions(dashboardType)
      
      console.log('DataContext - Using transactions API:', dashboardType === 'family' ? '/api/family/transactions' : dashboardType === 'business' ? '/api/business/transactions' : '/api/user/transactions')
      
      const [
        transactionsData,
        portfolioData,
        goalsData,
        recommendationsData,
        notificationsData,
        roundUpsData,
        feesData
      ] = await Promise.allSettled([
        transactionsAPI,
        apiService.getPortfolio(dashboardType),
        apiService.getGoals(dashboardType),
        apiService.getAIRecommendations(dashboardType),
        apiService.getNotifications(dashboardType),
        apiService.getTotalRoundUps(dashboardType),
        apiService.getTotalFees(dashboardType)
      ])

      console.log('DataContext - API calls completed:', {
        transactions: transactionsData.status,
        portfolio: portfolioData.status,
        goals: goalsData.status,
        recommendations: recommendationsData.status,
        notifications: notificationsData.status,
        roundUps: roundUpsData.status,
        fees: feesData.status
      })

      // Update state with API data only (clean zero data)
      let transactions = []
      if (transactionsData.status === 'fulfilled') {
        console.log('DataContext - Raw transactions API response:', transactionsData.value)
      console.log('DataContext - API response structure:', {
        hasData: !!transactionsData.value?.data,
        hasTransactions: !!transactionsData.value?.transactions,
        dataType: typeof transactionsData.value?.data,
        transactionsType: typeof transactionsData.value?.transactions,
        dataIsArray: Array.isArray(transactionsData.value?.data),
        transactionsIsArray: Array.isArray(transactionsData.value?.transactions),
        fullResponse: transactionsData.value
      })
        
        // 🚀 STANDARDIZED RESPONSE FORMAT: { success: true, data: { transactions: [...] } }
        // Axios wraps: response.data = { success: true, data: { transactions: [...] } }
        // So we need: transactionsData.value.data.data.transactions
        
        // Standard format (new): response.data.data.transactions
        if (transactionsData.value?.data?.data?.transactions && Array.isArray(transactionsData.value.data.data.transactions)) {
          transactions = transactionsData.value.data.data.transactions
          console.log('DataContext - Using standardized format (data.data.transactions), transactions:', transactions.length)
        }
        // Legacy format support (backward compatibility)
        else if (transactionsData.value?.data?.transactions && Array.isArray(transactionsData.value.data.transactions)) {
          transactions = transactionsData.value.data.transactions
          console.log('DataContext - Using legacy format (data.transactions), transactions:', transactions.length)
        }
        // Direct array format (legacy)
        else if (transactionsData.value?.data && Array.isArray(transactionsData.value.data)) {
          transactions = transactionsData.value.data
          console.log('DataContext - Using direct array format (data), transactions:', transactions.length)
        }
        // Fallback
        else {
          console.warn('DataContext - Unknown response format:', transactionsData.value)
          transactions = []
        }
        
        console.log('DataContext - Final transactions array:', {
          status: transactionsData.status,
          response: transactionsData.value,
          transactionsCount: transactions.length,
          sampleTransaction: transactions[0],
          isArray: Array.isArray(transactions)
        })
        setTransactions(transactions)
        console.log('DataContext - setTransactions called with:', transactions.length, 'transactions')
      } else {
        console.log('DataContext - Transactions API failed:', {
          status: transactionsData.status,
          reason: transactionsData.reason,
          error: transactionsData.value
        })
        // Set empty array as fallback
        setTransactions([])
      }

      // Use portfolio data from API if available, otherwise calculate from transactions
      if (portfolioData.status === 'fulfilled') {
        console.log('DataContext - Portfolio API response:', portfolioData.value)
        // Axios wraps response, so we need portfolioData.value.data.portfolio
        const portfolio = portfolioData.value?.data?.portfolio || portfolioData.value?.portfolio || {}
        const holdings = portfolio.positions || []
        const portfolioValueFromAPI = portfolio.totalValue || portfolio.cash || 0

        console.log('DataContext - Portfolio extracted:', { portfolio, holdings, portfolioValueFromAPI })

        // Format holdings for the frontend if they exist
        if (holdings.length > 0) {
          const formattedHoldings = holdings.map(h => ({
            symbol: h.symbol,
            name: h.name || h.symbol,
            shares: h.shares || 0,
            avgCost: h.avgCost || h.average_price || 0,
            currentPrice: h.currentPrice || h.avgCost || 0,
            value: (h.shares || 0) * (h.currentPrice || h.avgCost || 0),
            change: h.change || 0,
            allocation: h.allocation || 100 / holdings.length
          }))
          setHoldings(formattedHoldings)
          const totalValue = formattedHoldings.reduce((sum, h) => sum + h.value, 0)
          setPortfolioValue(totalValue || portfolioValueFromAPI)
          console.log('DataContext - Holdings set:', formattedHoldings.length, 'total value:', totalValue)
        } else {
          setHoldings([])
          setPortfolioValue(portfolioValueFromAPI)
        }
      } else {
        console.log('DataContext - Portfolio API failed, calculating from transactions')
        // Fallback: Calculate portfolio data from completed/mapped transactions
        const investmentTransactions = transactions.filter(t =>
          (t.status === 'mapped' || t.status === 'completed') && t.ticker && t.shares
        )

        // Group by ticker to aggregate shares
        const holdingsMap = {}
        investmentTransactions.forEach(t => {
          const ticker = t.ticker
          if (!holdingsMap[ticker]) {
            holdingsMap[ticker] = {
              symbol: ticker,
              name: t.name || ticker,
              shares: 0,
              totalCost: 0,
              currentPrice: t.stock_price || t.price_per_share || 0
            }
          }
          holdingsMap[ticker].shares += t.shares || 0
          holdingsMap[ticker].totalCost += (t.shares || 0) * (t.price_per_share || 0)
        })

        const holdings = Object.values(holdingsMap).map(h => ({
          symbol: h.symbol,
          name: h.name,
          shares: h.shares,
          avgCost: h.shares > 0 ? h.totalCost / h.shares : 0,
          currentPrice: h.currentPrice,
          value: h.shares * h.currentPrice,
          change: 0,
          allocation: 100
        }))

        // Calculate total allocation
        const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
        holdings.forEach(h => {
          h.allocation = totalValue > 0 ? (h.value / totalValue) * 100 : 100 / holdings.length
        })

        console.log('DataContext - Fallback holdings calculated:', holdings.length, 'total value:', totalValue)
        setHoldings(holdings)
        setPortfolioValue(totalValue)
      }

      if (goalsData.status === 'fulfilled') {
        setGoals(goalsData.value?.goals || [])
      } else {
        // Use clean zero data instead of localStorage fallback
        setGoals([])
      }

      if (recommendationsData.status === 'fulfilled') {
        setRecommendations(recommendationsData.value?.recommendations || [])
      } else {
        // Use clean zero data instead of localStorage fallback
        setRecommendations([])
      }

      if (notificationsData.status === 'fulfilled') {
        setNotifications(notificationsData.value?.notifications || [])
      } else {
        // Use clean zero data instead of localStorage fallback
        setNotifications([])
      }

      if (roundUpsData.status === 'fulfilled') {
        // Handle backend response format: { "success": true, "data": { "total_roundups": 0 } }
        const data = roundUpsData.value
        const roundUpsValue = typeof data === 'number'
          ? data
          : data?.total_roundups || 0
        setTotalRoundUps(roundUpsValue)
      } else {
        // Use clean zero data instead of localStorage fallback
        setTotalRoundUps(0)
      }

      if (feesData.status === 'fulfilled') {
        // Handle backend response format: { "success": true, "data": { "total_fees": 0 } }
        const data = feesData.value
        const feesValue = typeof data === 'number'
          ? data
          : data?.total_fees || 0
        setTotalFeesPaid(feesValue)
      } else {
        // Use clean zero data instead of localStorage fallback
        setTotalFeesPaid(0)
      }

      setHasLoaded(true)
      setIsLoading(false)

    } catch (error) {
      console.error('Error loading data from API:', error)
      setError('Failed to load data from server')

      // Fallback to localStorage
      const storedTransactions = localStorage.getItem('kamioi_transactions')
      const storedHoldings = localStorage.getItem('kamioi_holdings')
      const storedGoals = localStorage.getItem('kamioi_goals')
      const storedRecommendations = localStorage.getItem('kamioi_recommendations')
      const storedNotifications = localStorage.getItem('kamioi_notifications')
      const storedPortfolioValue = localStorage.getItem('kamioi_portfolio_value')
      const storedTotalRoundUps = localStorage.getItem('kamioi_total_roundups')
      const storedTotalFeesPaid = localStorage.getItem('kamioi_total_fees')
      const storedAdminReports = localStorage.getItem('kamioi_admin_reports')

      if (storedTransactions) setTransactions(JSON.parse(storedTransactions))
      if (storedHoldings) setHoldings(JSON.parse(storedHoldings))
      if (storedGoals) setGoals(JSON.parse(storedGoals))
      if (storedRecommendations) setRecommendations(JSON.parse(storedRecommendations))
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications))
      if (storedPortfolioValue) setPortfolioValue(parseFloat(storedPortfolioValue))
      if (storedTotalRoundUps) setTotalRoundUps(parseFloat(storedTotalRoundUps))
      if (storedTotalFeesPaid) setTotalFeesPaid(parseFloat(storedTotalFeesPaid))
      if (storedAdminReports) setAdminReports(JSON.parse(storedAdminReports))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load data from API when user is authenticated or in demo mode
  useEffect(() => {
    const isDemoMode = localStorage.getItem('kamioi_demo_mode') === 'true'
    const demoToken = localStorage.getItem('kamioi_demo_token')
    const userToken = getToken(ROLES.USER)
    const adminToken = getToken(ROLES.ADMIN)

    // If in demo mode, load demo data
    if (isDemoMode) {
      console.log('DataContext - Demo mode detected, loading demo data')
      loadDataFromAPI()
      return
    }

    if (demoToken || userToken || adminToken) {
      console.log('DataContext - User authenticated, loading from API', { demoToken: !!demoToken, userToken: !!userToken, adminToken: !!adminToken })
      loadDataFromAPI()
    } else {
      console.log('DataContext - No auth token, loading from localStorage')
      // Load from localStorage as fallback
      const storedTransactions = localStorage.getItem('kamioi_transactions')
      const storedHoldings = localStorage.getItem('kamioi_holdings')
      const storedGoals = localStorage.getItem('kamioi_goals')
      const storedRecommendations = localStorage.getItem('kamioi_recommendations')
      const storedNotifications = localStorage.getItem('kamioi_notifications')
      const storedPortfolioValue = localStorage.getItem('kamioi_portfolio_value')
      const storedTotalRoundUps = localStorage.getItem('kamioi_total_roundups')
      const storedTotalFeesPaid = localStorage.getItem('kamioi_total_fees')
      const storedAdminReports = localStorage.getItem('kamioi_admin_reports')

      if (storedTransactions) setTransactions(JSON.parse(storedTransactions))
      if (storedHoldings) setHoldings(JSON.parse(storedHoldings))
      if (storedGoals) setGoals(JSON.parse(storedGoals))
      if (storedRecommendations) setRecommendations(JSON.parse(storedRecommendations))
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications))
      if (storedPortfolioValue) setPortfolioValue(parseFloat(storedPortfolioValue))
      if (storedTotalRoundUps) setTotalRoundUps(parseFloat(storedTotalRoundUps))
      if (storedTotalFeesPaid) setTotalFeesPaid(parseFloat(storedTotalFeesPaid))
      if (storedAdminReports) setAdminReports(JSON.parse(storedAdminReports))
    }
  }, [loadDataFromAPI]) // Add loadDataFromAPI to dependencies but ensure it's memoized

  // Listen for demo mode changes to reload data
  useEffect(() => {
    const handleDemoModeChange = () => {
      console.log('DataContext - Demo mode changed, reloading data')
      loadDataFromAPI()
    }

    // Listen for storage changes (when demo mode is toggled)
    window.addEventListener('storage', handleDemoModeChange)

    // Also listen for custom demo mode change event
    window.addEventListener('demoModeChanged', handleDemoModeChange)

    return () => {
      window.removeEventListener('storage', handleDemoModeChange)
      window.removeEventListener('demoModeChanged', handleDemoModeChange)
    }
  }, [loadDataFromAPI])

  // Listen for user login events to reload data
  useEffect(() => {
    const handleUserLogin = (event) => {
      console.log('DataContext - User login event received, reloading data')
      const { token } = event.detail
      if (token) {
        loadDataFromAPI()
      }
    }

    window.addEventListener('userLoggedIn', handleUserLogin)
    return () => window.removeEventListener('userLoggedIn', handleUserLogin)
  }, [loadDataFromAPI]) // Add loadDataFromAPI to dependencies but ensure it's memoized

  // Background polling for automatic transaction syncing
  useEffect(() => {
    const demoToken = localStorage.getItem('kamioi_demo_token')
    const userToken = getToken(ROLES.USER)
    const adminToken = getToken(ROLES.ADMIN)
    
    if (!userToken && !adminToken) {
      return // No user logged in, no need to poll
    }

    // Skip user transaction polling for admin-only sessions
    if (adminToken && !userToken && !demoToken) {
      return
    }

    console.log('DataContext - Starting background polling for automatic transaction sync')
    
    // Poll every 10 minutes (600,000 ms)
    const pollInterval = setInterval(async () => {
      try {
        console.log('DataContext - Background polling: Checking for new transactions...')
        
        // Use API service for all user types
        const data = await apiService.getTransactions()
        
        if (data.success && data.transactions) {
          const newTransactionCount = data.transactions.length
          const currentTransactionCount = transactions.length
          
          if (newTransactionCount > currentTransactionCount) {
            console.log(`DataContext - Background polling: Found ${newTransactionCount - currentTransactionCount} new transactions`)
            setTransactions(data.transactions)
            
            // Show notification for new transactions
            if (newTransactionCount - currentTransactionCount > 0) {
              const event = new CustomEvent('newTransactions', {
                detail: { count: newTransactionCount - currentTransactionCount }
              })
              window.dispatchEvent(event)
            }
          }
        }
      } catch (error) {
        console.log('DataContext - Background polling error:', error)
      }
    }, 600000) // 10 minutes
    
    return () => {
      console.log('DataContext - Stopping background polling')
      clearInterval(pollInterval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Remove transactions from dependencies to prevent infinite loop

  // Optimized: Save data to localStorage with debouncing to prevent CPU overload
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('kamioi_transactions', JSON.stringify(transactions))
    }, 100) // Debounce for 100ms
    return () => clearTimeout(timeoutId)
  }, [transactions])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('kamioi_holdings', JSON.stringify(holdings))
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [holdings])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('kamioi_goals', JSON.stringify(goals))
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [goals])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('kamioi_recommendations', JSON.stringify(recommendations))
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [recommendations])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('kamioi_notifications', JSON.stringify(notifications))
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [notifications])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('kamioi_portfolio_value', portfolioValue.toString())
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [portfolioValue])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('kamioi_total_roundups', totalRoundUps.toString())
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [totalRoundUps])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('kamioi_total_fees', totalFeesPaid.toString())
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [totalFeesPaid])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('kamioi_admin_reports', JSON.stringify(adminReports))
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [adminReports])

  // API Integration Functions
  const addTransaction = async (transactionData) => {
    try {
      const newTransaction = await apiService.addTransaction(transactionData)
      setTransactions(prev => [newTransaction, ...prev])
      return newTransaction
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  const addTransactions = async (transactionsData, userId = null, onProgress = null) => {
    try {
      console.log('DataContext - Processing transactions with auto round-up:', transactionsData)

      // Get user ID from parameter, localStorage, or fallback
      const currentUserId = userId ||
        JSON.parse(localStorage.getItem('kamioi_user') || '{}').id ||
        (getToken(ROLES.USER) || '').replace('token_', '') || // Use new getToken
        1

      console.log('DataContext - Using user ID:', currentUserId)

      // Process each transaction through the round-up engine
      const processedTransactions = []
      const totalTransactions = transactionsData.length

      for (let i = 0; i < transactionsData.length; i++) {
        const transaction = transactionsData[i]
        
        // Update progress
        if (onProgress) {
          const progress = Math.round(((i + 1) / totalTransactions) * 100)
          onProgress(progress, `Processing transaction ${i + 1} of ${totalTransactions}...`)
        }
        try {
          // Handle CSV data with capital letter fields (Date, Description, Amount, etc.)
          const date = transaction.date || transaction.Date || new Date().toISOString().split('T')[0]
          const merchant = transaction.merchant || transaction.Description || transaction.description || ''
          const amountValue = transaction.Amount || transaction.amount || transaction.purchase || 0
          const amount = parseFloat(amountValue.toString().replace(/[^0-9.-]/g, '')) || 0

          // Send to backend for round-up processing
          const result = await apiService.submitTransaction({
            user_id: currentUserId,
            amount: amount,
            merchant: merchant,
            date: date,
            category: transaction.Category || transaction.category || 'Uncategorized'
          })

          if (result.success) {
            const processedTxn = result.transaction || result.data || result

            // Add additional fields for frontend
            if (processedTxn) {
              processedTxn.description = transaction.Description || transaction.description || merchant
              processedTxn.ticker = transaction.ticker || null
              processedTxn.shares = parseFloat(transaction.shares) || 0
              processedTxn.price_per_share = parseFloat(transaction.price_per_share) || 0
              processedTxn.stock_price = parseFloat(transaction.stock_price) || 0
              processedTxn.reference = transaction.Reference || transaction.reference || ''
              processedTxn.status = 'pending'
              processedTxn.id = Date.now() + Math.random() // Generate unique ID
              
              // Ensure date and category are properly set
              if (!processedTxn.date) {
                processedTxn.date = date
              }
              if (!processedTxn.category) {
                processedTxn.category = transaction.Category || transaction.category || 'Uncategorized'
              }

              processedTransactions.push(processedTxn)

              console.log('Transaction processed with auto round-up:', processedTxn)
              console.log('Transaction date:', processedTxn.date, 'category:', processedTxn.category)
            } else {
              console.error('No transaction data received from backend:', result)
            }
          } else {
            console.error('Failed to process transaction with round-up engine:', result.error || 'Unknown error')
            // Fallback to basic processing
            const userRoundUpPreference = 1.00
            const kamioiFee = 0.25

            processedTransactions.push({
              id: Date.now() + Math.random(),
              date,
              merchant,
              description: transaction.Description || transaction.description || merchant,
              category: transaction.Category || transaction.category || 'Uncategorized',
              purchase: amount,
              round_up: userRoundUpPreference,
              total_debit: amount + userRoundUpPreference + kamioiFee,
              investable: userRoundUpPreference,
              fee: kamioiFee,
              status: 'pending',
              ticker: transaction.ticker || null,
              shares: parseFloat(transaction.shares) || 0,
              price_per_share: parseFloat(transaction.price_per_share) || 0,
              stock_price: parseFloat(transaction.stock_price) || 0,
              reference: transaction.Reference || transaction.reference || ''
            })
          }
        } catch (error) {
          console.error('Error processing transaction:', error)
          // Fallback to basic processing
          const date = transaction.date || transaction.Date || new Date().toISOString().split('T')[0]
          const merchant = transaction.merchant || transaction.Description || transaction.description || ''
          const amountValue = transaction.Amount || transaction.amount || transaction.purchase || 0
          const amount = parseFloat(amountValue.toString().replace(/[^0-9.-]/g, '')) || 0

          processedTransactions.push({
            id: Date.now() + Math.random(),
            date,
            merchant,
            description: transaction.Description || transaction.description || merchant,
            category: transaction.Category || transaction.category || 'Uncategorized',
            purchase: amount,
            round_up: 1.00,
            total_debit: amount + 1.00 + 0.25,
            investable: 1.00,
            fee: 0.25,
            status: 'pending',
            ticker: transaction.ticker || null,
            shares: parseFloat(transaction.shares) || 0,
            price_per_share: parseFloat(transaction.price_per_share) || 0,
            stock_price: parseFloat(transaction.stock_price) || 0,
            reference: transaction.Reference || transaction.reference || ''
          })
        }
      }

      console.log('DataContext - All transactions processed with auto round-up:', processedTransactions)

      // Update local state
      setTransactions(prev => [...processedTransactions, ...(Array.isArray(prev) ? prev : [])])

      // Also save to localStorage immediately
      const currentTransactions = JSON.parse(localStorage.getItem('kamioi_transactions') || '[]')
      const updatedTransactions = [...processedTransactions, ...(Array.isArray(currentTransactions) ? currentTransactions : [])]
      localStorage.setItem('kamioi_transactions', JSON.stringify(updatedTransactions))

      return processedTransactions
    } catch (error) {
      console.error('Error adding transactions:', error)
      throw error
    }
  }

  const updateTransaction = async (id, transactionData) => {
    try {
      const updatedTransaction = await apiService.updateTransaction(id, transactionData)
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t))
      return updatedTransaction
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  }

  const deleteTransaction = async (id) => {
    try {
      await apiService.deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }

  const addGoal = async (goalData) => {
    try {
      const newGoal = await apiService.createGoal(goalData)
      setGoals(prev => [...prev, newGoal])
      return newGoal
    } catch (error) {
      console.error('Error adding goal:', error)
      throw error
    }
  }

  const updateGoal = async (id, goalData) => {
    try {
      const updatedGoal = await apiService.updateGoal(id, goalData)
      setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g))
      return updatedGoal
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  }

  const deleteGoal = async (id) => {
    try {
      await apiService.deleteGoal(id)
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }

  const processRoundUp = async (amount, merchant, ticker) => {
    try {
      const result = await apiService.processRoundUp(amount, merchant, ticker)
      setTotalRoundUps(prev => prev + amount)
      return result
    } catch (error) {
      console.error('Error processing round-up:', error)
      throw error
    }
  }

  const refreshData = async () => {
    await loadDataFromAPI()
  }

  const loadDataAfterAuth = async () => {
    // Load data after successful authentication
    await loadDataFromAPI()
  }

  const clearAllData = () => {
    setTransactions([])
    setHoldings([])
    setGoals([])
    setRecommendations([])
    setNotifications([])
    setPortfolioValue(0)
    setTotalRoundUps(0)
    setTotalFeesPaid(0)
    setAdminReports([])

    // Clear ALL localStorage items
    localStorage.clear()

    // Also clear sessionStorage
    sessionStorage.clear()

    // Reload data from API to ensure consistency
    loadDataFromAPI()
  }

  // Utility functions
  const mapMerchantToTicker = () => {
    // This function should query the LLM Mapping database instead of using hardcoded mappings
    // For now, return null to indicate no mapping available
    // The LLM Center should handle merchant-to-ticker mapping through the database
    return null
  }

  const getStockPrice = () => {
    // This function should query real-time stock prices from a financial API
    // For now, return 0 to indicate no price data available
    // Real stock prices should be fetched from external APIs like Alpha Vantage, Yahoo Finance, etc.
    return 0
  }

  const getCompanyName = (ticker) => {
    // This function should query company names from a financial data API
    // For now, return a generic name to indicate no company data available
    // Real company names should be fetched from external APIs or financial databases
    return `${ticker} Corporation`
  }

  const value = {
    // State
    transactions,
    holdings,
    goals,
    recommendations,
    notifications,
    portfolioValue,
    totalRoundUps,
    totalFeesPaid,
    adminReports,
    isLoading,
    error,
    hasLoaded,

    // Actions
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    processRoundUp,
    refreshData,
    loadDataAfterAuth,
    clearAllData,
    clearAllLocalStorage,
    setTransactions,

    // Utility functions
    mapMerchantToTicker,
    getStockPrice,
    getCompanyName
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export default DataContext
