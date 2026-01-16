import requests
import json
import time

def test_business_connections():
    base_url = "http://localhost:5000"
    
    print("BUSINESS DASHBOARD CONNECTION REPORT")
    print("=" * 60)
    print()
    
    # First, get business user token
    print("1. BUSINESS AUTHENTICATION TEST")
    print("-" * 30)
    try:
        login_response = requests.post(f"{base_url}/api/business/auth/login", 
                                     json={"email": "business@kamioi.com", "password": "business123"})
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('token')
            print("[OK] Business login successful")
            print(f"   Token: {token[:20]}...")
        else:
            print(f"[FAIL] Business login failed: {login_response.status_code}")
            return
    except Exception as e:
        print(f"[ERROR] Login error: {str(e)}")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    
    print("\n2. BUSINESS DASHBOARD CONNECTIONS")
    print("-" * 40)
    
    # Test business dashboard endpoints
    endpoints = [
        ("/api/business/transactions", "Business Transactions"),
        ("/api/business/portfolio", "Business Portfolio"),
        ("/api/business/notifications", "Business Notifications"),
        ("/api/business/goals", "Business Goals"),
        ("/api/business/roundups", "Business Round-ups"),
        ("/api/business/fees", "Business Fees"),
        ("/api/business/ai-insights", "Business AI Insights"),
        ("/api/business/stock-status", "Business Stock Status"),
        ("/api/business/profile", "Business Profile"),
        ("/api/business/settings", "Business Settings"),
        ("/api/business/employees", "Business Employees"),
        ("/api/business/departments", "Business Departments"),
        ("/api/business/expenses", "Business Expenses"),
        ("/api/business/revenue", "Business Revenue"),
        ("/api/business/budget", "Business Budget"),
        ("/api/business/analytics", "Business Analytics"),
        ("/api/business/reports", "Business Reports"),
        ("/api/business/export/transactions", "Export Business Transactions"),
        ("/api/business/export/portfolio", "Export Business Portfolio"),
        ("/api/business/export/employees", "Export Business Employees"),
        ("/api/business/export/analytics", "Export Business Analytics")
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
                    elif 'employees' in data:
                        print(f"   📊 Employees: {len(data.get('employees', []))}")
                    elif 'departments' in data:
                        print(f"   📊 Departments: {len(data.get('departments', []))}")
                    elif 'analytics' in data:
                        print(f"   📊 Analytics data: {len(data.get('analytics', []))}")
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
        "BusinessDashboard.jsx - Main business dashboard container",
        "BusinessSidebar.jsx - Business navigation sidebar", 
        "BusinessHeader.jsx - Business header with search",
        "BusinessTransactions.jsx - Business transaction management",
        "BusinessPortfolio.jsx - Business portfolio overview",
        "BusinessNotifications.jsx - Business notification center",
        "BusinessGoals.jsx - Business goals management",
        "BusinessSettings.jsx - Business settings",
        "BusinessProfile.jsx - Business profile management",
        "BusinessEmployees.jsx - Business employee management",
        "BusinessDepartments.jsx - Business department management",
        "BusinessExpenses.jsx - Business expense management",
        "BusinessRevenue.jsx - Business revenue tracking",
        "BusinessBudget.jsx - Business budget management",
        "BusinessAnalytics.jsx - Business analytics dashboard",
        "BusinessReports.jsx - Business reports generation",
        "BusinessAIInsights.jsx - Business AI insights",
        "BusinessRoundupHistory.jsx - Business round-up history",
        "BusinessFeeHistory.jsx - Business fee tracking"
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
    test_business_connections()
