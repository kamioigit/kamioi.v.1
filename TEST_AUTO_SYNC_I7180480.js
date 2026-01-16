/**
 * TEST SCRIPT: Auto Sync → LLM Mapping Flow Test
 * User ID: I7180480
 * 
 * Run this script in browser console on User Dashboard or LLM Center
 * This will simulate the auto sync process and trigger LLM mapping
 */

const USER_ID = 'I7180480';
const API_BASE = 'http://127.0.0.1:5111';

// Sample transaction data that will trigger LLM mapping
const sampleTransactions = [
  {
    user_id: USER_ID,
    merchant_name: 'WALMART',
    amount: -45.67,
    description: 'WALMART SUPERCENTER #1234',
    category: 'groceries',
    date: new Date().toISOString(),
    account_id: 'ACC_001',
    transaction_type: 'purchase',
    status: 'pending_mapping'
  },
  {
    user_id: USER_ID,
    merchant_name: 'STARBUCKS',
    amount: -12.45,
    description: 'STARBUCKS STORE #1234',
    category: 'food',
    date: new Date().toISOString(),
    account_id: 'ACC_001',
    transaction_type: 'purchase',
    status: 'pending_mapping'
  },
  {
    user_id: USER_ID,
    merchant_name: 'AMAZON',
    amount: -234.56,
    description: 'AMAZON.COM PURCHASE',
    category: 'shopping',
    date: new Date().toISOString(),
    account_id: 'ACC_001',
    transaction_type: 'purchase',
    status: 'pending_mapping'
  },
  {
    user_id: USER_ID,
    merchant_name: 'APPLE STORE',
    amount: -1299.99,
    description: 'APPLE STORE ONLINE',
    category: 'electronics',
    date: new Date().toISOString(),
    account_id: 'ACC_001',
    transaction_type: 'purchase',
    status: 'pending_mapping'
  },
  {
    user_id: USER_ID,
    merchant_name: 'NETFLIX',
    amount: -15.99,
    description: 'NETFLIX.COM',
    category: 'subscription',
    date: new Date().toISOString(),
    account_id: 'ACC_001',
    transaction_type: 'subscription',
    status: 'pending_mapping'
  }
];

/**
 * Step 1: Add transactions for user I7180480
 */
async function addTestTransactions() {
  console.log('🔄 Step 1: Adding test transactions for user', USER_ID);
  
  const token = localStorage.getItem('kamioi_user_token') || 
                localStorage.getItem('authToken') || 
                prompt('Enter user auth token:');
  
  if (!token) {
    console.error('❌ No authentication token found!');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/user/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: USER_ID,
        transactions: sampleTransactions
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Transactions added successfully:', data);
      console.log('📊 Added transactions:', sampleTransactions.length);
      return data.transactions || data.data || [];
    } else {
      console.error('❌ Failed to add transactions:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error adding transactions:', error);
    return null;
  }
}

/**
 * Step 2: Trigger LLM processing
 */
async function triggerLLMProcessing() {
  console.log('🧠 Step 2: Triggering LLM processing...');
  
  const token = localStorage.getItem('kamioi_admin_token') || 
                localStorage.getItem('authToken') || 
                prompt('Enter admin auth token:');
  
  if (!token) {
    console.error('❌ No admin token found!');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/ai/process-queue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ LLM processing started:', data);
      console.log('📊 Processing results:', {
        processed: data.data?.processed_count || 0,
        auto_approved: data.data?.auto_approved || 0,
        review_required: data.data?.review_required || 0,
        rejected: data.data?.rejected || 0
      });
      return data;
    } else {
      console.error('❌ Failed to start LLM processing:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error starting LLM processing:', error);
    return null;
  }
}

/**
 * Step 3: Check pending mappings
 */
