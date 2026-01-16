# Bank File Upload Debugging Guide

## Issue: Loading screen stays but nothing processes

### Possible Causes:
1. **Backend server not running**
2. **Network/CORS issue**
3. **Request hanging/timing out**
4. **Backend endpoint error**

### Debugging Steps:

1. **Check Backend Server is Running**
   - Open terminal in backend directory
   - Check if Flask server is running on port 5111
   - Look for: `Running on http://127.0.0.1:5111`

2. **Check Browser Console**
   - Open DevTools (F12) → Console tab
   - Look for these logs:
     - `[BusinessDashboardHeader] File selected: ...`
     - `[BusinessDashboardHeader] Token found: ...`
     - `[BusinessDashboardHeader] Starting file upload to: ...`
     - `[BusinessDashboardHeader] Upload response status: ...`

3. **Check Network Tab**
   - Open DevTools (F12) → Network tab
   - Upload file again
   - Look for request to `/api/business/upload-bank-file`
   - Check:
     - Status code (200, 401, 500, etc.)
     - Request headers (Authorization token)
     - Response body
     - Timing (how long it takes)

4. **Check Backend Console**
   - Look for:
     - `[BUSINESS BANK UPLOAD] Processing file for user_id=108`
     - `[BUSINESS BANK UPLOAD] Successfully read CSV/Excel file...`
     - `[BUSINESS BANK UPLOAD] Processed X transactions`
     - Any error messages

5. **Test Backend Endpoint Directly**
   ```bash
   curl -X POST http://localhost:5111/api/business/upload-bank-file \
     -H "Authorization: Bearer token_108" \
     -F "file=@test.csv"
   ```

### Common Issues:

**Issue 1: Backend Server Not Running**
- **Solution:** Start backend server
- **Command:** `cd backend && python app.py` or `flask run`

**Issue 2: CORS Error**
- **Symptom:** Console shows CORS error
- **Solution:** Check backend CORS configuration

**Issue 3: Authentication Error**
- **Symptom:** 401 Unauthorized
- **Solution:** Check token in localStorage, re-login if needed

**Issue 4: Request Timeout**
- **Symptom:** Loading screen stays for 2+ minutes
- **Solution:** Check backend logs, file might be too large or processing slowly

**Issue 5: Network Error**
- **Symptom:** "Failed to fetch" error
- **Solution:** Check if backend URL is correct, server is accessible

### Next Steps:
1. Check browser console for detailed logs
2. Check Network tab for request status
3. Check backend console for processing logs
4. Share error messages if any appear

