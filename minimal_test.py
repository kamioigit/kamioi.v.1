import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Test if we can import the app
try:
    from app import app
    print("SUCCESS: App imported successfully")
    
    # Check if the route exists
    routes = [rule.rule for rule in app.url_map.iter_rules()]
    if '/api/admin/llm-center/approve' in routes:
        print("SUCCESS: Approval route found")
    else:
        print("ERROR: Approval route NOT found")
        print("Available admin routes:")
        for route in routes:
            if 'admin' in route and 'llm' in route:
                print(f"  {route}")
    
    # Test the route directly
    with app.test_client() as client:
        response = client.post('/api/admin/llm-center/approve', 
                              json={'mapping_id': 2},
                              headers={'Authorization': 'Bearer token_6'})
        print(f"Test response status: {response.status_code}")
        print(f"Test response data: {response.get_data(as_text=True)}")
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
