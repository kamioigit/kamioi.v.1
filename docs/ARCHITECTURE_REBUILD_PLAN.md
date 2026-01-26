# Kamioi Architecture Rebuild Plan

## Executive Summary

The current architecture cannot scale beyond a few million records. This document outlines the changes needed to support 15M+ LLM mappings and thousands of concurrent users.

---

## Current Architecture Problems

### 1. Database Layer

| Problem | Impact | Evidence |
|---------|--------|----------|
| **Free-tier database (1GB limit)** | Can't store production data | Ran out of space at 3.6M mappings |
| **No connection pooling** | Connection exhaustion under load | Each request opens new connection |
| **Missing indexes** | Full table scans on every query | Dashboard takes 10+ seconds to load |
| **No read replicas** | Analytics queries block transactions | Single database for all operations |
| **SQLite for local development** | Schema drift, testing issues | Different DB engines in dev vs prod |

### 2. Caching Layer

| Problem | Impact |
|---------|--------|
| **No caching** | Every request hits the database |
| **No session caching** | Auth checks hit DB repeatedly |
| **No query result caching** | Same stats computed thousands of times |
| **No CDN for static assets** | Slow global load times |

### 3. API Design

| Problem | Impact |
|---------|--------|
| **No pagination on list endpoints** | Memory exhaustion on large datasets |
| **Frontend polling** | Unnecessary server load |
| **Synchronous bulk operations** | Timeouts on large uploads |
| **No rate limiting** | Vulnerable to abuse |
| **Monolithic backend** | Can't scale components independently |

### 4. Frontend

| Problem | Impact |
|---------|--------|
| **Polling every 2-5 seconds** | Excessive API calls |
| **Loading all data at once** | Slow initial render |
| **No virtualization for large lists** | Browser crashes on 1000+ items |
| **No service workers** | No offline capability |

---

## Proposed Architecture

```
                                    ┌─────────────────┐
                                    │   CloudFlare    │
                                    │   CDN + WAF     │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
            ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
            │   Vercel      │       │   Render      │       │   Render      │
            │   Frontend    │       │   API Server  │       │   Worker      │
            │   (React)     │       │   (Flask)     │       │   (Celery)    │
            └───────────────┘       └───────┬───────┘       └───────┬───────┘
                                            │                       │
                    ┌───────────────────────┴───────────────────────┴─────┐
                    │                                                      │
            ┌───────▼───────┐                                     ┌───────▼───────┐
            │   Upstash     │                                     │   Supabase    │
            │   Redis       │                                     │   PostgreSQL  │
            │   (Cache)     │                                     │   (Database)  │
            └───────────────┘                                     └───────────────┘
```

---

## Technology Recommendations

### Database: Supabase (PostgreSQL)

**Why Supabase over Render PostgreSQL:**
- Free tier: 500MB (same)
- Pro tier ($25/mo): 8GB storage, connection pooling, daily backups
- Built-in Row Level Security
- Real-time subscriptions (replace polling)
- Better dashboard and monitoring

**Alternative: PlanetScale (MySQL)**
- Generous free tier (5GB)
- Automatic scaling
- Branching for safe migrations

### Caching: Upstash Redis

**Why Upstash:**
- Serverless (pay per request)
- Global edge locations
- Free tier: 10,000 requests/day
- Pro: $0.20 per 100K requests

**What to cache:**
```python
# Cache dashboard stats for 5 minutes
CACHE_KEY = "admin:dashboard:stats"
TTL = 300  # seconds

stats = redis.get(CACHE_KEY)
if not stats:
    stats = compute_dashboard_stats()
    redis.setex(CACHE_KEY, TTL, json.dumps(stats))
```

### Background Jobs: Celery + Redis

**Use for:**
- Bulk uploads (process in chunks)
- LLM processing
- Report generation
- Email notifications

```python
@celery.task
def process_bulk_upload(file_path, job_id):
    for chunk in read_csv_chunks(file_path, size=10000):
        insert_mappings(chunk)
        update_job_progress(job_id, chunk.count)
```

### Real-time Updates: Supabase Realtime or Pusher

**Replace polling with:**
```javascript
// Instead of polling every 2 seconds
const subscription = supabase
  .channel('transactions')
  .on('postgres_changes', { event: '*', schema: 'public' },
    payload => updateUI(payload))
  .subscribe()
```

