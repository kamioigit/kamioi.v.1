import sqlite3, os

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///kamioi.db").replace("sqlite:///","")

MISSING = {
    "transactions": [
        ("merchant", "TEXT"),
        ("updated_at", "TEXT"),
        ("account_type", "TEXT")
    ],
}

def column_exists(conn, table, column):
    rows = conn.execute(f"PRAGMA table_info({table});").fetchall()
    cols = [r[1] for r in rows]
    return column in cols

def main():
    with sqlite3.connect(DB_PATH) as conn:
        for table, cols in MISSING.items():
            for col, coltype in cols:
                if not column_exists(conn, table, col):
                    conn.execute(f"ALTER TABLE {table} ADD COLUMN {col} {coltype};")
                    print(f"Added {col} to {table}")

if __name__ == "__main__":
    main()
