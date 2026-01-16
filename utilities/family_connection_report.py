import requests
import json
import time

def test_family_connections():
    base_url = "http://localhost:5000"
    
    print("FAMILY DASHBOARD CONNECTION REPORT")
    print("=" * 60)
    print()
    
    # First, get family user token
    print("1. FAMILY AUTHENTICATION TEST")
    print("-" * 30)
    try:
        login_response = requests.post(f"{base_url}/api/family/auth/login", 
                                     json={"email": "family@kamioi.com", "password": "family123"})
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('token')
            print("[OK] Family login successful")
            print(f"   Token: {token[:20]}...")
        else:
            print(f"[FAIL] Family login failed: {login_response.status_code}")
            return
    except Exception as e:
        print(f"[ERROR] Login error: {str(e)}")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    
    print("\n2. FAMILY DASHBOARD CONNECTIONS")
    print("-" * 40)
    
    # Test family dashboard endpoints
    endpoints = [
        ("/api/family/transactions", "Family Transactions"),
        ("/api/family/portfolio", "Family Portfolio"),
        ("/api/family/notifications", "Family Notifications"),
        ("/api/family/goals", "Family Goals"),
        ("/api/family/roundups", "Family Round-ups"),
        ("/api/family/fees", "Family Fees"),
        ("/api/family/ai-insights", "Family AI Insights"),
        ("/api/family/stock-status", "Family Stock Status"),
        ("/api/family/profile", "Family Profile"),
        ("/api/family/settings", "Family Settings"),
        ("/api/family/members", "Family Members"),
        ("/api/family/budget", "Family Budget"),
        ("/api/family/expenses", "Family Expenses"),
        ("/api/family/savings", "Family Savings"),
        ("/api/family/export/transactions", "Export Family Transactions"),
        ("/api/family/export/portfolio", "Export Family Portfolio"),
        ("/api/family/export/members", "Export Family Members")
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
                    elif 'members' in data:
                        print(f"   📊 Family members: {len(data.get('members', []))}")
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
        "FamilyDashboard.jsx - Main family dashboard container",
        "FamilySidebar.jsx - Family navigation sidebar", 
        "FamilyHeader.jsx - Family header with search",
        "FamilyTransactions.jsx - Family transaction management",
        "FamilyPortfolio.jsx - Family portfolio overview",
        "FamilyNotifications.jsx - Family notification center",
        "FamilyGoals.jsx - Family goals management",
        "FamilySettings.jsx - Family settings",
        "FamilyProfile.jsx - Family profile management",
        "FamilyMembers.jsx - Family member management",
        "FamilyBudget.jsx - Family budget tracking",
        "FamilyExpenses.jsx - Family expense management",
        "FamilySavings.jsx - Family savings tracking",
        "FamilyAIInsights.jsx - Family AI insights",
        "FamilyRoundupHistory.jsx - Family round-up history",
        "FamilyFeeHistory.jsx - Family fee tracking"
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
    test_family_connections()
