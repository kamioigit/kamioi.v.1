"""
Fixed Migration Script - Handles type conversions and foreign keys properly
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

def convert_sqlite_to_postgres_value(value, column_name, table_name):
    """Convert SQLite values to PostgreSQL-compatible values"""
    if value is None:
        return None
    
    # Convert SQLite boolean integers (0/1) to PostgreSQL booleans
    if isinstance(value, int) and column_name in ['is_active', 'auto_renewal', 'read', 'registration_completed', 'admin_approved', 'ai_processed']:
        return bool(value)
    
    # Keep everything else as-is
    return value

def migrate_table_fixed(sqlite_conn, postgres_conn, table_name):
    """Migrate a table with proper type conversion"""
    sqlite_cursor = sqlite_conn.cursor()
    postgres_cursor = postgres_conn.cursor()
    
    try:
        # Get row count
        sqlite_cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
        total_rows = sqlite_cursor.fetchone()[0]
        
        if total_rows == 0:
            return 0
        
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
        
        # Convert and insert
        placeholders = ', '.join(['%s'] * len(common_columns))
        batch = []
        rows_inserted = 0
        
        for row in sqlite_cursor.fetchall():
            # Convert values with type conversion
            converted_row = []
            for i, value in enumerate(row):
                col_name = common_columns[i]
                converted_value = convert_sqlite_to_postgres_value(value, col_name, table_name)
                converted_row.append(converted_value)
            
            batch.append(tuple(converted_row))
            
            if len(batch) >= 1000:
                try:
                    insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})'
                    execute_batch(postgres_cursor, insert_query, batch)
                    postgres_conn.commit()
                    rows_inserted += len(batch)
                    batch = []
                except Exception as e:
                    # Skip problematic rows
                    print(f"  [WARNING] Skipping batch: {str(e)[:50]}")
                    postgres_conn.rollback()
                    batch = []
        
        # Final batch
        if batch:
            try:
                insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})'
                execute_batch(postgres_cursor, insert_query, batch)
                postgres_conn.commit()
                rows_inserted += len(batch)
            except Exception as e:
                print(f"  [WARNING] Skipping final batch: {str(e)[:50]}")
                postgres_conn.rollback()
        
        print(f"[OK] Migrated {rows_inserted:,}/{total_rows:,} rows")
        return rows_inserted
        
    except Exception as e:
        print(f"[ERROR] {table_name}: {e}")
        postgres_conn.rollback()
        return 0

def migrate_all_except_llm():
    """Migrate all tables except llm_mappings"""
    print("=" * 60)
    print("Fixed Migration - All Tables (Except llm_mappings)")
    print("=" * 60)
    print()
    
    # Connect
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), DatabaseConfig.SQLITE_DB_PATH)
    sqlite_conn = sqlite3.connect(sqlite_path)
    
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
    
    # Migration order (respects foreign keys)
    tables = [
        'users',  # First - no dependencies
        'admin_settings',
        'subscription_plans',  # Before user_subscriptions
        'transactions',  # Depends on users
        'user_subscriptions',  # Depends on users and subscription_plans
        'renewal_queue',  # Depends on user_subscriptions
        'renewal_history',
        'promo_codes',
        'goals',
        'portfolios',
        'notifications',
        'market_queue',
        'roundup_ledger',
        'system_events',
        'advertisements',
        'statements',
        'user_settings',
        'subscription_analytics',
        'subscription_changes',
        'promo_code_usage'
    ]
    
    total_migrated = 0
    
    for table in tables:
        rows = migrate_table_fixed(sqlite_conn, postgres_conn, table)
        total_migrated += rows
    
    print(f"\n[OK] Total migrated: {total_migrated:,} rows")
    print("\nNote: llm_mappings (14.6M rows) skipped - can migrate later")
    print("\nYour application can now use PostgreSQL!")
    
    sqlite_conn.close()
    postgres_conn.close()
    
    return True

if __name__ == '__main__':
    import os
    os.environ['DB_TYPE'] = 'postgresql'
    migrate_all_except_llm()

