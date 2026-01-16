import sqlite3
import os

# Define the path to the database
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "kamioi.db")

def remove_testuser_final():
    conn = None
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("REMOVING testuser@test.com PERMANENTLY")
        print("=" * 50)

        # Check if testuser@test.com exists
        cursor.execute("SELECT id, email, name FROM users WHERE email = 'testuser@test.com'")
        user_info = cursor.fetchone()

        if user_info:
            user_id = user_info[0]
            print(f"Found user: ID {user_id}, Email: {user_info[1]}, Name: {user_info[2]}")
            
            # Delete all associated data
            print("Deleting associated transactions...")
            cursor.execute("DELETE FROM transactions WHERE user_id = ?", (user_id,))
            print(f"Deleted {cursor.rowcount} transactions")
            
            print("Deleting associated notifications...")
            cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
            print(f"Deleted {cursor.rowcount} notifications")
            
            print("Deleting associated user settings...")
            cursor.execute("DELETE FROM user_settings WHERE user_id = ?", (user_id,))
            print(f"Deleted {cursor.rowcount} user settings")
            
            print("Deleting associated password reset tokens...")
            cursor.execute("DELETE FROM password_reset_tokens WHERE email = ?", (user_info[1],))
            print(f"Deleted {cursor.rowcount} password reset tokens")
            
            # Delete the user
            print("Deleting user account...")
            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
            print(f"Deleted user account")
            
            conn.commit()
            print("SUCCESS: testuser@test.com completely removed!")
        else:
            print("testuser@test.com not found in users table")

        # Verify removal
        print("\nVerifying removal...")
        cursor.execute("SELECT COUNT(*) FROM users WHERE email = 'testuser@test.com'")
        count = cursor.fetchone()[0]
        print(f"Users with testuser@test.com: {count}")

        # Show remaining users
        print("\nRemaining users:")
        cursor.execute("SELECT id, email, name FROM users")
        remaining_users = cursor.fetchall()
        for user in remaining_users:
            print(f"  ID: {user[0]}, Email: {user[1]}, Name: {user[2]}")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    remove_testuser_final()
