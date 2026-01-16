import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ensure admin fetch requests include the admin token when available.
const originalFetch = window.fetch.bind(window)
window.fetch = (input, init = {}) => {
  const request = input instanceof Request ? input : null
  const url = request ? request.url : input
  const isAdminRequest = typeof url === 'string' && url.includes('/api/admin')

  if (!isAdminRequest) {
    return originalFetch(input, init)
  }

  const adminToken = localStorage.getItem('kamioi_admin_token')
  if (!adminToken) {
    return originalFetch(input, init)
  }

  const headers = new Headers(request ? request.headers : undefined)
  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value))
  }
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${adminToken}`)
  }

  const mergedInit = { ...init, headers }
  if (request) {
    return originalFetch(new Request(request, mergedInit))
  }

  return originalFetch(url, mergedInit)
}

// StrictMode disabled to prevent double-rendering in development
// This was causing all useEffect hooks to run twice, doubling API calls
// Re-enable when ready for production testing
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)


