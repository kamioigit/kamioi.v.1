"""
Event Bus System for Kamioi Platform
Handles event-driven architecture with typed events and materialized view updates
"""

import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import queue

class EventType(Enum):
    # Ingest events
    INGEST_RAW = "evt.ingest.raw"
    INGEST_NORMALIZED = "evt.ingest.normalized"
    
    # Mapping events
    MAPPING_UNMAPPED = "evt.mapping.unmapped"
    MAPPING_PROPOSED = "evt.mapping.proposed"
    MAPPING_APPROVED = "evt.mapping.approved"
    MAPPING_REJECTED = "evt.mapping.rejected"
    MAPPING_AUTO_APPLIED = "evt.mapping.auto_applied"
    
    # Analytics events
    ANALYTICS_READY = "evt.analytics.ready"
    ANALYTICS_UPDATED = "evt.analytics.updated"
    
    # Scoring events
    SCORES_READY = "evt.scores.ready"
    SCORES_UPDATED = "evt.scores.updated"
    
    # LLM events
    LLM_BUNDLE = "evt.llm.bundle"
    LLM_INSIGHT_GENERATED = "evt.llm.insight_generated"
    
    # Round-up events
    ROUNDUP_ACCRUED = "evt.roundup.accrued"
    ROUNDUP_SWEPT = "evt.roundup.swept"
    
    # Notification events
    NOTIFY_SENT = "evt.notify.sent"
    NOTIFY_FAILED = "evt.notify.failed"
    
    # System events
    SYSTEM_HEALTH_CHECK = "evt.system.health_check"
    SYSTEM_ERROR = "evt.system.error"

@dataclass
class Event:
    id: str
    type: EventType
    tenant_id: str
    tenant_type: str  # 'user', 'family', 'business'
    data: Dict[str, Any]
    timestamp: str
    correlation_id: Optional[str] = None
    source: str = "system"
    version: str = "1.0"

