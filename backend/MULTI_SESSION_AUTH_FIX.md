# Multi-Session Authentication Fix

## Problem

**Critical Issue**: When logged in as both admin and user simultaneously, refreshing the page causes one session to be kicked out. This happens because:

1. The frontend stores tokens in localStorage
2. On refresh, the frontend only checks for one token type
3. If it doesn't find the expected token, it clears localStorage
4. This causes the other session to be lost

## Root Cause

The frontend authentication check on page refresh is likely:
- Only checking for one token type (either admin OR user)
- Clearing localStorage if the expected token isn't found
- Not preserving both tokens separately

## Backend Solution

### 1. New Endpoint: `/api/auth/check-all`

This endpoint allows the frontend to verify BOTH admin and user tokens without clearing either:

```javascript
// Check both tokens
GET /api/auth/check-all
Headers: 
  Authorization: Bearer <admin_token_or_user_token>
  X-Admin-Token: <admin_token> (optional)
  X-User-Token: <user_token> (optional)

Response:
{
  "success": true,
  "admin": { ... } or null,
  "user": { ... } or null,
  "has_admin": true/false,
  "has_user": true/false
}
```

### 2. Updated `/api/admin/auth/me`

Added documentation that this endpoint does NOT clear other sessions.

## Frontend Fix Required

The frontend needs to be updated to:

### 1. Store Tokens Separately

```javascript
// Store tokens in separate localStorage keys
localStorage.setItem('kamioi_admin_token', adminToken);
localStorage.setItem('kamioi_user_token', userToken);
```

**DO NOT** use a single key like `kamioi_token` that gets overwritten.

### 2. On Page Refresh - Check Both Tokens

```javascript
// On app initialization/refresh
async function checkAuthOnRefresh() {
  const adminToken = localStorage.getItem('kamioi_admin_token');
  const userToken = localStorage.getItem('kamioi_user_token');
  
  // Use the new endpoint to check both tokens
  const response = await fetch('/api/auth/check-all', {
    headers: {
      'Authorization': `Bearer ${adminToken || userToken || ''}`,
      'X-Admin-Token': adminToken || '',
      'X-User-Token': userToken || ''
    }
  });
  
  const data = await response.json();
  
  // Restore both sessions if they exist
  if (data.has_admin && !adminToken) {
    // Admin session was lost, but token still valid - restore it
    // (This shouldn't happen, but handle it gracefully)
  }
  
  if (data.has_user && !userToken) {
    // User session was lost, but token still valid - restore it
    // (This shouldn't happen, but handle it gracefully)
  }
  
  // If tokens exist but aren't valid, clear them
  if (adminToken && !data.has_admin) {
    localStorage.removeItem('kamioi_admin_token');
  }
  
  if (userToken && !data.has_user) {
    localStorage.removeItem('kamioi_user_token');
  }
}
```

### 3. Send Appropriate Token Based on Endpoint

```javascript
// For admin endpoints
function getAuthHeaders(isAdmin = false) {
  const token = isAdmin 
    ? localStorage.getItem('kamioi_admin_token')
    : localStorage.getItem('kamioi_user_token');
  
  return {
    'Authorization': `Bearer ${token}`
  };
}

// Usage
fetch('/api/admin/users', {
  headers: getAuthHeaders(true)  // Use admin token
});

fetch('/api/user/dashboard', {
  headers: getAuthHeaders(false)  // Use user token
});
```

### 4. Never Clear Both Tokens on Refresh

**CRITICAL**: When checking authentication on refresh:
- ✅ Check both tokens separately
- ✅ Only clear tokens that are actually invalid
- ❌ DO NOT clear localStorage if one token check fails
- ❌ DO NOT use a single token storage that gets overwritten

## Testing

1. **Login as Admin**: Should store `kamioi_admin_token`
2. **Login as User** (in same browser): Should store `kamioi_user_token` (both should coexist)
3. **Refresh Page**: Both tokens should remain in localStorage
4. **Check Console**: Both sessions should be active
5. **Access Admin Dashboard**: Should work with admin token
6. **Access User Dashboard**: Should work with user token

