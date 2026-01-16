"""
LLM Data Assets Monthly Amortization Service
Automatically creates monthly journal entries for LLM asset amortization
Runs on the 1st of every month
"""

from datetime import datetime, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from llm_assets_manager import LLMAssetManager
import sqlite3
import time
import random
import logging

logger = logging.getLogger(__name__)

class LLMAmortizationService:
    def __init__(self):
        self.asset_manager = LLMAssetManager()
        self.amortization_expense_account = '67010'  # Amortization Expense
        self.llm_assets_account = '15200'  # LLM Data Assets
        
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect('kamioi.db')
    
    def create_monthly_amortization_entries(self, entry_date=None):
        """
        Create monthly amortization journal entries for all active LLM assets
        Should be called on the 1st of each month
        
        Args:
            entry_date: Date for the journal entry (defaults to today, should be 1st of month)
            
        Returns:
            List of created journal entry IDs
        """
        if entry_date is None:
            entry_date = datetime.now()
        
        # Ensure we're on the 1st of the month
        if entry_date.day != 1:
            logger.warning(f"Amortization should run on 1st of month, but date is {entry_date.strftime('%Y-%m-%d')}")
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        created_entries = []
        
        try:
            # Get all active LLM assets
            cursor.execute("""
                SELECT id, asset_name, development_start_date, production_ready_date, useful_life_months
                FROM llm_assets
                WHERE status = 'production'
            """)
            
            assets = cursor.fetchall()
            
            if not assets:
                logger.info("No active LLM assets found for amortization")
                conn.close()
                return []
            
            # Calculate total monthly amortization across all assets
            total_monthly_amortization = 0
            asset_amortizations = []
            
            for asset_id, asset_name, dev_start, prod_ready, useful_life in assets:
                # Calculate cost basis
                cost_basis = sum(self.asset_manager.get_asset_cost_basis(asset_id).values())
                
                if cost_basis <= 0 or useful_life <= 0:
                    logger.warning(f"Asset {asset_id} ({asset_name}) has invalid cost basis or useful life, skipping")
                    continue
                
                # Calculate monthly amortization (convert Decimal to float)
                monthly_amortization = float(cost_basis) / float(useful_life)
                total_monthly_amortization += monthly_amortization
                
                asset_amortizations.append({
                    'asset_id': asset_id,
                    'asset_name': asset_name,
                    'monthly_amortization': monthly_amortization
                })
            
            if total_monthly_amortization <= 0:
                logger.info("Total monthly amortization is zero, no entries to create")
                conn.close()
                return []
            
            # Create a single combined journal entry for all assets (or separate entries per asset)
            # Using combined entry for simplicity
            date_str = entry_date.strftime('%Y-%m-%d')
            reference = f"LLM-AMORT-{entry_date.strftime('%Y%m')}"
            
            # Create journal entry ID
            timestamp_ms = int(time.time() * 1000)
            random_suffix = random.randint(1000, 9999)
            journal_entry_id = f"JE-{timestamp_ms}-{random_suffix}"
            
            # Ensure ID is unique
            cursor.execute("SELECT id FROM journal_entries WHERE id = ?", (journal_entry_id,))
            attempts = 0
            while cursor.fetchone() and attempts < 10:
                timestamp_ms = int(time.time() * 1000)
                random_suffix = random.randint(1000, 9999)
                journal_entry_id = f"JE-{timestamp_ms}-{random_suffix}"
                cursor.execute("SELECT id FROM journal_entries WHERE id = ?", (journal_entry_id,))
                attempts += 1
            
            # Verify accounts exist
            cursor.execute("SELECT account_number FROM chart_of_accounts WHERE account_number IN (?, ?)", 
                          (self.amortization_expense_account, self.llm_assets_account))
            accounts = cursor.fetchall()
            if len(accounts) < 2:
                logger.error(f"Required accounts not found: {self.amortization_expense_account}, {self.llm_assets_account}")
                conn.close()
                return []
            
            # Create description with asset breakdown
            asset_names = ', '.join([a['asset_name'] for a in asset_amortizations])
            description = f"Monthly amortization - LLM Data Assets ({asset_names})"
            
            # Create journal entry header
            cursor.execute("""
                INSERT INTO journal_entries (
                    id, date, reference, description, location, department,
                    transaction_type, vendor_name, customer_name, amount,
                    from_account, to_account, status, created_at, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                journal_entry_id,
                date_str,
                reference,
                description,
                '',
                'LLM Center',
                'amortization',
                '',
                '',
                total_monthly_amortization,
                self.llm_assets_account,  # From account (credit - reducing asset)
                self.amortization_expense_account,  # To account (debit - expense)
                'posted',
                datetime.now().isoformat(),
                1  # System user
            ))
            
            # Create journal entry lines
            # DR Amortization Expense
            cursor.execute("""
                INSERT INTO journal_entry_lines (
                    journal_entry_id, account_code, debit, credit, description, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                journal_entry_id,
                self.amortization_expense_account,
                total_monthly_amortization,
                0,
                f"Monthly amortization expense for LLM Data Assets",
                datetime.now().isoformat()
            ))
            
            # CR LLM Data Assets (reducing the asset value via accumulated amortization)
            # Note: In standard accounting, we'd use a contra account (15100), but for simplicity
            # we're crediting the asset account directly to reduce carrying value
            cursor.execute("""
                INSERT INTO journal_entry_lines (
                    journal_entry_id, account_code, debit, credit, description, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                journal_entry_id,
                self.llm_assets_account,
                0,
                total_monthly_amortization,
                f"Accumulated amortization - LLM Data Assets (monthly)",
                datetime.now().isoformat()
            ))
            
            conn.commit()
            created_entries.append(journal_entry_id)
            
            logger.info(f"Created monthly amortization entry {journal_entry_id} for ${total_monthly_amortization:.2f}")
            logger.info(f"  - {len(asset_amortizations)} assets amortized")
            for asset in asset_amortizations:
                logger.info(f"    - {asset['asset_name']}: ${asset['monthly_amortization']:.2f}")
            
            conn.close()
            return created_entries
            
        except Exception as e:
            logger.error(f"Error creating monthly amortization entries: {str(e)}")
            conn.rollback()
            conn.close()
            return []

