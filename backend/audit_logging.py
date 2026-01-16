"""
Comprehensive Audit Logging System for Kamioi Platform
Tracks all admin actions, system events, and user activities for compliance and security
"""

import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib
import uuid

class AuditEventType(Enum):
    # Authentication events
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    TOKEN_REFRESH = "token_refresh"
    
    # Admin actions
    ADMIN_LOGIN = "admin_login"
    ADMIN_LOGOUT = "admin_logout"
    MAPPING_APPROVE = "mapping_approve"
    MAPPING_REJECT = "mapping_reject"
    MAPPING_AUTO_APPLY = "mapping_auto_apply"
    RULE_ADD = "rule_add"
    RULE_DELETE = "rule_delete"
    RULE_MODIFY = "rule_modify"
    USER_CREATE = "user_create"
    USER_DELETE = "user_delete"
    USER_MODIFY = "user_modify"
    SETTINGS_CHANGE = "settings_change"
    FEE_CHANGE = "fee_change"
    SYSTEM_CONFIG_CHANGE = "system_config_change"
    
    # Transaction events
    TRANSACTION_CREATE = "transaction_create"
    TRANSACTION_UPDATE = "transaction_update"
    TRANSACTION_DELETE = "transaction_delete"
    TRANSACTION_MAP = "transaction_map"
    CSV_UPLOAD = "csv_upload"
    
    # Round-up events
    ROUNDUP_ACCRUE = "roundup_accrue"
    ROUNDUP_SWEEP = "roundup_sweep"
    ROUNDUP_PREFERENCE_CHANGE = "roundup_preference_change"
    
    # System events
    SYSTEM_START = "system_start"
    SYSTEM_STOP = "system_stop"
    HEALTH_CHECK = "health_check"
    ERROR_OCCURRED = "error_occurred"
    BACKUP_CREATE = "backup_create"
    BACKUP_RESTORE = "backup_restore"
    
    # Data events
    DATA_EXPORT = "data_export"
    DATA_IMPORT = "data_import"
    DATA_DELETE = "data_delete"
    PRIVACY_REQUEST = "privacy_request"

@dataclass
class AuditLogEntry:
    id: str
    timestamp: str
    event_type: AuditEventType
    user_id: str
    user_type: str  # 'admin', 'user', 'family', 'business', 'system'
    action: str
    resource: str
    resource_id: Optional[str]
    before_state: Optional[Dict[str, Any]]
    after_state: Optional[Dict[str, Any]]
    ip_address: str
    user_agent: str
    session_id: str
    correlation_id: Optional[str]
    success: bool
    error_message: Optional[str]
    metadata: Dict[str, Any]
    hash: str  # For integrity verification

