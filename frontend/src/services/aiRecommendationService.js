/**
 * AI Recommendation Service - Frontend service for User/Family/Business dashboards
 * Connects to DeepSeek v3 API via backend
 */

const aiRecommendationService = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111',
  
  /**
   * Get AI-powered investment recommendations
   * 
   * @param {Object} userData - User's financial data
   * @param {string} dashboardType - 'user', 'family', or 'business'
   * @returns {Promise<Object>} Recommendations, insights, risk analysis, opportunities
   */
  async getRecommendations(userData, dashboardType = 'user') {
    try {
      const token = localStorage.getItem('kamioi_token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('user_token')
      
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      const response = await fetch(`${this.baseURL}/api/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dashboard_type: dashboardType,
          user_data: userData
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to get recommendations')
      }
      
    } catch (error) {
      console.error('Error fetching AI recommendations:', error)
      // Return fallback recommendations
      return this.getFallbackRecommendations(userData, dashboardType)
    }
  },
  
  /**
   * Get quick recommendations with minimal data
   * 
   * @param {Object} quickData - Minimal user data
   * @param {string} dashboardType - 'user', 'family', or 'business'
   * @returns {Promise<Object>} Recommendations
   */
  async getQuickRecommendations(quickData, dashboardType = 'user') {
    try {
      const token = localStorage.getItem('kamioi_token') || 
                   localStorage.getItem('authToken')
      
      const response = await fetch(`${this.baseURL}/api/ai/recommendations/quick`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dashboard_type: dashboardType,
          ...quickData
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return result.data || this.getFallbackRecommendations({}, dashboardType)
      
    } catch (error) {
      console.error('Error fetching quick recommendations:', error)
      return this.getFallbackRecommendations({}, dashboardType)
    }
  },
  
  /**
   * Fallback recommendations if API fails
   */
  getFallbackRecommendations() {
    return {
      recommendations: [
        {
          title: 'Enable Round-Up Investments',
          description: 'Automatically invest spare change from your transactions',
          action: 'Turn on round-up feature in settings',
          priority: 'high',
          expected_impact: 'Could invest $50-100/month automatically',
          related_merchants: []
        },
        {
          title: 'Diversify Your Portfolio',
          description: 'Spread investments across different sectors and companies',
          action: 'Review current holdings and add new positions',
          priority: 'medium',
          expected_impact: 'Reduces risk and improves long-term returns',
          related_merchants: []
        }
      ],
      insights: [
        'Consider setting up automatic round-up investments',
        'Diversify your portfolio across different sectors',
        'Review your spending patterns to identify investment opportunities'
      ],
      risk_analysis: {
        current_risk_level: 'moderate',
        recommended_risk_level: 'moderate',
        reasoning: 'Balanced approach recommended for steady growth'
      },
      opportunities: [
        {
          title: 'Round-Up Investments',
          description: 'Invest spare change automatically',
          potential_value: '$50-100/month',
          effort_required: 'low'
        },
        {
          title: 'Merchant-Based Investments',
          description: 'Invest in companies you shop with',
          potential_value: '$100-200/month',
          effort_required: 'medium'
        }
      ]
    }
  }
}

export default aiRecommendationService

