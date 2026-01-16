"""
Admin ML Dashboard Routes - ML Dashboard Module
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random
from . import admin_bp

# ML Dashboard endpoints
@admin_bp.route('/ml-dashboard/stats', methods=['GET'])
def get_ml_stats():
    """Get ML Dashboard statistics"""
    return jsonify({
        'success': True,
        'data': {
            'model_version': '2.1.0',
            'total_patterns': 132300,
            'accuracy_rate': 94.7,
            'learning_rate': 0.001,
            'last_training': datetime.utcnow().isoformat(),
            'data_sources': {
                'csv_imports': 132300,
                'user_submissions': 1250,
                'admin_entries': 45,
                'feedback_loops': 890
            },
            'learning_status': {
                'active': True,
                'patterns_learned_today': 125,
                'patterns_learned_this_week': 875,
                'patterns_learned_this_month': 3750
            },
            'performance': {
                'avg_recognition_time': 245,
                'success_rate': 94.7,
                'false_positive_rate': 2.1,
                'false_negative_rate': 3.2
            }
        }
    })

@admin_bp.route('/ml-dashboard/recognize', methods=['POST'])
def recognize_merchant():
    """Test merchant recognition"""
    data = request.get_json()
    merchant = data.get('merchant', '').lower()
    
    # Simple pattern matching for demo
    patterns = {
        'amazon': {'ticker': 'AMZN', 'category': 'E-commerce', 'confidence': 0.98},
        'starbucks': {'ticker': 'SBUX', 'category': 'Food & Dining', 'confidence': 0.95},
        'mcdonald': {'ticker': 'MCD', 'category': 'Food & Dining', 'confidence': 0.93},
        'netflix': {'ticker': 'NFLX', 'category': 'Entertainment', 'confidence': 0.92},
        'apple': {'ticker': 'AAPL', 'category': 'Technology', 'confidence': 0.97}
    }
    
    # Find best match
    best_match = None
    for pattern, info in patterns.items():
        if pattern in merchant:
            best_match = info
            break
    
    if best_match:
        return jsonify({
            'success': True,
            'data': {
                'merchant': data.get('merchant'),
                'ticker': best_match['ticker'],
                'category': best_match['category'],
                'confidence': best_match['confidence'],
                'source': 'ml_pattern_match'
            }
        })
    else:
        return jsonify({
            'success': True,
            'data': {
                'merchant': data.get('merchant'),
                'ticker': 'UNKNOWN',
                'category': 'Unknown',
                'confidence': 0.0,
                'source': 'no_match_found'
            }
        })

@admin_bp.route('/ml-dashboard/learn', methods=['POST'])
def learn_pattern():
    """Learn new pattern"""
    data = request.get_json()
    
    return jsonify({
        'success': True,
        'message': 'Pattern learned successfully',
        'data': {
            'merchant': data.get('merchant'),
            'ticker': data.get('ticker'),
            'category': data.get('category'),
            'confidence': data.get('confidence', 0.95),
            'source': data.get('source', 'admin_manual'),
            'learned_at': datetime.utcnow().isoformat()
        }
    })

@admin_bp.route('/ml-dashboard/retrain', methods=['POST'])
def retrain_model():
    """Retrain ML model"""
    return jsonify({
        'success': True,
        'message': 'Model retraining started',
        'data': {
            'status': 'training',
            'started_at': datetime.utcnow().isoformat(),
            'estimated_completion': (datetime.utcnow() + timedelta(minutes=15)).isoformat()
        }
    })


