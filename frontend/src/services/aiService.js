/**
 * AI Service for Kamioi Platform
 * Handles AI-powered features and integrations
 */

class AIService {
  constructor() {
    this.baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111') + '/api'
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
  }

  /**
   * Get AI service status
   */
  async getAIStatus() {
    try {
      const response = await fetch(`${this.baseURL}/ai/status`)
      return await response.json()
    } catch (error) {
      console.error('AI status error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get AI recommendations for user
   */
  async getRecommendations(userId, context = {}) {
    try {
      const response = await fetch(`${this.baseURL}/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, context })
      })
      return await response.json()
    } catch (error) {
      console.error('AI recommendations error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get AI insights for portfolio
   */
  async getPortfolioInsights(portfolioData) {
    try {
      const response = await fetch(`${this.baseURL}/ai/portfolio-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(portfolioData)
      })
      return await response.json()
    } catch (error) {
      console.error('AI portfolio insights error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Map merchant to stock ticker using AI
   */
  async mapMerchantToTicker(merchant, transactionData = {}) {
    try {
      const response = await fetch(`${this.baseURL}/ai/map-merchant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ merchant, transactionData })
      })
      return await response.json()
    } catch (error) {
      console.error('AI merchant mapping error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get AI-powered investment advice
   */
  async getInvestmentAdvice(userProfile, marketData) {
    try {
      const response = await fetch(`${this.baseURL}/ai/investment-advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userProfile, marketData })
      })
      return await response.json()
    } catch (error) {
      console.error('AI investment advice error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Analyze transaction patterns
   */
  async analyzeTransactionPatterns(transactions) {
    try {
      const response = await fetch(`${this.baseURL}/ai/analyze-patterns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactions })
      })
      return await response.json()
    } catch (error) {
      console.error('AI pattern analysis error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get risk assessment
   */
  async getRiskAssessment(portfolio, userProfile) {
    try {
      const response = await fetch(`${this.baseURL}/ai/risk-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ portfolio, userProfile })
      })
      return await response.json()
    } catch (error) {
      console.error('AI risk assessment error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Generate personalized insights
   */
  async generateInsights(userId, dataType, data) {
    try {
      const response = await fetch(`${this.baseURL}/ai/generate-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, dataType, data })
      })
      return await response.json()
    } catch (error) {
      console.error('AI insights generation error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get market sentiment analysis
   */
  async getMarketSentiment(symbols) {
    try {
      const response = await fetch(`${this.baseURL}/ai/market-sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbols })
      })
      return await response.json()
    } catch (error) {
      console.error('AI market sentiment error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get AI-powered notifications
   */
  async getAINotifications(userId) {
    try {
      const response = await fetch(`${this.baseURL}/ai/notifications/${userId}`)
      return await response.json()
    } catch (error) {
      console.error('AI notifications error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Process natural language queries
   */
  async processNaturalLanguageQuery(query, context = {}) {
    try {
      const response = await fetch(`${this.baseURL}/ai/natural-language`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, context })
      })
      return await response.json()
    } catch (error) {
      console.error('AI natural language error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get AI model performance metrics
   */
  async getModelPerformance() {
    try {
      const response = await fetch(`${this.baseURL}/ai/model-performance`)
      return await response.json()
    } catch (error) {
      console.error('AI model performance error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Train AI model with new data
   */
  async trainModel(trainingData) {
    try {
      const response = await fetch(`${this.baseURL}/ai/train-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trainingData)
      })
      return await response.json()
    } catch (error) {
      console.error('AI model training error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get AI configuration
   */
  async getAIConfiguration() {
    try {
      const response = await fetch(`${this.baseURL}/ai/configuration`)
      return await response.json()
    } catch (error) {
      console.error('AI configuration error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Update AI configuration
   */
  async updateAIConfiguration(config) {
    try {
      const response = await fetch(`${this.baseURL}/ai/configuration`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })
      return await response.json()
    } catch (error) {
      console.error('AI configuration update error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Get AI usage statistics
   */
  async getAIUsageStats() {
    try {
      const response = await fetch(`${this.baseURL}/ai/usage-stats`)
      return await response.json()
    } catch (error) {
      console.error('AI usage stats error:', error)
      return { status: 'error', message: error.message }
    }
  }

  /**
   * Test AI service connectivity
   */
  async testAIConnectivity() {
    try {
      const response = await fetch(`${this.baseURL}/ai/test`)
      return await response.json()
    } catch (error) {
      console.error('AI connectivity test error:', error)
      return { status: 'error', message: error.message }
    }
  }
}

// Create singleton instance
const aiService = new AIService()

export default aiService
