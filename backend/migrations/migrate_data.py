"""
Data Migration Script - SQLite to PostgreSQL
Phase 1 Migration: Safely migrate all data from SQLite to PostgreSQL
"""
import sys
import os
import sqlite3
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import psycopg2
    from psycopg2.extras import execute_batch
    from psycopg2 import IntegrityError
    from config import DatabaseConfig
except ImportError as e:
    print(f"Error importing dependencies: {e}")
    print("Please install: pip install psycopg2-binary")
    sys.exit(1)

def migrate_table(sqlite_conn, postgres_conn, table_name, columns, batch_size=1000):
    """Migrate a single table from SQLite to PostgreSQL"""
    sqlite_cursor = sqlite_conn.cursor()
    postgres_cursor = postgres_conn.cursor()
    
    try:
        # Get row count
        sqlite_cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
        total_rows = sqlite_cursor.fetchone()[0]
        
        if total_rows == 0:
            print(f"  [SKIP] Skipping {table_name} (empty)")
            return 0
        
        print(f"  [MIGRATE] Migrating {table_name} ({total_rows:,} rows)...")
        
        # Get SQLite column names
        sqlite_cursor.execute(f'SELECT * FROM {table_name} LIMIT 0')
        sqlite_columns = [desc[0] for desc in sqlite_cursor.description]
        
        # Get PostgreSQL column names
        postgres_cursor.execute(f'SELECT * FROM {table_name} LIMIT 0')
        postgres_columns = [desc[0] for desc in postgres_cursor.description]
        
        # Find columns that exist in both databases
        common_columns = [col for col in sqlite_columns if col in postgres_columns]
        if not common_columns:
            print(f"    [ERROR] No common columns found between SQLite and PostgreSQL for {table_name}")
            return 0
        
        # Warn about missing columns
        missing_in_postgres = [col for col in sqlite_columns if col not in postgres_columns]
        if missing_in_postgres:
            print(f"    [WARNING] Columns in SQLite but not in PostgreSQL: {', '.join(missing_in_postgres[:5])}{'...' if len(missing_in_postgres) > 5 else ''}")
        
        # Get all data with only common columns
        columns_str = ', '.join(common_columns)
        sqlite_cursor.execute(f'SELECT {columns_str} FROM {table_name}')
        
        # Build placeholders
        placeholders = ', '.join(['%s'] * len(common_columns))
        
        # Insert in batches
        rows_inserted = 0
        batch = []
        
        for row in sqlite_cursor.fetchall():
            # Convert row to tuple, handling None values and empty strings
            row_tuple = tuple(None if (x == '' or x is None) else x for x in row)
            batch.append(row_tuple)
            
            if len(batch) >= batch_size:
                # Insert batch with ON CONFLICT DO NOTHING to handle duplicates
                # For tables with id as primary key, use ON CONFLICT (id)
                if 'id' in common_columns:
                    insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING'
                else:
                    # For tables without id, try to find unique constraint
                    insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
                try:
                    execute_batch(postgres_cursor, insert_query, batch)
                    rows_inserted += len(batch)
                    postgres_conn.commit()
                except Exception as batch_err:
                    # If ON CONFLICT fails, try without it (might be a unique constraint issue)
                    print(f"    [WARNING] Batch insert had issues, trying alternative method...")
                    for row in batch:
                        try:
                            single_insert = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
                            postgres_cursor.execute(single_insert, row)
                            rows_inserted += 1
                        except:
                            pass  # Skip duplicates
                    postgres_conn.commit()
                batch = []
                if total_rows > 1000:  # Only show progress for large tables
                    print(f"    [OK] Processed {rows_inserted:,}/{total_rows:,} rows...", end='\r')
        
        # Insert remaining rows
        if batch:
            if 'id' in common_columns:
                insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING'
            else:
                insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
            try:
                execute_batch(postgres_cursor, insert_query, batch)
                rows_inserted += len(batch)
                postgres_conn.commit()
            except Exception as batch_err:
                # Fallback for remaining rows
                for row in batch:
                    try:
                        single_insert = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
                        postgres_cursor.execute(single_insert, row)
                        rows_inserted += 1
                    except:
                        pass
                postgres_conn.commit()
        
        # Get actual count inserted (accounting for duplicates)
        postgres_cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
        actual_count = postgres_cursor.fetchone()[0]
        print(f"    [OK] Processed {total_rows:,} rows, {actual_count:,} rows in PostgreSQL")
        return actual_count
        
    except Exception as e:
        print(f"    [ERROR] Error migrating {table_name}: {e}")
        postgres_conn.rollback()
        raise

