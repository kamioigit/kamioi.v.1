from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import sqlite3, os

auth_bp = Blueprint("auth", __name__)

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///kamioi.db").replace("sqlite:///", "")

def _get_db():
    return sqlite3.connect(DB_PATH)

@auth_bp.post("/user/auth/login")
def user_login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    with _get_db() as conn:
        row = conn.execute(
            "SELECT id, email FROM users WHERE email=? AND password=?",
            (email, password)
        ).fetchone()
    if not row:
        return jsonify(message="Invalid credentials"), 401
    # ✅ identity must be a string
    token = create_access_token(
        identity=str(row[0]),
        additional_claims={"role": "user", "email": row[1]}
    )
    return jsonify(access_token=token), 200

@auth_bp.post("/admin/auth/login")
def admin_login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    with _get_db() as conn:
        row = conn.execute(
            "SELECT id, email FROM admins WHERE email=? AND password=?",
            (email, password)
        ).fetchone()
    if not row:
        return jsonify(message="Invalid credentials"), 401
    token = create_access_token(
        identity=str(row[0]),
        additional_claims={"role": "admin", "email": row[1]}
    )
    return jsonify(access_token=token), 200
