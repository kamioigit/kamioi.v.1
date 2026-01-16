from flask import Blueprint, jsonify
from utils.auth_utils import require_role

admin_bp = Blueprint("admin", __name__)

@admin_bp.get("/auth/me")
@require_role("admin")
def me():
    return jsonify(role="admin"), 200

@admin_bp.get("/users")
@require_role("admin")
def users():
    return jsonify(users=[]), 200
from flask import request
from flask_jwt_extended import get_jwt
import os, sqlite3

try:
    from routes.admin_routes import admin_bp
except ImportError:
    from admin_routes import admin_bp  # fallback if relative import differs

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///kamioi.db").replace("sqlite:///","")

def _get_db():
    return sqlite3.connect(DB_PATH)

@admin_bp.get("/debug/dbinfo")
@require_role("admin")
def debug_dbinfo():
    with _get_db() as conn:
        try:
            users_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        except Exception as e:
            users_count = f"error: {e}"
        try:
            admins_count = conn.execute("SELECT COUNT(*) FROM admins").fetchone()[0]
        except Exception as e:
            admins_count = f"error: {e}"
    return jsonify({
        "DB_PATH": DB_PATH,
        "users_count": users_count,
        "admins_count": admins_count,
        "claims": get_jwt(),
    }), 200

@admin_bp.post("/debug/create-user")
@require_role("admin")
def debug_create_user():
    body = request.get_json() or {}
    email = body.get("email","user5@user5.com")
    password = body.get("password","user123")
    role = body.get("role","user")
    with _get_db() as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL)"
        )
        conn.execute(
            "INSERT OR IGNORE INTO users (id,email,password,role) VALUES (1,?,?,?)",
            (email, password, role)
        )
        # Make sure row is present (upsert if a different id exists)
        conn.execute(
            "INSERT OR IGNORE INTO users (email,password,role) VALUES (?,?,?)",
            (email, password, role)
        )
        conn.commit()
    return jsonify(ok=True, created=email), 200

@admin_bp.get("/debug/users")
@require_role("admin")
def debug_users():
    with _get_db() as conn:
        try:
            rows = conn.execute("SELECT id,email,password,role FROM users ORDER BY id").fetchall()
            out = [{"id":r[0],"email":r[1],"password":r[2],"role":r[3]} for r in rows]
        except Exception as e:
            out = {"error": str(e)}
    return jsonify(users=out), 200
from flask import request, jsonify
from flask_jwt_extended import get_jwt
import os, sqlite3

try:
    from routes.admin_routes import admin_bp
    from utils.auth_utils import require_role
except ImportError:
    from admin_routes import admin_bp  # fallback

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///kamioi.db").replace("sqlite:///","")

def _get_db():
    return sqlite3.connect(DB_PATH)

@admin_bp.get("/debug/users/schema")
@require_role("admin")
def debug_users_schema():
    with _get_db() as conn:
        try:
            info = conn.execute("PRAGMA table_info(users)").fetchall()
            cols = [{"cid":r[0],"name":r[1],"type":r[2],"notnull":r[3],"dflt":r[4],"pk":r[5]} for r in info]
        except Exception as e:
            return jsonify(error=str(e), DB_PATH=DB_PATH), 200
    return jsonify(DB_PATH=DB_PATH, columns=cols), 200

@admin_bp.get("/debug/users/all")
@require_role("admin")
def debug_users_all():
    with _get_db() as conn:
        try:
            rows = conn.execute("SELECT id,email,password,role FROM users ORDER BY id").fetchall()
            out = [{"id":r[0],"email":r[1],"password":r[2],"role":r[3]} for r in rows]
        except Exception as e:
            return jsonify(error=str(e), DB_PATH=DB_PATH), 200
    return jsonify(DB_PATH=DB_PATH, users=out), 200

@admin_bp.get("/debug/users/find")
@require_role("admin")
def debug_users_find():
    email = request.args.get("email","")
    with _get_db() as conn:
        try:
            row = conn.execute("SELECT id,email,password,role FROM users WHERE email=?", (email,)).fetchone()
            if row:
                out = {"id":row[0],"email":row[1],"password":row[2],"role":row[3]}
            else:
                out = None
        except Exception as e:
            return jsonify(error=str(e), DB_PATH=DB_PATH), 200
    return jsonify(DB_PATH=DB_PATH, user=out), 200

