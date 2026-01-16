# Admin Endpoint Optimization - Code Changes

## Quick Reference: What to Change

### 1. LLM Center Dashboard (`app.py` ~line 5869)

**CURRENT (Slow - scans 14M rows)**:
```python
result = conn.execute(text('''
    SELECT 
        COUNT(*) as total_mappings,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as daily_processed,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) * 1.0 / NULLIF(COUNT(*), 0) as accuracy_rate,
        ...
    FROM llm_mappings
'''))
```

**OPTIMIZED (Fast - uses summary table)**:
```python
# Try summary table first (instant)
result = conn.execute(text("""
    SELECT total_mappings, approved_count, pending_count, rejected_count,
           daily_processed, avg_confidence, high_confidence_count, last_updated
    FROM llm_mappings_summary
    ORDER BY last_updated DESC
    LIMIT 1
"""))
summary = result.fetchone()

if summary:
    summary_time = summary[7]  # last_updated
    age_seconds = (datetime.now() - summary_time).total_seconds()
    
    if age_seconds < 600:  # Less than 10 minutes old
        # Use summary (fast)
        total_mappings = summary[0] or 0
        daily_processed = summary[4] or 0
        approved_count = summary[1] or 0
        pending_count = summary[2] or 0
        rejected_count = summary[3] or 0
        avg_approved_confidence = summary[5] or 0
        high_confidence_count = summary[6] or 0
        
        # Calculate derived metrics
        accuracy_rate = round((approved_count / total_mappings * 100) if total_mappings > 0 else 0, 1)
        auto_approval_rate = accuracy_rate
    else:
        # Summary is stale, use indexed query (still fast with indexes)
        result = conn.execute(text('''
            SELECT 
                COUNT(*) as total_mappings,
                COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as daily_processed,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                AVG(CASE WHEN status = 'approved' THEN confidence END) as avg_approved_confidence,
                COUNT(CASE WHEN status = 'approved' AND confidence > 90 THEN 1 END) as high_confidence_count
            FROM llm_mappings
        '''))
        row = result.fetchone()
        total_mappings = row[0] or 0
        daily_processed = row[1] or 0
        approved_count = row[2] or 0
        pending_count = row[3] or 0
        rejected_count = row[4] or 0
        avg_approved_confidence = row[5] or 0
        high_confidence_count = row[6] or 0
        accuracy_rate = round((approved_count / total_mappings * 100) if total_mappings > 0 else 0, 1)
        auto_approval_rate = accuracy_rate
else:
    # No summary yet, use indexed query
    result = conn.execute(text('''
        SELECT 
            COUNT(*) as total_mappings,
            COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as daily_processed,
            COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
            ...
        FROM llm_mappings
    '''))
    # ... rest of code
```

### 2. Database Stats (`app.py` ~line 5032)

**CURRENT**:
```python
result = conn.execute(text('SELECT COUNT(*) FROM llm_mappings'))
stats['total']['llm_mappings'] = result.scalar() or 0
```

**OPTIMIZED**:
```python
# Try summary table first
result = conn.execute(text("""
    SELECT total_mappings FROM llm_mappings_summary 
    ORDER BY last_updated DESC LIMIT 1
"""))
llm_count = result.scalar() if result else None

if llm_count is None:
    # Fallback to indexed query
    result = conn.execute(text('SELECT COUNT(*) FROM llm_mappings'))
    llm_count = result.scalar() or 0

stats['total']['llm_mappings'] = llm_count
```

### 3. Add Summary Update Function

Add this function to `app.py` (near other admin functions):

