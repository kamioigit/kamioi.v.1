"""
Admin LLM Center Routes - LLM Center Module
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random
from . import admin_bp

# LLM Center endpoints
@admin_bp.route('/llm-center/stats', methods=['GET'])
def get_llm_stats():
    """Get LLM Center statistics"""
    return jsonify({
        'success': True,
        'data': {
            'total_mappings': 0,
            'daily_processed': 0,
            'accuracy_rate': 0.0,
            'auto_approval_rate': 0.0,
            'pending_review': 0,
            'last_updated': datetime.utcnow().isoformat()
        }
    })

@admin_bp.route('/llm-center/mappings', methods=['GET'])
def get_llm_mappings():
    """Get LLM mappings with pagination"""
    print("=== LLM CENTER MAPPINGS ENDPOINT CALLED (llm_center.py) ===")
    try:
        import sys
        import os
        
        # Add backend directory to path to ensure proper imports
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)
        
        from database_manager import db_manager
        
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        print(f"LLM Center (llm_center.py): Database path = {db_manager.db_path}")
        print(f"LLM Center (llm_center.py): Getting mappings from database (limit={limit}, offset={offset})...")
        db_mappings = db_manager.get_llm_mappings()
        print(f"LLM Center (llm_center.py): Retrieved {len(db_mappings)} mappings from database")
        
        # Format database mappings for LLM Center display
        all_mappings = []
        
        # Add database mappings
        for mapping in db_mappings:
            all_mappings.append({
                'id': mapping.get('id'),
                'merchant_name': mapping.get('merchant_name'),
                'ticker': mapping.get('ticker'),
                'status': mapping.get('status'),
                'submitted_at': mapping.get('created_at'),
                'user_id': mapping.get('user_id'),
                'category': mapping.get('category'),
                'confidence': mapping.get('confidence'),
                'notes': '',
                'source': 'database'
            })
        
        # Apply pagination
        total = len(all_mappings)
        paginated_mappings = all_mappings[offset:offset + limit]
        
        print(f"LLM Center (llm_center.py): Returning {len(paginated_mappings)} formatted mappings (total: {total})")
        
        return jsonify({
            'success': True,
            'data': {
                'mappings': paginated_mappings,
                'pagination': {
                    'total': total,
                    'limit': limit,
                    'offset': offset,
                    'has_more': offset + limit < total
                }
            }
        })
            
    except Exception as e:
        print(f"Error getting LLM center mappings (llm_center.py): {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/llm-center/mappings', methods=['POST'])
def create_llm_mapping():
    """Create new LLM mapping in database"""
    try:
        data = request.get_json()
        
        # Create new mapping in database
        new_mapping = LLMMapping(
            merchant_name=data.get('merchant_name'),
            ticker_symbol=data.get('ticker_symbol'),
            category=data.get('category'),
            confidence=data.get('confidence', 0.95),
            status='pending',
            source='admin_manual'
        )
        
        from app import db
        db.session.add(new_mapping)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'LLM mapping created successfully',
            'data': new_mapping.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to create LLM mapping'
        })

@admin_bp.route('/llm-center/mappings/<int:mapping_id>', methods=['PUT'])
def update_llm_mapping(mapping_id):
    """Update LLM mapping in database"""
    try:
        data = request.get_json()
        
        # Find the mapping
        mapping = LLMMapping.query.get(mapping_id)
        if not mapping:
            return jsonify({
                'success': False,
                'error': 'Mapping not found'
            })
        
        # Update fields
        if 'status' in data:
            mapping.status = data['status']
        if 'confidence' in data:
            mapping.confidence = data['confidence']
        if 'category' in data:
            mapping.category = data['category']
        if 'notes' in data:
            mapping.notes = data['notes']
        
        mapping.updated_at = datetime.utcnow()
        
        from app import db
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'LLM mapping {mapping_id} updated successfully',
            'data': mapping.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to update LLM mapping'
        })

@admin_bp.route('/llm-center/upload', methods=['POST'])
def upload_llm_mappings():
    """Upload bulk LLM mappings via CSV"""
    try:
        # For now, return a placeholder response
        # In a real implementation, this would process the uploaded CSV file
        return jsonify({
            'success': True,
            'message': 'CSV upload functionality not yet implemented',
            'data': {
                'processed': 0,
                'successful': 0,
                'failed': 0,
                'uploaded_at': datetime.utcnow().isoformat()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to process CSV upload'
        })

@admin_bp.route('/llm-center/export', methods=['GET'])
def export_llm_mappings():
    """Export LLM mappings to CSV"""
    try:
        # Get total count from database
        total_mappings = LLMMapping.query.count()
        
        return jsonify({
            'success': True,
            'message': 'LLM mappings export initiated',
            'data': {
                'export_url': '/api/admin/llm-center/download/export.csv',
                'total_exported': total_mappings,
                'exported_at': datetime.utcnow().isoformat()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to export LLM mappings'
        })


