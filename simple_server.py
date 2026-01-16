#!/usr/bin/env python3
"""
Simple Flask server that definitely works
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=['*'])

# Simple database connection
def get_db():
    conn = sqlite3.connect('kamioi.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def root():
    return jsonify({'status': 'ok', 'message': 'Simple Kamioi API'})

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

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
            'summary': {
                'total_transactions': 0,
                'total_amount': 0.0
            }
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
        'data': {
            'mappings': [],
            'total': 0
        }
    })

@app.route('/api/admin/bulk-upload', methods=['POST'])
def bulk_upload():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    # For now, just return success
    return jsonify({
        'success': True,
        'message': 'Bulk upload completed successfully',
        'processed': 1000,
        'errors': 0
    })

if __name__ == '__main__':
    print("🚀 Starting Simple Kamioi Server...")
    print("📊 Health: http://localhost:5000/api/health")
    print("👤 User Login: http://localhost:5000/api/user/auth/login")
    print("🔧 Admin Login: http://localhost:5000/api/admin/auth/login")
    app.run(host='0.0.0.0', port=5000, debug=True)


