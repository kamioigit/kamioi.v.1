import requests
import json
import time

def test_user_connections():
    base_url = "http://localhost:5000"
    
    print("USER DASHBOARD CONNECTION REPORT")
    print("=" * 60)
    print()
    
    # First, get user token
    print("1. USER AUTHENTICATION TEST")
    print("-" * 30)
    try:
        login_response = requests.post(f"{base_url}/api/user/auth/login", 
                                     json={"email": "user5@user5.com", "password": "defaultPassword123"})
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('token')
            print("[OK] User login successful")
            print(f"   Token: {token[:20]}...")
        else:
            print(f"[FAIL] User login failed: {login_response.status_code}")
            return
    except Exception as e:
        print(f"[ERROR] Login error: {str(e)}")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    
    print("\n2. USER DASHBOARD CONNECTIONS")
    print("-" * 40)
    
    # Test user dashboard endpoints
    endpoints = [
        ("/api/user/transactions", "User Transactions"),
        ("/api/user/portfolio", "User Portfolio"),
        ("/api/user/notifications", "User Notifications"),
        ("/api/user/goals", "User Goals"),
        ("/api/user/roundups", "Round-up History"),
        ("/api/user/fees", "Fee History"),
        ("/api/user/ai-insights", "AI Insights"),
        ("/api/user/stock-status", "Stock Status"),
        ("/api/user/profile", "User Profile"),
        ("/api/user/settings", "User Settings"),
        ("/api/user/export/transactions", "Export Transactions"),
        ("/api/user/export/portfolio", "Export Portfolio")
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
                    if 'transactions' in data:
                        print(f"   📊 Transactions returned: {len(data.get('transactions', []))}")
                    elif 'data' in data:
                        print(f"   📊 Data items: {len(data.get('data', []))}")
                    elif 'notifications' in data:
                        print(f"   📊 Notifications: {len(data.get('notifications', []))}")
                    elif 'goals' in data:
                        print(f"   📊 Goals: {len(data.get('goals', []))}")
                    elif 'portfolio' in data:
                        print(f"   📊 Portfolio items: {len(data.get('portfolio', []))}")
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
        "UserDashboard.jsx - Main dashboard container",
        "UserSidebar.jsx - Navigation sidebar", 
        "UserHeader.jsx - Top header with search",
        "UserTransactions.jsx - Transaction management",
        "UserPortfolio.jsx - Portfolio overview",
        "UserNotifications.jsx - Notification center",
        "UserGoals.jsx - Goals management",
        "UserSettings.jsx - User settings",
        "UserProfile.jsx - Profile management",
        "AIInsights.jsx - AI insights page",
        "RoundupHistory.jsx - Round-up history",
        "FeeHistory.jsx - Fee tracking"
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
    test_user_connections()
