import sqlite3
import os

def verify_user():
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')
    
    print("VERIFYING USER IN DATABASE")
    print("=" * 40)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check user5@user5.com
        cursor.execute("SELECT id, name, email, role, password FROM users WHERE email = 'user5@user5.com'")
        user = cursor.fetchone()
        
        if user:
            print(f"[OK] User found:")
            print(f"  ID: {user[0]}")
            print(f"  Name: {user[1]}")
            print(f"  Email: {user[2]}")
            print(f"  Role: {user[3]}")
            print(f"  Password: {user[4]}")
            
            # Test password match
            if user[4] == "defaultPassword123":
                print("[OK] Password matches!")
            else:
                print(f"[FAIL] Password mismatch! Expected: defaultPassword123, Got: {user[4]}")
        else:
            print("[FAIL] user5@user5.com not found in database")
            
        conn.close()
        
    except Exception as e:
        print(f"[ERROR] Database error: {str(e)}")

if __name__ == "__main__":
    verify_user()
