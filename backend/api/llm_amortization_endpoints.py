"""
API Endpoints for LLM Data Assets Monthly Amortization
Automatically creates journal entries on the 1st of each month
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm_amortization_service import LLMAmortizationService
import logging

logger = logging.getLogger(__name__)

llm_amortization_bp = Blueprint('llm_amortization', __name__)

# Initialize service
amortization_service = LLMAmortizationService()

@llm_amortization_bp.route('/api/admin/llm-assets/monthly-amortization', methods=['POST'])
def create_monthly_amortization():
    """
    Create monthly amortization journal entries for all active LLM assets
    Should be called automatically on the 1st of each month
    """
    try:
        data = request.get_json() or {}
        entry_date_str = data.get('entry_date')
        
        # Parse date if provided, otherwise use today (should be 1st of month)
        if entry_date_str:
            entry_date = datetime.fromisoformat(entry_date_str.replace('Z', '+00:00'))
        else:
            entry_date = datetime.now()
        
        # Create amortization entries
        created_entries = amortization_service.create_monthly_amortization_entries(entry_date)
        
        if created_entries:
            return jsonify({
                'success': True,
                'data': {
                    'journal_entry_ids': created_entries,
                    'entry_date': entry_date.strftime('%Y-%m-%d'),
                    'message': f'Created {len(created_entries)} monthly amortization journal entry/entries'
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No amortization entries created. Check if there are active assets with valid cost basis.'
            }), 400
            
    except Exception as e:
        logger.error(f"Error in monthly amortization endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