@admin_bp.post("/debug/users/upsert")
@require_role("admin")
def debug_users_upsert():
    body = request.get_json() or {}
    email = body.get("email","user5@user5.com")
    password = body.get("password","user123")
    role = body.get("role","user")
    with _get_db() as conn:
        # Ensure table exists with a UNIQUE email so UPSERT works
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        """)
        # UPSERT on email (SQLite 3.24+)
        conn.execute("""
            INSERT INTO users (email,password,role)
            VALUES (?,?,?)
            ON CONFLICT(email) DO UPDATE SET
                password=excluded.password,
                role=excluded.role
        """, (email, password, role))
        conn.commit()
        row = conn.execute("SELECT id,email,password,role FROM users WHERE email=?", (email,)).fetchone()
    if row:
        out = {"id":row[0],"email":row[1],"password":row[2],"role":row[3]}
    else:
        out = None
    return jsonify(DB_PATH=DB_PATH, upserted=out), 200
from flask import request, jsonify
import os, sqlite3

try:
    from routes.admin_routes import admin_bp
    from utils.auth_utils import require_role
except ImportError:
    from admin_routes import admin_bp  # fallback

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///kamioi.db").replace("sqlite:///","")

def _get_db():
    return sqlite3.connect(DB_PATH)

def _users_columns(conn):
    info = conn.execute("PRAGMA table_info(users)").fetchall()
    # rows: (cid, name, type, notnull, dflt_value, pk)
    cols = []
    for r in info:
        cols.append({
            "cid": r[0], "name": r[1], "type": r[2],
            "notnull": bool(r[3]), "dflt": r[4], "pk": bool(r[5])
        })
    return cols

@admin_bp.post("/debug/users/upsert_flexible")
@require_role("admin")
def debug_users_upsert_flexible():
    body = request.get_json() or {}
    # caller may pass: email, password, role, name, etc.
    with _get_db() as conn:
        cols = _users_columns(conn)
        colnames = [c["name"] for c in cols]

        # Required minimums for login route:
        values = {
            "email": body.get("email", "user5@user5.com"),
            "password": body.get("password", "user123"),
            "role": body.get("role", "user"),
        }

        # If table has a NOT NULL "name", provide a default derived from email (or passed-in)
        if "name" in colnames:
            if body.get("name"):
                values["name"] = body["name"]
            else:
                local_part = values["email"].split("@")[0]
                values["name"] = local_part.replace(".", " ").title()

        # Any other NOT NULL columns without defaults? give benign defaults
        for c in cols:
            n = c["name"]
            if n in ("id",):  # let SQLite assign PK
                continue
            if c["notnull"] and n not in values:
                # fallback defaults by type
                t = (c["type"] or "").upper()
                if "CHAR" in t or "TEXT" in t or "CLOB" in t:
                    values[n] = ""
                elif "INT" in t:
                    values[n] = 0
                elif "REAL" in t or "FLOA" in t or "DOUB" in t:
                    values[n] = 0.0
                else:
                    values[n] = ""

        # Build column/value lists (excluding unknown columns)
        final_cols = [k for k in values.keys() if k in colnames and k != "id"]
        placeholders = ",".join(["?"] * len(final_cols))
        insert_sql = f"INSERT INTO users ({','.join(final_cols)}) VALUES ({placeholders})"

        # Try insert; if UNIQUE(email) exists we may need to update instead
        try:
            conn.execute(insert_sql, tuple(values[k] for k in final_cols))
            conn.commit()
        except sqlite3.IntegrityError:
            # Try UPDATE ON email if column exists
            if "email" in colnames:
                set_cols = [k for k in final_cols if k != "email"]
                if set_cols:
                    set_clause = ",".join([f"{k}=?" for k in set_cols])
                    update_sql = f"UPDATE users SET {set_clause} WHERE email=?"
                    conn.execute(update_sql, tuple(values[k] for k in set_cols) + (values["email"],))
                    conn.commit()

        row = conn.execute("SELECT * FROM users WHERE email=?", (values["email"],)).fetchone()
        if row is None:
            # Return shaped error with schema to help us iterate if needed
            return jsonify(ok=False, reason="insert/update failed", DB_PATH=DB_PATH, columns=cols, tried=values), 200

        # shape the row as dict
        cur = conn.execute("PRAGMA table_info(users)")
        names = [r[1] for r in cur.fetchall()]
        result = dict(zip(names, row))
        return jsonify(ok=True, DB_PATH=DB_PATH, upserted=result), 200
