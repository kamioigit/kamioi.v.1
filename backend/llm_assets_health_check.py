#!/usr/bin/env python3
"""
LLM Assets Health Check - Comprehensive monitoring solution
This script provides multiple ways to ensure the LLM Assets calculation is always working correctly.
"""

import sqlite3
import requests
import json
from decimal import Decimal
from datetime import datetime
import time
import os

class LLMAssetsHealthCheck:
    def __init__(self):
        self.db_path = 'kamioi.db'
        self.api_base_url = 'http://localhost:5111'
        self.expected_per_transaction_value = Decimal('0.072')
        self.expected_asset_count = 3
        
    def check_database_health(self):
        """Check if database is healthy and has required data"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check table existence
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='llm_mappings'")
            if not cursor.fetchone():
                return False, "llm_mappings table does not exist"
            
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='llm_assets'")
            if not cursor.fetchone():
                return False, "llm_assets table does not exist"
            
            # Check data counts
            cursor.execute("SELECT COUNT(*) FROM llm_mappings")
            total_mappings = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM llm_assets")
            asset_count = cursor.fetchone()[0]
            
            conn.close()
            
            if total_mappings == 0:
                return False, "No mappings found in database"
            
            if asset_count == 0:
                return False, "No assets found in database"
            
            return True, {
                'total_mappings': total_mappings,
                'asset_count': asset_count
            }
            
        except Exception as e:
            return False, f"Database error: {e}"
    
    def calculate_expected_values(self, total_mappings):
        """Calculate what the values should be"""
        per_asset_value = Decimal(str(total_mappings)) * self.expected_per_transaction_value
        total_value = per_asset_value * self.expected_asset_count
        
        return {
            'per_asset': float(per_asset_value),
            'total': float(total_value),
            'per_transaction': float(self.expected_per_transaction_value)
        }
    
    def test_api_endpoint(self, endpoint, headers=None):
        """Test a specific API endpoint"""
        try:
            response = requests.get(f"{self.api_base_url}{endpoint}", 
                                 headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return True, data
                else:
                    return False, f"API returned error: {data.get('error', 'Unknown error')}"
            else:
                return False, f"HTTP {response.status_code}: {response.text[:200]}"
                
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {e}"
        except Exception as e:
            return False, f"Unexpected error: {e}"
    
    def validate_economic_value_calculation(self):
        """Validate the economic value calculation is working correctly"""
        print("LLM Assets Economic Value Validation")
        print("=" * 50)
        
        # Step 1: Check database health
        print("1. Checking database health...")
        db_healthy, db_data = self.check_database_health()
        if not db_healthy:
            print(f"   ERROR: {db_data}")
            return False
        
        print(f"   OK - Total mappings: {db_data['total_mappings']:,}")
        print(f"   OK - Asset count: {db_data['asset_count']}")
        
        # Step 2: Calculate expected values
        print("\n2. Calculating expected values...")
        expected = self.calculate_expected_values(db_data['total_mappings'])
        print(f"   Expected per asset: ${expected['per_asset']:,.2f}")
        print(f"   Expected total: ${expected['total']:,.2f}")
        print(f"   Per-transaction value: ${expected['per_transaction']}")
        
        # Step 3: Test LLM Assets API
        print("\n3. Testing LLM Assets API...")
        api_success, api_data = self.test_api_endpoint('/api/admin/llm-assets')
        if not api_success:
            print(f"   ERROR: {api_data}")
            return False
        
        api_total = api_data['data']['summary']['total_economic_value']
        api_individual = [asset['economic_value'] for asset in api_data['data']['assets']]
        
        print(f"   OK - API total: ${api_total:,.2f}")
        print(f"   OK - API individual: {[f'${val:,.2f}' for val in api_individual]}")
        
        # Step 4: Validate consistency
        print("\n4. Validating consistency...")
        
        # Check if API matches expected
        api_total_match = abs(api_total - expected['total']) < 1
        api_individual_match = all(abs(val - expected['per_asset']) < 1 for val in api_individual)
        
        print(f"   API total matches expected: {api_total_match}")
        print(f"   API individual matches expected: {api_individual_match}")
        
        # Overall validation
        all_valid = api_total_match and api_individual_match
        
        if all_valid:
            print("\nSUCCESS: Economic value calculation is working correctly!")
            print(f"   Formula: {db_data['total_mappings']:,} mappings × ${expected['per_transaction']} × 3 assets = ${expected['total']:,.2f}")
        else:
            print("\nWARNING: Economic value calculation has issues!")
            if not api_total_match:
                print(f"   - API total (${api_total:,.2f}) doesn't match expected (${expected['total']:,.2f})")
            if not api_individual_match:
                print(f"   - Individual assets don't match expected (${expected['per_asset']:,.2f})")
        
        return all_valid
    
    def run_health_check(self):
        """Run a complete health check"""
        print("LLM Assets Health Check")
        print("=" * 30)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Run validation
        is_healthy = self.validate_economic_value_calculation()
        
        print("\n" + "=" * 50)
        if is_healthy:
            print("OVERALL STATUS: HEALTHY - All calculations working correctly")
        else:
            print("OVERALL STATUS: UNHEALTHY - Issues detected")
        
        return is_healthy
    
    def create_monitoring_script(self):
        """Create a simple monitoring script that can be run regularly"""
        script_content = '''#!/usr/bin/env python3
"""
Simple LLM Assets Monitor - Run this script regularly to check calculation health
"""

import subprocess
import sys
import os

def run_health_check():
    try:
        # Change to the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(backend_dir)
        
        # Run the health check
        result = subprocess.run([sys.executable, 'llm_assets_health_check.py'], 
                              capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return result.returncode == 0
    except Exception as e:
        print(f"Error running health check: {e}")
        return False

if __name__ == "__main__":
    success = run_health_check()
    sys.exit(0 if success else 1)
'''
        
        with open('monitor_llm_assets.py', 'w') as f:
            f.write(script_content)
        
        print("Created monitor_llm_assets.py for easy monitoring")
    
    def create_alert_system(self):
        """Create an alert system for when calculations fail"""
        alert_script = '''#!/usr/bin/env python3
"""
LLM Assets Alert System - Sends alerts when calculations fail
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import subprocess
import sys

def send_alert(message):
    """Send an alert (customize this for your notification system)"""
    print(f"ALERT: {message}")
    # Add email, Slack, or other notification logic here

def check_and_alert():
    try:
        result = subprocess.run([sys.executable, 'llm_assets_health_check.py'], 
                              capture_output=True, text=True)
        
        if result.returncode != 0:
            send_alert("LLM Assets calculation validation failed!")
            print(result.stdout)
            print(result.stderr)
        else:
            print("LLM Assets calculation is healthy")
            
    except Exception as e:
        send_alert(f"Error checking LLM Assets: {e}")

if __name__ == "__main__":
    check_and_alert()
'''
        
        with open('llm_assets_alert.py', 'w') as f:
            f.write(alert_script)
        
        print("Created llm_assets_alert.py for alerting")

def main():
    health_check = LLMAssetsHealthCheck()
    
    # Run health check
    is_healthy = health_check.run_health_check()
    
    # Create monitoring tools
    health_check.create_monitoring_script()
    health_check.create_alert_system()
    
    print("\nMonitoring tools created:")
    print("- monitor_llm_assets.py: Simple monitoring script")
    print("- llm_assets_alert.py: Alert system for failures")
    print("\nTo run continuous monitoring:")
    print("  python monitor_llm_assets.py")
    print("\nTo set up alerts:")
    print("  python llm_assets_alert.py")
    
    return 0 if is_healthy else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())



