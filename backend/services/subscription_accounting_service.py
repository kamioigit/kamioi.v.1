"""
Subscription Accounting Service
Automatically creates journal entries for subscription payments and revenue recognition
"""

from datetime import datetime, timedelta
from typing import Dict, Optional, List
import logging

logger = logging.getLogger(__name__)


class SubscriptionAccountingService:
    """Service for handling subscription-related accounting entries"""
    
    # Account mappings
    REVENUE_ACCOUNTS = {
        'individual': '40100',  # Revenue – Individual Accounts
        'family': '40200',      # Revenue – Family Accounts
        'business': '40300'     # Revenue – Business Accounts
    }
    
    DEFERRED_REVENUE_ACCOUNTS = {
        'individual': '23010',  # Deferred Revenue – Individual Accounts
        'family': '23020',      # Deferred Revenue – Family Accounts
        'business': '23030'     # Deferred Revenue – Business Accounts
    }
    
    FAILED_PAYMENT_ACCOUNT = '23040'  # Deferred Revenue – Failed Payments
    CASH_ACCOUNT = '10100'  # Cash – Bank of America (adjust if different)
    
    def __init__(self, db_connection):
        """Initialize service with database connection"""
        self.db = db_connection
    
    def create_deferred_revenue_accounts(self) -> bool:
        """
        Create the deferred revenue accounts if they don't exist
        Returns True if accounts were created or already exist
        """
        try:
            accounts_to_create = [
                {
                    'account_number': '23010',
                    'account_name': 'Deferred Revenue – Individual Accounts',
                    'account_type': 'liability',
                    'category': 'current_liabilities',
                    'normal_balance': 'credit'
                },
                {
                    'account_number': '23020',
                    'account_name': 'Deferred Revenue – Family Accounts',
                    'account_type': 'liability',
                    'category': 'current_liabilities',
                    'normal_balance': 'credit'
                },
                {
                    'account_number': '23030',
                    'account_name': 'Deferred Revenue – Business Accounts',
                    'account_type': 'liability',
                    'category': 'current_liabilities',
                    'normal_balance': 'credit'
                },
                {
                    'account_number': '23040',
                    'account_name': 'Deferred Revenue – Failed Payments',
                    'account_type': 'liability',
                    'category': 'current_liabilities',
                    'normal_balance': 'credit'
                }
            ]
            
            # Check if accounts exist and create if needed
            # This would be database-specific implementation
            # Example for SQL:
            # for account in accounts_to_create:
            #     if not self.db.account_exists(account['account_number']):
            #         self.db.create_account(account)
            
            logger.info("Deferred revenue accounts verified/created")
            return True
            
        except Exception as e:
            logger.error(f"Error creating deferred revenue accounts: {e}")
            return False
    
    def create_initial_payment_entry(
        self,
        subscription_id: int,
        user_id: int,
        user_name: str,
        plan_name: str,
        account_type: str,
        amount: float,
        original_amount: Optional[float] = None,
        discount_amount: Optional[float] = None,
        payment_date: Optional[datetime] = None
    ) -> Optional[Dict]:
        """
        Create journal entry for initial subscription payment
        
        Entry: DR Cash / CR Deferred Revenue
        """
        try:
            payment_date = payment_date or datetime.now()
            net_amount = amount  # Already discounted if discounts were applied
            
            # Get account numbers
            cash_account = self.CASH_ACCOUNT
            deferred_account = self.DEFERRED_REVENUE_ACCOUNTS.get(account_type.lower())
            
            if not deferred_account:
                logger.error(f"Invalid account_type: {account_type}")
                return None
            
            # Create reference
            reference = f"SUB-INIT-{subscription_id}-{payment_date.strftime('%Y%m%d')}"
            
            # Create description
            discount_text = f" (Discounted from ${original_amount:.2f})" if original_amount and discount_amount else ""
            description = f"Subscription payment - {plan_name} - {account_type}{discount_text}"
            
            # Create journal entry
            journal_entry = {
                'transaction_date': payment_date.isoformat(),
                'reference': reference,
                'description': description,
                'entry_type': 'subscription_payment',
                'subscription_id': subscription_id,
                'user_id': user_id,
                'merchant': 'Subscription Payment',
                'debit_account': cash_account,
                'credit_account': deferred_account,
                'amount': net_amount,
                'status': 'posted',
                'metadata': {
                    'subscription_id': subscription_id,
                    'plan_name': plan_name,
                    'account_type': account_type,
                    'original_amount': original_amount,
                    'discount_amount': discount_amount,
                    'net_amount': net_amount
                }
            }
            
            # Save to database (implementation depends on your DB setup)
            # entry_id = self.db.create_journal_entry(journal_entry)
            # journal_entry['id'] = entry_id
            
            logger.info(f"Created initial payment entry: {reference} for ${net_amount}")
            return journal_entry
            
        except Exception as e:
            logger.error(f"Error creating initial payment entry: {e}")
            return None
    
    def create_renewal_payment_entry(
        self,
        subscription_id: int,
        user_id: int,
        user_name: str,
        plan_name: str,
        account_type: str,
        amount: float,
        original_amount: Optional[float] = None,
        discount_amount: Optional[float] = None,
        renewal_date: Optional[datetime] = None
    ) -> Optional[Dict]:
        """
        Create journal entry for subscription renewal payment
        
        Entry: DR Cash / CR Deferred Revenue
        """
        try:
            renewal_date = renewal_date or datetime.now()
            net_amount = amount
            
            # Get account numbers
            cash_account = self.CASH_ACCOUNT
            deferred_account = self.DEFERRED_REVENUE_ACCOUNTS.get(account_type.lower())
            
            if not deferred_account:
                logger.error(f"Invalid account_type: {account_type}")
                return None
            
            # Create reference
            reference = f"SUB-RENEW-{subscription_id}-{renewal_date.strftime('%Y%m%d')}"
            
            # Create description
            discount_text = f" (Discounted from ${original_amount:.2f})" if original_amount and discount_amount else ""
            description = f"Subscription renewal - {plan_name} - {account_type}{discount_text}"
            
            # Create journal entry
            journal_entry = {
                'transaction_date': renewal_date.isoformat(),
                'reference': reference,
                'description': description,
                'entry_type': 'subscription_renewal',
                'subscription_id': subscription_id,
                'user_id': user_id,
                'merchant': 'Subscription Renewal',
                'debit_account': cash_account,
                'credit_account': deferred_account,
                'amount': net_amount,
                'status': 'posted',
                'metadata': {
                    'subscription_id': subscription_id,
                    'plan_name': plan_name,
                    'account_type': account_type,
                    'original_amount': original_amount,
                    'discount_amount': discount_amount,
                    'net_amount': net_amount
                }
            }
            
            logger.info(f"Created renewal payment entry: {reference} for ${net_amount}")
            return journal_entry
            
        except Exception as e:
            logger.error(f"Error creating renewal payment entry: {e}")
            return None
    
    def calculate_daily_recognition_amount(
        self,
        total_amount: float,
        start_date: datetime,
        end_date: datetime
    ) -> float:
        """
        Calculate daily revenue recognition amount
        Handles partial periods (starts/ends mid-month)
        """
        try:
            # Calculate total days in subscription period
            total_days = (end_date - start_date).days + 1  # Inclusive
            
            if total_days <= 0:
                logger.warning(f"Invalid date range: {start_date} to {end_date}")
                return 0.0
            
            # Calculate daily rate
            daily_rate = total_amount / total_days
            
            return round(daily_rate, 4)  # Round to 4 decimal places
            
        except Exception as e:
            logger.error(f"Error calculating daily recognition amount: {e}")
            return 0.0
    
    def create_daily_recognition_entry(
        self,
        subscription_id: int,
        account_type: str,
        daily_amount: float,
        recognition_date: datetime,
        day_number: int,
        total_days: int,
        plan_name: str
    ) -> Optional[Dict]:
        """
        Create journal entry for daily revenue recognition
        
        Entry: DR Deferred Revenue / CR Revenue
        """
        try:
            # Get account numbers
            deferred_account = self.DEFERRED_REVENUE_ACCOUNTS.get(account_type.lower())
            revenue_account = self.REVENUE_ACCOUNTS.get(account_type.lower())
            
            if not deferred_account or not revenue_account:
                logger.error(f"Invalid account_type: {account_type}")
                return None
            
            # Create reference
            reference = f"SUB-REV-{subscription_id}-{recognition_date.strftime('%Y%m%d')}"
            
            # Create description
            description = f"Daily revenue recognition - {plan_name} - Day {day_number} of {total_days}"
            
            # Create journal entry
            journal_entry = {
                'transaction_date': recognition_date.isoformat(),
                'reference': reference,
                'description': description,
                'entry_type': 'daily_recognition',
                'subscription_id': subscription_id,
                'debit_account': deferred_account,
                'credit_account': revenue_account,
                'amount': daily_amount,
                'status': 'posted',
                'metadata': {
                    'subscription_id': subscription_id,
                    'day_number': day_number,
                    'total_days': total_days,
                    'plan_name': plan_name
                }
            }
            
            return journal_entry
            
        except Exception as e:
            logger.error(f"Error creating daily recognition entry: {e}")
            return None
    
    def process_daily_revenue_recognition(
        self,
        subscriptions: List[Dict],
        recognition_date: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Process daily revenue recognition for all active subscriptions
        
        Returns list of created journal entries
        """
        recognition_date = recognition_date or datetime.now().date()
        created_entries = []
        
        try:
            for subscription in subscriptions:
                # Only process active subscriptions
                if subscription.get('status') != 'active':
                    continue
                
                subscription_id = subscription.get('id')
                account_type = subscription.get('account_type', '').lower()
                amount = float(subscription.get('amount', 0))
                start_date = datetime.fromisoformat(subscription.get('subscription_start_date')) if isinstance(subscription.get('subscription_start_date'), str) else subscription.get('subscription_start_date')
                end_date = datetime.fromisoformat(subscription.get('current_period_end')) if isinstance(subscription.get('current_period_end'), str) else subscription.get('current_period_end')
                plan_name = subscription.get('plan_name', 'Unknown Plan')
                
                # Check if already recognized today (idempotency)
                # This would check database for existing entry
                # if self.db.recognition_exists(subscription_id, recognition_date):
                #     continue
                
                # Calculate daily amount
                daily_amount = self.calculate_daily_recognition_amount(
                    amount, start_date, end_date
                )
                
                if daily_amount <= 0:
                    continue
                
                # Calculate day number
                day_number = (recognition_date - start_date.date()).days + 1
                total_days = (end_date.date() - start_date.date()).days + 1
                
                # Create entry
                entry = self.create_daily_recognition_entry(
                    subscription_id=subscription_id,
                    account_type=account_type,
                    daily_amount=daily_amount,
                    recognition_date=datetime.combine(recognition_date, datetime.min.time()),
                    day_number=day_number,
                    total_days=total_days,
                    plan_name=plan_name
                )
                
                if entry:
                    created_entries.append(entry)
            
            # Batch save entries (implementation depends on DB)
            # self.db.batch_create_journal_entries(created_entries)
            
            logger.info(f"Processed daily recognition: {len(created_entries)} entries created")
            return created_entries
            
        except Exception as e:
            logger.error(f"Error processing daily revenue recognition: {e}")
            return []
    
    def handle_failed_payment(
        self,
        subscription_id: int,
        account_type: str,
        amount: float
    ) -> Optional[Dict]:
        """
        Handle failed payment by moving deferred revenue to failed payments account
        
        Entry: DR Deferred Revenue [Account Type] / CR Deferred Revenue – Failed Payments
        """
        try:
            deferred_account = self.DEFERRED_REVENUE_ACCOUNTS.get(account_type.lower())
            
            if not deferred_account:
                logger.error(f"Invalid account_type: {account_type}")
                return None
            
            # Create reference
            reference = f"SUB-FAIL-{subscription_id}-{datetime.now().strftime('%Y%m%d')}"
            
            # Create description
            description = f"Failed payment - Subscription {subscription_id} moved to failed payments"
            
            # Create journal entry
            journal_entry = {
                'transaction_date': datetime.now().isoformat(),
                'reference': reference,
                'description': description,
                'entry_type': 'failed_payment',
                'subscription_id': subscription_id,
                'debit_account': deferred_account,
                'credit_account': self.FAILED_PAYMENT_ACCOUNT,
                'amount': amount,
                'status': 'posted',
                'metadata': {
                    'subscription_id': subscription_id,
                    'account_type': account_type
                }
            }
            
            logger.info(f"Created failed payment entry: {reference} for ${amount}")
            return journal_entry
            
        except Exception as e:
            logger.error(f"Error handling failed payment: {e}")
            return None
    
    def handle_payment_recovery(
        self,
        subscription_id: int,
        amount: float
    ) -> Optional[Dict]:
        """
        Handle payment recovery when failed payment is retried and succeeds
        
        Entry: DR Cash / CR Deferred Revenue – Failed Payments
        """
        try:
            # Create reference
            reference = f"SUB-RECOV-{subscription_id}-{datetime.now().strftime('%Y%m%d')}"
            
            # Create description
            description = f"Payment recovery - Subscription {subscription_id}"
            
            # Create journal entry
            journal_entry = {
                'transaction_date': datetime.now().isoformat(),
                'reference': reference,
                'description': description,
                'entry_type': 'payment_recovery',
                'subscription_id': subscription_id,
                'debit_account': self.CASH_ACCOUNT,
                'credit_account': self.FAILED_PAYMENT_ACCOUNT,
                'amount': amount,
                'status': 'posted',
                'metadata': {
                    'subscription_id': subscription_id
                }
            }
            
            logger.info(f"Created payment recovery entry: {reference} for ${amount}")
            return journal_entry
            
        except Exception as e:
            logger.error(f"Error handling payment recovery: {e}")
            return None
    
    def handle_cancellation_mid_period(
        self,
        subscription_id: int,
        account_type: str,
        remaining_deferred: float,
        cancellation_date: datetime
    ) -> Optional[Dict]:
        """
        Handle cancellation mid-period - recognize remaining deferred revenue immediately
        
        Entry: DR Deferred Revenue [Account Type] / CR Revenue [Account Type]
        """
        try:
            deferred_account = self.DEFERRED_REVENUE_ACCOUNTS.get(account_type.lower())
            revenue_account = self.REVENUE_ACCOUNTS.get(account_type.lower())
            
            if not deferred_account or not revenue_account:
                logger.error(f"Invalid account_type: {account_type}")
                return None
            
            if remaining_deferred <= 0:
                return None  # Nothing to recognize
            
            # Create reference
            reference = f"SUB-CANCEL-{subscription_id}-{cancellation_date.strftime('%Y%m%d')}"
            
            # Create description
            description = f"Cancellation - Immediate revenue recognition for remaining deferred amount"
            
            # Create journal entry
            journal_entry = {
                'transaction_date': cancellation_date.isoformat(),
                'reference': reference,
                'description': description,
                'entry_type': 'cancellation_recognition',
                'subscription_id': subscription_id,
                'debit_account': deferred_account,
                'credit_account': revenue_account,
                'amount': remaining_deferred,
                'status': 'posted',
                'metadata': {
                    'subscription_id': subscription_id,
                    'account_type': account_type,
                    'cancellation_date': cancellation_date.isoformat()
                }
            }
            
            logger.info(f"Created cancellation recognition entry: {reference} for ${remaining_deferred}")
            return journal_entry
            
        except Exception as e:
            logger.error(f"Error handling cancellation mid-period: {e}")
            return None


