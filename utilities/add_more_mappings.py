import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')

def add_additional_mappings():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Additional mappings for common merchants from the CSV
    additional_mappings = [
        ('AMAZON MARKETPLACE', 'AMZN', 'Online Shopping', 0.95, 'approved'),
        ('AMZN Mktp', 'AMZN', 'Online Shopping', 0.93, 'approved'),
        ('AMAZON WEB SERVICES', 'AMZN', 'Technology', 0.94, 'approved'),
        ('CHIPOTLE', 'CMG', 'Food & Dining', 0.90, 'approved'),
        ('UBER', 'UBER', 'Transportation', 0.88, 'approved'),
        ('ADOBE', 'ADBE', 'Technology', 0.92, 'approved'),
        ('GOOGLE PLAY', 'GOOGL', 'Technology', 0.89, 'approved'),
        ('APPLE.COM', 'AAPL', 'Technology', 0.96, 'approved'),
        ('COSTCO', 'COST', 'Groceries', 0.87, 'approved'),
        ('WHOLE FOODS', 'AMZN', 'Groceries', 0.85, 'approved'),
        ('TARGET', 'TGT', 'Retail', 0.88, 'approved'),
        ('STEAM', 'VALVE', 'Gaming', 0.82, 'approved')
    ]
    
    # Insert additional mappings
    for merchant, ticker, category, confidence, status in additional_mappings:
        cursor.execute("""
            INSERT OR IGNORE INTO llm_mappings (merchant_name, ticker_symbol, category, confidence, status, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        """, (merchant, ticker, category, confidence, status))
    
    conn.commit()
    conn.close()
    
    print(f"Added {len(additional_mappings)} additional mappings")
    print("New mappings:")
    for merchant, ticker, category, confidence, status in additional_mappings:
        print(f"  {merchant} -> {ticker} ({category}) - {confidence*100:.0f}% confidence")

if __name__ == "__main__":
    add_additional_mappings()
