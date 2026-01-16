// Request Deduplication Service
// Prevents duplicate API calls when multiple components request the same data

class RequestDeduplicationService {
  constructor() {
    this.pendingRequests = new Map() // URL -> Promise
    this.cache = new Map() // URL -> { data, timestamp, ttl }
    this.defaultTTL = 5000 // 5 seconds default cache
  }

  /**
   * Deduplicate fetch requests - if same URL is already fetching, return existing promise
   * @param {string} url - API endpoint URL
   * @param {object} options - Fetch options (headers, signal, etc.)
   * @param {number} ttl - Cache TTL in milliseconds (default: 5000ms)
   * @returns {Promise<Response>}
   */
  async fetch(url, options = {}, ttl = this.defaultTTL) {
    const cacheKey = `${url}:${JSON.stringify(options.headers || {})}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`📦 RequestDeduplication - Cache hit: ${url}`)
      // Return cached response (clone it since Response can only be read once)
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`🔄 RequestDeduplication - Deduplicating: ${url}`)
      return this.pendingRequests.get(cacheKey)
    }
    
    // Create new request
    const requestPromise = fetch(url, options)
      .then(async (response) => {
        // Clone response so we can read it multiple times
        const clonedResponse = response.clone()
        
        // Cache successful responses
        if (response.ok) {
          try {
            const data = await response.json()
            this.cache.set(cacheKey, {
              data,
              timestamp: Date.now(),
              ttl
            })
            
            // Clean up cache after TTL expires
            setTimeout(() => {
              this.cache.delete(cacheKey)
            }, ttl)
          } catch (e) {
            // Not JSON, don't cache
          }
        }
        
        // Remove from pending
        this.pendingRequests.delete(cacheKey)
        
        return clonedResponse
      })
      .catch((error) => {
        // Remove from pending on error
        this.pendingRequests.delete(cacheKey)
        throw error
      })
    
    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise)
    
    return requestPromise
  }

  /**
   * Clear cache for a specific URL pattern
   * @param {string} pattern - URL pattern to match (or exact URL)
   */
  clearCache(pattern = null) {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
      for (const [key] of this.pendingRequests) {
        if (key.includes(pattern)) {
          this.pendingRequests.delete(key)
        }
      }
    } else {
      this.cache.clear()
      this.pendingRequests.clear()
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cachedRequests: this.cache.size,
      pendingRequests: this.pendingRequests.size
    }
  }
}

// Export singleton instance
const requestDeduplication = new RequestDeduplicationService()
export default requestDeduplication

