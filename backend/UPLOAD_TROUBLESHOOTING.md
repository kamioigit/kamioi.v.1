# Bank File Upload Troubleshooting Guide

## Issue: Uploaded transactions not displaying

### Steps to Diagnose:

1. **Check Backend Server Logs**
   - Look for `[BUSINESS BANK UPLOAD]` messages in the backend console
   - Check for:
     - `Processing file for user_id=108`
     - `Successfully read CSV/Excel file, X rows`
     - `Processed X transactions`
     - `Committed X transactions to database`
     - `Verification: X total transactions now in database for user 108`
     - Any error messages

2. **Check Database Directly**
   ```bash
   cd backend
   python check_user_108_transactions.py
   ```

3. **Check Frontend Network Tab**
   - Open DevTools (F12) → Network tab
   - Look for `/api/business/upload-bank-file` request
   - Check the response:
     - `success: true` or `success: false`
     - `processed` count
     - `error_count`
     - Any error messages

4. **Verify Backend Server Restart**
   - The "FORCE EMPTY" debug code has been removed
   - **RESTART THE BACKEND SERVER** to load the latest code
   - After restart, transactions should display correctly

### Common Issues:

1. **Backend Server Not Restarted**
   - The debug code blocking transactions has been removed
   - **Action:** Restart backend server

2. **File Format Issues**
   - Check if file has required columns: Date, Amount, Description/Merchant
   - Check backend logs for column mapping errors

3. **Database Connection Issues**
   - Check if commit succeeded
   - Look for "CRITICAL ERROR during commit" in logs

4. **Frontend Not Refreshing**
   - Check if `refreshTransactions` event is being dispatched
   - Check if `BusinessTransactions` component is listening for events

### Next Steps:

1. **Restart Backend Server** (CRITICAL)
2. **Check Backend Console Logs** for upload processing messages
3. **Check Database** using the script above
4. **Check Frontend Network Tab** for upload response
5. **Try Uploading Again** after restart

