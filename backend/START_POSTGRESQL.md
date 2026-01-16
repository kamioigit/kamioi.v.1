# Start Using PostgreSQL - Quick Guide

## ✅ Migration Status

**What's Migrated:**
- ✅ Users: 3 rows
- ✅ Transactions: 50 rows (1 skipped - invalid user_id)
- ✅ Admin Settings: 3 rows
- ✅ Subscription Plans: 3 rows
- ✅ User Subscriptions: 2 rows
- ⏭️ LLM Mappings: 0 rows (14.6M - can migrate later)

**Total: 61 rows migrated to PostgreSQL**

## 🚀 Start Using PostgreSQL NOW

### Step 1: Set Environment Variable

**Windows PowerShell:**
```powershell
$env:DB_TYPE="postgresql"
```

**For permanent (system-wide):**
```powershell
[System.Environment]::SetEnvironmentVariable('DB_TYPE', 'postgresql', 'User')
```

### Step 2: Restart Your Flask Application

```powershell
cd C:\Users\beltr\Kamioi\backend
python app.py
```

You should see:
```
[DATABASE] Using PostgreSQL: localhost:5432/kamioi
```

### Step 3: Verify It's Working

1. **Login** - Should work with PostgreSQL users
2. **View Transactions** - Should show 50 transactions
3. **LLM Center** - Will work (just empty historical data initially)
4. **New Data** - All new data will go to PostgreSQL

## ✅ What Works

- ✅ User authentication
- ✅ Transactions (50 migrated)
- ✅ Subscriptions
- ✅ All new operations
- ✅ LLM Center (new mappings will work)
- ⚠️ LLM Center historical data (empty - but new mappings work!)

## 📝 Notes

- **SQLite database is kept as backup** - Don't delete it
- **New LLM mappings** will be created in PostgreSQL
- **Historical 14.6M mappings** can be migrated later when you have time
- **Application will automatically use PostgreSQL** when DB_TYPE is set

## 🔄 Rollback (If Needed)

If you need to rollback to SQLite:
```powershell
$env:DB_TYPE="sqlite"
```
Restart application - it will use SQLite again.

---

**You're ready to go! Set DB_TYPE and restart your app!** 🎉

