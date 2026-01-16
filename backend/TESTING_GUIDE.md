# Testing Guide - PostgreSQL Integration

## Quick Start

### 1. Start Backend Server (Port 4000)

```powershell
cd C:\Users\beltr\Kamioi\backend
$env:DB_TYPE="postgresql"
python app.py
```

You should see:
```
[DATABASE] Using PostgreSQL: localhost:5432/kamioi
Starting server on port 4000...
```

### 2. Test Backend API

Open a new terminal and run:

```powershell
# Test health endpoint
curl http://localhost:4000/api/health

# Test database connection
curl http://localhost:4000/api/test-db
```

Or use a browser:
- http://localhost:4000/api/health
- http://localhost:4000/api/test-db

### 3. Test Frontend (if available)

If your frontend is configured to connect to port 4000:
- Open http://localhost:4000 in your browser
- Try logging in
- Check if data loads correctly

## Automated Tests

### Test 1: Database Connection
```powershell
cd C:\Users\beltr\Kamioi\backend
$env:DB_TYPE="postgresql"
python test_postgresql.py
```

### Test 2: Flask App
```powershell
cd C:\Users\beltr\Kamioi\backend
$env:DB_TYPE="postgresql"
python test_app.py
```

## Manual Testing Checklist

### ✅ Backend Tests

1. **Server Starts**
   - [ ] Backend starts without errors
   - [ ] Shows "Using PostgreSQL" message
   - [ ] Port 4000 is accessible

2. **Database Connection**
   - [ ] Can query users
   - [ ] Can query transactions
   - [ ] No connection errors

3. **API Endpoints**
   - [ ] `/api/health` returns 200
   - [ ] `/api/test-db` works (if available)
   - [ ] Login endpoint works
   - [ ] Transaction endpoints work

### ✅ Frontend Tests (if available)

1. **Login**
   - [ ] Can log in with existing user
   - [ ] Session persists
   - [ ] User data loads

2. **Transactions**
   - [ ] Transaction list loads
   - [ ] Can view transaction details
   - [ ] Data appears correct

3. **LLM Center** (if available)
   - [ ] Page loads
   - [ ] Data displays correctly
   - [ ] Performance is acceptable

## Troubleshooting

### Port Already in Use
If port 4000 is busy:
```powershell
$env:PORT="5000"
python app.py
```

### Database Connection Fails
Check PostgreSQL is running:
```powershell
# Test PostgreSQL connection
psql -h localhost -U postgres -d kamioi
```

### Switch Back to SQLite
```powershell
$env:DB_TYPE="sqlite"
python app.py
```

## Expected Results

### ✅ Successful Test
- Backend starts on port 4000
- Database queries work
- Frontend can connect
- No errors in console

### ❌ Common Issues
- "Could not translate host name" → Use `localhost` not `Kamioi`
- "Port already in use" → Change PORT environment variable
- "Connection refused" → Check PostgreSQL is running
- "Table does not exist" → Run migration scripts

## Next Steps

Once testing passes:
1. ✅ Start using PostgreSQL in production
2. ✅ Monitor performance
3. ✅ Update any remaining methods as needed

