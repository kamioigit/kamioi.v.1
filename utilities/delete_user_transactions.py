import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'kamioi.db')

def delete_user_transactions():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # First, find the user ID for beltranalain@gmail.com
    cursor.execute("""
        SELECT id, email 
        FROM users 
        WHERE email = 'beltranalain@gmail.com'
    """)
    
    user = cursor.fetchone()
    
    if not user:
        print("User 'beltranalain@gmail.com' not found in database")
        conn.close()
        return
    
    user_id = user[0]
    print(f"Found user: {user[1]} (ID: {user_id})")
    
    # Count transactions before deletion
    cursor.execute("""
        SELECT COUNT(*) 
        FROM transactions 
        WHERE user_id = ?
    """, (user_id,))
    
    transaction_count = cursor.fetchone()[0]
    print(f"Found {transaction_count} transactions to delete")
    
    if transaction_count == 0:
        print("No transactions found for this user")
        conn.close()
        return
    
    # Delete all transactions for this user
    cursor.execute("""
        DELETE FROM transactions 
        WHERE user_id = ?
    """, (user_id,))
    
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    
    print(f"Successfully deleted {deleted_count} transactions for user {user[1]}")
    print("You can now upload fresh CSV data to test the new logo system")

if __name__ == "__main__":
    delete_user_transactions()