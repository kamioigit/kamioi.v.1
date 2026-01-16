// Prefetch Registry
// Maps page IDs to their data fetching functions for prefetching

import prefetchService from './prefetchService'

class PrefetchRegistry {
  constructor() {
    this.registry = new Map() // pageId → fetchFunction
  }

  /**
   * Register a fetch function for a page
   * @param {string} pageId - Page identifier
   * @param {function} fetchFn - Async function that fetches page data
   */
  register(pageId, fetchFn) {
    this.registry.set(pageId, fetchFn)
    console.log(`📋 PrefetchRegistry - Registered ${pageId}`)
  }

  /**
   * Prefetch data for a page
   * @param {string} pageId - Page identifier
   */
  async prefetch(pageId) {
    const fetchFn = this.registry.get(pageId)
    if (!fetchFn) {
      console.warn(`📋 PrefetchRegistry - No fetch function registered for ${pageId}`)
      return null
    }

    return prefetchService.prefetch(pageId, fetchFn)
  }

  /**
   * Get cached data for a page
   * @param {string} pageId - Page identifier
   */
  getCached(pageId) {
    return prefetchService.getCached(pageId)
  }

  /**
   * Prefetch all registered pages
   */
  prefetchAll() {
    console.log('📋 PrefetchRegistry - Prefetching all registered pages...')
    this.registry.forEach((fetchFn, pageId) => {
      // Prefetch in background (don't await)
      setTimeout(() => {
        prefetchService.prefetch(pageId, fetchFn)
      }, Math.random() * 1000) // Stagger requests
    })
  }

  /**
   * Prefetch common pages (most frequently accessed)
   */
  prefetchCommon() {
    const commonPages = ['overview', 'transactions', 'financial', 'llm', 'users2']
    commonPages.forEach(pageId => {
      const fetchFn = this.registry.get(pageId)
      if (fetchFn) {
        setTimeout(() => {
          prefetchService.prefetch(pageId, fetchFn)
        }, Math.random() * 500)
      }
    })
  }
}

// Export singleton
const prefetchRegistry = new PrefetchRegistry()
export default prefetchRegistry

