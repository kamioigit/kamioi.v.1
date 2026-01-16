# Phase 1 Migration Guide: SQLite → PostgreSQL

This guide will walk you through migrating from SQLite to PostgreSQL for better scalability.

## Prerequisites

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use Chocolatey: `choco install postgresql`
- Default port: 5432
- Remember the postgres superuser password

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Install Python Dependencies

```bash
cd C:\Users\beltr\Kamioi\backend
pip install -r requirements_postgres.txt
```

This installs:
- `psycopg2-binary` - PostgreSQL adapter
- `SQLAlchemy` - Connection pooling and ORM

## Migration Steps

### Step 1: Backup Your SQLite Database

**IMPORTANT: Always backup before migration!**

```bash
# Windows
copy kamioi.db kamioi.db.backup

# Linux/Mac
cp kamioi.db kamioi.db.backup
```

### Step 2: Create PostgreSQL Database

1. **Start PostgreSQL service** (if not running)
   ```bash
   # Windows (as Administrator)
   net start postgresql-x64-15
   
   # Or use pgAdmin GUI
   ```

2. **Create database and user** (optional, can use default postgres user)
   ```sql
   -- Connect to PostgreSQL as superuser
   psql -U postgres
   
   -- Create database
   CREATE DATABASE kamioi;
   
   -- Create user (optional)
   CREATE USER kamioi_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE kamioi TO kamioi_user;
   ```

### Step 3: Configure Database Connection

Edit `config.py` or set environment variables:

**Option A: Environment Variables (Recommended)**
```bash
# Windows PowerShell
$env:DB_TYPE="postgresql"
$env:POSTGRES_HOST="localhost"
$env:POSTGRES_PORT="5432"
$env:POSTGRES_DB="kamioi"
$env:POSTGRES_USER="kamioi_user"
$env:POSTGRES_PASSWORD="your_password"

# Linux/Mac
export DB_TYPE=postgresql
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=kamioi
export POSTGRES_USER=kamioi_user
export POSTGRES_PASSWORD=your_password
```

**Option B: Edit `config.py` directly**
```python
POSTGRES_HOST = 'localhost'
POSTGRES_PORT = 5432
POSTGRES_DB = 'kamioi'
POSTGRES_USER = 'kamioi_user'
POSTGRES_PASSWORD = 'your_password'
```

### Step 4: Create PostgreSQL Schema

```bash
cd C:\Users\beltr\Kamioi\backend
python migrations/create_postgres_schema.py
```

This will:
- ✅ Create the database (if it doesn't exist)
- ✅ Create all tables
- ✅ Create performance indexes
- ✅ Initialize default admin settings

**Expected output:**
```
✅ Created users table
✅ Created transactions table
✅ Created llm_mappings table
...
✅ All indexes created successfully!
```

### Step 5: Migrate Data

```bash
python migrations/migrate_data.py
```

This will:
- ✅ Migrate all data from SQLite to PostgreSQL
- ✅ Preserve all relationships (foreign keys)
- ✅ Validate row counts match
- ✅ Show progress for large tables (14M+ llm_mappings)

**Expected output:**
```
📦 Migrating users (1,234 rows)...
  ✅ Migrated 1,234/1,234 rows
📦 Migrating transactions (50,000 rows)...
  ✅ Migrated 50,000/50,000 rows
📦 Migrating llm_mappings (14,632,309 rows)...
  ✅ Migrated 14,632,309/14,632,309 rows
...
✅ Migration complete!
```

**Note:** Migration of 14M+ records may take 10-30 minutes depending on your system.

### Step 6: Verify Migration

The migration script automatically validates row counts. You can also manually verify:

```sql
-- Connect to PostgreSQL
psql -U kamioi_user -d kamioi

-- Check row counts
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'llm_mappings', COUNT(*) FROM llm_mappings;
```

### Step 7: Update Application to Use PostgreSQL

**Set environment variable:**
```bash
# Windows PowerShell
$env:DB_TYPE="postgresql"

# Linux/Mac
export DB_TYPE=postgresql
```

**Or update your application startup:**
```python
import os
os.environ['DB_TYPE'] = 'postgresql'
```

### Step 8: Test Your Application

1. **Start your Flask application**
   ```bash
   python app.py
   ```

2. **Test key functionality:**
   - Login
   - View transactions
   - Create new transaction
   - View LLM Center dashboard
   - Check admin dashboard

3. **Monitor performance:**
   - Check API response times
   - Monitor database connection pool usage
   - Verify queries are faster

## Rollback Plan

If you need to rollback to SQLite:

1. **Set environment variable:**
   ```bash
   $env:DB_TYPE="sqlite"  # Windows
   export DB_TYPE=sqlite  # Linux/Mac
   ```

2. **Restart application** - it will automatically use SQLite

3. **Your SQLite database is still intact** (we didn't delete it)

## Troubleshooting

### Connection Errors

**Error: "could not connect to server"**
- Check PostgreSQL is running: `pg_isready` or `systemctl status postgresql`
- Verify host/port in config
- Check firewall settings

**Error: "authentication failed"**
- Verify username/password
- Check `pg_hba.conf` allows your connection method

**Error: "database does not exist"**
- Run `create_postgres_schema.py` first
- Or manually create: `CREATE DATABASE kamioi;`

### Migration Errors

**Error: "table already exists"**
- Tables already exist - this is OK, script uses `CREATE TABLE IF NOT EXISTS`
- Or drop tables first: `DROP TABLE IF EXISTS table_name CASCADE;`

**Error: "foreign key constraint failed"**
- Migration order matters - make sure you run `create_postgres_schema.py` first
- Check that all parent tables exist

**Error: "out of memory" during llm_mappings migration**
- Reduce batch size in `migrate_data.py` (change `batch_size=1000` to `batch_size=500`)
- Close other applications
- Ensure enough RAM available

### Performance Issues

**Slow queries after migration:**
- Verify indexes were created: `\d+ table_name` in psql
- Run `ANALYZE table_name;` to update statistics
- Check connection pool settings in `config.py`

**Connection pool exhausted:**
- Increase `POOL_SIZE` in `config.py`
- Check for connection leaks (not closing connections)
- Monitor active connections: `SELECT count(*) FROM pg_stat_activity;`

## Performance Improvements

After migration, you should see:

1. **Faster queries:**
   - Dashboard queries: 5s → <500ms
   - LLM mappings queries: 10s → <1s
   - Analytics queries: 15s → <2s

2. **Better concurrency:**
   - Multiple users can write simultaneously
   - No table-level locking
   - Better connection pooling

3. **Scalability:**
   - Can handle millions of transactions
   - Supports horizontal scaling
   - Ready for read replicas

## Next Steps

After successful migration:

1. ✅ **Phase 1 Complete** - Database migration done
2. 🔄 **Phase 2** - Implement Redis caching (next)
3. 🔄 **Phase 3** - Set up message queue (Celery)
4. 🔄 **Phase 4** - Database optimization (partitioning, materialized views)

## Support

If you encounter issues:
1. Check PostgreSQL logs: `C:\Program Files\PostgreSQL\15\data\log\`
2. Check application logs
3. Verify all environment variables are set
4. Test PostgreSQL connection: `psql -U kamioi_user -d kamioi`

---

**Migration Date:** _______________  
**PostgreSQL Version:** _______________  
**Rows Migrated:** _______________  
**Status:** ✅ Complete / ⚠️ Issues / ❌ Failed

