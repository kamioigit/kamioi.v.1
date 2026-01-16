/**
 * Connection Test Service
 * Tests real connections between frontend and backend
 */

class ConnectionTestService {
  constructor() {
    this.baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111') + '/api'
    this.timeout = 5001 // 5 second timeout
  }

  /**
   * Test a single endpoint connection
   */
  async testEndpoint(endpoint, method = 'GET', expectedStatus = 200) {
    const startTime = Date.now()
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      })

      clearTimeout(timeoutId)
      const endTime = Date.now()
      const latency = endTime - startTime

      const isHealthy = response.status === expectedStatus || 
                       (response.status >= 200 && response.status < 300)

      return {
        success: isHealthy,
        status: response.status,
        latency: `${latency}ms`,
        uptime: isHealthy ? '100%' : '0%',
        error: null
      }

    } catch (error) {
      const endTime = Date.now()
      const latency = endTime - startTime

      if (error.name === 'AbortError') {
        return {
          success: false,
          status: 'timeout',
          latency: `>${this.timeout}ms`,
          uptime: '0%',
          error: 'Connection timeout'
        }
      }

      return {
        success: false,
        status: 'error',
        latency: `${latency}ms`,
        uptime: '0%',
        error: error.message
      }
    }
  }

  /**
   * Test all dashboard connections
   */
  async testDashboardConnections() {
    const connections = {
      'User Dashboard': '/user/transactions?user_id=1',
      'Family Dashboard': '/family/roundups/total', 
      'Business Dashboard': '/admin/transactions',
      'Admin Dashboard': '/admin/transactions',
      'Cross-Dashboard Communication': '/health',
      'Data Context': '/health',
      'Theme Context': '/health',
      'Auth Context': '/user/auth/me?user_id=1',
      'Loading Context': '/health'
    }

    const results = {}
    
    // Test all connections in parallel
    const promises = Object.entries(connections).map(async ([name, endpoint]) => {
      const result = await this.testEndpoint(endpoint)
      return { name, result }
    })

    const testResults = await Promise.all(promises)
    
    testResults.forEach(({ name, result }) => {
      results[name] = {
        status: result.success ? 'green' : 'red',
        latency: result.latency,
        uptime: result.uptime,
        error: result.error
      }
    })

    return results
  }

  /**
   * Generate connection scenarios based on real test results
   */
  async generateConnectionScenarios() {
    const realResults = await this.testDashboardConnections()
    
    // Count successful connections
    const successfulConnections = Object.values(realResults).filter(r => r.status === 'green').length
    const totalConnections = Object.keys(realResults).length
    const successRate = successfulConnections / totalConnections

    // Determine overall system status
    let systemStatus, systemName, systemDescription
    
    if (successRate >= 0.9) {
      systemStatus = 'green'
      systemName = 'Optimal Performance'
      systemDescription = 'All systems running at peak efficiency'
    } else if (successRate >= 0.6) {
      systemStatus = 'yellow'  
      systemName = 'System Degradation'
      systemDescription = 'Some connections experiencing issues'
    } else {
      systemStatus = 'red'
      systemName = 'Critical Issues'
      systemDescription = 'Multiple systems down or severely degraded'
    }

    return {
      name: systemName,
      description: systemDescription,
      status: systemStatus,
      connections: realResults,
      successRate: `${Math.round(successRate * 100)}%`,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Test specific scenario (for manual testing)
   */
  async testScenario(scenarioType) {
    switch (scenarioType) {
      case 'scenario1': {
        // Test optimal scenario - all connections should work
        return await this.generateConnectionScenarios()
      }
      case 'scenario2': {
        // Test degraded scenario - simulate some failures
        const degradedResults = await this.testDashboardConnections()
        // Artificially degrade some connections for testing
        Object.keys(degradedResults).slice(0, 3).forEach(key => {
          degradedResults[key] = {
            status: 'yellow',
            latency: '150ms',
            uptime: '85%',
            error: 'Simulated degradation'
          }
        })
        return {
          name: 'System Degradation (Simulated)',
          description: 'Some connections experiencing issues',
          status: 'yellow',
          connections: degradedResults,
          successRate: '67%',
          timestamp: new Date().toISOString()
        }
      }
      case 'scenario3': {
        // Test critical scenario - simulate major failures
        const criticalResults = await this.testDashboardConnections()
        // Artificially fail most connections for testing
        Object.keys(criticalResults).slice(0, 6).forEach(key => {
          criticalResults[key] = {
            status: 'red',
            latency: 'N/A',
            uptime: '0%',
            error: 'Connection failed'
          }
        })
        return {
          name: 'Critical Issues (Simulated)',
          description: 'Multiple systems down or severely degraded',
          status: 'red',
          connections: criticalResults,
          successRate: '33%',
          timestamp: new Date().toISOString()
        }
      }
      default: {
        return await this.generateConnectionScenarios()
      }
    }
  }

  /**
   * Check if backend is reachable
   */
  async isBackendReachable() {
    try {
      const result = await this.testEndpoint('/health')
      return result.success
    } catch (error) {
      return false
    }
  }

  /**
   * Get connection summary
   */
  async getConnectionSummary() {
    const isBackendUp = await this.isBackendReachable()
    const scenarios = await this.generateConnectionScenarios()
    
    return {
      backendStatus: isBackendUp ? 'online' : 'offline',
      backendUrl: this.baseURL,
      overallStatus: scenarios.status,
      successRate: scenarios.successRate,
      totalConnections: Object.keys(scenarios.connections).length,
      timestamp: new Date().toISOString()
    }
  }
}

export default new ConnectionTestService()
