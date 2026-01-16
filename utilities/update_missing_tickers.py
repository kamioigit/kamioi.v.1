import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')

def update_missing_tickers():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Update missing tickers based on merchant/category
    ticker_updates = [
        ('DeepMind SA', 'GOOGL'),  # Google/Alphabet
        ('Adobe', 'ADBE'),         # Adobe
        ('Google Play STOREID 31866', 'GOOGL'),  # Google/Alphabet
        ('Dick\'s Sporting Goods STORE 3946', 'DKS'),  # Dick's Sporting Goods
        ('Walmart STN 24', 'WMT'), # Walmart
        ('WWW.NETFLIX.COM', 'NFLX'),  # Netflix
        ('Starbucks POS 53509', 'SBUX')  # Starbucks
    ]
    
    for merchant, ticker in ticker_updates:
        cursor.execute("""
            UPDATE transactions 
            SET ticker = ?
            WHERE user_id = 1760806059546 
            AND merchant = ?
            AND status = 'mapped'
            AND (ticker IS NULL OR ticker = '')
        """, (ticker, merchant))
        
        print(f"Updated {merchant} -> {ticker}")
    
    conn.commit()
    
    # Verify updates
    cursor.execute("""
        SELECT id, merchant, category, status, ticker
        FROM transactions 
        WHERE user_id = 1760806059546 
        AND status = 'mapped' 
        AND (ticker IS NULL OR ticker = '')
    """)
    
    remaining_missing = cursor.fetchall()
    
    print(f"\nRemaining mapped transactions without tickers: {len(remaining_missing)}")
    
    if remaining_missing:
        print("Still missing tickers:")
        for txn in remaining_missing:
            print(f"  - {txn[1]} ({txn[2]})")
    
    conn.close()
    print("\n✅ Ticker update complete!")

if __name__ == "__main__":
    update_missing_tickers()
