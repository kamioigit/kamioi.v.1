// Debug utility to manually set user token for testing
export const setDebugUserToken = () => {
  // Set the correct token for beltranalain@gmail.com
  const correctToken = 'user_token_1760806059546';
  localStorage.setItem('kamioi_user_token', correctToken);
  console.log('🔧 Debug: Set user token to:', correctToken);
  
  // Also clear any admin token to ensure user mode
  localStorage.removeItem('kamioi_admin_token');
  console.log('🔧 Debug: Cleared admin token');
  
  // Reload the page to trigger data loading
  window.location.reload();
};

// Make it available globally for console debugging
window.setDebugUserToken = setDebugUserToken;
