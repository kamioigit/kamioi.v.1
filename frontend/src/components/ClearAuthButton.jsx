import React from 'react';

const ClearAuthButton = () => {
  const clearAuth = () => {
    // Clear all authentication tokens
    localStorage.removeItem('kamioi_user_token');
    localStorage.removeItem('kamioi_admin_token');
    localStorage.removeItem('authToken');
    
    // Clear any other auth-related data
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    localStorage.removeItem('kamioi_user');
    localStorage.removeItem('kamioi_admin_user');
    localStorage.removeItem('kamioi_business_user');
    localStorage.removeItem('kamioi_family_user');
    
    // Clear all transaction and data-related localStorage
    localStorage.removeItem('kamioi_transactions');
    localStorage.removeItem('kamioi_holdings');
    localStorage.removeItem('kamioi_portfolio_value');
    localStorage.removeItem('kamioi_goals');
    localStorage.removeItem('kamioi_recommendations');
    localStorage.removeItem('kamioi_notifications');
    localStorage.removeItem('kamioi_total_roundups');
    localStorage.removeItem('kamioi_total_fees');
    localStorage.removeItem('kamioi_admin_reports');
    
    // Clear profile images
    const profileImageKeys = Object.keys(localStorage).filter(key => key.startsWith('profile_image_'));
    profileImageKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('🧹 Auth tokens and all cached data cleared! Refreshing page...');
    
    // Refresh the page
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      background: '#ff4444',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold'
    }} onClick={clearAuth}>
      🧹 Clear Auth
    </div>
  );
};

export default ClearAuthButton;
