#!/usr/bin/env python3
"""
Simple test script to verify Kamioi system fixes
"""

import requests
import json
import time
import sys

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get('http://127.0.0.1:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("PASSED: Backend health check")
            return True
        else:
            print(f"FAILED: Backend health check (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"FAILED: Backend health check (Error: {e})")
        return False

def test_database_clean():
    """Test if database is clean"""
    try:
        response = requests.get('http://127.0.0.1:5000/api/admin/transactions', 
                              headers={'Authorization': 'Bearer token_4'}, timeout=5)
        if response.status_code == 200:
            data = response.json()
            transaction_count = len(data.get('data', []))
            if transaction_count == 0:
                print("PASSED: Database clean (0 transactions)")
                return True
            else:
                print(f"FAILED: Database clean ({transaction_count} transactions found)")
                return False
        else:
            print(f"FAILED: Database clean (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"FAILED: Database clean (Error: {e})")
        return False

def test_user_authentication():
    """Test user authentication with correct token format"""
    try:
        test_token = 'token_1760369571486'
        response = requests.get('http://127.0.0.1:5000/api/user/auth/me',
                               headers={'Authorization': f'Bearer {test_token}'}, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('user'):
                print("PASSED: User authentication")
                return True
            else:
                print(f"FAILED: User authentication (Invalid response: {data})")
                return False
        else:
            print(f"FAILED: User authentication (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"FAILED: User authentication (Error: {e})")
        return False

def test_transaction_upload():
    """Test transaction upload with correct user_id"""
    try:
        test_token = 'token_1760369571486'
        test_transaction = {
            'user_id': 1760369571486,
            'amount': 25.50,
            'merchant': 'Test Store',
            'date': '2025-10-14 12:00:00',
            'category': 'Test'
        }
        
        response = requests.post('http://127.0.0.1:5000/api/transactions',
                                headers={'Authorization': f'Bearer {test_token}', 'Content-Type': 'application/json'},
                                json=test_transaction, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("PASSED: Transaction upload")
                return True
            else:
                print(f"FAILED: Transaction upload (Response: {data})")
                return False
        else:
            print(f"FAILED: Transaction upload (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"FAILED: Transaction upload (Error: {e})")
        return False

def test_transaction_retrieval():
    """Test if transactions are retrieved with correct user_id"""
    try:
        test_token = 'token_1760369571486'
        response = requests.get('http://127.0.0.1:5000/api/user/transactions',
                               headers={'Authorization': f'Bearer {test_token}'}, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                transactions = data.get('data', [])
                print(f"PASSED: Transaction retrieval ({len(transactions)} transactions found)")
                return True
            else:
                print(f"FAILED: Transaction retrieval (Response: {data})")
                return False
        else:
            print(f"FAILED: Transaction retrieval (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"FAILED: Transaction retrieval (Error: {e})")
        return False

def main():
    """Run all tests"""
    print("Testing Kamioi System Fixes")
    print("=" * 50)
    
    tests = [
        ("Backend Health", test_backend_health),
        ("Database Clean", test_database_clean),
        ("User Authentication", test_user_authentication),
        ("Transaction Upload", test_transaction_upload),
        ("Transaction Retrieval", test_transaction_retrieval)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\nTesting {test_name}...")
        if test_func():
            passed += 1
        time.sleep(1)
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("All tests passed! System is ready for use.")
        return 0
    else:
        print("Some tests failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())


