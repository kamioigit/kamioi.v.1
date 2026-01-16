import sqlite3

conn = sqlite3.connect('kamioi.db')
cur = conn.cursor()

# Get the transaction ID for mapping 4
cur.execute('SELECT transaction_id FROM llm_mappings WHERE id = 4')
transaction_id = cur.fetchone()[0]
print(f"Transaction ID: {transaction_id}")

# Update the transaction with investment details
cur.execute('''
    UPDATE transactions 
    SET status = 'completed',
        ticker = 'SBUX',
        investable = 1.00,
        round_up = 1.00,
        fee = 0.25,
        total_debit = total_debit + 1.25,
        shares = 1.00,
        price_per_share = 1.00,
        stock_price = 1.00
    WHERE id = ?
''', (transaction_id,))

conn.commit()
print("Transaction updated with investment details")

# Check the result
cur.execute('SELECT id, status, ticker, investable, round_up, fee FROM transactions WHERE id = ?', (transaction_id,))
result = cur.fetchone()
print(f"Transaction {result[0]}: status={result[1]}, ticker={result[2]}, investable={result[3]}, round_up={result[4]}, fee={result[5]}")

conn.close()