## Example Frontend Implementation

```javascript
// AuthService.js
class AuthService {
  // Store tokens separately
  setAdminToken(token) {
    localStorage.setItem('kamioi_admin_token', token);
  }
  
  setUserToken(token) {
    localStorage.setItem('kamioi_user_token', token);
  }
  
  getAdminToken() {
    return localStorage.getItem('kamioi_admin_token');
  }
  
  getUserToken() {
    return localStorage.getItem('kamioi_user_token');
  }
  
  // Check both tokens on refresh
  async checkAllAuth() {
    const adminToken = this.getAdminToken();
    const userToken = this.getUserToken();
    
    if (!adminToken && !userToken) {
      return { hasAdmin: false, hasUser: false };
    }
    
    try {
      const headers = {
        'Authorization': `Bearer ${adminToken || userToken || ''}`
      };
      
      if (adminToken) {
        headers['X-Admin-Token'] = adminToken;
      }
      
      if (userToken) {
        headers['X-User-Token'] = userToken;
      }
      
      const response = await fetch('/api/auth/check-all', { headers });
      const data = await response.json();
      
      // Clean up invalid tokens
      if (adminToken && !data.has_admin) {
        localStorage.removeItem('kamioi_admin_token');
      }
      
      if (userToken && !data.has_user) {
        localStorage.removeItem('kamioi_user_token');
      }
      
      return {
        hasAdmin: data.has_admin,
        hasUser: data.has_user,
        admin: data.admin,
        user: data.user
      };
    } catch (error) {
      console.error('Auth check failed:', error);
      return { hasAdmin: false, hasUser: false };
    }
  }
  
  // Clear specific token (not both)
  clearAdminToken() {
    localStorage.removeItem('kamioi_admin_token');
  }
  
  clearUserToken() {
    localStorage.removeItem('kamioi_user_token');
  }
  
  // Clear both (only on explicit logout)
  clearAllTokens() {
    localStorage.removeItem('kamioi_admin_token');
    localStorage.removeItem('kamioi_user_token');
  }
}
```

## Common Mistakes to Avoid

1. ❌ **Single Token Storage**: Don't use one key that gets overwritten
   ```javascript
   // BAD
   localStorage.setItem('kamioi_token', token);  // Gets overwritten
   
   // GOOD
   localStorage.setItem('kamioi_admin_token', adminToken);
   localStorage.setItem('kamioi_user_token', userToken);
   ```

2. ❌ **Clearing on Failed Check**: Don't clear both tokens if one check fails
   ```javascript
   // BAD
   if (!adminAuth) {
     localStorage.clear();  // Clears everything!
   }
   
   // GOOD
   if (!adminAuth) {
     localStorage.removeItem('kamioi_admin_token');  // Only clear admin
   }
   ```

3. ❌ **Only Checking One Token**: Don't only check for admin OR user
   ```javascript
   // BAD
   const token = localStorage.getItem('kamioi_token');  // Which one?
   
   // GOOD
   const adminToken = localStorage.getItem('kamioi_admin_token');
   const userToken = localStorage.getItem('kamioi_user_token');
   ```

## Backend Changes Made

1. ✅ Added `/api/auth/check-all` endpoint
2. ✅ Updated `/api/admin/auth/me` documentation
3. ✅ Backend now supports checking both tokens simultaneously

## Next Steps

1. **Update Frontend** to use separate localStorage keys
2. **Update Refresh Logic** to check both tokens
3. **Test** that both sessions can coexist
4. **Verify** that refresh doesn't clear either session

## Verification

After implementing the fix:

1. Login as admin → `kamioi_admin_token` stored
2. Login as user → `kamioi_user_token` stored (both coexist)
3. Refresh page → Both tokens remain
4. Access admin dashboard → Works
5. Access user dashboard → Works
6. Both sessions active simultaneously ✅


