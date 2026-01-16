import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')

def check_existing_mappings():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check what mappings exist
    cursor.execute("SELECT COUNT(*) FROM llm_mappings")
    count = cursor.fetchone()[0]
    print(f"Current mappings in database: {count}")
    
    if count > 0:
        cursor.execute("SELECT merchant_name, ticker_symbol, category, confidence, status FROM llm_mappings LIMIT 10")
        mappings = cursor.fetchall()
        print("Existing mappings:")
        for mapping in mappings:
            print(f"  {mapping[0]} -> {mapping[1]} ({mapping[2]}) - {mapping[3]*100:.0f}% - {mapping[4]}")
    else:
        print("No mappings found - need to restore them")
    
    conn.close()

if __name__ == "__main__":
    check_existing_mappings()
