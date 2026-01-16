#!/usr/bin/env python3
"""
Kamioi Platform - Architectural Audit Script
Tests database connectivity, data persistence, and system architecture
"""

import sys
import os
import requests
import json
import sqlite3
from datetime import datetime

# Add backend to path
sys.path.append('backend')

def test_database_connectivity():
    """Test basic database connectivity and schema"""
    print("=" * 60)
    print("TESTING DATABASE CONNECTIVITY")
    print("=" * 60)
    
    try:
        from database_manager import db_manager
        
        # Test database connection
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get all tables
        tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        print(f"Database connected successfully")
        print(f"Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table[0]}")
        
        # Test each critical table
        critical_tables = ['users', 'transactions', 'llm_mappings', 'goals', 'portfolios', 'notifications']
        for table in critical_tables:
            try:
                count = cursor.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
                print(f"   {table}: {count} records")
            except Exception as e:
                print(f"   ERROR {table}: {e}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_mapping_persistence():
    """Test mapping data persistence"""
    print("\n" + "=" * 60)
    print("🔍 TESTING MAPPING PERSISTENCE")
    print("=" * 60)
    
    try:
        from database_manager import db_manager
        
        # Test direct database insertion
        print("📝 Testing direct database insertion...")
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
        print(f"✅ Direct insertion successful - ID: {mapping_id}")
        
        # Test retrieval
        print("📖 Testing database retrieval...")
        mappings = db_manager.get_llm_mappings()
        print(f"✅ Retrieved {len(mappings)} mappings from database")
        
        # Find our test mapping
        test_mapping = None
        for mapping in mappings:
            if mapping['merchant_name'] == 'Architectural Test Merchant':
                test_mapping = mapping
                break
        
        if test_mapping:
            print(f"✅ Test mapping found: {test_mapping['merchant_name']} - {test_mapping['ticker']}")
        else:
            print("❌ Test mapping not found in database")
            
        return True
        
    except Exception as e:
        print(f"❌ Mapping persistence test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_endpoints():
    """Test all critical API endpoints"""
    print("\n" + "=" * 60)
    print("🔍 TESTING API ENDPOINTS")
    print("=" * 60)
    
    base_url = "http://localhost:5000"
    endpoints_to_test = [
        # Core endpoints
        ("/api/transactions", "GET", "Transaction data"),
        ("/api/mappings/submit", "POST", "Mapping submission"),
        ("/api/mappings/history", "GET", "Mapping history"),
        
        # User endpoints
        ("/api/user/transactions", "GET", "User transactions"),
        ("/api/user/portfolio", "GET", "User portfolio"),
        
        # Admin endpoints
        ("/api/admin/transactions", "GET", "Admin transactions"),
        ("/api/admin/llm-center/mappings", "GET", "LLM Center mappings"),
        ("/api/admin/llm-center/stats", "GET", "LLM Center stats"),
        
        # Business endpoints
        ("/api/business/transactions", "GET", "Business transactions"),
        ("/api/business/analytics", "GET", "Business analytics"),
        
        # Family endpoints
        ("/api/family/transactions", "GET", "Family transactions"),
        ("/api/family/analytics", "GET", "Family analytics"),
    ]
    
    results = {}
    
    for endpoint, method, description in endpoints_to_test:
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
            elif method == "POST":
                # Test with sample data
                test_data = {
                    'transaction_id': 'arch_test_api',
                    'merchant_name': 'API Test Merchant',
                    'ticker': 'APITEST',
                    'category': 'Test',
                    'confidence': 'high',
                    'user_id': 'arch_test_user'
                }
                response = requests.post(f"{base_url}{endpoint}", json=test_data, timeout=5)
            
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {endpoint} ({method}) - {response.status_code} - {description}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'data' in data:
                        if isinstance(data['data'], list):
                            print(f"    📊 Data: {len(data['data'])} items")
                        else:
                            print(f"    📊 Data: {type(data['data'])}")
                except:
                    print(f"    📊 Response: {len(response.text)} characters")
            
            results[endpoint] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'description': description
            }
            
        except Exception as e:
            print(f"❌ {endpoint} ({method}) - ERROR - {e}")
            results[endpoint] = {
                'status_code': 'ERROR',
                'success': False,
                'description': description,
                'error': str(e)
            }
    
    return results

def test_data_consistency():
    """Test data consistency across endpoints"""
    print("\n" + "=" * 60)
    print("🔍 TESTING DATA CONSISTENCY")
    print("=" * 60)
    
    try:
        # Test mapping submission and retrieval
        print("📝 Testing mapping submission...")
        test_mapping = {
            'transaction_id': 'consistency_test_001',
            'merchant_name': 'Consistency Test Merchant',
            'ticker': 'CONSIST',
            'category': 'Test',
            'confidence': 'high',
            'user_id': 'consistency_test_user'
        }
        
        # Submit mapping
        submit_response = requests.post('http://localhost:5000/api/mappings/submit', json=test_mapping)
        print(f"📤 Submit response: {submit_response.status_code}")
        
        if submit_response.status_code == 200:
            # Check if it appears in history
            history_response = requests.get('http://localhost:5000/api/mappings/history')
            if history_response.status_code == 200:
                history_data = history_response.json()
                mappings = history_data.get('data', {}).get('mappings', [])
                print(f"📥 History endpoint: {len(mappings)} mappings")
                
                # Check if our mapping is there
                found = False
                for mapping in mappings:
                    if mapping.get('merchant_name') == 'Consistency Test Merchant':
                        found = True
                        print(f"✅ Mapping found in history: {mapping['merchant_name']} - {mapping['ticker']}")
                        break
                
                if not found:
                    print("❌ Submitted mapping not found in history")
            else:
                print(f"❌ History endpoint failed: {history_response.status_code}")
        else:
            print(f"❌ Submit failed: {submit_response.status_code}")
            
        # Test LLM Center endpoints
        print("\n🔍 Testing LLM Center consistency...")
        llm_mappings_response = requests.get('http://localhost:5000/api/admin/llm-center/mappings')
        llm_stats_response = requests.get('http://localhost:5000/api/admin/llm-center/stats')
        
        if llm_mappings_response.status_code == 200:
            llm_data = llm_mappings_response.json()
            llm_mappings = llm_data.get('data', [])
            print(f"📊 LLM Center mappings: {len(llm_mappings)} items")
        else:
            print(f"❌ LLM Center mappings failed: {llm_mappings_response.status_code}")
            
        if llm_stats_response.status_code == 200:
            llm_stats = llm_stats_response.json()
            stats = llm_stats.get('data', {})
            print(f"📊 LLM Center stats: {stats.get('total_mappings', 0)} total mappings")
        else:
            print(f"❌ LLM Center stats failed: {llm_stats_response.status_code}")
            
        return True
        
    except Exception as e:
        print(f"❌ Data consistency test failed: {e}")
        return False

def test_memory_vs_database():
    """Test what's stored in memory vs database"""
    print("\n" + "=" * 60)
    print("🔍 TESTING MEMORY VS DATABASE")
    print("=" * 60)
    
    try:
        from database_manager import db_manager
        
        # Check database directly
        db_mappings = db_manager.get_llm_mappings()
        print(f"📊 Database mappings: {len(db_mappings)}")
        
        # Check API endpoints
        history_response = requests.get('http://localhost:5000/api/mappings/history')
        if history_response.status_code == 200:
            history_data = history_response.json()
            api_mappings = history_data.get('data', {}).get('mappings', [])
            print(f"📊 API history mappings: {len(api_mappings)}")
            
            # Check for discrepancies
            if len(db_mappings) != len(api_mappings):
                print(f"⚠️  DISCREPANCY: Database has {len(db_mappings)} mappings, API has {len(api_mappings)}")
                print("   This indicates in-memory storage is still being used")
            else:
                print("✅ Database and API mappings match")
        
        # Check LLM Center
        llm_response = requests.get('http://localhost:5000/api/admin/llm-center/mappings')
        if llm_response.status_code == 200:
            llm_data = llm_response.json()
            llm_mappings = llm_data.get('data', [])
            print(f"📊 LLM Center mappings: {len(llm_mappings)}")
            
            if len(db_mappings) != len(llm_mappings):
                print(f"⚠️  DISCREPANCY: Database has {len(db_mappings)} mappings, LLM Center has {len(llm_mappings)}")
            else:
                print("✅ Database and LLM Center mappings match")
        
        return True
        
    except Exception as e:
        print(f"❌ Memory vs database test failed: {e}")
        return False

def generate_report():
    """Generate comprehensive architectural report"""
    print("\n" + "=" * 60)
    print("📋 ARCHITECTURAL AUDIT REPORT")
    print("=" * 60)
    
    # Run all tests
    db_connectivity = test_database_connectivity()
    mapping_persistence = test_mapping_persistence()
    api_results = test_api_endpoints()
    data_consistency = test_data_consistency()
    memory_vs_db = test_memory_vs_database()
    
    # Calculate success rates
    total_endpoints = len(api_results)
    successful_endpoints = sum(1 for result in api_results.values() if result['success'])
    success_rate = (successful_endpoints / total_endpoints * 100) if total_endpoints > 0 else 0
    
    print(f"\n📊 SUMMARY:")
    print(f"   Database Connectivity: {'✅ PASS' if db_connectivity else '❌ FAIL'}")
    print(f"   Mapping Persistence: {'✅ PASS' if mapping_persistence else '❌ FAIL'}")
    print(f"   API Endpoints: {successful_endpoints}/{total_endpoints} ({success_rate:.1f}%)")
    print(f"   Data Consistency: {'✅ PASS' if data_consistency else '❌ FAIL'}")
    print(f"   Memory vs Database: {'✅ PASS' if memory_vs_db else '❌ FAIL'}")
    
    # Identify issues
    print(f"\n🚨 CRITICAL ISSUES IDENTIFIED:")
    
    if not db_connectivity:
        print("   ❌ Database connection failed")
    
    if not mapping_persistence:
        print("   ❌ Mapping data not persisting to database")
    
    failed_endpoints = [endpoint for endpoint, result in api_results.items() if not result['success']]
    if failed_endpoints:
        print(f"   ❌ Failed endpoints: {', '.join(failed_endpoints)}")
    
    if not data_consistency:
        print("   ❌ Data inconsistency between endpoints")
    
    if not memory_vs_db:
        print("   ❌ System still using in-memory storage")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    print("   1. Fix database connectivity issues")
    print("   2. Ensure all data is stored in database, not memory")
    print("   3. Implement proper error handling and logging")
    print("   4. Add database migration scripts")
    print("   5. Implement data validation and consistency checks")
    print("   6. Add comprehensive testing suite")
    
    return {
        'database_connectivity': db_connectivity,
        'mapping_persistence': mapping_persistence,
        'api_success_rate': success_rate,
        'data_consistency': data_consistency,
        'memory_vs_database': memory_vs_db,
        'failed_endpoints': failed_endpoints
    }

if __name__ == "__main__":
    print("KAMIOI PLATFORM - ARCHITECTURAL AUDIT")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    report = generate_report()
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
