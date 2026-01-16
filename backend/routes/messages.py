from flask import Blueprint, jsonify, request

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/admin/all', methods=['GET'])
def get_admin_messages():
    """Get all admin messages"""
    return jsonify({
        'success': True,
        'data': {
            'messages': [
                {
                    'id': 1,
                    'title': 'System Maintenance Scheduled',
                    'content': 'Scheduled maintenance will occur on Sunday at 2 AM EST',
                    'type': 'system',
                    'priority': 'high',
                    'read': False,
                    'created_at': '2025-10-08T10:00:00Z',
                    'expires_at': '2025-10-10T10:00:00Z'
                },
                {
                    'id': 2,
                    'title': 'New User Registration',
                    'content': '25 new users registered in the last hour',
                    'type': 'notification',
                    'priority': 'medium',
                    'read': True,
                    'created_at': '2025-10-08T09:30:00Z',
                    'expires_at': None
                },
                {
                    'id': 3,
                    'title': 'Feature Flag Update',
                    'content': 'Advanced analytics feature flag has been enabled for 50% of users',
                    'type': 'feature',
                    'priority': 'low',
                    'read': False,
                    'created_at': '2025-10-08T08:15:00Z',
                    'expires_at': None
                }
            ],
            'total': 3,
            'unread_count': 2
        }
    })

@messages_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_messages(user_id):
    """Get messages for a specific user"""
    return jsonify({
        'success': True,
        'data': {
            'messages': [
                {
                    'id': 1,
                    'title': 'Welcome to Kamioi!',
                    'content': 'Thank you for joining our platform. Start by completing your profile.',
                    'type': 'welcome',
                    'priority': 'high',
                    'read': False,
                    'created_at': '2025-10-08T10:00:00Z'
                },
                {
                    'id': 2,
                    'title': 'Transaction Completed',
                    'content': 'Your transaction of $25.50 has been successfully processed.',
                    'type': 'transaction',
                    'priority': 'medium',
                    'read': True,
                    'created_at': '2025-10-08T09:30:00Z'
                }
            ],
            'total': 2,
            'unread_count': 1
        }
    })

@messages_bp.route('/mark-read/<int:message_id>', methods=['POST'])
def mark_message_read(message_id):
    """Mark a message as read"""
    return jsonify({
        'success': True,
        'data': {
            'message_id': message_id,
            'read': True,
            'updated_at': '2025-10-08T12:00:00Z'
        }
    })

@messages_bp.route('/delete/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    """Delete a message"""
    return jsonify({
        'success': True,
        'data': {
            'message_id': message_id,
            'deleted': True,
            'deleted_at': '2025-10-08T12:00:00Z'
        }
    })
