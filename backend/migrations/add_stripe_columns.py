"""
Database Migration: Add Stripe columns
Adds stripe_customer_id and stripe_subscription_id columns to support Stripe integration

Run this script to add the required columns:
    python migrations/add_stripe_columns.py
"""

import sqlite3
import os
import sys

# Add parent directory to path to import database_manager
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database_manager import db_manager


def run_migration():
    """Run the migration to add Stripe columns"""
    print("=" * 60)
    print("Stripe Integration Database Migration")
    print("=" * 60)
    
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        users_columns = [col[1] for col in cursor.fetchall()]
        
        cursor.execute("PRAGMA table_info(user_subscriptions)")
        subscriptions_columns = [col[1] for col in cursor.fetchall()]
        
        changes_made = False
        
        # Add stripe_customer_id to users table
        if 'stripe_customer_id' not in users_columns:
            print("\n[1/2] Adding stripe_customer_id column to users table...")
            try:
                cursor.execute("""
                    ALTER TABLE users 
                    ADD COLUMN stripe_customer_id TEXT
                """)
                conn.commit()
                print("[OK] Successfully added stripe_customer_id to users table")
                changes_made = True
            except sqlite3.OperationalError as e:
                if "duplicate column" in str(e).lower():
                    print("[SKIP] Column stripe_customer_id already exists, skipping...")
                else:
                    raise
        else:
            print("[OK] Column stripe_customer_id already exists in users table")
        
        # Add stripe_subscription_id to user_subscriptions table
        if 'stripe_subscription_id' not in subscriptions_columns:
            print("\n[2/2] Adding stripe_subscription_id column to user_subscriptions table...")
            try:
                cursor.execute("""
                    ALTER TABLE user_subscriptions 
                    ADD COLUMN stripe_subscription_id TEXT
                """)
                conn.commit()
                print("[OK] Successfully added stripe_subscription_id to user_subscriptions table")
                changes_made = True
            except sqlite3.OperationalError as e:
                if "duplicate column" in str(e).lower():
                    print("[SKIP] Column stripe_subscription_id already exists, skipping...")
                else:
                    raise
        else:
            print("[OK] Column stripe_subscription_id already exists in user_subscriptions table")
        
        # Verify the migration
        print("\n" + "=" * 60)
        print("Verification:")
        print("=" * 60)
        
        cursor.execute("PRAGMA table_info(users)")
        users_columns = [col[1] for col in cursor.fetchall()]
        if 'stripe_customer_id' in users_columns:
            print("[OK] users.stripe_customer_id: EXISTS")
        else:
            print("[ERROR] users.stripe_customer_id: MISSING")
        
        cursor.execute("PRAGMA table_info(user_subscriptions)")
        subscriptions_columns = [col[1] for col in cursor.fetchall()]
        if 'stripe_subscription_id' in subscriptions_columns:
            print("[OK] user_subscriptions.stripe_subscription_id: EXISTS")
        else:
            print("[ERROR] user_subscriptions.stripe_subscription_id: MISSING")
        
        conn.close()
        
        print("\n" + "=" * 60)
        if changes_made:
            print("[SUCCESS] Migration completed successfully!")
        else:
            print("[INFO] Database already up to date - no changes needed")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {str(e)}")
        print("\nPlease check the error above and try again.")
        return False


if __name__ == '__main__':
    success = run_migration()
    sys.exit(0 if success else 1)

