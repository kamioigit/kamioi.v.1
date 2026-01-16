# Transaction LLM Mapping Audit Report
**Date:** 2025-11-16  
**Issue:** Transactions uploaded via bank file upload are not being automatically processed through LLM Center

## Executive Summary

After uploading 30 transactions via the business bank file upload endpoint (`/api/business/upload-bank-file`), these transactions are being inserted into the database with status `'pending'` but are **NOT being automatically processed** through the LLM mapping system. The LLM Center shows 14.6M mappings available, but new transactions are not triggering the automatic mapping process.

## Key Findings

### 1. **Missing Automatic Processing Trigger**

**Location:** `backend/app.py` - `business_upload_bank_file()` function (lines 16880-16914)

**Issue:** When transactions are inserted via bank file upload, they are:
- ✅ Successfully inserted into the `transactions` table
- ✅ Set with status `'pending'`
- ❌ **NOT automatically processed through LLM mapping system**
- ❌ **NOT triggering any webhook or event to LLM Center**

**Code Analysis:**
```python
# Current code only inserts transactions - NO automatic processing
result = conn.execute(text('''
    INSERT INTO transactions 
    (user_id, amount, merchant, category, date, description, round_up, fee, total_debit, status, created_at)
    VALUES (:user_id, :amount, :merchant, :category, :date, :description, :round_up, :fee, :total_debit, 'pending', :created_at)
    RETURNING id
'''), {...})
```

### 2. **Auto-Mapping Pipeline Exists But Not Called**

**Location:** `backend/app.py` (lines 6180-6250)

**Finding:** There IS an auto-mapping system (`auto_mapping_pipeline`) that can process transactions, but it's only called in specific endpoints (like dashboard overview), NOT when new transactions are inserted via bank upload.

**Existing Auto-Mapping Code:**
```python
# This code exists but is NOT called after bank upload
if AUTO_MAPPING_AVAILABLE and auto_mapping_pipeline:
    mapping_result = auto_mapping_pipeline.map_merchant(merchant)
    ticker = mapping_result.ticker
    # Updates transaction with ticker and sets status to 'mapped'
```

### 3. **LLM Center Flow Not Receiving Transactions**

**Location:** `backend/routes/llm_processing.py`

**Finding:** The LLM Center has processing endpoints (`/api/admin/llm-center/process-mapping/<id>`), but these require:
- Manual triggering via admin interface
- OR transactions to be in `llm_mappings` table first

**Issue:** Bank upload transactions go directly to `transactions` table, bypassing the `llm_mappings` table entirely.

### 4. **Missing Transaction-to-LLM-Mapping Bridge**

**Problem:** There's no automatic system that:
1. Detects new `pending` transactions in `transactions` table
2. Creates corresponding records in `llm_mappings` table
3. Triggers LLM processing for those mappings
4. Updates the original transaction with the mapping results

## Root Cause Analysis

### Primary Issue: **No Event-Driven Processing**

The system architecture appears to expect:
- **Manual processing** via admin LLM Center interface
- **OR** transactions to be created through specific flows that trigger processing

But bank file uploads create transactions **without triggering any processing pipeline**.

### Secondary Issue: **Database Schema Separation**

- `transactions` table: Stores actual transaction data
- `llm_mappings` table: Stores merchant-to-ticker mappings for processing

These tables are **not automatically synchronized**. A transaction can exist without a corresponding LLM mapping record.

## Specific Example: Verizon Business

**Transaction Details:**
- Merchant: "Verizon Business" or "VERIZON BUSINESS"
- Status: `pending`
- Ticker: `NULL`

**Why It's Not Mapped:**
1. Transaction inserted with status `'pending'`
2. No automatic lookup in `llm_mappings` table (14.6M records)
3. No automatic call to `auto_mapping_pipeline.map_merchant()`
4. No webhook/event sent to LLM Center
5. Transaction remains `pending` indefinitely

**Expected Behavior:**
1. Transaction inserted
2. System should query `llm_mappings` for "Verizon Business" → Find `VZ` ticker
3. OR call `auto_mapping_pipeline.map_merchant("Verizon Business")` → Get `VZ`
4. Update transaction: `ticker = 'VZ'`, `status = 'mapped'`
5. Create LLM mapping record for tracking

## Recommendations

### Immediate Fix (High Priority)

**1. Add Automatic Processing After Bank Upload**

Modify `business_upload_bank_file()` to process transactions immediately after insertion:

```python
# After inserting transaction
transaction_id = result.scalar()

# IMMEDIATELY process through LLM mapping
try:
    # Option 1: Query existing llm_mappings table
    mapping_result = db_manager.get_llm_mapping_by_merchant(merchant_name)
    if mapping_result:
        ticker = mapping_result.get('ticker')
        category = mapping_result.get('category', category)
        # Update transaction
        conn.execute(text('''
            UPDATE transactions 
            SET ticker = :ticker, category = :category, status = 'mapped'
            WHERE id = :transaction_id
        '''), {'ticker': ticker, 'category': category, 'transaction_id': transaction_id})
    
    # Option 2: Use auto_mapping_pipeline if available
    elif AUTO_MAPPING_AVAILABLE and auto_mapping_pipeline:
        mapping_result = auto_mapping_pipeline.map_merchant(merchant_name)
        ticker = mapping_result.ticker if hasattr(mapping_result, 'ticker') else mapping_result.get('ticker')
        if ticker:
            conn.execute(text('''
                UPDATE transactions 
                SET ticker = :ticker, status = 'mapped'
                WHERE id = :transaction_id
            '''), {'ticker': ticker, 'transaction_id': transaction_id})
except Exception as e:
    print(f"[BUSINESS BANK UPLOAD] Error processing transaction {transaction_id}: {e}")
    # Continue - transaction is still saved
```

