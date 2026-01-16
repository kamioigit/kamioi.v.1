#!/usr/bin/env python3
"""
Minimal Flask app to test endpoint registration
"""

from flask import Flask, jsonify
from flask_cors import CORS
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Create Flask app
app = Flask(__name__)
CORS(app)

# Import and register admin blueprint
try:
    from backend.routes.admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    print("Admin blueprint registered successfully")
except Exception as e:
    print(f"Error registering admin blueprint: {e}")

# Import and register other blueprints
try:
    from backend.routes.user import user_bp
    app.register_blueprint(user_bp, url_prefix='/api/user')
    print("User blueprint registered successfully")
except Exception as e:
    print(f"Error registering user blueprint: {e}")

try:
    from backend.routes.family import family_bp
    app.register_blueprint(family_bp, url_prefix='/api/family')
    print("Family blueprint registered successfully")
except Exception as e:
    print(f"Error registering family blueprint: {e}")

try:
    from backend.routes.business import business_bp
    app.register_blueprint(business_bp, url_prefix='/api/business')
    print("Business blueprint registered successfully")
except Exception as e:
    print(f"Error registering business blueprint: {e}")

try:
    from backend.routes.financial import financial_bp
    app.register_blueprint(financial_bp, url_prefix='/api/financial')
    print("Financial blueprint registered successfully")
except Exception as e:
    print(f"Error registering financial blueprint: {e}")

try:
    from backend.routes.ml import ml_bp
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    print("ML blueprint registered successfully")
except Exception as e:
    print(f"Error registering ML blueprint: {e}")

try:
    from backend.routes.llm_data import llm_data_bp
    app.register_blueprint(llm_data_bp, url_prefix='/api/llm-data')
    print("LLM Data blueprint registered successfully")
except Exception as e:
    print(f"Error registering LLM Data blueprint: {e}")

try:
    from backend.routes.messages import messages_bp
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    print("Messages blueprint registered successfully")
except Exception as e:
    print(f"Error registering Messages blueprint: {e}")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': '2025-10-08T12:00:00Z'
    })

if __name__ == '__main__':
    print("Minimal Flask app starting...")
    print("Available routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.methods} {rule.rule} -> {rule.endpoint}")
    
    app.run(host='0.0.0.0', port=5002, debug=True)
