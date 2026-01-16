import sqlite3
import json
from datetime import datetime, timedelta

conn = sqlite3.connect('kamioi.db')
cursor = conn.cursor()

# Create test transactions with different statuses and tickers
test_transactions = [
    {
        'user_id': 1760806059546,
        'amount': 89.45,
        'merchant': 'Amazon REG 18',
        'category': 'Online Retail',
        'description': 'Amazon purchase',
        'date': '2025-01-01',
        'round_up': 1.00,
        'status': 'mapped',
        'ticker': 'AMZN',
        'total_debit': 1.25,
        'fee': 0.00,
    },
    {
        'user_id': 1760806059546,
        'amount': 29.99,
        'merchant': 'Estee Lauder # 37895 New York',
        'category': 'Beauty',
        'description': 'Estee Lauder purchase',
        'date': '2025-01-01',
        'round_up': 1.00,
        'status': 'mapped',
        'ticker': 'EL',
        'total_debit': 1.25,
        'fee': 0.00,
    },
    {
        'user_id': 1760806059546,
        'amount': 45.00,
        'merchant': 'UNKNOWN MERCHANT DEF',
        'category': 'Unknown',
        'description': 'Unknown merchant',
        'date': '2025-01-02',
        'round_up': 1.00,
        'status': 'pending',
        'ticker': None,
        'total_debit': 1.25,
        'fee': 0.00,
    },
    {
        'user_id': 1760806059546,
        'amount': 78.90,
        'merchant': 'Whole Foods Market TERMINALID 88589',
        'category': 'Grocery',
        'description': 'Whole Foods purchase',
        'date': '2025-01-02',
        'round_up': 1.00,
        'status': 'mapped',
        'ticker': 'WMT',
        'total_debit': 1.25,
        'fee': 0.00,
    },
    {
        'user_id': 1760806059546,
        'amount': 234.56,
        'merchant': 'OBSCURE FINANCIAL SERVICE',
        'category': 'Unknown',
        'description': 'Financial service',
        'date': '2025-01-03',
        'round_up': 1.00,
        'status': 'pending',
        'ticker': None,
        'total_debit': 1.25,
        'fee': 0.00,
    },
    {
        'user_id': 1760806059546,
        'amount': 45.67,
        'merchant': 'Target STORE 1634',
        'category': 'General Merchandise',
        'description': 'Target purchase',
        'date': '2025-01-03',
        'round_up': 1.00,
        'status': 'mapped',
        'ticker': 'TGT',
        'total_debit': 1.25,
        'fee': 0.00,
    }
]

# Insert test transactions
for transaction in test_transactions:
    cursor.execute('''
        INSERT INTO transactions 
        (user_id, amount, merchant, category, description, date, round_up, status, ticker, total_debit, fee)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        transaction['user_id'],
        transaction['amount'],
        transaction['merchant'],
        transaction['category'],
        transaction['description'],
        transaction['date'],
        transaction['round_up'],
        transaction['status'],
        transaction['ticker'],
        transaction['total_debit'],
        transaction['fee']
    ))

conn.commit()
conn.close()

print('SUCCESS: Created 6 test transactions with mixed statuses and tickers')
print('- 3 mapped transactions with tickers (AMZN, EL, WMT, TGT)')
print('- 3 pending transactions without tickers')
print('Now refresh the admin page to see the Investment column working!')
