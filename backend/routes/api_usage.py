"""
API Usage Tracking Routes
"""

from flask import Blueprint, request, jsonify, Response
from flask_cors import cross_origin
from services.api_usage_tracker import APIUsageTracker
from blueprints.auth.helpers import require_role
import csv
import io
from datetime import datetime

api_usage_bp = Blueprint('api_usage', __name__)
usage_tracker = APIUsageTracker()

@api_usage_bp.route('/api/admin/api-usage/stats', methods=['GET'])
@cross_origin()
def get_usage_stats():
    """Get API usage statistics"""
    ok, res = require_role('admin')
    if ok is False:
        return res

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
@cross_origin()
def get_daily_limit_status():
    """Get daily cost limit status"""
    ok, res = require_role('admin')
    if ok is False:
        return res

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

@api_usage_bp.route('/api/admin/api-usage/daily-limit', methods=['POST'])
@cross_origin()
def update_daily_limit():
    """Update the daily cost limit setting"""
    ok, res = require_role('admin')
    if ok is False:
        return res

    try:
        data = request.json or {}
        new_limit = float(data.get('limit', 10.0))

        if new_limit < 0:
            return jsonify({
                'success': False,
                'error': 'Daily limit cannot be negative'
            }), 400

        # Store the daily limit in database
        success = usage_tracker.update_daily_limit(new_limit)

        if success:
            return jsonify({
                'success': True,
                'data': {'daily_limit': new_limit},
                'message': 'Daily limit updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update daily limit'
            }), 500
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Invalid limit amount'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_usage_bp.route('/api/admin/api-usage/current-month', methods=['GET'])
@cross_origin()
def get_current_month_cost():
    """Get current month total cost"""
    ok, res = require_role('admin')
    if ok is False:
        return res

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
@cross_origin()
def get_balance():
    """Get current API balance information"""
    ok, res = require_role('admin')
    if ok is False:
        return res

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
@cross_origin()
def update_balance():
    """Update API balance"""
    ok, res = require_role('admin')
    if ok is False:
        return res

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
@cross_origin()
def get_detailed_records():
    """Get detailed API usage records with pagination and filtering"""
    ok, res = require_role('admin')
    if ok is False:
        return res

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

@api_usage_bp.route('/api/admin/api-usage/export', methods=['GET'])
@cross_origin()
def export_records():
    """Export API usage records to CSV"""
    ok, res = require_role('admin')
    if ok is False:
        return res

    try:
        days = request.args.get('days', 30, type=int)
        format_type = request.args.get('format', 'csv', type=str)

        # Get all records for the period (no pagination for export)
        result = usage_tracker.get_detailed_records(
            page=1,
            limit=10000,  # High limit for export
            days=days
        )

        records = result.get('records', [])

        if format_type == 'csv':
            # Create CSV
            output = io.StringIO()
            writer = csv.writer(output)

            # Header row
            writer.writerow([
                'ID', 'Date', 'Endpoint', 'Model', 'Prompt Tokens', 'Completion Tokens',
                'Total Tokens', 'Processing Time (ms)', 'Cost ($)', 'Success',
                'Error Message', 'User ID', 'Page/Tab'
            ])

            # Data rows
            for record in records:
                writer.writerow([
                    record.get('id', ''),
                    record.get('date', ''),
                    record.get('endpoint', ''),
                    record.get('model', ''),
                    record.get('prompt_tokens', 0),
                    record.get('completion_tokens', 0),
                    record.get('total_tokens', 0),
                    record.get('processing_time_ms', 0),
                    record.get('cost', 0),
                    'Yes' if record.get('success') else 'No',
                    record.get('error_message', ''),
                    record.get('user_id', ''),
                    record.get('page_tab', '')
                ])

            output.seek(0)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

            return Response(
                output.getvalue(),
                mimetype='text/csv',
                headers={
                    'Content-Disposition': f'attachment; filename=api_usage_export_{timestamp}.csv',
                    'Access-Control-Allow-Origin': '*'
                }
            )
        else:
            # Return JSON
            return jsonify({
                'success': True,
                'data': records,
                'total': len(records),
                'period_days': days
            })

    except Exception as e:
        print(f"❌ Error in export_records: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
