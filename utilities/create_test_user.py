import sqlite3
import os
import time

def create_test_user():
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')
    
    print("CREATING TEST USER")
    print("=" * 30)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create user5@user5.com
        user_id = int(time.time() * 1000)  # Generate unique ID
        cursor.execute("""
            INSERT INTO users (id, name, email, role, password, account_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, "User5", "user5@user5.com", "individual", "defaultPassword123", "individual", time.strftime('%Y-%m-%d %H:%M:%S')))
        
        conn.commit()
        print(f"[OK] Created user5@user5.com with ID: {user_id}")
        
        # Verify user was created
        cursor.execute("SELECT id, name, email, role FROM users WHERE email = 'user5@user5.com'")
        user = cursor.fetchone()
        
        if user:
            print(f"[OK] User verified: ID={user[0]}, Name={user[1]}, Email={user[2]}, Role={user[3]}")
        else:
            print("[FAIL] User creation failed")
        
        conn.close()
        
    except Exception as e:
        print(f"[ERROR] Database error: {str(e)}")

if __name__ == "__main__":
    create_test_user()