---

## Database Schema Improvements

### 1. Add Proper Indexes

```sql
-- Current: Missing critical indexes
-- Proposed: Comprehensive index strategy

-- For LLM mappings queries
CREATE INDEX idx_llm_merchant_lower ON llm_mappings(LOWER(merchant_name));
CREATE INDEX idx_llm_status_approved ON llm_mappings(status, admin_approved);
CREATE INDEX idx_llm_category ON llm_mappings(category);
CREATE INDEX idx_llm_created ON llm_mappings(created_at DESC);

-- For transaction queries
CREATE INDEX idx_txn_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_txn_status ON transactions(status);

-- Partial indexes for common filters
CREATE INDEX idx_llm_pending ON llm_mappings(id) WHERE status = 'pending';
```

### 2. Add Stats Table (Materialized View Alternative)

```sql
-- Pre-computed stats updated by triggers
CREATE TABLE dashboard_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_mappings INTEGER DEFAULT 0,
    approved_mappings INTEGER DEFAULT 0,
    pending_mappings INTEGER DEFAULT 0,
    avg_confidence DECIMAL(5,4) DEFAULT 0,
    unique_categories INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Trigger to update stats on mapping changes
CREATE OR REPLACE FUNCTION update_mapping_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE dashboard_stats SET
        total_mappings = (SELECT COUNT(*) FROM llm_mappings),
        approved_mappings = (SELECT COUNT(*) FROM llm_mappings WHERE admin_approved = 1),
        pending_mappings = (SELECT COUNT(*) FROM llm_mappings WHERE status = 'pending'),
        last_updated = NOW()
    WHERE id = 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Partition Large Tables

```sql
-- Partition llm_mappings by created_at for faster queries
CREATE TABLE llm_mappings_partitioned (
    id SERIAL,
    merchant_name VARCHAR(500),
    -- ... other columns
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE llm_mappings_2024 PARTITION OF llm_mappings_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE llm_mappings_2025 PARTITION OF llm_mappings_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

---

## API Improvements

### 1. Proper Pagination

```python
# Current: Load all data
@app.route('/api/admin/mappings')
def get_mappings():
    return query_all_mappings()  # BAD: Returns millions of rows

# Proposed: Cursor-based pagination
@app.route('/api/admin/mappings')
def get_mappings():
    cursor = request.args.get('cursor')
    limit = min(int(request.args.get('limit', 50)), 100)

    mappings = query_mappings_after_cursor(cursor, limit + 1)

    has_more = len(mappings) > limit
    next_cursor = mappings[limit - 1]['id'] if has_more else None

    return {
        'data': mappings[:limit],
        'next_cursor': next_cursor,
        'has_more': has_more
    }
```

### 2. Response Compression

```python
from flask_compress import Compress

compress = Compress()
compress.init_app(app)

# Automatically compresses responses > 500 bytes
# Reduces bandwidth by 70-90%
```

### 3. Rate Limiting

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/admin/bulk-upload')
@limiter.limit("5 per hour")
def bulk_upload():
    pass
```

### 4. Connection Pooling

```python
from psycopg2 import pool

# Create pool on startup
connection_pool = pool.ThreadedConnectionPool(
    minconn=5,
    maxconn=20,
    dsn=DATABASE_URL
)

def get_db_connection():
    return connection_pool.getconn()

def release_db_connection(conn):
    connection_pool.putconn(conn)
```

---

## Frontend Improvements

### 1. Virtual Scrolling for Large Lists

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

function MappingsList({ mappings }) {
    const virtualizer = useVirtualizer({
        count: mappings.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,
    });

    return (
        <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
            {virtualizer.getVirtualItems().map(virtualRow => (
                <MappingRow key={virtualRow.key} mapping={mappings[virtualRow.index]} />
            ))}
        </div>
    );
}
```

### 2. Debounced Search

```javascript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((term) => {
    fetchMappings({ search: term });
}, 300);

<input onChange={(e) => debouncedSearch(e.target.value)} />
```

### 3. Optimistic Updates

```javascript
const updateMapping = async (id, data) => {
    // Update UI immediately
    setMappings(prev => prev.map(m =>
        m.id === id ? { ...m, ...data } : m
    ));

    try {
        await api.updateMapping(id, data);
    } catch (error) {
        // Revert on failure
        setMappings(prev => prev.map(m =>
            m.id === id ? originalMapping : m
        ));
        showError(error);
    }
};
```

### 4. Service Worker for Offline Support

```javascript
// sw.js
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                return fetch(event.request)
                    .then(response => {
                        // Cache successful responses
                        const clone = response.clone();
                        caches.open('api-cache').then(cache => {
                            cache.put(event.request, clone);
                        });
                        return response;
                    })
                    .catch(() => cached); // Return cached on network failure
            })
        );
    }
});
```

---

## Deployment Architecture

### Current
```
Frontend: Vercel (free)
Backend: Render (free)
Database: Render PostgreSQL (free, 1GB limit)
```

### Proposed (Production)
```
Frontend: Vercel Pro ($20/mo)
  - Better performance
  - Analytics
  - Team features

Backend: Render Standard ($25/mo)
  - 4GB RAM
  - Auto-scaling
  - Better uptime

Database: Supabase Pro ($25/mo)
  - 8GB storage
  - Connection pooling
  - Daily backups
  - Realtime subscriptions

Cache: Upstash Redis ($10/mo)
  - 10M requests/month
  - Global edge

Worker: Render Background Worker ($7/mo)
  - Process bulk uploads
  - Async jobs

CDN: Cloudflare (free tier)
  - DDoS protection
  - Global caching

Total: ~$87/month
```

### Proposed (Scale)
```
Frontend: Vercel Enterprise
Backend: AWS ECS or Kubernetes
Database: AWS RDS PostgreSQL (Multi-AZ)
Cache: AWS ElastiCache Redis
Queue: AWS SQS + Lambda
CDN: CloudFront

Estimated: $300-500/month for moderate load
```

---

## Migration Path

### Phase 1: Immediate Fixes (Week 1)
- [x] Reduce data to 1M rows
- [x] Add missing indexes
- [ ] Add connection pooling
- [ ] Add response compression
- [ ] Implement proper pagination

### Phase 2: Caching Layer (Week 2)
- [ ] Set up Upstash Redis
- [ ] Cache dashboard stats (5 min TTL)
- [ ] Cache user sessions
- [ ] Cache frequent queries

### Phase 3: Database Migration (Week 3)
- [ ] Set up Supabase
- [ ] Migrate schema
- [ ] Set up connection pooling
- [ ] Add read replica for analytics

### Phase 4: Background Jobs (Week 4)
- [ ] Set up Celery + Redis
- [ ] Move bulk uploads to background
- [ ] Move LLM processing to background
- [ ] Add job monitoring

### Phase 5: Real-time (Week 5)
- [ ] Replace polling with WebSockets
- [ ] Implement Supabase Realtime
- [ ] Update frontend for real-time updates

### Phase 6: Frontend Optimization (Week 6)
- [ ] Add virtual scrolling
- [ ] Implement service worker
- [ ] Add optimistic updates
- [ ] Performance audit

---

## Cost Comparison

| Configuration | Monthly Cost | Capacity |
|--------------|--------------|----------|
| Current (Free tiers) | $0 | ~1M mappings, 100 users |
| Basic Production | $87 | ~10M mappings, 1000 users |
| Scale Production | $300-500 | ~100M mappings, 10K+ users |

---

## Metrics to Track

After rebuild, monitor:

1. **API Response Time** - Target: < 200ms p95
2. **Database Query Time** - Target: < 50ms p95
3. **Cache Hit Rate** - Target: > 80%
4. **Error Rate** - Target: < 0.1%
5. **Concurrent Users** - Capacity test regularly
6. **Database Size** - Alert at 80% capacity

---

## Conclusion

The current architecture is unsuitable for production scale. The rebuild requires:

1. **Better database** - More storage, connection pooling, read replicas
2. **Caching layer** - Redis for hot data
3. **Background processing** - Celery for heavy tasks
4. **Real-time updates** - WebSockets instead of polling
5. **Frontend optimization** - Virtual scrolling, service workers

Estimated effort: **4-6 weeks** for a senior developer
Estimated cost increase: **$0 → $87/month** for production-ready

This investment will enable:
- 15M+ LLM mappings
- Thousands of concurrent users
- Sub-second response times
- 99.9% uptime
