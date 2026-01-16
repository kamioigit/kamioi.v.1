"""
Migrate only the large llm_mappings table with optimized settings
"""
import sys
import os
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import psycopg2
    from psycopg2.extras import execute_batch
    from config import DatabaseConfig
except ImportError as e:
    print(f"Error: {e}")
    sys.exit(1)

def migrate_llm_mappings_only():
    """Migrate only llm_mappings table with optimized settings"""
    print("=" * 60)
    print("Migrating llm_mappings table only (14.6M rows)")
    print("=" * 60)
    print()
    
    # Connect to SQLite
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), DatabaseConfig.SQLITE_DB_PATH)
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
    except:
        print("Failed to connect to PostgreSQL")
        return False
    
    # Optimize PostgreSQL for bulk insert
    postgres_cursor = postgres_conn.cursor()
    postgres_cursor.execute('SET synchronous_commit = OFF')  # Faster inserts
    postgres_cursor.execute("SET maintenance_work_mem = '256MB'")  # More memory for indexes
    
    # Get columns
    sqlite_cursor.execute('SELECT * FROM llm_mappings LIMIT 0')
    sqlite_columns = [desc[0] for desc in sqlite_cursor.description]
    
    postgres_cursor.execute('SELECT * FROM llm_mappings LIMIT 0')
    postgres_columns = [desc[0] for desc in postgres_cursor.description]
    
    common_columns = [col for col in sqlite_columns if col in postgres_columns]
    print(f"Migrating {len(common_columns)} columns: {', '.join(common_columns[:5])}...")
    
    # Batch size - larger for better performance
    batch_size = 5000
    columns_str = ', '.join(common_columns)
    placeholders = ', '.join(['%s'] * len(common_columns))
    
    rows_inserted = 0
    batch = []
    
    print("\nStarting migration (this will take 10-30 minutes)...\n")
    
    sqlite_cursor.execute(f'SELECT {columns_str} FROM llm_mappings')
    
    for row in sqlite_cursor.fetchall():
        row_tuple = tuple(None if (x == '' or x is None) else x for x in row)
        batch.append(row_tuple)
        
        if len(batch) >= batch_size:
            try:
                insert_query = f'INSERT INTO llm_mappings ({columns_str}) VALUES ({placeholders})'
                execute_batch(postgres_cursor, insert_query, batch, page_size=5000)
                rows_inserted += len(batch)
                postgres_conn.commit()
                batch = []
                print(f"Migrated: {rows_inserted:,}/{total_rows:,} rows ({rows_inserted*100//total_rows}%)", end='\r')
            except Exception as e:
                print(f"\nError at batch {rows_inserted//batch_size}: {str(e)[:100]}")
                postgres_conn.rollback()
                # Continue with next batch
                batch = []
    
    # Final batch
    if batch:
        try:
            insert_query = f'INSERT INTO llm_mappings ({columns_str}) VALUES ({placeholders})'
            execute_batch(postgres_cursor, insert_query, batch, page_size=5000)
            rows_inserted += len(batch)
            postgres_conn.commit()
        except Exception as e:
            print(f"\nError in final batch: {str(e)[:100]}")
            postgres_conn.rollback()
    
    # Reset settings
    postgres_cursor.execute('SET synchronous_commit = ON')
    postgres_conn.commit()
    
    print(f"\n\n[OK] Migration complete: {rows_inserted:,}/{total_rows:,} rows migrated")
    
    sqlite_conn.close()
    postgres_conn.close()
    
    return rows_inserted == total_rows

if __name__ == '__main__':
    import os
    os.environ['DB_TYPE'] = 'postgresql'
    success = migrate_llm_mappings_only()
    sys.exit(0 if success else 1)

