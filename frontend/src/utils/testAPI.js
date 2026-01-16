// Test utility to verify API calls
export const testUserTransactionsAPI = async () => {
  try {
    console.log('🧪 Testing User Transactions API...');
    
    // Test direct fetch
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
    const response = await fetch(`${apiBaseUrl}/api/user/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer user_token_1760806059546`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('🧪 Direct fetch result:', {
      success: data.success,
      transactionsCount: data.transactions?.length || 0,
      hasTransactions: !!data.transactions,
      sampleTransaction: data.transactions?.[0]
    });
    
    return data;
  } catch (error) {
    console.error('🧪 API test failed:', error);
    return null;
  }
};

// Make it available globally
window.testUserTransactionsAPI = testUserTransactionsAPI;