```python
def update_llm_mappings_summary():
    """Update llm_mappings summary table with current stats"""
    try:
        conn = db_manager.get_connection()
        use_postgresql = getattr(db_manager, '_use_postgresql', False)
        
        if use_postgresql:
            from sqlalchemy import text
            # Calculate stats using indexes
            result = conn.execute(text("""
                SELECT 
                    COUNT(*) as total_mappings,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                    COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as daily_processed,
                    AVG(confidence) as avg_confidence,
                    COUNT(CASE WHEN confidence > 90 THEN 1 END) as high_confidence_count
                FROM llm_mappings
            """))
            stats = result.fetchone()
            
            # Insert or update summary
            conn.execute(text("""
                INSERT INTO llm_mappings_summary 
                (total_mappings, approved_count, pending_count, rejected_count, 
                 daily_processed, avg_confidence, high_confidence_count, last_updated)
                VALUES (:total, :approved, :pending, :rejected, :daily, :avg_conf, :high_conf, CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE SET
                    total_mappings = EXCLUDED.total_mappings,
                    approved_count = EXCLUDED.approved_count,
                    pending_count = EXCLUDED.pending_count,
                    rejected_count = EXCLUDED.rejected_count,
                    daily_processed = EXCLUDED.daily_processed,
                    avg_confidence = EXCLUDED.avg_confidence,
                    high_confidence_count = EXCLUDED.high_confidence_count,
                    last_updated = CURRENT_TIMESTAMP
            """), {
                'total': stats[0] or 0,
                'approved': stats[1] or 0,
                'pending': stats[2] or 0,
                'rejected': stats[3] or 0,
                'daily': stats[4] or 0,
                'avg_conf': float(stats[5] or 0),
                'high_conf': stats[6] or 0
            })
            
            conn.commit()
            db_manager.release_connection(conn)
        else:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_mappings,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                    COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as daily_processed,
                    AVG(confidence) as avg_confidence,
                    COUNT(CASE WHEN confidence > 90 THEN 1 END) as high_confidence_count
                FROM llm_mappings
            """)
            stats = cursor.fetchone()
            
            # Delete old and insert new (SQLite doesn't support ON CONFLICT)
            cursor.execute("DELETE FROM llm_mappings_summary")
            cursor.execute("""
                INSERT INTO llm_mappings_summary 
                (total_mappings, approved_count, pending_count, rejected_count, 
                 daily_processed, avg_confidence, high_confidence_count, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (
                stats[0] or 0,
                stats[1] or 0,
                stats[2] or 0,
                stats[3] or 0,
                stats[4] or 0,
                float(stats[5] or 0) if stats[5] else 0.0,
                stats[6] or 0
            ))
            
            conn.commit()
            conn.close()
        
        print("[SUMMARY] Updated llm_mappings_summary table")
    except Exception as e:
        print(f"[ERROR] Failed to update summary: {e}")
        import traceback
        print(traceback.format_exc())
```

### 4. Schedule Summary Updates

In the scheduler section (around line 136), add:

```python
# Update llm_mappings summary every 5 minutes
scheduler.add_job(
    update_llm_mappings_summary,
    trigger=CronTrigger(minute='*/5'),  # Every 5 minutes
    id='update_llm_summary',
    name='Update LLM Mappings Summary',
    replace_existing=True
)
```

## Testing

After making changes:

1. **Test Summary Table**:
```bash
python -c "
from database_manager import db_manager, _ensure_db_manager
db_manager = _ensure_db_manager()
conn = db_manager.get_connection()
if db_manager._use_postgresql:
    from sqlalchemy import text
    result = conn.execute(text('SELECT * FROM llm_mappings_summary ORDER BY last_updated DESC LIMIT 1'))
    print(result.fetchone())
else:
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM llm_mappings_summary ORDER BY last_updated DESC LIMIT 1')
    print(cursor.fetchone())
"
```

2. **Test Endpoint Performance**:
- Before: Time the `/api/admin/llm-center/dashboard` endpoint
- After: Time it again - should be 10-100x faster

3. **Monitor**:
- Check that summary updates every 5 minutes
- Verify fallback to indexed queries works if summary is stale

## Rollback Plan

If issues occur:
1. Summary table is read-only - doesn't affect main data
2. Endpoints fall back to indexed queries automatically
3. Can disable summary updates by removing scheduler job
4. Can remove summary table: `DROP TABLE llm_mappings_summary`


