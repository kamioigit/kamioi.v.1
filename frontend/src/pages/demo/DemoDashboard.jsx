import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'

const DemoDashboard = () => {
  const location = useLocation()
  const { setDemoAccountType, enableDemoMode } = useDemo()

  // Enable demo mode on mount and clear old cached data
  useEffect(() => {
    // Clear any cached transaction data to ensure fresh demo data loads
    localStorage.removeItem('kamioi_transactions')
    localStorage.removeItem('kamioi_holdings')
    localStorage.removeItem('kamioi_portfolio_value')
    localStorage.removeItem('kamioi_total_roundups')
    localStorage.removeItem('kamioi_total_fees')
    localStorage.removeItem('kamioi_goals')

    // Enable demo mode
    enableDemoMode()
  }, [])

  // Update account type based on URL
  useEffect(() => {
    const currentView = location.pathname.split('/demo/')[1] || 'user'
    if (currentView === 'user') setDemoAccountType('individual')
    else if (currentView === 'family') setDemoAccountType('family')
    else if (currentView === 'business') setDemoAccountType('business')
  }, [location.pathname, setDemoAccountType])

  // Just render the actual dashboard - no banner
  return <Outlet />
}

export default DemoDashboard