class AuditLogger:
    def __init__(self):
        self.logs: List[AuditLogEntry] = []
        self.max_logs = 100000  # Keep last 100k entries
        self.enabled = True
        
    def log_event(self, event_type: AuditEventType, user_id: str, user_type: str,
                  action: str, resource: str, resource_id: str = None,
                  before_state: Dict[str, Any] = None, after_state: Dict[str, Any] = None,
                  ip_address: str = "127.0.0.1", user_agent: str = "Unknown",
                  session_id: str = None, correlation_id: str = None,
                  success: bool = True, error_message: str = None,
                  metadata: Dict[str, Any] = None) -> str:
        """Log an audit event"""
        
        if not self.enabled:
            return ""
        
        # Generate unique ID
        log_id = str(uuid.uuid4())
        
        # Create audit log entry
        entry = AuditLogEntry(
            id=log_id,
            timestamp=datetime.utcnow().isoformat(),
            event_type=event_type,
            user_id=user_id,
            user_type=user_type,
            action=action,
            resource=resource,
            resource_id=resource_id,
            before_state=before_state,
            after_state=after_state,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id or str(uuid.uuid4()),
            correlation_id=correlation_id,
            success=success,
            error_message=error_message,
            metadata=metadata or {}
        )
        
        # Calculate hash for integrity verification
        entry.hash = self._calculate_hash(entry)
        
        # Add to logs
        self.logs.append(entry)
        
        # Maintain log size limit
        if len(self.logs) > self.max_logs:
            self.logs.pop(0)
        
        # Log to console for debugging
        print(f"📝 Audit Log: {event_type.value} - {user_id} - {action} - {resource}")
        
        return log_id
    
    def _calculate_hash(self, entry: AuditLogEntry) -> str:
        """Calculate hash for integrity verification"""
        # Create a string representation of the entry (excluding the hash field)
        entry_dict = asdict(entry)
        entry_dict.pop('hash', None)
        entry_string = json.dumps(entry_dict, sort_keys=True)
        
        # Calculate SHA-256 hash
        return hashlib.sha256(entry_string.encode()).hexdigest()
    
    def verify_integrity(self, entry: AuditLogEntry) -> bool:
        """Verify the integrity of an audit log entry"""
        calculated_hash = self._calculate_hash(entry)
        return calculated_hash == entry.hash
    
    def get_logs(self, event_type: AuditEventType = None, user_id: str = None,
                 user_type: str = None, resource: str = None,
                 start_date: str = None, end_date: str = None,
                 limit: int = 1000) -> List[AuditLogEntry]:
        """Get audit logs with filtering"""
        
        filtered_logs = self.logs
        
        # Apply filters
        if event_type:
            filtered_logs = [log for log in filtered_logs if log.event_type == event_type]
        
        if user_id:
            filtered_logs = [log for log in filtered_logs if log.user_id == user_id]
        
        if user_type:
            filtered_logs = [log for log in filtered_logs if log.user_type == user_type]
        
        if resource:
            filtered_logs = [log for log in filtered_logs if log.resource == resource]
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
            filtered_logs = [log for log in filtered_logs 
                           if datetime.fromisoformat(log.timestamp) >= start_dt]
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date)
            filtered_logs = [log for log in filtered_logs 
                           if datetime.fromisoformat(log.timestamp) <= end_dt]
        
        # Sort by timestamp (newest first) and limit
        filtered_logs.sort(key=lambda x: x.timestamp, reverse=True)
        return filtered_logs[:limit]
    
    def get_user_activity(self, user_id: str, hours: int = 24) -> List[AuditLogEntry]:
        """Get user activity for the last N hours"""
        cutoff_time = datetime.utcnow().timestamp() - (hours * 3600)
        cutoff_date = datetime.fromtimestamp(cutoff_time).isoformat()
        
        return self.get_logs(
            user_id=user_id,
            start_date=cutoff_date,
            limit=1000
        )
    
    def get_admin_actions(self, hours: int = 24) -> List[AuditLogEntry]:
        """Get admin actions for the last N hours"""
        cutoff_time = datetime.utcnow().timestamp() - (hours * 3600)
        cutoff_date = datetime.fromtimestamp(cutoff_time).isoformat()
        
        return self.get_logs(
            user_type='admin',
            start_date=cutoff_date,
            limit=1000
        )
    
    def get_security_events(self, hours: int = 24) -> List[AuditLogEntry]:
        """Get security-related events for the last N hours"""
        cutoff_time = datetime.utcnow().timestamp() - (hours * 3600)
        cutoff_date = datetime.fromtimestamp(cutoff_time).isoformat()
        
        security_events = [
            AuditEventType.LOGIN_FAILED,
            AuditEventType.PASSWORD_CHANGE,
            AuditEventType.ADMIN_LOGIN,
            AuditEventType.ADMIN_LOGOUT,
            AuditEventType.ERROR_OCCURRED,
            AuditEventType.DATA_EXPORT,
            AuditEventType.DATA_DELETE,
            AuditEventType.PRIVACY_REQUEST
        ]
        
        filtered_logs = []
        for event_type in security_events:
            logs = self.get_logs(
                event_type=event_type,
                start_date=cutoff_date,
                limit=100
            )
            filtered_logs.extend(logs)
        
        # Sort by timestamp and return
        filtered_logs.sort(key=lambda x: x.timestamp, reverse=True)
        return filtered_logs[:1000]
    
    def get_audit_stats(self) -> Dict[str, Any]:
        """Get audit logging statistics"""
        if not self.logs:
            return {
                'total_logs': 0,
                'event_types': {},
                'user_types': {},
                'success_rate': 0,
                'recent_activity': 0
            }
        
        # Count by event type
        event_types = {}
        for log in self.logs:
            event_type = log.event_type.value
            event_types[event_type] = event_types.get(event_type, 0) + 1
        
        # Count by user type
        user_types = {}
        for log in self.logs:
            user_type = log.user_type
            user_types[user_type] = user_types.get(user_type, 0) + 1
        
        # Calculate success rate
        successful_logs = len([log for log in self.logs if log.success])
        success_rate = (successful_logs / len(self.logs)) * 100 if self.logs else 0
        
        # Count recent activity (last 24 hours)
        cutoff_time = datetime.utcnow().timestamp() - (24 * 3600)
        cutoff_date = datetime.fromtimestamp(cutoff_time).isoformat()
        recent_logs = len([log for log in self.logs 
                          if log.timestamp >= cutoff_date])
        
        return {
            'total_logs': len(self.logs),
            'event_types': event_types,
            'user_types': user_types,
            'success_rate': round(success_rate, 2),
            'recent_activity': recent_logs,
            'oldest_log': self.logs[0].timestamp if self.logs else None,
            'newest_log': self.logs[-1].timestamp if self.logs else None
        }
    
    def export_logs(self, format: str = 'json') -> str:
        """Export audit logs in specified format"""
        if format == 'json':
            return json.dumps([asdict(log) for log in self.logs], indent=2)
        elif format == 'csv':
            # Simple CSV export
            if not self.logs:
                return "timestamp,event_type,user_id,user_type,action,resource,success\n"
            
            csv_lines = ["timestamp,event_type,user_id,user_type,action,resource,success"]
            for log in self.logs:
                csv_lines.append(f"{log.timestamp},{log.event_type.value},{log.user_id},{log.user_type},{log.action},{log.resource},{log.success}")
            
            return "\n".join(csv_lines)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def clear_old_logs(self, days: int = 90):
        """Clear logs older than specified days"""
        cutoff_time = datetime.utcnow().timestamp() - (days * 24 * 3600)
        cutoff_date = datetime.fromtimestamp(cutoff_time).isoformat()
        
        original_count = len(self.logs)
        self.logs = [log for log in self.logs if log.timestamp >= cutoff_date]
        removed_count = original_count - len(self.logs)
        
        print(f"🧹 Cleared {removed_count} audit logs older than {days} days")
        return removed_count