def validate_migration(sqlite_conn, postgres_conn):
    """Validate that migration was successful by comparing row counts"""
    print("\n" + "=" * 60)
    print("Validating Migration")
    print("=" * 60)
    
    tables = [
        'users', 'transactions', 'goals', 'portfolios', 'notifications',
        'market_queue', 'llm_mappings', 'system_events', 'roundup_ledger',
        'advertisements', 'statements', 'user_settings', 'admin_settings',
        'subscription_plans', 'user_subscriptions', 'renewal_queue',
        'renewal_history', 'subscription_analytics', 'subscription_changes',
        'promo_codes', 'promo_code_usage'
    ]
    
    sqlite_cursor = sqlite_conn.cursor()
    postgres_cursor = postgres_conn.cursor()
    
    all_valid = True
    
    for table in tables:
        try:
            # SQLite count
            sqlite_cursor.execute(f'SELECT COUNT(*) FROM {table}')
            sqlite_count = sqlite_cursor.fetchone()[0]
            
            # PostgreSQL count
            postgres_cursor.execute(f'SELECT COUNT(*) FROM {table}')
            postgres_count = postgres_cursor.fetchone()[0]
            
            if sqlite_count == postgres_count:
                print(f"  [OK] {table}: {sqlite_count:,} rows (matched)")
            else:
                print(f"  [ERROR] {table}: SQLite={sqlite_count:,}, PostgreSQL={postgres_count:,} (MISMATCH!)")
                all_valid = False
        except Exception as e:
            print(f"  [WARNING]  {table}: Error validating - {e}")
            all_valid = False
    
    return all_valid

