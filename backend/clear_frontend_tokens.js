// Clear Frontend Tokens Script
// Run this in the browser console to clear old tokens

console.log('🧹 Clearing old admin tokens...');

// Clear all admin tokens from localStorage
localStorage.removeItem('kamioi_admin_token');
localStorage.removeItem('kamioi_token');
localStorage.removeItem('authToken');

console.log('✅ Tokens cleared!');
console.log('🔄 Refreshing page...');

// Refresh the page
location.reload();
