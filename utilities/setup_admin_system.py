import sqlite3
import os

# Define the path to the database
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "kamioi.db")

def setup_admin_system():
    conn = None
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("Setting up admin authentication system...")
        print()

        # Create admins table
        print("1. Creating admins table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'admin',
                permissions TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        """)
        print("   [OK] Admins table created")

        # Create index for faster lookups
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_admins_role ON admins (role)")
        print("   [OK] Indexes created")

        # Insert main admin account
        print("\n2. Setting up main admin account...")
        
        # Check if info@kamioi.com already exists
        cursor.execute("SELECT id FROM admins WHERE email = 'info@kamioi.com'")
        existing_admin = cursor.fetchone()
        
        if existing_admin:
            print("   [UPDATE] Admin account already exists, updating password...")
            cursor.execute("""
                UPDATE admins 
                SET password = 'admin123', 
                    name = 'Main Admin',
                    role = 'superadmin',
                    is_active = 1
                WHERE email = 'info@kamioi.com'
            """)
        else:
            print("   [NEW] Creating new admin account...")
            cursor.execute("""
                INSERT INTO admins (email, name, password, role, permissions, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                'info@kamioi.com',
                'Main Admin',
                'admin123',
                'superadmin',
                '{"all": true}',
                1
            ))
        
        conn.commit()
        print("   [OK] Main admin account ready")

        # Verify admin account
        print("\n3. Verifying admin account...")
        cursor.execute("SELECT id, email, name, role, is_active FROM admins WHERE email = 'info@kamioi.com'")
        admin = cursor.fetchone()
        
        if admin:
            print(f"   [OK] Admin found: ID {admin[0]}, Email: {admin[1]}, Name: {admin[2]}, Role: {admin[3]}, Active: {admin[4]}")
        else:
            print("   [ERROR] Admin account not found!")

        # Remove info@kamioi.com from users table if it exists
        print("\n4. Cleaning up users table...")
        cursor.execute("SELECT id FROM users WHERE email = 'info@kamioi.com'")
        user_admin = cursor.fetchone()
        
        if user_admin:
            print("   [CLEAN] Removing info@kamioi.com from users table...")
            cursor.execute("DELETE FROM users WHERE email = 'info@kamioi.com'")
            conn.commit()
            print("   [OK] Removed from users table")
        else:
            print("   [OK] Not found in users table (already clean)")

        print("\n=== ADMIN SYSTEM READY ===")
        print("Login credentials:")
        print("  Email: info@kamioi.com")
        print("  Password: admin123")
        print("  Role: superadmin")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    setup_admin_system()
