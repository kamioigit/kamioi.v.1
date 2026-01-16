import sqlite3

conn = sqlite3.connect('backend/kamioi.db')
cursor = conn.cursor()

# Fix the admin user role
cursor.execute("UPDATE users SET role = 'superadmin' WHERE email = 'info@kamioi.com'")
print('Updated info@kamioi.com role to superadmin')

# Fix the individual user role  
cursor.execute("UPDATE users SET role = 'individual' WHERE email = 'user5@user5.com'")
print('Updated user5@user5.com role to individual')

# Verify the changes
cursor.execute('SELECT id, email, account_type, role FROM users')
users = cursor.fetchall()
print('\nUpdated users:')
for user in users:
    print(f'ID: {user[0]}, Email: {user[1]}, Account Type: {user[2]}, Role: {user[3]}')

conn.commit()
conn.close()
print('\n✅ Admin roles fixed!')

