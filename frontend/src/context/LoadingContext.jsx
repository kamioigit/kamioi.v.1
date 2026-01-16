/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'

const LoadingContext = createContext()

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  const startLoading = (message = 'Loading...') => {
    setLoading(true)
    setLoadingMessage(message)
  }

  const stopLoading = () => {
    setLoading(false)
    setLoadingMessage('')
  }

  const value = {
    loading,
    loadingMessage,
    startLoading,
    stopLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}


