#!/usr/bin/env python3
"""
Business Dashboard API Endpoint Testing Script
Tests all 36 endpoints for the Business Dashboard
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

def test_overview():
    """Test Overview Page Endpoints"""
    print_header("1. Overview Page")
    
    test_endpoint(
        "GET Dashboard Overview",
        "GET",
        "/api/business/dashboard/overview"
    )

def test_transactions():
    """Test Transactions Page Endpoints"""
    print_header("2. Transactions Page")
    
    # Test AI Insights
    test_endpoint(
        "GET Business AI Insights",
        "GET",
        "/api/business/ai/insights"
    )
    
    # Test Transaction Processing
    process_result = test_endpoint(
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
        "/api/business/submit-mapping",
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
        "/api/business/export/transactions"
    )

def test_team():
    """Test Team Page Endpoints"""
    print_header("3. Team Page")
    
    # Get team members
    team_result = test_endpoint(
        "GET Team Members",
        "GET",
        "/api/business/team/members"
    )
    
    # Create team member
    member_result = test_endpoint(
        "POST Add Team Member",
        "POST",
        "/api/business/team/members",
        {
            "name": f"Test User {datetime.now().timestamp()}",
            "email": f"testuser{datetime.now().timestamp()}@example.com",
            "role": "employee",
            "permissions": []
        }
    )
    
    # Update team member (if creation succeeded)
    if member_result and member_result.get("data"):
        member_id = member_result["data"].get("id") or member_result["data"].get("member", {}).get("id")
        if member_id:
            test_endpoint(
                "PUT Update Team Member",
                "PUT",
                f"/api/business/team/members/{member_id}",
                {
                    "name": "Test User Updated",
                    "role": "manager"
                }
            )
            
            # Delete team member
            test_endpoint(
                "DELETE Team Member",
                "DELETE",
                f"/api/business/team/members/{member_id}"
            )

def test_goals():
    """Test Business Goals Page Endpoints"""
    print_header("4. Business Goals Page")
    
    # Get goals
    test_endpoint(
        "GET Business Goals",
        "GET",
        "/api/business/goals"
    )
    
    # Create goal
    goal_result = test_endpoint(
        "POST Create Goal",
        "POST",
        "/api/business/goals",
        {
            "name": f"Test Goal {datetime.now().timestamp()}",
            "description": "Test goal for API testing",
            "target": 10000,
            "current": 0,
            "department": "Engineering",
            "status": "pending"
        }
    )
    
    # Update goal (if creation succeeded)
    if goal_result and goal_result.get("data"):
        goal_id = goal_result["data"].get("id") or goal_result["data"].get("goal", {}).get("id")
        if goal_id:
            test_endpoint(
                "PUT Update Goal",
                "PUT",
                f"/api/business/goals/{goal_id}",
                {
                    "current": 5000
                }
            )
            
            # Update goal progress
            test_endpoint(
                "PUT Update Goal Progress",
                "PUT",
                f"/api/business/goals/{goal_id}",
                {
                    "current": 7500
                }
            )
            
            # Delete goal
            test_endpoint(
                "DELETE Goal",
                "DELETE",
                f"/api/business/goals/{goal_id}"
            )

def test_analytics():
    """Test Analytics Page Endpoints"""
    print_header("5. Analytics Page")
    
    test_endpoint(
        "GET Business Analytics",
        "GET",
        "/api/business/analytics"
    )

def test_reports():
    """Test Reports Page Endpoints"""
    print_header("6. Reports Page")
    
    # Get reports
    reports_result = test_endpoint(
        "GET Business Reports",
        "GET",
        "/api/business/reports"
    )
    
    # Generate report
    report_result = test_endpoint(
        "POST Generate Report",
        "POST",
        "/api/business/reports/generate",
        {
            "type": "monthly",
            "format": "PDF",
            "period": datetime.now().strftime("%Y-%m")
        }
    )
    
    # Download report (if generation succeeded)
    if report_result and report_result.get("data"):
        report_id = report_result["data"].get("id") or report_result["data"].get("report", {}).get("id")
        if report_id:
            test_endpoint(
                "GET Download Report",
                "GET",
                f"/api/business/reports/{report_id}/download"
            )

def test_settings():
    """Test Settings Page Endpoints"""
    print_header("7. Settings Page")
    
    # General Settings
    test_endpoint("GET General Settings", "GET", "/api/business/settings")
    test_endpoint(
        "PUT General Settings",
        "PUT",
        "/api/business/settings",
        {
            "roundup_multiplier": 1.5,
            "theme": "dark",
            "auto_invest": True,
            "notifications": True
        }
    )
    
    # Account Settings
    test_endpoint("GET Account Settings", "GET", "/api/business/settings/account")
    test_endpoint(
        "PUT Account Settings",
        "PUT",
        "/api/business/settings/account",
        {
            "name": "Test Business",
            "email": "test@example.com",
            "company_name": "Test Company Inc"
        }
    )
    
    # Security Settings
    test_endpoint("GET Security Settings", "GET", "/api/business/settings/security")
    test_endpoint(
        "PUT Security Settings",
        "PUT",
        "/api/business/settings/security",
        {
            "two_factor_enabled": False,
            "password_expiry_days": 90,
            "session_timeout_minutes": 30
        }
    )
    
    # Notification Settings
    test_endpoint("GET Notification Settings", "GET", "/api/business/settings/notifications")
    test_endpoint(
        "PUT Notification Settings",
        "PUT",
        "/api/business/settings/notifications",
        {
            "email_notifications": True,
            "push_notifications": True,
            "transaction_alerts": True
        }
    )
    
    # Data Settings
    test_endpoint("GET Data Settings", "GET", "/api/business/settings/data")
    test_endpoint(
        "PUT Data Settings",
        "PUT",
        "/api/business/settings/data",
        {
            "auto_backup": True,
            "backup_frequency": "daily",
            "data_retention_days": 365
        }
    )
    
    # Bank Connections
    bank_result = test_endpoint("GET Bank Connections", "GET", "/api/business/bank-connections")
    
    # Delete bank connection (if any exist)
    if bank_result and bank_result.get("connections"):
        connections = bank_result["connections"]
        if isinstance(connections, list) and len(connections) > 0:
            connection_id = connections[0].get("id") or connections[0].get("account_id")
            if connection_id:
                test_endpoint(
                    "DELETE Bank Connection",
                    "DELETE",
                    f"/api/business/bank-connections/{connection_id}"
                )

def test_notifications():
    """Test Notifications Page Endpoints"""
    print_header("8. Notifications Page")
    
    # Get notifications
    notifications_result = test_endpoint(
        "GET Business Notifications",
        "GET",
        "/api/business/notifications"
    )
    
    # Mark all as read
    test_endpoint(
        "PUT Mark All Notifications as Read",
        "PUT",
        "/api/business/notifications/read-all"
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
                    f"/api/business/notifications/{notification_id}/read"
                )
                
                # Delete notification
                test_endpoint(
                    "DELETE Notification",
                    "DELETE",
                    f"/api/business/notifications/{notification_id}"
                )
    
    # Export notifications
    test_endpoint(
        "GET Export Notifications",
        "GET",
        "/api/business/notifications/export"
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
    with open("test_results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    print(f"\n📄 Detailed results saved to test_results.json")

def main():
    """Main test runner"""
    global TOKEN
    
    print_header("Business Dashboard API Testing")
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
        test_overview()
        test_transactions()
        test_team()
        test_goals()
        test_analytics()
        test_reports()
        test_settings()
        test_notifications()
        
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




