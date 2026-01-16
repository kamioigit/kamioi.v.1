"""
Receipt Processing API Endpoints
Handles receipt upload, OCR processing, and round-up allocation
"""

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import uuid
import logging
import json
from datetime import datetime
import base64

from services.receipt_processing_service import ReceiptProcessingService
from services.round_up_allocation_service import RoundUpAllocationService
from database_manager import db_manager

logger = logging.getLogger(__name__)

receipt_bp = Blueprint('receipts', __name__)

# Initialize services
receipt_service = ReceiptProcessingService()
allocation_service = RoundUpAllocationService()

# Upload configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'receipts')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_auth_user():
    """Get authenticated user from request"""
    from app import get_auth_user as _get_auth_user
    return _get_auth_user()


@receipt_bp.route('/api/receipts/upload', methods=['POST', 'OPTIONS'])
def upload_receipt():
    """Upload a receipt image/PDF"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        if 'receipt' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['receipt']
        if file.filename == '':
            response = jsonify({'success': False, 'error': 'No file selected'})
            response.status_code = 400
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        if not allowed_file(file.filename):
            response = jsonify({'success': False, 'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, PDF'})
            response.status_code = 400
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        # Get user - require auth for receipt uploads
        user = get_auth_user()
        if not user:
            response = jsonify({'success': False, 'error': 'Unauthorized'})
            response.status_code = 401
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        user_id = user.get('id')
        
        # Generate unique filename
        receipt_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        saved_filename = f"{receipt_id}.{file_ext}"
        file_path = os.path.join(UPLOAD_FOLDER, saved_filename)
        
        # Save file
        file.save(file_path)
        
        # Store receipt record in database
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS receipts (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                filename TEXT,
                file_path TEXT,
                status TEXT DEFAULT 'uploaded',
                parsed_data TEXT,
                round_up_amount DECIMAL(10,2),
                allocation_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        cursor.execute("""
            INSERT INTO receipts (id, user_id, filename, file_path, status)
            VALUES (?, ?, ?, ?, 'uploaded')
        """, (receipt_id, user_id, filename, file_path))
        
        conn.commit()
        conn.close()
        
        response = jsonify({
            'success': True,
            'receiptId': receipt_id,
            'filename': filename
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    except Exception as e:
        logger.error(f"Error uploading receipt: {str(e)}")
        response = jsonify({'success': False, 'error': str(e)})
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


@receipt_bp.route('/api/receipts/<receipt_id>/process', methods=['POST', 'OPTIONS'])
def process_receipt(receipt_id):
    """Process receipt with OCR and AI parsing"""
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
        
        # Get receipt from database
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, user_id, file_path, filename FROM receipts WHERE id = ?", (receipt_id,))
        receipt = cursor.fetchone()
        
        if not receipt:
            conn.close()
            return jsonify({'success': False, 'error': 'Receipt not found'}), 404
        
        # Verify user owns this receipt
        if receipt[1] != user.get('id'):
            conn.close()
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        file_path = receipt[2]
        
        # Get raw text from request if provided, otherwise extract from image using OCR
        raw_text = request.json.get('raw_text', '') if request.is_json else ''
        
        # If no raw text provided, try to extract from image using OCR
        if not raw_text and file_path:
            try:
                raw_text = receipt_service.extract_text_from_image(file_path)
                logger.info(f"OCR extracted text from {file_path}: {len(raw_text)} characters")
                
                # If OCR returned empty, try alternative approach
                if not raw_text or len(raw_text.strip()) < 10:
                    logger.warning(f"OCR returned minimal text ({len(raw_text)} chars). Trying alternative OCR settings...")
                    # Try with different PSM mode (single uniform block)
                    try:
                        from PIL import Image
                        import pytesseract
                        image = Image.open(file_path)
                        # Try different PSM modes
                        for psm in [6, 11, 12]:  # 6=block, 11=sparse, 12=line
                            custom_config = f'--oem 3 --psm {psm}'
                            alt_text = pytesseract.image_to_string(image, config=custom_config)
                            if len(alt_text.strip()) > len(raw_text.strip()):
                                raw_text = alt_text
                                logger.info(f"Better OCR result with PSM {psm}: {len(raw_text)} characters")
                    except Exception as e2:
                        logger.warning(f"Alternative OCR attempt failed: {str(e2)}")
            except Exception as e:
                logger.error(f"OCR extraction failed: {str(e)}")
                raw_text = ""
        
        # Process receipt (optimized: skip LLM enhancement during initial processing for speed)
        # LLM enhancement can be done on-demand when user edits
        try:
            receipt_data = {
                'raw_text': raw_text,
                'image_path': file_path,
                'skip_llm_enhancement': True  # Skip slow LLM queries during initial processing
            }
            
            result = receipt_service.process_receipt(receipt_data)
        except Exception as e:
            logger.error(f"Error processing receipt: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            conn.close()
            return jsonify({'success': False, 'error': f'Processing failed: {str(e)}'}), 500
        
        if not result['success']:
            conn.close()
            return jsonify(result), 500
        
        parsed_data = result['data']
        
        # Update receipt status
        cursor.execute("""
            UPDATE receipts 
            SET status = 'processed',
                parsed_data = ?
            WHERE id = ?
        """, (json.dumps(parsed_data), receipt_id))
        
        conn.commit()
        conn.close()
        
        response = jsonify({
            'success': True,
            'data': parsed_data
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    except Exception as e:
        logger.error(f"Error processing receipt: {str(e)}")
        response = jsonify({'success': False, 'error': str(e)})
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


@receipt_bp.route('/api/receipts/<receipt_id>/allocate', methods=['POST', 'OPTIONS'])
def allocate_round_up(receipt_id):
    """Calculate round-up allocation for processed receipt"""
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
        
        # Get receipt and parsed data
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, user_id, parsed_data, round_up_amount
            FROM receipts 
            WHERE id = ?
        """, (receipt_id,))
        
        receipt = cursor.fetchone()
        
        if not receipt:
            conn.close()
            return jsonify({'success': False, 'error': 'Receipt not found'}), 404
        
        # Verify user owns this receipt
        if receipt[1] != user.get('id'):
            conn.close()
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        parsed_data = json.loads(receipt[2]) if receipt[2] else {}
        existing_round_up = receipt[3] if receipt[3] else None
        
        # Get total amount from parsed data
        total_amount = parsed_data.get('totalAmount', 0.0)
        
        # Get user's configured round-up amount from database (default $1.00)
        user_id = user.get('id')
        user_round_up_amount = 1.00  # Default
        
        try:
            # Try to get round_up_amount column - handle case where column might not exist
            cursor.execute("SELECT round_up_amount FROM users WHERE id = ?", (user_id,))
            user_row = cursor.fetchone()
            if user_row and user_row[0] is not None:
                user_round_up_amount = float(user_row[0])
        except Exception as e:
            logger.warning(f"Could not get round_up_amount from users table: {e}. Using default $1.00")
            # If column doesn't exist, use default
            user_round_up_amount = 1.00
        
        # Use user's configured round-up amount (not calculated from transaction)
        # Only use existing_round_up if it was explicitly set, otherwise use user setting
        if existing_round_up is not None and float(existing_round_up) > 0:
            round_up_amount = float(existing_round_up)
        else:
            round_up_amount = user_round_up_amount
        
        logger.info(f"Round-up amount for receipt {receipt_id}: ${round_up_amount} (user setting: ${user_round_up_amount})")
        
        # Prepare transaction data
        # Ensure items have brand information with confidence scores
        items_for_allocation = []
        for item in parsed_data.get('items', []):
            # Make sure brand_confidence is set if brand exists
            if item.get('brand') and not item.get('brand_confidence'):
                # If brand exists but no confidence, set default high confidence
                item['brand_confidence'] = 0.95
                logger.info(f"Item '{item.get('name')}' has brand but no confidence - setting to 0.95")
            items_for_allocation.append(item)
        
        transaction = {
            'items': items_for_allocation,
            'retailer': parsed_data.get('retailer'),
            'totalAmount': total_amount,
            'roundUpAmount': round_up_amount
        }
        
        # Log item brands for debugging
        for item in items_for_allocation:
            if item.get('brand'):
                logger.info(f"Item '{item.get('name')}' → Brand: {item.get('brand')}, Confidence: {item.get('brand_confidence', 'N/A')}")
        
        # Calculate allocation
        logger.info(f"Transaction data for allocation: items={len(transaction['items'])}, retailer={transaction['retailer']}, roundUpAmount=${round_up_amount}")
        
        try:
            result = allocation_service.calculate_allocation(transaction)
            logger.info(f"Allocation result: success={result.get('success')}, allocations={len(result.get('allocations', []))}")
        except Exception as e:
            logger.error(f"Allocation calculation error: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            conn.close()
            return jsonify({'success': False, 'error': f'Allocation calculation failed: {str(e)}'}), 500
        
        if not result['success']:
            conn.close()
            return jsonify(result), 500
        
        # Store allocation
        allocations = result['allocations']
        
        # Update receipt with allocation
        cursor.execute("""
            UPDATE receipts 
            SET status = 'allocated',
                round_up_amount = ?,
                allocation_data = ?
            WHERE id = ?
        """, (round_up_amount, json.dumps(result), receipt_id))
        
        conn.commit()
        conn.close()
        
        response = jsonify(result)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error allocating round-up: {str(e)}")
        logger.error(f"Traceback: {error_trace}")
        response = jsonify({
            'success': False, 
            'error': str(e),
            'details': error_trace if logger.level <= logging.DEBUG else None
        })
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response


@receipt_bp.route('/api/transactions/create', methods=['POST', 'OPTIONS'])
def create_transaction_from_receipt():
    """Create transaction and investments from receipt"""
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
        
        if not receipt_data:
            response = jsonify({'success': False, 'error': 'Missing receipt data'})
            response.status_code = 400
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        # Allocation is optional - if missing, create transaction without allocations
        if not allocation:
            logger.warning("No allocation provided, creating transaction without allocations")
            allocation = {
                'totalRoundUp': receipt_data.get('totalAmount', 0.0) % 1.0 or 1.0,  # Default round-up
                'allocations': []
            }
        
        # Ensure user_id is an integer for consistency
        user_id = int(user.get('id'))
        logger.info(f"[TRANSACTION CREATE] Creating transaction for user_id={user_id} (type: {type(user_id)})")
        
        # Create transaction record
        # Note: db_manager.add_transaction opens its own connection, so we'll handle schema updates separately
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Check if round_up_amount column exists, if not add it
        # Note: database_manager uses 'round_up', but we also support 'round_up_amount' for receipt transactions
        try:
            cursor.execute("PRAGMA table_info(transactions)")
            columns = [row[1] for row in cursor.fetchall()]
            if 'round_up_amount' not in columns:
                logger.info("Adding round_up_amount column to transactions table")
                cursor.execute("ALTER TABLE transactions ADD COLUMN round_up_amount REAL DEFAULT 0")
                conn.commit()
            if 'receipt_id' not in columns:
                logger.info("Adding receipt_id column to transactions table")
                cursor.execute("ALTER TABLE transactions ADD COLUMN receipt_id TEXT")
                conn.commit()
        except Exception as e:
            logger.warning(f"Could not check/add columns: {e}")
        finally:
            conn.close()
        
        # Use database_manager to add transaction (it handles the correct table structure)
        from datetime import datetime
        round_up_amount = allocation.get('totalRoundUp', 0.0)
        total_amount = receipt_data.get('totalAmount', 0.0)
        merchant_name = receipt_data.get('retailer', {}).get('name', 'Unknown Merchant') if isinstance(receipt_data.get('retailer'), dict) else str(receipt_data.get('retailer', 'Unknown Merchant'))
        
        transaction_data = {
            'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'merchant': merchant_name,
            'amount': total_amount,
            'category': 'receipt',
            'description': f"Receipt purchase at {merchant_name}",
            'round_up': round_up_amount,
            'total_debit': total_amount + round_up_amount,  # Include round-up in total debit
            'status': 'completed',
            'investable': round_up_amount,  # Round-up amount is investable
            'transaction_type': 'receipt'  # Mark as receipt transaction
        }
        
        logger.info(f"[TRANSACTION CREATE] Transaction data: {transaction_data}")
        
        # Use database_manager's add_transaction method which handles the correct schema
        try:
            transaction_id = db_manager.add_transaction(int(user_id), transaction_data)
            logger.info(f"[TRANSACTION CREATE] Created transaction {transaction_id} from receipt: merchant={merchant_name}, amount=${total_amount}, round_up=${round_up_amount}, user_id={user_id}")
            
            # Verify transaction was created using a fresh connection
            verify_conn = db_manager.get_connection()
            verify_cursor = verify_conn.cursor()
            verify_cursor.execute("SELECT id, user_id, merchant, amount FROM transactions WHERE id = ?", (transaction_id,))
            verify = verify_cursor.fetchone()
            verify_conn.close()
            
            if not verify:
                raise Exception(f"Transaction {transaction_id} was not found after creation")
            
            logger.info(f"[TRANSACTION CREATE] Verified transaction {transaction_id} exists: user_id={verify[1]}, merchant={verify[2]}, amount={verify[3]}")
            
            # Update receipt_id if it exists (using a separate connection)
            receipt_id_value = receipt_data.get('receipt_id')
            if receipt_id_value:
                try:
                    update_conn = db_manager.get_connection()
                    update_cursor = update_conn.cursor()
                    update_cursor.execute("PRAGMA table_info(transactions)")
                    columns = [row[1] for row in update_cursor.fetchall()]
                    if 'receipt_id' in columns:
                        update_cursor.execute("UPDATE transactions SET receipt_id = ? WHERE id = ?", (receipt_id_value, transaction_id))
                        update_conn.commit()
                        logger.info(f"[TRANSACTION CREATE] Updated receipt_id={receipt_id_value} for transaction {transaction_id}")
                    update_conn.close()
                except Exception as e:
                    logger.warning(f"Could not update receipt_id: {e}")
            
            # Also update round_up_amount if it exists in the schema
            try:
                update_conn = db_manager.get_connection()
                update_cursor = update_conn.cursor()
                update_cursor.execute("PRAGMA table_info(transactions)")
                columns = [row[1] for row in update_cursor.fetchall()]
                if 'round_up_amount' in columns:
                    round_up = allocation.get('totalRoundUp', 0.0)
                    update_cursor.execute("UPDATE transactions SET round_up_amount = ? WHERE id = ?", (round_up, transaction_id))
                    update_conn.commit()
                    logger.info(f"[TRANSACTION CREATE] Updated round_up_amount={round_up} for transaction {transaction_id}")
                update_conn.close()
            except Exception as e:
                logger.warning(f"Could not update round_up_amount: {e}")
        except Exception as txn_error:
            logger.error(f"[TRANSACTION CREATE] Failed to create transaction: {txn_error}")
            import traceback
            logger.error(traceback.format_exc())
            raise
        
        # Create investment allocations using a fresh connection
        allocations = allocation.get('allocations', [])
        if allocations:
            try:
                alloc_conn = db_manager.get_connection()
                alloc_cursor = alloc_conn.cursor()
                
                alloc_cursor.execute("""
                    CREATE TABLE IF NOT EXISTS round_up_allocations (
                        id TEXT PRIMARY KEY,
                        transaction_id TEXT,
                        stock_symbol VARCHAR(10),
                        allocation_amount DECIMAL(10,2),
                        allocation_percentage DECIMAL(5,2),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
                    )
                """)
                
                for alloc in allocations:
                    try:
                        alloc_id = str(uuid.uuid4())
                        stock_symbol = alloc.get('stockSymbol') or alloc.get('symbol')
                        if not stock_symbol:
                            logger.warning(f"Skipping allocation without stock symbol: {alloc}")
                            continue
                        
                        alloc_cursor.execute("""
                            INSERT INTO round_up_allocations (
                                id, transaction_id, stock_symbol, allocation_amount, allocation_percentage
                            )
                            VALUES (?, ?, ?, ?, ?)
                        """, (
                            alloc_id,
                            str(transaction_id),  # Ensure transaction_id is string
                            stock_symbol,
                            float(alloc.get('amount', 0)),
                            float(alloc.get('percentage', 0))
                        ))
                        logger.info(f"[TRANSACTION CREATE] Created allocation: {stock_symbol} = ${alloc.get('amount', 0)}")
                    except Exception as alloc_error:
                        logger.warning(f"Failed to create allocation for {alloc}: {alloc_error}")
                        # Continue with other allocations even if one fails
                
                alloc_conn.commit()
                alloc_conn.close()
                logger.info(f"[TRANSACTION CREATE] Transaction {transaction_id} and {len(allocations)} allocations committed successfully")
            except Exception as alloc_error:
                logger.error(f"[TRANSACTION CREATE] Error creating allocations: {alloc_error}")
                # Don't fail the transaction if allocations fail
        
        # Submit to LLM Center for learning will be handled by frontend after transaction creation
        # This allows us to submit even if transaction creation succeeds
        
        response = jsonify({
            'success': True,
            'transactionId': transaction_id,
            'message': 'Transaction and investments created successfully'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error creating transaction: {str(e)}")
        logger.error(f"Traceback: {error_trace}")
        response = jsonify({
            'success': False, 
            'error': str(e),
            'details': error_trace if logger.level <= logging.DEBUG else None
        })
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

