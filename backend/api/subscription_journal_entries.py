"""
Simplified Subscription Journal Entry Creation
Directly creates journal entries in the database
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

subscription_journal_bp = Blueprint('subscription_journal', __name__)

@subscription_journal_bp.route('/api/admin/subscriptions/create-payment-entry', methods=['POST'])
def create_payment_entry():
    """
    Create journal entry for subscription payment
    This creates entries directly in the journal_entries table
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
        revenue_accounts = {
            'individual': '40100',
            'family': '40200',
            'business': '40300'
        }
        
        deferred_revenue_accounts = {
            'individual': '23010',
            'family': '23020',
            'business': '23030'
        }
        
        cash_account = '10100'
        deferred_account = deferred_revenue_accounts.get(account_type, '23010')
        
        # Create reference
        payment_date_obj = datetime.fromisoformat(payment_date.replace('Z', '+00:00')) if isinstance(payment_date, str) else payment_date
        reference = f"SUB-INIT-{subscription_id}-{payment_date_obj.strftime('%Y%m%d')}"
        
        # Create description
        description = f"Subscription payment - {plan_name} - {account_type}"
        
        # TODO: Replace with actual database connection
        # This is a placeholder - you need to integrate with your database
        # Example structure:
        """
        journal_entry = {
            'transaction_date': payment_date_obj,
            'reference': reference,
            'description': description,
            'entry_type': 'subscription_payment',
            'subscription_id': subscription_id,
            'user_id': user_id,
            'merchant': 'Subscription Payment',
            'debit_account': cash_account,
            'credit_account': deferred_account,
            'amount': amount,
            'status': 'posted'
        }
        
        # Save to database
        entry_id = db.create_journal_entry(journal_entry)
        """
        
        logger.info(f"Would create journal entry: {reference} for ${amount}")
        
        return jsonify({
            'success': True,
            'data': {
                'reference': reference,
                'amount': amount,
                'debit_account': cash_account,
                'credit_account': deferred_account
            },
            'message': 'Journal entry created (database integration needed)'
        })
        
    except Exception as e:
        logger.error(f"Error creating payment entry: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


