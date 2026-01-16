"""
Admin Transactions Routes - Transactions Module
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random
from . import admin_bp

@admin_bp.route('/transactions', methods=['GET'])
def get_admin_transactions():
    """Get all transactions for admin view"""
    return jsonify({
        'success': True,
        'data': []
    })


