#!/usr/bin/env python3
"""
Verify that the database is completely clean
"""
import sqlite3
import os

def verify_clean_database():
    """Verify that all tables are empty"""
    db_path = 'backend/kamioi.db'
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        print("Verifying clean database state...")
        print("=" * 50)
        
        # Get list of all tables
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [row[0] for row in cur.fetchall()]
        
        all_empty = True
        
        for table in tables:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]
            status = "EMPTY" if count == 0 else f"{count} records"
            print(f"  {table:20} : {status}")
            
            if count > 0:
                all_empty = False
        
        conn.close()
        
        print("=" * 50)
        if all_empty:
            print("SUCCESS: Database is completely clean!")
            print("All tables are empty and ready for fresh testing.")
        else:
            print("WARNING: Some tables still contain data.")
        
        return all_empty
        
    except Exception as e:
        print(f"ERROR: Error verifying database: {e}")
        return False

if __name__ == "__main__":
    verify_clean_database()


