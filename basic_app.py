#!/usr/bin/env python3
"""
Basic Flask app to test
"""

from flask import Flask, jsonify
from flask_cors import CORS

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
        'message': 'Basic app working'
    })

if __name__ == '__main__':
    print("Basic Flask app starting...")
    print("Available routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.methods} {rule.rule} -> {rule.endpoint}")
    
    app.run(host='0.0.0.0', port=5004, debug=True)
