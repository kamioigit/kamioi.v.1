#!/usr/bin/env python3
"""
Verify info@kamioi.com has full admin access
"""
import sqlite3
import requests
import json

def verify_full_access():
    db_path = 'backend/kamioi.db'
    
    print("Verifying info@kamioi.com has full admin access...")
    
    # 1. Check database permissions
    print("\n1. Checking database permissions...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, name, account_type FROM users WHERE email = 'info@kamioi.com'")
    user = cursor.fetchone()
    
    if user:
        print(f"   User found: ID {user[0]}, Email: {user[1]}, Name: {user[2]}, Type: {user[3]}")
        if user[3] == 'admin':
            print("   ✅ Account type: ADMIN")
        else:
            print(f"   ❌ Account type: {user[3]} (should be admin)")
    else:
        print("   ❌ User not found in database")
        return
    
    conn.close()
    
    # 2. Test authentication
    print("\n2. Testing authentication...")
    try:
        login_data = {"email": "info@kamioi.com", "password": "admin123"}
        response = requests.post("http://127.0.0.1:5000/api/admin/auth/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                token = data.get('token')
                print(f"   ✅ Authentication successful: {token}")
                
                # 3. Test all admin endpoints
                print("\n3. Testing admin endpoints access...")
                headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
                
                endpoints_to_test = [
                    ('/api/admin/llm-center/queue', 'LLM Center Queue'),
                    ('/api/admin/llm-center/mappings', 'LLM Center Mappings'),
                    ('/api/admin/transactions', 'Admin Transactions'),
                    ('/api/admin/train-model', 'Train Model'),
                    ('/api/admin/database/stats', 'Database Stats'),
                    ('/api/admin/users', 'User Management'),
                    ('/api/admin/bulk-upload', 'Bulk Upload'),
                    ('/api/admin/system/health', 'System Health')
                ]
                
                all_passed = True
                for endpoint, name in endpoints_to_test:
                    try:
                        if endpoint == '/api/admin/train-model':
                            # POST request for train model
                            test_response = requests.post(f"http://127.0.0.1:5000{endpoint}", headers=headers)
                        else:
                            # GET request for other endpoints
                            test_response = requests.get(f"http://127.0.0.1:5000{endpoint}", headers=headers)
                        
                        if test_response.status_code in [200, 401, 403]:
                            if test_response.status_code == 200:
                                print(f"   ✅ {name}: Access granted")
                            elif test_response.status_code == 401:
                                print(f"   ❌ {name}: Unauthorized (401)")
                                all_passed = False
                            elif test_response.status_code == 403:
                                print(f"   ❌ {name}: Forbidden (403)")
                                all_passed = False
                        else:
                            print(f"   ⚠️  {name}: Status {test_response.status_code}")
                    except Exception as e:
                        print(f"   ❌ {name}: Error - {e}")
                        all_passed = False
                
                if all_passed:
                    print("\n✅ FULL ACCESS CONFIRMED: info@kamioi.com has complete admin privileges")
                else:
                    print("\n❌ ACCESS ISSUES DETECTED: Some endpoints may be restricted")
                    
            else:
                print(f"   ❌ Authentication failed: {data.get('error')}")
        else:
            print(f"   ❌ Login request failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing authentication: {e}")

if __name__ == "__main__":
    verify_full_access()