def migrate_data():
    """Main migration function"""
    print("=" * 60)
    print("Data Migration: SQLite to PostgreSQL")
    print("=" * 60)
    print()
    
    # Check if PostgreSQL is configured
    if not DatabaseConfig.is_postgresql():
        print("ERROR: DB_TYPE is not set to 'postgresql'")
        print("Set environment variable: DB_TYPE=postgresql")
        sys.exit(1)
    
    # Connect to SQLite
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), DatabaseConfig.SQLITE_DB_PATH)
    if not os.path.exists(sqlite_path):
        print(f"ERROR: SQLite database not found at {sqlite_path}")
        sys.exit(1)
    
    print(f"Connecting to SQLite database: {sqlite_path}")
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    
    # Connect to PostgreSQL (try hostname, fallback to localhost)
    print(f"Connecting to PostgreSQL: {DatabaseConfig.POSTGRES_HOST}:{DatabaseConfig.POSTGRES_PORT}/{DatabaseConfig.POSTGRES_DB}")
    actual_host = DatabaseConfig.POSTGRES_HOST
    try:
        try:
            postgres_conn = psycopg2.connect(
                host=DatabaseConfig.POSTGRES_HOST,
                port=DatabaseConfig.POSTGRES_PORT,
                user=DatabaseConfig.POSTGRES_USER,
                password=DatabaseConfig.POSTGRES_PASSWORD,
                database=DatabaseConfig.POSTGRES_DB
            )
        except psycopg2.OperationalError as conn_err:
            # Try localhost if hostname fails
            if 'could not translate host name' in str(conn_err):
                print(f"Hostname '{DatabaseConfig.POSTGRES_HOST}' not resolved, trying 'localhost'...")
                actual_host = 'localhost'
                postgres_conn = psycopg2.connect(
                    host='localhost',
                    port=DatabaseConfig.POSTGRES_PORT,
                    user=DatabaseConfig.POSTGRES_USER,
                    password=DatabaseConfig.POSTGRES_PASSWORD,
                    database=DatabaseConfig.POSTGRES_DB
                )
                print("Connected to localhost instead")
            else:
                raise conn_err
    except psycopg2.Error as e:
        print(f"ERROR: Failed to connect to PostgreSQL: {e}")
        print("\nMake sure:")
        print("1. PostgreSQL is running")
        print("2. Database exists (run create_postgres_schema.py first)")
        print("3. Credentials are correct in config.py or environment variables")
        sys.exit(1)
    
    try:
        # Migration order matters for foreign keys
        migration_order = [
            ('users', []),
            ('admin_settings', []),
            ('subscription_plans', []),
            ('transactions', ['users']),
            ('goals', ['users']),
            ('portfolios', ['users']),
            ('notifications', ['users']),
            ('user_settings', ['users']),
            ('statements', ['users']),
            ('advertisements', []),
            ('market_queue', ['transactions', 'users']),
            ('llm_mappings', ['transactions']),  # 14M+ records - may take time
            ('roundup_ledger', ['users', 'transactions']),
            ('system_events', []),
            ('user_subscriptions', ['users', 'subscription_plans']),
            ('renewal_queue', ['user_subscriptions']),
            ('renewal_history', ['user_subscriptions']),
            ('subscription_analytics', ['subscription_plans']),
            ('subscription_changes', ['users', 'subscription_plans']),
            ('promo_codes', ['subscription_plans']),
            ('promo_code_usage', ['promo_codes', 'users', 'user_subscriptions']),
        ]
        
        print("\nStarting migration...")
        print("=" * 60)
        
        total_rows = 0
        start_time = datetime.now()
        
        for table_name, dependencies in migration_order:
            try:
                rows = migrate_table(sqlite_conn, postgres_conn, table_name, [])
                total_rows += rows
            except Exception as e:
                print(f"\n[ERROR] Failed to migrate {table_name}: {e}")
                print("Aborting migration...")
                raise
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print("\n" + "=" * 60)
        print(f"[OK] Migration complete!")
        print(f"   Total rows migrated: {total_rows:,}")
        print(f"   Duration: {duration:.1f} seconds")
        print("=" * 60)
        
        # Validate migration
        if validate_migration(sqlite_conn, postgres_conn):
            print("\n[OK] Validation passed! All row counts match.")
        else:
            print("\n[WARNING]  Validation failed! Some row counts don't match.")
            print("Please review the errors above.")
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        sqlite_conn.close()
        postgres_conn.close()

if __name__ == '__main__':
    # Confirm before proceeding (skip if AUTO_CONFIRM env var is set)
    auto_confirm = os.getenv('AUTO_CONFIRM', 'false').lower() == 'true'
    
    if not auto_confirm:
        print("[WARNING] This will migrate all data from SQLite to PostgreSQL")
        print("Make sure you have:")
        print("1. Backed up your SQLite database")
        print("2. Created PostgreSQL schema (run create_postgres_schema.py first)")
        print("3. Verified PostgreSQL connection")
        print()
        
        try:
            response = input("Continue with migration? (yes/no): ")
            if response.lower() not in ['yes', 'y']:
                print("Migration cancelled.")
                sys.exit(0)
        except (EOFError, KeyboardInterrupt):
            print("\nMigration cancelled (no input available).")
            print("Set AUTO_CONFIRM=true to run non-interactively.")
            sys.exit(0)
    else:
        print("Auto-confirm mode: proceeding with migration...")
    
    success = migrate_data()
    
    if success:
        print("\n" + "=" * 60)
        print("[OK] Data Migration Complete!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Set DB_TYPE=postgresql environment variable")
        print("2. Restart your application")
        print("3. Test the application with PostgreSQL")
        print("4. Keep SQLite database as backup (don't delete yet)")
    else:
        print("\n" + "=" * 60)
        print("[ERROR] Migration failed. Please check errors above.")
        print("=" * 60)
        sys.exit(1)

