import sqlite3
import os

# Define the path to the database
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "kamioi.db")

def remove_test_user(email_to_remove):
    conn = None
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print(f"Attempting to remove user: {email_to_remove} from users table...")

        # Check if the user exists
        cursor.execute("SELECT id, email FROM users WHERE email = ?", (email_to_remove,))
        user_info = cursor.fetchone()

        if user_info:
            user_id = user_info[0]
            print(f"Found user: ID {user_id}, Email: {user_info[1]}")

            # Delete associated transactions
            cursor.execute("DELETE FROM transactions WHERE user_id = ?", (user_id,))
            print(f"Deleted {cursor.rowcount} transactions for user ID {user_id}.")

            # Delete associated notifications
            cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
            print(f"Deleted {cursor.rowcount} notifications for user ID {user_id}.")
            
            # Delete associated user settings
            cursor.execute("DELETE FROM user_settings WHERE user_id = ?", (user_id,))
            print(f"Deleted {cursor.rowcount} user settings for user ID {user_id}.")

            # Delete the user from the users table
            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
            print(f"Successfully removed user: {email_to_remove} and all associated data.")
        else:
            print(f"User {email_to_remove} not found in the users table.")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    remove_test_user("testuser@test.com")

    # Verify remaining users
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, name FROM users")
    remaining_users = cursor.fetchall()
    print("\nRemaining users in the database:")
    if remaining_users:
        for user in remaining_users:
            print(f"  ID: {user[0]}, Email: {user[1]}, Name: {user[2]}")
    else:
        print("  No users found.")
    conn.close()