**2. Create LLM Mapping Records**

After processing, create records in `llm_mappings` table for tracking:

```python
# Create LLM mapping record for LLM Center visibility
conn.execute(text('''
    INSERT INTO llm_mappings 
    (merchant_name, ticker, category, user_id, transaction_id, status, confidence, admin_approved, ai_processed)
    VALUES (:merchant, :ticker, :category, :user_id, :transaction_id, 'approved', 100.0, 1, 1)
'''), {
    'merchant': merchant_name,
    'ticker': ticker,
    'category': category,
    'user_id': user_id,
    'transaction_id': transaction_id
})
```

### Long-Term Solution (Medium Priority)

**1. Implement Event-Driven Processing**

Create a background worker or webhook system that:
- Monitors `transactions` table for new `pending` records
- Automatically processes them through LLM mapping
- Updates status and creates LLM mapping records

**2. Database Trigger (PostgreSQL)**

If using PostgreSQL, create a trigger that automatically processes new transactions:

```sql
CREATE OR REPLACE FUNCTION process_new_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-process transaction through LLM mapping
    -- This would call the auto_mapping_pipeline
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_auto_process
AFTER INSERT ON transactions
FOR EACH ROW
WHEN (NEW.status = 'pending' AND NEW.ticker IS NULL)
EXECUTE FUNCTION process_new_transaction();
```

**3. Real-Time Processing Queue**

Implement a queue system (Redis/RabbitMQ) that:
- Receives transaction creation events
- Processes them through LLM mapping asynchronously
- Updates transactions and creates LLM mapping records
- Provides visibility in LLM Center Flow tab

## Testing Recommendations

1. **Test Immediate Fix:**
   - Upload bank file with known merchants (Verizon, Amazon, etc.)
   - Verify transactions are automatically mapped
   - Check LLM Center Flow tab shows processing activity

2. **Verify LLM Mappings Table:**
   - Query `llm_mappings` for "Verizon Business" or "VERIZON BUSINESS"
   - Confirm mapping exists with ticker `VZ`
   - Check if query is case-sensitive

3. **Test Auto-Mapping Pipeline:**
   - Verify `auto_mapping_pipeline` is available and working
   - Test `auto_mapping_pipeline.map_merchant("Verizon Business")`
   - Confirm it returns correct ticker

## Files to Modify

1. **`backend/app.py`** - `business_upload_bank_file()` function
   - Add automatic processing after transaction insertion
   - Add LLM mapping record creation

2. **`backend/database_manager.py`** (if needed)
   - Add helper method: `get_llm_mapping_by_merchant(merchant_name)`
   - Optimize query for fast lookups

3. **`backend/routes/llm_processing.py`** (optional)
   - Add endpoint to process pending transactions in bulk
   - Add webhook endpoint for transaction events

## Implementation Status

### ✅ FIXED - Automatic LLM Mapping Added

**Implementation Date:** 2025-11-16  
**Location:** `backend/app.py` - `business_upload_bank_file()` function (lines 16916-17044)

**What Was Added:**
1. **Automatic LLM Mapping Lookup** - After each transaction is inserted, the system now:
   - Queries the `llm_mappings` table (14.6M records) for matching merchant name (case-insensitive)
   - Looks for approved mappings with highest confidence
   - If found, automatically updates transaction with ticker and sets status to `'mapped'`

2. **Auto-Mapping Pipeline Fallback** - If no LLM mapping exists:
   - Attempts to use `auto_mapping_pipeline.map_merchant()` 
   - If successful, updates transaction with ticker and status

3. **LLM Mapping Record Creation** - For tracking and LLM Center visibility:
   - Creates records in `llm_mappings` table when transactions are auto-mapped
   - Links transaction_id to mapping for traceability
   - Sets status to 'approved' with 100% confidence

**How It Works:**
```
Transaction Inserted → Query llm_mappings table → Found? → Update transaction (ticker + status='mapped')
                                    ↓ Not Found
                         Try auto_mapping_pipeline → Success? → Update transaction
                                    ↓ Still Not Found
                         Transaction remains 'pending' (manual processing needed)
```

**Expected Results:**
- Transactions with known merchants (Verizon Business, Amazon, etc.) should now be automatically mapped
- Status changes from `'pending'` to `'mapped'` immediately
- Ticker symbol is populated (e.g., VZ for Verizon Business)
- LLM Center Flow tab should show processing activity (via llm_mappings records)

## Conclusion

**Root Cause:** Bank file uploads were creating transactions without triggering the LLM mapping pipeline.

**Status:** ✅ **FIXED** - Automatic LLM mapping processing has been implemented.

**Next Steps:**
1. Restart backend server to load the fix
2. Re-upload the bank file to test automatic mapping
3. Verify transactions are now showing status='mapped' with tickers
4. Check LLM Center Flow tab for processing activity

**Testing Checklist:**
- [ ] Upload bank file with known merchants (Verizon, Amazon, etc.)
- [ ] Verify transactions show status='mapped' (not 'pending')
- [ ] Verify ticker symbols are populated (VZ, AMZN, etc.)
- [ ] Check LLM Center Flow tab shows processing
- [ ] Verify llm_mappings table has new records

