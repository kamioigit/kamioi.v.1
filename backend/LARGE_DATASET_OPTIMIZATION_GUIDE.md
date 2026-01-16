# Large Dataset Performance Optimization Guide

## Problem
Admin dashboard is slow with 14M+ llm_mappings rows and will get worse as data grows.

## Solution: Multi-Layer Optimization

### Layer 1: Database Indexes (Immediate - Run Now)
**What**: Add indexes on frequently queried columns
**Impact**: 10-100x faster COUNT queries
**How**: Run `python optimize_large_dataset_performance.py`

**Indexes Added**:
- `status` - For filtering by approved/pending/rejected
- `created_at` - For date-based queries
- `status + created_at` - Composite for common filters
- `user_id + status` - For user-specific queries
- `confidence` - For confidence-based filtering

### Layer 2: Summary Table (Fast Stats)
**What**: Pre-calculated stats table updated periodically
**Impact**: Instant stats instead of scanning 14M rows
**How**: Created by optimization script, update every 5-10 minutes

**Usage in Code**:
```python
# Instead of: SELECT COUNT(*) FROM llm_mappings WHERE status = 'approved'
# Use: SELECT approved_count FROM llm_mappings_summary ORDER BY last_updated DESC LIMIT 1
```

### Layer 3: Query Optimization (Code Changes)
**What**: Modify admin endpoints to use optimized queries
**Impact**: 50-90% faster endpoint responses

#### Current Problem Queries:
1. **LLM Center Dashboard** (`/api/admin/llm-center/dashboard`):
   - Line 5869-5882: Full table scan with multiple COUNTs
   - **Fix**: Use summary table + indexes

2. **Database Stats** (`/api/admin/database/stats`):
   - Line 5032: COUNT(*) on llm_mappings
   - **Fix**: Use summary table

#### Optimized Query Pattern:
```python
# OLD (slow - scans 14M rows):
result = conn.execute(text("SELECT COUNT(*) FROM llm_mappings WHERE status = 'approved'"))

# NEW (fast - uses index):
result = conn.execute(text("""
    SELECT approved_count FROM llm_mappings_summary 
    ORDER BY last_updated DESC LIMIT 1
"""))
# Fallback if summary is stale:
if result is None or (time.now() - summary_time) > 600:  # 10 min
    # Update summary table in background
    update_summary_async()
    # Use index-based query as fallback
    result = conn.execute(text("SELECT COUNT(*) FROM llm_mappings WHERE status = 'approved'"))
```

### Layer 4: Caching (Already Implemented)
**What**: In-memory cache for dashboard data
**Impact**: Repeat visits are instant
**Current**: 5-minute cache (good)

### Layer 5: Pagination & Limits
**What**: Don't load all data at once
**Impact**: Faster initial load, better UX

**Already Implemented**:
- ✅ `/api/admin/users` - Has pagination
- ✅ `/api/admin/transactions` - Has pagination
- ❌ `/api/admin/llm-center/dashboard` - No pagination (but uses aggregated stats)

## Implementation Steps

### Step 1: Run Optimization Script (5 minutes)
```bash
cd C:\Users\beltr\Kamioi\backend
python optimize_large_dataset_performance.py
```

This will:
- Add 7 critical indexes
- Create summary table
- Update summary with current stats
- Test query performance

### Step 2: Update Admin Endpoints (30 minutes)

#### A. Update LLM Center Dashboard (`app.py` line 5836)
Replace the COUNT queries with summary table lookups:

```python
# Get stats from summary table (fast)
result = conn.execute(text("""
    SELECT total_mappings, approved_count, pending_count, rejected_count,
           daily_processed, avg_confidence, high_confidence_count
    FROM llm_mappings_summary
    ORDER BY last_updated DESC
    LIMIT 1
"""))
summary = result.fetchone()

if summary and (datetime.now() - summary['last_updated']).seconds < 600:
    # Use cached summary (less than 10 minutes old)
    total_mappings = summary[0]
    approved_count = summary[1]
    # ... etc
else:
    # Summary is stale, use index-based query
    result = conn.execute(text("""
        SELECT COUNT(*) FROM llm_mappings WHERE status = 'approved'
    """))  # This will use the index now
```