# Global audit logger instance
audit_logger = AuditLogger()

# Convenience functions for common audit events
def log_admin_action(user_id: str, action: str, resource: str, resource_id: str = None,
                    before_state: Dict[str, Any] = None, after_state: Dict[str, Any] = None,
                    ip_address: str = "127.0.0.1", user_agent: str = "Unknown",
                    success: bool = True, error_message: str = None,
                    metadata: Dict[str, Any] = None) -> str:
    """Log an admin action"""
    return audit_logger.log_event(
        event_type=AuditEventType.ADMIN_LOGIN if action == "login" else AuditEventType.SETTINGS_CHANGE,
        user_id=user_id,
        user_type='admin',
        action=action,
        resource=resource,
        resource_id=resource_id,
        before_state=before_state,
        after_state=after_state,
        ip_address=ip_address,
        user_agent=user_agent,
        success=success,
        error_message=error_message,
        metadata=metadata
    )

def log_mapping_action(user_id: str, action: str, mapping_id: str,
                      before_state: Dict[str, Any] = None, after_state: Dict[str, Any] = None,
                      ip_address: str = "127.0.0.1", user_agent: str = "Unknown",
                      success: bool = True, error_message: str = None) -> str:
    """Log a mapping-related action"""
    event_type = AuditEventType.MAPPING_APPROVE if action == "approve" else AuditEventType.MAPPING_REJECT
    return audit_logger.log_event(
        event_type=event_type,
        user_id=user_id,
        user_type='admin',
        action=action,
        resource='mapping',
        resource_id=mapping_id,
        before_state=before_state,
        after_state=after_state,
        ip_address=ip_address,
        user_agent=user_agent,
        success=success,
        error_message=error_message
    )

def log_transaction_event(user_id: str, action: str, transaction_id: str,
                         before_state: Dict[str, Any] = None, after_state: Dict[str, Any] = None,
                         ip_address: str = "127.0.0.1", user_agent: str = "Unknown",
                         success: bool = True, error_message: str = None) -> str:
    """Log a transaction-related event"""
    event_type = AuditEventType.TRANSACTION_CREATE if action == "create" else AuditEventType.TRANSACTION_UPDATE
    return audit_logger.log_event(
        event_type=event_type,
        user_id=user_id,
        user_type='user',
        action=action,
        resource='transaction',
        resource_id=transaction_id,
        before_state=before_state,
        after_state=after_state,
        ip_address=ip_address,
        user_agent=user_agent,
        success=success,
        error_message=error_message
    )

def log_system_event(event_type: AuditEventType, action: str, resource: str,
                    metadata: Dict[str, Any] = None, success: bool = True,
                    error_message: str = None) -> str:
    """Log a system event"""
    return audit_logger.log_event(
        event_type=event_type,
        user_id='system',
        user_type='system',
        action=action,
        resource=resource,
        success=success,
        error_message=error_message,
        metadata=metadata
    )
