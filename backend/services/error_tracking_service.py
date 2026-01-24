"""
Error Tracking Service for Kamioi Backend

Provides functions to log, retrieve, and manage system errors.
"""

import traceback
from datetime import datetime
from database_manager import db_manager


def log_error(
    error_type,
    error_message,
    error_stack=None,
    endpoint=None,
    http_method=None,
    user_id=None,
    admin_id=None,
    request_data=None,
    severity='error'
):
    """
    Log an error to the system_errors table.

    Args:
        error_type: Type of error (e.g., 'database', 'api', 'auth', 'validation')
        error_message: Human-readable error message
        error_stack: Stack trace (optional)
        endpoint: API endpoint where error occurred (optional)
        http_method: HTTP method (GET, POST, etc.) (optional)
        user_id: ID of user involved (optional)
        admin_id: ID of admin involved (optional)
        request_data: Request data that caused error (optional, JSON string)
        severity: Error severity - 'critical', 'error', 'warning', 'info'

    Returns:
        int: Error ID if logged successfully, None otherwise
    """
    try:
        conn = db_manager.get_connection()
        use_postgresql = getattr(db_manager, '_use_postgresql', False)

        if use_postgresql:
            from sqlalchemy import text
            result = conn.execute(text('''
                INSERT INTO system_errors
                (error_type, error_message, error_stack, endpoint, http_method,
                 user_id, admin_id, request_data, severity)
                VALUES (:error_type, :error_message, :error_stack, :endpoint, :http_method,
                        :user_id, :admin_id, :request_data, :severity)
                RETURNING id
            '''), {
                'error_type': error_type,
                'error_message': error_message[:2000] if error_message else None,
                'error_stack': error_stack[:5000] if error_stack else None,
                'endpoint': endpoint,
                'http_method': http_method,
                'user_id': user_id,
                'admin_id': admin_id,
                'request_data': request_data[:5000] if request_data else None,
                'severity': severity
            })
            error_id = result.fetchone()[0]
            conn.commit()
            db_manager.release_connection(conn)
        else:
            cur = conn.cursor()
            cur.execute('''
                INSERT INTO system_errors
                (error_type, error_message, error_stack, endpoint, http_method,
                 user_id, admin_id, request_data, severity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                error_type,
                error_message[:2000] if error_message else None,
                error_stack[:5000] if error_stack else None,
                endpoint,
                http_method,
                user_id,
                admin_id,
                request_data[:5000] if request_data else None,
                severity
            ))
            error_id = cur.lastrowid
            conn.commit()
            conn.close()

        return error_id

    except Exception as e:
        print(f"Failed to log error: {e}")
        return None


def log_exception(
    exception,
    endpoint=None,
    http_method=None,
    user_id=None,
    admin_id=None,
    request_data=None,
    severity='error'
):
    """
    Convenience function to log an exception with full traceback.
    """
    error_type = type(exception).__name__
    error_message = str(exception)
    error_stack = traceback.format_exc()

    return log_error(
        error_type=error_type,
        error_message=error_message,
        error_stack=error_stack,
        endpoint=endpoint,
        http_method=http_method,
        user_id=user_id,
        admin_id=admin_id,
        request_data=request_data,
        severity=severity
    )


def get_errors(
    page=1,
    per_page=50,
    error_type=None,
    severity=None,
    is_resolved=None,
    start_date=None,
    end_date=None
):
    """
    Get paginated list of errors with optional filters.

    Returns:
        dict: {
            'errors': [...],
            'total': int,
            'page': int,
            'per_page': int,
            'total_pages': int
        }
    """
    try:
        conn = db_manager.get_connection()
        use_postgresql = getattr(db_manager, '_use_postgresql', False)
        offset = (page - 1) * per_page

        # Build WHERE clause
        conditions = []
        params = {}

        if error_type:
            conditions.append("error_type = :error_type" if use_postgresql else "error_type = ?")
            params['error_type'] = error_type

        if severity:
            conditions.append("severity = :severity" if use_postgresql else "severity = ?")
            params['severity'] = severity

        if is_resolved is not None:
            if use_postgresql:
                conditions.append("is_resolved = :is_resolved")
                params['is_resolved'] = is_resolved
            else:
                conditions.append("is_resolved = ?")
                params['is_resolved'] = 1 if is_resolved else 0

        if start_date:
            conditions.append("created_at >= :start_date" if use_postgresql else "created_at >= ?")
            params['start_date'] = start_date

        if end_date:
            conditions.append("created_at <= :end_date" if use_postgresql else "created_at <= ?")
            params['end_date'] = end_date

        where_clause = " AND ".join(conditions) if conditions else "1=1"

        if use_postgresql:
            from sqlalchemy import text

            # Get total count
            count_result = conn.execute(
                text(f"SELECT COUNT(*) FROM system_errors WHERE {where_clause}"),
                params
            )
            total = count_result.fetchone()[0]

            # Get errors
            params['limit'] = per_page
            params['offset'] = offset
            result = conn.execute(text(f'''
                SELECT id, error_type, error_message, error_stack, endpoint,
                       http_method, user_id, admin_id, severity, is_resolved,
                       resolved_at, resolved_by, resolution_notes, created_at
                FROM system_errors
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :offset
            '''), params)

            errors = []
            for row in result:
                errors.append({
                    'id': row[0],
                    'error_type': row[1],
                    'error_message': row[2],
                    'error_stack': row[3],
                    'endpoint': row[4],
                    'http_method': row[5],
                    'user_id': row[6],
                    'admin_id': row[7],
                    'severity': row[8],
                    'is_resolved': row[9],
                    'resolved_at': str(row[10]) if row[10] else None,
                    'resolved_by': row[11],
                    'resolution_notes': row[12],
                    'created_at': str(row[13]) if row[13] else None
                })

            db_manager.release_connection(conn)
        else:
            cur = conn.cursor()

            # Build params list for SQLite
            param_list = list(params.values())

            # Get total count
            cur.execute(f"SELECT COUNT(*) FROM system_errors WHERE {where_clause}", param_list)
            total = cur.fetchone()[0]

            # Get errors
            param_list.extend([per_page, offset])
            cur.execute(f'''
                SELECT id, error_type, error_message, error_stack, endpoint,
                       http_method, user_id, admin_id, severity, is_resolved,
                       resolved_at, resolved_by, resolution_notes, created_at
                FROM system_errors
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            ''', param_list)

            errors = []
            for row in cur.fetchall():
                errors.append({
                    'id': row[0],
                    'error_type': row[1],
                    'error_message': row[2],
                    'error_stack': row[3],
                    'endpoint': row[4],
                    'http_method': row[5],
                    'user_id': row[6],
                    'admin_id': row[7],
                    'severity': row[8],
                    'is_resolved': bool(row[9]),
                    'resolved_at': row[10],
                    'resolved_by': row[11],
                    'resolution_notes': row[12],
                    'created_at': row[13]
                })

            conn.close()

        total_pages = (total + per_page - 1) // per_page

        return {
            'errors': errors,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages
        }

    except Exception as e:
        print(f"Failed to get errors: {e}")
        return {
            'errors': [],
            'total': 0,
            'page': page,
            'per_page': per_page,
            'total_pages': 0
        }


def get_error_stats():
    """
    Get error statistics for dashboard.

    Returns:
        dict: Statistics about errors
    """
    try:
        conn = db_manager.get_connection()
        use_postgresql = getattr(db_manager, '_use_postgresql', False)

        stats = {
            'total': 0,
            'unresolved': 0,
            'critical': 0,
            'today': 0,
            'by_type': {},
            'by_severity': {},
            'recent_trend': []
        }

        if use_postgresql:
            from sqlalchemy import text

            # Total errors
            result = conn.execute(text("SELECT COUNT(*) FROM system_errors"))
            stats['total'] = result.fetchone()[0]

            # Unresolved errors
            result = conn.execute(text("SELECT COUNT(*) FROM system_errors WHERE is_resolved = false"))
            stats['unresolved'] = result.fetchone()[0]

            # Critical errors
            result = conn.execute(text("SELECT COUNT(*) FROM system_errors WHERE severity = 'critical' AND is_resolved = false"))
            stats['critical'] = result.fetchone()[0]

            # Today's errors
            result = conn.execute(text("SELECT COUNT(*) FROM system_errors WHERE DATE(created_at) = CURRENT_DATE"))
            stats['today'] = result.fetchone()[0]

            # By type
            result = conn.execute(text("SELECT error_type, COUNT(*) FROM system_errors GROUP BY error_type"))
            stats['by_type'] = {row[0]: row[1] for row in result}

            # By severity
            result = conn.execute(text("SELECT severity, COUNT(*) FROM system_errors GROUP BY severity"))
            stats['by_severity'] = {row[0]: row[1] for row in result}

            # Recent trend (last 7 days)
            result = conn.execute(text('''
                SELECT DATE(created_at), COUNT(*)
                FROM system_errors
                WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at)
            '''))
            stats['recent_trend'] = [{'date': str(row[0]), 'count': row[1]} for row in result]

            db_manager.release_connection(conn)
        else:
            cur = conn.cursor()

            # Total errors
            cur.execute("SELECT COUNT(*) FROM system_errors")
            stats['total'] = cur.fetchone()[0]

            # Unresolved errors
            cur.execute("SELECT COUNT(*) FROM system_errors WHERE is_resolved = 0")
            stats['unresolved'] = cur.fetchone()[0]

            # Critical errors
            cur.execute("SELECT COUNT(*) FROM system_errors WHERE severity = 'critical' AND is_resolved = 0")
            stats['critical'] = cur.fetchone()[0]

            # Today's errors
            cur.execute("SELECT COUNT(*) FROM system_errors WHERE DATE(created_at) = DATE('now')")
            stats['today'] = cur.fetchone()[0]

            # By type
            cur.execute("SELECT error_type, COUNT(*) FROM system_errors GROUP BY error_type")
            stats['by_type'] = {row[0]: row[1] for row in cur.fetchall()}

            # By severity
            cur.execute("SELECT severity, COUNT(*) FROM system_errors GROUP BY severity")
            stats['by_severity'] = {row[0]: row[1] for row in cur.fetchall()}

            # Recent trend (last 7 days)
            cur.execute('''
                SELECT DATE(created_at), COUNT(*)
                FROM system_errors
                WHERE created_at >= DATE('now', '-7 days')
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at)
            ''')
            stats['recent_trend'] = [{'date': row[0], 'count': row[1]} for row in cur.fetchall()]

            conn.close()

        return stats

    except Exception as e:
        print(f"Failed to get error stats: {e}")
        return {
            'total': 0,
            'unresolved': 0,
            'critical': 0,
            'today': 0,
            'by_type': {},
            'by_severity': {},
            'recent_trend': []
        }


def resolve_error(error_id, resolved_by, resolution_notes=None):
    """
    Mark an error as resolved.

    Args:
        error_id: ID of error to resolve
        resolved_by: Admin ID who resolved the error
        resolution_notes: Notes about the resolution

    Returns:
        bool: True if resolved successfully
    """
    try:
        conn = db_manager.get_connection()
        use_postgresql = getattr(db_manager, '_use_postgresql', False)

        if use_postgresql:
            from sqlalchemy import text
            conn.execute(text('''
                UPDATE system_errors
                SET is_resolved = true,
                    resolved_at = CURRENT_TIMESTAMP,
                    resolved_by = :resolved_by,
                    resolution_notes = :resolution_notes,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :error_id
            '''), {
                'error_id': error_id,
                'resolved_by': resolved_by,
                'resolution_notes': resolution_notes
            })
            conn.commit()
            db_manager.release_connection(conn)
        else:
            cur = conn.cursor()
            cur.execute('''
                UPDATE system_errors
                SET is_resolved = 1,
                    resolved_at = CURRENT_TIMESTAMP,
                    resolved_by = ?,
                    resolution_notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (resolved_by, resolution_notes, error_id))
            conn.commit()
            conn.close()

        return True

    except Exception as e:
        print(f"Failed to resolve error: {e}")
        return False
