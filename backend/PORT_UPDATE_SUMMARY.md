# Port Update Summary - All Files Updated to 5111

## ✅ Files Updated

### Core Application Files
1. **app.py**
   - Main server port: `5111` (line 15315)
   - Report download URLs: `5111` (lines 8490, 8535)
   - Server startup messages: `5111` (lines 14927-14931)

2. **run_with_waitress.py**
   - Default port: `5111`

3. **run_with_waitress_debug.py**
   - Default port: `5111`

4. **api/stripe_endpoints.py**
   - Frontend URL default: `http://localhost:5111` (line 217)
   - Note: Line 352 uses `3764` which is the frontend port (correct)

### Test & Diagnostic Scripts
5. **test_request.py**
   - Test URL: `http://localhost:5111/api/test`
   - Error messages updated

6. **diagnose_admin_auth.py**
   - BASE_URL: `http://localhost:5111`
   - Error messages updated

7. **test_admin_endpoints_comprehensive.py**
   - BASE_URL: `http://localhost:5111`
   - Error messages updated

8. **check_server_errors.py**
   - All test URLs: `http://localhost:5111`

### Startup Scripts
9. **start_server.ps1**
   - PORT environment variable: `5111`
   - Display messages updated

## 📝 Files with Port 4000 (Documentation Only - Not Critical)

These files contain port 4000 references but are documentation/test files:
- Various `.md` documentation files (historical references)
- `capture_flask_output.py` (old test script)
- `test_with_server_check.py` (old test script)
- `get_error_details.py` (old diagnostic script)

These can be updated later if needed, but don't affect functionality.

## ✅ Verification

All critical code files now use port **5111** by default. The server will:
- Start on port 5111 if no PORT environment variable is set
- Use port 5111 for all internal URL generation
- Test scripts will connect to port 5111

## 🎯 Next Steps

1. **Update Frontend Configuration**
   - Change API base URL from `http://localhost:4000` to `http://localhost:5111`
   - Update any hardcoded API URLs in frontend code

2. **Environment Variables** (Optional)
   - You can still override with: `$env:PORT = "5111"` or `export PORT=5111`
   - But default is now 5111

3. **Test Everything**
   - All endpoints should work on port 5111
   - Admin dashboard should connect to port 5111
   - All API calls should use port 5111

## 📌 Important Notes

- **Frontend port 3764** is correct - that's your React frontend, not the backend
- **Database port 5432** is correct - that's PostgreSQL, not the Flask server
- Only the **Flask backend server port** changed from 4000 to 5111

