"""
Stripe API Endpoints
Handles Stripe checkout, subscription management, and webhooks
"""

from flask import Blueprint, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import time
import random
import logging

from services.stripe_service import StripeService
from database_manager import db_manager

logger = logging.getLogger(__name__)

stripe_bp = Blueprint('stripe', __name__)

# Configure CORS specifically for this Blueprint
# Using string for origins to match global CORS
CORS(stripe_bp, 
     origins='*',
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
     supports_credentials=False)

# Ensure CORS headers are added to all Stripe Blueprint responses
@stripe_bp.after_request
def stripe_after_request(response):
    """Add CORS headers to all Stripe Blueprint responses"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# Error handler for Stripe Blueprint to ensure CORS headers on errors
@stripe_bp.errorhandler(Exception)
def stripe_error_handler(e):
    """Handle exceptions in Stripe routes and ensure CORS headers"""
    from flask import jsonify
    import traceback
    from werkzeug.exceptions import HTTPException
    
    # Log the error
    logger.error(f"Stripe route error: {str(e)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Handle HTTP exceptions
    if isinstance(e, HTTPException):
        response = jsonify({
            'success': False,
            'error': e.name if hasattr(e, 'name') else 'Error',
            'message': str(e.description) if hasattr(e, 'description') else str(e)
        })
        response.status_code = e.code if hasattr(e, 'code') else 500
    else:
        # Handle other exceptions
        response = jsonify({
            'success': False,
            'error': 'Internal Server Error',
            'message': str(e) if isinstance(e, (str, Exception)) else 'An unexpected error occurred'
        })
        response.status_code = 500
    
    # Always add CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    
    return response

def get_auth_user():
    """Helper to get authenticated user from token"""
    # This should match your existing auth implementation
    from app import get_auth_user as _get_auth_user
    return _get_auth_user()

def require_role(role):
    """Helper to check user role"""
    from app import require_role as _require_role
    return _require_role(role)


@stripe_bp.route('/api/stripe/config', methods=['GET'])
def get_stripe_config():
    """Get Stripe publishable key for frontend"""
    try:
        stripe_service = StripeService()
        return jsonify({
            'success': True,
            'publishable_key': stripe_service.get_publishable_key(),
            'mode': stripe_service.mode
        })
    except Exception as e:
        logger.error(f"Error getting Stripe config: {str(e)}")
        response = jsonify({'success': False, 'error': str(e)})
        response.status_code = 500
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response


@stripe_bp.route('/api/stripe/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Create Stripe Checkout session for subscription"""
    # Accept both user and business roles
    # Also allow during registration if userGuid is provided
    ok, res = require_role('user')
    user = None
    
    if ok:
        user = res
    else:
        # Try business role as fallback
        ok, res = require_role('business')
        if ok:
            user = res
        else:
            # Check if this is during registration - allow with userGuid
            data = request.get_json() or {}
            user_guid = data.get('userGuid')
            if user_guid:
                # Find user by userGuid
                from database_manager import db_manager
                conn = db_manager.get_connection()
                cursor = conn.cursor()
                cursor.execute('SELECT id, email, name, account_type FROM users WHERE user_guid = ?', (user_guid,))
                user_row = cursor.fetchone()
                conn.close()
                
                if user_row:
                    user = {
                        'id': user_row[0],
                        'email': user_row[1],
                        'name': user_row[2],
                        'account_type': user_row[3]
                    }
                    print(f"[STRIPE] Found user by userGuid: {user['id']}")
                else:
                    return jsonify({'success': False, 'error': 'User not found'}), 404
            else:
                return res
    
    try:
        data = request.get_json()
        if not data or not data.get('plan_id'):
            response = jsonify({'success': False, 'error': 'Plan ID is required'})
            response.status_code = 400
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            return response
        
        # Use the user we found above (either from auth or userGuid)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        user_id = user.get('id')
        user_email = user.get('email', '')
        user_name = user.get('name', '')
        
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get plan details
        cursor.execute("""
            SELECT id, name, price_monthly, price_yearly, account_type, tier
            FROM subscription_plans 
            WHERE id = ?
        """, (data['plan_id'],))
        plan = cursor.fetchone()
        
        if not plan:
            conn.close()
            response = jsonify({'success': False, 'error': 'Plan not found'})
            response.status_code = 404
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            return response
        
        billing_cycle = data.get('billing_cycle', 'monthly')
        amount = plan[2] if billing_cycle == 'monthly' else plan[3]  # price_monthly or price_yearly
        interval = 'month' if billing_cycle == 'monthly' else 'year'
        
        # Convert amount to cents
        amount_cents = int(amount * 100)
        
        # Initialize Stripe service
        stripe_service = StripeService()
        
        # Get or create Stripe customer
        cursor.execute("SELECT stripe_customer_id FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        existing_customer_id = user_row[0] if user_row and user_row[0] else None
        
        customer_result = stripe_service.get_or_create_customer(
            user_id=user_id,
            email=user_email,
            name=user_name,
            existing_customer_id=existing_customer_id
        )
        
        if not customer_result['success']:
            conn.close()
            response = jsonify({'success': False, 'error': customer_result.get('error', 'Failed to create customer')})
            response.status_code = 500
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            return response
        
        customer_id = customer_result['customer_id']
        
        # Save customer ID to user record if new
        if not existing_customer_id:
            cursor.execute("UPDATE users SET stripe_customer_id = ? WHERE id = ?", (customer_id, user_id))
            conn.commit()
        
        # Create or get Stripe Price
        product_name = f"{plan[1]} - {plan[4]}"
        price_result = stripe_service.create_price(
            amount=amount_cents,
            currency='usd',
            interval=interval,
            product_name=product_name
        )
        
        if not price_result['success']:
            conn.close()
            response = jsonify({'success': False, 'error': price_result.get('error', 'Failed to create price')})
            response.status_code = 500
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            return response
        
        price_id = price_result['price_id']
        
        # Store Stripe price ID in subscription_plans table for future use
        # (Optional: you might want to store this)
        
        # Create checkout session
        base_url = os.getenv('FRONTEND_URL', 'http://localhost:4000')
        success_url = f"{base_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{base_url}/subscription/cancel"
        
        metadata = {
            'user_id': str(user_id),
            'plan_id': str(plan[0]),
            'plan_name': plan[1],
            'account_type': plan[4],
            'billing_cycle': billing_cycle
        }
        
        session_result = stripe_service.create_checkout_session(
            customer_id=customer_id,
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        if not session_result['success']:
            conn.close()
            response = jsonify({'success': False, 'error': session_result.get('error', 'Failed to create checkout session')})
            response.status_code = 500
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            return response
        
        conn.close()
        
        return jsonify({
            'success': True,
            'session_id': session_result['session_id'],
            'url': session_result['url']
        })
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        response = jsonify({'success': False, 'error': str(e)})
        response.status_code = 500
        # Ensure CORS headers are present on error responses
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response


@stripe_bp.route('/api/stripe/create-portal-session', methods=['POST'])
def create_portal_session():
    """Create Stripe Customer Portal session for subscription management"""
    # Accept both user and business roles
    ok, res = require_role('user')
    if ok is False:
        # Try business role as fallback
        ok, res = require_role('business')
        if ok is False:
            return res
    
    try:
        user = get_auth_user()
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        user_id = user.get('id')
        user_email = user.get('email', '')
        user_name = user.get('name', '')
        
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Check if user has an active subscription
        cursor.execute("""
            SELECT id FROM user_subscriptions 
            WHERE user_id = ? AND status IN ('active', 'trialing')
            LIMIT 1
        """, (user_id,))
        has_active_subscription = cursor.fetchone() is not None
        
        # Get existing Stripe customer ID
        cursor.execute("SELECT stripe_customer_id FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        existing_customer_id = user_row[0] if user_row and user_row[0] else None
        
        # If no Stripe customer but has active subscription, create one
        if not existing_customer_id:
            if has_active_subscription:
                # User has subscription but no Stripe customer - create one
                stripe_service = StripeService()
                customer_result = stripe_service.get_or_create_customer(
                    user_id=user_id,
                    email=user_email,
                    name=user_name,
                    existing_customer_id=None
                )
                
                if customer_result['success']:
                    customer_id = customer_result['customer_id']
                    # Save customer ID to user record
                    cursor.execute("UPDATE users SET stripe_customer_id = ? WHERE id = ?", (customer_id, user_id))
                    conn.commit()
                    logger.info(f"Created Stripe customer {customer_id} for user {user_id} with active subscription")
                else:
                    conn.close()
                    response = jsonify({
                        'success': False, 
                        'error': 'Failed to create Stripe customer. Please contact support.',
                        'code': 'CUSTOMER_CREATION_FAILED'
                    })
                    response.status_code = 500
                    response.headers['Access-Control-Allow-Origin'] = '*'
                    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
                    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                    return response
            else:
                # No subscription and no customer
                conn.close()
                response = jsonify({
                    'success': False, 
                    'error': 'No Stripe customer found. Please complete a subscription checkout first.',
                    'code': 'NO_CUSTOMER'
                })
                response.status_code = 400
                response.headers['Access-Control-Allow-Origin'] = '*'
                response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
                response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                return response
        else:
            customer_id = existing_customer_id
        
        conn.close()
        
        stripe_service = StripeService()
        base_url = os.getenv('FRONTEND_URL', 'http://localhost:4000')
        return_url = f"{base_url}/subscription"
        
        portal_result = stripe_service.create_portal_session(
            customer_id=customer_id,
            return_url=return_url
        )
        
        if not portal_result['success']:
            return jsonify({'success': False, 'error': portal_result.get('error', 'Failed to create portal session')}), 500
        
        return jsonify({
            'success': True,
            'url': portal_result['url']
        })
        
    except Exception as e:
        logger.error(f"Error creating portal session: {str(e)}")
        response = jsonify({'success': False, 'error': str(e)})
        response.status_code = 500
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response


@stripe_bp.route('/api/stripe/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events"""
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    if not webhook_secret:
        logger.warning("STRIPE_WEBHOOK_SECRET not set, webhook signature verification disabled")
        # For development, you might want to parse without verification
        import json
        try:
            event = json.loads(payload)
        except:
            return jsonify({'error': 'Invalid payload'}), 400
    else:
        stripe_service = StripeService()
        event = stripe_service.verify_webhook_signature(payload, sig_header, webhook_secret)
        
        if not event:
            return jsonify({'error': 'Invalid signature'}), 400
    
    event_type = event.get('type')
    event_data = event.get('data', {}).get('object', {})
    
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        if event_type == 'checkout.session.completed':
            # Handle successful checkout
            session = event_data
            customer_id = session.get('customer')
            subscription_id = session.get('subscription')
            metadata = session.get('metadata', {})
            
            user_id = metadata.get('user_id')
            plan_id = metadata.get('plan_id')
            
            if user_id and plan_id and subscription_id:
                # Get subscription details from Stripe
                stripe_service = StripeService()
                subscription = stripe_service.get_subscription(subscription_id)
                
                if subscription:
                    # Update or create subscription in database
                    cursor.execute("""
                        SELECT id FROM user_subscriptions 
                        WHERE user_id = ? AND stripe_subscription_id = ?
                    """, (int(user_id), subscription_id))
                    
                    existing = cursor.fetchone()
                    
                    # Get plan details
                    cursor.execute("""
                        SELECT price_monthly, price_yearly, account_type
                        FROM subscription_plans WHERE id = ?
                    """, (int(plan_id),))
                    plan = cursor.fetchone()
                    
                    if plan:
                        # Calculate dates
                        now = datetime.now()
                        period_start = datetime.fromtimestamp(subscription['current_period_start'])
                        period_end = datetime.fromtimestamp(subscription['current_period_end'])
                        amount = subscription['items']['data'][0]['price']['unit_amount'] / 100
                        
                        if existing:
                            # Update existing subscription
                            cursor.execute("""
                                UPDATE user_subscriptions SET
                                    status = ?,
                                    amount = ?,
                                    current_period_start = ?,
                                    current_period_end = ?,
                                    next_billing_date = ?,
                                    updated_at = ?
                                WHERE id = ?
                            """, (
                                subscription['status'],
                                amount,
                                period_start.isoformat(),
                                period_end.isoformat(),
                                period_end.isoformat(),
                                now.isoformat(),
                                existing[0]
                            ))
                            subscription_db_id = existing[0]
                        else:
                            # Create new subscription
                            cursor.execute("""
                                INSERT INTO user_subscriptions (
                                    user_id, plan_id, status, billing_cycle, amount,
                                    current_period_start, current_period_end, next_billing_date,
                                    stripe_subscription_id, auto_renewal, created_at, updated_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                            """, (
                                int(user_id), int(plan_id), subscription['status'],
                                'month' if subscription['items']['data'][0]['price']['recurring']['interval'] == 'month' else 'year',
                                amount, period_start.isoformat(), period_end.isoformat(),
                                period_end.isoformat(), subscription_id, now.isoformat(), now.isoformat()
                            ))
                            subscription_db_id = cursor.lastrowid
                        
                        # Update user record
                        cursor.execute("""
                            UPDATE users SET
                                subscription_status = 'active',
                                subscription_id = ?
                            WHERE id = ?
                        """, (subscription_db_id, int(user_id)))
                        
                        # Create journal entry for payment
                        _create_stripe_journal_entry(cursor, subscription_db_id, int(user_id), int(plan_id), amount, plan[2])
                        
                        conn.commit()
                        logger.info(f"Processed checkout.session.completed for user {user_id}, subscription {subscription_id}")
        
        elif event_type == 'invoice.payment_succeeded':
            # Handle successful payment (renewal or initial)
            invoice = event_data
            subscription_id = invoice.get('subscription')
            amount = invoice.get('amount_paid', 0) / 100
            
            if subscription_id:
                cursor.execute("""
                    SELECT us.id, us.user_id, us.plan_id, sp.account_type
                    FROM user_subscriptions us
                    JOIN subscription_plans sp ON us.plan_id = sp.id
                    WHERE us.stripe_subscription_id = ?
                """, (subscription_id,))
                
                sub_row = cursor.fetchone()
                if sub_row:
                    subscription_db_id, user_id, plan_id, account_type = sub_row
                    
                    # Update subscription dates
                    stripe_service = StripeService()
                    subscription = stripe_service.get_subscription(subscription_id)
                    
                    if subscription:
                        period_start = datetime.fromtimestamp(subscription['current_period_start'])
                        period_end = datetime.fromtimestamp(subscription['current_period_end'])
                        
                        cursor.execute("""
                            UPDATE user_subscriptions SET
                                current_period_start = ?,
                                current_period_end = ?,
                                next_billing_date = ?,
                                updated_at = ?
                            WHERE id = ?
                        """, (
                            period_start.isoformat(),
                            period_end.isoformat(),
                            period_end.isoformat(),
                            datetime.now().isoformat(),
                            subscription_db_id
                        ))
                        
                        # Create journal entry for renewal
                        _create_stripe_journal_entry(cursor, subscription_db_id, user_id, plan_id, amount, account_type)
                        conn.commit()
                        logger.info(f"Processed invoice.payment_succeeded for subscription {subscription_id}")
        
        elif event_type == 'invoice.payment_failed':
            # Handle failed payment
            invoice = event_data
            subscription_id = invoice.get('subscription')
            
            if subscription_id:
                cursor.execute("""
                    UPDATE user_subscriptions SET status = 'past_due'
                    WHERE stripe_subscription_id = ?
                """, (subscription_id,))
                
                cursor.execute("""
                    UPDATE users SET subscription_status = 'past_due'
                    WHERE id IN (SELECT user_id FROM user_subscriptions WHERE stripe_subscription_id = ?)
                """, (subscription_id,))
                
                conn.commit()
                logger.info(f"Processed invoice.payment_failed for subscription {subscription_id}")
        
        elif event_type == 'customer.subscription.deleted':
            # Handle subscription cancellation
            subscription = event_data
            subscription_id = subscription.get('id')
            
            if subscription_id:
                cursor.execute("""
                    UPDATE user_subscriptions SET status = 'canceled'
                    WHERE stripe_subscription_id = ?
                """, (subscription_id,))
                
                cursor.execute("""
                    UPDATE users SET subscription_status = 'canceled'
                    WHERE id IN (SELECT user_id FROM user_subscriptions WHERE stripe_subscription_id = ?)
                """, (subscription_id,))
                
                conn.commit()
                logger.info(f"Processed customer.subscription.deleted for subscription {subscription_id}")
        
        elif event_type == 'customer.subscription.updated':
            # Handle subscription updates
            subscription = event_data
            subscription_id = subscription.get('id')
            status = subscription.get('status')
            
            if subscription_id:
                cursor.execute("""
                    UPDATE user_subscriptions SET status = ?
                    WHERE stripe_subscription_id = ?
                """, (status, subscription_id))
                
                cursor.execute("""
                    UPDATE users SET subscription_status = ?
                    WHERE id IN (SELECT user_id FROM user_subscriptions WHERE stripe_subscription_id = ?)
                """, (status, subscription_id))
                
                conn.commit()
                logger.info(f"Processed customer.subscription.updated for subscription {subscription_id}")
        
        conn.close()
        
        return jsonify({'received': True})
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        conn.close()
        return jsonify({'error': str(e)}), 500


def _create_stripe_journal_entry(cursor, subscription_db_id, user_id, plan_id, amount, account_type):
    """Helper function to create journal entry for Stripe payment"""
    try:
        # Account mappings
        deferred_revenue_accounts = {
            'individual': '23010',
            'family': '23020',
            'business': '23030'
        }
        cash_account = '10100'
        deferred_account = deferred_revenue_accounts.get(account_type.lower(), '23010')
        
        # Create reference
        now = datetime.now()
        date_str = now.strftime('%Y%m%d')
        reference = f"STRIPE-{subscription_db_id}-{date_str}"
        description = f"Stripe subscription payment - {account_type}"
        
        # Create journal entry ID
        timestamp_ms = int(time.time() * 1000)
        random_suffix = random.randint(1000, 9999)
        journal_entry_id = f"JE-{timestamp_ms}-{random_suffix}"
        
        # Ensure ID is unique
        for _ in range(10):
            cursor.execute("SELECT id FROM journal_entries WHERE id = ?", (journal_entry_id,))
            if not cursor.fetchone():
                break
            timestamp_ms = int(time.time() * 1000)
            random_suffix = random.randint(1000, 9999)
            journal_entry_id = f"JE-{timestamp_ms}-{random_suffix}"
        
        # Create journal entry
        cursor.execute("""
            INSERT INTO journal_entries (
                id, date, transaction_type, amount, from_account, to_account,
                reference, description, created_at, updated_at
            ) VALUES (?, ?, 'subscription_payment', ?, ?, ?, ?, ?, ?, ?)
        """, (
            journal_entry_id,
            now.strftime('%Y-%m-%d'),
            amount,
            cash_account,
            deferred_account,
            reference,
            description,
            now.isoformat(),
            now.isoformat()
        ))
        
        # Create journal entry lines (double-entry)
        cursor.execute("""
            INSERT INTO journal_entry_lines (
                journal_entry_id, account_number, debit, credit, description
            ) VALUES (?, ?, ?, 0, ?)
        """, (journal_entry_id, cash_account, amount, description))
        
        cursor.execute("""
            INSERT INTO journal_entry_lines (
                journal_entry_id, account_number, debit, credit, description
            ) VALUES (?, ?, 0, ?, ?)
        """, (journal_entry_id, deferred_account, amount, description))
        
        logger.info(f"Created journal entry {journal_entry_id} for Stripe payment")
        
    except Exception as e:
        logger.error(f"Error creating journal entry for Stripe payment: {str(e)}")
        # Don't fail the webhook if journal entry fails
        pass

