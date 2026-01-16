with open('app.py', 'wb') as f:
    content = b'''from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect('kamioi.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    return jsonify({'status': 'ok'})

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy'})

@app.route('/api/admin/users')
def admin_users():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute('SELECT id, email, name, account_type FROM users ORDER BY id')
        users = [dict(row) for row in cur.fetchall()]
        conn.close()
        return jsonify({'success': True, 'users': users})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/connectivity-matrix')
def admin_db_connectivity():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute('SELECT name FROM sqlite_master WHERE type="table"')
        tables = [row['name'] for row in cur.fetchall()]
        conn.close()
        return jsonify({'success': True, 'tables': tables})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/data-quality')
def admin_db_quality():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) as count FROM users')
        users = cur.fetchone()['count']
        cur.execute('SELECT COUNT(*) as count FROM transactions')
        transactions = cur.fetchone()['count']
        conn.close()
        return jsonify({'success': True, 'users': users, 'transactions': transactions})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/database/performance')
def admin_db_performance():
    try:
        import time
        start = time.time()
        conn = get_db()
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) FROM users')
        count = cur.fetchone()[0]
        conn.close()
        query_time = (time.time() - start) * 1000
        return jsonify({'success': True, 'query_time_ms': round(query_time, 2), 'users': count})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/ledger/consistency')
def admin_ledger():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) as count FROM transactions')
        transactions = cur.fetchone()['count']
        conn.close()
        return jsonify({'success': True, 'transactions': transactions})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print('Starting Kamioi Server on port 5000...')
    app.run(host='0.0.0.0', port=5000, debug=False)
'''
    f.write(content)
print('Created app.py')
