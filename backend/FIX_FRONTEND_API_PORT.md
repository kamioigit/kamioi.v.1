# Fix Frontend API Port Configuration

## ⚠️ Current Problem

Your frontend is making API calls to:
```
POST http://127.0.0.1:4000/api/admin/auth/login
```

But it should be:
```
POST http://127.0.0.1:5111/api/admin/auth/login
```

## 🔍 How to Find the Configuration

### Option 1: Use the Search Script
Run this from the backend directory:
```powershell
.\find_frontend_api_config.ps1
```

### Option 2: Manual Search

1. **Navigate to your frontend directory** (usually `C:\Users\beltr\Kamioi\frontend`)

2. **Search for port 4000 references:**
   ```powershell
   cd C:\Users\beltr\Kamioi\frontend
   Select-String -Pattern ":4000|localhost:4000|127\.0\.0\.1:4000" -Recurse -Include "*.js","*.jsx","*.ts","*.tsx",".env*"
   ```

3. **Check these common locations:**
   - `.env` or `.env.local` files
   - `src/config/api.js` or similar
   - `src/services/apiService.js` or similar
   - `src/utils/api.js` or similar
   - `vite.config.js` or `vite.config.ts` (if using Vite)
   - `package.json` (scripts section)

## 🔧 What to Change

### In `.env` files:
```bash
# Change from:
REACT_APP_API_URL=http://localhost:4000
# or
VITE_API_URL=http://localhost:4000

# To:
REACT_APP_API_URL=http://localhost:5111
# or
VITE_API_URL=http://localhost:5111
```

### In JavaScript/TypeScript files:
```javascript
// Change from:
const API_BASE_URL = 'http://localhost:4000'
const API_URL = 'http://127.0.0.1:4000'
baseURL: 'http://localhost:4000'

// To:
const API_BASE_URL = 'http://localhost:5111'
const API_URL = 'http://127.0.0.1:5111'
baseURL: 'http://localhost:5111'
```

### In Vite config (if using Vite proxy):
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5111',  // Change from 4000
        changeOrigin: true
      }
    }
  }
}
```

## ✅ After Making Changes

1. **Restart your frontend dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   # or
   yarn dev
   ```

2. **Clear browser cache** (optional but recommended)

3. **Test the login** - API calls should now go to port 5111

## 📋 Quick Checklist

- [ ] Found the API configuration file(s)
- [ ] Changed port from 4000 to 5111
- [ ] Restarted frontend dev server
- [ ] Tested login - API calls go to port 5111
- [ ] Verified in browser Network tab

## 🎯 Expected Result

After the fix, in your browser's Network tab, you should see:
- ✅ `POST http://127.0.0.1:5111/api/admin/auth/login` (successful)
- ❌ NOT `POST http://127.0.0.1:4000/api/admin/auth/login` (connection refused)

The backend is ready on port 5111 - you just need to point the frontend to it!

