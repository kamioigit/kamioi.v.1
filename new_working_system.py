#!/usr/bin/env python3
"""
NEW WORKING SYSTEM - Built from scratch
No more Flask route issues - this will work!
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import pandas as pd
import io
from datetime import datetime
import os
import json

# Create Flask app
app = Flask(__name__)
CORS(app, origins=['*'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Database connection
def get_db():
    conn = sqlite3.connect('kamioi.db')
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database
def init_database():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create tables if they don't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date TEXT,
            merchant TEXT,
            amount REAL,
            category TEXT,
            description TEXT,
            total_debit REAL,
            status TEXT DEFAULT 'pending',
            ticker TEXT,
            investable BOOLEAN DEFAULT 0,
            round_up REAL DEFAULT 0,
            fee REAL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS llm_mappings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id INTEGER,
            merchant_name TEXT,
            ticker TEXT,
            category TEXT,
            confidence REAL,
            status TEXT DEFAULT 'pending',
            admin_approved BOOLEAN DEFAULT 0,
            ai_processed BOOLEAN DEFAULT 0,
            company_name TEXT,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transaction_id) REFERENCES transactions (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create admin user if not exists
    cursor.execute('SELECT * FROM users WHERE email = ?', ('admin@admin.com',))
    if not cursor.fetchone():
        cursor.execute('''
            INSERT INTO users (email, password, name, role) 
            VALUES (?, ?, ?, ?)
        ''', ('admin@admin.com', 'admin123', 'Admin User', 'admin'))
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/api/admin/auth/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ? AND role = ?', (email, 'admin'))
        user = cursor.fetchone()
        conn.close()
        
        if user and user['password'] == password:
            return jsonify({
                'success': True,
                'token': f'token_{user["id"]}',
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role'],
                    'dashboard': 'admin'
                }
            })
        else:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/auth/login', methods=['POST'])
def user_login():
    """User login endpoint"""
    try:
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if user and user['password'] == password:
            return jsonify({
                'success': True,
                'token': f'token_{user["id"]}',
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role'],
                    'dashboard': 'user'
                }
            })
        else:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/auth/logout', methods=['POST'])
def user_logout():
    """User logout endpoint"""
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/admin/auth/logout', methods=['POST'])
def admin_logout():
    """Admin logout endpoint"""
    return jsonify({'success': True, 'message': 'Admin logged out successfully'})

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.route('/api/admin/transactions')
def admin_transactions():
    """Get all transactions for admin"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT t.*, u.name as user_name, u.email as user_email
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.id DESC
        ''')
        transactions = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts
        all_data = []
        for row in transactions:
            all_data.append({
                'id': row['id'],
                'user_id': row['user_id'],
                'date': row['date'],
                'merchant': row['merchant'],
                'amount': row['amount'],
                'category': row['category'],
                'description': row['description'],
                'total_debit': row['total_debit'],
                'status': row['status'],
                'ticker': row['ticker'],
                'investable': bool(row['investable']),
                'round_up': row['round_up'],
                'fee': row['fee'],
                'user_name': row['user_name'],
                'user_email': row['user_email']
            })
        
        return jsonify({
            'success': True,
            'data': {
                'allData': all_data,
                'summary': {
                    'total_transactions': len(all_data),
                    'total_amount': sum(row['amount'] for row in all_data)
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/llm-center/queue')
def admin_llm_queue():
    """Get LLM queue data"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get pending mappings
        cursor.execute('''
            SELECT lm.*, t.merchant, t.amount, t.category, u.name as user_name
            FROM llm_mappings lm
            LEFT JOIN transactions t ON lm.transaction_id = t.id
            LEFT JOIN users u ON lm.user_id = u.id
            WHERE lm.status = 'pending'
            ORDER BY lm.created_at DESC
        ''')
        pending_reviews = cursor.fetchall()
        
        # Get all entries
        cursor.execute('''
            SELECT lm.*, t.merchant, t.amount, t.category, u.name as user_name
            FROM llm_mappings lm
            LEFT JOIN transactions t ON lm.transaction_id = t.id
            LEFT JOIN users u ON lm.user_id = u.id
            ORDER BY lm.created_at DESC
        ''')
        all_entries = cursor.fetchall()
        
        conn.close()
        
        # Convert to list of dicts
        pending_list = []
        for row in pending_reviews:
            pending_list.append({
                'id': row['id'],
                'merchant_name': row['merchant_name'],
                'ticker': row['ticker'],
                'category': row['category'],
                'confidence': row['confidence'],
                'status': row['status'],
                'admin_approved': bool(row['admin_approved']),
                'ai_processed': bool(row['ai_processed']),
                'company_name': row['company_name'],
                'user_name': row['user_name'],
                'created_at': row['created_at']
            })
        
        all_list = []
        for row in all_entries:
            all_list.append({
                'id': row['id'],
                'merchant_name': row['merchant_name'],
                'ticker': row['ticker'],
                'category': row['category'],
                'confidence': row['confidence'],
                'status': row['status'],
                'admin_approved': bool(row['admin_approved']),
                'ai_processed': bool(row['ai_processed']),
                'company_name': row['company_name'],
                'user_name': row['user_name'],
                'created_at': row['created_at']
            })
        
        return jsonify({
            'success': True,
            'data': {
                'all_entries': all_list,
                'pending_reviews': pending_list,
                'queue_status': {
                    'total': len(all_list),
                    'pending': len(pending_list)
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/llm-center/mappings')
def admin_llm_mappings():
    """Get LLM mappings"""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT lm.*, t.merchant, t.amount, t.category, u.name as user_name
            FROM llm_mappings lm
            LEFT JOIN transactions t ON lm.transaction_id = t.id
            LEFT JOIN users u ON lm.user_id = u.id
            ORDER BY lm.created_at DESC
            LIMIT ?
        ''', (limit,))
        mappings = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts
        mappings_list = []
        for row in mappings:
            mappings_list.append({
                'id': row['id'],
                'merchant_name': row['merchant_name'],
                'ticker': row['ticker'],
                'category': row['category'],
                'confidence': row['confidence'],
                'status': row['status'],
                'admin_approved': bool(row['admin_approved']),
                'ai_processed': bool(row['ai_processed']),
                'company_name': row['company_name'],
                'user_name': row['user_name'],
                'created_at': row['created_at']
            })
        
        return jsonify({
            'success': True,
            'data': {
                'mappings': mappings_list,
                'total': len(mappings_list)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/bulk-upload', methods=['POST'])
def admin_bulk_upload():
    """Bulk upload CSV/Excel files"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            return jsonify({'success': False, 'error': 'File must be Excel (.xlsx, .xls) or CSV'}), 400
        
        # Read the file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(file.read().decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(file.read()))
        
        # Clean the dataframe
        df = df.dropna(how='all', axis=1)  # Remove empty columns
        df = df.dropna(how='all', axis=0)  # Remove empty rows
        
        # Map columns
        column_mapping = {
            'merchant_name': ['merchant_name', 'Merchant Name', 'merchant name'],
            'ticker_symbol': ['ticker_symbol', 'Ticker Symbol', 'ticker symbol'],
            'category': ['category', 'Category'],
            'confidence': ['confidence', 'Confidence'],
            'notes': ['notes', 'Notes']
        }
        
        found_columns = {}
        missing_columns = []
        
        for required_col, possible_names in column_mapping.items():
            found = False
            for possible_name in possible_names:
                if possible_name in df.columns:
                    found_columns[required_col] = possible_name
                    found = True
                    break
            if not found:
                missing_columns.append(required_col)
        
        if missing_columns:
            return jsonify({
                'success': False, 
                'error': f'Missing required columns: {", ".join(missing_columns)}'
            }), 400
        
        print(f"Processing {len(df)} rows from CSV")
        
        # Process in batches
        batch_size = 1000
        processed_count = 0
        error_count = 0
        errors = []
        
        conn = get_db()
        cursor = conn.cursor()
        
        for batch_start in range(0, len(df), batch_size):
            batch_end = min(batch_start + batch_size, len(df))
            batch_df = df.iloc[batch_start:batch_end]
            
            print(f"Processing batch {batch_start//batch_size + 1}/{(len(df)-1)//batch_size + 1} ({batch_start+1}-{batch_end} of {len(df)})")
            
            for index, row in batch_df.iterrows():
                try:
                    # Create transaction
                    cursor.execute('''
                        INSERT INTO transactions (user_id, date, merchant, amount, category, description, total_debit)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        2,  # Default user for bulk uploads
                        datetime.now().isoformat(),
                        row[found_columns['merchant_name']],
                        0.0,  # No amount column, set to 0
                        row[found_columns['category']],
                        f"Bulk upload: {row[found_columns['merchant_name']]} - {row[found_columns['notes']]}",
                        0.0
                    ))
                    
                    transaction_id = cursor.lastrowid
                    
                    # Create approved mapping
                    cursor.execute('''
                        INSERT INTO llm_mappings (transaction_id, merchant_name, ticker, category, confidence, status, admin_approved, ai_processed, company_name, user_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        transaction_id,
                        row[found_columns['merchant_name']],
                        row[found_columns['ticker_symbol']],
                        row[found_columns['category']],
                        float(row[found_columns['confidence']]) if str(row[found_columns['confidence']]).replace('.', '').isdigit() else 50.0,
                        'approved',  # Directly approved
                        1,  # Pre-approved
                        1,  # Mark as AI processed
                        row[found_columns['merchant_name']],
                        2
                    ))
                    
                    processed_count += 1
                    
                except Exception as e:
                    error_count += 1
                    errors.append(f"Row {index + 1}: {str(e)}")
                    if error_count > 100:  # Limit error reporting
                        break
            
            # Commit batch
            conn.commit()
            print(f"Batch {batch_start//batch_size + 1} committed to database")
        
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Bulk upload completed successfully',
            'stats': {
                'total_rows': len(df),
                'processed': processed_count,
                'errors': error_count,
                'error_details': errors[:10] if errors else []
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Upload failed: {str(e)}'}), 500

# ============================================================================
# HEALTH ENDPOINT
# ============================================================================

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'system': 'NEW WORKING SYSTEM'
    })

@app.route('/')
def root():
    """Root endpoint"""
    return jsonify({
        'status': 'ok', 
        'message': 'NEW WORKING SYSTEM - No more route issues!',
        'endpoints': [
            '/api/health',
            '/api/admin/auth/login',
            '/api/user/auth/login',
            '/api/admin/transactions',
            '/api/admin/llm-center/queue',
            '/api/admin/llm-center/mappings',
            '/api/admin/bulk-upload'
        ]
    })

if __name__ == '__main__':
    print("=" * 60)
    print("NEW WORKING SYSTEM - Built from scratch")
    print("=" * 60)
    print("Health: http://localhost:5000/api/health")
    print("Admin Login: http://localhost:5000/api/admin/auth/login")
    print("User Login: http://localhost:5000/api/user/auth/login")
    print("Admin Transactions: http://localhost:5000/api/admin/transactions")
    print("LLM Queue: http://localhost:5000/api/admin/llm-center/queue")
    print("LLM Mappings: http://localhost:5000/api/admin/llm-center/mappings")
    print("Bulk Upload: http://localhost:5000/api/admin/bulk-upload")
    print("=" * 60)
    print("This system will work - no more route issues!")
    print("=" * 60)
    
    app.run(host='127.0.0.1', port=5000, debug=False)


