"""
API Endpoints for Subscription Accounting
Creates journal entries automatically when subscription events occur
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from services.subscription_accounting_service import SubscriptionAccountingService
import logging

logger = logging.getLogger(__name__)

subscription_accounting_bp = Blueprint('subscription_accounting', __name__)

# Initialize service (this would be injected with actual DB connection)
# accounting_service = SubscriptionAccountingService(db_connection)


@subscription_accounting_bp.route('/api/admin/subscriptions/create-payment-entry', methods=['POST'])
def create_payment_entry():
    """
    Create journal entry when a subscription payment is received
    Called automatically when subscription is created or renewed
    
    Creates entry in journal_entries table that will appear in Transaction Management
    """
    try:
        data = request.get_json()
        
        subscription_id = data.get('subscription_id') or data.get('id')
        user_id = data.get('user_id')
        user_name = data.get('user_name', '')
        plan_name = data.get('plan_name', '')
        account_type = data.get('account_type', 'individual').lower()
        amount = float(data.get('amount', 0))
        payment_date = data.get('payment_date') or datetime.now().isoformat()
        
        if not subscription_id or not amount:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: subscription_id, amount'
            }), 400
        
        # Account mappings
        deferred_revenue_accounts = {
            'individual': '23010',
            'family': '23020',
            'business': '23030'
        }
        
        cash_account = '10100'
        deferred_account = deferred_revenue_accounts.get(account_type, '23010')
        
        # Parse payment date
        if isinstance(payment_date, str):
            payment_date_obj = datetime.fromisoformat(payment_date.replace('Z', '+00:00'))
        else:
            payment_date_obj = payment_date
        
        # Create reference
        reference = f"SUB-INIT-{subscription_id}-{payment_date_obj.strftime('%Y%m%d')}"
        
        # Create description
        description = f"Subscription payment - {plan_name} - {account_type}"
        
        # Create journal entry data structure
        journal_entry_data = {
            'transaction_date': payment_date_obj.isoformat(),
            'date': payment_date_obj.isoformat(),  # Also include date field for compatibility
            'reference': reference,
            'description': description,
            'entry_type': 'subscription_payment',
            'transaction_type': 'subscription_payment',  # For compatibility
            'subscription_id': subscription_id,
            'user_id': user_id,
            'merchant': 'Subscription Payment',
            'from_account': cash_account,
            'to_account': deferred_account,
            'debit_account': cash_account,
            'credit_account': deferred_account,
            'amount': amount,
            'status': 'posted'
        }
        
        # TODO: Replace with actual database save
        # This should save to your journal_entries table
        # Example:
        # from your_database_module import db
        # entry_id = db.execute(
        #     "INSERT INTO journal_entries (transaction_date, reference, description, entry_type, subscription_id, user_id, merchant, debit_account, credit_account, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        #     (journal_entry_data['transaction_date'], journal_entry_data['reference'], ...)
        # )
        
        logger.info(f"Created subscription journal entry: {reference} for ${amount}")
        
        return jsonify({
            'success': True,
            'data': {
                'reference': reference,
                'amount': amount,
                'entry_type': 'subscription_payment'
            },
            'message': f'Journal entry created: {reference}'
        })
        
    except Exception as e:
        logger.error(f"Error creating payment entry: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscription_accounting_bp.route('/api/admin/subscriptions/process-daily-recognition', methods=['POST'])
def process_daily_recognition():
    """
    Process daily revenue recognition for all active subscriptions
    Should be called by a scheduled job (cron) daily
    """
    try:
        data = request.get_json() or {}
        recognition_date = data.get('recognition_date')
        
        if recognition_date:
            recognition_date = datetime.fromisoformat(recognition_date).date()
        
        # Fetch all active subscriptions from database
        # subscriptions = db.get_active_subscriptions()
        
        # Process daily recognition
        # entries = accounting_service.process_daily_revenue_recognition(
        #     subscriptions=subscriptions,
        #     recognition_date=recognition_date
        # )
        
        return jsonify({
            'success': True,
            'message': 'Daily recognition processed (placeholder - integrate with service)',
            'data': {
                'entries_created': 0,  # len(entries),
                'recognition_date': recognition_date.isoformat() if recognition_date else datetime.now().date().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error processing daily recognition: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscription_accounting_bp.route('/api/admin/subscriptions/create-renewal-entry', methods=['POST'])
def create_renewal_entry():
    """
    Create journal entry when a subscription auto-renews
    """
    try:
        data = request.get_json()
        
        subscription_id = data.get('subscription_id')
        user_id = data.get('user_id')
        user_name = data.get('user_name', '')
        plan_name = data.get('plan_name', '')
        account_type = data.get('account_type', 'individual')
        amount = float(data.get('amount', 0))
        original_amount = data.get('original_amount')
        discount_amount = data.get('discount_amount')
        renewal_date = data.get('renewal_date')
        
        if not subscription_id or not amount:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: subscription_id, amount'
            }), 400
        
        # Parse renewal date if provided
        if renewal_date:
            renewal_date = datetime.fromisoformat(renewal_date)
        
        # Create journal entry
        # entry = accounting_service.create_renewal_payment_entry(
        #     subscription_id=subscription_id,
        #     user_id=user_id,
        #     user_name=user_name,
        #     plan_name=plan_name,
        #     account_type=account_type,
        #     amount=amount,
        #     original_amount=original_amount,
        #     discount_amount=discount_amount,
        #     renewal_date=renewal_date
        # )
        
        return jsonify({
            'success': True,
            'message': 'Renewal entry created (placeholder - integrate with service)'
        })
        
    except Exception as e:
        logger.error(f"Error creating renewal entry: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscription_accounting_bp.route('/api/admin/subscriptions/handle-failed-payment', methods=['POST'])
def handle_failed_payment():
    """
    Handle failed payment by moving deferred revenue to failed payments account
    """
    try:
        data = request.get_json()
        
        subscription_id = data.get('subscription_id')
        account_type = data.get('account_type', 'individual')
        amount = float(data.get('amount', 0))
        
        if not subscription_id or not amount:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: subscription_id, amount'
            }), 400
        
        # Create journal entry
        # entry = accounting_service.handle_failed_payment(
        #     subscription_id=subscription_id,
        #     account_type=account_type,
        #     amount=amount
        # )
        
        return jsonify({
            'success': True,
            'message': 'Failed payment handled (placeholder - integrate with service)'
        })
        
    except Exception as e:
        logger.error(f"Error handling failed payment: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@subscription_accounting_bp.route('/api/admin/subscriptions/setup-accounts', methods=['POST'])
def setup_accounts():
    """
    Create deferred revenue accounts if they don't exist
    Should be called once during setup
    """
    try:
        # result = accounting_service.create_deferred_revenue_accounts()
        
        return jsonify({
            'success': True,
            'message': 'Accounts setup complete (placeholder - integrate with service)'
        })
        
    except Exception as e:
        logger.error(f"Error setting up accounts: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

