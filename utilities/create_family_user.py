import sqlite3
import os
import time

def create_family_user():
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')
    
    print("CREATING FAMILY USER")
    print("=" * 30)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create family@kamioi.com
        family_id = int(time.time() * 1000)  # Generate unique ID
        cursor.execute("""
            INSERT INTO users (id, name, email, role, password, account_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (family_id, "Family Smith", "family@kamioi.com", "family", "family123", "family", time.strftime('%Y-%m-%d %H:%M:%S')))
        
        conn.commit()
        print(f"[OK] Created family@kamioi.com with ID: {family_id}")
        
        # Verify family user was created
        cursor.execute("SELECT id, name, email, role FROM users WHERE email = 'family@kamioi.com'")
        user = cursor.fetchone()
        
        if user:
            print(f"[OK] Family user verified: ID={user[0]}, Name={user[1]}, Email={user[2]}, Role={user[3]}")
        else:
            print("[FAIL] Family user creation failed")
        
        conn.close()
        
    except Exception as e:
        print(f"[ERROR] Database error: {str(e)}")

if __name__ == "__main__":
    create_family_user()
