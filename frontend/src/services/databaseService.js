/**
 * Database Service for Kamioi Platform
 * Handles database operations and data persistence
 */

class DatabaseService {
  constructor() {
    this.baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111') + '/api'
  }

  /**
   * Get database connection status
   */
  async getConnectionStatus() {
    try {
      const response = await fetch(`${this.baseURL}/database/status`)
      return await response.json()
    } catch (error) {
      console.error('Database connection error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const response = await fetch(`${this.baseURL}/database/stats`)
      return await response.json()
    } catch (error) {
      console.error('Database stats error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get database schema
   */
  async getDatabaseSchema() {
    try {
      const response = await fetch(`${this.baseURL}/database/schema`)
      return await response.json()
    } catch (error) {
      console.error('Database schema error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Backup database
   */
  async backupDatabase() {
    try {
      const response = await fetch(`${this.baseURL}/database/backup`, {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      console.error('Database backup error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Restore database
   */
  async restoreDatabase(backupData) {
    try {
      const response = await fetch(`${this.baseURL}/database/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backupData)
      })
      return await response.json()
    } catch (error) {
      console.error('Database restore error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Optimize database
   */
  async optimizeDatabase() {
    try {
      const response = await fetch(`${this.baseURL}/database/optimize`, {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      console.error('Database optimization error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get table information
   */
  async getTableInfo(tableName) {
    try {
      const response = await fetch(`${this.baseURL}/database/table/${tableName}`)
      return await response.json()
    } catch (error) {
      console.error('Table info error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Execute custom query
   */
  async executeQuery(query) {
    try {
      const response = await fetch(`${this.baseURL}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })
      return await response.json()
    } catch (error) {
      console.error('Query execution error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get data quality metrics
   */
  async getDataQuality() {
    try {
      const response = await fetch(`${this.baseURL}/database/data-quality`)
      return await response.json()
    } catch (error) {
      console.error('Data quality error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/database/performance`)
      return await response.json()
    } catch (error) {
      console.error('Performance metrics error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get connectivity matrix
   */
  async getConnectivityMatrix() {
    try {
      const response = await fetch(`${this.baseURL}/database/connectivity-matrix`)
      return await response.json()
    } catch (error) {
      console.error('Connectivity matrix error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get schema catalog
   */
  async getSchemaCatalog() {
    try {
      const response = await fetch(`${this.baseURL}/database/schema-catalog`)
      return await response.json()
    } catch (error) {
      console.error('Schema catalog error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Migrate database
   */
  async migrateDatabase(version) {
    try {
      const response = await fetch(`${this.baseURL}/database/migrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ version })
      })
      return await response.json()
    } catch (error) {
      console.error('Database migration error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus() {
    try {
      const response = await fetch(`${this.baseURL}/database/migration-status`)
      return await response.json()
    } catch (error) {
      console.error('Migration status error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Validate database integrity
   */
  async validateIntegrity() {
    try {
      const response = await fetch(`${this.baseURL}/database/validate`, {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      console.error('Database validation error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get database logs
   */
  async getDatabaseLogs(limit = 100) {
    try {
      const response = await fetch(`${this.baseURL}/database/logs?limit=${limit}`)
      return await response.json()
    } catch (error) {
      console.error('Database logs error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Clear database cache
   */
  async clearCache() {
    try {
      const response = await fetch(`${this.baseURL}/database/clear-cache`, {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      console.error('Cache clear error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get database health
   */
  async getDatabaseHealth() {
    try {
      const response = await fetch(`${this.baseURL}/database/health`)
      return await response.json()
    } catch (error) {
      console.error('Database health error:', error)
      return { status: 'error', message: error.message }
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService()

export default databaseService
