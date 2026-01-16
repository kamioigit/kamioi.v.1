# Frontend Configuration Required

## ⚠️ Critical Issue

Your frontend is trying to connect to the **wrong port** for API calls.

**Current (WRONG):**
- Frontend making API calls to: `http://127.0.0.1:4000/api/*` ❌
- This causes: `ERR_CONNECTION_REFUSED` because nothing is listening on port 4000 for API calls

**Should be:**
- Frontend making API calls to: `http://127.0.0.1:5111/api/*` ✅
- Backend is running on port 5111

## Port Configuration Summary

### ✅ Backend (Flask API) - Port 5111
- **URL:** `http://localhost:5111` or `http://127.0.0.1:5111`
- **All API endpoints:** `http://localhost:5111/api/*`
- **Status:** ✅ Correctly configured

### ✅ Frontend (React) - Port 4000  
- **URL:** `http://localhost:4000`
- **Login page:** `http://localhost:4000/admin-login`
- **Status:** ✅ Correct (frontend runs on 4000)

### ❌ Frontend API Configuration - NEEDS FIX
- **Currently:** Making API calls to `http://127.0.0.1:4000/api/*` ❌
- **Should be:** Making API calls to `http://127.0.0.1:5111/api/*` ✅

## What Needs to be Fixed in Frontend

You need to update your frontend code to point API calls to port **5111** instead of **4000**.

### Files to Check/Update in Frontend:

1. **API Configuration File**
   - Look for files like: `api.js`, `config.js`, `constants.js`, `.env`, `.env.local`
   - Find: `API_URL`, `BASE_URL`, `REACT_APP_API_URL`, or similar
   - Change from: `http://localhost:4000` or `http://127.0.0.1:4000`
   - Change to: `http://localhost:5111` or `http://127.0.0.1:5111`

2. **Common Frontend Locations:**
   ```
   frontend/
   ├── src/
   │   ├── config/
   │   │   └── api.js          ← Check here
   │   ├── services/
   │   │   └── apiService.js  ← Check here
   │   ├── utils/
   │   │   └── api.js         ← Check here
   │   └── .env               ← Check here
   │   └── .env.local         ← Check here
   ```

3. **Search for these patterns in frontend:**
   ```javascript
   // Look for:
   const API_URL = 'http://localhost:4000'
   const BASE_URL = 'http://127.0.0.1:4000'
   REACT_APP_API_URL=http://localhost:4000
   fetch('http://localhost:4000/api/...')
   axios.get('http://localhost:4000/api/...')
   ```

4. **Update to:**
   ```javascript
   // Change to:
   const API_URL = 'http://localhost:5111'
   const BASE_URL = 'http://127.0.0.1:5111'
   REACT_APP_API_URL=http://localhost:5111
   fetch('http://localhost:5111/api/...')
   axios.get('http://localhost:5111/api/...')
   ```

## Backend Status ✅

All backend files are correctly configured:
- ✅ Server runs on port 5111
- ✅ All API endpoints on port 5111
- ✅ CORS allows requests from port 4000 (frontend)
- ✅ Frontend redirect URLs use port 4000 (correct)

## Quick Fix

In your frontend, find where the API base URL is defined and change:

**From:**
```javascript
const API_BASE_URL = 'http://localhost:4000'
// or
const API_BASE_URL = 'http://127.0.0.1:4000'
```

**To:**
```javascript
const API_BASE_URL = 'http://localhost:5111'
// or
const API_BASE_URL = 'http://127.0.0.1:5111'
```

## Verification

After updating the frontend:
1. Restart your frontend dev server
2. Try logging in at `http://localhost:4000/admin-login`
3. Check browser Network tab - API calls should go to `localhost:5111`
4. Should see successful API responses

## Summary

- **Backend:** Port 5111 ✅ (All correct)
- **Frontend:** Port 4000 ✅ (Correct for serving the app)
- **Frontend API calls:** Should go to port 5111 ❌ (Needs update)

The backend is ready and waiting on port 5111. You just need to point your frontend API calls to the correct port!

