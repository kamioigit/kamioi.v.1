# MX Bank Sync Placeholder System
# This simulates how the real MX integration will work

import requests
import json
from datetime import datetime, timedelta
import sqlite3
import time
import random
from alpaca_service import AlpacaService
from auto_mapping_pipeline import AutoMappingPipeline

class MXBankSyncPlaceholder:
    def __init__(self):
        self.alpaca = AlpacaService()
        self.mapping_pipeline = AutoMappingPipeline()
        
        # Simulate MX account funding
        self.escrow_balance = 1000.00  # Kamioi's ,000 escrow account
        self.fee_amount = 0.25  # Platform fee
        self.investment_amount = 1.00  # Stock investment amount
        
        # Initialize database tables
        self.init_database()
    
    def init_database(self):
        # Initialize database tables for MX integration
        conn = sqlite3.connect('kamioi.db')
        cur = conn.cursor()
        
        # User bank connections table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS user_bank_connections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                bank_name TEXT NOT NULL,
                account_type TEXT NOT NULL,
                account_number TEXT NOT NULL,
                connection_status TEXT DEFAULT 'active',
                last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Real-time transactions table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS real_time_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                transaction_id TEXT UNIQUE NOT NULL,
                merchant TEXT NOT NULL,
                amount REAL NOT NULL,
                date TIMESTAMP NOT NULL,
                category TEXT,
                description TEXT,
                processed BOOLEAN DEFAULT FALSE,
                stock_purchased TEXT,
                investment_amount REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # User debt tracking table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS user_debt_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                total_debt REAL DEFAULT 0.00,
                last_billed TIMESTAMP,
                next_billing_date TIMESTAMP,
                billing_frequency TEXT DEFAULT 'weekly',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Stock ownership table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS user_stock_ownership (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                ticker TEXT NOT NULL,
                shares REAL NOT NULL,
                average_price REAL NOT NULL,
                total_invested REAL NOT NULL,
                current_value REAL,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print('Database tables initialized for MX integration')
    
    def simulate_bank_connection(self, user_id, bank_name='Chase Bank'):
        # Simulate user connecting their bank account
        try:
            conn = sqlite3.connect('kamioi.db')
            cur = conn.cursor()
            
            # Add bank connection
            cur.execute('''
                INSERT INTO user_bank_connections 
                (user_id, bank_name, account_type, account_number, connection_status)
                VALUES (?, ?, 'checking', ?, 'active')
            ''', (user_id, bank_name, f'****{random.randint(1000, 9999)}'))
            
            # Initialize debt tracking
            cur.execute('''
                INSERT OR REPLACE INTO user_debt_tracking 
                (user_id, total_debt, next_billing_date, billing_frequency)
                VALUES (?, 0.00, ?, 'weekly')
            ''', (user_id, (datetime.now() + timedelta(days=7)).isoformat()))
            
            conn.commit()
            conn.close()
            
            print(f'User {user_id} connected {bank_name} account')
            return True
            
        except Exception as e:
            print(f'Error connecting bank: {e}')
            return False
    
    def simulate_real_time_transaction(self, user_id, merchant, amount, description=''):
        # Simulate a real-time transaction from MX webhook
        try:
            # Generate unique transaction ID
            transaction_id = f'txn_{int(time.time())}_{random.randint(1000, 9999)}'
            
            # Process transaction through LLM mapping
            mapping_result = self.mapping_pipeline.map_merchant(merchant)
            
            if mapping_result.confidence >= 0.70:  # Process if confidence >= 70%
                # Buy stock immediately
                stock_purchase_result = self.buy_stock_immediately(
                    user_id, mapping_result.ticker, mapping_result.merchant
                )
                
                if stock_purchase_result['success']:
                    # Record transaction
                    conn = sqlite3.connect('kamioi.db')
                    cur = conn.cursor()
                    
                    cur.execute('''
                        INSERT INTO real_time_transactions 
                        (user_id, transaction_id, merchant, amount, date, category, 
                         description, processed, stock_purchased, investment_amount)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        user_id, transaction_id, merchant, amount, 
                        datetime.now().isoformat(), mapping_result.category,
                        description, True, mapping_result.ticker, self.investment_amount
                    ))
                    
                    # Update user debt
                    cur.execute('''
                        UPDATE user_debt_tracking 
                        SET total_debt = total_debt + ?, updated_at = CURRENT_TIMESTAMP
                        WHERE user_id = ?
                    ''', (self.investment_amount + self.fee_amount, user_id))
                    
                    conn.commit()
                    conn.close()
                    
                    print(f'Processed: {merchant} -> {mapping_result.ticker} ()')
                    return {
                        'success': True,
                        'transaction_id': transaction_id,
                        'merchant': merchant,
                        'ticker': mapping_result.ticker,
                        'investment_amount': self.investment_amount,
                        'confidence': mapping_result.confidence
                    }
                else:
                    print(f'Stock purchase failed for {merchant}')
                    return {'success': False, 'error': 'Stock purchase failed'}
            else:
                print(f'Low confidence mapping for {merchant}: {mapping_result.confidence}')
                return {'success': False, 'error': 'Low confidence mapping'}
                
        except Exception as e:
            print(f'Error processing transaction: {e}')
            return {'success': False, 'error': str(e)}
    
    def buy_stock_immediately(self, user_id, ticker, merchant):
        # Buy stock immediately using escrow account
        try:
            # Check if we have enough escrow balance
            if self.escrow_balance < self.investment_amount:
                return {'success': False, 'error': 'Insufficient escrow balance'}
            
            # Buy stock via Alpaca
            accounts = self.alpaca.get_accounts()
            if not accounts:
                return {'success': False, 'error': 'No Alpaca accounts available'}
            
            account_id = accounts[0]['id']
            order_result = self.alpaca.buy_fractional_shares(
                account_id, ticker, self.investment_amount
            )
            
            if order_result:
                # Deduct from escrow balance
                self.escrow_balance -= self.investment_amount
                
                # Update user stock ownership
                self.update_user_stock_ownership(user_id, ticker, self.investment_amount)
                
                return {
                    'success': True,
                    'order_id': order_result.get('id'),
                    'ticker': ticker,
                    'amount': self.investment_amount,
                    'remaining_escrow': self.escrow_balance
                }
            else:
                return {'success': False, 'error': 'Alpaca order failed'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def update_user_stock_ownership(self, user_id, ticker, investment_amount):
        # Update user's stock ownership records
        try:
            conn = sqlite3.connect('kamioi.db')
            cur = conn.cursor()
            
            # Check if user already owns this stock
            cur.execute('''
                SELECT shares, total_invested FROM user_stock_ownership 
                WHERE user_id = ? AND ticker = ?
            ''', (user_id, ticker))
            
            existing = cur.fetchone()
            
            if existing:
                # Update existing position
                current_shares, current_invested = existing
                new_shares = current_shares + investment_amount
                new_invested = current_invested + investment_amount
                new_avg_price = new_invested / new_shares
                
                cur.execute('''
                    UPDATE user_stock_ownership 
                    SET shares = ?, total_invested = ?, average_price = ?, 
                        last_updated = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND ticker = ?
                ''', (new_shares, new_invested, new_avg_price, user_id, ticker))
            else:
                # Create new position
                cur.execute('''
                    INSERT INTO user_stock_ownership 
                    (user_id, ticker, shares, average_price, total_invested, current_value)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (user_id, ticker, investment_amount, 1.0, investment_amount, investment_amount))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f'Error updating stock ownership: {e}')
    
    def get_user_debt_summary(self, user_id):
        # Get user's current debt for billing
        try:
            conn = sqlite3.connect('kamioi.db')
            cur = conn.cursor()
            
            cur.execute('''
                SELECT total_debt, last_billed, next_billing_date 
                FROM user_debt_tracking WHERE user_id = ?
            ''', (user_id,))
            
            result = cur.fetchone()
            if result:
                return {
                    'user_id': user_id,
                    'total_debt': result[0],
                    'last_billed': result[1],
                    'next_billing_date': result[2]
                }
            else:
                return {'user_id': user_id, 'total_debt': 0.00}
                
        except Exception as e:
            print(f'Error getting debt summary: {e}')
            return {'user_id': user_id, 'total_debt': 0.00}
    
    def simulate_bulk_billing(self):
        # Simulate bulk billing process (2-3x per week)
        try:
            conn = sqlite3.connect('kamioi.db')
            cur = conn.cursor()
            
            # Get users with debt
            cur.execute('''
                SELECT user_id, total_debt FROM user_debt_tracking 
                WHERE total_debt > 0
            ''')
            
            users_with_debt = cur.fetchall()
            
            total_collected = 0
            for user_id, debt_amount in users_with_debt:
                # Simulate successful payment collection
                print(f'Collected  from user {user_id}')
                
                # Reset debt
                cur.execute('''
                    UPDATE user_debt_tracking 
                    SET total_debt = 0.00, last_billed = CURRENT_TIMESTAMP,
                        next_billing_date = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                ''', ((datetime.now() + timedelta(days=7)).isoformat(), user_id))
                
                total_collected += debt_amount
            
            # Replenish escrow account
            self.escrow_balance += total_collected
            print(f'Replenished escrow account: ')
            print(f'Total escrow balance: ')
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'users_billed': len(users_with_debt),
                'total_collected': total_collected,
                'new_escrow_balance': self.escrow_balance
            }
            
        except Exception as e:
            print(f'Error in bulk billing: {e}')
            return {'success': False, 'error': str(e)}
    
    def get_system_status(self):
        # Get overall system status
        try:
            conn = sqlite3.connect('kamioi.db')
            cur = conn.cursor()
            
            # Get stats
            cur.execute('SELECT COUNT(*) FROM user_bank_connections WHERE connection_status = \"active\"')
            active_connections = cur.fetchone()[0]
            
            cur.execute('SELECT COUNT(*) FROM real_time_transactions WHERE processed = 1')
            processed_transactions = cur.fetchone()[0]
            
            cur.execute('SELECT SUM(total_debt) FROM user_debt_tracking')
            total_debt = cur.fetchone()[0] or 0.00
            
            cur.execute('SELECT COUNT(DISTINCT user_id) FROM user_stock_ownership')
            users_with_stocks = cur.fetchone()[0]
            
            conn.close()
            
            return {
                'active_bank_connections': active_connections,
                'processed_transactions': processed_transactions,
                'total_user_debt': total_debt,
                'users_with_stocks': users_with_stocks,
                'escrow_balance': self.escrow_balance,
                'system_status': 'operational'
            }
            
        except Exception as e:
            return {'error': str(e)}

