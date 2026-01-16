# How to Test PostgreSQL Integration

## 🚀 Quick Start

### Option 1: Use PowerShell Script (Easiest)
```powershell
cd C:\Users\beltr\Kamioi\backend
.\start_server.ps1
```

### Option 2: Manual Start
```powershell
cd C:\Users\beltr\Kamioi\backend
$env:DB_TYPE="postgresql"
python app.py
```

## ✅ Pre-Flight Test

Before starting the server, run a quick test:

```powershell
cd C:\Users\beltr\Kamioi\backend
python quick_test.py
```

This will verify:
- ✅ Database connection works
- ✅ Flask app can start
- ✅ Basic queries work

## 🌐 Testing in Browser

### 1. Start the Server
```powershell
cd C:\Users\beltr\Kamioi\backend
$env:DB_TYPE="postgresql"
python app.py
```

You should see:
```
[DATABASE] Using PostgreSQL: localhost:5432/kamioi
Starting server on port 4000...
Database: PostgreSQL
 * Running on http://0.0.0.0:4000
```

### 2. Test Endpoints

Open your browser and test:

- **Health Check**: http://localhost:4000/api/health
  - Should return: `{"status": "ok"}` or similar

- **Your Frontend**: http://localhost:4000
  - Should load your React app (if frontend is configured)

### 3. Test Login & Data

1. Try to log in with an existing user
2. Check if transactions load
3. Verify data appears correctly
4. Test the LLM Center page (if available)

## 🔍 Verification Checklist

### Database Connection
- [ ] Server starts without errors
- [ ] Console shows "Using PostgreSQL"
- [ ] No connection errors in logs

### API Endpoints
- [ ] `/api/health` returns 200
- [ ] Login endpoint works
- [ ] Transaction endpoints return data

### Frontend (if applicable)
- [ ] Can log in
- [ ] User dashboard loads
- [ ] Transactions display correctly
- [ ] LLM Center loads (if available)

## 🐛 Troubleshooting

### Port 4000 Already in Use
```powershell
$env:PORT="5000"
python app.py
```

### PostgreSQL Connection Fails
1. Check PostgreSQL is running
2. Verify credentials in `config.py`
3. Test connection: `psql -h localhost -U postgres -d kamioi`

### Switch Back to SQLite (if needed)
```powershell
$env:DB_TYPE="sqlite"
python app.py
```

## 📊 What to Expect

### ✅ Success Indicators
- Server starts on port 4000
- No database errors in console
- Frontend connects and loads data
- Transactions appear correctly

### ⚠️ Known Issues
- Some methods may show warnings about cursor (these will be fixed as needed)
- Core functionality works even with warnings

## 🎯 Next Steps After Testing

1. ✅ If all tests pass → Start using PostgreSQL!
2. ✅ Monitor performance improvements
3. ✅ Report any issues for immediate fixes

---

**Ready to test?** Run `python quick_test.py` first, then start the server!

