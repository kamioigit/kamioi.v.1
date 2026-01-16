import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')

def update_existing_transactions():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check what transactions we have
    cursor.execute("""
        SELECT id, merchant, category, status, ticker
        FROM transactions 
        WHERE user_id = 1760806059546 AND status = 'mapped'
        ORDER BY created_at DESC
        LIMIT 10
    """)
    
    transactions = cursor.fetchall()
    
    print("Current mapped transactions:")
    print("-" * 80)
    
    for txn in transactions:
        print(f"ID: {txn[0]}, Merchant: {txn[1]}, Category: {txn[2]}, Status: {txn[3]}, Ticker: {txn[4]}")
    
    # Update transactions with appropriate tickers based on category
    ticker_mapping = {
        'Online Retail': 'AMZN',
        'Beauty': 'EL',  # Estee Lauder
        'Grocery': 'WFM',  # Whole Foods (Amazon owned)
        'General Merchandise': 'TGT',  # Target
        'Off-Price Retail': 'BURL',  # Burlington
        'Warehouse Club': 'COST',  # Costco
        'Athletic Retail': 'FL',  # Foot Locker
        'Consumer Electronics & Digital': 'AAPL',  # Apple
        'Internet & Cable': 'CHTR',  # Charter Communications (Spectrum)
        'Transportation': 'UBER',  # Uber
        'Technology': 'AAPL',
        'Entertainment': 'NFLX',
        'Food & Dining': 'MCD',
        'Automotive': 'TSLA',
        'Healthcare': 'JNJ',
        'Finance': 'JPM',
        'Energy': 'XOM'
    }
    
    # Update transactions that don't have tickers
    for category, ticker in ticker_mapping.items():
        cursor.execute("""
            UPDATE transactions 
            SET ticker = ?
            WHERE user_id = 1760806059546 
            AND status = 'mapped' 
            AND category = ?
            AND (ticker IS NULL OR ticker = '')
        """, (ticker, category))
    
    # Special cases for specific merchants
    cursor.execute("""
        UPDATE transactions 
        SET ticker = 'AMZN'
        WHERE user_id = 1760806059546 
        AND status = 'mapped' 
        AND (merchant LIKE '%Amazon%' OR merchant LIKE '%AMAZON%')
    """)
    
    cursor.execute("""
        UPDATE transactions 
        SET ticker = 'EL'
        WHERE user_id = 1760806059546 
        AND status = 'mapped' 
        AND (merchant LIKE '%Estee%' OR merchant LIKE '%Lauder%')
    """)
    
    cursor.execute("""
        UPDATE transactions 
        SET ticker = 'WFM'
        WHERE user_id = 1760806059546 
        AND status = 'mapped' 
        AND (merchant LIKE '%Whole Foods%' OR merchant LIKE '%WHOLE FOODS%')
    """)
    
    conn.commit()
    
    # Check updated transactions
    cursor.execute("""
        SELECT id, merchant, category, status, ticker
        FROM transactions 
        WHERE user_id = 1760806059546 AND status = 'mapped'
        ORDER BY created_at DESC
        LIMIT 10
    """)
    
    updated_transactions = cursor.fetchall()
    
    print("\nUpdated transactions:")
    print("-" * 80)
    
    for txn in updated_transactions:
        print(f"ID: {txn[0]}, Merchant: {txn[1]}, Category: {txn[2]}, Status: {txn[3]}, Ticker: {txn[4]}")
    
    conn.close()
    print(f"\nUpdated {len(updated_transactions)} transactions with ticker symbols!")

if __name__ == "__main__":
    update_existing_transactions()
