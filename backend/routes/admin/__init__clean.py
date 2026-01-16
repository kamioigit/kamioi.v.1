"""
Admin Routes for Kamioi Platform v10072025
All 19 Admin Dashboard Modules
"""

from flask import Blueprint, request, jsonify

admin_bp = Blueprint('admin', __name__)

# Import all admin route modules
from .overview import *
from .analytics import *
from .transactions import *
from .llm_center import *
from .ml_dashboard import *
from .llm_data_management import *
from .notifications import *

# Admin authentication endpoints
@admin_bp.route('/auth/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    data = request.get_json()
    email = data.get('email', '')
    
    return jsonify({
        'success': True,
        'message': 'Admin login successful',
        'data': {
            'user': {
                'id': 1,
                'email': email,
                'role': 'admin',
                'account_type': 'admin'
            },
            'token': 'mock_token_123'
        }
    })

@admin_bp.route('/auth/logout', methods=['POST'])
def admin_logout():
    """Admin logout endpoint"""
    return jsonify({
        'success': True,
        'message': 'Admin logout successful'
    })

@admin_bp.route('/health', methods=['GET'])
def admin_health():
    """Admin health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'admin',
        'timestamp': '2025-01-08T00:00:00Z'
    })


