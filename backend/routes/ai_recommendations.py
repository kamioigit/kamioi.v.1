"""
AI Recommendations Routes - For User/Family/Business dashboards
"""

from flask import Blueprint, request, jsonify
from services.ai_recommendation_service import AIRecommendationService
from database_manager import db_manager

ai_recommendations_bp = Blueprint('ai_recommendations', __name__)
recommendation_service = AIRecommendationService()

@ai_recommendations_bp.route('/api/ai/recommendations', methods=['POST'])
def get_recommendations():
    """
    Get AI-powered investment recommendations
    
    Request body:
    {
        "dashboard_type": "user" | "family" | "business",
        "user_id": int (optional, for fetching round-up settings),
        "user_data": {
            "transactions": [...],
            "portfolio": {...},
            "goals": [...],
            "risk_tolerance": "low" | "moderate" | "high",
            "investment_history": [...]
        }
    }
    """
    try:
        data = request.json
        dashboard_type = data.get('dashboard_type', 'user')
        user_id = data.get('user_id')
        user_data = data.get('user_data', {})
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'user_data is required'
            }), 400
        
        # Fetch user's settings if user_id is provided (round-up, location, etc.)
        round_up_amount = 1.00  # Default
        round_up_enabled = True  # Default
        user_location = None  # City, State, Country
        user_city = None
        user_state = None
        user_country = None
        
        if user_id:
            try:
                conn = db_manager.get_connection()
                cursor = conn.cursor()
                
                # Get round_up_amount from users table
                try:
                    cursor.execute('SELECT round_up_amount FROM users WHERE id = ?', (user_id,))
                    row = cursor.fetchone()
                    if row and row[0] is not None:
                        round_up_amount = float(row[0])
                except Exception as e:
                    # Column might not exist, use default
                    pass
                
                # Get round_up_enabled from users table
                try:
                    cursor.execute('SELECT round_up_enabled FROM users WHERE id = ?', (user_id,))
                    row = cursor.fetchone()
                    if row and row[0] is not None:
                        round_up_enabled = str(row[0]).lower() == 'true' or row[0] == 1
                except Exception as e:
                    # Column might not exist, use default
                    pass
                
                # Get user location information (city, state, country)
                try:
                    cursor.execute('SELECT city, state, country FROM users WHERE id = ?', (user_id,))
                    row = cursor.fetchone()
                    if row:
                        user_city = row[0] if row[0] else None
                        user_state = row[1] if row[1] else None
                        user_country = row[2] if row[2] else None
                        
                        # Build location string
                        location_parts = []
                        if user_city:
                            location_parts.append(user_city)
                        if user_state:
                            location_parts.append(user_state)
                        if user_country:
                            location_parts.append(user_country)
                        if location_parts:
                            user_location = ', '.join(location_parts)
                except Exception as e:
                    # Columns might not exist, use default
                    print(f"[AI Recommendations] Could not fetch location: {e}")
                
                db_manager.release_connection(conn)
            except Exception as e:
                print(f"[AI Recommendations] Could not fetch user settings: {e}")
        
        # CRITICAL: Check if user has transactions before generating recommendations
        transactions = user_data.get('transactions', [])
        print(f"[AI RECOMMENDATIONS POST] User {user_id} has {len(transactions)} transactions in request")
        
        # If no transactions provided in request, fetch from database (same as GET endpoint)
        if not transactions or len(transactions) == 0:
            if user_id:
                print(f"[AI RECOMMENDATIONS POST] No transactions in request, fetching from database for user_id={user_id}")
                try:
                    # Fetch transactions directly from database (same query as GET endpoint)
                    conn = db_manager.get_connection()
                    try:
                        if db_manager._use_postgresql:
                            from sqlalchemy import text
                            query = text('''
                                SELECT id, user_id, merchant, amount, date, category, description,
                                       round_up, investable, total_debit, fee, status, ticker,
                                       shares, price_per_share, stock_price, created_at
                                FROM transactions 
                                WHERE user_id = CAST(:user_id AS INTEGER)
                                ORDER BY date DESC NULLS LAST, id DESC
                                LIMIT 1000
                            ''')
                            result = conn.execute(query, {'user_id': user_id})
                            raw_transactions = [dict(row._mapping) for row in result]
                        else:
                            cursor = conn.cursor()
                            cursor.execute('''
                                SELECT id, user_id, merchant, amount, date, category, description,
                                       round_up, investable, total_debit, fee, status, ticker,
                                       shares, price_per_share, stock_price, created_at
                                FROM transactions 
                                WHERE user_id = ?
                                ORDER BY date DESC, id DESC
                                LIMIT 1000
                            ''', (user_id,))
                            columns = [description[0] for description in cursor.description]
                            raw_transactions = [dict(zip(columns, row)) for row in cursor.fetchall()]
                            cursor.close()
                        
                        # Format transactions with positive amounts (same as GET endpoint)
                        formatted_transactions = []
                        for txn in raw_transactions:
                            raw_amount = float(txn.get('amount', 0) or 0)
                            raw_total_debit = float(txn.get('total_debit', txn.get('amount', 0)) or 0)
                            
                            formatted_transactions.append({
                                'id': txn.get('id'),
                                'user_id': user_id,
                                'merchant': txn.get('merchant') or 'Unknown',
                                'amount': abs(raw_amount),
                                'date': txn.get('date'),
                                'category': txn.get('category', 'Uncategorized'),
                                'description': txn.get('description', ''),
                                'roundup': float(txn.get('round_up', 0) or 0),
                                'round_up': float(txn.get('round_up', 0) or 0),
                                'investable': float(txn.get('investable', 0) or 0),
                                'total_debit': abs(raw_total_debit),
                                'fee': float(txn.get('fee', 0) or 0),
                                'status': txn.get('status', 'pending'),
                                'ticker': txn.get('ticker'),
                                'shares': txn.get('shares'),
                                'price_per_share': txn.get('price_per_share'),
                                'stock_price': txn.get('stock_price'),
                                'type': 'purchase'
                            })
                        
                        transactions = formatted_transactions
                        print(f"[AI RECOMMENDATIONS POST] Fetched {len(transactions)} transactions from database")
                    finally:
                        if db_manager._use_postgresql:
                            db_manager.release_connection(conn)
                        else:
                            conn.close()
                except Exception as e:
                    print(f"[AI RECOMMENDATIONS POST] Error fetching transactions: {e}")
                    transactions = []
        
        # If still no transactions, return empty recommendations
        if not transactions or len(transactions) == 0:
            print(f"[AI RECOMMENDATIONS POST] No transactions found - returning empty recommendations")
            return jsonify({
                'success': True,
                'data': {
                    'recommendations': [],
                    'insights': [],
                    'risk_analysis': {},
                    'opportunities': [],
                    'message': 'No transactions yet. Make purchases or sync transactions to get AI recommendations.'
                }
            })
        
        # Update user_data with fetched transactions
        user_data['transactions'] = transactions
        
        # Add user settings to user_data
        user_data['round_up_amount'] = round_up_amount
        user_data['round_up_enabled'] = round_up_enabled
        user_data['location'] = user_location
        user_data['city'] = user_city
        user_data['state'] = user_state
        user_data['country'] = user_country
        
        recommendations = recommendation_service.get_investment_recommendations(
            user_data=user_data,
            dashboard_type=dashboard_type,
            user_id=user_id
        )
        
        return jsonify({
            'success': True,
            'data': recommendations
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_recommendations_bp.route('/api/ai/recommendations/quick', methods=['POST'])
def get_quick_recommendations():
    """
    Get quick recommendations with minimal data
    
    Request body:
    {
        "dashboard_type": "user" | "family" | "business",
        "total_spending": 1000.00,
        "portfolio_value": 5000.00,
        "risk_tolerance": "moderate"
    }
    """
    try:
        data = request.json
        dashboard_type = data.get('dashboard_type', 'user')
        
        # Build minimal user data
        user_data = {
            'transactions': [],
            'portfolio': {
                'total_value': data.get('portfolio_value', 0),
                'holdings': []
            },
            'goals': [],
            'risk_tolerance': data.get('risk_tolerance', 'moderate'),
            'investment_history': []
        }
        
        recommendations = recommendation_service.get_investment_recommendations(
            user_data=user_data,
            dashboard_type=dashboard_type,
            user_id=None  # Quick recommendations don't have user_id
        )
        
        return jsonify({
            'success': True,
            'data': recommendations
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

