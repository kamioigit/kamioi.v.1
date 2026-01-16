from flask import Blueprint, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from utils.auth_utils import require_role
import sqlite3, os, time, datetime

user_bp = Blueprint("user", __name__)

DB = os.getenv("DATABASE_URL", "sqlite:///kamioi.db").replace("sqlite:///", "")

def _db():
    return sqlite3.connect(DB)

def _columns(conn, table):
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

@user_bp.get("/auth/me")
@require_role("user")
def me():
    verify_jwt_in_request()
    # return full claims to help debugging
    return jsonify(get_jwt()), 200

@user_bp.post("/debug/seed-one-transaction")
@require_role("user")
def seed_txn():
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str, int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)

    with _db() as c:
        cols = _columns(c, "transactions")
        if not cols:
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

        colnames = [ci["name"] for ci in cols]

        base = {
            "user_id": uid,
            "amount": 12.34,
            "merchant": "Coffee Shop",
            "status": "posted",
            "date": _now_date(),
            "created_at": _now_ts(),
            "updated_at": _now_ts(),
            "account_type": "checking",
            "total_debit": 12.34,
            "total_credit": 0.0,
        }

        # ensure NOT NULL columns are satisfied
        for ci in cols:
            if ci["notnull"] == 1 and ci["name"].lower() != "id" and ci["name"] not in base:
                t = (ci["type"] or "").upper()
                if "CHAR" in t or "TEXT" in t or "CLOB" in t:
                    base[ci["name"]] = ""
                elif "INT" in t:
                    base[ci["name"]] = 0
                elif any(x in t for x in ["REAL","FLOA","DOUB","NUM"]):
                    base[ci["name"]] = 0.0
                else:
                    base[ci["name"]] = ""

        insert_cols = [k for k in base.keys() if k in colnames]
        placeholders = ",".join(["?"] * len(insert_cols))
        sql = f"INSERT INTO transactions ({','.join(insert_cols)}) VALUES ({placeholders})"
        c.execute(sql, tuple(base[k] for k in insert_cols))
        c.commit()

    return jsonify(ok=True, inserted_columns=insert_cols), 200

@user_bp.get("/transactions")
@require_role("user")
def list_transactions():
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)

    with _db() as c:
        cols = _columns(c, "transactions")
        names = {ci["name"] for ci in cols}

        fields = []
        if "id" in names: fields.append("id")
        if "merchant" in names: fields.append("merchant")
        if "amount" in names:
            fields.append("amount")
        elif "total_debit" in names:
            fields.append("total_debit as amount")
        if "date" in names:
            fields.append("date")
        if "created_at" in names:
            fields.append("created_at")

        if not fields:
            fields = ["user_id"]

        sql = f"SELECT {', '.join(fields)} FROM transactions WHERE user_id=? ORDER BY COALESCE(created_at, date) DESC"
        rows = c.execute(sql, (uid,)).fetchall()

    keys = [f.split(" as ")[-1] if " as " in f else f for f in fields]
    data = [dict(zip(keys, r)) for r in rows]
    return jsonify(transactions=data), 200

@user_bp.get("/portfolio")
@require_role("user")
def get_portfolio():
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)

    # VERY BASIC demo portfolio derived from transactions if present
    with _db() as c:
        try:
            rows = c.execute("SELECT amount FROM transactions WHERE user_id=?", (uid,)).fetchall()
            total = sum(r[0] for r in rows) if rows else 0.0
        except Exception:
            total = 0.0

    demo = {
        "cash": round(1000 + total, 2),
        "positions": [
            {"symbol":"AAPL","qty":1,"price":180.0},
            {"symbol":"MSFT","qty":1,"price":320.0},
        ],
        "updated_at": _now_ts()
    }
    return jsonify(portfolio=demo), 200

@user_bp.get("/goals")
@require_role("user")
def get_goals():
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    # Return empty goals for now
    return jsonify(goals=[]), 200

@user_bp.get("/ai/recommendations")
@require_role("user")
def get_ai_recommendations():
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    # Return empty recommendations for now
    return jsonify(recommendations=[]), 200

@user_bp.get("/notifications")
@require_role("user")
def get_notifications():
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    # Return empty notifications for now
    return jsonify(notifications=[]), 200

@user_bp.get("/roundups/total")
@require_role("user")
def get_total_roundups():
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    # Return 0 for now
    return jsonify(total_roundups=0), 200

@user_bp.get("/fees/total")
@require_role("user")
def get_total_fees():
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    # Return 0 for now
    return jsonify(total_fees=0), 200

@user_bp.post("/transactions")
@require_role("user")
def add_transaction():
    verify_jwt_in_request()
    from flask import request
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    data = request.get_json() or {}
    
    # Create a simple transaction record
    transaction = {
        "id": int(time.time() * 1000),
        "user_id": uid,
        "amount": data.get("amount", 0),
        "merchant": data.get("merchant", ""),
        "date": data.get("date", _now_date()),
        "status": "pending"
    }
    
    return jsonify(transaction), 201

@user_bp.put("/transactions/<int:transaction_id>")
@require_role("user")
def update_transaction(transaction_id):
    verify_jwt_in_request()
    from flask import request
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    data = request.get_json() or {}
    
    # Return updated transaction
    transaction = {
        "id": transaction_id,
        "user_id": uid,
        "amount": data.get("amount", 0),
        "merchant": data.get("merchant", ""),
        "date": data.get("date", _now_date()),
        "status": data.get("status", "pending")
    }
    
    return jsonify(transaction), 200

@user_bp.delete("/transactions/<int:transaction_id>")
@require_role("user")
def delete_transaction(transaction_id):
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    # Return success
    return jsonify({"message": "Transaction deleted"}), 200

@user_bp.post("/goals")
@require_role("user")
def create_goal():
    verify_jwt_in_request()
    from flask import request
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    data = request.get_json() or {}
    
    # Create a simple goal record
    goal = {
        "id": int(time.time() * 1000),
        "user_id": uid,
        "title": data.get("title", ""),
        "target_amount": data.get("target_amount", 0),
        "current_amount": 0,
        "created_at": _now_ts()
    }
    
    return jsonify(goal), 201

@user_bp.put("/goals/<int:goal_id>")
@require_role("user")
def update_goal(goal_id):
    verify_jwt_in_request()
    from flask import request
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    data = request.get_json() or {}
    
    # Return updated goal
    goal = {
        "id": goal_id,
        "user_id": uid,
        "title": data.get("title", ""),
        "target_amount": data.get("target_amount", 0),
        "current_amount": data.get("current_amount", 0),
        "updated_at": _now_ts()
    }
    
    return jsonify(goal), 200

@user_bp.delete("/goals/<int:goal_id>")
@require_role("user")
def delete_goal(goal_id):
    verify_jwt_in_request()
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    # Return success
    return jsonify({"message": "Goal deleted"}), 200

@user_bp.post("/roundups/process")
@require_role("user")
def process_roundup():
    verify_jwt_in_request()
    from flask import request
    ident = get_jwt_identity()
    uid = ident if isinstance(ident, (str,int)) else (ident.get("sub") or ident.get("id"))
    uid = str(uid)
    
    data = request.get_json() or {}
    
    # Return success
    return jsonify({"message": "Round-up processed", "amount": data.get("amount", 0)}), 200
