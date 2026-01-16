"""
LLM Data Assets API Endpoints
Proper accounting implementation using existing GL accounts
"""

from flask import Blueprint, request, jsonify
from llm_assets_manager import LLMAssetManager
from datetime import datetime
import json

# Create blueprint
llm_assets_bp = Blueprint('llm_assets', __name__)

# Initialize manager
asset_manager = LLMAssetManager()

@llm_assets_bp.route('/api/admin/llm-assets', methods=['GET'])
def get_all_llm_assets():
    """Get all LLM assets with proper valuations"""
    try:
        assets = asset_manager.get_all_assets_valuation()
        
        # Calculate totals
        total_cost_basis = sum(asset['cost_basis']['total'] for asset in assets)
        total_economic_value = sum(asset['economic_value'] for asset in assets)
        total_carrying_value = sum(asset['carrying_value'] for asset in assets)
        total_impairment = sum(asset['impairment_loss'] for asset in assets)
        
        return jsonify({
            'success': True,
            'data': {
                'assets': assets,
                'summary': {
                    'total_assets': len(assets),
                    'total_cost_basis': total_cost_basis,
                    'total_economic_value': total_economic_value,
                    'total_carrying_value': total_carrying_value,
                    'total_impairment_loss': total_impairment,
                    'valuation_date': datetime.now().isoformat()
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@llm_assets_bp.route('/api/admin/llm-assets/<int:asset_id>', methods=['GET'])
def get_llm_asset(asset_id):
    """Get specific LLM asset valuation"""
    try:
        asset = asset_manager.get_asset_valuation(asset_id)
        if not asset:
            return jsonify({'success': False, 'error': 'Asset not found'}), 404
        
        return jsonify({
            'success': True,
            'data': asset
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@llm_assets_bp.route('/api/admin/llm-assets/<int:asset_id>/cost-breakdown', methods=['GET'])
def get_cost_breakdown(asset_id):
    """Get detailed cost breakdown for an asset"""
    try:
        cost_basis = asset_manager.get_asset_cost_basis(asset_id)
        
        # Get GL account details
        conn = asset_manager.get_connection()
        cursor = conn.cursor()
        
        breakdown = []
        for cost_type, amount in cost_basis.items():
            cursor.execute('''
                SELECT gl_account, description 
                FROM llm_cost_mapping 
                WHERE cost_type = ?
            ''', (cost_type,))
            mapping = cursor.fetchone()
            
            if mapping:
                breakdown.append({
                    'cost_type': cost_type,
                    'gl_account': mapping[0],
                    'description': mapping[1],
                    'amount': float(amount)
                })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'asset_id': asset_id,
                'cost_breakdown': breakdown,
                'total_cost': float(sum(cost_basis.values()))
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@llm_assets_bp.route('/api/admin/llm-assets/<int:asset_id>/amortization', methods=['GET'])
def get_amortization_schedule(asset_id):
    """Get amortization schedule for an asset"""
    try:
        conn = asset_manager.get_connection()
        cursor = conn.cursor()
        
        # Get asset details
        cursor.execute('''
            SELECT asset_name, development_start_date, production_ready_date, useful_life_months 
            FROM llm_assets WHERE id = ?
        ''', (asset_id,))
        asset = cursor.fetchone()
        
        if not asset:
            conn.close()
            return jsonify({'success': False, 'error': 'Asset not found'}), 404
        
        asset_name, dev_start, prod_ready, useful_life = asset
        
        # Calculate schedule
        start_date = datetime.strptime(prod_ready, '%Y-%m-%d') if prod_ready else datetime.strptime(dev_start, '%Y-%m-%d')
        cost_basis = sum(asset_manager.get_asset_cost_basis(asset_id).values())
        monthly_amortization = cost_basis / useful_life
        
        schedule = []
        remaining_value = cost_basis
        
        for month in range(useful_life):
            period_start = start_date + timedelta(days=30 * month)
            period_end = start_date + timedelta(days=30 * (month + 1))
            
            remaining_value = max(0, remaining_value - monthly_amortization)
            
            schedule.append({
                'period': month + 1,
                'period_start': period_start.strftime('%Y-%m-%d'),
                'period_end': period_end.strftime('%Y-%m-%d'),
                'amortization_expense': float(monthly_amortization),
                'remaining_value': float(remaining_value)
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'asset_id': asset_id,
                'asset_name': asset_name,
                'cost_basis': float(cost_basis),
                'monthly_amortization': float(monthly_amortization),
                'useful_life_months': useful_life,
                'schedule': schedule
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@llm_assets_bp.route('/api/admin/llm-assets/<int:asset_id>/journal-entry', methods=['POST'])
def create_capitalization_journal_entry(asset_id):
    """Create journal entry for capitalizing development costs"""
    try:
        journal_entry = asset_manager.create_journal_entry_for_capitalization(asset_id)
        
        return jsonify({
            'success': True,
            'data': {
                'journal_entry': journal_entry,
                'message': 'Journal entry created for capitalization'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@llm_assets_bp.route('/api/admin/llm-assets/gl-accounts', methods=['GET'])
def get_llm_gl_accounts():
    """Get GL accounts used for LLM asset tracking"""
    try:
        conn = asset_manager.get_connection()
        cursor = conn.cursor()
        
        # Get cost mapping
        cursor.execute('''
            SELECT cost_type, gl_account, description, capitalizable 
            FROM llm_cost_mapping 
            ORDER BY cost_type
        ''')
        mappings = cursor.fetchall()
        
        # Get current balances
        cursor.execute('''
            SELECT account_number, account_name, balance 
            FROM account_balances 
            WHERE account_number IN (
                SELECT gl_account FROM llm_cost_mapping
            )
        ''')
        balances = {row[0]: {'name': row[1], 'balance': row[2]} for row in cursor.fetchall()}
        
        conn.close()
        
        gl_accounts = []
        for cost_type, gl_account, description, capitalizable in mappings:
            gl_accounts.append({
                'cost_type': cost_type,
                'gl_account': gl_account,
                'description': description,
                'capitalizable': bool(capitalizable),
                'current_balance': balances.get(gl_account, {}).get('balance', 0),
                'account_name': balances.get(gl_account, {}).get('name', '')
            })
        
        return jsonify({
            'success': True,
            'data': {
                'gl_accounts': gl_accounts,
                'llm_asset_account': {
                    'account_number': '15200',
                    'account_name': 'LLM Data Assets',
                    'current_balance': balances.get('15200', {}).get('balance', 0)
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500



