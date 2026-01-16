import sqlite3

def update_existing_transaction_fees():
    """Update existing transactions with correct fees based on account type"""
    try:
        conn = sqlite3.connect('kamioi.db')
        cursor = conn.cursor()
        
        # Get all transactions with their user account types
        cursor.execute("""
            SELECT t.id, t.user_id, t.round_up, t.fee, t.total_debit, u.role
            FROM transactions t
            JOIN users u ON t.user_id = u.id
        """)
        transactions = cursor.fetchall()
        
        print(f"Found {len(transactions)} transactions to update")
        
        updated_count = 0
        
        for transaction in transactions:
            transaction_id, user_id, round_up, current_fee, total_debit, account_type = transaction
            
            # Calculate correct fee based on account type
            if account_type == 'individual':
                correct_fee = 0.25
            elif account_type == 'family':
                correct_fee = 0.10
            elif account_type == 'business':
                correct_fee = round_up * 0.10  # 10% of round-up
            else:
                correct_fee = 0.25  # default to individual
            
            # Calculate new total debit
            new_total_debit = round_up + correct_fee
            
            # Update the transaction
            cursor.execute("""
                UPDATE transactions 
                SET fee = ?, total_debit = ?
                WHERE id = ?
            """, (correct_fee, new_total_debit, transaction_id))
            
            updated_count += 1
            print(f"Updated transaction {transaction_id}: Fee ${current_fee} -> ${correct_fee}, Total ${total_debit} -> ${new_total_debit}")
        
        conn.commit()
        conn.close()
        
        print(f"\n✅ Successfully updated {updated_count} transactions with correct fees!")
        
    except Exception as e:
        print(f"❌ Error updating fees: {e}")

if __name__ == "__main__":
    update_existing_transaction_fees()