class EventBus:
    def __init__(self):
        self.subscribers: Dict[EventType, List[Callable]] = {}
        self.event_queue = queue.Queue()
        self.running = False
        self.worker_thread = None
        self.event_history: List[Event] = []
        self.max_history = 10000  # Keep last 10k events
        
    def start(self):
        """Start the event bus worker thread"""
        if not self.running:
            self.running = True
            self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
            self.worker_thread.start()
            print("Event Bus started")
    
    def stop(self):
        """Stop the event bus worker thread"""
        self.running = False
        if self.worker_thread:
            self.worker_thread.join()
        print("Event Bus stopped")
    
    def _worker_loop(self):
        """Main worker loop for processing events"""
        while self.running:
            try:
                # Get event from queue with timeout
                event = self.event_queue.get(timeout=1.0)
                self._process_event(event)
                self.event_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error processing event: {e}")
    
    def _process_event(self, event: Event):
        """Process a single event"""
        try:
            # Add to history
            self.event_history.append(event)
            if len(self.event_history) > self.max_history:
                self.event_history.pop(0)
            
            # Notify subscribers
            subscribers = self.subscribers.get(event.type, [])
            for callback in subscribers:
                try:
                    callback(event)
                except Exception as e:
                    print(f"Error in event subscriber: {e}")
            
            print(f"Event processed: {event.type.value} for {event.tenant_id}")
            
        except Exception as e:
            print(f"Error processing event {event.id}: {e}")
    
    def publish(self, event_type: EventType, tenant_id: str, tenant_type: str, 
                data: Dict[str, Any], correlation_id: str = None, source: str = "system"):
        """Publish an event to the bus"""
        event = Event(
            id=f"evt_{int(datetime.utcnow().timestamp() * 1000)}_{len(self.event_history)}",
            type=event_type,
            tenant_id=tenant_id,
            tenant_type=tenant_type,
            data=data,
            timestamp=datetime.utcnow().isoformat(),
            correlation_id=correlation_id,
            source=source
        )
        
        self.event_queue.put(event)
        return event.id
    
    def subscribe(self, event_type: EventType, callback: Callable[[Event], None]):
        """Subscribe to an event type"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)
        print(f"Subscribed to {event_type.value}")
    
    def unsubscribe(self, event_type: EventType, callback: Callable[[Event], None]):
        """Unsubscribe from an event type"""
        if event_type in self.subscribers:
            try:
                self.subscribers[event_type].remove(callback)
                print(f"Unsubscribed from {event_type.value}")
            except ValueError:
                pass
    
    def get_events(self, event_type: EventType = None, tenant_id: str = None, 
                   limit: int = 100) -> List[Event]:
        """Get recent events with optional filtering"""
        events = self.event_history
        
        if event_type:
            events = [e for e in events if e.type == event_type]
        
        if tenant_id:
            events = [e for e in events if e.tenant_id == tenant_id]
        
        # Return most recent events
        return events[-limit:] if limit else events
    
    def get_event_stats(self) -> Dict[str, Any]:
        """Get event bus statistics"""
        stats = {
            'total_events': len(self.event_history),
            'queue_size': self.event_queue.qsize(),
            'subscribers': {event_type.value: len(callbacks) 
                          for event_type, callbacks in self.subscribers.items()},
            'event_types': list(set(e.type.value for e in self.event_history)),
            'recent_events': len([e for e in self.event_history 
                                if (datetime.utcnow() - datetime.fromisoformat(e.timestamp)).seconds < 60])
        }
        return stats

# Global event bus instance
event_bus = EventBus()

# Event handlers for materialized view updates
def handle_ingest_raw(event: Event):
    """Handle raw transaction ingestion"""
    print(f"Processing raw transaction for {event.tenant_id}")
    # Trigger normalization process
    event_bus.publish(
        EventType.INGEST_NORMALIZED,
        event.tenant_id,
        event.tenant_type,
        {'raw_transaction_id': event.data.get('transaction_id')},
        event.correlation_id,
        'normalizer'
    )

def handle_mapping_approved(event: Event):
    """Handle approved mapping - trigger backfill"""
    print(f"✅ Mapping approved for {event.tenant_id}, triggering backfill")
    # Trigger analytics update
    event_bus.publish(
        EventType.ANALYTICS_READY,
        event.tenant_id,
        event.tenant_type,
        {'mapping_id': event.data.get('mapping_id')},
        event.correlation_id,
        'mapping_service'
    )

def handle_roundup_accrued(event: Event):
    """Handle round-up accrual"""
    print(f"💰 Round-up accrued for {event.tenant_id}: ${event.data.get('amount', 0)}")
    # Check if auto-sweep threshold reached
    if event.data.get('auto_sweep', False):
        event_bus.publish(
            EventType.ROUNDUP_SWEPT,
            event.tenant_id,
            event.tenant_type,
            {'sweep_amount': event.data.get('amount')},
            event.correlation_id,
            'roundup_engine'
        )

def handle_analytics_ready(event: Event):
    """Handle analytics ready - trigger scoring and materialized view refresh"""
    print(f"Analytics ready for {event.tenant_id}")
    
    # Refresh materialized views
    try:
        from materialized_views import mv_manager, auto_refresh_views
        auto_refresh_views()
        print(f"🔄 Materialized views refreshed for {event.tenant_id}")
    except ImportError:
        pass  # Materialized views not available
    
    # Trigger scoring
    event_bus.publish(
        EventType.SCORES_READY,
        event.tenant_id,
        event.tenant_type,
        {'analytics_id': event.data.get('analytics_id')},
        event.correlation_id,
        'analytics_service'
    )

def handle_scores_ready(event: Event):
    """Handle scores ready - trigger LLM insights"""
    print(f"Scores ready for {event.tenant_id}")
    # Trigger LLM insight generation
    event_bus.publish(
        EventType.LLM_INSIGHT_GENERATED,
        event.tenant_id,
        event.tenant_type,
        {'scores_id': event.data.get('scores_id')},
        event.correlation_id,
        'scoring_service'
    )

def handle_llm_insight_generated(event: Event):
    """Handle LLM insight generation - trigger notifications"""
    print(f"LLM insight generated for {event.tenant_id}")
    
    # Generate auto-insights
    try:
        from auto_insights_engine import auto_insights_engine
        # This would normally fetch user transactions and generate insights
        # For now, we'll simulate with empty data
        insights = auto_insights_engine.generate_insights(
            event.tenant_id,
            [],  # transactions would be fetched here
            {},  # roundup_stats would be fetched here
            {}   # mapping_stats would be fetched here
        )
        print(f"💡 Generated {len(insights)} auto-insights for {event.tenant_id}")
    except ImportError:
        pass  # Auto-insights engine not available
    
    # Trigger notification
    event_bus.publish(
        EventType.NOTIFY_SENT,
        event.tenant_id,
        event.tenant_type,
        {'insight_id': event.data.get('insight_id')},
        event.correlation_id,
        'llm_service'
    )

# Register default event handlers
def initialize_event_handlers():
    """Initialize default event handlers"""
    event_bus.subscribe(EventType.INGEST_RAW, handle_ingest_raw)
    event_bus.subscribe(EventType.MAPPING_APPROVED, handle_mapping_approved)
    event_bus.subscribe(EventType.ROUNDUP_ACCRUED, handle_roundup_accrued)
    event_bus.subscribe(EventType.ANALYTICS_READY, handle_analytics_ready)
    event_bus.subscribe(EventType.SCORES_READY, handle_scores_ready)
    event_bus.subscribe(EventType.LLM_INSIGHT_GENERATED, handle_llm_insight_generated)
    
    print("Event handlers initialized")

# Start the event bus
event_bus.start()
initialize_event_handlers()
