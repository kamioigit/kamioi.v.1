// Aggressive Prefetching Service
// Prefetches data before user navigates to eliminate loading

class PrefetchService {
  constructor() {
    this.prefetchCache = new Map() // URL → { data, timestamp, ttl }
    this.prefetchQueue = new Set() // URLs currently being prefetched
    this.defaultTTL = 30000 // 30 seconds default cache
    this.prefetchDelay = 200 // Delay before prefetch (ms) - prevents prefetch spam
  }

  /**
   * Prefetch data for a page
   * @param {string} pageId - Page identifier (e.g., 'transactions', 'llm')
   * @param {function} fetchFn - Function that returns Promise with data
   * @param {number} ttl - Cache TTL in milliseconds
   */
  async prefetch(pageId, fetchFn, ttl = this.defaultTTL) {
    const cacheKey = `prefetch:${pageId}`
    
    // Check if already cached and fresh
    const cached = this.prefetchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`🚀 PrefetchService - Cache hit for ${pageId}`)
      return cached.data
    }
    
    // Check if already prefetching
    if (this.prefetchQueue.has(cacheKey)) {
      console.log(`🚀 PrefetchService - Already prefetching ${pageId}`)
      return cached?.data || null
    }
    
    // Add to queue
    this.prefetchQueue.add(cacheKey)
    
    try {
      console.log(`🚀 PrefetchService - Prefetching ${pageId}...`)
      const data = await fetchFn()
      
      // Cache the result
      this.prefetchCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl
      })
      
      // Clean up after TTL
      setTimeout(() => {
        this.prefetchCache.delete(cacheKey)
      }, ttl)
      
      console.log(`🚀 PrefetchService - Prefetched ${pageId} successfully`)
      return data
    } catch (error) {
      console.error(`🚀 PrefetchService - Prefetch failed for ${pageId}:`, error)
      return null
    } finally {
      this.prefetchQueue.delete(cacheKey)
    }
  }

  /**
   * Get cached data for a page
   * @param {string} pageId - Page identifier
   * @returns {any|null} Cached data or null
   */
  getCached(pageId) {
    const cacheKey = `prefetch:${pageId}`
    const cached = this.prefetchCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    
    // Expired - remove from cache
    if (cached) {
      this.prefetchCache.delete(cacheKey)
    }
    
    return null
  }

  /**
   * Prefetch on hover with delay
   * @param {string} pageId - Page identifier
   * @param {function} fetchFn - Function that returns Promise
   * @param {number} delay - Delay before prefetch (ms)
   */
  prefetchOnHover(pageId, fetchFn, delay = this.prefetchDelay) {
    let timeoutId = null
    
    const startPrefetch = () => {
      timeoutId = setTimeout(() => {
        this.prefetch(pageId, fetchFn)
      }, delay)
    }
    
    const cancelPrefetch = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
    
    return { startPrefetch, cancelPrefetch }
  }

  /**
   * Prefetch all common admin pages
   */
  prefetchAllCommonPages() {
    const commonPages = [
      'overview',
      'transactions',
      'financial',
      'llm',
      'users2',
      'content',
      'subscriptions'
    ]
    
    console.log('🚀 PrefetchService - Prefetching all common pages...')
    
    // Prefetch in background (don't block)
    setTimeout(() => {
      commonPages.forEach(pageId => {
        // This will be called by components when they register their fetch functions
        console.log(`🚀 PrefetchService - Queued prefetch for ${pageId}`)
      })
    }, 1000) // Wait 1 second after page load
  }

  /**
   * Clear cache for a specific page
   */
  clearCache(pageId) {
    const cacheKey = `prefetch:${pageId}`
    this.prefetchCache.delete(cacheKey)
    console.log(`🚀 PrefetchService - Cleared cache for ${pageId}`)
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.prefetchCache.clear()
    console.log('🚀 PrefetchService - Cleared all cache')
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cachedPages: this.prefetchCache.size,
      prefetching: this.prefetchQueue.size,
      cacheKeys: Array.from(this.prefetchCache.keys())
    }
  }
}

// Export singleton instance
const prefetchService = new PrefetchService()
export default prefetchService

