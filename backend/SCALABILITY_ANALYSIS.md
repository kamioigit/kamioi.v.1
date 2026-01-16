# Transaction Processing Scalability Analysis

## Current Performance Issues

### Problem: Sequential Processing
**Current Approach:**
- Processes transactions **one-by-one** in a loop
- Each transaction requires:
  - 1 INSERT query
  - 3-5 SELECT queries for LLM mapping (exact, normalized, partial)
  - 1 UPDATE query (if mapping found)
  - 1 INSERT query for LLM mapping record

**For 1,000 transactions:**
- **Database queries:** ~5,000-7,000 queries
- **Estimated time:** 5-10 minutes (with current slow queries)
- **For 1,000,000 transactions:** ~5-7 million queries = **DAYS of processing**

### Critical Bottlenecks:

1. **LLM Mapping Queries (Per Transaction):**
   - Exact match query
   - Normalized match query  
   - Partial match query (even optimized, still slow)
   - Each query hits the database separately

2. **No Batching:**
   - Each transaction is processed individually
   - No bulk operations
   - No connection pooling optimization

3. **Synchronous Processing:**
   - Blocks HTTP request during entire processing
   - User waits for all transactions to complete
   - Timeout risk (5 minute limit)

4. **Memory Issues:**
   - All transactions loaded into memory
   - No streaming or chunking
   - Risk of OOM (Out of Memory) with large files

---

## Scalability Solutions

### Solution 1: Batch LLM Mapping Lookups (IMMEDIATE FIX)

**Current:** Query LLM mappings one transaction at a time
**Optimized:** Query all merchant names at once, create lookup map

**Implementation:**
```python
# BEFORE (Current - Slow):
for transaction in transactions:
    mapping = query_llm_mapping(transaction.merchant)  # 1 query per transaction

# AFTER (Optimized - Fast):
all_merchants = [t.merchant for t in transactions]
mapping_map = bulk_query_llm_mappings(all_merchants)  # 1 query for all
for transaction in transactions:
    mapping = mapping_map.get(transaction.merchant)  # In-memory lookup
```

**Performance Gain:** 
- 1,000 transactions: 1,000 queries → 1 query (1000x faster)
- 1,000,000 transactions: 1,000,000 queries → 1 query (1,000,000x faster)

### Solution 2: Bulk Database Inserts

**Current:** INSERT one transaction at a time
**Optimized:** Bulk INSERT using executemany() or VALUES clause

**Implementation:**
```python
# BEFORE (Current):
for transaction in transactions:
    cursor.execute('INSERT INTO transactions ...', (values,))

# AFTER (Optimized):
cursor.executemany('INSERT INTO transactions ...', (all_values,))
# Or for PostgreSQL:
# INSERT INTO transactions (...) VALUES (...), (...), (...)
```

**Performance Gain:**
- 1,000 transactions: 1,000 INSERTs → 1 bulk INSERT (1000x faster)
- Reduces database round-trips dramatically

### Solution 3: Background Job Processing

**Current:** Process during HTTP request (blocks user)
**Optimized:** Queue transactions, process in background

**Architecture:**
1. Upload endpoint: Insert transactions with `status='pending'` quickly
2. Return success immediately to user
3. Background worker: Process pending transactions asynchronously
4. Update status as processing completes

**Benefits:**
- User doesn't wait
- No timeout issues
- Can process millions of transactions
- Can scale workers horizontally

### Solution 4: Chunked Processing

**Current:** Load entire file into memory
**Optimized:** Process file in chunks

**Implementation:**
- Read file in chunks (e.g., 1000 rows at a time)
- Process chunk
- Commit chunk
- Move to next chunk

**Benefits:**
- Lower memory usage
- Can handle files of any size
- Progress tracking per chunk

---

## Recommended Implementation Plan

### Phase 1: Immediate Optimizations (Do Now)
1. **Batch LLM Mapping Lookups** - Single query for all merchants
2. **Bulk INSERT** - Use executemany() for transactions
3. **Remove Slow Partial Queries** - Only use exact/normalized matches during upload
4. **Add Database Indexes** - Index on `llm_mappings.merchant_name` and `status`

### Phase 2: Background Processing (Next)
1. **Queue System** - Add transactions to processing queue
2. **Background Worker** - Separate process/thread for processing
3. **Progress Tracking** - User can check processing status
4. **Retry Logic** - Handle failures gracefully

### Phase 3: Advanced Scaling (Future)
1. **Distributed Processing** - Multiple workers
2. **Message Queue** - Redis/RabbitMQ for job distribution
3. **Caching** - Cache LLM mappings in Redis
4. **Streaming** - Process file as it's uploaded

---

## Performance Projections

### Current System (1,000 transactions):
- **Time:** 5-10 minutes
- **Queries:** ~5,000-7,000
- **Memory:** ~50-100 MB

### Current System (1,000,000 transactions):
- **Time:** 83-166 HOURS (3.5-7 DAYS) ❌
- **Queries:** ~5,000,000-7,000,000
- **Memory:** ~50-100 GB ❌
- **Result:** WILL CRASH/TIMEOUT

### Optimized System (1,000 transactions):
- **Time:** 5-10 SECONDS ✅
- **Queries:** ~10-20 (bulk operations)
- **Memory:** ~10-20 MB ✅

### Optimized System (1,000,000 transactions):
- **Time:** 1-2 HOURS ✅
- **Queries:** ~10,000-20,000 (bulk operations)
- **Memory:** ~100-200 MB ✅
- **Result:** HANDLES SCALE

---

## Critical: Implement Batch Processing NOW

The current system will NOT scale. We need to implement batch processing immediately.

