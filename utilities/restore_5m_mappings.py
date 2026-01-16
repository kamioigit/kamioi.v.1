import sqlite3
import os
import csv

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')
TRAINING_FILE = os.path.join(os.path.dirname(__file__), 'backend', 'training_exports', 'training_data_20251015_105739.csv')

def restore_mappings():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Restoring 5 million mappings from training data...")
    
    # Clear current test mappings
    cursor.execute("DELETE FROM llm_mappings WHERE source_type = 'admin'")
    
    # Load the largest training file
    if os.path.exists(TRAINING_FILE):
        print(f"Loading from: {TRAINING_FILE}")
        
        with open(TRAINING_FILE, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            count = 0
            for row in csv_reader:
                try:
                    # Insert mapping with proper structure
                    cursor.execute("""
                        INSERT INTO llm_mappings (
                            merchant_name, ticker_symbol, category, confidence, status, 
                            created_at, source_type, admin_id, auto_approved, admin_reviewed
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        row.get('merchant_name', ''),
                        row.get('ticker_symbol', ''),
                        row.get('category', ''),
                        float(row.get('confidence', 0.8)),
                        'approved',
                        row.get('created_at', '2025-10-15 10:57:39'),
                        'bulk_upload',
                        'system_restore',
                        1,  # auto_approved
                        1   # admin_reviewed
                    ))
                    
                    count += 1
                    if count % 100000 == 0:
                        print(f"Loaded {count:,} mappings...")
                        conn.commit()  # Commit in batches
                        
                except Exception as e:
                    print(f"Error processing row {count}: {e}")
                    continue
            
            conn.commit()
            print(f"Successfully restored {count:,} mappings!")
    else:
        print(f"Training file not found: {TRAINING_FILE}")
    
    # Verify the restore
    cursor.execute("SELECT COUNT(*) FROM llm_mappings")
    total_count = cursor.fetchone()[0]
    print(f"Total mappings in database: {total_count:,}")
    
    conn.close()

if __name__ == "__main__":
    restore_mappings()
