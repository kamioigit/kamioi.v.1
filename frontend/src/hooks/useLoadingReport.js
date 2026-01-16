import { useState, useCallback } from 'react'

const useLoadingReport = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [loadingItems, setLoadingItems] = useState([])

  const startLoading = useCallback((items) => {
    setIsVisible(true)
    setLoadingItems(items.map(item => ({
      ...item,
      status: 'pending',
      duration: null
    })))
  }, [])

  const updateItemStatus = useCallback((itemName, status, duration = null) => {
    setLoadingItems(prev => prev.map(item => 
      item.name === itemName 
        ? { ...item, status, duration }
        : item
    ))
  }, [])

  const completeLoading = useCallback(() => {
    // Mark any remaining pending items as completed
    setLoadingItems(prev => prev.map(item => 
      item.status === 'pending' 
        ? { ...item, status: 'success', duration: 0 }
        : item
    ))
  }, [])

  const closeLoading = useCallback(() => {
    setIsVisible(false)
    setLoadingItems([])
  }, [])

  const addLoadingItem = useCallback((item) => {
    setLoadingItems(prev => [...prev, {
      ...item,
      status: 'pending',
      duration: null
    }])
  }, [])

  const removeLoadingItem = useCallback((itemName) => {
    setLoadingItems(prev => prev.filter(item => item.name !== itemName))
  }, [])

  return {
    isVisible,
    loadingItems,
    startLoading,
    updateItemStatus,
    completeLoading,
    closeLoading,
    addLoadingItem,
    removeLoadingItem
  }
}

export default useLoadingReport



