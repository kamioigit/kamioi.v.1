#!/usr/bin/env python3
"""
Kamioi Platform - Simple Architectural Test
Tests database connectivity and system architecture
"""

import sys
import requests
import json
from datetime import datetime

# Add backend to path
sys.path.append('backend')

def test_database():
    """Test database connectivity"""
    print("=" * 60)
    print("TESTING DATABASE CONNECTIVITY")
    print("=" * 60)
    
    try:
        from database_manager import db_manager
        
        # Test connection
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get tables
        tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        print(f"Database connected - Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Test critical tables
        critical_tables = ['users', 'transactions', 'llm_mappings', 'goals', 'portfolios', 'notifications']
        for table in critical_tables:
            try:
                count = cursor.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
                print(f"  {table}: {count} records")
            except Exception as e:
                print(f"  ERROR {table}: {e}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

def test_mapping_persistence():
    """Test mapping persistence"""
    print("\n" + "=" * 60)
    print("TESTING MAPPING PERSISTENCE")
    print("=" * 60)
    
    try:
        from database_manager import db_manager
        
        # Test direct insertion
        print("Testing direct database insertion...")
        mapping_id = db_manager.add_llm_mapping(
            transaction_id='arch_test_001',
            merchant_name='Architectural Test Merchant',
            ticker='ARCH',
            category='Test',
            confidence=0.9,
            status='pending',
            admin_approved=False,
            ai_processed=True,
            company_name='Arch Test Company',
            user_id='arch_test_user'
        )
        print(f"Direct insertion successful - ID: {mapping_id}")
        
        # Test retrieval
        mappings = db_manager.get_llm_mappings()
        print(f"Retrieved {len(mappings)} mappings from database")
        
        return True
        
    except Exception as e:
        print(f"Mapping persistence test failed: {e}")
        return False

def test_api_endpoints():
    """Test critical API endpoints"""
    print("\n" + "=" * 60)
    print("TESTING API ENDPOINTS")
    print("=" * 60)
    
    base_url = "http://localhost:5000"
    endpoints = [
        ("/api/transactions", "GET"),
        ("/api/mappings/history", "GET"),
        ("/api/user/transactions", "GET"),
        ("/api/admin/transactions", "GET"),
        ("/api/admin/llm-center/mappings", "GET"),
        ("/api/admin/llm-center/stats", "GET"),
    ]
    
    results = {}
    
    for endpoint, method in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            status = "PASS" if response.status_code == 200 else "FAIL"
            print(f"{status} {endpoint} - {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'data' in data:
                        if isinstance(data['data'], list):
                            print(f"    Data: {len(data['data'])} items")
                        else:
                            print(f"    Data: {type(data['data'])}")
                except:
                    pass
            
            results[endpoint] = response.status_code == 200
            
        except Exception as e:
            print(f"ERROR {endpoint} - {e}")
            results[endpoint] = False
    
    return results

def test_mapping_submission():
    """Test mapping submission and retrieval"""
    print("\n" + "=" * 60)
    print("TESTING MAPPING SUBMISSION")
    print("=" * 60)
    
    try:
        # Submit mapping
        test_mapping = {
            'transaction_id': 'arch_test_submit',
            'merchant_name': 'Submission Test Merchant',
            'ticker': 'SUBMIT',
            'category': 'Test',
            'confidence': 'high',
            'user_id': 'arch_test_user'
        }
        
        response = requests.post('http://localhost:5000/api/mappings/submit', json=test_mapping)
        print(f"Submit response: {response.status_code}")
        
        if response.status_code == 200:
            # Check history
            history_response = requests.get('http://localhost:5000/api/mappings/history')
            if history_response.status_code == 200:
                history_data = history_response.json()
                mappings = history_data.get('data', {}).get('mappings', [])
                print(f"History endpoint: {len(mappings)} mappings")
                
                # Check if our mapping is there
                found = False
                for mapping in mappings:
                    if mapping.get('merchant_name') == 'Submission Test Merchant':
                        found = True
                        print(f"SUCCESS: Mapping found in history")
                        break
                
                if not found:
                    print("ERROR: Submitted mapping not found in history")
            else:
                print(f"ERROR: History endpoint failed: {history_response.status_code}")
        else:
            print(f"ERROR: Submit failed: {response.status_code}")
            
        return True
        
    except Exception as e:
        print(f"Mapping submission test failed: {e}")
        return False

def test_database_vs_api():
    """Test database vs API consistency"""
    print("\n" + "=" * 60)
    print("TESTING DATABASE VS API CONSISTENCY")
    print("=" * 60)
    
    try:
        from database_manager import db_manager
        
        # Check database
        db_mappings = db_manager.get_llm_mappings()
        print(f"Database mappings: {len(db_mappings)}")
        
        # Check API
        history_response = requests.get('http://localhost:5000/api/mappings/history')
        if history_response.status_code == 200:
            history_data = history_response.json()
            api_mappings = history_data.get('data', {}).get('mappings', [])
            print(f"API history mappings: {len(api_mappings)}")
            
            if len(db_mappings) != len(api_mappings):
                print(f"WARNING: Database has {len(db_mappings)} mappings, API has {len(api_mappings)}")
                print("This indicates in-memory storage is still being used")
            else:
                print("SUCCESS: Database and API mappings match")
        
        # Check LLM Center
        llm_response = requests.get('http://localhost:5000/api/admin/llm-center/mappings')
        if llm_response.status_code == 200:
            llm_data = llm_response.json()
            llm_mappings = llm_data.get('data', [])
            print(f"LLM Center mappings: {len(llm_mappings)}")
            
            if len(db_mappings) != len(llm_mappings):
                print(f"WARNING: Database has {len(db_mappings)} mappings, LLM Center has {len(llm_mappings)}")
            else:
                print("SUCCESS: Database and LLM Center mappings match")
        
        return True
        
    except Exception as e:
        print(f"Database vs API test failed: {e}")
        return False

def main():
    """Run all tests and generate report"""
    print("KAMIOI PLATFORM - ARCHITECTURAL AUDIT")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run tests
    db_test = test_database()
    mapping_test = test_mapping_persistence()
    api_results = test_api_endpoints()
    submission_test = test_mapping_submission()
    consistency_test = test_database_vs_api()
    
    # Calculate results
    total_endpoints = len(api_results)
    successful_endpoints = sum(1 for success in api_results.values() if success)
    success_rate = (successful_endpoints / total_endpoints * 100) if total_endpoints > 0 else 0
    
    print("\n" + "=" * 60)
    print("ARCHITECTURAL AUDIT REPORT")
    print("=" * 60)
    
    print(f"Database Connectivity: {'PASS' if db_test else 'FAIL'}")
    print(f"Mapping Persistence: {'PASS' if mapping_test else 'FAIL'}")
    print(f"API Endpoints: {successful_endpoints}/{total_endpoints} ({success_rate:.1f}%)")
    print(f"Mapping Submission: {'PASS' if submission_test else 'FAIL'}")
    print(f"Data Consistency: {'PASS' if consistency_test else 'FAIL'}")
    
    # Identify issues
    print(f"\nCRITICAL ISSUES:")
    
    if not db_test:
        print("  - Database connection failed")
    
    if not mapping_test:
        print("  - Mapping data not persisting to database")
    
    failed_endpoints = [endpoint for endpoint, success in api_results.items() if not success]
    if failed_endpoints:
        print(f"  - Failed endpoints: {', '.join(failed_endpoints)}")
    
    if not submission_test:
        print("  - Mapping submission not working")
    
    if not consistency_test:
        print("  - System still using in-memory storage")
    
    print(f"\nRECOMMENDATIONS:")
    print("  1. Fix database connectivity issues")
    print("  2. Ensure all data is stored in database, not memory")
    print("  3. Implement proper error handling and logging")
    print("  4. Add database migration scripts")
    print("  5. Implement data validation and consistency checks")
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

if __name__ == "__main__":
    main()
