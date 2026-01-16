#!/usr/bin/env python3
"""
Fix admin password to use plain text for testing
"""

import sqlite3

def fix_admin_password():
    conn = sqlite3.connect('backend/kamioi.db')
    cursor = conn.cursor()
    
    # Update admin password to plain text
    cursor.execute("UPDATE admins SET password = ? WHERE email = ?", ("admin123", "admin@kamioi.com"))
    conn.commit()
    
    # Verify the update
    cursor.execute("SELECT email, password FROM admins WHERE email = ?", ("admin@kamioi.com",))
    admin = cursor.fetchone()
    print("Admin password updated:", admin)
    
    conn.close()

if __name__ == "__main__":
    fix_admin_password()
