/**
 * Centralized API Configuration
 * 
 * This file provides a single source of truth for API base URL.
 * All components should use this instead of hardcoding URLs.
 * 
 * Usage:
 *   import { API_BASE_URL } from '../utils/apiConfig'
 *   fetch(`${API_BASE_URL}/api/endpoint`)
 */

// Get API base URL from environment variable, with fallback
// Use empty string in development to leverage Vite proxy (routes /api to backend)
// In production, set VITE_API_BASE_URL to your backend URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:5111')

// Helper function to build full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_BASE_URL}${cleanEndpoint}`
}

// Export for backward compatibility
export default API_BASE_URL

