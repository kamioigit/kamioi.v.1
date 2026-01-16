"""
LLM Data Assets Manager - Proper Accounting Implementation
Integrates with existing GL accounts and follows ASC 350/IAS 38 standards
"""

import sqlite3
import json
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple

class LLMAssetManager:
    def __init__(self, db_path: str = 'kamioi.db'):
        self.db_path = db_path
        
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def get_asset_cost_basis(self, asset_id: int) -> Dict[str, Decimal]:
        """Get cost basis from actual GL account balances"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get the asset
        cursor.execute('SELECT asset_name, development_start_date, production_ready_date FROM llm_assets WHERE id = ?', (asset_id,))
        asset = cursor.fetchone()
        if not asset:
            conn.close()
            return {}
        
        asset_name, dev_start, prod_ready = asset
        
        # Get cost mapping
        cursor.execute('SELECT cost_type, gl_account FROM llm_cost_mapping WHERE capitalizable = TRUE')
        cost_mapping = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get actual costs from GL accounts
        cost_basis = {}
        for cost_type, gl_account in cost_mapping.items():
            cursor.execute('''
                SELECT COALESCE(SUM(balance), 0) 
                FROM account_balances 
                WHERE account_number = ?
            ''', (gl_account,))
            balance = cursor.fetchone()[0]
            cost_basis[cost_type] = Decimal(str(balance))
        
        conn.close()
        return cost_basis
    
    def calculate_economic_value(self, asset_id: int) -> Decimal:
        """Calculate fair value based on business outcomes"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get business metrics from your existing data
        cursor.execute('SELECT COUNT(*) FROM llm_mappings')
        total_transactions = cursor.fetchone()[0]
        
        # Calculate per-transaction value based on your business model
        # These should be calculated from actual business data
        churn_reduction_value = Decimal('0.025')  # $0.025 per transaction from churn reduction
        api_monetization_value = Decimal('0.020')  # $0.020 per transaction from API revenue
        investment_trigger_value = Decimal('0.027')  # $0.027 per transaction from investment fees
        
        per_transaction_value = churn_reduction_value + api_monetization_value + investment_trigger_value
        economic_value = Decimal(str(total_transactions)) * per_transaction_value
        
        conn.close()
        return economic_value
    
    def calculate_amortized_value(self, asset_id: int, as_of_date: datetime = None) -> Decimal:
        """Calculate amortized value using straight-line method"""
        if as_of_date is None:
            as_of_date = datetime.now()
            
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get asset details
        cursor.execute('''
            SELECT development_start_date, production_ready_date, useful_life_months 
            FROM llm_assets WHERE id = ?
        ''', (asset_id,))
        asset = cursor.fetchone()
        
        if not asset:
            conn.close()
            return Decimal('0')
        
        dev_start, prod_ready, useful_life = asset
        
        # Use production ready date or development start date
        start_date = datetime.strptime(prod_ready, '%Y-%m-%d') if prod_ready else datetime.strptime(dev_start, '%Y-%m-%d')
        
        # Calculate months elapsed
        months_elapsed = (as_of_date.year - start_date.year) * 12 + (as_of_date.month - start_date.month)
        months_elapsed = max(0, months_elapsed)
        
        # Get cost basis
        cost_basis = sum(self.get_asset_cost_basis(asset_id).values())
        
        # Calculate amortization
        monthly_amortization = cost_basis / useful_life
        total_amortized = monthly_amortization * months_elapsed
        remaining_value = max(Decimal('0'), cost_basis - total_amortized)
        
        conn.close()
        return remaining_value
    
    def perform_impairment_test(self, asset_id: int) -> Dict[str, Decimal]:
        """Perform impairment test - write down if carrying value > recoverable amount"""
        cost_basis = sum(self.get_asset_cost_basis(asset_id).values())
        amortized_value = self.calculate_amortized_value(asset_id)
        economic_value = self.calculate_economic_value(asset_id)
        
        # Carrying value is the lower of cost basis and economic value
        carrying_value = min(cost_basis, economic_value)
        
        # Apply amortization
        final_carrying_value = min(carrying_value, amortized_value)
        
        # Impairment loss
        impairment_loss = max(Decimal('0'), amortized_value - final_carrying_value)
        
        return {
            'cost_basis': cost_basis,
            'amortized_value': amortized_value,
            'economic_value': economic_value,
            'carrying_value': final_carrying_value,
            'impairment_loss': impairment_loss
        }
    
    def get_asset_valuation(self, asset_id: int) -> Dict:
        """Get comprehensive asset valuation"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get asset info
        cursor.execute('SELECT * FROM llm_assets WHERE id = ?', (asset_id,))
        asset = cursor.fetchone()
        if not asset:
            conn.close()
            return {}
        
        # Get cost breakdown
        cost_basis = self.get_asset_cost_basis(asset_id)
        
        # Calculate values
        economic_value = self.calculate_economic_value(asset_id)
        impairment_data = self.perform_impairment_test(asset_id)
        
        conn.close()
        
        return {
            'asset_id': asset_id,
            'asset_name': asset[1],
            'asset_type': asset[2],
            'status': asset[5],
            'cost_basis': {
                'total': float(sum(cost_basis.values())),
                'breakdown': {k: float(v) for k, v in cost_basis.items()}
            },
            'economic_value': float(economic_value),
            'amortized_value': float(impairment_data['amortized_value']),
            'carrying_value': float(impairment_data['carrying_value']),
            'impairment_loss': float(impairment_data['impairment_loss']),
            'valuation_date': datetime.now().isoformat()
        }
    
    def get_all_assets_valuation(self) -> List[Dict]:
        """Get valuation for all LLM assets"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM llm_assets')
        asset_ids = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        
        return [self.get_asset_valuation(asset_id) for asset_id in asset_ids]
    
    def create_journal_entry_for_capitalization(self, asset_id: int) -> Dict:
        """Create journal entry to capitalize development costs"""
        cost_basis = self.get_asset_cost_basis(asset_id)
        total_cost = sum(cost_basis.values())
        
        # Create journal entry
        journal_entry = {
            'date': datetime.now().date().isoformat(),
            'description': f'Capitalize LLM development costs for asset {asset_id}',
            'entries': [
                {'account': '15200', 'debit': float(total_cost), 'credit': 0, 'description': 'LLM Data Assets'}
            ]
        }
        
        # Add credit entries for each cost type
        for cost_type, amount in cost_basis.items():
            if amount > 0:
                conn = self.get_connection()
                cursor = conn.cursor()
                cursor.execute('SELECT gl_account FROM llm_cost_mapping WHERE cost_type = ?', (cost_type,))
                gl_account = cursor.fetchone()[0]
                conn.close()
                
                journal_entry['entries'].append({
                    'account': gl_account,
                    'debit': 0,
                    'credit': float(amount),
                    'description': f'Capitalize {cost_type}'
                })
        
        return journal_entry
