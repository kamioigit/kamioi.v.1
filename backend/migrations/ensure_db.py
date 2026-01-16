import sqlite3, os
DB = os.getenv("DATABASE_URL","sqlite:///kamioi.db").replace("sqlite:///","")
with sqlite3.connect(DB) as conn:
    conn.execute("""
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )""")
    conn.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )""")
    conn.commit()
print("DB ready:", DB)