async function checkPendingMappings() {
  console.log('🔍 Step 3: Checking pending mappings...');
  
  const token = localStorage.getItem('kamioi_admin_token') || 
                localStorage.getItem('authToken') || 
                prompt('Enter admin auth token:');
  
  if (!token) {
    console.error('❌ No admin token found!');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/llm-center/mappings?status=pending&user_id=${USER_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Pending mappings found:', data.data?.mappings?.length || 0);
      console.log('📊 Mappings:', data.data?.mappings || []);
      return data.data?.mappings || [];
    } else {
      console.error('❌ Failed to fetch mappings:', data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching mappings:', error);
    return [];
  }
}

/**
 * Step 4: Monitor LLM Center metrics
 */
async function monitorLLMCenter() {
  console.log('📊 Step 4: Monitoring LLM Center metrics...');
  
  const token = localStorage.getItem('kamioi_admin_token') || 
                localStorage.getItem('authToken') || 
                prompt('Enter admin auth token:');
  
  if (!token) {
    console.error('❌ No admin token found!');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/llm-center/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const analytics = data.data?.analytics || {};
      const mappings = data.data?.mappings || {};
      
      console.log('✅ LLM Center Dashboard Data:');
      console.log('📊 Analytics:', {
        totalMappings: analytics.totalMappings?.toLocaleString(),
        dailyProcessed: analytics.dailyProcessed?.toLocaleString(),
        accuracyRate: analytics.accuracyRate?.toFixed(2) + '%',
        autoApprovalRate: analytics.autoApprovalRate?.toFixed(2) + '%'
      });
      console.log('📊 Mappings:', {
        pending: mappings.pending?.length || 0,
        approved: mappings.approved?.length || 0,
        rejected: mappings.rejected?.length || 0
      });
      
      return data.data;
    } else {
      console.error('❌ Failed to fetch LLM Center data:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching LLM Center data:', error);
    return null;
  }
}

/**
 * Complete test flow
 */
async function runCompleteTest() {
  console.log('🚀 Starting Auto Sync → LLM Mapping Test for User', USER_ID);
  console.log('='.repeat(60));
  
  // Step 1: Add transactions
  const transactions = await addTestTransactions();
  if (!transactions) {
    console.error('❌ Test failed at Step 1');
    return;
  }
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Trigger LLM processing
  const processingResult = await triggerLLMProcessing();
  if (!processingResult) {
    console.error('❌ Test failed at Step 2');
    return;
  }
  
  // Wait 3 seconds for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 3: Check mappings
  const mappings = await checkPendingMappings();
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 4: Monitor LLM Center
  const dashboardData = await monitorLLMCenter();
  
  console.log('='.repeat(60));
  console.log('✅ Test Complete!');
  console.log('📊 Summary:');
  console.log('  - Transactions added:', transactions.length);
  console.log('  - Mappings created:', mappings.length);
  console.log('  - Auto-approved:', processingResult.data?.auto_approved || 0);
  console.log('  - Review required:', processingResult.data?.review_required || 0);
  console.log('');
  console.log('👀 Next Steps:');
  console.log('  1. Go to LLM Center Flow tab');
  console.log('  2. Watch Real-Time Processing metrics update');
  console.log('  3. Check Pending Mappings tab for new entries');
  console.log('  4. Verify metrics reflect new transactions');
}

// Export functions for manual use
window.testAutoSync = {
  addTransactions: addTestTransactions,
  processLLM: triggerLLMProcessing,
  checkMappings: checkPendingMappings,
  monitorCenter: monitorLLMCenter,
  runComplete: runCompleteTest
};

console.log('✅ Test script loaded!');
console.log('📝 Available functions:');
console.log('  - window.testAutoSync.runComplete() - Run full test');
console.log('  - window.testAutoSync.addTransactions() - Add test transactions');
console.log('  - window.testAutoSync.processLLM() - Trigger LLM processing');
console.log('  - window.testAutoSync.checkMappings() - Check pending mappings');
console.log('  - window.testAutoSync.monitorCenter() - Monitor LLM Center');




