import sqlite3
import time

# Create a new admin user
def create_admin_user():
    try:
        conn = sqlite3.connect('backend/kamioi.db')
        cur = conn.cursor()
        
        # Create new admin user
        admin_id = int(time.time() * 1000)
        email = 'admin@kamioi.com'
        password = 'admin123'
        name = 'Admin User'
        account_type = 'admin'
        
        # Insert new admin user
        cur.execute("""
            INSERT INTO users (id, email, password, name, account_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        """, (admin_id, email, password, name, account_type))
        
        conn.commit()
        conn.close()
        
        print(f"✅ New admin user created:")
        print(f"   ID: {admin_id}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Name: {name}")
        print(f"   Type: {account_type}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

if __name__ == "__main__":
    create_admin_user()
