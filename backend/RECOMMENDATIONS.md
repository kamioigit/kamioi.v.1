# Recommendations to Prevent Data Issues

## Immediate Actions Required

### 1. Clean Current Data
```bash
python clean_account_b8469686.py
# OR
python rebuild_business_api.py  # Has cleanup function
```

### 2. Database-Level Fixes

#### A. Add Row-Level Security (PostgreSQL)
```sql
-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own transactions
CREATE POLICY user_transactions_isolation ON transactions
    FOR ALL
    USING (user_id = current_setting('app.user_id')::integer);
```

#### B. Add Foreign Key Constraints
```sql
-- Ensure user_id references valid users
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

#### C. Add Unique Constraints
```sql
-- Prevent duplicate transactions
CREATE UNIQUE INDEX idx_transactions_unique 
ON transactions(user_id, merchant, amount, date) 
WHERE merchant IS NOT NULL AND date IS NOT NULL;
```

### 3. Application-Level Fixes

#### A. Use Explicit Transactions
```python
# Always use explicit BEGIN/COMMIT
conn.execute(text('BEGIN'))
try:
    # Your operations
    conn.execute(text('COMMIT'))
except:
    conn.execute(text('ROLLBACK'))
    raise
```

#### B. Set Transaction Isolation
```python
# Use READ COMMITTED for consistency
conn.execute(text('SET TRANSACTION ISOLATION LEVEL READ COMMITTED'))
```

#### C. Verify After Operations
```python
# After insert, verify it exists
inserted_count = result.rowcount
verify_query = text('SELECT COUNT(*) FROM transactions WHERE user_id = :uid')
verify_count = conn.execute(verify_query, {'uid': user_id}).scalar()
assert verify_count >= inserted_count, "Data not committed!"
```

### 4. Connection Management

#### A. Use Fresh Connections for Critical Operations
```python
# Don't reuse connections for writes
conn = db_manager.get_connection()
try:
    # Critical operation
finally:
    db_manager.release_connection(conn)  # Always release
```

#### B. Verify Connection State
```python
# Check connection is valid
if conn.closed:
    conn = db_manager.get_connection()
```

### 5. Query Validation

#### A. Always Filter by user_id
```python
# NEVER query without user_id filter
query = text('SELECT * FROM transactions WHERE user_id = :user_id')
```

#### B. Validate Results
```python
# Check every row belongs to user
for row in results:
    assert row['user_id'] == user_id, "Invalid user_id in result!"
```

### 6. Caching Strategy

#### A. No Caching for Critical Data
- Don't cache transaction queries
- Don't use helper functions that cache
- Always query database directly

#### B. Cache Invalidation
```python
# If you must cache, invalidate on writes
cache_key = f'transactions_{user_id}'
cache.delete(cache_key)  # Invalidate on upload
```

### 7. Testing Strategy

#### A. Unit Tests
```python
def test_user_isolation():
    # User A should not see User B's transactions
    user_a_tx = get_transactions(user_a_id)
    assert all(tx['user_id'] == user_a_id for tx in user_a_tx)
```

#### B. Integration Tests
```python
def test_upload_and_view():
    # Upload transactions
    upload_result = upload_file(user_id, file)
    assert upload_result['success']
    
    # Verify they appear
    transactions = get_transactions(user_id)
    assert len(transactions) == upload_result['count']
```

### 8. Monitoring

#### A. Log All Database Operations
```python
print(f"[DB] User {user_id}: {operation} - {count} rows affected")
```

#### B. Alert on Anomalies
```python
if query_count != db_count:
    alert(f"Data mismatch for user {user_id}: query={query_count}, db={db_count}")
```

## Long-Term Solutions

### 1. Database Migration
- Add proper indexes
- Implement RLS policies
- Add audit tables
- Set up replication

### 2. API Versioning
- Create v2 endpoints with proper isolation
- Gradually migrate clients
- Deprecate old endpoints

### 3. Data Archival
- Archive old transactions
- Separate active/inactive data
- Implement data retention policies

### 4. Performance Optimization
- Add database indexes
- Optimize queries
- Use connection pooling properly
- Implement query caching (with invalidation)

## Implementation Priority

1. **CRITICAL (Do Now)**:
   - Clean user 108 data
   - Rebuild endpoints with proper isolation
   - Add data validation

2. **HIGH (This Week)**:
   - Add foreign key constraints
   - Implement transaction verification
   - Add comprehensive logging

3. **MEDIUM (This Month)**:
   - Add row-level security
   - Implement unit tests
   - Set up monitoring

4. **LOW (Future)**:
   - Database migration
   - API versioning
   - Performance optimization

