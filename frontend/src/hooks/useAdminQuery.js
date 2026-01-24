/**
 * useAdminQuery - Shared hook for admin data fetching
 *
 * Provides consistent token handling, error states, and retry logic
 * for all admin dashboard queries.
 *
 * Features:
 * - Automatic token retrieval from localStorage
 * - Consistent error handling
 * - Retry logic with exponential backoff
 * - Loading state management
 * - Cache configuration optimized for admin workflows
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

// Get the API base URL from environment or default
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
}

// Get the admin auth token from localStorage
export const getAdminToken = () => {
  return (
    localStorage.getItem('kamioi_admin_token') ||
    localStorage.getItem('authToken') ||
    ''
  )
}

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = getAdminToken()
  return token && token.startsWith('admin_token_')
}

// Build headers for admin API requests
export const buildAdminHeaders = () => {
  const token = getAdminToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// Default fetch function for admin queries
export const adminFetch = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl()
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildAdminHeaders(),
      ...options.headers
    }
  })

  // Handle network errors
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `HTTP ${response.status}`
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.error || errorJson.message || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()

  // Handle API-level errors
  if (data.success === false) {
    throw new Error(data.error || 'API request failed')
  }

  return data
}

/**
 * useAdminQuery - React Query hook for admin data fetching
 *
 * @param {string|array} queryKey - Unique key for caching
 * @param {string} endpoint - API endpoint to fetch
 * @param {object} options - Additional options
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @param {number} options.staleTime - Time in ms before data is considered stale (default: 5 min)
 * @param {number} options.cacheTime - Time in ms to keep data in cache (default: 10 min)
 * @param {boolean} options.refetchOnWindowFocus - Refetch when window gains focus (default: false)
 * @param {number} options.retry - Number of retry attempts (default: 2)
 * @param {function} options.select - Transform the data
 * @param {function} options.onError - Error handler
 * @param {function} options.onSuccess - Success handler
 */
export const useAdminQuery = (queryKey, endpoint, options = {}) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus = false,
    retry = 2,
    retryDelay = (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select,
    onError,
    onSuccess,
    ...restOptions
  } = options

  const isAuthenticated = isAdminAuthenticated()

  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: () => adminFetch(endpoint),
    enabled: enabled && isAuthenticated,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus,
    retry,
    retryDelay,
    select,
    onError,
    onSuccess,
    ...restOptions
  })
}

/**
 * useAdminMutation - React Query hook for admin data mutations
 *
 * @param {string} endpoint - API endpoint for mutation
 * @param {object} options - Additional options
 * @param {string} options.method - HTTP method (default: 'POST')
 * @param {function} options.onSuccess - Success handler
 * @param {function} options.onError - Error handler
 * @param {array} options.invalidateKeys - Query keys to invalidate on success
 */
export const useAdminMutation = (endpoint, options = {}) => {
  const queryClient = useQueryClient()
  const {
    method = 'POST',
    onSuccess,
    onError,
    invalidateKeys = [],
    ...restOptions
  } = options

  return useMutation({
    mutationFn: async (data) => {
      return adminFetch(endpoint, {
        method,
        body: data ? JSON.stringify(data) : undefined
      })
    },
    onSuccess: (data, variables, context) => {
      // Invalidate specified query keys
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] })
      })
      // Call custom success handler
      if (onSuccess) {
        onSuccess(data, variables, context)
      }
    },
    onError,
    ...restOptions
  })
}

/**
 * useAdminPaginatedQuery - React Query hook for paginated admin data
 *
 * @param {string|array} queryKey - Unique key for caching
 * @param {string} endpoint - API endpoint (without pagination params)
 * @param {object} params - Pagination and filter params
 * @param {number} params.page - Current page (default: 1)
 * @param {number} params.perPage - Items per page (default: 50)
 * @param {object} options - Additional query options
 */
export const useAdminPaginatedQuery = (queryKey, endpoint, params = {}, options = {}) => {
  const { page = 1, perPage = 50, ...filters } = params

  // Build query string
  const queryString = useMemo(() => {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    })

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return searchParams.toString()
  }, [page, perPage, filters])

  const fullEndpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}`

  return useAdminQuery(
    [...(Array.isArray(queryKey) ? queryKey : [queryKey]), page, perPage, filters],
    fullEndpoint,
    {
      keepPreviousData: true,
      ...options
    }
  )
}

/**
 * useAdminStats - Hook for fetching admin dashboard statistics
 *
 * @param {string} endpoint - Stats endpoint
 * @param {object} options - Query options
 */
export const useAdminStats = (endpoint, options = {}) => {
  return useAdminQuery(
    ['admin-stats', endpoint],
    endpoint,
    {
      staleTime: 30 * 1000, // 30 seconds - stats should refresh more often
      ...options
    }
  )
}

/**
 * Admin API utilities object for direct use
 */
export const adminAPI = {
  baseUrl: getApiBaseUrl,
  getToken: getAdminToken,
  isAuthenticated: isAdminAuthenticated,
  buildHeaders: buildAdminHeaders,
  fetch: adminFetch,

  // Convenience methods
  get: (endpoint) => adminFetch(endpoint),
  post: (endpoint, data) => adminFetch(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => adminFetch(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => adminFetch(endpoint, { method: 'DELETE' })
}

export default useAdminQuery
