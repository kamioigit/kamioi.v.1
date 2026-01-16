"""
Receipt to LLM Center Integration
Submits receipt processing results to LLM Center for learning and approval
"""

from flask import Blueprint, request, jsonify
import logging
import json
import uuid
from datetime import datetime
from database_manager import db_manager

logger = logging.getLogger(__name__)

receipt_llm_bp = Blueprint('receipt_llm', __name__)


def get_auth_user():
    """Get authenticated user from request"""
    # Import here to avoid circular import
    from app import get_auth_user as _get_auth_user
    return _get_auth_user()


@receipt_llm_bp.route('/api/receipts/submit-to-llm', methods=['POST', 'OPTIONS'])
def submit_receipt_to_llm():
    """
    Submit receipt processing result to LLM Center as a pending mapping
    This allows the LLM to learn from user corrections and improve future processing
    """
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        # Get user
        user = get_auth_user()
        if not user:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        
        data = request.json
        receipt_data = data.get('receiptData')
        allocation = data.get('allocation')
        receipt_id = data.get('receiptId')
        raw_ocr_text = data.get('rawOcrText', '')
        corrections = data.get('corrections', {})  # User corrections if any
        
        logger.info(f"[LLM SUBMIT] Submitting receipt {receipt_id} to LLM Center with {len(corrections) if corrections else 0} corrections")
        logger.info(f"[LLM SUBMIT] Receipt data: {receipt_data}")
        logger.info(f"[LLM SUBMIT] Allocation: {allocation}")
        logger.info(f"[LLM SUBMIT] Receipt ID: {receipt_id}")
        
        if not receipt_id:
            return jsonify({'success': False, 'error': 'Missing receipt_id'}), 400
        
        if not receipt_data and not allocation:
            return jsonify({'success': False, 'error': 'Missing receipt data or allocation'}), 400
        
        user_id = user.get('id')
        # Ensure user_id is an integer
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except:
                logger.error(f"[LLM SUBMIT] Invalid user_id: {user_id}")
                return jsonify({'success': False, 'error': 'Invalid user ID'}), 400
        
        logger.info(f"[LLM SUBMIT] Processing receipt for user_id={user_id} (type: {type(user_id)})")
        
        retailer = receipt_data.get('retailer', {})
        merchant_name = retailer.get('name', 'Unknown Merchant') if isinstance(retailer, dict) else str(retailer)
        
        # Get receipt file path if available
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        receipt_file_path = None
        if receipt_id:
            try:
                cursor.execute("SELECT file_path FROM receipts WHERE id = ?", (receipt_id,))
                receipt_row = cursor.fetchone()
                if receipt_row:
                    receipt_file_path = receipt_row[0]
            except Exception as e:
                logger.warning(f"Could not get receipt file path: {e}")
        
        # Create LLM mapping entry for the receipt
        # This will be stored in llm_mappings table for review and learning
        mapping_id = str(uuid.uuid4())
        
        # Extract key information for learning
        items = receipt_data.get('items', [])
        logger.info(f"[LLM SUBMIT] Found {len(items)} line items in receipt")
        
        brands = []
        for item in items:
            brand = item.get('brand')
            if isinstance(brand, dict):
                brands.append(brand.get('name', ''))
            elif brand:
                brands.append(str(brand))
        
        # Create mapping data structure
        mapping_data = {
            'receipt_id': receipt_id,
            'merchant_name': merchant_name,
            'retailer': retailer,
            'items': items,
            'brands': brands,
            'total_amount': receipt_data.get('totalAmount', 0.0),
            'allocation': allocation,
            'raw_ocr_text': raw_ocr_text,
            'corrections': corrections,  # User corrections for learning
            'processing_timestamp': datetime.now().isoformat(),
            'has_user_corrections': bool(corrections and (corrections.get('retailer') or corrections.get('items') or corrections.get('totalAmount')))
        }
        
        # Ensure llm_mappings table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS llm_mappings (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                merchant_name TEXT,
                ticker TEXT,
                company_name TEXT,
                category TEXT,
                confidence REAL DEFAULT 0.8,
                status TEXT DEFAULT 'pending',
                admin_approved INTEGER DEFAULT 0,
                admin_reviewed INTEGER DEFAULT 0,
                user_feedback TEXT,
                source_type TEXT DEFAULT 'receipt_processing',
                receipt_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (receipt_id) REFERENCES receipts(id)
            )
        """)
        
        # Check columns and add missing ones
        cursor.execute("PRAGMA table_info(llm_mappings)")
        columns = [row[1] for row in cursor.fetchall()]
        
        # Check and add source_type column
        has_source_type = 'source_type' in columns
        if not has_source_type:
            logger.info("Adding source_type column to llm_mappings table")
            cursor.execute("ALTER TABLE llm_mappings ADD COLUMN source_type TEXT DEFAULT 'receipt_processing'")
            conn.commit()
            has_source_type = True
        
        # Check and add receipt_id column
        has_receipt_id = 'receipt_id' in columns
        if not has_receipt_id:
            logger.info("Adding receipt_id column to llm_mappings table")
            cursor.execute("ALTER TABLE llm_mappings ADD COLUMN receipt_id TEXT")
            conn.commit()
            has_receipt_id = True
        
        # Check and add mapping_data column
        has_mapping_data = 'mapping_data' in columns
        if not has_mapping_data:
            logger.info("Adding mapping_data column to llm_mappings table")
            cursor.execute("ALTER TABLE llm_mappings ADD COLUMN mapping_data TEXT")
            conn.commit()
            has_mapping_data = True
        
        # Insert mapping
        # For receipt processing, we create mappings for:
        # 1. Retailer -> Stock (e.g., Foot Locker -> FL)
        # 2. Each brand -> Stock (e.g., Nike -> NKE)
        
        mappings_created = []
        
        # Retailer mapping
        if retailer and isinstance(retailer, dict) and retailer.get('stockSymbol'):
            
            if has_mapping_data:
                cursor.execute("""
                    INSERT INTO llm_mappings (
                        id, user_id, merchant_name, ticker, company_name, 
                        category, confidence, status, mapping_data, source_type, receipt_id
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    str(uuid.uuid4()),
                    user_id,  # Ensure user_id is set correctly
                    merchant_name,
                    retailer.get('stockSymbol'),
                    retailer.get('name', merchant_name),
                    'Retailer',
                    0.9,  # High confidence for confirmed receipts
                    'approved',  # Auto-approve receipts that are confirmed by user
                    json.dumps(mapping_data),
                    'receipt_processing',
                    receipt_id
                ))
            else:
                # Insert without mapping_data column
                cursor.execute("""
                    INSERT INTO llm_mappings (
                        id, user_id, merchant_name, ticker, company_name, 
                        category, confidence, status, source_type, receipt_id
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    str(uuid.uuid4()),
                    user_id,  # Ensure user_id is set correctly
                    merchant_name,
                    retailer.get('stockSymbol'),
                    retailer.get('name', merchant_name),
                    'Retailer',
                    0.9,  # High confidence for confirmed receipts
                    'approved',  # Auto-approve receipts that are confirmed by user
                    'receipt_processing',
                    receipt_id
                ))
            mappings_created.append({
                'type': 'retailer',
                'merchant': merchant_name,
                'ticker': retailer.get('stockSymbol')
            })
        
        # Line item mappings - Create a mapping for EACH line item from the receipt
        # This ensures all line items appear in the AI Insights mapping tab
        for item_index, item in enumerate(items):
            item_name = item.get('name') or item.get('description') or item.get('item') or f'Item {item_index + 1}'
            item_quantity = item.get('quantity', 1)
            item_price = item.get('price') or item.get('amount') or 0.0
            item_total = item.get('total') or (item_price * item_quantity)
            
            brand = item.get('brand')
            brand_symbol = None
            brand_name = None
            
            if isinstance(brand, dict):
                brand_symbol = brand.get('stockSymbol') or brand.get('symbol')
                brand_name = brand.get('name')
            elif brand:
                brand_name = str(brand)
            
            # Also check for direct brandSymbol
            if not brand_symbol:
                brand_symbol = item.get('brandSymbol') or item.get('ticker')
            
            # Create mapping for this line item
            # If we have a brand/ticker, use it; otherwise use item name as merchant
            line_item_merchant = brand_name or item_name
            line_item_ticker = brand_symbol
            
            # If no ticker found, we still create a mapping with the item name
            # This ensures all line items appear in AI Insights
            if not line_item_ticker:
                line_item_ticker = None  # Will be set to NULL in database
                line_item_merchant = item_name
                logger.info(f"[LLM SUBMIT] Line item '{item_name}' has no ticker, creating mapping with item name")
            
            # Create item-specific mapping data
            item_mapping_data = {
                **mapping_data,
                'line_item': {
                    'name': item_name,
                    'quantity': item_quantity,
                    'price': item_price,
                    'total': item_total,
                    'index': item_index
                }
            }
            
            # Check if this line item mapping already exists
            if line_item_ticker:
                cursor.execute("""
                    SELECT id FROM llm_mappings 
                    WHERE receipt_id = ? AND ticker = ? AND source_type = 'receipt_processing'
                    AND user_id = ?
                """, (receipt_id, line_item_ticker, user_id))
            else:
                # For items without tickers, check by merchant name and receipt_id
                cursor.execute("""
                    SELECT id FROM llm_mappings 
                    WHERE receipt_id = ? AND merchant_name = ? AND source_type = 'receipt_processing'
                    AND user_id = ? AND ticker IS NULL
                """, (receipt_id, line_item_merchant, user_id))
            
            if not cursor.fetchone():
                # Check if mapping_data column exists (reuse check from above)
                if has_mapping_data:
                    cursor.execute("""
                        INSERT INTO llm_mappings (
                            id, user_id, merchant_name, ticker, company_name,
                            category, confidence, status, mapping_data, source_type, receipt_id
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        str(uuid.uuid4()),
                        user_id,  # Ensure user_id is set correctly
                        line_item_merchant,
                        line_item_ticker,  # Can be NULL if no ticker
                        brand_name or item_name,
                        'Line Item' if line_item_ticker else 'Item',  # Category
                        0.85 if line_item_ticker else 0.7,  # Lower confidence if no ticker
                        'pending' if not line_item_ticker else 'approved',  # Pending if no ticker for review
                        json.dumps(item_mapping_data),
                        'receipt_processing',
                        receipt_id
                    ))
                else:
                    # Insert without mapping_data column
                    cursor.execute("""
                        INSERT INTO llm_mappings (
                            id, user_id, merchant_name, ticker, company_name,
                            category, confidence, status, source_type, receipt_id
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        str(uuid.uuid4()),
                        user_id,  # Ensure user_id is set correctly
                        line_item_merchant,
                        line_item_ticker,  # Can be NULL if no ticker
                        brand_name or item_name,
                        'Line Item' if line_item_ticker else 'Item',  # Category
                        0.85 if line_item_ticker else 0.7,  # Lower confidence if no ticker
                        'pending' if not line_item_ticker else 'approved',  # Pending if no ticker for review
                        'receipt_processing',
                        receipt_id
                    ))
                
                mappings_created.append({
                    'type': 'line_item',
                    'merchant': line_item_merchant,
                    'ticker': line_item_ticker,
                    'item_name': item_name,
                    'item_index': item_index
                })
                logger.info(f"[LLM SUBMIT] Created mapping for line item {item_index + 1}: {item_name} (ticker: {line_item_ticker or 'N/A'})")
            
            # Also create brand mapping if we have a brand/ticker (for backward compatibility)
            if brand_symbol and brand_name:
                # Check if this brand mapping already exists for this receipt
                cursor.execute("""
                    SELECT id FROM llm_mappings 
                    WHERE receipt_id = ? AND ticker = ? AND source_type = 'receipt_processing'
                    AND user_id = ?
                """, (receipt_id, brand_symbol, user_id))
                
                if not cursor.fetchone():
                    # Check if mapping_data column exists (reuse check from above)
                    if has_mapping_data:
                        cursor.execute("""
                            INSERT INTO llm_mappings (
                                id, user_id, merchant_name, ticker, company_name,
                                category, confidence, status, mapping_data, source_type, receipt_id
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            str(uuid.uuid4()),
                            user_id,  # Ensure user_id is set correctly
                            brand_name,
                            brand_symbol,
                            brand_name,
                            'Brand',
                            0.85,  # Slightly lower confidence for brand identification
                            'approved',  # Auto-approve receipts that are confirmed by user
                            json.dumps(mapping_data),
                            'receipt_processing',
                            receipt_id
                        ))
                    else:
                        # Insert without mapping_data column
                        cursor.execute("""
                            INSERT INTO llm_mappings (
                                id, user_id, merchant_name, ticker, company_name,
                                category, confidence, status, source_type, receipt_id
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            str(uuid.uuid4()),
                            user_id,  # Ensure user_id is set correctly
                            brand_name,
                            brand_symbol,
                            brand_name,
                            'Brand',
                            0.85,  # Slightly lower confidence for brand identification
                            'approved',  # Auto-approve receipts that are confirmed by user
                            'receipt_processing',
                            receipt_id
                        ))
                    mappings_created.append({
                        'type': 'brand',
                        'merchant': brand_name,
                        'ticker': brand_symbol
                    })
        
        # ALSO create mappings from allocation data if provided
        # This ensures mappings are created even if receipt processing doesn't identify all brands
        if allocation and isinstance(allocation, dict):
            allocations_list = allocation.get('allocations', [])
            if not allocations_list and isinstance(allocation, list):
                allocations_list = allocation
            
            logger.info(f"[LLM SUBMIT] Processing {len(allocations_list)} allocations from allocation data")
            
            for alloc in allocations_list:
                if not isinstance(alloc, dict):
                    continue
                
                stock_symbol = alloc.get('stockSymbol') or alloc.get('ticker') or alloc.get('symbol')
                company_name = alloc.get('companyName') or alloc.get('company') or alloc.get('name') or merchant_name
                allocation_percentage = alloc.get('allocationPercentage') or alloc.get('percentage') or 0
                
                if not stock_symbol:
                    continue
                
                # Check if this mapping already exists (with user_id check)
                cursor.execute("""
                    SELECT id FROM llm_mappings 
                    WHERE receipt_id = ? AND ticker = ? AND source_type = 'receipt_processing'
                    AND user_id = ?
                """, (receipt_id, stock_symbol, user_id))
                
                if cursor.fetchone():
                    logger.info(f"[LLM SUBMIT] Mapping for {stock_symbol} already exists for user {user_id}, skipping")
                    continue
                
                # Determine category based on allocation percentage
                is_retailer = allocation_percentage >= 30  # If 30%+, likely the retailer
                
                # Create mapping from allocation
                mapping_id = str(uuid.uuid4())
                
                if has_mapping_data:
                    cursor.execute("""
                        INSERT INTO llm_mappings (
                            id, user_id, merchant_name, ticker, company_name,
                            category, confidence, status, mapping_data, source_type, receipt_id
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        mapping_id,
                        user_id,
                        merchant_name,
                        stock_symbol,
                        company_name,
                        'Retailer' if is_retailer else 'Brand',
                        0.9,
                        'approved',
                        json.dumps(mapping_data),
                        'receipt_processing',
                        receipt_id
                    ))
                else:
                    cursor.execute("""
                        INSERT INTO llm_mappings (
                            id, user_id, merchant_name, ticker, company_name,
                            category, confidence, status, source_type, receipt_id
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        mapping_id,
                        user_id,
                        merchant_name,
                        stock_symbol,
                        company_name,
                        'Retailer' if is_retailer else 'Brand',
                        0.9,
                        'approved',
                        'receipt_processing',
                        receipt_id
                    ))
                
                mappings_created.append({
                    'type': 'allocation',
                    'merchant': company_name,
                    'ticker': stock_symbol
                })
                logger.info(f"[LLM SUBMIT] Created mapping from allocation: {stock_symbol} ({company_name})")
        
        conn.commit()
        conn.close()
        
        logger.info(f"[LLM SUBMIT] Submitted receipt {receipt_id} to LLM Center: {len(mappings_created)} mappings created for user_id={user_id}")
        logger.info(f"[LLM SUBMIT] Mappings created: {mappings_created}")
        
        response = jsonify({
            'success': True,
            'message': 'Receipt submitted to LLM Center for learning',
            'mappings_created': len(mappings_created),
            'mappings': mappings_created,
            'user_id': user_id  # Include user_id in response for verification
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    except Exception as e:
        logger.error(f"Error submitting receipt to LLM: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        response = jsonify({'success': False, 'error': str(e)})
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


@receipt_llm_bp.route('/api/receipts/llm-mappings', methods=['GET', 'OPTIONS'])
def get_receipt_llm_mappings():
    """Get receipt-based LLM mappings for review"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
    
    try:
        # Allow admin access - check if user is admin
        user = get_auth_user()
        if not user:
            # Try admin token as fallback
            from app import get_user_id_from_request
            admin_id = get_user_id_from_request(3)  # Admin user ID
            if not admin_id:
                return jsonify({'success': False, 'error': 'Unauthorized'}), 401
            # Set user as admin for this request
            user = {'id': admin_id, 'role': 'admin', 'dashboard': 'admin'}
        
        # Check if this is a business token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        is_business_token = 'business_token_' in str(auth_header)
        
        # If user doesn't have dashboard set but has business token, set it
        if not user.get('dashboard') and is_business_token:
            user['dashboard'] = 'business'
            logger.info(f"[RECEIPT_MAPPINGS] Detected business_token_ in header, setting dashboard to 'business'")
        
        # Also check if user's account_type is 'business' (from get_auth_user)
        # get_auth_user sets dashboard = account_type (row[3]), so if account_type is 'business', dashboard should be 'business'
        # But let's also check the role field directly from database if needed
        user_role_from_db = user.get('role', '')
        user_dashboard_current = user.get('dashboard', '')
        
        # If role is 'business', set dashboard to 'business'
        if user_role_from_db and user_role_from_db.lower() == 'business':
            if user_dashboard_current != 'business':
                user['dashboard'] = 'business'
                logger.info(f"[RECEIPT_MAPPINGS] User role is 'business', setting dashboard to 'business'")
        
        # If dashboard is still not set, query database directly to get account_type
        if not user.get('dashboard') or user.get('dashboard') not in ['business', 'admin']:
            try:
                conn_check = db_manager.get_connection()
                cursor_check = conn_check.cursor()
                cursor_check.execute("SELECT account_type FROM users WHERE id = ?", (user.get('id'),))
                account_type_row = cursor_check.fetchone()
                conn_check.close()
                
                if account_type_row and account_type_row[0] and account_type_row[0].lower() == 'business':
                    user['dashboard'] = 'business'
                    logger.info(f"[RECEIPT_MAPPINGS] Found account_type='business' in database, setting dashboard to 'business'")
            except Exception as e:
                logger.warning(f"[RECEIPT_MAPPINGS] Could not check account_type from database: {e}")
        
        # Allow both admin and regular users to view their own mappings
        # Admin can see all, users see only their own
        
        status = request.args.get('status', None)  # pending, approved, rejected, or None for all
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get receipt mappings - admin sees all, users see only their own
        user_role = user.get('role', '').lower()
        user_dashboard = user.get('dashboard', '').lower() if user.get('dashboard') else ''
        
        # Check if role is 'business' (account_type from database)
        is_business_by_role = user_role == 'business'
        is_business_by_dashboard = user_dashboard == 'business'
        is_business = is_business_by_role or is_business_by_dashboard
        
        is_admin = user_role == 'admin' or user_dashboard == 'admin'
        
        logger.info(f"[RECEIPT_MAPPINGS] User: id={user.get('id')}, role={user_role}, dashboard={user_dashboard}, is_admin={is_admin}, is_business={is_business} (by_role={is_business_by_role}, by_dashboard={is_business_by_dashboard})")
        
        # IMPORTANT: Business users should ONLY see their own mappings, not all mappings
        # Only true admins (role='admin' or dashboard='admin') should see all mappings
        # Business users are regular users and should be filtered by user_id
        # DO NOT set is_admin = True for business users
        
        logger.info(f"[RECEIPT_MAPPINGS] Final is_admin value: {is_admin}, will show {'all' if is_admin else 'user-specific'} mappings for user_id={user.get('id')}")
        
        # Create indexes for better performance
        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_llm_mappings_source_receipt ON llm_mappings(source_type, receipt_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_llm_mappings_user_id ON llm_mappings(user_id)")
            conn.commit()
        except Exception as e:
            logger.warning(f"Could not create indexes: {e}")
        
        # Check if updated_at column exists (cache this check to avoid repeated PRAGMA calls)
        # Use a simpler approach - try to select updated_at and catch if it doesn't exist
        has_updated_at = False
        try:
            cursor.execute("SELECT updated_at FROM llm_mappings LIMIT 1")
            has_updated_at = True
        except:
            has_updated_at = False
        
        # Get count first (before fetching rows)
        # Only return mappings that have a receipt_id (user-submitted through receipt processing)
        # Filter out test data (receipt_id = '999999' or merchant_name = 'Test Merchant')
        
        logger.info(f"[RECEIPT_MAPPINGS] About to execute COUNT query - is_admin={is_admin}, user_id={user.get('id')}")
        
        if is_admin:
            if status:
                cursor.execute("""
                    SELECT COUNT(*) FROM llm_mappings
                    WHERE source_type = 'receipt_processing'
                    AND receipt_id IS NOT NULL
                    AND receipt_id != '999999'
                    AND merchant_name != 'Test Merchant'
                    AND ticker != 'TEST'
                    AND status = ?
                """, (status,))
            else:
                cursor.execute("""
                    SELECT COUNT(*) FROM llm_mappings
                    WHERE source_type = 'receipt_processing'
                    AND receipt_id IS NOT NULL
                    AND receipt_id != '999999'
                    AND merchant_name != 'Test Merchant'
                    AND ticker != 'TEST'
                """)
        else:
            # Regular users (including business users) see ONLY their own mappings
            # MUST filter by user_id AND exclude test data
            if status:
                cursor.execute("""
                    SELECT COUNT(*) FROM llm_mappings
                    WHERE source_type = 'receipt_processing'
                    AND receipt_id IS NOT NULL
                    AND receipt_id != '999999'
                    AND merchant_name != 'Test Merchant'
                    AND ticker != 'TEST'
                    AND status = ?
                    AND user_id = ?
                """, (status, user.get('id')))
            else:
                cursor.execute("""
                    SELECT COUNT(*) FROM llm_mappings
                    WHERE source_type = 'receipt_processing'
                    AND receipt_id IS NOT NULL
                    AND receipt_id != '999999'
                    AND merchant_name != 'Test Merchant'
                    AND ticker != 'TEST'
                    AND user_id = ?
                """, (user.get('id'),))
            
            logger.info(f"[RECEIPT_MAPPINGS] Filtering by user_id={user.get('id')} (non-admin user)")
        
        count_result = cursor.fetchone()
        total_count = count_result[0] if count_result else 0
        
        logger.info(f"[RECEIPT_MAPPINGS] COUNT query result: {total_count}, page: {page}, limit: {limit}, offset: {offset}, is_admin: {is_admin}, user_id: {user.get('id')}")
        
        # Debug: Also run a direct query to see what's in the database
        if total_count == 0 and is_admin:
            cursor.execute("""
                SELECT COUNT(*) FROM llm_mappings
                WHERE source_type = 'receipt_processing'
                AND receipt_id IS NOT NULL
            """)
            total_without_filters = cursor.fetchone()[0]
            logger.info(f"[RECEIPT_MAPPINGS] DEBUG: Total mappings without test filters: {total_without_filters}")
        
        # Now get the rows with user information
        if is_admin:
            # Admin sees all receipt mappings
            if has_updated_at:
                if status:
                    # Optimized query - fetch user data separately if needed to avoid slow JOIN
                    cursor.execute("""
                        SELECT 
                            lm.id, lm.user_id, lm.merchant_name, lm.ticker, lm.company_name, lm.category,
                            lm.confidence, lm.status, lm.admin_approved, lm.mapping_data, lm.receipt_id,
                            lm.created_at, lm.updated_at
                        FROM llm_mappings lm
                        WHERE lm.source_type = 'receipt_processing'
                        AND lm.receipt_id IS NOT NULL
                        AND lm.receipt_id != '999999'
                        AND lm.merchant_name != 'Test Merchant'
                        AND lm.ticker != 'TEST'
                        AND lm.status = ?
                        ORDER BY lm.created_at DESC
                        LIMIT ? OFFSET ?
                    """, (status, limit, offset))
                else:
                    # Optimized query - fetch user data separately if needed to avoid slow JOIN
                    cursor.execute("""
                        SELECT 
                            lm.id, lm.user_id, lm.merchant_name, lm.ticker, lm.company_name, lm.category,
                            lm.confidence, lm.status, lm.admin_approved, lm.mapping_data, lm.receipt_id,
                            lm.created_at, lm.updated_at
                        FROM llm_mappings lm
                        WHERE lm.source_type = 'receipt_processing'
                        AND lm.receipt_id IS NOT NULL
                        AND lm.receipt_id != '999999'
                        AND lm.merchant_name != 'Test Merchant'
                        AND lm.ticker != 'TEST'
                        ORDER BY lm.created_at DESC
                        LIMIT ? OFFSET ?
                    """, (limit, offset))
            else:
                # Non-admin users WITHOUT updated_at column - MUST filter by user_id
                if status:
                    # Optimized query - fetch user data separately if needed to avoid slow JOIN
                    cursor.execute("""
                        SELECT 
                            lm.id, lm.user_id, lm.merchant_name, lm.ticker, lm.company_name, lm.category,
                            lm.confidence, lm.status, lm.admin_approved, lm.mapping_data, lm.receipt_id,
                            lm.created_at, lm.created_at as updated_at
                        FROM llm_mappings lm
                        WHERE lm.source_type = 'receipt_processing'
                        AND lm.receipt_id IS NOT NULL
                        AND lm.receipt_id != '999999'
                        AND lm.merchant_name != 'Test Merchant'
                        AND lm.ticker != 'TEST'
                        AND lm.status = ?
                        AND lm.user_id = ?
                        ORDER BY lm.created_at DESC
                        LIMIT ? OFFSET ?
                    """, (status, user.get('id'), limit, offset))
                else:
                    # Optimized query - fetch user data separately if needed to avoid slow JOIN
                    cursor.execute("""
                        SELECT 
                            lm.id, lm.user_id, lm.merchant_name, lm.ticker, lm.company_name, lm.category,
                            lm.confidence, lm.status, lm.admin_approved, lm.mapping_data, lm.receipt_id,
                            lm.created_at, lm.created_at as updated_at
                        FROM llm_mappings lm
                        WHERE lm.source_type = 'receipt_processing'
                        AND lm.receipt_id IS NOT NULL
                        AND lm.receipt_id != '999999'
                        AND lm.merchant_name != 'Test Merchant'
                        AND lm.ticker != 'TEST'
                        AND lm.user_id = ?
                        ORDER BY lm.created_at DESC
                        LIMIT ? OFFSET ?
                    """, (user.get('id'), limit, offset))
        else:
            # Regular users see only their own mappings
            if has_updated_at:
                if status:
                    # Optimized query - fetch user data separately if needed to avoid slow JOIN
                    cursor.execute("""
                        SELECT 
                            lm.id, lm.user_id, lm.merchant_name, lm.ticker, lm.company_name, lm.category,
                            lm.confidence, lm.status, lm.admin_approved, lm.mapping_data, lm.receipt_id,
                            lm.created_at, lm.updated_at
                        FROM llm_mappings lm
                        WHERE lm.source_type = 'receipt_processing'
                        AND lm.receipt_id IS NOT NULL
                        AND lm.receipt_id != '999999'
                        AND lm.merchant_name != 'Test Merchant'
                        AND lm.ticker != 'TEST'
                        AND lm.status = ?
                        AND lm.user_id = ?
                        ORDER BY lm.created_at DESC
                        LIMIT ? OFFSET ?
                    """, (status, user.get('id'), limit, offset))
                else:
                    # Optimized query - fetch user data separately if needed to avoid slow JOIN
                    cursor.execute("""
                        SELECT 
                            lm.id, lm.user_id, lm.merchant_name, lm.ticker, lm.company_name, lm.category,
                            lm.confidence, lm.status, lm.admin_approved, lm.mapping_data, lm.receipt_id,
                            lm.created_at, lm.updated_at
                        FROM llm_mappings lm
                        WHERE lm.source_type = 'receipt_processing'
                        AND lm.receipt_id IS NOT NULL
                        AND lm.receipt_id != '999999'
                        AND lm.merchant_name != 'Test Merchant'
                        AND lm.ticker != 'TEST'
                        AND lm.user_id = ?
                        ORDER BY lm.created_at DESC
                        LIMIT ? OFFSET ?
                    """, (user.get('id'), limit, offset))
            else:
                if status:
                    # Optimized query - fetch user data separately if needed to avoid slow JOIN
                    cursor.execute("""
                        SELECT 
                            lm.id, lm.user_id, lm.merchant_name, lm.ticker, lm.company_name, lm.category,
                            lm.confidence, lm.status, lm.admin_approved, lm.mapping_data, lm.receipt_id,
                            lm.created_at, lm.created_at as updated_at
                        FROM llm_mappings lm
                        WHERE lm.source_type = 'receipt_processing'
                        AND lm.receipt_id IS NOT NULL
                        AND lm.receipt_id != '999999'
                        AND lm.merchant_name != 'Test Merchant'
                        AND lm.ticker != 'TEST'
                        AND lm.status = ?
                        AND lm.user_id = ?
                        ORDER BY lm.created_at DESC
                        LIMIT ? OFFSET ?
                    """, (status, user.get('id'), limit, offset))
                else:
                    # Optimized query - fetch user data separately if needed to avoid slow JOIN
                    cursor.execute("""
                        SELECT 
                            lm.id, lm.user_id, lm.merchant_name, lm.ticker, lm.company_name, lm.category,
                            lm.confidence, lm.status, lm.admin_approved, lm.mapping_data, lm.receipt_id,
                            lm.created_at, lm.created_at as updated_at
                        FROM llm_mappings lm
                        WHERE lm.source_type = 'receipt_processing'
                        AND lm.receipt_id IS NOT NULL
                        AND lm.receipt_id != '999999'
                        AND lm.merchant_name != 'Test Merchant'
                        AND lm.ticker != 'TEST'
                        AND lm.user_id = ?
                        ORDER BY lm.created_at DESC
                        LIMIT ? OFFSET ?
                    """, (user.get('id'), limit, offset))
        
        import time
        query_start = time.time()
        rows = cursor.fetchall()
        query_time = time.time() - query_start
        
        logger.info(f"[RECEIPT_MAPPINGS] Query took {query_time:.2f}s, retrieved {len(rows)} receipt mappings (status={status}, total={total_count}, is_admin={is_admin}, user_id={user.get('id')})")
        
        # Don't close connection yet - we need it for processing rows
        
        mappings = []
        # Get user info separately if needed (batch lookup for performance)
        user_ids = set()
        for row in rows:
            if row and len(row) > 1 and row[1]:  # user_id is at index 1
                user_ids.add(row[1])
        
        # Batch fetch user info
        user_info = {}
        if user_ids:
            try:
                user_cursor = conn.cursor()
                placeholders = ','.join(['?' for _ in user_ids])
                user_cursor.execute(f"""
                    SELECT id, account_number, email FROM users WHERE id IN ({placeholders})
                """, list(user_ids))
                for user_row in user_cursor.fetchall():
                    user_info[user_row[0]] = {
                        'account_number': user_row[1],
                        'email': user_row[2]
                    }
            except Exception as e:
                logger.warning(f"Could not fetch user info: {e}")
        
        for row in rows:
            if not row or len(row) < 12:
                logger.warning(f"[RECEIPT_MAPPINGS] Skipping invalid row: {row}")
                continue
            try:
                mapping_data = {}
                if len(row) > 9 and row[9]:
                    try:
                        mapping_data = json.loads(row[9]) if isinstance(row[9], str) else row[9]
                    except:
                        mapping_data = {}
                
                # Get user info from batch lookup
                user_id = row[1]
                user_data = user_info.get(user_id, {})
                user_account_number = user_data.get('account_number')
                user_email = user_data.get('email')
                
                mappings.append({
                    'id': row[0],
                    'user_id': row[1],
                    'merchant_name': row[2] or '',
                    'ticker': row[3] or '',
                    'company_name': row[4] or row[2] or '',
                    'category': row[5] or '',
                    'confidence': float(row[6]) if row[6] is not None else 0.0,
                    'status': row[7] or 'pending',
                    'admin_approved': bool(row[8]) if row[8] is not None else False,
                    'mapping_data': mapping_data,
                    'receipt_id': row[10] if len(row) > 10 else None,
                    'created_at': row[11] if len(row) > 11 else None,
                    'updated_at': row[12] if len(row) > 12 else (row[11] if len(row) > 11 else None),
                    'user_account_number': user_account_number,
                    'user_email': user_email
                })
            except Exception as e:
                logger.error(f"[RECEIPT_MAPPINGS] Error parsing row: {e}, row: {row}")
                continue
        
        logger.info(f"[RECEIPT_MAPPINGS] Returning {len(mappings)} mappings to frontend (total_count={total_count}, is_admin={is_admin}, user_id={user.get('id')})")
        if len(mappings) > 0:
            logger.info(f"[RECEIPT_MAPPINGS] Sample mapping: id={mappings[0].get('id')}, merchant={mappings[0].get('merchant_name')}")
        
        response = jsonify({
            'success': True,
            'mappings': mappings,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        
        # Close connection after processing
        try:
            conn.close()
        except:
            pass
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting receipt LLM mappings: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Ensure connection is closed on error
        try:
            if 'conn' in locals():
                conn.close()
        except:
            pass
        
        response = jsonify({'success': False, 'error': str(e)})
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

