"""
Check Migration Status - Compare SQLite and PostgreSQL row counts
"""
import sys
import os
import sqlite3

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import psycopg2
    from config import DatabaseConfig
except ImportError as e:
    print(f"Error importing dependencies: {e}")
    sys.exit(1)

def check_migration_status():
    """Check migration status by comparing row counts"""
    print("=" * 60)
    print("Migration Status Check")
    print("=" * 60)
    print()
    
    # Connect to SQLite
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), DatabaseConfig.SQLITE_DB_PATH)
    if not os.path.exists(sqlite_path):
        print(f"[ERROR] SQLite database not found: {sqlite_path}")
        return
    
    print(f"Connecting to SQLite: {sqlite_path}")
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_cursor = sqlite_conn.cursor()
    
    # Connect to PostgreSQL
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
            else:
                raise conn_err
    except Exception as e:
        print(f"[ERROR] Failed to connect to PostgreSQL: {e}")
        return
    
    postgres_cursor = postgres_conn.cursor()
    
    print(f"Connected to PostgreSQL: {actual_host}:{DatabaseConfig.POSTGRES_PORT}/{DatabaseConfig.POSTGRES_DB}")
    print()
    
    # Tables to check
    tables = [
        'users', 'transactions', 'goals', 'portfolios', 'notifications',
        'market_queue', 'llm_mappings', 'system_events', 'roundup_ledger',
        'advertisements', 'statements', 'user_settings', 'admin_settings',
        'subscription_plans', 'user_subscriptions', 'renewal_queue',
        'renewal_history', 'subscription_analytics', 'subscription_changes',
        'promo_codes', 'promo_code_usage'
    ]
    
    print("Comparing row counts:")
    print("=" * 60)
    print(f"{'Table':<30} {'SQLite':<15} {'PostgreSQL':<15} {'Status':<10}")
    print("-" * 60)
    
    total_sqlite = 0
    total_postgres = 0
    matching = 0
    not_matching = 0
    
    for table in tables:
        try:
            # SQLite count
            sqlite_cursor.execute(f'SELECT COUNT(*) FROM {table}')
            sqlite_count = sqlite_cursor.fetchone()[0]
            
            # PostgreSQL count
            postgres_cursor.execute(f'SELECT COUNT(*) FROM {table}')
            postgres_count = postgres_cursor.fetchone()[0]
            
            total_sqlite += sqlite_count
            total_postgres += postgres_count
            
            if sqlite_count == postgres_count:
                status = "[OK]"
                matching += 1
            else:
                status = "[DIFF]"
                not_matching += 1
            
            print(f"{table:<30} {sqlite_count:>14,} {postgres_count:>14,} {status:<10}")
            
        except Exception as e:
            print(f"{table:<30} {'ERROR':<15} {'ERROR':<15} {str(e)[:30]}")
    
    print("-" * 60)
    print(f"{'TOTAL':<30} {total_sqlite:>14,} {total_postgres:>14,}")
    print("=" * 60)
    print()
    
    # Summary
    print("Summary:")
    print(f"  Tables matching: {matching}/{len(tables)}")
    print(f"  Tables with differences: {not_matching}/{len(tables)}")
    print(f"  Total rows in SQLite: {total_sqlite:,}")
    print(f"  Total rows in PostgreSQL: {total_postgres:,}")
    
    if total_postgres == 0:
        print("\n[WARNING] No data migrated yet. Run migrate_data.py")
    elif total_postgres < total_sqlite:
        print(f"\n[WARNING] Migration incomplete. {total_sqlite - total_postgres:,} rows still need to be migrated")
    elif total_postgres == total_sqlite:
        print("\n[OK] Migration appears complete! All row counts match.")
    else:
        print(f"\n[WARNING] PostgreSQL has more rows than SQLite ({total_postgres - total_sqlite:,} extra)")
    
    sqlite_conn.close()
    postgres_conn.close()

if __name__ == '__main__':
    check_migration_status()

