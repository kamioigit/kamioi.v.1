"""
Fix Foreign Key Issues - Check and fix user_id mismatches
"""
import sys
import os
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import psycopg2
    from config import DatabaseConfig
except ImportError as e:
    print(f"Error: {e}")
    sys.exit(1)

def fix_foreign_keys():
    """Check and report foreign key issues"""
    print("=" * 60)
    print("Foreign Key Analysis")
    print("=" * 60)
    print()
    
    # Connect
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), DatabaseConfig.SQLITE_DB_PATH)
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_cursor = sqlite_conn.cursor()
    
    postgres_conn = psycopg2.connect(
        host='localhost',
        port=DatabaseConfig.POSTGRES_PORT,
        user=DatabaseConfig.POSTGRES_USER,
        password=DatabaseConfig.POSTGRES_PASSWORD,
        database=DatabaseConfig.POSTGRES_DB
    )
    postgres_cursor = postgres_conn.cursor()
    
    # Check users
    sqlite_cursor.execute('SELECT id, email FROM users')
    sqlite_users = {row[0]: row[1] for row in sqlite_cursor.fetchall()}
    
    postgres_cursor.execute('SELECT id, email FROM users')
    postgres_users = {row[0]: row[1] for row in postgres_cursor.fetchall()}
    
    print("Users in SQLite:", sqlite_users)
    print("Users in PostgreSQL:", postgres_users)
    print()
    
    # Check transactions
    sqlite_cursor.execute('SELECT DISTINCT user_id FROM transactions')
    tx_user_ids = [row[0] for row in sqlite_cursor.fetchall()]
    print(f"Transactions reference user_ids: {tx_user_ids}")
    
    missing_users = [uid for uid in tx_user_ids if uid not in postgres_users]
    if missing_users:
        print(f"\n[WARNING] Transactions reference users not in PostgreSQL: {missing_users}")
        print("These transactions will fail to migrate due to foreign key constraints.")
    else:
        print("\n[OK] All transaction user_ids exist in PostgreSQL")
    
    # Check renewal_queue
    sqlite_cursor.execute('SELECT DISTINCT subscription_id FROM renewal_queue')
    sub_ids = [row[0] for row in sqlite_cursor.fetchall()]
    print(f"\nRenewal_queue references subscription_ids: {sub_ids}")
    
    postgres_cursor.execute('SELECT id FROM user_subscriptions')
    postgres_subs = [row[0] for row in postgres_cursor.fetchall()]
    print(f"PostgreSQL has subscription_ids: {postgres_subs}")
    
    missing_subs = [sid for sid in sub_ids if sid not in postgres_subs]
    if missing_subs:
        print(f"[WARNING] Renewal_queue references subscriptions not in PostgreSQL: {missing_subs}")
    
    sqlite_conn.close()
    postgres_conn.close()

if __name__ == '__main__':
    fix_foreign_keys()

