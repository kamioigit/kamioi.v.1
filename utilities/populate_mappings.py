import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')

def populate_sample_mappings():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Sample mappings for common merchants
    sample_mappings = [
        ('STARBUCKS', 'SBUX', 'Food & Dining', 0.95, 'approved'),
        ('AMAZON', 'AMZN', 'Online Shopping', 0.98, 'approved'),
        ('NETFLIX', 'NFLX', 'Entertainment', 0.92, 'approved'),
        ('WALMART', 'WMT', 'Groceries', 0.90, 'approved'),
        ('MCDONALDS', 'MCD', 'Food & Dining', 0.88, 'approved'),
        ('APPLE', 'AAPL', 'Technology', 0.94, 'approved'),
        ('GOOGLE', 'GOOGL', 'Technology', 0.96, 'approved'),
        ('TESLA', 'TSLA', 'Automotive', 0.89, 'approved'),
        ('MICROSOFT', 'MSFT', 'Technology', 0.93, 'approved'),
        ('COSTCO', 'COST', 'Groceries', 0.87, 'approved')
    ]
    
    # Clear existing mappings
    cursor.execute("DELETE FROM llm_mappings")
    
    # Insert sample mappings
    for merchant, ticker, category, confidence, status in sample_mappings:
        cursor.execute("""
            INSERT INTO llm_mappings (merchant_name, ticker_symbol, category, confidence, status, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        """, (merchant, ticker, category, confidence, status))
    
    conn.commit()
    conn.close()
    
    print(f"Populated {len(sample_mappings)} sample mappings")
    print("Sample mappings:")
    for merchant, ticker, category, confidence, status in sample_mappings:
        print(f"  {merchant} -> {ticker} ({category}) - {confidence*100:.0f}% confidence")

if __name__ == "__main__":
    populate_sample_mappings()
