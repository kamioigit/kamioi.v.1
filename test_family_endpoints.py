#!/usr/bin/env python3
"""
Family Dashboard API Endpoint Testing Script
Tests all 30 endpoints for the Family Dashboard
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, List, Optional

BASE_URL = "http://127.0.0.1:5111"
TOKEN = None  # Set this to your test token

# Test results storage
test_results = {
    "passed": [],
    "failed": [],
    "skipped": []
}

def print_header(title: str):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_test(name: str, status: str, message: str = ""):
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⏭️"
    print(f"{status_symbol} {name}")
    if message:
        print(f"   {message}")

def make_request(method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple:
    """Make HTTP request and return response tuple (status_code, response_data, error)"""
    url = f"{BASE_URL}{endpoint}"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=10)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            return (0, None, f"Unknown method: {method}")
        
        try:
            response_data = response.json()
        except:
            response_data = {"raw": response.text}
        
        return (response.status_code, response_data, None)
    except requests.exceptions.ConnectionError:
        return (0, None, "Connection refused - Is the server running?")
    except requests.exceptions.Timeout:
        return (0, None, "Request timeout")
    except Exception as e:
        return (0, None, str(e))

def test_endpoint(name: str, method: str, endpoint: str, data: Optional[Dict] = None, 
                 expected_status: int = 200, validate_func=None):
    """Test a single endpoint"""
    status_code, response_data, error = make_request(method, endpoint, data, expected_status)
    
    if error:
        print_test(name, "FAIL", error)
        test_results["failed"].append({
            "name": name,
            "endpoint": endpoint,
            "error": error
        })
        return None
    
    if status_code == expected_status:
        if validate_func:
            validation_result = validate_func(response_data)
            if validation_result:
                print_test(name, "PASS")
                test_results["passed"].append({
                    "name": name,
                    "endpoint": endpoint,
                    "status": status_code
                })
                return response_data
            else:
                print_test(name, "FAIL", "Validation failed")
                test_results["failed"].append({
                    "name": name,
                    "endpoint": endpoint,
                    "error": "Validation failed",
                    "response": response_data
                })
                return None
        else:
            # Default validation: check for success field
            if isinstance(response_data, dict):
                if response_data.get("success") is not False:
                    print_test(name, "PASS")
                    test_results["passed"].append({
                        "name": name,
                        "endpoint": endpoint,
                        "status": status_code
                    })
                    return response_data
                else:
                    print_test(name, "FAIL", response_data.get("error", "Unknown error"))
                    test_results["failed"].append({
                        "name": name,
                        "endpoint": endpoint,
                        "error": response_data.get("error", "Unknown error"),
                        "response": response_data
                    })
                    return None
            else:
                print_test(name, "PASS", "Non-JSON response")
                test_results["passed"].append({
                    "name": name,
                    "endpoint": endpoint,
                    "status": status_code
                })
                return response_data
    else:
        error_msg = f"Expected {expected_status}, got {status_code}"
        if isinstance(response_data, dict):
            error_msg += f": {response_data.get('error', 'Unknown error')}"
        print_test(name, "FAIL", error_msg)
        test_results["failed"].append({
            "name": name,
            "endpoint": endpoint,
            "expected_status": expected_status,
            "actual_status": status_code,
            "response": response_data
        })
        return None

def test_transactions():
    """Test Family Transactions Page Endpoints"""
    print_header("1. Family Transactions Page")
    
    # Test AI Insights
    test_endpoint(
        "GET Family AI Insights",
        "GET",
        "/api/family/ai/insights"
    )
    
    # Test Transaction Processing
    test_endpoint(
        "POST Process Transaction",
        "POST",
        "/api/transactions/process",
        {
            "userId": "test_user_123",
            "description": "Test transaction for API testing",
            "amount": 100.50,
            "merchantName": "Test Merchant Inc"
        }
    )
    
    # Test Ticker Lookup
    test_endpoint(
        "GET Lookup Ticker",
        "GET",
        "/api/lookup/ticker?company=Apple"
    )
    
    # Test Submit Mapping
    test_endpoint(
        "POST Submit Mapping",
        "POST",
        "/api/family/submit-mapping",
        {
            "transaction_id": "test_txn_123",
            "merchant": "Test Merchant",
            "company_name": "Test Company Inc",
            "ticker": "TEST",
            "category": "Technology",
            "confidence": "High",
            "mapping_id": "AIM1234567"
        }
    )
    
    # Test Export
    test_endpoint(
        "GET Export Transactions",
        "GET",
        "/api/family/export/transactions"
    )
    
    # Test Recommendation Click Tracking
    test_endpoint(
        "POST Track Recommendation Click",
        "POST",
        "/api/analytics/recommendation-click",
        {
            "userId": "test_user_123",
            "productId": "test_product_456",
            "recommendationType": "investment",
            "timestamp": datetime.now().isoformat(),
            "userAgent": "Mozilla/5.0",
            "source": "family-ai-insights"
        }
    )

def test_dashboard():
    """Test Family Dashboard/Overview Page Endpoints"""
    print_header("2. Family Dashboard/Overview Page")
    
    # Get family members
    test_endpoint(
        "GET Family Members",
        "GET",
        "/api/family/members"
    )
    
    # Get family portfolio
    test_endpoint(
        "GET Family Portfolio",
        "GET",
        "/api/family/portfolio"
    )
    
    # Get family goals
    test_endpoint(
        "GET Family Goals",
        "GET",
        "/api/family/goals"
    )

def test_members():
    """Test Family Members Page Endpoints"""
    print_header("3. Family Members Page")
    
    # Get family members
    members_result = test_endpoint(
        "GET Family Members",
        "GET",
        "/api/family/members"
    )
    
    # Create family member
    member_result = test_endpoint(
        "POST Add Family Member",
        "POST",
        "/api/family/members",
        {
            "name": f"Test User {datetime.now().timestamp()}",
            "email": f"testuser{datetime.now().timestamp()}@example.com",
            "role": "child",
            "permissions": "view",
            "status": "pending"
        }
    )
    
    # Delete family member (if creation succeeded)
    if member_result and member_result.get("data"):
        member_id = member_result["data"].get("id")
        if member_id:
            test_endpoint(
                "DELETE Family Member",
                "DELETE",
                f"/api/family/members/{member_id}"
            )
            
            # Test Send Invite
            test_endpoint(
                "POST Send Invite",
                "POST",
                f"/api/family/members/{member_id}/invite",
                {
                    "email": f"testuser{datetime.now().timestamp()}@example.com",
                    "name": "Test User",
                    "familyName": "Test Family"
                }
            )

def test_portfolio():
    """Test Shared Portfolio Page Endpoints"""
    print_header("4. Shared Portfolio Page")
    
    test_endpoint(
        "GET Family Portfolio",
        "GET",
        "/api/family/portfolio"
    )

def test_goals():
    """Test Family Goals Page Endpoints"""
    print_header("5. Family Goals Page")
    
    # Get goals
    test_endpoint(
        "GET Family Goals",
        "GET",
        "/api/family/goals"
    )
    
    # Create goal
    goal_result = test_endpoint(
        "POST Create Goal",
        "POST",
        "/api/family/goals",
        {
            "title": f"Test Goal {datetime.now().timestamp()}",
            "type": "amount",
            "target": 10000,
            "current": 0,
            "timeframe": 12,
            "description": "Test goal for API testing",
            "status": "active"
        }
    )
    
    # Update goal (if creation succeeded)
    if goal_result and goal_result.get("data"):
        goal_id = goal_result["data"].get("id") or goal_result["data"].get("goal", {}).get("id")
        if goal_id:
            test_endpoint(
                "PUT Update Goal",
                "PUT",
                f"/api/family/goals/{goal_id}",
                {
                    "current": 5000,
                    "progress": 50
                }
            )
            
            # Delete goal
            test_endpoint(
                "DELETE Goal",
                "DELETE",
                f"/api/family/goals/{goal_id}"
            )

def test_ai_insights():
    """Test AI Insights Page Endpoints"""
    print_header("6. AI Insights Page")
    
    # Get AI Insights
    test_endpoint(
        "GET Family AI Insights",
        "GET",
        "/api/family/ai-insights"
    )
    
    # Get Mapping History
    test_endpoint(
        "GET Mapping History",
        "GET",
        "/api/family/mapping-history"
    )
    
    # Get Rewards
    test_endpoint(
        "GET Rewards",
        "GET",
        "/api/family/rewards"
    )
    
    # Get Leaderboard
    test_endpoint(
        "GET Leaderboard",
        "GET",
        "/api/family/leaderboard"
    )

def test_notifications():
    """Test Notifications Page Endpoints"""
    print_header("7. Notifications Page")
    
    # Get notifications
    notifications_result = test_endpoint(
        "GET Family Notifications",
        "GET",
        "/api/family/notifications"
    )
    
    # Mark all as read
    test_endpoint(
        "PUT Mark All Notifications as Read",
        "PUT",
        "/api/family/notifications/read-all"
    )
    
    # Mark single notification as read (if any exist)
    if notifications_result and notifications_result.get("notifications"):
        notifications = notifications_result["notifications"]
        if isinstance(notifications, list) and len(notifications) > 0:
            notification_id = notifications[0].get("id")
            if notification_id:
                test_endpoint(
                    "PUT Mark Notification as Read",
                    "PUT",
                    f"/api/family/notifications/{notification_id}/read"
                )
                
                # Delete notification
                test_endpoint(
                    "DELETE Notification",
                    "DELETE",
                    f"/api/family/notifications/{notification_id}"
                )

def test_settings():
    """Test Family Settings Page Endpoints"""
    print_header("8. Family Settings Page")
    
    # Get settings
    test_endpoint("GET Family Settings", "GET", "/api/family/settings")
    
    # Update settings
    test_endpoint(
        "PUT Family Settings",
        "PUT",
        "/api/family/settings",
        {
            "family_name": "Test Family",
            "guardian_email": "guardian@example.com",
            "phone": "+1234567890",
            "round_up_preference": 1.5,
            "investment_goal": "Long-term growth",
            "risk_preference": "moderate",
            "notification_preferences": {
                "email": True,
                "sms": False,
                "push": True
            }
        }
    )
    
    # Get statements
    statements_result = test_endpoint("GET Family Statements", "GET", "/api/family/statements")
    
    # Generate statement
    test_endpoint(
        "POST Generate Statement",
        "POST",
        "/api/family/statements/generate",
        {
            "type": "monthly",
            "period": datetime.now().strftime("%B %Y"),
            "start_date": datetime.now().replace(day=1).strftime("%Y-%m-%d"),
            "end_date": datetime.now().strftime("%Y-%m-%d")
        }
    )

def print_summary():
    """Print test summary"""
    print_header("Test Summary")
    
    total = len(test_results["passed"]) + len(test_results["failed"]) + len(test_results["skipped"])
    
    print(f"\nTotal Tests: {total}")
    print(f"✅ Passed: {len(test_results['passed'])} ({len(test_results['passed'])/total*100:.1f}%)")
    print(f"❌ Failed: {len(test_results['failed'])} ({len(test_results['failed'])/total*100:.1f}%)")
    print(f"⏭️  Skipped: {len(test_results['skipped'])} ({len(test_results['skipped'])/total*100:.1f}%)")
    
    if test_results["failed"]:
        print("\n❌ Failed Tests:")
        for failure in test_results["failed"]:
            print(f"   - {failure['name']}: {failure.get('error', 'Unknown error')}")
    
    # Save results to file
    with open("family_test_results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    print(f"\n📄 Detailed results saved to family_test_results.json")

def main():
    """Main test runner"""
    global TOKEN
    
    print_header("Family Dashboard API Testing")
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Get token from command line or environment
    if len(sys.argv) > 1:
        TOKEN = sys.argv[1]
    else:
        TOKEN = input("\nEnter your authentication token (or press Enter to skip auth tests): ").strip()
    
    if not TOKEN:
        print("⚠️  No token provided. Some tests may fail.")
        TOKEN = "test_token"
    
    try:
        # Run all test suites
        test_transactions()
        test_dashboard()
        test_members()
        test_portfolio()
        test_goals()
        test_ai_insights()
        test_notifications()
        test_settings()
        
        # Print summary
        print_summary()
        
        # Exit with appropriate code
        if test_results["failed"]:
            sys.exit(1)
        else:
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        print_summary()
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()




