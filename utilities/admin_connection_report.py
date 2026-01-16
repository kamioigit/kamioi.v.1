import requests
import json
import time

def test_admin_connections():
    base_url = "http://localhost:5000"
    
    print("ADMIN DASHBOARD CONNECTION REPORT")
    print("=" * 60)
    print()
    
    # First, get admin token
    print("1. AUTHENTICATION TEST")
    print("-" * 30)
    try:
        login_response = requests.post(f"{base_url}/api/admin/auth/login", 
                                     json={"email": "info@kamioi.com", "password": "admin123"})
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('token')
            print("[OK] Admin login successful")
            print(f"   Token: {token[:20]}...")
        else:
            print(f"[FAIL] Admin login failed: {login_response.status_code}")
            return
    except Exception as e:
        print(f"[ERROR] Login error: {str(e)}")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    
    print("\n2. USER MANAGEMENT CONNECTIONS")
    print("-" * 40)
    
    # Test user management endpoints
    endpoints = [
        ("/api/admin/users", "Individual Users"),
        ("/api/admin/family-users", "Family Users"), 
        ("/api/admin/business-users", "Business Users"),
        ("/api/admin/user-metrics", "User Metrics/Summary"),
        ("/api/admin/transactions", "Admin Transactions"),
        ("/api/admin/llm-queue", "LLM Queue"),
        ("/api/admin/llm-stats", "LLM Statistics"),
        ("/api/admin/employees", "Employee Management"),
        ("/api/admin/notifications", "Admin Notifications"),
        ("/api/admin/analytics", "Analytics Dashboard")
    ]
    
    results = {}
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", headers=headers)
            status = "[OK]" if response.status_code == 200 else "[FAIL]"
            results[endpoint] = {
                'status': response.status_code,
                'success': response.status_code == 200,
                'description': description
            }
            print(f"{status} {description}: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'users' in data:
                        print(f"   📊 Users returned: {len(data.get('users', []))}")
                    elif 'data' in data:
                        print(f"   📊 Data items: {len(data.get('data', []))}")
                    elif 'transactions' in data:
                        print(f"   📊 Transactions: {len(data.get('transactions', []))}")
                except:
                    pass
        except Exception as e:
            results[endpoint] = {
                'status': 'ERROR',
                'success': False,
                'description': description,
                'error': str(e)
            }
            print(f"[ERROR] {description}: ERROR - {str(e)}")
    
    print("\n3. FRONTEND COMPONENT ANALYSIS")
    print("-" * 40)
    
    # Analyze what frontend components exist
    frontend_components = [
        "AdminDashboard.jsx - Main dashboard container",
        "AdminSidebar.jsx - Navigation sidebar", 
        "AdminHeader.jsx - Top header with search",
        "ConsolidatedUserManagement.jsx - User management page",
        "EmployeeManagement.jsx - Employee management",
        "LLMCenter.jsx - LLM management",
        "AdminTransactions.jsx - Transaction management",
        "AdminAnalytics.jsx - Analytics dashboard"
    ]
    
    for component in frontend_components:
        print(f"[COMP] {component}")
    
    print("\n4. CONNECTION STATUS SUMMARY")
    print("-" * 40)
    
    working_endpoints = [k for k, v in results.items() if v['success']]
    broken_endpoints = [k for k, v in results.items() if not v['success']]
    
    print(f"[OK] Working endpoints: {len(working_endpoints)}")
    for endpoint in working_endpoints:
        print(f"   - {endpoint}")
    
    print(f"\n[FAIL] Broken endpoints: {len(broken_endpoints)}")
    for endpoint in broken_endpoints:
        error_info = results[endpoint]
        print(f"   - {endpoint}: {error_info.get('status', 'ERROR')}")
        if 'error' in error_info:
            print(f"     Error: {error_info['error']}")
    
    print("\n5. RECOMMENDATIONS")
    print("-" * 40)
    
    if broken_endpoints:
        print("[FIX] Issues to fix:")
        for endpoint in broken_endpoints:
            print(f"   - Implement missing endpoint: {endpoint}")
    else:
        print("[OK] All endpoints are working correctly!")
    
    print(f"\n[STATS] Total endpoints tested: {len(endpoints)}")
    print(f"[OK] Working: {len(working_endpoints)}")
    print(f"[FAIL] Broken: {len(broken_endpoints)}")
    
    return results

if __name__ == "__main__":
    test_admin_connections()
