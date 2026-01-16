"""
Migrate only the small tables (skip llm_mappings for now)
This allows you to start using PostgreSQL immediately
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

def migrate_small_tables():
    """Migrate all tables EXCEPT llm_mappings"""
    print("=" * 60)
    print("Migrating Small Tables (Skipping llm_mappings)")
    print("=" * 60)
    print()
    
    # Connect to SQLite
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), DatabaseConfig.SQLITE_DB_PATH)
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_cursor = sqlite_conn.cursor()
    
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
        print(f"[ERROR] Failed to connect: {e}")
        return False
    
    postgres_cursor = postgres_conn.cursor()
    
    # Tables to migrate (excluding llm_mappings)
    tables = [
        'transactions',
        'subscription_plans',
        'user_subscriptions',
        'renewal_queue',
        'promo_codes'
    ]
    
    total_migrated = 0
    
    for table_name in tables:
        try:
            # Get row count
            sqlite_cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
            total_rows = sqlite_cursor.fetchone()[0]
            
            if total_rows == 0:
                print(f"[SKIP] {table_name} (empty)")
                continue
            
            print(f"[MIGRATE] {table_name} ({total_rows:,} rows)...")
            
            # Get columns
            sqlite_cursor.execute(f'SELECT * FROM {table_name} LIMIT 0')
            sqlite_columns = [desc[0] for desc in sqlite_cursor.description]
            
            postgres_cursor.execute(f'SELECT * FROM {table_name} LIMIT 0')
            postgres_columns = [desc[0] for desc in postgres_cursor.description]
            
            common_columns = [col for col in sqlite_columns if col in postgres_columns]
            
            # Get data
            columns_str = ', '.join(common_columns)
            sqlite_cursor.execute(f'SELECT {columns_str} FROM {table_name}')
            
            # Insert
            placeholders = ', '.join(['%s'] * len(common_columns))
            batch = []
            
            for row in sqlite_cursor.fetchall():
                row_tuple = tuple(None if (x == '' or x is None) else x for x in row)
                batch.append(row_tuple)
            
            if batch:
                insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})'
                execute_batch(postgres_cursor, insert_query, batch)
                postgres_conn.commit()
                total_migrated += len(batch)
                print(f"[OK] Migrated {len(batch):,} rows")
            
        except Exception as e:
            print(f"[ERROR] {table_name}: {e}")
            postgres_conn.rollback()
    
    print(f"\n[OK] Migrated {total_migrated:,} rows from small tables")
    print("\nNote: llm_mappings table skipped. You can migrate it later.")
    print("Your application can now use PostgreSQL!")
    
    sqlite_conn.close()
    postgres_conn.close()
    
    return True

if __name__ == '__main__':
    import os
    os.environ['DB_TYPE'] = 'postgresql'
    migrate_small_tables()

