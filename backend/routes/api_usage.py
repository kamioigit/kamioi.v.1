"""
API Usage Tracking Routes
"""

from flask import Blueprint, request, jsonify
from services.api_usage_tracker import APIUsageTracker

api_usage_bp = Blueprint('api_usage', __name__)
usage_tracker = APIUsageTracker()

@api_usage_bp.route('/api/admin/api-usage/stats', methods=['GET'])
def get_usage_stats():
    """Get API usage statistics"""
    try:
        days = request.args.get('days', 30, type=int)
        stats = usage_tracker.get_usage_stats(days=days)
        
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_usage_bp.route('/api/admin/api-usage/daily-limit', methods=['GET'])
def get_daily_limit_status():
    """Get daily cost limit status"""
    try:
        daily_limit = request.args.get('limit', 10.0, type=float)
        status = usage_tracker.get_daily_cost_limit_status(daily_limit=daily_limit)
        
        return jsonify({
            'success': True,
            'data': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_usage_bp.route('/api/admin/api-usage/current-month', methods=['GET'])
def get_current_month_cost():
    """Get current month total cost"""
    try:
        cost = usage_tracker.get_current_month_cost()
        
        return jsonify({
            'success': True,
            'data': {
                'current_month_cost': cost
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_usage_bp.route('/api/admin/api-usage/balance', methods=['GET'])
def get_balance():
    """Get current API balance information"""
    try:
        balance_info = usage_tracker.get_balance_info()
        
        return jsonify({
            'success': True,
            'data': balance_info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_usage_bp.route('/api/admin/api-usage/balance', methods=['POST'])
def update_balance():
    """Update API balance"""
    try:
        data = request.json
        new_balance = float(data.get('balance', 20.0))
        
        if new_balance < 0:
            return jsonify({
                'success': False,
                'error': 'Balance cannot be negative'
            }), 400
        
        balance_info = usage_tracker.update_balance(new_balance)
        
        return jsonify({
            'success': True,
            'data': balance_info,
            'message': 'Balance updated successfully'
        })
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Invalid balance amount'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_usage_bp.route('/api/admin/api-usage/records', methods=['GET'])
def get_detailed_records():
    """Get detailed API usage records with pagination and filtering"""
    print("📊 API Usage Records endpoint called")
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        days = request.args.get('days', 30, type=int)
        status = request.args.get('status', None, type=str)  # 'success', 'failed', or None
        endpoint = request.args.get('endpoint', None, type=str)
        user_id = request.args.get('user_id', None, type=str)
        page_tab = request.args.get('page_tab', None, type=str)
        
        print(f"📊 Fetching records: page={page}, limit={limit}, days={days}, status={status}, endpoint={endpoint}, user_id={user_id}, page_tab={page_tab}")
        
        result = usage_tracker.get_detailed_records(
            page=page, 
            limit=limit, 
            days=days,
            status=status,
            endpoint=endpoint,
            user_id=user_id,
            page_tab=page_tab
        )
        
        print(f"📊 Found {result.get('total', 0)} total records, returning {len(result.get('records', []))} records")
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        print(f"❌ Error in get_detailed_records: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

