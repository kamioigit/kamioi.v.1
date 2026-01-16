from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt, verify_jwt_in_request
from utils.auth_utils import require_role

user_bp = Blueprint("user", __name__)

@user_bp.get("/auth/me")
@require_role("user")
def me():
    verify_jwt_in_request()
    return jsonify(
        id=get_jwt_identity(),
        **get_jwt()
    ), 200

@user_bp.get("/transactions")
@require_role("user")
def transactions():
    return jsonify(transactions=[]), 200
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
import sqlite3, os, time
from utils.auth_utils import require_role
from routes.user_routes import user_bp

DB = os.getenv("DATABASE_URL","sqlite:///kamioi.db").replace("sqlite:///","")

def _db(): return sqlite3.connect(DB)

@user_bp.post("/debug/seed-one-transaction")
@require_role("user")
def seed_txn():
    who = get_jwt_identity() or {}
    uid = who if isinstance(who, str) else who.get("sub") or who.get("id")
    if not uid: return jsonify(ok=False, reason="no user id in token"), 400
    with _db() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS transactions(
            id INTEGER PRIMARY KEY,
            user_id TEXT NOT NULL,
            amount REAL NOT NULL,
            merchant TEXT,
            status TEXT,
            created_at TEXT NOT NULL
        )""")
        c.execute("INSERT INTO transactions (user_id,amount,merchant,status,created_at) VALUES (?,?,?,?,?)",
                  (str(uid), 12.34, "Coffee Shop", "posted", time.strftime("%Y-%m-%d %H:%M:%S")))
        c.commit()
    return jsonify(ok=True, seeded=True), 200
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from utils.auth_utils import require_role
from routes.user_routes import user_bp

import sqlite3, os, time, datetime

DB = os.getenv("DATABASE_URL","sqlite:///kamioi.db").replace("sqlite:///","")

def _db(): 
    return sqlite3.connect(DB)

def _columns(conn, table):
    # returns list of dicts: {cid, name, type, notnull, dflt_value, pk}
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return [
        {
            "cid": r[0],
            "name": r[1],
            "type": r[2],
            "notnull": r[3],
            "dflt": r[4],
            "pk": r[5],
        } for r in rows
    ]

def _now_date():
    return datetime.date.today().strftime("%Y-%m-%d")

def _now_ts():
    return time.strftime("%Y-%m-%d %H:%M:%S")

@user_bp.post("/debug/seed-one-transaction")
@require_role("user")
def seed_txn():
    ident = get_jwt_identity()
    # identity may be a string id or a dict; normalize to str user id
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)

    with _db() as c:
        cols = _columns(c, "transactions")
        if not cols:
            # create a minimal table if it doesn't exist
            c.execute("""
            CREATE TABLE IF NOT EXISTS transactions(
              id INTEGER PRIMARY KEY,
              user_id TEXT NOT NULL,
              amount REAL NOT NULL,
              merchant TEXT,
              status TEXT,
              date TEXT NOT NULL,
              created_at TEXT NOT NULL
            )
            """)
            cols = _columns(c, "transactions")

        # base defaults (will only apply if those columns exist)
        base = {
            "user_id": uid,
            "amount": 12.34,
            "merchant": "Coffee Shop",
            "status": "posted",
            "date": _now_date(),
            "created_at": _now_ts(),
            "updated_at": _now_ts(),
            "account_type": "checking",
            "total_debit": 12.34,    # for schemas that require it
            "total_credit": 0.0,
        }

        # ensure any NOT NULL columns get something
        colnames = [cinfo["name"] for cinfo in cols]
        notnull_cols = [cinfo["name"] for cinfo in cols if cinfo["notnull"] == 1 and cinfo["name"].lower() != "id"]

        for nn in notnull_cols:
            if nn not in base:
                # try a generic safe default by type-ish guess
                t = next((ci["type"].upper() for ci in cols if ci["name"] == nn), "")
                if "CHAR" in t or "TEXT" in t or "CLOB" in t:
                    base[nn] = ""
                elif "INT" in t:
                    base[nn] = 0
                elif "REAL" in t or "FLOA" in t or "DOUB" in t or "NUM" in t:
                    base[nn] = 0.0
                else:
                    base[nn] = ""

        # only insert columns that actually exist
        insert_cols = [k for k in base.keys() if k in colnames]
        placeholders = ",".join(["?"] * len(insert_cols))
        sql = f"INSERT INTO transactions ({','.join(insert_cols)}) VALUES ({placeholders})"
        c.execute(sql, tuple(base[k] for k in insert_cols))
        c.commit()

    return jsonify(ok=True, inserted_columns=insert_cols), 200


@user_bp.get("/transactions")
@require_role("user")
def list_transactions():
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)

    with _db() as c:
        # build a projection that tolerates different schemas
        cols = _columns(c, "transactions")
        names = {ci["name"] for ci in cols}

        fields = []
        # always include id if present
        if "id" in names: fields.append("id")
        # include merchant if present
        if "merchant" in names: fields.append("merchant")
        # include amount-compatible fields
        if "amount" in names:
            fields.append("amount")
        elif "total_debit" in names:
            fields.append("total_debit as amount")
        # include a date-ish column for sorting/UX
        if "date" in names:
            fields.append("date")
        if "created_at" in names:
            fields.append("created_at")

        if not fields:
            # fall back: select user_id only to not error out
            fields = ["user_id"]

        sql = f"SELECT {', '.join(fields)} FROM transactions WHERE user_id=? ORDER BY COALESCE(created_at, date) DESC"
        rows = c.execute(sql, (uid,)).fetchall()

    # jsonify a list of dicts
    keys = [f.split(" as ")[-1] if " as " in f else f for f in fields]
    data = [dict(zip(keys, r)) for r in rows]
    return jsonify(transactions=data), 200
