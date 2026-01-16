#!/usr/bin/env python3
"""
Add info@kamioi.com as admin user
"""
import sqlite3
import os
import hashlib

def add_info_admin():
    db_path = os.path.join('backend', 'kamioi.db')
    
    if not os.path.exists(db_path):
        print("Database not found at:", db_path)
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Adding info@kamioi.com as admin user...")
    
    # Check if user already exists
    cursor.execute("SELECT id, email, account_type FROM users WHERE email = ?", ('info@kamioi.com',))
    existing_user = cursor.fetchone()
    
    if existing_user:
        print(f"User already exists: ID {existing_user[0]}, Email: {existing_user[1]}, Type: {existing_user[2]}")
        
        # Update to admin if not already admin
        if existing_user[2] != 'admin':
            cursor.execute("UPDATE users SET account_type = 'admin' WHERE email = ?", ('info@kamioi.com',))
            conn.commit()
            print("Updated user to admin type")
        else:
            print("User is already an admin")
    else:
        # Create new admin user
        # Get next available ID
        cursor.execute("SELECT MAX(id) FROM users")
        max_id = cursor.fetchone()[0] or 0
        new_id = max_id + 1
        
        cursor.execute("""
            INSERT INTO users (id, email, name, account_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        """, (new_id, 'info@kamioi.com', 'Info Admin', 'admin'))
        
        conn.commit()
        print(f"Created new admin user: ID {new_id}, Email: info@kamioi.com")
    
    # Verify the admin users
    cursor.execute("SELECT id, email, account_type FROM users WHERE account_type = 'admin'")
    admin_users = cursor.fetchall()
    
    print(f"\nCurrent admin users ({len(admin_users)} total):")
    for admin in admin_users:
        print(f"  ID: {admin[0]}, Email: {admin[1]}, Type: {admin[2]}")
    
    conn.close()
    print("\nAdmin user setup complete!")

if __name__ == "__main__":
    add_info_admin()
