// Authentication API
// This service handles all authentication-related API calls

// Ready for backend connection
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'

class AuthAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/auth`
  }

  // Helper method for making API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    // Add authorization header if token exists (for authenticated requests)
    const token = localStorage.getItem('authToken')
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`
    }

    const config = { ...defaultOptions, ...options }
    
    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Auth API request failed:', error)
      throw error
    }
  }

  // User Registration
  async register(userData) {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  // User Login
  async login(credentials) {
    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  // User Logout
  async logout() {
    return this.makeRequest('/logout', {
      method: 'POST'
    })
  }

  // Get current user profile
  async getProfile() {
    return this.makeRequest('/profile')
  }

  // Update user profile
  async updateProfile(profileData) {
    return this.makeRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  // Change password
  async changePassword(passwordData) {
    return this.makeRequest('/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    })
  }

  // Verify token
  async verifyToken() {
    return this.makeRequest('/verify')
  }

  // Password Reset
  async requestPasswordReset(email) {
    return this.makeRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async resetPassword(resetData) {
    return this.makeRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData)
    })
  }

  // Email Verification
  async requestEmailVerification() {
    return this.makeRequest('/verify-email', {
      method: 'POST'
    })
  }

  async verifyEmail(verificationData) {
    return this.makeRequest('/verify-email', {
      method: 'PUT',
      body: JSON.stringify(verificationData)
    })
  }

  // Two-Factor Authentication
  async enableTwoFactor() {
    return this.makeRequest('/2fa/enable', {
      method: 'POST'
    })
  }

  async disableTwoFactor(code) {
    return this.makeRequest('/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  async verifyTwoFactor(code) {
    return this.makeRequest('/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  async getTwoFactorStatus() {
    return this.makeRequest('/2fa/status')
  }

  // Session Management
  async refreshToken() {
    return this.makeRequest('/refresh', {
      method: 'POST'
    })
  }

  async revokeToken() {
    return this.makeRequest('/revoke', {
      method: 'POST'
    })
  }

  async getActiveSessions() {
    return this.makeRequest('/sessions')
  }

  async terminateSession(sessionId) {
    return this.makeRequest(`/sessions/${sessionId}`, {
      method: 'DELETE'
    })
  }

  async terminateAllSessions() {
    return this.makeRequest('/sessions/terminate-all', {
      method: 'POST'
    })
  }

  // Account Security
  async getSecuritySettings() {
    return this.makeRequest('/security/settings')
  }

  async updateSecuritySettings(settings) {
    return this.makeRequest('/security/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async getLoginHistory() {
    return this.makeRequest('/security/login-history')
  }

  async getSecurityAlerts() {
    return this.makeRequest('/security/alerts')
  }

  async markSecurityAlertAsRead(alertId) {
    return this.makeRequest(`/security/alerts/${alertId}/read`, {
      method: 'PUT'
    })
  }

  // Account Deactivation
  async requestAccountDeactivation() {
    return this.makeRequest('/deactivate/request', {
      method: 'POST'
    })
  }

  async confirmAccountDeactivation(confirmationData) {
    return this.makeRequest('/deactivate/confirm', {
      method: 'POST',
      body: JSON.stringify(confirmationData)
    })
  }

  async cancelAccountDeactivation() {
    return this.makeRequest('/deactivate/cancel', {
      method: 'POST'
    })
  }

  // Social Authentication
  async loginWithGoogle(googleToken) {
    return this.makeRequest('/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken })
    })
  }

  async loginWithFacebook(facebookToken) {
    return this.makeRequest('/facebook', {
      method: 'POST',
      body: JSON.stringify({ token: facebookToken })
    })
  }

  async loginWithApple(appleToken) {
    return this.makeRequest('/apple', {
      method: 'POST',
      body: JSON.stringify({ token: appleToken })
    })
  }

  // Account Linking
  async linkSocialAccount(provider, token) {
    return this.makeRequest(`/link/${provider}`, {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }

  async unlinkSocialAccount(provider) {
    return this.makeRequest(`/unlink/${provider}`, {
      method: 'DELETE'
    })
  }

  async getLinkedAccounts() {
    return this.makeRequest('/linked-accounts')
  }

  // Device Management
  async getTrustedDevices() {
    return this.makeRequest('/devices')
  }

  async addTrustedDevice(deviceData) {
    return this.makeRequest('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData)
    })
  }

  async removeTrustedDevice(deviceId) {
    return this.makeRequest(`/devices/${deviceId}`, {
      method: 'DELETE'
    })
  }

  async markDeviceAsTrusted(deviceId) {
    return this.makeRequest(`/devices/${deviceId}/trust`, {
      method: 'PUT'
    })
  }

  // Privacy Settings
  async getPrivacySettings() {
    return this.makeRequest('/privacy/settings')
  }

  async updatePrivacySettings(settings) {
    return this.makeRequest('/privacy/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async requestDataExport() {
    return this.makeRequest('/privacy/export', {
      method: 'POST'
    })
  }

  async requestDataDeletion() {
    return this.makeRequest('/privacy/delete', {
      method: 'POST'
    })
  }

  // Account Recovery
  async requestAccountRecovery(email) {
    return this.makeRequest('/recovery/request', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async verifyRecoveryCode(code) {
    return this.makeRequest('/recovery/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  async recoverAccount(recoveryData) {
    return this.makeRequest('/recovery/account', {
      method: 'POST',
      body: JSON.stringify(recoveryData)
    })
  }

  // API Key Management
  async getAPIKeys() {
    return this.makeRequest('/api-keys')
  }

  async createAPIKey(keyData) {
    return this.makeRequest('/api-keys', {
      method: 'POST',
      body: JSON.stringify(keyData)
    })
  }

  async revokeAPIKey(keyId) {
    return this.makeRequest(`/api-keys/${keyId}`, {
      method: 'DELETE'
    })
  }

  async regenerateAPIKey(keyId) {
    return this.makeRequest(`/api-keys/${keyId}/regenerate`, {
      method: 'POST'
    })
  }

  // Utility methods
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }

  getAuthToken() {
    return localStorage.getItem('authToken')
  }

  clearAuthData() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('kamioi_user')
  }

  isAuthenticated() {
    return !!this.getAuthToken()
  }
}

export default new AuthAPI()