# Test the MX placeholder system
if __name__ == '__main__':
    mx_system = MXBankSyncPlaceholder()
    
    # Test user bank connection
    mx_system.simulate_bank_connection(1, 'Chase Bank')
    
    # Test real-time transactions
    transactions = [
        ('Starbucks', 4.50, 'Coffee purchase'),
        ('Amazon', 25.99, 'Online shopping'),
        ('McDonald\'s', 8.75, 'Lunch'),
        ('Netflix', 15.99, 'Subscription'),
        ('Target', 45.20, 'Grocery shopping')
    ]
    
    print('Processing real-time transactions...')
    for merchant, amount, description in transactions:
        result = mx_system.simulate_real_time_transaction(1, merchant, amount, description)
        if result['success']:
            ticker = result['ticker']
            investment = result['investment_amount']
            print(f'SUCCESS: {merchant} -> {ticker} ()')
        else:
            error_msg = result['error']
            print(f'FAILED: {merchant}: {error_msg}')
    
    # Check user debt
    debt = mx_system.get_user_debt_summary(1)
    print(f'User 1 debt: ')
    
    # Simulate bulk billing
    print('Simulating bulk billing...')
    billing_result = mx_system.simulate_bulk_billing()
    print(f'Billing result: {billing_result}')
    
    # System status
    status = mx_system.get_system_status()
    print(f'System Status: {status}')
