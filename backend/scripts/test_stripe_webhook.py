"""
Stripe Webhook Testing Script
Tests webhook endpoint locally without Stripe CLI

Usage:
    python scripts/test_stripe_webhook.py
"""

import requests
import json
import hmac
import hashlib
import time

# Test webhook endpoint
WEBHOOK_URL = "http://localhost:5111/api/stripe/webhook"

# Mock webhook secret (you should use your actual secret from Stripe CLI or Dashboard)
WEBHOOK_SECRET = "whsec_test_secret_replace_with_actual"

def generate_signature(payload, secret):
    """Generate Stripe webhook signature"""
    timestamp = str(int(time.time()))
    signed_payload = f"{timestamp}.{payload.decode('utf-8')}"
    signature = hmac.new(
        secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return f"t={timestamp},v1={signature}"

def test_webhook_event(event_type, event_data):
    """Test a webhook event"""
    print(f"\n{'='*60}")
    print(f"Testing: {event_type}")
    print(f"{'='*60}")
    
    # Create event payload
    event = {
        "id": f"evt_test_{int(time.time())}",
        "object": "event",
        "type": event_type,
        "data": {
            "object": event_data
        },
        "created": int(time.time())
    }
    
    payload = json.dumps(event).encode('utf-8')
    
    # Generate signature
    signature = generate_signature(payload, WEBHOOK_SECRET)
    
    # Send request
    headers = {
        "Content-Type": "application/json",
        "Stripe-Signature": signature
    }
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            data=payload,
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("[OK] Webhook processed successfully")
        else:
            print(f"[ERROR] Webhook failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Could not connect to server. Make sure your backend is running on port 5111")
    except Exception as e:
        print(f"[ERROR] {str(e)}")

def main():
    print("Stripe Webhook Testing Script")
    print("=" * 60)
    print("\nNote: This is a basic test. For full testing, use Stripe CLI:")
    print("  stripe listen --forward-to localhost:5111/api/stripe/webhook")
    print("\nMake sure your backend is running before testing!")
    print("\nPress Enter to continue or Ctrl+C to cancel...")
    input()
    
    # Test checkout.session.completed
    test_webhook_event("checkout.session.completed", {
        "id": "cs_test_123",
        "object": "checkout.session",
        "customer": "cus_test_123",
        "subscription": "sub_test_123",
        "metadata": {
            "user_id": "1",
            "plan_id": "1",
            "plan_name": "Test Plan",
            "account_type": "individual",
            "billing_cycle": "monthly"
        }
    })
    
    # Test invoice.payment_succeeded
    test_webhook_event("invoice.payment_succeeded", {
        "id": "in_test_123",
        "object": "invoice",
        "subscription": "sub_test_123",
        "amount_paid": 999,  # $9.99 in cents
        "customer": "cus_test_123"
    })
    
    # Test invoice.payment_failed
    test_webhook_event("invoice.payment_failed", {
        "id": "in_test_456",
        "object": "invoice",
        "subscription": "sub_test_123",
        "customer": "cus_test_123"
    })
    
    print("\n" + "=" * 60)
    print("Testing complete!")
    print("=" * 60)
    print("\nNote: For accurate testing, use Stripe CLI or actual Stripe events")

if __name__ == "__main__":
    main()


