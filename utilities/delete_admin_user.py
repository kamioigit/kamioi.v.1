#!/usr/bin/env python3
"""
Delete Admin User from Regular Users Table
This script removes the info@kamioi.com user from the regular users table
while preserving the admin account functionality
"""

import sqlite3
import os

def delete_admin_user():
    """Delete info@kamioi.com from regular users table"""
    try:
        # Connect to database
        db_path = "backend/kamioi.db"
        if not os.path.exists(db_path):
            print(f"Database not found at {db_path}")
            return False
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Deleting admin user from regular users table...")
        print("=" * 50)
        
        # Check current users
        cursor.execute("SELECT id, email, name, role, account_type FROM users")
        users = cursor.fetchall()
        
        print(f"Current users in database: {len(users)}")
        for user in users:
            print(f"  - ID: {user[0]}, Email: {user[1]}, Name: {user[2]}, Role: {user[3]}, Account Type: {user[4]}")
        
        # Delete info@kamioi.com from users table
        cursor.execute("DELETE FROM users WHERE email = 'info@kamioi.com'")
        deleted_count = cursor.rowcount
        
        # Commit changes
        conn.commit()
        
        # Verify deletion
        cursor.execute("SELECT COUNT(*) FROM users")
        remaining_count = cursor.fetchone()[0]
        
        print(f"\nUsers deleted: {deleted_count}")
        print(f"Remaining users: {remaining_count}")
        
        # Show remaining users
        cursor.execute("SELECT id, email, name, role, account_type FROM users")
        remaining_users = cursor.fetchall()
        
        if remaining_users:
            print("\nRemaining users:")
            for user in remaining_users:
                print(f"  - ID: {user[0]}, Email: {user[1]}, Name: {user[2]}, Role: {user[3]}, Account Type: {user[4]}")
        else:
            print("No users remaining in database.")
        
        conn.close()
        
        print("\n" + "=" * 50)
        print("Admin user deleted successfully!")
        print("The info@kamioi.com account is now only available as super admin.")
        print("Regular user management will no longer show this account.")
        
        return True
        
    except Exception as e:
        print(f"Error deleting admin user: {e}")
        return False

if __name__ == "__main__":
    delete_admin_user()
