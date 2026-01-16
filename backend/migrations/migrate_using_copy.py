"""
Fast Migration using PostgreSQL COPY - 10-20x faster than INSERT
This exports SQLite to CSV then uses PostgreSQL COPY for bulk import
"""
import sys
import os
import sqlite3
import csv
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import psycopg2
    from config import DatabaseConfig
except ImportError as e:
    print(f"Error: {e}")
    sys.exit(1)

def migrate_using_copy():
    """Migrate llm_mappings using PostgreSQL COPY (fastest method)"""
    print("=" * 60)
    print("Fast Migration using PostgreSQL COPY")
    print("=" * 60)
    print()
    
    # Connect to SQLite
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), DatabaseConfig.SQLITE_DB_PATH)
    if not os.path.exists(sqlite_path):
        print(f"[ERROR] SQLite database not found: {sqlite_path}")
        return False
    
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_cursor = sqlite_conn.cursor()
    
    # Get row count
    sqlite_cursor.execute('SELECT COUNT(*) FROM llm_mappings')
    total_rows = sqlite_cursor.fetchone()[0]
    print(f"Total rows to migrate: {total_rows:,}")
    
    # Connect to PostgreSQL
    try:
        postgres_conn = psycopg2.connect(
            host='localhost',
            port=DatabaseConfig.POSTGRES_PORT,
            user=DatabaseConfig.POSTGRES_USER,
            password=DatabaseConfig.POSTGRES_PASSWORD,
            database=DatabaseConfig.POSTGRES_DB
        )
    except Exception as e:
        print(f"[ERROR] Failed to connect to PostgreSQL: {e}")
        return False
    
    # Get columns
    sqlite_cursor.execute('SELECT * FROM llm_mappings LIMIT 0')
    sqlite_columns = [desc[0] for desc in sqlite_cursor.description]
    
    postgres_cursor = postgres_conn.cursor()
    postgres_cursor.execute('SELECT * FROM llm_mappings LIMIT 0')
    postgres_columns = [desc[0] for desc in postgres_cursor.description]
    
    common_columns = [col for col in sqlite_columns if col in postgres_columns]
    print(f"Migrating {len(common_columns)} columns")
    print()
    
    # Step 1: Export SQLite to CSV
    print("Step 1: Exporting SQLite data to CSV...")
    csv_file = os.path.join(tempfile.gettempdir(), 'llm_mappings_export.csv')
    
    columns_str = ', '.join(common_columns)
    sqlite_cursor.execute(f'SELECT {columns_str} FROM llm_mappings')
    
    rows_exported = 0
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(common_columns)  # Header
        
        batch_size = 10000
        batch = []
        for row in sqlite_cursor.fetchall():
            # Convert None to empty string for CSV
            csv_row = ['' if x is None else str(x) for x in row]
            writer.writerow(csv_row)
            rows_exported += 1
            
            if rows_exported % batch_size == 0:
                print(f"  Exported {rows_exported:,}/{total_rows:,} rows...", end='\r')
    
    print(f"\n[OK] Exported {rows_exported:,} rows to CSV")
    print(f"CSV file: {csv_file}")
    print(f"File size: {os.path.getsize(csv_file) / (1024*1024):.1f} MB")
    print()
    
    # Step 2: Use PostgreSQL COPY to import
    print("Step 2: Importing to PostgreSQL using COPY...")
    
    # Optimize for bulk load
    postgres_cursor.execute("SET synchronous_commit = OFF")
    postgres_cursor.execute("SET maintenance_work_mem = '256MB'")
    
    try:
        # Use COPY FROM to import CSV
        with open(csv_file, 'r', encoding='utf-8') as f:
            # Skip header row
            next(f)
            
            # Create COPY command
            columns_str = ', '.join(common_columns)
            copy_sql = f"COPY llm_mappings ({columns_str}) FROM STDIN WITH (FORMAT csv, NULL '')"
            
            postgres_cursor.copy_expert(copy_sql, f)
            postgres_conn.commit()
        
        print("[OK] Import complete!")
        
        # Verify
        postgres_cursor.execute('SELECT COUNT(*) FROM llm_mappings')
        imported_count = postgres_cursor.fetchone()[0]
        print(f"[OK] Verified: {imported_count:,} rows in PostgreSQL")
        
        # Reset settings
        postgres_cursor.execute("SET synchronous_commit = ON")
        postgres_conn.commit()
        
        # Cleanup
        os.remove(csv_file)
        
        return imported_count == total_rows
        
    except Exception as e:
        print(f"[ERROR] COPY failed: {e}")
        postgres_conn.rollback()
        # Cleanup
        if os.path.exists(csv_file):
            os.remove(csv_file)
        return False
    finally:
        sqlite_conn.close()
        postgres_conn.close()

if __name__ == '__main__':
    import os
    os.environ['DB_TYPE'] = 'postgresql'
    success = migrate_using_copy()
    if success:
        print("\n[OK] Migration complete!")
    else:
        print("\n[ERROR] Migration failed")
    sys.exit(0 if success else 1)

