import sqlite3, os
DB = os.getenv("DATABASE_URL","sqlite:///kamioi.db").replace("sqlite:///","")
with sqlite3.connect(DB) as conn:
    conn.execute("INSERT OR IGNORE INTO admins (id,email,password,role) VALUES (1,'info@kamioi.com','admin123','admin')")
    conn.execute("INSERT OR IGNORE INTO users  (id,email,password,role) VALUES (1,'user5@user5.com','user123','user')")
    conn.commit()
print("Seeded admins/users.")
