"""
Migrate only data with valid foreign keys
Skips orphaned records that reference non-existent users/subscriptions
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
    if isinstance(value, int) and column_name in [
        'is_active', 'auto_renewal', 'read', 'registration_completed', 
        'admin_approved', 'ai_processed'
    ]:
        return bool(value)
    return value

def migrate_valid_data():
    """Migrate only data with valid foreign keys"""
    print("=" * 60)
    print("Migrate Valid Data Only (Skip Invalid Foreign Keys)")
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
    
    # Get valid user IDs
    postgres_cursor.execute('SELECT id FROM users')
    valid_user_ids = {row[0] for row in postgres_cursor.fetchall()}
    print(f"Valid user IDs in PostgreSQL: {valid_user_ids}")
    
    # Get valid subscription IDs
    postgres_cursor.execute('SELECT id FROM user_subscriptions')
    valid_sub_ids = {row[0] for row in postgres_cursor.fetchall()}
    print(f"Valid subscription IDs: {valid_sub_ids}")
    print()
    
    # Migrate transactions (only with valid user_id)
    print("[MIGRATE] transactions...")
    sqlite_cursor.execute('SELECT * FROM transactions')
    sqlite_columns = [desc[0] for desc in sqlite_cursor.description]
    postgres_cursor.execute('SELECT * FROM transactions LIMIT 0')
    postgres_columns = [desc[0] for desc in postgres_cursor.description]
    common_columns = [col for col in sqlite_columns if col in postgres_columns]
    
    user_id_idx = common_columns.index('user_id') if 'user_id' in common_columns else -1
    
    valid_rows = []
    skipped = 0
    
    sqlite_cursor.execute('SELECT * FROM transactions')
    for row in sqlite_cursor.fetchall():
        row_dict = dict(zip(sqlite_columns, row))
        if user_id_idx >= 0 and row_dict.get('user_id') not in valid_user_ids:
            skipped += 1
            continue
        converted_row = [convert_value(row_dict.get(col), col) for col in common_columns]
        valid_rows.append(tuple(converted_row))
    
    if valid_rows:
        columns_str = ', '.join(common_columns)
        placeholders = ', '.join(['%s'] * len(common_columns))
        insert_query = f'INSERT INTO transactions ({columns_str}) VALUES ({placeholders})'
        execute_batch(postgres_cursor, insert_query, valid_rows)
        postgres_conn.commit()
        print(f"[OK] Migrated {len(valid_rows)} transactions (skipped {skipped} with invalid user_id)")
    else:
        print(f"[SKIP] No valid transactions to migrate (skipped {skipped})")
    
    # Migrate renewal_queue (only with valid subscription_id)
    print("\n[MIGRATE] renewal_queue...")
    sqlite_cursor.execute('SELECT * FROM renewal_queue')
    sqlite_columns = [desc[0] for desc in sqlite_cursor.description]
    postgres_cursor.execute('SELECT * FROM renewal_queue LIMIT 0')
    postgres_columns = [desc[0] for desc in postgres_cursor.description]
    common_columns = [col for col in sqlite_columns if col in postgres_columns]
    
    sub_id_idx = common_columns.index('subscription_id') if 'subscription_id' in common_columns else -1
    
    valid_rows = []
    skipped = 0
    
    sqlite_cursor.execute('SELECT * FROM renewal_queue')
    for row in sqlite_cursor.fetchall():
        row_dict = dict(zip(sqlite_columns, row))
        if sub_id_idx >= 0 and row_dict.get('subscription_id') not in valid_sub_ids:
            skipped += 1
            continue
        converted_row = [convert_value(row_dict.get(col), col) for col in common_columns]
        valid_rows.append(tuple(converted_row))
    
    if valid_rows:
        columns_str = ', '.join(common_columns)
        placeholders = ', '.join(['%s'] * len(common_columns))
        insert_query = f'INSERT INTO renewal_queue ({columns_str}) VALUES ({placeholders})'
        execute_batch(postgres_cursor, insert_query, valid_rows)
        postgres_conn.commit()
        print(f"[OK] Migrated {len(valid_rows)} renewal_queue rows (skipped {skipped} with invalid subscription_id)")
    else:
        print(f"[SKIP] No valid renewal_queue rows (skipped {skipped})")
    
    # Migrate promo_codes (check plan_id if exists)
    print("\n[MIGRATE] promo_codes...")
    sqlite_cursor.execute('SELECT * FROM promo_codes')
    sqlite_columns = [desc[0] for desc in sqlite_cursor.description]
    postgres_cursor.execute('SELECT * FROM promo_codes LIMIT 0')
    postgres_columns = [desc[0] for desc in postgres_cursor.description]
    common_columns = [col for col in sqlite_columns if col in postgres_columns]
    
    postgres_cursor.execute('SELECT id FROM subscription_plans')
    valid_plan_ids = {row[0] for row in postgres_cursor.fetchall()}
    
    plan_id_idx = common_columns.index('plan_id') if 'plan_id' in common_columns else -1
    
    valid_rows = []
    skipped = 0
    
    sqlite_cursor.execute('SELECT * FROM promo_codes')
    for row in sqlite_cursor.fetchall():
        row_dict = dict(zip(sqlite_columns, row))
        if plan_id_idx >= 0 and row_dict.get('plan_id') and row_dict.get('plan_id') not in valid_plan_ids:
            skipped += 1
            continue
        converted_row = [convert_value(row_dict.get(col), col) for col in common_columns]
        valid_rows.append(tuple(converted_row))
    
    if valid_rows:
        columns_str = ', '.join(common_columns)
        placeholders = ', '.join(['%s'] * len(common_columns))
        insert_query = f'INSERT INTO promo_codes ({columns_str}) VALUES ({placeholders})'
        execute_batch(postgres_cursor, insert_query, valid_rows)
        postgres_conn.commit()
        print(f"[OK] Migrated {len(valid_rows)} promo_codes (skipped {skipped} with invalid plan_id)")
    else:
        print(f"[SKIP] No valid promo_codes (skipped {skipped})")
    
    print("\n" + "=" * 60)
    print("[OK] Migration Complete!")
    print("=" * 60)
    print("\nAll valid data has been migrated.")
    print("Invalid foreign key references were skipped.")
    print("\nYour application is ready to use PostgreSQL!")
    
    sqlite_conn.close()
    postgres_conn.close()
    
    return True

if __name__ == '__main__':
    import os
    os.environ['DB_TYPE'] = 'postgresql'
    migrate_valid_data()

