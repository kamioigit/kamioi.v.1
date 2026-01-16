import sqlite3, os, json
DB = os.getenv("DATABASE_URL","sqlite:///kamioi.db").replace("sqlite:///","")
with sqlite3.connect(DB) as conn:
    users = conn.execute("SELECT id,email,password,role FROM users").fetchall()
    print("USERS:", json.dumps(users))
