import requests
import json

def analyze_system_status():
    print("KAMIOI SYSTEM STATUS ANALYSIS")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:5000"
    
    # Test endpoints that are working
    working_endpoints = []
    
    # Test endpoints that are failing
    failing_endpoints = []
    
    # Test user endpoints
    user_endpoints = [
        "/api/user/transactions",
        "/api/user/portfolio", 
        "/api/user/notifications",
        "/api/user/ai-insights",
        "/api/user/roundups/total",
        "/api/user/fees/total"
    ]
    
    # Test admin endpoints
    admin_endpoints = [
        "/api/admin/transactions",
        "/api/admin/users",
        "/api/admin/notifications",
        "/api/admin/llm-center/queue",
        "/api/admin/llm-center/mappings"
    ]
    
    # Test missing endpoints
    missing_endpoints = [
        "/api/ml/stats",
        "/api/llm-data/system-status",
        "/api/llm-data/event-stats",
        "/api/admin/database/schema",
        "/api/admin/database/stats",
        "/api/admin/feature-flags",
        "/api/admin/messaging/campaigns",
        "/api/messages/admin/all",
        "/api/admin/badges",
        "/api/admin/advertisements/campaigns",
        "/api/admin/crm/contacts",
        "/api/admin/content/pages",
        "/api/admin/modules",
        "/api/admin/settings/fees",
        "/api/admin/business-stress-test/status"
    ]
    
    print("\nTESTING USER ENDPOINTS:")
    print("-" * 30)
    
    for endpoint in user_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                working_endpoints.append(endpoint)
                print(f"[OK] {endpoint} - {response.status_code}")
            else:
                failing_endpoints.append(f"{endpoint} - {response.status_code}")
                print(f"[FAIL] {endpoint} - {response.status_code}")
        except Exception as e:
            failing_endpoints.append(f"{endpoint} - ERROR: {str(e)}")
            print(f"[ERROR] {endpoint} - ERROR: {str(e)}")
    
    print("\nTESTING ADMIN ENDPOINTS:")
    print("-" * 30)
    
    for endpoint in admin_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                working_endpoints.append(endpoint)
                print(f"[OK] {endpoint} - {response.status_code}")
            else:
                failing_endpoints.append(f"{endpoint} - {response.status_code}")
                print(f"[FAIL] {endpoint} - {response.status_code}")
        except Exception as e:
            failing_endpoints.append(f"{endpoint} - ERROR: {str(e)}")
            print(f"[ERROR] {endpoint} - ERROR: {str(e)}")
    
    print("\nTESTING MISSING ENDPOINTS:")
    print("-" * 30)
    
    for endpoint in missing_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                working_endpoints.append(endpoint)
                print(f"[OK] {endpoint} - {response.status_code}")
            else:
                failing_endpoints.append(f"{endpoint} - {response.status_code}")
                print(f"[FAIL] {endpoint} - {response.status_code}")
        except Exception as e:
            failing_endpoints.append(f"{endpoint} - ERROR: {str(e)}")
            print(f"[ERROR] {endpoint} - ERROR: {str(e)}")
    
    print("\nSUMMARY:")
    print("-" * 20)
    print(f"Working endpoints: {len(working_endpoints)}")
    print(f"Failing endpoints: {len(failing_endpoints)}")
    
    if failing_endpoints:
        print("\nFAILING ENDPOINTS:")
        for endpoint in failing_endpoints:
            print(f"  - {endpoint}")
    
    print("\nRECOMMENDATIONS:")
    print("-" * 20)
    print("1. Fix CORS policy issues")
    print("2. Implement missing endpoints")
    print("3. Separate user and admin authentication")
    print("4. Add proper error handling")

if __name__ == "__main__":
    analyze_system_status()
