import requests
import time

# Wait for server to start
time.sleep(3)

print("=== VERIFYING CLEAN DATABASE ===")

try:
    # 1. Check health endpoint
    health_response = requests.get("http://localhost:5000/api/health")
    print(f"Health endpoint: {health_response.status_code}")
    assert health_response.status_code == 200

    # 2. Check user transactions (should be empty)
    user_txns_response = requests.get("http://localhost:5000/api/user/transactions?limit=50")
    print(f"User transactions endpoint: {user_txns_response.status_code}")
    assert user_txns_response.status_code == 200
    
    user_data = user_txns_response.json()
    user_transactions = user_data.get('data', [])
    print(f"User transactions: {len(user_transactions)}")
    assert len(user_transactions) == 0

    # 3. Check LLM Center mappings (should be empty)
    llm_mappings_response = requests.get("http://localhost:5000/api/admin/llm-center/mappings?limit=50")
    print(f"LLM Center mappings endpoint: {llm_mappings_response.status_code}")
    assert llm_mappings_response.status_code == 200
    
    llm_data = llm_mappings_response.json()
    llm_mappings = llm_data.get('data', {}).get('mappings', [])
    print(f"LLM Center mappings: {len(llm_mappings)}")
    assert len(llm_mappings) == 0

    # 4. Check admin transactions (should be empty)
    admin_txns_response = requests.get("http://localhost:5000/api/admin/transactions")
    print(f"Admin transactions endpoint: {admin_txns_response.status_code}")
    assert admin_txns_response.status_code == 200
    
    admin_data = admin_txns_response.json()
    admin_transactions = admin_data.get('data', [])
    print(f"Admin transactions: {len(admin_transactions)}")
    assert len(admin_transactions) == 0

    print("\n✅ [SUCCESS] Database is completely clean and ready for fresh testing!")
    print("✅ All endpoints are working correctly")
    print("✅ No transactions or mappings exist")
    print("✅ System is ready for your testing workflow")

except Exception as e:
    print(f"❌ Error: {e}")
    print("❌ Database may not be completely clean")
