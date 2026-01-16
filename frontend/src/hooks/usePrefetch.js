// React Hook for Prefetching
// Makes it easy for components to prefetch and use cached data

import { useCallback, useEffect, useRef, useState } from 'react'
import prefetchService from '../services/prefetchService'

/**
 * Hook for prefetching data and showing cached data immediately
 * @param {string} pageId - Unique identifier for this page
 * @param {function} fetchFn - Async function that fetches data
 * @param {object} options - Options { ttl, prefetchOnMount, prefetchOnHover }
 */
export const usePrefetch = (pageId, fetchFn, options = {}) => {
  const {
    ttl = 30000, // 30 seconds
    prefetchOnMount = true,
    prefetchOnHover = false,
    showCachedFirst = true
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchRef = useRef(false)

  // Check cache first
  useEffect(() => {
    if (showCachedFirst) {
      const cached = prefetchService.getCached(pageId)
      if (cached) {
        console.log(`🚀 usePrefetch - Using cached data for ${pageId}`)
        setData(cached)
        setLoading(false)
        fetchRef.current = true // Mark as loaded
      }
    }
  }, [pageId, showCachedFirst])

  // Fetch data
  const fetchData = useCallback(async (isPrefetch = false) => {
    // If we already have cached data and this is a prefetch, skip
    if (isPrefetch && data && !prefetchService.getCached(pageId)) {
      return
    }

    try {
      if (!isPrefetch) {
        setLoading(true)
        setError(null)
      }

      const result = await fetchFn()
      
      // Cache the result
      prefetchService.prefetch(pageId, async () => result, ttl)
      
      if (!isPrefetch) {
        setData(result)
        setLoading(false)
        fetchRef.current = true
      }
    } catch (err) {
      if (!isPrefetch) {
        setError(err)
        setLoading(false)
      }
      console.error(`usePrefetch - Error fetching ${pageId}:`, err)
    }
  }, [data, fetchFn, pageId, ttl])

  // Prefetch on mount
  useEffect(() => {
    if (prefetchOnMount && !fetchRef.current) {
      // If we have cached data, still prefetch in background to update cache
      const cached = prefetchService.getCached(pageId)
      if (cached) {
        // Fetch in background to update cache
        fetchData(true)
      } else {
        // No cache, fetch normally
        fetchData(false)
      }
    }
  }, [pageId, prefetchOnMount, fetchData])

  // Prefetch on hover
  const hoverHandlers = prefetchOnHover
    ? prefetchService.prefetchOnHover(pageId, () => fetchFn(), 200)
    : null

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(false),
    prefetch: () => fetchData(true),
    hoverHandlers
  }
}

/**
 * Hook for prefetching on hover
 */
export const usePrefetchOnHover = (pageId, fetchFn, delay = 200) => {
  return prefetchService.prefetchOnHover(pageId, fetchFn, delay)
}

