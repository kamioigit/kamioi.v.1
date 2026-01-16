"""
WebSocket Manager for Kamioi Platform
Handles real-time updates for all dashboards
"""

import json
import asyncio
import websockets
from datetime import datetime
from typing import Dict, List, Set
import threading
import time

class WebSocketManager:
    def __init__(self):
        self.connections: Dict[str, Set[websockets.WebSocketServerProtocol]] = {
            'user': set(),
            'family': set(),
            'business': set(),
            'admin': set()
        }
        self.connection_info: Dict[websockets.WebSocketServerProtocol, Dict] = {}
        
    def add_connection(self, websocket: websockets.WebSocketServerProtocol, dashboard_type: str, user_id: str = None):
        """Add a new WebSocket connection"""
        self.connections[dashboard_type].add(websocket)
        self.connection_info[websocket] = {
            'dashboard_type': dashboard_type,
            'user_id': user_id,
            'connected_at': datetime.utcnow().isoformat()
        }
        print(f"WebSocket connection added: {dashboard_type} (user: {user_id})")
    
    def remove_connection(self, websocket: websockets.WebSocketServerProtocol):
        """Remove a WebSocket connection"""
        if websocket in self.connection_info:
            info = self.connection_info[websocket]
            dashboard_type = info['dashboard_type']
            self.connections[dashboard_type].discard(websocket)
            del self.connection_info[websocket]
            print(f"WebSocket connection removed: {dashboard_type}")
    
    async def send_to_dashboard(self, dashboard_type: str, message: Dict):
        """Send message to all connections of a specific dashboard type"""
        if dashboard_type in self.connections:
            message_str = json.dumps(message)
            disconnected = set()
            
            for websocket in self.connections[dashboard_type]:
                try:
                    await websocket.send(message_str)
                except websockets.exceptions.ConnectionClosed:
                    disconnected.add(websocket)
                except Exception as e:
                    print(f"Error sending message to {dashboard_type}: {e}")
                    disconnected.add(websocket)
            
            # Remove disconnected connections
            for websocket in disconnected:
                self.remove_connection(websocket)
    
    async def send_to_user(self, user_id: str, message: Dict):
        """Send message to specific user across all their dashboard connections"""
        message_str = json.dumps(message)
        disconnected = set()
        
        for websocket, info in self.connection_info.items():
            if info.get('user_id') == user_id:
                try:
                    await websocket.send(message_str)
                except websockets.exceptions.ConnectionClosed:
                    disconnected.add(websocket)
                except Exception as e:
                    print(f"Error sending message to user {user_id}: {e}")
                    disconnected.add(websocket)
        
        # Remove disconnected connections
        for websocket in disconnected:
            self.remove_connection(websocket)
    
    async def broadcast_to_all(self, message: Dict):
        """Broadcast message to all connected clients"""
        message_str = json.dumps(message)
        disconnected = set()
        
        for dashboard_type, connections in self.connections.items():
            for websocket in connections:
                try:
                    await websocket.send(message_str)
                except websockets.exceptions.ConnectionClosed:
                    disconnected.add(websocket)
                except Exception as e:
                    print(f"Error broadcasting message: {e}")
                    disconnected.add(websocket)
        
        # Remove disconnected connections
        for websocket in disconnected:
            self.remove_connection(websocket)
    
    def get_connection_stats(self) -> Dict:
        """Get statistics about current connections"""
        stats = {
            'total_connections': sum(len(connections) for connections in self.connections.values()),
            'by_dashboard': {
                dashboard_type: len(connections) 
                for dashboard_type, connections in self.connections.items()
            },
            'connection_details': []
        }
        
        for websocket, info in self.connection_info.items():
            stats['connection_details'].append({
                'dashboard_type': info['dashboard_type'],
                'user_id': info['user_id'],
                'connected_at': info['connected_at']
            })
        
        return stats

# Global WebSocket manager instance
ws_manager = WebSocketManager()

async def handle_websocket_connection(websocket, path):
    """Handle incoming WebSocket connections"""
    try:
        # Parse the path to determine dashboard type and endpoint
        path_parts = path.strip('/').split('/')
        dashboard_type = path_parts[1] if len(path_parts) > 1 else 'user'
        endpoint = path_parts[2] if len(path_parts) > 2 else 'general'
        
        # Create a unique connection key for this endpoint
        connection_key = f"{dashboard_type}_{endpoint}"
        
        # Add connection with the endpoint-specific key
        ws_manager.add_connection(websocket, connection_key, endpoint)
        
        # Send welcome message
        welcome_message = {
            'type': 'connection_established',
            'dashboard_type': dashboard_type,
            'endpoint': endpoint,
            'connection_key': connection_key,
            'timestamp': datetime.utcnow().isoformat(),
            'message': f'Connected to {dashboard_type} {endpoint} endpoint'
        }
        await websocket.send(json.dumps(welcome_message))
        
        # Keep connection alive and handle incoming messages
        async for message in websocket:
            try:
                data = json.loads(message)
                await handle_websocket_message(websocket, data)
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON format'
                }))
            except Exception as e:
                print(f"Error handling WebSocket message: {e}")
                
    except websockets.exceptions.ConnectionClosed:
        pass
    except Exception as e:
        print(f"WebSocket connection error: {e}")
    finally:
        ws_manager.remove_connection(websocket)

