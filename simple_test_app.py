#!/usr/bin/env python3
"""
Simple test app with just admin blueprint
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

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': '2025-10-08T12:00:00Z'
    })

# Test endpoint
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'Test endpoint working',
        'blueprints': 'None registered yet'
    })

# Import and register admin blueprint
try:
    from backend.routes.admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    print("Admin blueprint registered successfully")
    
    # Update test endpoint
    @app.route('/api/test', methods=['GET'])
    def test():
        return jsonify({
            'message': 'Test endpoint working',
            'blueprints': 'Admin blueprint registered'
        })
        
except Exception as e:
    print(f"Error registering admin blueprint: {e}")
    import traceback
    traceback.print_exc()

if __name__ == '__main__':
    print("Simple test app starting...")
    print("Available routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.methods} {rule.rule} -> {rule.endpoint}")
    
    app.run(host='0.0.0.0', port=5003, debug=True)
