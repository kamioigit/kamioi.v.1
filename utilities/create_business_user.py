import sqlite3
import os
import time

def create_business_user():
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')
    
    print("CREATING BUSINESS USER")
    print("=" * 30)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create business@kamioi.com
        business_id = int(time.time() * 1000)  # Generate unique ID
        cursor.execute("""
            INSERT INTO users (id, name, email, role, password, account_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (business_id, "Business Corp", "business@kamioi.com", "business", "business123", "business", time.strftime('%Y-%m-%d %H:%M:%S')))
        
        conn.commit()
        print(f"[OK] Created business@kamioi.com with ID: {business_id}")
        
        # Verify business user was created
        cursor.execute("SELECT id, name, email, role FROM users WHERE email = 'business@kamioi.com'")
        user = cursor.fetchone()
        
        if user:
            print(f"[OK] Business user verified: ID={user[0]}, Name={user[1]}, Email={user[2]}, Role={user[3]}")
        else:
            print("[FAIL] Business user creation failed")
        
        conn.close()
        
    except Exception as e:
        print(f"[ERROR] Database error: {str(e)}")

if __name__ == "__main__":
    create_business_user()
