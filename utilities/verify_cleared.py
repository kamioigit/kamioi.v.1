import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')

def verify_cleared():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check total count
    cursor.execute("SELECT COUNT(*) FROM llm_mappings")
    total_count = cursor.fetchone()[0]
    print(f"Total mappings in database: {total_count}")
    
    conn.close()

if __name__ == "__main__":
    verify_cleared()
