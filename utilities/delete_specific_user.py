#!/usr/bin/env python3
"""
Delete Specific User Account
This script removes the specific problematic user account
"""

import sqlite3
import os

def delete_specific_user():
    """Delete the specific problematic user account"""
    try:
        # Connect to database
        db_path = "backend/kamioi.db"
        if not os.path.exists(db_path):
            print(f"Database not found at {db_path}")
            return False
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Deleting specific problematic user account...")
        print("=" * 50)
        
        # Target user ID
        target_user_id = 1760805230384
        target_email = "abeltran@basktball.com"
        
        print(f"Target User ID: {target_user_id}")
        print(f"Target Email: {target_email}")
        
        # Check if user exists
        cursor.execute("SELECT id, email, name, role, account_type FROM users WHERE id = ? OR email = ?", (target_user_id, target_email))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"Found user to delete:")
            print(f"  - ID: {existing_user[0]}")
            print(f"  - Email: {existing_user[1]}")
            print(f"  - Name: {existing_user[2]}")
            print(f"  - Role: {existing_user[3]}")
            print(f"  - Account Type: {existing_user[4]}")
            
            # Delete the user
            cursor.execute("DELETE FROM users WHERE id = ? OR email = ?", (target_user_id, target_email))
            deleted_count = cursor.rowcount
            
            # Commit changes
            conn.commit()
            
            print(f"\nUser deleted: {deleted_count}")
            
            # Verify deletion
            cursor.execute("SELECT COUNT(*) FROM users")
            remaining_count = cursor.fetchone()[0]
            
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
            
        else:
            print("User not found in database.")
        
        conn.close()
        
        print("\n" + "=" * 50)
        print("Specific user deletion complete!")
        print("The problematic user account has been removed.")
        print("You can now test Google authentication with a fresh account.")
        
        return True
        
    except Exception as e:
        print(f"Error deleting user: {e}")
        return False

if __name__ == "__main__":
    delete_specific_user()
