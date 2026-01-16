"""
Mapping Queue System for Kamioi Platform
Handles the flow: User Submit → LLM Proposal → Admin Review → Auto-Apply
"""

from datetime import datetime
from typing import Dict, List, Optional
import json

class MappingQueue:
    def __init__(self):
        self.queue = []
        self.llm_proposals = {}
        self.resolver_rules = {}
        self.auto_threshold = 0.92
        self.review_threshold = 0.70
        
    def submit_mapping(self, tenant_id: str, raw_string: str, user_hint_ticker: str = None) -> Dict:
        """Submit a mapping for processing"""
        mapping_id = f"mapping_{tenant_id}_{int(datetime.utcnow().timestamp())}"
        
        queue_entry = {
            'id': mapping_id,
            'tenant_id': tenant_id,
            'raw_string': raw_string,
            'user_hint_ticker': user_hint_ticker,
            'status': 'submitted_user',
            'created_at': datetime.utcnow().isoformat(),
            'llm_proposal': None,
            'admin_decision': None
        }
        
        self.queue.append(queue_entry)
        
        # Auto-trigger LLM proposal
        self._trigger_llm_proposal(mapping_id)
        
        return queue_entry
    
    def _trigger_llm_proposal(self, mapping_id: str):
        """Trigger LLM proposal for a mapping"""
        queue_entry = next((q for q in self.queue if q['id'] == mapping_id), None)
        if not queue_entry:
            return
        
        # Simulate LLM processing
        proposal = self._generate_llm_proposal(queue_entry['raw_string'], queue_entry['user_hint_ticker'])
        
        queue_entry['llm_proposal'] = proposal
        queue_entry['status'] = 'proposed_by_llm'
        
        # Check if auto-apply threshold is met
        if proposal['confidence'] >= self.auto_threshold:
            self._auto_apply_mapping(mapping_id, proposal)
        elif proposal['confidence'] >= self.review_threshold:
            queue_entry['status'] = 'needs_review'
        else:
            queue_entry['status'] = 'needs_review'  # Low confidence still needs review
    
    def _generate_llm_proposal(self, raw_string: str, user_hint: str = None) -> Dict:
        """Generate LLM proposal for merchant mapping using auto-mapping pipeline"""
        try:
            from auto_mapping_pipeline import auto_mapping_pipeline
            
            # Use the auto-mapping pipeline
            result = auto_mapping_pipeline.map_merchant(raw_string, user_hint)
            
            return {
                'merchant': result.merchant,
                'ticker': result.ticker,
                'category': result.category,
                'confidence': result.confidence,
                'evidence': result.evidence,
                'method': result.method,
                'model_version': 'v2.0'
            }
            
        except ImportError:
            # Fallback to simple mapping if auto-mapping pipeline not available
            raw_lower = raw_string.lower()
            
            # Known mappings
            mappings = {
                'starbucks': {'merchant': 'Starbucks', 'ticker': 'SBUX', 'category': 'Food & Dining', 'confidence': 0.95},
                'amazon': {'merchant': 'Amazon', 'ticker': 'AMZN', 'category': 'Shopping', 'confidence': 0.95},
                'apple': {'merchant': 'Apple', 'ticker': 'AAPL', 'category': 'Technology', 'confidence': 0.95},
                'costco': {'merchant': 'Costco', 'ticker': 'COST', 'category': 'Warehouse Club', 'confidence': 0.95},
                'target': {'merchant': 'Target', 'ticker': 'TGT', 'category': 'Shopping', 'confidence': 0.95},
                'netflix': {'merchant': 'Netflix', 'ticker': 'NFLX', 'category': 'Entertainment', 'confidence': 0.95},
                'uber': {'merchant': 'Uber', 'ticker': 'UBER', 'category': 'Transportation', 'confidence': 0.90},
                'tesla': {'merchant': 'Tesla', 'ticker': 'TSLA', 'category': 'Automotive', 'confidence': 0.95}
            }
            
            # Check for exact matches first
            for keyword, mapping in mappings.items():
                if keyword in raw_lower:
                    return {
                        'merchant': mapping['merchant'],
                        'ticker': mapping['ticker'],
                        'category': mapping['category'],
                        'confidence': mapping['confidence'],
                        'evidence': f"Exact match for '{keyword}' in merchant string",
                        'method': 'fallback_exact',
                        'model_version': 'v1.0'
                    }
            
            # If user provided hint, use it with lower confidence
            if user_hint:
                return {
                    'merchant': user_hint,
                    'ticker': user_hint,
                    'category': 'Unknown',
                    'confidence': 0.75,
                    'evidence': f"User suggested ticker: {user_hint}",
                    'method': 'user_hint',
                    'model_version': 'v1.0'
                }
            
            # Default unknown mapping
            return {
                'merchant': 'Unknown',
                'ticker': None,
                'category': 'Unknown',
                'confidence': 0.30,
                'evidence': 'No matching patterns found',
                'method': 'none',
                'model_version': 'v1.0'
            }
    
    def _auto_apply_mapping(self, mapping_id: str, proposal: Dict):
        """Auto-apply mapping if confidence is high enough"""
        queue_entry = next((q for q in self.queue if q['id'] == mapping_id), None)
        if not queue_entry:
            return
        
        queue_entry['status'] = 'auto_applied'
        queue_entry['admin_decision'] = {
            'decision': 'approved',
            'approved_by': 'system',
            'approved_at': datetime.utcnow().isoformat(),
            'reason': f"Auto-approved due to high confidence ({proposal['confidence']})"
        }
        
        # Add to resolver rules
        self._add_resolver_rule(queue_entry['raw_string'], proposal)
        
        # Publish event for auto-applied mapping
        try:
            from event_bus import event_bus, EventType
            event_bus.publish(
                EventType.MAPPING_AUTO_APPLIED,
                queue_entry['tenant_id'],
                'user',
                {
                    'mapping_id': mapping_id,
                    'merchant': proposal['merchant'],
                    'ticker': proposal['ticker'],
                    'confidence': proposal['confidence']
                },
                f"mapping_{mapping_id}",
                'mapping_queue'
            )
        except ImportError:
            pass  # Event bus not available
    
    def admin_approve(self, mapping_id: str, admin_id: str, notes: str = None) -> Dict:
        """Admin approves a mapping"""
        queue_entry = next((q for q in self.queue if q['id'] == mapping_id), None)
        if not queue_entry:
            return {'error': 'Mapping not found'}
        
        proposal = queue_entry['llm_proposal']
        if not proposal:
            return {'error': 'No LLM proposal found'}
        
        queue_entry['status'] = 'approved'
        queue_entry['admin_decision'] = {
            'decision': 'approved',
            'approved_by': admin_id,
            'approved_at': datetime.utcnow().isoformat(),
            'notes': notes
        }
        
        # Add to resolver rules
        self._add_resolver_rule(queue_entry['raw_string'], proposal)
        
        # Publish event for approved mapping
        try:
            from event_bus import event_bus, EventType
            event_bus.publish(
                EventType.MAPPING_APPROVED,
                queue_entry['tenant_id'],
                'user',
                {
                    'mapping_id': mapping_id,
                    'merchant': proposal['merchant'],
                    'ticker': proposal['ticker'],
                    'confidence': proposal['confidence'],
                    'approved_by': admin_id
                },
                f"mapping_{mapping_id}",
                'mapping_queue'
            )
        except ImportError:
            pass  # Event bus not available
        
        return queue_entry
    
    def admin_reject(self, mapping_id: str, admin_id: str, reason: str) -> Dict:
        """Admin rejects a mapping"""
        queue_entry = next((q for q in self.queue if q['id'] == mapping_id), None)
        if not queue_entry:
            return {'error': 'Mapping not found'}
        
        queue_entry['status'] = 'rejected'
        queue_entry['admin_decision'] = {
            'decision': 'rejected',
            'approved_by': admin_id,
            'approved_at': datetime.utcnow().isoformat(),
            'reason': reason
        }
        
        return queue_entry
    
    def _add_resolver_rule(self, raw_string: str, proposal: Dict):
        """Add a new resolver rule"""
        rule_id = f"rule_{int(datetime.utcnow().timestamp())}"
        self.resolver_rules[rule_id] = {
            'pattern': raw_string,
            'merchant': proposal['merchant'],
            'ticker': proposal['ticker'],
            'category': proposal['category'],
            'confidence': proposal['confidence'],
            'created_at': datetime.utcnow().isoformat()
        }
    
    def get_queue_status(self) -> Dict:
        """Get current queue status"""
        status_counts = {}
        for entry in self.queue:
            status = entry['status']
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            'total_entries': len(self.queue),
            'status_breakdown': status_counts,
            'pending_review': status_counts.get('needs_review', 0),
            'auto_applied': status_counts.get('auto_applied', 0),
            'approved': status_counts.get('approved', 0),
            'rejected': status_counts.get('rejected', 0)
        }
    
    def get_pending_reviews(self) -> List[Dict]:
        """Get all mappings pending admin review"""
        return [entry for entry in self.queue if entry['status'] == 'needs_review']
    
    def get_all_entries(self) -> List[Dict]:
        """Get all queue entries"""
        return self.queue

# Global mapping queue instance
mapping_queue = MappingQueue()