async def handle_websocket_message(websocket, data: Dict):
    """Handle incoming WebSocket messages"""
    message_type = data.get('type')
    
    if message_type == 'ping':
        await websocket.send(json.dumps({
            'type': 'pong',
            'timestamp': datetime.utcnow().isoformat()
        }))
    elif message_type == 'subscribe':
        # Handle subscription to specific events
        event_type = data.get('event_type')
        await websocket.send(json.dumps({
            'type': 'subscribed',
            'event_type': event_type,
            'timestamp': datetime.utcnow().isoformat()
        }))
    elif message_type == 'get_stats':
        # Send connection statistics
        stats = ws_manager.get_connection_stats()
        await websocket.send(json.dumps({
            'type': 'connection_stats',
            'data': stats,
            'timestamp': datetime.utcnow().isoformat()
        }))
    else:
        await websocket.send(json.dumps({
            'type': 'error',
            'message': f'Unknown message type: {message_type}'
        }))

def start_websocket_server(host='localhost', port=8765):
    """Start the WebSocket server"""
    print(f"Starting WebSocket server on {host}:{port}")
    
    async def server():
        async with websockets.serve(handle_websocket_connection, host, port):
            print(f"WebSocket server running on ws://{host}:{port}")
            await asyncio.Future()  # Run forever
    
    # Run in a separate thread
    def run_server():
        asyncio.run(server())
    
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    return server_thread

# Real-time update functions
async def notify_transaction_update(dashboard_type: str, transaction_data: Dict):
    """Notify dashboard of transaction update"""
    message = {
        'type': 'transaction_update',
        'data': transaction_data,
        'timestamp': datetime.utcnow().isoformat()
    }
    await ws_manager.send_to_dashboard(dashboard_type, message)

async def notify_mapping_update(dashboard_type: str, mapping_data: Dict):
    """Notify dashboard of mapping update"""
    message = {
        'type': 'mapping_update',
        'data': mapping_data,
        'timestamp': datetime.utcnow().isoformat()
    }
    await ws_manager.send_to_dashboard(dashboard_type, message)

async def notify_roundup_update(user_id: str, roundup_data: Dict):
    """Notify user of round-up update"""
    message = {
        'type': 'roundup_update',
        'data': roundup_data,
        'timestamp': datetime.utcnow().isoformat()
    }
    await ws_manager.send_to_user(user_id, message)

async def notify_system_alert(alert_data: Dict):
    """Broadcast system alert to all connected clients"""
    message = {
        'type': 'system_alert',
        'data': alert_data,
        'timestamp': datetime.utcnow().isoformat()
    }
    await ws_manager.broadcast_to_all(message)

# Periodic update functions
def start_periodic_updates():
    """Start periodic updates for real-time data"""
    def update_loop():
        while True:
            try:
                # Send periodic updates every 30 seconds
                asyncio.run(send_periodic_updates())
                time.sleep(30)
            except Exception as e:
                print(f"Error in periodic updates: {e}")
                time.sleep(30)
    
    update_thread = threading.Thread(target=update_loop, daemon=True)
    update_thread.start()
    return update_thread

async def send_periodic_updates():
    """Send periodic updates to all connected clients"""
    # Get current connection stats
    stats = ws_manager.get_connection_stats()
    
    # Send heartbeat to all connections
    heartbeat_message = {
        'type': 'heartbeat',
        'data': {
            'active_connections': stats['total_connections'],
            'server_time': datetime.utcnow().isoformat()
        },
        'timestamp': datetime.utcnow().isoformat()
    }
    
    await ws_manager.broadcast_to_all(heartbeat_message)

# Integration with existing systems
def integrate_with_event_bus():
    """Integrate WebSocket manager with event bus"""
    try:
        from event_bus import event_bus, EventType
        
        def handle_event(event):
            """Handle events from the event bus"""
            if event.event_type == EventType.INGEST_RAW:
                asyncio.run(notify_transaction_update('user', {
                    'message': 'New transaction processed',
                    'transaction_id': event.data.get('transaction_id')
                }))
            elif event.event_type == EventType.MAPPING_APPROVED:
                asyncio.run(notify_mapping_update('admin', {
                    'message': 'Mapping approved',
                    'mapping_id': event.data.get('mapping_id')
                }))
            elif event.event_type == EventType.ROUNDUP_ACCRUED:
                asyncio.run(notify_roundup_update(event.tenant_id, {
                    'message': 'Round-up accrued',
                    'amount': event.data.get('amount')
                }))
        
        # Subscribe to relevant events
        event_bus.subscribe(EventType.INGEST_RAW, handle_event)
        event_bus.subscribe(EventType.MAPPING_APPROVED, handle_event)
        event_bus.subscribe(EventType.ROUNDUP_ACCRUED, handle_event)
        
        print("WebSocket manager integrated with event bus")
        
    except ImportError:
        print("Event bus not available, WebSocket manager running standalone")

# Initialize WebSocket server
def initialize_websocket_server():
    """Initialize the WebSocket server and start all services"""
    print("Initializing WebSocket server...")
    
    # Start WebSocket server
    server_thread = start_websocket_server()
    
    # Start periodic updates
    update_thread = start_periodic_updates()
    
    # Integrate with event bus
    integrate_with_event_bus()
    
    print("WebSocket server initialized successfully")
    print("WebSocket endpoints:")
    print("  - ws://localhost:8765/ws/user/<user_id>")
    print("  - ws://localhost:8765/ws/family/<family_id>")
    print("  - ws://localhost:8765/ws/business/<business_id>")
    print("  - ws://localhost:8765/ws/admin")
    
    return server_thread, update_thread
