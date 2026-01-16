import sqlite3, os, time
DB_PATH = os.getenv("DATABASE_URL", "sqlite:///kamioi.db").replace("sqlite:///","")

def up():
    now_date = time.strftime("%Y-%m-%d")
    now_ts   = time.strftime("%Y-%m-%d %H:%M:%S")
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("INSERT OR IGNORE INTO admins (id, email, password, role) VALUES (1,'info@kamioi.com','admin123','admin')")
        conn.execute("INSERT OR IGNORE INTO users  (id, email, password, role) VALUES (1,'user5@user5.com','user123','user')")

        # Find which columns exist on 'transactions'
        cols = [r[1] for r in conn.execute("PRAGMA table_info(transactions)").fetchall()]
        # Build a minimal insert that satisfies NOT NULLs
        base = {"user_id":1, "amount":12.34, "merchant":"Coffee Shop", "status":"posted",
                "created_at":now_ts, "date":now_date}

        fields = [c for c in base.keys() if c in cols]
        placeholders = ",".join(["?"]*len(fields))
        sql = f"INSERT INTO transactions ({','.join(fields)}) VALUES ({placeholders})"
        conn.execute(sql, tuple(base[c] for c in fields))
        conn.commit()
        print("Seeded minimal records.")

if __name__ == "__main__":
    up()
