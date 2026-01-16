"""
Simple Family Routes for Kamioi Platform v10072025
Using mock data temporarily to get system working
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random

family_bp = Blueprint('family', __name__)

# Family authentication endpoints
@family_bp.route('/auth/login', methods=['POST'])
def family_login():
    """Family login endpoint"""
    data = request.get_json()
    email = data.get('email', '')
    
    return jsonify({
        'success': True,
        'message': 'Family login successful',
        'data': {
            'user': {
                'id': 3,
                'email': email,
                'role': 'user',
                'account_type': 'family'
            },
            'token': 'mock_token_family_123'
        }
    })

@family_bp.route('/auth/me', methods=['GET'])
def family_auth_me():
    """Get current family user profile"""
    return jsonify({
        'success': True,
        'data': {
            'id': 3,
            'email': 'family@kamioi.com',
            'name': 'Family User',
            'role': 'user',
            'type': 'family',
            'account_type': 'family'
        }
    })

@family_bp.route('/auth/logout', methods=['POST'])
def family_logout():
    """Family logout endpoint"""
    return jsonify({
        'success': True,
        'message': 'Family logout successful'
    })

# Family Dashboard endpoints
@family_bp.route('/dashboard/overview', methods=['GET'])
def get_family_dashboard_overview():
    """Get family dashboard overview"""
    return jsonify({
        'success': True,
        'data': {
            'family_members': [],
            'shared_portfolio': {
                'total_value': 0.00,
                'total_invested': 0.00,
                'holdings': []
            },
            'family_goals': [],
            'quick_stats': {
                'total_members': 0,
                'active_goals': 0,
                'monthly_contributions': 0.00
            }
        }
    })

@family_bp.route('/transactions', methods=['GET'])
def get_family_transactions():
    """Get family transactions"""
    return jsonify({
        'success': True,
        'data': []
    })

@family_bp.route('/members', methods=['GET'])
def get_family_members():
    """Get family members"""
    return jsonify({
        'success': True,
        'data': []
    })

@family_bp.route('/portfolio', methods=['GET'])
def get_family_portfolio():
    """Get family portfolio"""
    return jsonify({
        'success': True,
        'data': {
            'total_value': 0.00,
            'total_invested': 0.00,
            'total_gains': 0.00,
            'gain_percentage': 0.00,
            'holdings': []
        }
    })

@family_bp.route('/goals', methods=['GET'])
def get_family_goals():
    """Get family goals"""
    return jsonify({
        'success': True,
        'data': []
    })

@family_bp.route('/quick-stats', methods=['GET'])
def get_family_quick_stats():
    """Get family quick stats"""
    return jsonify({
        'success': True,
        'data': {
            'total_members': 0,
            'active_goals': 0,
            'monthly_contributions': 0.00,
            'portfolio_performance': 0.00
        }
    })

@family_bp.route('/ai/insights', methods=['GET'])
def get_family_ai_insights():
    """Get family AI insights"""
    return jsonify({
        'success': True,
        'data': {
            'recommendations': [],
            'insights': []
        }
    })

@family_bp.route('/notifications', methods=['GET'])
def get_family_notifications():
    """Get family notifications"""
    return jsonify({
        'success': True,
        'data': []
    })

@family_bp.route('/settings', methods=['GET'])
def get_family_settings():
    """Get family settings"""
    return jsonify({
        'success': True,
        'data': {
            'family_name': '',
            'notifications_enabled': False,
            'auto_invest': False,
            'roundup_amount': 0.00,
            'investment_risk': 'low'
        }
    })

@family_bp.route('/mapping-history', methods=['GET'])
def get_family_mapping_history():
    """Get family mapping history"""
    return jsonify({
        'success': True,
        'data': {
            'mappings': [],
            'stats': {
                'total_mappings': 0,
                'approved_mappings': 0,
                'pending_mappings': 0,
                'accuracy_rate': 0.0
            }
        }
    })

@family_bp.route('/rewards', methods=['GET'])
def get_family_rewards():
    """Get family rewards"""
    return jsonify({
        'success': True,
        'data': {
            'rewards': [],
            'points': {
                'total': 0
            },
            'tier': 'Bronze',
            'next_tier_points': 100
        }
    })

@family_bp.route('/leaderboard', methods=['GET'])
def get_family_leaderboard():
    """Get family leaderboard"""
    return jsonify({
        'success': True,
        'data': {
            'leaderboard': []
        }
    })

# Additional missing endpoints
@family_bp.route('/analytics', methods=['GET'])
def get_family_analytics():
    """Get family analytics data"""
    return jsonify({
        'success': True,
        'data': {
            'family_metrics': {
                'total_savings': 0.0,
                'monthly_savings': 0.0,
                'savings_growth': 0.0,
                'goal_completion_rate': 0.0
            },
            'charts': {
                'savings_trend': [],
                'expense_breakdown': [],
                'goal_progress': []
            }
        }
    })

@family_bp.route('/savings', methods=['GET'])
def get_family_savings():
    """Get family savings data"""
    return jsonify({
        'success': True,
        'data': {
            'total_savings': 0.0,
            'monthly_savings': 0.0,
            'savings_goals': [],
            'savings_breakdown': []
        }
    })

@family_bp.route('/budget', methods=['GET'])
def get_family_budget():
    """Get family budget data"""
    return jsonify({
        'success': True,
        'data': {
            'total_budget': 0.0,
            'monthly_budget': 0.0,
            'budget_categories': [],
            'budget_breakdown': []
        }
    })

@family_bp.route('/roundups/total', methods=['GET'])
def get_family_roundups_total():
    """Get family roundups total"""
    return jsonify({
        'success': True,
        'data': {
            'total_roundups': 0.0,
            'monthly_roundups': 0.0,
            'roundups_count': 0,
            'pending_roundups': 0.0
        }
    })
