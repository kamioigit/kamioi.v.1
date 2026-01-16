"""
Admin Overview Routes - Platform Overview Module
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random
from . import admin_bp

# Platform Overview endpoints
@admin_bp.route('/overview/stats', methods=['GET'])
def get_platform_stats():
    """Get platform overview statistics"""
    return jsonify({
        'success': True,
        'data': {
            'total_users': 0,
            'total_transactions': 0,
            'total_revenue': 0.00,
            'total_portfolio_value': 0.00,
            'active_families': 0,
            'active_businesses': 0,
            'system_health': 'inactive',
            'uptime': '0%'
        }
    })

@admin_bp.route('/overview/recent-activity', methods=['GET'])
def get_recent_activity():
    """Get recent platform activity"""
    activities = [
        {
            'id': 1,
            'type': 'user_registration',
            'description': 'New user registered',
            'timestamp': (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
            'user': 'john@example.com'
        },
        {
            'id': 2,
            'type': 'transaction',
            'description': 'Large transaction processed',
            'timestamp': (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
            'amount': 5000.00
        },
        {
            'id': 3,
            'type': 'system',
            'description': 'System backup completed',
            'timestamp': (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            'status': 'success'
        }
    ]
    
    return jsonify({
        'success': True,
        'data': activities
    })

@admin_bp.route('/overview/system-status', methods=['GET'])
def get_system_status():
    """Get system status information"""
    return jsonify({
        'success': True,
        'data': {
            'status': 'healthy',
            'uptime': '99.9%',
            'active_users': 1247,
            'total_transactions': 15678,
            'system_load': 45,
            'memory_usage': 68,
            'disk_usage': 23
        }
    })

@admin_bp.route('/overview/revenue-trend', methods=['GET'])
def get_revenue_trend():
    """Get revenue trend data"""
    dates = []
    revenue = []
    
    for i in range(30):
        date = datetime.utcnow() - timedelta(days=29-i)
        dates.append(date.strftime('%Y-%m-%d'))
        revenue.append(round(random.uniform(10000, 20000), 2))
    
    return jsonify({
        'success': True,
        'data': {
            'dates': dates,
            'revenue': revenue
        }
    })

@admin_bp.route('/overview/user-growth', methods=['GET'])
def get_user_growth():
    """Get user growth data"""
    dates = []
    users = []
    
    for i in range(30):
        date = datetime.utcnow() - timedelta(days=29-i)
        dates.append(date.strftime('%Y-%m-%d'))
        users.append(1200 + i * 2 + random.randint(-5, 10))
    
    return jsonify({
        'success': True,
        'data': {
            'dates': dates,
            'users': users
        }
    })


