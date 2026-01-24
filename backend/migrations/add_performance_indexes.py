"""
Database Performance Indexes Migration

This script adds performance indexes to optimize query performance.
Supports both SQLite and PostgreSQL.

Run with: python migrations/add_performance_indexes.py

Indexes added:
- transactions: user_id, status, created_at, date, ticker
- llm_mappings: status, merchant_name, user_id, created_at
- users: email, account_type, created_at
- notifications: user_id, is_read, created_at
- goals: user_id, status
- portfolios: user_id, ticker
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database_manager import db_manager


# Index definitions for each table
# Format: (index_name, table, columns, description)
INDEXES = [
    # Transactions table - most queried table
    ("idx_transactions_user_id", "transactions", ["user_id"],
     "Speed up user transaction lookups"),
    ("idx_transactions_status", "transactions", ["status"],
     "Speed up status filtering"),
    ("idx_transactions_user_status", "transactions", ["user_id", "status"],
     "Speed up user + status combo queries"),
    ("idx_transactions_date", "transactions", ["date"],
     "Speed up date sorting and filtering"),
    ("idx_transactions_created_at", "transactions", ["created_at"],
     "Speed up created_at sorting"),
    ("idx_transactions_ticker", "transactions", ["ticker"],
     "Speed up ticker lookups for portfolio"),
    ("idx_transactions_user_date", "transactions", ["user_id", "date"],
     "Speed up user transactions sorted by date"),

    # LLM Mappings table
    ("idx_llm_mappings_status", "llm_mappings", ["status"],
     "Speed up status filtering"),
    ("idx_llm_mappings_merchant", "llm_mappings", ["merchant_name"],
     "Speed up merchant lookups"),
    ("idx_llm_mappings_status_admin", "llm_mappings", ["status", "admin_approved"],
     "Speed up admin approval queries"),
    ("idx_llm_mappings_user_status", "llm_mappings", ["user_id", "status"],
     "Speed up user submission queries"),
    ("idx_llm_mappings_created_at", "llm_mappings", ["created_at"],
     "Speed up date sorting"),

    # Users table
    ("idx_users_email", "users", ["email"],
     "Speed up email lookups (login)"),
    ("idx_users_account_type", "users", ["account_type"],
     "Speed up account type filtering"),
    ("idx_users_created_at", "users", ["created_at"],
     "Speed up user listing by date"),

    # Notifications table
    ("idx_notifications_user_id", "notifications", ["user_id"],
     "Speed up user notification lookups"),
    ("idx_notifications_user_read", "notifications", ["user_id", "is_read"],
     "Speed up unread notification counts"),
    ("idx_notifications_created_at", "notifications", ["created_at"],
     "Speed up notification sorting"),

    # Goals table
    ("idx_goals_user_id", "goals", ["user_id"],
     "Speed up user goal lookups"),
    ("idx_goals_user_status", "goals", ["user_id", "status"],
     "Speed up active goal queries"),

    # Portfolios table
    ("idx_portfolios_user_id", "portfolios", ["user_id"],
     "Speed up user portfolio lookups"),
    ("idx_portfolios_user_ticker", "portfolios", ["user_id", "ticker"],
     "Speed up specific holding lookups"),

    # Admins table
    ("idx_admins_email", "admins", ["email"],
     "Speed up admin email lookups"),
]


def create_index_sql(index_name, table, columns, use_postgresql=False):
    """Generate CREATE INDEX SQL for the given database type."""
    cols = ", ".join(columns)
    if use_postgresql:
        return f"CREATE INDEX IF NOT EXISTS {index_name} ON {table} ({cols})"
    else:
        return f"CREATE INDEX IF NOT EXISTS {index_name} ON {table} ({cols})"


def check_table_exists(conn, table_name, use_postgresql=False):
    """Check if a table exists in the database."""
    try:
        if use_postgresql:
            from sqlalchemy import text
            result = conn.execute(text(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = :table)"
            ), {'table': table_name})
            return result.scalar()
        else:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
                (table_name,)
            )
            return cursor.fetchone() is not None
    except Exception:
        return False


def get_existing_indexes(conn, use_postgresql=False):
    """Get list of existing index names."""
    try:
        if use_postgresql:
            from sqlalchemy import text
            result = conn.execute(text(
                "SELECT indexname FROM pg_indexes WHERE schemaname = 'public'"
            ))
            return {row[0] for row in result}
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
            return {row[0] for row in cursor.fetchall()}
    except Exception:
        return set()


def run_migration():
    """Run the index migration."""
    print("=" * 70)
    print("Database Performance Index Migration")
    print("=" * 70)

    conn = db_manager.get_connection()
    use_postgresql = getattr(db_manager, '_use_postgresql', False)

    db_type = "PostgreSQL" if use_postgresql else "SQLite"
    print(f"\nDatabase type: {db_type}")

    # Get existing indexes
    existing_indexes = get_existing_indexes(conn, use_postgresql)
    print(f"Existing indexes found: {len(existing_indexes)}")

    created = 0
    skipped = 0
    failed = 0
    table_missing = 0

    print("\n" + "-" * 70)
    print("Creating indexes...")
    print("-" * 70)

    for index_name, table, columns, description in INDEXES:
        # Check if table exists
        if not check_table_exists(conn, table, use_postgresql):
            print(f"[SKIP] Table '{table}' does not exist - {index_name}")
            table_missing += 1
            continue

        # Check if index already exists
        if index_name in existing_indexes or index_name.lower() in {i.lower() for i in existing_indexes}:
            print(f"[SKIP] Index exists: {index_name}")
            skipped += 1
            continue

        # Create the index
        sql = create_index_sql(index_name, table, columns, use_postgresql)

        try:
            if use_postgresql:
                from sqlalchemy import text
                conn.execute(text(sql))
                conn.commit()
            else:
                cursor = conn.cursor()
                cursor.execute(sql)
                conn.commit()

            print(f"[OK] Created: {index_name}")
            print(f"     Table: {table}, Columns: {columns}")
            print(f"     Purpose: {description}")
            created += 1
        except Exception as e:
            print(f"[ERROR] Failed: {index_name} - {str(e)}")
            failed += 1

    # Cleanup
    if use_postgresql:
        db_manager.release_connection(conn)
    else:
        conn.close()

    # Summary
    print("\n" + "=" * 70)
    print("Migration Summary")
    print("=" * 70)
    print(f"  Created:       {created}")
    print(f"  Already exist: {skipped}")
    print(f"  Tables missing:{table_missing}")
    print(f"  Failed:        {failed}")
    print(f"  Total defined: {len(INDEXES)}")

    if created > 0:
        print(f"\n[SUCCESS] Created {created} new index(es)")
    else:
        print("\n[INFO] No new indexes were needed")

    return created, skipped, failed


if __name__ == "__main__":
    run_migration()
