"""
User Routes for Kamioi Platform v10072025
User Dashboard: Transactions, Dashboard, Portfolio, Goals, AI Insights, Analytics, Notifications, Settings, Cross-Dashboard Chat
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random

user_bp = Blueprint('user', __name__)

# Test route to verify blueprint is working
@user_bp.route('/test', methods=['GET'])
def test_route():
    """Test route to verify user blueprint is working"""
    return jsonify({
        'success': True,
        'message': 'User blueprint is working!'
    })

# Using mock data temporarily to get system working

# Authentication endpoints
@user_bp.route('/auth/login', methods=['POST'])
def user_login():
    """Regular user login endpoint"""
    data = request.get_json()
    email = data.get('email', '')
    
    return jsonify({
        'success': True,
        'message': 'User login successful',
        'data': {
            'token': 'mock_token_user_12345',
            'user': {
                'id': 4,
                'email': email,
                'name': 'Regular User',
                'type': 'user',
                'role': 'user'
            }
        }
    })

@user_bp.route('/auth/logout', methods=['POST'])
def user_logout():
    """User logout endpoint"""
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    })

@user_bp.route('/auth/me', methods=['GET'])
def get_current_user():
    """Get current user profile"""
    return jsonify({
        'success': True,
        'data': {
            'id': 1,
            'email': 'user@kamioi.com',
            'name': 'Current User',
            'type': 'user',
            'role': 'user'
        }
    })

# User Dashboard endpoints
@user_bp.route('/dashboard/overview', methods=['GET'])
def get_user_dashboard_overview():
    """Get user dashboard overview from database"""
    try:
        from database_manager import db_manager
        
        # Get dashboard overview from database
        overview = db_manager.get_user_dashboard_overview(1)  # Using user_id = 1 for demo
        
        return jsonify({
            'success': True,
            'data': overview
        })
    except Exception as e:
        print(f"Error fetching user dashboard overview: {e}")
        # Return empty data if database fails
        return jsonify({
            'success': True,
            'data': {
                'portfolio_value': 0.00,
                'total_invested': 0.00,
                'total_gains': 0.00,
                'gain_percentage': 0.0,
                'recent_transactions': [],
                'goals_progress': []
            }
        })

@user_bp.route('/portfolio', methods=['GET'])
def get_user_portfolio():
    """Get user portfolio data"""
    return jsonify({
        'success': True,
        'data': {
            'total_value': 0.00,
            'total_invested': 0.00,
            'total_gains': 0.00,
            'holdings': []
        }
    })

@user_bp.route('/portfolio/data', methods=['GET'])
def get_user_portfolio_data():
    """Get user portfolio data (alternative endpoint)"""
    return jsonify({
        'success': True,
        'data': {
            'total_value': 0.00,
            'total_invested': 0.00,
            'total_gains': 0.00,
            'holdings': []
        }
    })

@user_bp.route('/transactions', methods=['GET'])
def get_user_transactions():
    """Get user transactions from database"""
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))
    
    try:
        from database_manager import db_manager
        
        # Get transactions from database directly with mapping information
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT t.*, 
                   lm.ticker as mapping_ticker,
                   lm.status as mapping_status,
                   lm.confidence as mapping_confidence,
                   lm.company_name as mapping_company_name,
                   lm.id as mapping_id
            FROM transactions t
            LEFT JOIN llm_mappings lm ON t.id = lm.transaction_id
            WHERE t.user_id = ? OR t.user_id = ?
            ORDER BY t.date DESC 
            LIMIT ? OFFSET ?
        ''', ('user1', 'user@kamioi.com', limit, offset))
        
        columns = [description[0] for description in cursor.description]
        transactions = []
        
        for row in cursor.fetchall():
            transaction = dict(zip(columns, row))
            
            # Update transaction status based on mapping status
            if transaction.get('mapping_status'):
                if transaction['mapping_status'] == 'auto_applied':
                    transaction['status'] = 'completed'
                    transaction['ticker'] = transaction.get('mapping_ticker')
                elif transaction['mapping_status'] == 'pending':
                    transaction['status'] = 'pending-mapping'
                    transaction['ticker'] = transaction.get('mapping_ticker')
                elif transaction['mapping_status'] == 'needs_review':
                    transaction['status'] = 'needs-recognition'
                    transaction['ticker'] = transaction.get('mapping_ticker')
            
            # Add mapping information
            if transaction.get('mapping_id'):
                transaction['mappingId'] = transaction['mapping_id']
                transaction['mappingConfidence'] = transaction.get('mapping_confidence')
                transaction['mappingCompanyName'] = transaction.get('mapping_company_name')
            
            transactions.append(transaction)
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': transactions
        })
    except Exception as e:
        print(f"Error fetching user transactions: {e}")
        # Return empty data if database fails
        return jsonify({
            'success': True,
            'data': []
        })

@user_bp.route('/goals', methods=['GET'])
def get_user_goals():
    """Get user goals - using mock data temporarily"""
    return jsonify({
        'success': True,
        'data': []
    })

@user_bp.route('/ai/insights', methods=['GET'])
def get_user_ai_insights():
    """Get AI insights for user"""
    return jsonify({
        'success': True,
        'data': {
            'recommendations': [],
            'market_insights': [],
            'personalized_tips': []
        }
    })

@user_bp.route('/analytics', methods=['GET'])
def get_user_analytics():
    """Get user analytics"""
    return jsonify({
        'success': True,
        'data': {
            'performance_metrics': {},
            'spending_analysis': {},
            'investment_trends': {}
        }
    })

@user_bp.route('/notifications', methods=['GET'])
def get_user_notifications():
    """Get user notifications - using mock data temporarily"""
    return jsonify({
        'success': True,
        'data': []
    })

@user_bp.route('/settings', methods=['GET'])
def get_user_settings():
    """Get user settings"""
    return jsonify({
        'success': True,
        'data': {
            'profile': {},
            'preferences': {},
            'security': {}
        }
    })

@user_bp.route('/chat/messages', methods=['GET'])
def get_user_chat_messages():
    """Get cross-dashboard chat messages"""
    return jsonify({
        'success': True,
        'data': []
    })

@user_bp.route('/roundups/total', methods=['GET'])
def get_user_roundups_total():
    """Get total round-ups from database"""
    try:
        from database_manager import db_manager
        
        # Get round-ups from database
        roundups = db_manager.get_user_roundups_total(1)  # Using user_id = 1 for demo
        
        return jsonify({
            'success': True,
            'data': roundups
        })
    except Exception as e:
        print(f"Error fetching user round-ups: {e}")
        # Return empty data if database fails
        return jsonify({
            'success': True,
            'data': {
                'total_roundups': 0.00,
                'monthly_roundups': 0.00,
                'roundups_count': 0
            }
        })

@user_bp.route('/fees/total', methods=['GET'])
def get_user_fees_total():
    """Get total fees paid from database"""
    try:
        from database_manager import db_manager
        
        # Get fees from database
        fees = db_manager.get_user_fees_total(1)  # Using user_id = 1 for demo
        
        return jsonify({
            'success': True,
            'data': fees
        })
    except Exception as e:
        print(f"Error fetching user fees: {e}")
        # Return empty data if database fails
        return jsonify({
            'success': True,
            'data': {
                'total_fees': 0.00,
                'monthly_fees': 0.00,
                'fees_count': 0
            }
        })

@user_bp.route('/mapping-history', methods=['GET'])
def get_user_mapping_history():
    """Get user mapping history"""
    user_id = request.args.get('user_id', 'user@kamioi.com')
    return jsonify({
        'success': True,
        'data': {
            'mappings': [],
            'summary': {
                'total_mappings': 0,
                'approved_mappings': 0,
                'pending_mappings': 0,
                'rejected_mappings': 0,
                'average_confidence': 0.0,
                'total_transactions': 0,
                'total_amount': 0.00
            },
            'categories': {}
        }
    })

@user_bp.route('/rewards', methods=['GET'])
def get_user_rewards():
    """Get user rewards data"""
    return jsonify({
        'success': True,
        'data': {
            'current_rewards': {
                'points_balance': 0,
                'cashback_balance': 0.00,
                'tier': 'Bronze',
                'next_tier': 'Silver',
                'points_to_next_tier': 100
            },
            'recent_rewards': [],
            'available_rewards': [],
            'tier_benefits': {},
            'monthly_summary': {
                'points_earned': 0,
                'cashback_earned': 0.00,
                'transactions_count': 0,
                'total_spent': 0.00,
                'average_cashback_rate': 0.0
            }
        }
    })


