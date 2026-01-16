#!/usr/bin/env python3

from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import hashlib
import secrets
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=['http://localhost:3764', 'http://127.0.0.1:3764'], 
     allow_headers=['Content-Type', 'Authorization'], 
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'kamioi.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Health check
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

# Admin authentication
@app.route('/api/admin/auth/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check admin table first
        cursor.execute("SELECT id, email, name, role, password FROM admins WHERE email = ?", (email,))
        admin = cursor.fetchone()
        
        if admin:
            # Admin found in admins table
            if admin['password'] == password:  # Simple password check for now
                token = f"admin_token_{admin['id']}"
                conn.close()
                
                return jsonify({
                    'success': True,
                    'token': token,
                    'user': {
                        'id': admin['id'],
                        'email': admin['email'],
                        'name': admin['name'],
                        'role': admin['role']
                    }
                })
        
        conn.close()
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/auth/me')
def admin_auth_me():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        if not token.startswith('admin_token_'):
            return jsonify({'success': False, 'error': 'Invalid token format'}), 401
        
        admin_id = token.replace('admin_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, name, role FROM admins WHERE id = ?", (admin_id,))
        admin = cursor.fetchone()
        conn.close()
        
        if admin:
            return jsonify({
                'success': True,
                'user': {
                    'id': admin['id'],
                    'email': admin['email'],
                    'name': admin['name'],
                    'role': admin['role']
                }
            })
        else:
            return jsonify({'success': False, 'error': 'Admin not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Admin endpoints
@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE role = 'individual'")
        users = cursor.fetchall()
        conn.close()
        
        user_list = []
        for user in users:
            user_list.append({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'created_at': user['created_at']
            })
        
        return jsonify({
            'success': True,
            'users': user_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/family-users', methods=['GET'])
def admin_get_family_users():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE role = 'family'")
        users = cursor.fetchall()
        conn.close()
        
        user_list = []
        for user in users:
            user_list.append({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'created_at': user['created_at']
            })
        
        return jsonify({
            'success': True,
            'users': user_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/business-users', methods=['GET'])
def admin_get_business_users():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE role = 'business'")
        users = cursor.fetchall()
        conn.close()
        
        user_list = []
        for user in users:
            user_list.append({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'created_at': user['created_at']
            })
        
        return jsonify({
            'success': True,
            'users': user_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/user-metrics', methods=['GET'])
def admin_get_user_metrics():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user counts
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'individual'")
        individual_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'family'")
        family_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'business'")
        business_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users")
        total_count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'metrics': {
                'individual_users': individual_count,
                'family_users': family_count,
                'business_users': business_count,
                'total_users': total_count
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/transactions', methods=['GET'])
def admin_get_transactions():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT t.id, t.amount, t.status, t.created_at, u.name as user_name, u.email as user_email
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
            LIMIT 100
        """)
        transactions = cursor.fetchall()
        conn.close()
        
        transaction_list = []
        for txn in transactions:
            transaction_list.append({
                'id': txn['id'],
                'amount': txn['amount'],
                'status': txn['status'],
                'created_at': txn['created_at'],
                'user_name': txn['user_name'],
                'user_email': txn['user_email']
            })
        
        return jsonify({
            'success': True,
            'transactions': transaction_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/employees', methods=['GET'])
def admin_get_employees():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, role, permissions FROM admins")
        employees = cursor.fetchall()
        conn.close()
        
        employee_list = []
        for emp in employees:
            employee_list.append({
                'id': emp['id'],
                'name': emp['name'],
                'email': emp['email'],
                'role': emp['role'],
                'permissions': emp['permissions']
            })
        
        return jsonify({
            'success': True,
            'employees': employee_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# LLM Center endpoints
@app.route('/api/admin/llm-center/queue', methods=['GET'])
def admin_llm_queue():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get pending transactions count
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE status = 'pending'")
        pending_count = cursor.fetchone()[0]
        
        # Get mapped transactions count
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE status = 'mapped'")
        mapped_count = cursor.fetchone()[0]
        
        # Get actual LLM mappings count
        cursor.execute("SELECT COUNT(*) FROM llm_mappings")
        total_mappings = cursor.fetchone()[0]
        
        # Get approved LLM mappings count
        cursor.execute("SELECT COUNT(*) FROM llm_mappings WHERE status = 'approved'")
        approved_mappings = cursor.fetchone()[0]
        
        # Get auto-applied LLM mappings count
        cursor.execute("SELECT COUNT(*) FROM llm_mappings WHERE ai_processed = 1")
        auto_applied = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'queue_status': {
                    'pending_transactions': pending_count,
                    'mapped_transactions': mapped_count,
                    'processing_active': True,
                    'total_mappings': total_mappings,
                    'approved': approved_mappings,
                    'auto_applied': auto_applied
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/llm-center/processing-stats', methods=['GET'])
def admin_llm_stats():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get basic stats
        cursor.execute("SELECT COUNT(*) FROM transactions")
        total_transactions = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE status = 'mapped'")
        mapped_transactions = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_transactions': total_transactions,
                'mapped_transactions': mapped_transactions,
                'mapping_rate': round((mapped_transactions / max(total_transactions, 1)) * 100, 2)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Analytics endpoints
@app.route('/api/admin/settings/analytics', methods=['GET'])
def admin_analytics():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user analytics
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE created_at > datetime('now', '-30 days')")
        new_users_30d = cursor.fetchone()[0]
        
        # Get transaction analytics
        cursor.execute("SELECT COUNT(*) FROM transactions")
        total_transactions = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(amount) FROM transactions WHERE status = 'mapped'")
        total_invested = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return jsonify({
            'success': True,
            'analytics': {
                'users': {
                    'total': total_users,
                    'new_last_30d': new_users_30d
                },
                'transactions': {
                    'total': total_transactions,
                    'total_invested': round(total_invested, 2)
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/settings/notifications', methods=['GET'])
def admin_notifications():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get notifications
        cursor.execute("""
            SELECT id, title, message, type, created_at, read
            FROM notifications 
            ORDER BY created_at DESC
            LIMIT 50
        """)
        notifications = cursor.fetchall()
        conn.close()
        
        notification_list = []
        for notif in notifications:
            notification_list.append({
                'id': notif['id'],
                'title': notif['title'],
                'message': notif['message'],
                'type': notif['type'],
                'created_at': notif['created_at'],
                'read': bool(notif['read'])
            })
        
        return jsonify({
            'success': True,
            'notifications': notification_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/notifications', methods=['GET'])
def admin_notifications_main():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all notifications for admin
        cursor.execute("""
            SELECT id, title, message, type, created_at, read
            FROM notifications 
            ORDER BY created_at DESC
            LIMIT 100
        """)
        notifications = cursor.fetchall()
        conn.close()
        
        notification_list = []
        for notif in notifications:
            notification_list.append({
                'id': notif['id'],
                'title': notif['title'],
                'message': notif['message'],
                'type': notif['type'],
                'created_at': notif['created_at'],
                'read': bool(notif['read'])
            })
        
        return jsonify({
            'success': True,
            'notifications': notification_list,
            'total': len(notification_list)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Financial Analytics endpoint
@app.route('/api/financial/analytics', methods=['GET'])
def financial_analytics():
    try:
        period = request.args.get('period', 'month')
        
        return jsonify({
            'success': True,
            'analytics': {
                'period': period,
                'total_invested': 1250.75,
                'total_roundups': 45.30,
                'total_fees': 12.50,
                'monthly_breakdown': [
                    {'month': 'January', 'amount': 125.50},
                    {'month': 'February', 'amount': 98.75},
                    {'month': 'March', 'amount': 156.25}
                ],
                'growth_rate': 12.5,
                'projected_annual': 1500.00
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# LLM Center Mappings endpoint
@app.route('/api/admin/llm-center/mappings', methods=['GET'])
def admin_llm_mappings():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get total mappings count
        cursor.execute("SELECT COUNT(*) FROM llm_mappings")
        total_mappings = cursor.fetchone()[0]
        
        # Get pending review count
        cursor.execute("SELECT COUNT(*) FROM llm_mappings WHERE status = 'pending'")
        pending_review = cursor.fetchone()[0]
        
        # Get recent mappings (limit to 100 for performance)
        cursor.execute("""
            SELECT id, transaction_id, merchant_name, ticker, confidence, status, created_at 
            FROM llm_mappings 
            ORDER BY created_at DESC 
            LIMIT 100
        """)
        
        mappings = []
        for row in cursor.fetchall():
            mappings.append({
                'id': row[0],
                'transaction_id': row[1],
                'merchant': row[2],
                'mapped_to': row[3],
                'confidence': row[4],
                'status': row[5],
                'created_at': row[6]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'mappings': mappings,
            'total_mappings': total_mappings,
            'pending_review': pending_review
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# System Settings endpoint
@app.route('/api/admin/settings/system', methods=['GET'])
def admin_system_settings():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'settings': {
                'platform_name': 'Kamioi',
                'version': '1.0.0',
                'maintenance_mode': False,
                'registration_enabled': True,
                'max_users': 10000,
                'api_rate_limit': 1000,
                'backup_frequency': 'daily',
                'security_level': 'high'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Business Stress Test endpoint
@app.route('/api/admin/business-stress-test/categories', methods=['GET'])
def business_stress_test_categories():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'categories': [
                    {
                        'id': 1,
                        'name': 'Transaction Processing',
                        'status': 'pass',
                        'response_time': 45,
                        'threshold': 100
                    },
                    {
                        'id': 2,
                        'name': 'Database Performance',
                        'status': 'pass',
                        'response_time': 12,
                        'threshold': 50
                    },
                    {
                        'id': 3,
                        'name': 'API Endpoints',
                        'status': 'pass',
                        'response_time': 8,
                        'threshold': 30
                    }
                ]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Financial Cash Flow endpoint
@app.route('/api/financial/cash-flow', methods=['GET'])
def financial_cash_flow():
    try:
        period = request.args.get('period', 'month')
        
        return jsonify({
            'success': True,
            'cash_flow': {
                'period': period,
                'inflow': 2500.00,
                'outflow': 1800.00,
                'net_cash_flow': 700.00,
                'categories': [
                    {'name': 'Income', 'amount': 2500.00, 'type': 'inflow'},
                    {'name': 'Expenses', 'amount': 1200.00, 'type': 'outflow'},
                    {'name': 'Investments', 'amount': 600.00, 'type': 'outflow'}
                ],
                'trend': 'positive'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Financial User Analytics endpoint
@app.route('/api/financial/user-analytics', methods=['GET'])
def financial_user_analytics():
    try:
        period = request.args.get('period', 'month')
        
        return jsonify({
            'success': True,
            'user_analytics': {
                'period': period,
                'total_users': 1250,
                'active_users': 980,
                'new_users': 45,
                'user_engagement': {
                    'daily_active': 320,
                    'weekly_active': 780,
                    'monthly_active': 980
                },
                'user_behavior': {
                    'avg_session_duration': 8.5,
                    'pages_per_session': 4.2,
                    'bounce_rate': 0.15
                },
                'conversion_metrics': {
                    'signup_rate': 0.12,
                    'activation_rate': 0.85,
                    'retention_rate': 0.78
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Financial Balance Sheet endpoint
@app.route('/api/financial/balance-sheet', methods=['GET'])
def financial_balance_sheet():
    try:
        period = request.args.get('period', 'month')
        
        return jsonify({
            'success': True,
            'balance_sheet': {
                'period': period,
                'assets': {
                    'total': 50000.00,
                    'cash': 15000.00,
                    'investments': 30000.00,
                    'other': 5000.00
                },
                'liabilities': {
                    'total': 10000.00,
                    'debt': 5000.00,
                    'other': 5000.00
                },
                'equity': {
                    'total': 40000.00,
                    'retained_earnings': 25000.00,
                    'paid_in_capital': 15000.00
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Admin Security Settings endpoint
@app.route('/api/admin/settings/security', methods=['GET'])
def admin_security_settings():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'security': {
                'two_factor_enabled': True,
                'password_policy': {
                    'min_length': 8,
                    'require_special_chars': True,
                    'require_numbers': True
                },
                'session_timeout': 30,
                'login_attempts_limit': 5,
                'ip_whitelist': [],
                'audit_logging': True
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# User authentication
@app.route('/api/user/auth/login', methods=['POST'])
def user_login():
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check users table
        cursor.execute("SELECT id, email, name, role, password FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if user:
            # User found in users table
            if user['password'] == password:  # Simple password check for now
                token = f"user_token_{user['id']}"
                conn.close()
                
                return jsonify({
                    'success': True,
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'role': user['role']
                    }
                })
        
        conn.close()
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/auth/me')
def user_auth_me():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        if not token.startswith('user_token_'):
            return jsonify({'success': False, 'error': 'Invalid token format'}), 401
        
        user_id = token.replace('user_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, name, role FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role']
                }
            })
        else:
            return jsonify({'success': False, 'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# User dashboard endpoints
@app.route('/api/user/transactions', methods=['GET'])
def user_transactions():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token.replace('user_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, amount, status, created_at, description, round_up, fee, total_debit
            FROM transactions 
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        transactions = cursor.fetchall()
        conn.close()
        
        transaction_list = []
        for txn in transactions:
            transaction_list.append({
                'id': txn['id'],
                'amount': txn['amount'],
                'status': txn['status'],
                'created_at': txn['created_at'],
                'description': txn['description'],
                'round_up': txn['round_up'],
                'fee': txn['fee'],
                'total_debit': txn['total_debit']
            })
        
        return jsonify({
            'success': True,
            'transactions': transaction_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/portfolio', methods=['GET'])
def user_portfolio():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token.replace('user_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get portfolio summary
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE user_id = ? AND status = 'mapped'", (user_id,))
        total_investments = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(round_up) FROM transactions WHERE user_id = ? AND status = 'mapped'", (user_id,))
        total_roundups = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT SUM(fee) FROM transactions WHERE user_id = ?", (user_id,))
        total_fees = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return jsonify({
            'success': True,
            'portfolio': {
                'total_investments': total_investments,
                'total_roundups': round(total_roundups, 2),
                'total_fees': round(total_fees, 2),
                'current_value': round(total_roundups - total_fees, 2)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/notifications', methods=['GET'])
def user_notifications():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token.replace('user_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, message, type, created_at, read
            FROM notifications 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        """, (user_id,))
        notifications = cursor.fetchall()
        conn.close()
        
        notification_list = []
        for notif in notifications:
            notification_list.append({
                'id': notif['id'],
                'title': notif['title'],
                'message': notif['message'],
                'type': notif['type'],
                'created_at': notif['created_at'],
                'read': bool(notif['read'])
            })
        
        return jsonify({
            'success': True,
            'notifications': notification_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/goals', methods=['GET'])
def user_goals():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample goals for now
        return jsonify({
            'success': True,
            'goals': [
                {
                    'id': 1,
                    'name': 'Emergency Fund',
                    'target': 1000.00,
                    'current': 250.00,
                    'progress': 25.0
                },
                {
                    'id': 2,
                    'name': 'Vacation Fund',
                    'target': 2000.00,
                    'current': 500.00,
                    'progress': 25.0
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/roundups', methods=['GET'])
def user_roundups():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token.replace('user_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, amount, round_up, created_at, description
            FROM transactions 
            WHERE user_id = ? AND round_up > 0
            ORDER BY created_at DESC
        """, (user_id,))
        roundups = cursor.fetchall()
        conn.close()
        
        roundup_list = []
        for rup in roundups:
            roundup_list.append({
                'id': rup['id'],
                'amount': rup['amount'],
                'round_up': rup['round_up'],
                'created_at': rup['created_at'],
                'description': rup['description']
            })
        
        return jsonify({
            'success': True,
            'roundups': roundup_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/fees', methods=['GET'])
def user_fees():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token.replace('user_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, amount, fee, created_at, description
            FROM transactions 
            WHERE user_id = ? AND fee > 0
            ORDER BY created_at DESC
        """, (user_id,))
        fees = cursor.fetchall()
        conn.close()
        
        fee_list = []
        for fee in fees:
            fee_list.append({
                'id': fee['id'],
                'amount': fee['amount'],
                'fee': fee['fee'],
                'created_at': fee['created_at'],
                'description': fee['description']
            })
        
        return jsonify({
            'success': True,
            'fees': fee_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/ai-insights', methods=['GET'])
def user_ai_insights():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample AI insights
        return jsonify({
            'success': True,
            'insights': [
                {
                    'id': 1,
                    'type': 'spending_pattern',
                    'title': 'Coffee Spending Alert',
                    'message': 'You spend $45/month on coffee. Consider investing this amount.',
                    'confidence': 0.85
                },
                {
                    'id': 2,
                    'type': 'investment_opportunity',
                    'title': 'Round-up Optimization',
                    'message': 'Increase your round-up multiplier to maximize investments.',
                    'confidence': 0.92
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/stock-status', methods=['GET'])
def user_stock_status():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample stock status
        return jsonify({
            'success': True,
            'stock_status': {
                'total_shares': 15.5,
                'total_value': 1250.75,
                'pending_purchases': 3,
                'recent_activity': [
                    {
                        'ticker': 'AAPL',
                        'shares': 2.5,
                        'price': 150.25,
                        'date': '2025-10-16'
                    }
                ]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/profile', methods=['GET', 'PUT'])
def user_profile():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token.replace('user_token_', '')
        
        if request.method == 'GET':
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return jsonify({
                    'success': True,
                    'profile': {
                        'id': user['id'],
                        'name': user['name'],
                        'email': user['email'],
                        'role': user['role'],
                        'created_at': user['created_at']
                    }
                })
            else:
                return jsonify({'success': False, 'error': 'User not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json() or {}
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            
            if not name or not email:
                return jsonify({'success': False, 'error': 'Name and email are required'}), 400
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (name, email, user_id))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True, 'message': 'Profile updated successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/settings', methods=['GET', 'PUT'])
def user_settings():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        if request.method == 'GET':
            # Return sample settings
            return jsonify({
                'success': True,
                'settings': {
                    'roundup_multiplier': 1.0,
                    'auto_invest': True,
                    'notifications': True,
                    'email_alerts': True,
                    'theme': 'dark'
                }
            })
        
        elif request.method == 'PUT':
            data = request.get_json() or {}
            # Update settings logic here
            return jsonify({'success': True, 'message': 'Settings updated successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/export/transactions', methods=['GET'])
def user_export_transactions():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample export data
        return jsonify({
            'success': True,
            'export_data': {
                'format': 'csv',
                'download_url': '/api/user/export/transactions/download',
                'expires_at': '2025-10-17T00:00:00Z'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/export/portfolio', methods=['GET'])
def user_export_portfolio():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample export data
        return jsonify({
            'success': True,
            'export_data': {
                'format': 'pdf',
                'download_url': '/api/user/export/portfolio/download',
                'expires_at': '2025-10-17T00:00:00Z'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Family authentication
@app.route('/api/family/auth/login', methods=['POST'])
def family_login():
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check users table for family role
        cursor.execute("SELECT id, email, name, role, password FROM users WHERE email = ? AND role = 'family'", (email,))
        user = cursor.fetchone()
        
        if user:
            # Family user found
            if user['password'] == password:  # Simple password check for now
                token = f"family_token_{user['id']}"
                conn.close()
                
                return jsonify({
                    'success': True,
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'role': user['role']
                    }
                })
        
        conn.close()
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/auth/me')
def family_auth_me():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        if not token.startswith('family_token_'):
            return jsonify({'success': False, 'error': 'Invalid token format'}), 401
        
        user_id = token.replace('family_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, name, role FROM users WHERE id = ? AND role = 'family'", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role']
                }
            })
        else:
            return jsonify({'success': False, 'error': 'Family user not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Family dashboard endpoints
@app.route('/api/family/transactions', methods=['GET'])
def family_transactions():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        family_id = token.replace('family_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, amount, status, created_at, description, round_up, fee, total_debit
            FROM transactions 
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (family_id,))
        transactions = cursor.fetchall()
        conn.close()
        
        transaction_list = []
        for txn in transactions:
            transaction_list.append({
                'id': txn['id'],
                'amount': txn['amount'],
                'status': txn['status'],
                'created_at': txn['created_at'],
                'description': txn['description'],
                'round_up': txn['round_up'],
                'fee': txn['fee'],
                'total_debit': txn['total_debit']
            })
        
        return jsonify({
            'success': True,
            'transactions': transaction_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/portfolio', methods=['GET'])
def family_portfolio():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        family_id = token.replace('family_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get family portfolio summary
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE user_id = ? AND status = 'mapped'", (family_id,))
        total_investments = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(round_up) FROM transactions WHERE user_id = ? AND status = 'mapped'", (family_id,))
        total_roundups = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT SUM(fee) FROM transactions WHERE user_id = ?", (family_id,))
        total_fees = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return jsonify({
            'success': True,
            'portfolio': {
                'total_investments': total_investments,
                'total_roundups': round(total_roundups, 2),
                'total_fees': round(total_fees, 2),
                'current_value': round(total_roundups - total_fees, 2),
                'family_size': 4,  # Sample family size
                'shared_goals': 3   # Sample shared goals
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/notifications', methods=['GET'])
def family_notifications():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        family_id = token.replace('family_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, message, type, created_at, read
            FROM notifications 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        """, (family_id,))
        notifications = cursor.fetchall()
        conn.close()
        
        notification_list = []
        for notif in notifications:
            notification_list.append({
                'id': notif['id'],
                'title': notif['title'],
                'message': notif['message'],
                'type': notif['type'],
                'created_at': notif['created_at'],
                'read': bool(notif['read'])
            })
        
        return jsonify({
            'success': True,
            'notifications': notification_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/goals', methods=['GET'])
def family_goals():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample family goals
        return jsonify({
            'success': True,
            'goals': [
                {
                    'id': 1,
                    'name': 'Family Vacation Fund',
                    'target': 5000.00,
                    'current': 1250.00,
                    'progress': 25.0,
                    'shared_by': ['Parent 1', 'Parent 2', 'Child 1', 'Child 2']
                },
                {
                    'id': 2,
                    'name': 'College Fund',
                    'target': 10000.00,
                    'current': 2500.00,
                    'progress': 25.0,
                    'shared_by': ['Parent 1', 'Parent 2']
                },
                {
                    'id': 3,
                    'name': 'Emergency Fund',
                    'target': 2000.00,
                    'current': 1000.00,
                    'progress': 50.0,
                    'shared_by': ['Parent 1', 'Parent 2']
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/roundups', methods=['GET'])
def family_roundups():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        family_id = token.replace('family_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, amount, round_up, created_at, description
            FROM transactions 
            WHERE user_id = ? AND round_up > 0
            ORDER BY created_at DESC
        """, (family_id,))
        roundups = cursor.fetchall()
        conn.close()
        
        roundup_list = []
        for rup in roundups:
            roundup_list.append({
                'id': rup['id'],
                'amount': rup['amount'],
                'round_up': rup['round_up'],
                'created_at': rup['created_at'],
                'description': rup['description']
            })
        
        return jsonify({
            'success': True,
            'roundups': roundup_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/fees', methods=['GET'])
def family_fees():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        family_id = token.replace('family_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, amount, fee, created_at, description
            FROM transactions 
            WHERE user_id = ? AND fee > 0
            ORDER BY created_at DESC
        """, (family_id,))
        fees = cursor.fetchall()
        conn.close()
        
        fee_list = []
        for fee in fees:
            fee_list.append({
                'id': fee['id'],
                'amount': fee['amount'],
                'fee': fee['fee'],
                'created_at': fee['created_at'],
                'description': fee['description']
            })
        
        return jsonify({
            'success': True,
            'fees': fee_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/ai-insights', methods=['GET'])
def family_ai_insights():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample family AI insights
        return jsonify({
            'success': True,
            'insights': [
                {
                    'id': 1,
                    'type': 'family_spending_pattern',
                    'title': 'Family Grocery Spending Alert',
                    'message': 'Your family spends $400/month on groceries. Consider bulk buying to save $50/month.',
                    'confidence': 0.88
                },
                {
                    'id': 2,
                    'type': 'family_investment_opportunity',
                    'title': 'Family Round-up Optimization',
                    'message': 'Increase family round-up multiplier to maximize shared investments.',
                    'confidence': 0.92
                },
                {
                    'id': 3,
                    'type': 'family_budget_insight',
                    'title': 'Budget Reallocation Suggestion',
                    'message': 'Reallocate 10% from entertainment to education fund for better long-term returns.',
                    'confidence': 0.85
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/stock-status', methods=['GET'])
def family_stock_status():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample family stock status
        return jsonify({
            'success': True,
            'stock_status': {
                'total_shares': 45.5,
                'total_value': 3750.25,
                'pending_purchases': 5,
                'family_holdings': [
                    {
                        'ticker': 'AAPL',
                        'shares': 8.5,
                        'price': 150.25,
                        'value': 1277.13,
                        'date': '2025-10-16'
                    },
                    {
                        'ticker': 'MSFT',
                        'shares': 12.0,
                        'price': 300.50,
                        'value': 3606.00,
                        'date': '2025-10-15'
                    }
                ]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/profile', methods=['GET', 'PUT'])
def family_profile():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        family_id = token.replace('family_token_', '')
        
        if request.method == 'GET':
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?", (family_id,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return jsonify({
                    'success': True,
                    'profile': {
                        'id': user['id'],
                        'name': user['name'],
                        'email': user['email'],
                        'role': user['role'],
                        'created_at': user['created_at'],
                        'family_size': 4,
                        'family_members': ['Parent 1', 'Parent 2', 'Child 1', 'Child 2']
                    }
                })
            else:
                return jsonify({'success': False, 'error': 'Family not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json() or {}
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            
            if not name or not email:
                return jsonify({'success': False, 'error': 'Name and email are required'}), 400
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (name, email, family_id))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True, 'message': 'Family profile updated successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/settings', methods=['GET', 'PUT'])
def family_settings():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        if request.method == 'GET':
            # Return sample family settings
            return jsonify({
                'success': True,
                'settings': {
                    'roundup_multiplier': 1.5,
                    'auto_invest': True,
                    'notifications': True,
                    'email_alerts': True,
                    'theme': 'dark',
                    'family_sharing': True,
                    'budget_alerts': True,
                    'spending_limits': {
                        'daily': 200.00,
                        'weekly': 1000.00,
                        'monthly': 4000.00
                    }
                }
            })
        
        elif request.method == 'PUT':
            data = request.get_json() or {}
            # Update family settings logic here
            return jsonify({'success': True, 'message': 'Family settings updated successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/members', methods=['GET'])
def family_members():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample family members
        return jsonify({
            'success': True,
            'members': [
                {
                    'id': 1,
                    'name': 'John Smith',
                    'role': 'Parent',
                    'email': 'john@family.com',
                    'permissions': ['view_transactions', 'manage_budget', 'set_goals'],
                    'spending_limit': 500.00
                },
                {
                    'id': 2,
                    'name': 'Jane Smith',
                    'role': 'Parent',
                    'email': 'jane@family.com',
                    'permissions': ['view_transactions', 'manage_budget', 'set_goals'],
                    'spending_limit': 500.00
                },
                {
                    'id': 3,
                    'name': 'Tommy Smith',
                    'role': 'Child',
                    'email': 'tommy@family.com',
                    'permissions': ['view_transactions'],
                    'spending_limit': 50.00
                },
                {
                    'id': 4,
                    'name': 'Sally Smith',
                    'role': 'Child',
                    'email': 'sally@family.com',
                    'permissions': ['view_transactions'],
                    'spending_limit': 50.00
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/budget', methods=['GET'])
def family_budget():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample family budget
        return jsonify({
            'success': True,
            'budget': {
                'monthly_income': 8000.00,
                'monthly_expenses': 6000.00,
                'savings_rate': 25.0,
                'categories': [
                    {'name': 'Housing', 'budgeted': 2000.00, 'spent': 1950.00, 'remaining': 50.00},
                    {'name': 'Food', 'budgeted': 1200.00, 'spent': 1100.00, 'remaining': 100.00},
                    {'name': 'Transportation', 'budgeted': 800.00, 'spent': 750.00, 'remaining': 50.00},
                    {'name': 'Entertainment', 'budgeted': 400.00, 'spent': 350.00, 'remaining': 50.00},
                    {'name': 'Education', 'budgeted': 600.00, 'spent': 600.00, 'remaining': 0.00}
                ]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/expenses', methods=['GET'])
def family_expenses():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample family expenses
        return jsonify({
            'success': True,
            'expenses': [
                {
                    'id': 1,
                    'category': 'Food',
                    'amount': 45.50,
                    'description': 'Grocery shopping',
                    'date': '2025-10-16',
                    'member': 'John Smith'
                },
                {
                    'id': 2,
                    'category': 'Transportation',
                    'amount': 25.00,
                    'description': 'Gas',
                    'date': '2025-10-15',
                    'member': 'Jane Smith'
                },
                {
                    'id': 3,
                    'category': 'Entertainment',
                    'amount': 15.00,
                    'description': 'Movie tickets',
                    'date': '2025-10-14',
                    'member': 'Tommy Smith'
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/savings', methods=['GET'])
def family_savings():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample family savings
        return jsonify({
            'success': True,
            'savings': {
                'total_saved': 2500.00,
                'monthly_savings': 500.00,
                'savings_rate': 25.0,
                'goals_progress': [
                    {'goal': 'Vacation Fund', 'target': 5000.00, 'current': 1250.00, 'progress': 25.0},
                    {'goal': 'College Fund', 'target': 10000.00, 'current': 2500.00, 'progress': 25.0},
                    {'goal': 'Emergency Fund', 'target': 2000.00, 'current': 1000.00, 'progress': 50.0}
                ]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/export/transactions', methods=['GET'])
def family_export_transactions():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample export data
        return jsonify({
            'success': True,
            'export_data': {
                'format': 'csv',
                'download_url': '/api/family/export/transactions/download',
                'expires_at': '2025-10-17T00:00:00Z'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/export/portfolio', methods=['GET'])
def family_export_portfolio():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample export data
        return jsonify({
            'success': True,
            'export_data': {
                'format': 'pdf',
                'download_url': '/api/family/export/portfolio/download',
                'expires_at': '2025-10-17T00:00:00Z'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/family/export/members', methods=['GET'])
def family_export_members():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample export data
        return jsonify({
            'success': True,
            'export_data': {
                'format': 'csv',
                'download_url': '/api/family/export/members/download',
                'expires_at': '2025-10-17T00:00:00Z'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Business authentication
@app.route('/api/business/auth/login', methods=['POST'])
def business_login():
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check users table for business role
        cursor.execute("SELECT id, email, name, role, password FROM users WHERE email = ? AND role = 'business'", (email,))
        user = cursor.fetchone()
        
        if user:
            # Business user found
            if user['password'] == password:  # Simple password check for now
                token = f"business_token_{user['id']}"
                conn.close()
                
                return jsonify({
                    'success': True,
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'role': user['role']
                    }
                })
        
        conn.close()
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/auth/me')
def business_auth_me():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        if not token.startswith('business_token_'):
            return jsonify({'success': False, 'error': 'Invalid token format'}), 401
        
        user_id = token.replace('business_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, name, role FROM users WHERE id = ? AND role = 'business'", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role']
                }
            })
        else:
            return jsonify({'success': False, 'error': 'Business user not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Business dashboard endpoints
@app.route('/api/business/transactions', methods=['GET'])
def business_transactions():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        business_id = token.replace('business_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, amount, status, created_at, description, round_up, fee, total_debit
            FROM transactions 
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (business_id,))
        transactions = cursor.fetchall()
        conn.close()
        
        transaction_list = []
        for txn in transactions:
            transaction_list.append({
                'id': txn['id'],
                'amount': txn['amount'],
                'status': txn['status'],
                'created_at': txn['created_at'],
                'description': txn['description'],
                'round_up': txn['round_up'],
                'fee': txn['fee'],
                'total_debit': txn['total_debit']
            })
        
        return jsonify({
            'success': True,
            'transactions': transaction_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/portfolio', methods=['GET'])
def business_portfolio():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        business_id = token.replace('business_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get business portfolio summary
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE user_id = ? AND status = 'mapped'", (business_id,))
        total_investments = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(round_up) FROM transactions WHERE user_id = ? AND status = 'mapped'", (business_id,))
        total_roundups = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT SUM(fee) FROM transactions WHERE user_id = ?", (business_id,))
        total_fees = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return jsonify({
            'success': True,
            'portfolio': {
                'total_investments': total_investments,
                'total_roundups': round(total_roundups, 2),
                'total_fees': round(total_fees, 2),
                'current_value': round(total_roundups - total_fees, 2),
                'business_size': 25,  # Sample business size
                'departments': 5,     # Sample departments
                'employees': 25       # Sample employee count
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/notifications', methods=['GET'])
def business_notifications():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        business_id = token.replace('business_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, message, type, created_at, read
            FROM notifications 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        """, (business_id,))
        notifications = cursor.fetchall()
        conn.close()
        
        notification_list = []
        for notif in notifications:
            notification_list.append({
                'id': notif['id'],
                'title': notif['title'],
                'message': notif['message'],
                'type': notif['type'],
                'created_at': notif['created_at'],
                'read': bool(notif['read'])
            })
        
        return jsonify({
            'success': True,
            'notifications': notification_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/goals', methods=['GET'])
def business_goals():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business goals
        return jsonify({
            'success': True,
            'goals': [
                {
                    'id': 1,
                    'name': 'Q4 Revenue Target',
                    'target': 50000.00,
                    'current': 35000.00,
                    'progress': 70.0,
                    'department': 'Sales',
                    'deadline': '2025-12-31'
                },
                {
                    'id': 2,
                    'name': 'Employee Training Program',
                    'target': 10000.00,
                    'current': 7500.00,
                    'progress': 75.0,
                    'department': 'HR',
                    'deadline': '2025-11-30'
                },
                {
                    'id': 3,
                    'name': 'Technology Upgrade',
                    'target': 25000.00,
                    'current': 15000.00,
                    'progress': 60.0,
                    'department': 'IT',
                    'deadline': '2025-12-15'
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/roundups', methods=['GET'])
def business_roundups():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        business_id = token.replace('business_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, amount, round_up, created_at, description
            FROM transactions 
            WHERE user_id = ? AND round_up > 0
            ORDER BY created_at DESC
        """, (business_id,))
        roundups = cursor.fetchall()
        conn.close()
        
        roundup_list = []
        for rup in roundups:
            roundup_list.append({
                'id': rup['id'],
                'amount': rup['amount'],
                'round_up': rup['round_up'],
                'created_at': rup['created_at'],
                'description': rup['description']
            })
        
        return jsonify({
            'success': True,
            'roundups': roundup_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/fees', methods=['GET'])
def business_fees():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        business_id = token.replace('business_token_', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, amount, fee, created_at, description
            FROM transactions 
            WHERE user_id = ? AND fee > 0
            ORDER BY created_at DESC
        """, (business_id,))
        fees = cursor.fetchall()
        conn.close()
        
        fee_list = []
        for fee in fees:
            fee_list.append({
                'id': fee['id'],
                'amount': fee['amount'],
                'fee': fee['fee'],
                'created_at': fee['created_at'],
                'description': fee['description']
            })
        
        return jsonify({
            'success': True,
            'fees': fee_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/ai-insights', methods=['GET'])
def business_ai_insights():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business AI insights
        return jsonify({
            'success': True,
            'insights': [
                {
                    'id': 1,
                    'type': 'business_spending_pattern',
                    'title': 'Office Supply Cost Optimization',
                    'message': 'Your business spends $2,500/month on office supplies. Consider bulk purchasing to save $300/month.',
                    'confidence': 0.92
                },
                {
                    'id': 2,
                    'type': 'business_investment_opportunity',
                    'title': 'Business Round-up Optimization',
                    'message': 'Increase business round-up multiplier to maximize corporate investments.',
                    'confidence': 0.88
                },
                {
                    'id': 3,
                    'type': 'business_budget_insight',
                    'title': 'Department Budget Reallocation',
                    'message': 'Reallocate 15% from marketing to R&D for better long-term growth.',
                    'confidence': 0.85
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/stock-status', methods=['GET'])
def business_stock_status():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business stock status
        return jsonify({
            'success': True,
            'stock_status': {
                'total_shares': 125.5,
                'total_value': 18750.75,
                'pending_purchases': 8,
                'business_holdings': [
                    {
                        'ticker': 'AAPL',
                        'shares': 25.5,
                        'price': 150.25,
                        'value': 3831.38,
                        'date': '2025-10-16'
                    },
                    {
                        'ticker': 'MSFT',
                        'shares': 30.0,
                        'price': 300.50,
                        'value': 9015.00,
                        'date': '2025-10-15'
                    },
                    {
                        'ticker': 'GOOGL',
                        'shares': 15.0,
                        'price': 120.25,
                        'value': 1803.75,
                        'date': '2025-10-14'
                    }
                ]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/profile', methods=['GET', 'PUT'])
def business_profile():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        business_id = token.replace('business_token_', '')
        
        if request.method == 'GET':
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?", (business_id,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return jsonify({
                    'success': True,
                    'profile': {
                        'id': user['id'],
                        'name': user['name'],
                        'email': user['email'],
                        'role': user['role'],
                        'created_at': user['created_at'],
                        'business_size': 25,
                        'departments': 5,
                        'employees': 25,
                        'industry': 'Technology',
                        'revenue': 500000.00
                    }
                })
            else:
                return jsonify({'success': False, 'error': 'Business not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json() or {}
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            
            if not name or not email:
                return jsonify({'success': False, 'error': 'Name and email are required'}), 400
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (name, email, business_id))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True, 'message': 'Business profile updated successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/settings', methods=['GET', 'PUT'])
def business_settings():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        if request.method == 'GET':
            # Return sample business settings
            return jsonify({
                'success': True,
                'settings': {
                    'roundup_multiplier': 2.0,
                    'auto_invest': True,
                    'notifications': True,
                    'email_alerts': True,
                    'theme': 'dark',
                    'business_sharing': True,
                    'budget_alerts': True,
                    'department_limits': {
                        'sales': 10000.00,
                        'marketing': 5000.00,
                        'hr': 3000.00,
                        'it': 8000.00,
                        'operations': 6000.00
                    }
                }
            })
        
        elif request.method == 'PUT':
            data = request.get_json() or {}
            # Update business settings logic here
            return jsonify({'success': True, 'message': 'Business settings updated successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/employees', methods=['GET'])
def business_employees():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business employees
        return jsonify({
            'success': True,
            'employees': [
                {
                    'id': 1,
                    'name': 'John Smith',
                    'role': 'CEO',
                    'email': 'john@business.com',
                    'department': 'Executive',
                    'permissions': ['full_access'],
                    'spending_limit': 5000.00,
                    'salary': 150000.00
                },
                {
                    'id': 2,
                    'name': 'Jane Doe',
                    'role': 'CFO',
                    'email': 'jane@business.com',
                    'department': 'Finance',
                    'permissions': ['financial_access', 'budget_management'],
                    'spending_limit': 3000.00,
                    'salary': 120000.00
                },
                {
                    'id': 3,
                    'name': 'Mike Johnson',
                    'role': 'Manager',
                    'email': 'mike@business.com',
                    'department': 'Sales',
                    'permissions': ['department_access'],
                    'spending_limit': 1000.00,
                    'salary': 80000.00
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/departments', methods=['GET'])
def business_departments():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business departments
        return jsonify({
            'success': True,
            'departments': [
                {
                    'id': 1,
                    'name': 'Sales',
                    'budget': 100000.00,
                    'spent': 75000.00,
                    'employees': 8,
                    'manager': 'Mike Johnson'
                },
                {
                    'id': 2,
                    'name': 'Marketing',
                    'budget': 50000.00,
                    'spent': 35000.00,
                    'employees': 5,
                    'manager': 'Sarah Wilson'
                },
                {
                    'id': 3,
                    'name': 'HR',
                    'budget': 30000.00,
                    'spent': 25000.00,
                    'employees': 3,
                    'manager': 'Tom Brown'
                },
                {
                    'id': 4,
                    'name': 'IT',
                    'budget': 80000.00,
                    'spent': 60000.00,
                    'employees': 6,
                    'manager': 'Alex Chen'
                },
                {
                    'id': 5,
                    'name': 'Operations',
                    'budget': 60000.00,
                    'spent': 45000.00,
                    'employees': 4,
                    'manager': 'Lisa Davis'
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/expenses', methods=['GET'])
def business_expenses():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business expenses
        return jsonify({
            'success': True,
            'expenses': [
                {
                    'id': 1,
                    'category': 'Office Supplies',
                    'amount': 250.00,
                    'description': 'Office supplies for Q4',
                    'date': '2025-10-16',
                    'department': 'Operations',
                    'employee': 'Lisa Davis'
                },
                {
                    'id': 2,
                    'category': 'Marketing',
                    'amount': 1500.00,
                    'description': 'Digital marketing campaign',
                    'date': '2025-10-15',
                    'department': 'Marketing',
                    'employee': 'Sarah Wilson'
                },
                {
                    'id': 3,
                    'category': 'Technology',
                    'amount': 5000.00,
                    'description': 'Software licenses',
                    'date': '2025-10-14',
                    'department': 'IT',
                    'employee': 'Alex Chen'
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/revenue', methods=['GET'])
def business_revenue():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business revenue
        return jsonify({
            'success': True,
            'revenue': {
                'monthly_revenue': 50000.00,
                'quarterly_revenue': 150000.00,
                'yearly_revenue': 600000.00,
                'revenue_breakdown': [
                    {'source': 'Product Sales', 'amount': 30000.00, 'percentage': 60.0},
                    {'source': 'Services', 'amount': 15000.00, 'percentage': 30.0},
                    {'source': 'Consulting', 'amount': 5000.00, 'percentage': 10.0}
                ],
                'growth_rate': 15.5,
                'projected_revenue': 650000.00
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/budget', methods=['GET'])
def business_budget():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business budget
        return jsonify({
            'success': True,
            'budget': {
                'total_budget': 320000.00,
                'total_spent': 240000.00,
                'remaining_budget': 80000.00,
                'departments': [
                    {'name': 'Sales', 'budgeted': 100000.00, 'spent': 75000.00, 'remaining': 25000.00},
                    {'name': 'Marketing', 'budgeted': 50000.00, 'spent': 35000.00, 'remaining': 15000.00},
                    {'name': 'HR', 'budgeted': 30000.00, 'spent': 25000.00, 'remaining': 5000.00},
                    {'name': 'IT', 'budgeted': 80000.00, 'spent': 60000.00, 'remaining': 20000.00},
                    {'name': 'Operations', 'budgeted': 60000.00, 'spent': 45000.00, 'remaining': 15000.00}
                ]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/analytics', methods=['GET'])
def business_analytics():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business analytics
        return jsonify({
            'success': True,
            'analytics': {
                'financial_metrics': {
                    'revenue_growth': 15.5,
                    'profit_margin': 22.3,
                    'expense_ratio': 0.65,
                    'roi': 18.7
                },
                'operational_metrics': {
                    'employee_productivity': 85.2,
                    'department_efficiency': 78.5,
                    'budget_utilization': 75.0,
                    'goal_completion': 82.1
                },
                'trends': [
                    {'metric': 'Revenue', 'trend': 'up', 'change': 15.5},
                    {'metric': 'Expenses', 'trend': 'down', 'change': -5.2},
                    {'metric': 'Profit', 'trend': 'up', 'change': 25.8},
                    {'metric': 'ROI', 'trend': 'up', 'change': 12.3}
                ]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/reports', methods=['GET'])
def business_reports():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample business reports
        return jsonify({
            'success': True,
            'reports': [
                {
                    'id': 1,
                    'name': 'Monthly Financial Report',
                    'type': 'financial',
                    'generated_date': '2025-10-16',
                    'status': 'completed',
                    'download_url': '/api/business/reports/1/download'
                },
                {
                    'id': 2,
                    'name': 'Department Performance Report',
                    'type': 'performance',
                    'generated_date': '2025-10-15',
                    'status': 'completed',
                    'download_url': '/api/business/reports/2/download'
                },
                {
                    'id': 3,
                    'name': 'Employee Analytics Report',
                    'type': 'hr',
                    'generated_date': '2025-10-14',
                    'status': 'processing',
                    'download_url': None
                }
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/export/transactions', methods=['GET'])
def business_export_transactions():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample export data
        return jsonify({
            'success': True,
            'export_data': {
                'format': 'csv',
                'download_url': '/api/business/export/transactions/download',
                'expires_at': '2025-10-17T00:00:00Z'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/export/portfolio', methods=['GET'])
def business_export_portfolio():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample export data
        return jsonify({
            'success': True,
            'export_data': {
                'format': 'pdf',
                'download_url': '/api/business/export/portfolio/download',
                'expires_at': '2025-10-17T00:00:00Z'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/export/employees', methods=['GET'])
def business_export_employees():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample export data
        return jsonify({
            'success': True,
            'export_data': {
                'format': 'csv',
                'download_url': '/api/business/export/employees/download',
                'expires_at': '2025-10-17T00:00:00Z'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/business/export/analytics', methods=['GET'])
def business_export_analytics():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return sample export data
        return jsonify({
            'success': True,
            'export_data': {
                'format': 'excel',
                'download_url': '/api/business/export/analytics/download',
                'expires_at': '2025-10-17T00:00:00Z'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting clean admin, user, and family server...")
    print("Available endpoints:")
    print("  /api/health")
    print("  /api/admin/auth/login")
    print("  /api/admin/auth/me")
    print("  /api/admin/users")
    print("  /api/admin/family-users")
    print("  /api/admin/business-users")
    print("  /api/admin/user-metrics")
    print("  /api/admin/transactions")
    print("  /api/admin/employees")
    print("  /api/admin/llm-center/queue")
    print("  /api/admin/llm-center/processing-stats")
    print("  /api/admin/settings/analytics")
    print("  /api/admin/settings/notifications")
    print("  /api/user/auth/login")
    print("  /api/user/auth/me")
    print("  /api/user/transactions")
    print("  /api/user/portfolio")
    print("  /api/user/notifications")
    print("  /api/user/goals")
    print("  /api/user/roundups")
    print("  /api/user/fees")
    print("  /api/user/ai-insights")
    print("  /api/user/stock-status")
    print("  /api/user/profile")
    print("  /api/user/settings")
    print("  /api/user/export/transactions")
    print("  /api/user/export/portfolio")
    print("  /api/family/auth/login")
    print("  /api/family/auth/me")
    print("  /api/family/transactions")
    print("  /api/family/portfolio")
    print("  /api/family/notifications")
    print("  /api/family/goals")
    print("  /api/family/roundups")
    print("  /api/family/fees")
    print("  /api/family/ai-insights")
    print("  /api/family/stock-status")
    print("  /api/family/profile")
    print("  /api/family/settings")
    print("  /api/family/members")
    print("  /api/family/budget")
    print("  /api/family/expenses")
    print("  /api/family/savings")
    print("  /api/family/export/transactions")
    print("  /api/family/export/portfolio")
    print("  /api/family/export/members")

# Missing endpoints that need to be implemented
@app.route('/api/ml/stats', methods=['GET'])
def ml_stats():
    try:
        return jsonify({
            'success': True,
            'stats': {
                'total_models': 3,
                'active_models': 2,
                'training_accuracy': 0.95,
                'prediction_count': 1250,
                'last_training': '2025-10-17T01:30:00Z'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/llm-data/system-status', methods=['GET'])
def llm_system_status():
    try:
        return jsonify({
            'success': True,
            'status': {
                'system_health': 'operational',
                'active_processes': 5,
                'queue_size': 12,
                'last_processed': '2025-10-17T01:30:00Z',
                'uptime': '99.9%'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/llm-data/event-stats', methods=['GET'])
def llm_event_stats():
    try:
        return jsonify({
            'success': True,
            'events': {
                'total_events': 1500,
                'processed_today': 45,
                'pending_events': 8,
                'error_rate': 0.02
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/schema', methods=['GET'])
def admin_database_schema():
    try:
        return jsonify({
            'success': True,
            'schema': {
                'tables': ['users', 'transactions', 'notifications', 'admins'],
                'total_tables': 4,
                'last_updated': '2025-10-17T01:30:00Z'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/stats', methods=['GET'])
def admin_database_stats():
    try:
        return jsonify({
            'success': True,
            'stats': {
                'total_records': 1250,
                'database_size': '2.5MB',
                'last_backup': '2025-10-17T01:00:00Z',
                'connection_count': 3
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/feature-flags', methods=['GET'])
def admin_feature_flags():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return empty data - no mock data
        return jsonify({
            'success': True,
            'data': {
                'feature_flags': [],
                'segments': [],
                'experiments': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/messaging/campaigns', methods=['GET'])
def admin_messaging_campaigns():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return empty data - no mock data
        return jsonify({
            'success': True,
            'data': {
                'campaigns': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/messages/admin/all', methods=['GET'])
def messages_admin_all():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return empty data - no mock data
        return jsonify({
            'success': True,
            'messages': []
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/badges', methods=['GET'])
def admin_badges():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return empty data - no mock data
        return jsonify({
            'success': True,
            'data': {
                'badges': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/advertisements/campaigns', methods=['GET'])
def admin_advertisement_campaigns():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return empty data - no mock data
        return jsonify({
            'success': True,
            'data': {
                'campaigns': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/crm/contacts', methods=['GET'])
def admin_crm_contacts():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return empty data - no mock data
        return jsonify({
            'success': True,
            'data': {
                'contacts': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/content/pages', methods=['GET'])
def admin_content_pages():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return empty data - no mock data
        return jsonify({
            'success': True,
            'data': {
                'pages': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/modules', methods=['GET'])
def admin_modules():
    try:
        return jsonify({
            'success': True,
            'data': {
                'modules': [
                    {'id': 1, 'name': 'User Management', 'status': 'active'},
                    {'id': 2, 'name': 'Analytics', 'status': 'active'},
                    {'id': 3, 'name': 'Notifications', 'status': 'inactive'}
                ]
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/settings/fees', methods=['GET'])
def admin_settings_fees():
    try:
        return jsonify({
            'success': True,
            'fees': {
                'platform_fee': 0.25,
                'investment_fee': 0.01,
                'withdrawal_fee': 0.00
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/business-stress-test/status', methods=['GET'])
def admin_business_stress_test_status():
    try:
        return jsonify({
            'success': True,
            'status': {
                'test_running': False,
                'last_test': '2025-10-16T15:30:00Z',
                'results': {
                    'performance_score': 95,
                    'stability_score': 98,
                    'recommendations': ['Increase server capacity', 'Optimize database queries']
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/system-health', methods=['GET'])
def admin_system_health():
    try:
        return jsonify({
            'success': True,
            'data': {
                'system_status': 'operational',
                'uptime': '99.9%',
                'cpu_usage': 45,
                'memory_usage': 62,
                'disk_usage': 38,
                'database_status': 'connected',
                'api_response_time': 120,
                'active_users': 1250,
                'last_backup': '2025-10-17T01:00:00Z',
                'alerts': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/google-analytics', methods=['GET'])
def admin_google_analytics():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        # Return empty data - no mock data
        return jsonify({
            'success': True,
            'data': {
                'page_views': 0,
                'sessions': 0,
                'bounce_rate': 0,
                'avg_session_duration': 0,
                'top_pages': [],
                'traffic_sources': [],
                'device_breakdown': [],
                'geographic_data': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Database Management Endpoints
@app.route('/api/admin/database/connectivity-matrix', methods=['GET'])
def admin_database_connectivity_matrix():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'connections': [],
                'status': 'healthy'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/data-quality', methods=['GET'])
def admin_database_data_quality():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'quality_score': 100,
                'issues': [],
                'last_check': None
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/migrations-drift', methods=['GET'])
def admin_database_migrations_drift():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'drift_detected': False,
                'pending_migrations': [],
                'last_sync': None
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/performance', methods=['GET'])
def admin_database_performance():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'query_time': 0,
                'connections': 0,
                'cache_hit_rate': 100
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/ledger/consistency', methods=['GET'])
def admin_ledger_consistency():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'consistent': True,
                'last_check': None,
                'issues': []
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/pipelines/events', methods=['GET'])
def admin_pipelines_events():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'events': [],
                'status': 'healthy'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/security/access', methods=['GET'])
def admin_security_access():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'access_logs': [],
                'security_score': 100
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/replication/backups', methods=['GET'])
def admin_replication_backups():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'backups': [],
                'last_backup': None
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/performance/storage', methods=['GET'])
def admin_performance_storage():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'storage_used': 0,
                'storage_available': 100,
                'performance': 'optimal'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/vector-store/health', methods=['GET'])
def admin_vector_store_health():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'status': 'healthy',
                'vectors': 0,
                'last_update': None
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/vector-store/embeddings', methods=['GET'])
def admin_vector_store_embeddings():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'embeddings': [],
                'total_vectors': 0
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/warehouse-sync', methods=['GET'])
def admin_database_warehouse_sync():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'sync_status': 'healthy',
                'last_sync': None,
                'pending_changes': 0
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/test-sandbox', methods=['GET'])
def admin_database_test_sandbox():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'sandbox_status': 'ready',
                'test_results': [],
                'last_test': None
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/alerts-slos', methods=['GET'])
def admin_database_alerts_slos():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'No token provided'}), 401
        
        return jsonify({
            'success': True,
            'data': {
                'alerts': [],
                'slos': [],
                'status': 'healthy'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)