import sqlite3

conn = sqlite3.connect('kamioi.db')
cur = conn.cursor()

# Approve mapping ID 4
cur.execute('UPDATE llm_mappings SET admin_approved = 1, status = "approved" WHERE id = 4')
conn.commit()

print("Mapping approved manually")

# Check the result
cur.execute('SELECT id, admin_approved, status FROM llm_mappings WHERE id = 4')
result = cur.fetchone()
print(f"Mapping {result[0]}: admin_approved={result[1]}, status={result[2]}")

conn.close()


