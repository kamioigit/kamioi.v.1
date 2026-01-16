"""
Business Routes for Kamioi Platform v10072025
Business Dashboard: Transaction, Overview, Team, Business Goals, Analytics, Reports, Settings, Quick Stats, Cross-Dashboard Chat
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random
from models import get_models

# Get database models
models = get_models()
User = models['User']
Transaction = models['Transaction']
Goal = models['Goal']
Portfolio = models['Portfolio']

business_bp = Blueprint('business', __name__)

# Business authentication endpoints
@business_bp.route('/auth/login', methods=['POST'])
def business_login():
    """Business login endpoint"""
    data = request.get_json()
    email = data.get('email', '')
    
    return jsonify({
        'success': True,
        'message': 'Business login successful',
        'data': {
            'token': 'mock_token_business_12345',
            'user': {
                'id': 3,
                'email': email,
                'name': 'Business User',
                'type': 'business',
                'role': 'business_owner'
            }
        }
    })

# Business Dashboard endpoints
@business_bp.route('/dashboard/overview', methods=['GET'])
def get_business_dashboard_overview():
    """Get business dashboard overview"""
    return jsonify({
        'success': True,
        'data': {
            'team_members': [],
            'business_portfolio': {
                'total_value': 0,
                'total_invested': 0,
                'holdings': []
            },
            'business_goals': [],
            'quick_stats': {
                'total_employees': 0,
                'active_projects': 0,
                'monthly_revenue': 0
            }
        }
    })

@business_bp.route('/transactions', methods=['GET'])
def get_business_transactions():
    """Get business transactions from database"""
    try:
        # Get business users (account_type = 'business')
        business_users = User.query.filter_by(account_type='business').all()
        business_user_ids = [user.id for user in business_users]
        
        if not business_user_ids:
            return jsonify({
                'success': True,
                'data': []
            })
        
        # Get transactions for business users
        transactions = Transaction.query.filter(
            Transaction.user_id.in_(business_user_ids)
        ).order_by(Transaction.created_at.desc()).all()
        
        # Convert to dict format
        transactions_data = []
        for transaction in transactions:
            user = next((u for u in business_users if u.id == transaction.user_id), None)
            transactions_data.append({
                'id': transaction.id,
                'amount': transaction.amount,
                'type': transaction.type,
                'description': transaction.description or f'{transaction.type} transaction',
                'date': transaction.created_at.isoformat() if transaction.created_at else None,
                'user_id': transaction.user_id,
                'user_name': user.name if user else 'Unknown User',
                'merchant': transaction.merchant,
                'category': transaction.category,
                'status': transaction.status
            })
        
        return jsonify({
            'success': True,
            'data': transactions_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'data': []
        })

@business_bp.route('/team', methods=['GET'])
def get_business_team():
    """Get business team members"""
    return jsonify({
        'success': True,
        'data': []
    })

@business_bp.route('/team/members', methods=['GET'])
def get_business_team_members():
    """Get business team members from database"""
    try:
        # Get business users from database
        business_users = User.query.filter_by(account_type='business').all()
        
        # Convert to team member format
        team_members = []
        for user in business_users:
            team_members.append({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'department': 'Business',  # Default department
                'status': 'active' if user.is_active else 'inactive',
                'join_date': user.created_at.strftime('%Y-%m-%d') if user.created_at else None,
                'performance_score': 0  # No performance tracking yet
            })
        
        return jsonify({
            'success': True,
            'data': team_members
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'data': []
        })

@business_bp.route('/goals', methods=['GET'])
def get_business_goals():
    """Get business goals from database"""
    try:
        # Get business users
        business_users = User.query.filter_by(account_type='business').all()
        business_user_ids = [user.id for user in business_users]
        
        if not business_user_ids:
            return jsonify({
                'success': True,
                'data': []
            })
        
        # Get goals for business users
        goals = Goal.query.filter(
            Goal.user_id.in_(business_user_ids)
        ).order_by(Goal.created_at.desc()).all()
        
        # Convert to dict format
        goals_data = [goal.to_dict() for goal in goals]
        
        return jsonify({
            'success': True,
            'data': goals_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'data': []
        })

@business_bp.route('/analytics', methods=['GET'])
def get_business_analytics():
    """Get business analytics"""
    return jsonify({
        'success': True,
        'data': {
            'financial_metrics': {},
            'team_performance': {},
            'goal_progress': {}
        }
    })

@business_bp.route('/analytics/performance', methods=['GET'])
def get_business_analytics_performance():
    """Get business performance analytics from database"""
    try:
        # Get business users
        business_users = User.query.filter_by(account_type='business').all()
        business_user_ids = [user.id for user in business_users]
        
        if not business_user_ids:
            return jsonify({
                'success': True,
                'data': {
                    'revenue_trends': [],
                    'team_performance': {
                        'productivity_score': 0,
                        'goal_completion_rate': 0,
                        'average_response_time': 0
                    },
                    'financial_metrics': {
                        'monthly_revenue': 0,
                        'profit_margin': 0,
                        'growth_rate': 0
                    }
                }
            })
        
        # Get transactions for revenue calculation
        transactions = Transaction.query.filter(
            Transaction.user_id.in_(business_user_ids),
            Transaction.type == 'deposit'
        ).all()
        
        # Calculate monthly revenue (simplified - just sum all deposits)
        monthly_revenue = sum(t.amount for t in transactions)
        
        # Get goals for completion rate
        goals = Goal.query.filter(Goal.user_id.in_(business_user_ids)).all()
        completed_goals = len([g for g in goals if g.status == 'completed'])
        goal_completion_rate = (completed_goals / len(goals) * 100) if goals else 0
        
        return jsonify({
            'success': True,
            'data': {
                'revenue_trends': [
                    {'month': 'Current', 'revenue': monthly_revenue}
                ],
                'team_performance': {
                    'productivity_score': 0,  # No productivity tracking yet
                    'goal_completion_rate': round(goal_completion_rate, 1),
                    'average_response_time': 0  # No response time tracking yet
                },
                'financial_metrics': {
                    'monthly_revenue': monthly_revenue,
                    'profit_margin': 0,  # No profit calculation yet
                    'growth_rate': 0  # No growth calculation yet
                }
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'data': {
                'revenue_trends': [],
                'team_performance': {
                    'productivity_score': 0,
                    'goal_completion_rate': 0,
                    'average_response_time': 0
                },
                'financial_metrics': {
                    'monthly_revenue': 0,
                    'profit_margin': 0,
                    'growth_rate': 0
                }
            }
        })

@business_bp.route('/analytics/revenue', methods=['GET'])
def get_business_analytics_revenue():
    """Get business revenue analytics"""
    return jsonify({
        'success': True,
        'data': {
            'monthly_revenue': 65000,
            'quarterly_revenue': 195000,
            'yearly_revenue': 780000,
            'revenue_growth': 8.2,
            'revenue_by_source': [
                {'source': 'Product Sales', 'amount': 45000, 'percentage': 69.2},
                {'source': 'Services', 'amount': 15000, 'percentage': 23.1},
                {'source': 'Consulting', 'amount': 5000, 'percentage': 7.7}
            ],
            'revenue_trends': [
                {'month': 'Jan', 'revenue': 50000, 'growth': 5.2},
                {'month': 'Feb', 'revenue': 55000, 'growth': 10.0},
                {'month': 'Mar', 'revenue': 60000, 'growth': 9.1},
                {'month': 'Apr', 'revenue': 58000, 'growth': -3.3},
                {'month': 'May', 'revenue': 62000, 'growth': 6.9},
                {'month': 'Jun', 'revenue': 65000, 'growth': 4.8}
            ]
        }
    })

@business_bp.route('/analytics/trends', methods=['GET'])
def get_business_analytics_trends():
    """Get business trends analytics"""
    return jsonify({
        'success': True,
        'data': {
            'performance_trends': {
                'revenue_growth': 8.2,
                'customer_satisfaction': 4.3,
                'team_productivity': 85,
                'market_share': 12.5
            },
            'growth_metrics': [
                {'metric': 'Revenue', 'current': 65000, 'previous': 60000, 'growth': 8.3},
                {'metric': 'Customers', 'current': 1250, 'previous': 1100, 'growth': 13.6},
                {'metric': 'Projects', 'current': 45, 'previous': 38, 'growth': 18.4},
                {'metric': 'Team Size', 'current': 12, 'previous': 10, 'growth': 20.0}
            ],
            'market_trends': [
                {'period': 'Q1 2024', 'market_demand': 85, 'competition': 72, 'opportunity': 78},
                {'period': 'Q2 2024', 'market_demand': 88, 'competition': 75, 'opportunity': 82},
                {'period': 'Q3 2024', 'market_demand': 92, 'competition': 78, 'opportunity': 85},
                {'period': 'Q4 2024', 'market_demand': 95, 'competition': 80, 'opportunity': 88}
            ]
        }
    })

@business_bp.route('/reports', methods=['GET'])
def get_business_reports():
    """Get business reports"""
    return jsonify({
        'success': True,
        'data': []
    })

@business_bp.route('/reports/generate', methods=['POST'])
def generate_business_report():
    """Generate business report"""
    return jsonify({
        'success': True,
        'data': {
            'report_id': 'RPT-2024-001',
            'status': 'generated',
            'download_url': '/api/business/reports/download/RPT-2024-001',
            'generated_at': '2024-10-08T20:30:00Z'
        }
    })

@business_bp.route('/settings', methods=['GET'])
def get_business_settings():
    """Get business settings"""
    return jsonify({
        'success': True,
        'data': {
            'business_profile': {},
            'team_permissions': {},
            'financial_settings': {}
        }
    })

@business_bp.route('/profile', methods=['GET'])
def get_business_profile():
    """Get business profile"""
    return jsonify({
        'success': True,
        'data': {
            'business_name': 'Kamioi Business Solutions',
            'business_type': 'Technology Services',
            'industry': 'Software Development',
            'founded_year': 2020,
            'employee_count': 12,
            'revenue_range': '$500K - $1M',
            'description': 'Leading provider of innovative business solutions',
            'website': 'https://kamioi.com',
            'address': {
                'street': '123 Business Ave',
                'city': 'San Francisco',
                'state': 'CA',
                'zip': '94105',
                'country': 'USA'
            },
            'contact': {
                'phone': '+1 (555) 123-4567',
                'email': 'contact@kamioi.com',
                'linkedin': 'https://linkedin.com/company/kamioi'
            },
            'social_media': {
                'twitter': '@kamioi_biz',
                'facebook': 'kamioi.business',
                'instagram': 'kamioi_business'
            }
        }
    })

@business_bp.route('/quick-stats', methods=['GET'])
def get_business_quick_stats():
    """Get business quick statistics from database"""
    try:
        # Get business users
        business_users = User.query.filter_by(account_type='business').all()
        business_user_ids = [user.id for user in business_users]
        
        # Calculate stats
        total_employees = len(business_users)
        
        # Get active goals as "projects"
        active_goals = Goal.query.filter(
            Goal.user_id.in_(business_user_ids),
            Goal.status == 'active'
        ).count()
        
        # Calculate monthly revenue from deposits
        monthly_revenue = 0
        if business_user_ids:
            deposits = Transaction.query.filter(
                Transaction.user_id.in_(business_user_ids),
                Transaction.type == 'deposit'
            ).all()
            monthly_revenue = sum(t.amount for t in deposits)
        
        # Calculate portfolio performance
        portfolio_performance = 0
        if business_user_ids:
            portfolios = Portfolio.query.filter(
                Portfolio.user_id.in_(business_user_ids)
            ).all()
            if portfolios:
                total_gain_loss = sum(p.total_gain_loss for p in portfolios)
                total_invested = sum(p.total_invested for p in portfolios)
                portfolio_performance = (total_gain_loss / total_invested * 100) if total_invested > 0 else 0
        
        return jsonify({
            'success': True,
            'data': {
                'total_employees': total_employees,
                'active_projects': active_goals,
                'monthly_revenue': monthly_revenue,
                'portfolio_performance': round(portfolio_performance, 2)
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'data': {
                'total_employees': 0,
                'active_projects': 0,
                'monthly_revenue': 0,
                'portfolio_performance': 0
            }
        })

@business_bp.route('/chat/messages', methods=['GET'])
def get_business_chat_messages():
    """Get cross-dashboard chat messages"""
    return jsonify({
        'success': True,
        'data': []
    })


