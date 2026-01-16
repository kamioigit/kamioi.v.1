#!/usr/bin/env python3
"""
System Audit Script - Check data consistency between database and API endpoints
"""

import requests
import json
import sqlite3

def audit_database():
    """Audit the database directly"""
    print("=== DATABASE AUDIT ===")
    
    conn = sqlite3.connect('kamioi.db')
    cursor = conn.cursor()
    
    # Check user5@user5.com
    cursor.execute('SELECT id, email, name, role FROM users WHERE email = ?', ('user5@user5.com',))
    user = cursor.fetchone()
    if user:
        print(f"[OK] User found: ID={user[0]}, Email={user[1]}, Name={user[2]}, Role={user[3]}")
        
        # Check transactions
        cursor.execute('SELECT COUNT(*) FROM transactions WHERE user_id = ?', (user[0],))
        txn_count = cursor.fetchone()[0]
        print(f"[DATA] Database transactions for user5@user5.com: {txn_count}")
        
        if txn_count > 0:
            cursor.execute('SELECT id, amount, merchant, status FROM transactions WHERE user_id = ? LIMIT 3', (user[0],))
            sample_txns = cursor.fetchall()
            print("   Sample transactions:")
            for txn in sample_txns:
                print(f"     ID: {txn[0]}, Amount: {txn[1]}, Merchant: {txn[2]}, Status: {txn[3]}")
    else:
        print("[ERROR] User user5@user5.com not found!")
    
    # Check all transactions
    cursor.execute('SELECT COUNT(*) FROM transactions')
    total_txns = cursor.fetchone()[0]
    print(f"[DATA] Total transactions in database: {total_txns}")
    
    conn.close()
    print()

def audit_api_endpoints():
    """Audit API endpoints"""
    print("=== API ENDPOINTS AUDIT ===")
    
    # Test user login and transactions
    print("1. Testing user login and transactions...")
    try:
        # Login
        login_resp = requests.post('http://127.0.0.1:5000/api/user/auth/login', 
                                json={'email': 'user5@user5.com', 'password': 'user5'})
        
        if login_resp.status_code == 200:
            token = login_resp.json()['token']
            print(f"[OK] User login successful")
            
            # Get transactions
            headers = {'Authorization': f'Bearer {token}'}
            txn_resp = requests.get('http://127.0.0.1:5000/api/user/transactions', headers=headers)
            
            print(f"[DATA] User transactions API status: {txn_resp.status_code}")
            if txn_resp.status_code == 200:
                data = txn_resp.json()
                if 'transactions' in data:
                    print(f"[DATA] User API returned {len(data['transactions'])} transactions")
                    if data['transactions']:
                        print(f"   Sample: {data['transactions'][0]}")
                else:
                    print("[ERROR] No 'transactions' key in response")
                    print(f"   Response keys: {list(data.keys())}")
            else:
                print(f"[ERROR] User transactions API error: {txn_resp.text}")
        else:
            print(f"[ERROR] User login failed: {login_resp.status_code}")
    except Exception as e:
        print(f"[ERROR] User API test error: {e}")
    
    print()
    
    # Test admin login and transactions
    print("2. Testing admin login and transactions...")
    try:
        # Admin login
        admin_login = requests.post('http://127.0.0.1:5000/api/admin/auth/login', 
                                  json={'email': 'info@kamioi.com', 'password': 'admin123'})
        
        if admin_login.status_code == 200:
            admin_token = admin_login.json()['token']
            print(f"[OK] Admin login successful")
            
            # Get admin transactions
            admin_headers = {'Authorization': f'Bearer {admin_token}'}
            admin_txn = requests.get('http://127.0.0.1:5000/api/admin/transactions', headers=admin_headers)
            
            print(f"[DATA] Admin transactions API status: {admin_txn.status_code}")
            if admin_txn.status_code == 200:
                admin_data = admin_txn.json()
                if 'transactions' in admin_data:
                    print(f"[DATA] Admin API returned {len(admin_data['transactions'])} transactions")
                else:
                    print("[ERROR] No 'transactions' key in admin response")
                    print(f"   Response keys: {list(admin_data.keys())}")
            else:
                print(f"[ERROR] Admin transactions API error: {admin_txn.text}")
        else:
            print(f"[ERROR] Admin login failed: {admin_login.status_code}")
    except Exception as e:
        print(f"[ERROR] Admin API test error: {e}")
    
    print()

def check_frontend_data_sources():
    """Check what data sources the frontend is using"""
    print("=== FRONTEND DATA SOURCES AUDIT ===")
    print("This would require checking the frontend code to see:")
    print("1. What API endpoints the frontend calls")
    print("2. How the frontend processes the data")
    print("3. If there are any caching issues")
    print("4. If the frontend is calling the wrong endpoints")
    print()

if __name__ == "__main__":
    print("KAMIOI SYSTEM AUDIT REPORT")
    print("=" * 50)
    print()
    
    audit_database()
    audit_api_endpoints()
    check_frontend_data_sources()
    
    print("=" * 50)
    print("[COMPLETE] AUDIT COMPLETE")
