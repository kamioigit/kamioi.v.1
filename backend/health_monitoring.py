"""
Health Monitoring System for Kamioi Platform
Monitors system health, dependencies, and performance metrics
"""

import time
import psutil
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import threading
import json

class HealthStatus(Enum):
    UP = "UP"
    DEGRADED = "DEGRADED"
    DOWN = "DOWN"
    EXPECTED_OFF = "EXPECTED_OFF"
    NOT_LINKED = "NOT_LINKED"

@dataclass
class HealthCheck:
    name: str
    status: HealthStatus
    response_time: float
    last_check: str
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = None

@dataclass
class ServiceHealth:
    service_name: str
    status: HealthStatus
    checks: List[HealthCheck]
    last_updated: str
    uptime: float
    dependencies: List[str]

class HealthMonitor:
    def __init__(self):
        self.services: Dict[str, ServiceHealth] = {}
        self.checks: Dict[str, HealthCheck] = {}
        self.monitoring_enabled = True
        self.check_interval = 30  # seconds
        self.alert_thresholds = {
            'response_time': 5.0,  # 5 seconds
            'cpu_usage': 80.0,     # 80%
            'memory_usage': 85.0,  # 85%
            'disk_usage': 90.0     # 90%
        }
        self.monitoring_thread = None
        self.start_monitoring()
    
    def start_monitoring(self):
        """Start the health monitoring thread"""
        if not self.monitoring_thread or not self.monitoring_thread.is_alive():
            self.monitoring_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
            self.monitoring_thread.start()
            print("🏥 Health monitoring started")
    
    def stop_monitoring(self):
        """Stop the health monitoring thread"""
        self.monitoring_enabled = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
        print("🛑 Health monitoring stopped")
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.monitoring_enabled:
            try:
                self._run_all_checks()
                time.sleep(self.check_interval)
            except Exception as e:
                print(f"Error in health monitoring loop: {e}")
                time.sleep(5)  # Wait 5 seconds before retrying
    
    def _run_all_checks(self):
        """Run all health checks"""
        # System health checks
        self._check_system_resources()
        
        # Service health checks
        self._check_database_health()
        self._check_api_endpoints()
        self._check_external_services()
        
        # Application-specific checks
        self._check_event_bus_health()
        self._check_materialized_views_health()
        self._check_auto_mapping_health()
        self._check_roundup_engine_health()
    
    def _check_system_resources(self):
        """Check system resource usage"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_status = HealthStatus.UP if cpu_percent < self.alert_thresholds['cpu_usage'] else HealthStatus.DEGRADED
            
            self._update_check('system_cpu', HealthCheck(
                name='CPU Usage',
                status=cpu_status,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                metadata={'cpu_percent': cpu_percent, 'threshold': self.alert_thresholds['cpu_usage']}
            ))
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_status = HealthStatus.UP if memory_percent < self.alert_thresholds['memory_usage'] else HealthStatus.DEGRADED
            
            self._update_check('system_memory', HealthCheck(
                name='Memory Usage',
                status=memory_status,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                metadata={
                    'memory_percent': memory_percent,
                    'available_gb': memory.available / (1024**3),
                    'threshold': self.alert_thresholds['memory_usage']
                }
            ))
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            disk_status = HealthStatus.UP if disk_percent < self.alert_thresholds['disk_usage'] else HealthStatus.DEGRADED
            
            self._update_check('system_disk', HealthCheck(
                name='Disk Usage',
                status=disk_status,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                metadata={
                    'disk_percent': disk_percent,
                    'free_gb': disk.free / (1024**3),
                    'threshold': self.alert_thresholds['disk_usage']
                }
            ))
            
        except Exception as e:
            self._update_check('system_resources', HealthCheck(
                name='System Resources',
                status=HealthStatus.DOWN,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                error_message=str(e)
            ))
    
    def _check_database_health(self):
        """Check database connectivity and performance"""
        try:
            start_time = time.time()
            
            # Try to connect to database (simulated)
            # In a real system, this would test actual database connectivity
            time.sleep(0.1)  # Simulate database query
            
            response_time = time.time() - start_time
            status = HealthStatus.UP if response_time < self.alert_thresholds['response_time'] else HealthStatus.DEGRADED
            
            self._update_check('database', HealthCheck(
                name='Database',
                status=status,
                response_time=response_time,
                last_check=datetime.utcnow().isoformat(),
                metadata={'response_time': response_time}
            ))
            
        except Exception as e:
            self._update_check('database', HealthCheck(
                name='Database',
                status=HealthStatus.DOWN,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                error_message=str(e)
            ))
    
    def _check_api_endpoints(self):
        """Check API endpoint health"""
        endpoints = [
            {'name': 'Health Check', 'url': 'http://localhost:5000/api/health'},
            {'name': 'Admin Health', 'url': 'http://localhost:5000/api/admin/health'},
            {'name': 'User API', 'url': 'http://localhost:5000/api/user/transactions'},
            {'name': 'Family API', 'url': 'http://localhost:5000/api/family/dashboard/overview'},
            {'name': 'Business API', 'url': 'http://localhost:5000/api/business/dashboard/overview'}
        ]
        
        for endpoint in endpoints:
            try:
                start_time = time.time()
                response = requests.get(endpoint['url'], timeout=5)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    status = HealthStatus.UP if response_time < self.alert_thresholds['response_time'] else HealthStatus.DEGRADED
                    error_message = None
                else:
                    status = HealthStatus.DOWN
                    error_message = f"HTTP {response.status_code}"
                
                self._update_check(f"api_{endpoint['name'].lower().replace(' ', '_')}", HealthCheck(
                    name=endpoint['name'],
                    status=status,
                    response_time=response_time,
                    last_check=datetime.utcnow().isoformat(),
                    error_message=error_message,
                    metadata={'status_code': response.status_code, 'url': endpoint['url']}
                ))
                
            except Exception as e:
                self._update_check(f"api_{endpoint['name'].lower().replace(' ', '_')}", HealthCheck(
                    name=endpoint['name'],
                    status=HealthStatus.DOWN,
                    response_time=0.0,
                    last_check=datetime.utcnow().isoformat(),
                    error_message=str(e),
                    metadata={'url': endpoint['url']}
                ))
    
    def _check_external_services(self):
        """Check external service dependencies"""
        # Check if external services are accessible (simulated)
        external_services = [
            {'name': 'Stock Price API', 'status': HealthStatus.UP},
            {'name': 'Banking API', 'status': HealthStatus.UP},
            {'name': 'Email Service', 'status': HealthStatus.UP},
            {'name': 'SMS Service', 'status': HealthStatus.UP}
        ]
        
        for service in external_services:
            self._update_check(f"external_{service['name'].lower().replace(' ', '_')}", HealthCheck(
                name=service['name'],
                status=service['status'],
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                metadata={'service_type': 'external'}
            ))
    
    def _check_event_bus_health(self):
        """Check event bus health"""
        try:
            from event_bus import event_bus
            
            stats = event_bus.get_event_stats()
            queue_size = stats.get('queue_size', 0)
            
            # Event bus is healthy if queue size is reasonable
            if queue_size < 1000:  # Less than 1000 events in queue
                status = HealthStatus.UP
            elif queue_size < 5000:  # Less than 5000 events in queue
                status = HealthStatus.DEGRADED
            else:
                status = HealthStatus.DOWN
            
            self._update_check('event_bus', HealthCheck(
                name='Event Bus',
                status=status,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                metadata={'queue_size': queue_size, 'total_events': stats.get('total_events', 0)}
            ))
            
        except ImportError:
            self._update_check('event_bus', HealthCheck(
                name='Event Bus',
                status=HealthStatus.NOT_LINKED,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                error_message='Event bus not available'
            ))
    
    def _check_materialized_views_health(self):
        """Check materialized views health"""
        try:
            from materialized_views import mv_manager
            
            stats = mv_manager.get_view_stats()
            stale_views = stats.get('stale_views', 0)
            total_views = stats.get('total_views', 0)
            
            if stale_views == 0:
                status = HealthStatus.UP
            elif stale_views < total_views * 0.5:  # Less than 50% stale
                status = HealthStatus.DEGRADED
            else:
                status = HealthStatus.DOWN
            
            self._update_check('materialized_views', HealthCheck(
                name='Materialized Views',
                status=status,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                metadata={'stale_views': stale_views, 'total_views': total_views}
            ))
            
        except ImportError:
            self._update_check('materialized_views', HealthCheck(
                name='Materialized Views',
                status=HealthStatus.NOT_LINKED,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                error_message='Materialized views not available'
            ))
    
    def _check_auto_mapping_health(self):
        """Check auto-mapping pipeline health"""
        try:
            from auto_mapping_pipeline import auto_mapping_pipeline
            
            stats = auto_mapping_pipeline.get_rule_stats()
            total_rules = stats.get('total_rules', 0)
            
            # Auto-mapping is healthy if it has rules
            status = HealthStatus.UP if total_rules > 0 else HealthStatus.DEGRADED
            
            self._update_check('auto_mapping', HealthCheck(
                name='Auto-Mapping Pipeline',
                status=status,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                metadata={'total_rules': total_rules}
            ))
            
        except ImportError:
            self._update_check('auto_mapping', HealthCheck(
                name='Auto-Mapping Pipeline',
                status=HealthStatus.NOT_LINKED,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                error_message='Auto-mapping pipeline not available'
            ))
    
    def _check_roundup_engine_health(self):
        """Check round-up engine health"""
        try:
            from roundup_engine import roundup_engine
            
            stats = roundup_engine.get_admin_stats()
            total_transactions = stats.get('total_transactions', 0)
            
            # Round-up engine is healthy if it's processing transactions
            status = HealthStatus.UP if total_transactions > 0 else HealthStatus.DEGRADED
            
            self._update_check('roundup_engine', HealthCheck(
                name='Round-up Engine',
                status=status,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                metadata={'total_transactions': total_transactions}
            ))
            
        except ImportError:
            self._update_check('roundup_engine', HealthCheck(
                name='Round-up Engine',
                status=HealthStatus.NOT_LINKED,
                response_time=0.0,
                last_check=datetime.utcnow().isoformat(),
                error_message='Round-up engine not available'
            ))
    
    def _update_check(self, check_id: str, check: HealthCheck):
        """Update a health check"""
        self.checks[check_id] = check
    
    def get_overall_health(self) -> Dict[str, Any]:
        """Get overall system health"""
        if not self.checks:
            return {
                'status': HealthStatus.NOT_LINKED.value,
                'message': 'No health checks available',
                'checks': {},
                'summary': {}
            }
        
        # Calculate overall status
        status_counts = {}
        for check in self.checks.values():
            status = check.status.value
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Determine overall status
        if status_counts.get(HealthStatus.DOWN.value, 0) > 0:
            overall_status = HealthStatus.DOWN.value
        elif status_counts.get(HealthStatus.DEGRADED.value, 0) > 0:
            overall_status = HealthStatus.DEGRADED.value
        elif status_counts.get(HealthStatus.NOT_LINKED.value, 0) > 0:
            overall_status = HealthStatus.DEGRADED.value
        else:
            overall_status = HealthStatus.UP.value
        
        # Calculate summary statistics
        total_checks = len(self.checks)
        up_checks = status_counts.get(HealthStatus.UP.value, 0)
        degraded_checks = status_counts.get(HealthStatus.DEGRADED.value, 0)
        down_checks = status_counts.get(HealthStatus.DOWN.value, 0)
        not_linked_checks = status_counts.get(HealthStatus.NOT_LINKED.value, 0)
        
        return {
            'status': overall_status,
            'message': f'System health: {overall_status}',
            'checks': {check_id: {
                'name': check.name,
                'status': check.status.value,
                'response_time': check.response_time,
                'last_check': check.last_check,
                'error_message': check.error_message,
                'metadata': check.metadata
            } for check_id, check in self.checks.items()},
            'summary': {
                'total_checks': total_checks,
                'up': up_checks,
                'degraded': degraded_checks,
                'down': down_checks,
                'not_linked': not_linked_checks,
                'uptime_percentage': (up_checks / total_checks * 100) if total_checks > 0 else 0
            }
        }
    
    def get_service_health(self, service_name: str) -> Optional[ServiceHealth]:
        """Get health for a specific service"""
        return self.services.get(service_name)
    
    def get_health_history(self, hours: int = 24) -> Dict[str, List[Dict]]:
        """Get health check history (simulated)"""
        # In a real system, this would return historical health data
        return {
            'system': [],
            'database': [],
            'api': [],
            'external': []
        }

# Global health monitor instance
health_monitor = HealthMonitor()
