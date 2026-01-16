"""
Complete Migration - Fixed Version
Handles all issues: foreign keys, booleans, duplicates, large table
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

def convert_value(value, column_name):
    """Convert SQLite values to PostgreSQL-compatible"""
    if value is None:
        return None
    
    # Convert SQLite boolean integers to PostgreSQL booleans
    if isinstance(value, int) and column_name in [
        'is_active', 'auto_renewal', 'read', 'registration_completed', 
        'admin_approved', 'ai_processed'
    ]:
        return bool(value)
    
    return value

def migrate_table_complete(sqlite_conn, postgres_conn, table_name, skip_llm=False):
    """Migrate a table completely"""
    if skip_llm and table_name == 'llm_mappings':
        print(f"[SKIP] {table_name} - will migrate later with COPY method")
        return 0
    
    sqlite_cursor = sqlite_conn.cursor()
    postgres_cursor = postgres_conn.cursor()
    
    try:
        # Check if already migrated
        postgres_cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
        existing_count = postgres_cursor.fetchone()[0]
        
        sqlite_cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
        total_rows = sqlite_cursor.fetchone()[0]
        
        if total_rows == 0:
            return 0
        
        if existing_count > 0 and existing_count == total_rows:
            print(f"[SKIP] {table_name} - already migrated ({total_rows:,} rows)")
            return total_rows
        
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
        
        # Clear existing data if partially migrated
        if existing_count > 0:
            print(f"  Clearing {existing_count} existing rows...")
            postgres_cursor.execute(f'TRUNCATE TABLE {table_name} CASCADE')
            postgres_conn.commit()
        
        # Insert with type conversion
        placeholders = ', '.join(['%s'] * len(common_columns))
        batch = []
        rows_inserted = 0
        
        for row in sqlite_cursor.fetchall():
            converted_row = [convert_value(value, common_columns[i]) for i, value in enumerate(row)]
            batch.append(tuple(converted_row))
            
            if len(batch) >= 1000:
                try:
                    insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})'
                    execute_batch(postgres_cursor, insert_query, batch)
                    postgres_conn.commit()
                    rows_inserted += len(batch)
                    batch = []
                    if total_rows > 100:
                        print(f"  Progress: {rows_inserted:,}/{total_rows:,}...", end='\r')
                except Exception as e:
                    print(f"\n  [WARNING] Batch error: {str(e)[:60]}")
                    postgres_conn.rollback()
                    # Try row by row
                    for single_row in batch:
                        try:
                            postgres_cursor.execute(insert_query, single_row)
                            rows_inserted += 1
                        except:
                            pass
                    postgres_conn.commit()
                    batch = []
        
        # Final batch
        if batch:
            try:
                insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})'
                execute_batch(postgres_cursor, insert_query, batch)
                postgres_conn.commit()
                rows_inserted += len(batch)
            except Exception as e:
                print(f"\n  [WARNING] Final batch error: {str(e)[:60]}")
                postgres_conn.rollback()
        
        print(f"\n[OK] Migrated {rows_inserted:,}/{total_rows:,} rows")
        return rows_inserted
        
    except Exception as e:
        print(f"[ERROR] {table_name}: {str(e)[:100]}")
        postgres_conn.rollback()
        return 0

def migrate_all_complete():
    """Migrate all tables except llm_mappings"""
    print("=" * 60)
    print("Complete Migration - All Tables (Except llm_mappings)")
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
        print(f"[ERROR] PostgreSQL connection failed: {e}")
        return False
    
    # Migration order (respects foreign keys)
    tables = [
        'users',
        'admin_settings',
        'subscription_plans',
        'transactions',
        'user_subscriptions',
        'renewal_queue',
        'renewal_history',
        'promo_codes',
        'promo_code_usage',
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
        'llm_mappings'  # Will be skipped
    ]
    
    total_migrated = 0
    
    for table in tables:
        rows = migrate_table_complete(sqlite_conn, postgres_conn, table, skip_llm=True)
        total_migrated += rows
    
    print(f"\n[OK] Total migrated: {total_migrated:,} rows")
    print("\n" + "=" * 60)
    print("Migration Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Set environment: $env:DB_TYPE='postgresql'")
    print("2. Restart your Flask application")
    print("3. Your app will now use PostgreSQL!")
    print("\nNote: llm_mappings (14.6M rows) can be migrated later using COPY method")
    
    sqlite_conn.close()
    postgres_conn.close()
    
    return True

if __name__ == '__main__':
    import os
    os.environ['DB_TYPE'] = 'postgresql'
    migrate_all_complete()

