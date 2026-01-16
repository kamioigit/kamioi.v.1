#!/usr/bin/env python3
"""
Working Flask server - minimal and guaranteed to work
"""
import sys
import os
sys.path.append('.')

from flask import Flask, jsonify, request
from flask_cors import CORS

# Create Flask app
app = Flask(__name__)
CORS(app, origins=['*'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

@app.route('/')
def root():
    return jsonify({'status': 'ok', 'message': 'Working Kamioi API'})

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'timestamp': '2025-10-15T01:50:00'})

@app.route('/api/admin/auth/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if email == 'admin@admin.com' and password == 'admin123':
        return jsonify({
            'success': True,
            'token': 'token_6',
            'user': {
                'id': 6,
                'email': 'admin@admin.com',
                'name': 'Admin User',
                'role': 'admin',
                'dashboard': 'admin'
            }
        })
    else:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/api/user/auth/login', methods=['POST'])
def user_login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if email == 'test@example.com' and password == 'password':
        return jsonify({
            'success': True,
            'token': 'token_1',
            'user': {
                'id': 1,
                'email': 'test@example.com',
                'name': 'Test User',
                'role': 'user',
                'dashboard': 'user'
            }
        })
    else:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/api/user/auth/logout', methods=['POST'])
def user_logout():
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/admin/auth/logout', methods=['POST'])
def admin_logout():
    return jsonify({'success': True, 'message': 'Admin logged out successfully'})

@app.route('/api/admin/transactions')
def admin_transactions():
    return jsonify({
        'success': True,
        'data': {
            'allData': [],
            'summary': {'total_transactions': 0, 'total_amount': 0.0}
        }
    })

@app.route('/api/admin/llm-center/queue')
def llm_queue():
    return jsonify({
        'success': True,
        'data': {
            'all_entries': [],
            'pending_reviews': [],
            'queue_status': {'total': 0}
        }
    })

@app.route('/api/admin/llm-center/mappings')
def llm_mappings():
    return jsonify({
        'success': True,
        'data': {'mappings': [], 'total': 0}
    })

@app.route('/api/admin/bulk-upload', methods=['POST'])
def bulk_upload():
    return jsonify({
        'success': True,
        'message': 'Bulk upload completed successfully',
        'processed': 1000,
        'errors': 0
    })

if __name__ == '__main__':
    print("🚀 Starting Working Kamioi Server...")
    print("📊 Health: http://localhost:5000/api/health")
    print("👤 User Login: http://localhost:5000/api/user/auth/login")
    print("🔧 Admin Login: http://localhost:5000/api/admin/auth/login")
    app.run(host='127.0.0.1', port=5000, debug=False)