#### B. Update Database Stats (`app.py` line 5032)
Replace:
```python
result = conn.execute(text('SELECT COUNT(*) FROM llm_mappings'))
```

With:
```python
result = conn.execute(text("""
    SELECT total_mappings FROM llm_mappings_summary 
    ORDER BY last_updated DESC LIMIT 1
"""))
llm_count = result.scalar() if result else 0
```

### Step 3: Set Up Periodic Summary Updates (10 minutes)

Create a background job to update summary table every 5-10 minutes:

```python
# In app.py, add to scheduler:
def update_llm_mappings_summary():
    """Update llm_mappings summary table"""
    try:
        conn = db_manager.get_connection()
        # ... update query from optimize script ...
        conn.commit()
    except Exception as e:
        print(f"Error updating summary: {e}")

# Schedule to run every 5 minutes
scheduler.add_job(
    update_llm_mappings_summary,
    trigger=CronTrigger(minute='*/5'),  # Every 5 minutes
    id='update_llm_summary',
    replace_existing=True
)
```

### Step 4: Monitor Performance (Ongoing)

Add performance logging:
```python
import time
start = time.time()
# ... query ...
elapsed = time.time() - start
if elapsed > 1.0:
    logger.warning(f"Slow query: {elapsed:.2f}s - {query}")
```

## Expected Performance Improvements

### Before Optimization:
- LLM Center Dashboard: **5-15 seconds** (full table scan)
- Database Stats: **3-10 seconds** (COUNT on 14M rows)
- Overall: Inconsistent, gets worse as data grows

### After Indexes Only:
- LLM Center Dashboard: **1-3 seconds** (indexed queries)
- Database Stats: **0.5-1 second** (indexed COUNT)
- Overall: 50-70% improvement

### After Summary Table:
- LLM Center Dashboard: **0.1-0.5 seconds** (summary lookup)
- Database Stats: **0.1-0.3 seconds** (summary lookup)
- Overall: 90-95% improvement

### At 50M+ Rows:
- With optimizations: Still **0.1-0.5 seconds** (summary table)
- Without optimizations: **30-60+ seconds** (full table scans)

## Additional Optimizations for Future

### 1. Database Partitioning (Advanced)
Partition `llm_mappings` by date:
- Current month: Hot partition (fast)
- Older months: Cold partitions (archived)
- Queries only scan relevant partitions

### 2. Read Replicas (Production)
- Master: Writes
- Replica: Reads (admin dashboard)
- Reduces load on master database

### 3. Materialized Views (PostgreSQL)
Pre-computed views that refresh periodically:
```sql
CREATE MATERIALIZED VIEW llm_mappings_daily_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
FROM llm_mappings
GROUP BY DATE(created_at);
```

### 4. Approximate Counts (Very Large Tables)
For exact count not needed:
```sql
-- PostgreSQL: Fast approximate count
SELECT reltuples::BIGINT FROM pg_class WHERE relname = 'llm_mappings';
```

## Monitoring & Alerts

Set up alerts for:
- Query time > 2 seconds
- Summary table > 10 minutes stale
- Index usage dropping
- Table size growth rate

## Summary

**Quick Win (Today)**:
1. Run `optimize_large_dataset_performance.py` ✅
2. Restart server
3. Test dashboard loading

**Short Term (This Week)**:
1. Update endpoints to use summary table
2. Set up periodic summary updates
3. Monitor performance

**Long Term (Next Month)**:
1. Consider partitioning
2. Set up read replicas (if needed)
3. Implement materialized views

The key is: **Don't scan 14M rows when you can use a summary table with 1 row!**


