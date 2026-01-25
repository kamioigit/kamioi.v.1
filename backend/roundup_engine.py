"""
Auto-Round-Up Engine for Kamioi Platform
Handles automatic round-up calculations, fee application, and portfolio sweeps
"""

import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json

class RoundUpEngine:
    def __init__(self):
        self.roundup_ledger = []
        self.user_preferences = {}
        self.kamioi_fee = 0  # No fee - subscription pays for service
        self.sweep_threshold = 10.00  # Auto-sweep when $10+ accumulated
        self.sweep_schedule = 'weekly'  # weekly or threshold
        
    def set_user_preference(self, user_id: str, rule: float = 1.00):
        """Set user's round-up preference ($1, $2, $3, etc.)"""
        self.user_preferences[user_id] = {
            'rule': rule,
            'enabled': True,
            'updated_at': datetime.utcnow().isoformat()
        }
    
    def get_user_preference(self, user_id: str) -> Dict:
        """Get user's round-up preference"""
        return self.user_preferences.get(user_id, {
            'rule': 1.00,
            'enabled': True,
            'updated_at': datetime.utcnow().isoformat()
        })
    
    def calculate_roundup(self, amount: float, user_id: str) -> Dict:
        """Calculate round-up for a transaction"""
        if amount <= 0:  # Only apply to debits
            return {
                'delta': 0.00,
                'fee': 0.00,
                'total_debit': amount,
                'roundup_enabled': False
            }
        
        user_pref = self.get_user_preference(user_id)
        if not user_pref['enabled']:
            return {
                'delta': 0.00,
                'fee': 0.00,
                'total_debit': amount,
                'roundup_enabled': False
            }
        
        rule = user_pref['rule']

        # FIXED: rule is the FIXED round-up amount to add to each transaction
        # NOT "round to nearest dollar" calculation
        # If user sets $1.00 round-up, EVERY transaction gets $1.00 added
        delta = rule
        
        # Apply Kamioi fee
        fee = self.kamioi_fee
        total_debit = amount + delta + fee
        
        return {
            'delta': round(delta, 2),
            'fee': fee,
            'total_debit': round(total_debit, 2),
            'roundup_enabled': True,
            'rule_used': rule
        }
    
    def process_transaction(self, transaction: Dict) -> Dict:
        """Process a transaction and apply round-up"""
        user_id = transaction.get('user_id', 'default')
        amount = float(transaction.get('amount', 0))
        
        # Calculate round-up
        roundup_data = self.calculate_roundup(amount, user_id)
        
        # Create ledger entry
        ledger_entry = {
            'id': f"roundup_{user_id}_{int(datetime.utcnow().timestamp())}",
            'user_id': user_id,
            'transaction_id': transaction.get('id'),
            'original_amount': amount,
            'delta': roundup_data['delta'],
            'fee': roundup_data['fee'],
            'total_debit': roundup_data['total_debit'],
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'swept_at': None,
            'sweep_batch_id': None
        }
        
        # Add to ledger
        self.roundup_ledger.append(ledger_entry)
        
        # Publish round-up accrued event
        try:
            from event_bus import event_bus, EventType
            event_bus.publish(
                EventType.ROUNDUP_ACCRUED,
                user_id,
                'user',
                {
                    'transaction_id': transaction.get('id'),
                    'amount': roundup_data['delta'],
                    'fee': roundup_data['fee'],
                    'total_debit': roundup_data['total_debit']
                },
                f"roundup_{ledger_entry['id']}",
                'roundup_engine'
            )
        except ImportError:
            pass  # Event bus not available
        
        # Check if auto-sweep threshold is reached
        pending_total = self.get_pending_total(user_id)
        if pending_total >= self.sweep_threshold:
            self.auto_sweep(user_id)
        
        return {
            'transaction_updated': {
                'amount': amount,
                'round_up': roundup_data['delta'],
                'fee': roundup_data['fee'],
                'total_debit': roundup_data['total_debit'],
                'roundup_enabled': roundup_data['roundup_enabled']
            },
            'ledger_entry': ledger_entry
        }
    
    def get_pending_total(self, user_id: str) -> float:
        """Get total pending round-ups for a user"""
        total = 0.0
        for entry in self.roundup_ledger:
            if (entry['user_id'] == user_id and 
                entry['status'] == 'pending'):
                total += entry['delta']
        return round(total, 2)
    
    def get_pending_entries(self, user_id: str) -> List[Dict]:
        """Get all pending round-up entries for a user"""
        return [
            entry for entry in self.roundup_ledger
            if entry['user_id'] == user_id and entry['status'] == 'pending'
        ]
    
    def auto_sweep(self, user_id: str) -> Dict:
        """Automatically sweep round-ups to portfolio"""
        pending_entries = self.get_pending_entries(user_id)
        if not pending_entries:
            return {'swept': False, 'reason': 'No pending round-ups'}
        
        sweep_batch_id = f"sweep_{user_id}_{int(datetime.utcnow().timestamp())}"
        total_swept = 0.0
        
        for entry in pending_entries:
            entry['status'] = 'swept'
            entry['swept_at'] = datetime.utcnow().isoformat()
            entry['sweep_batch_id'] = sweep_batch_id
            total_swept += entry['delta']
        
        # Publish round-up swept event
        try:
            from event_bus import event_bus, EventType
            event_bus.publish(
                EventType.ROUNDUP_SWEPT,
                user_id,
                'user',
                {
                    'sweep_batch_id': sweep_batch_id,
                    'entries_swept': len(pending_entries),
                    'total_swept': round(total_swept, 2)
                },
                f"sweep_{sweep_batch_id}",
                'roundup_engine'
            )
        except ImportError:
            pass  # Event bus not available
        
        return {
            'swept': True,
            'sweep_batch_id': sweep_batch_id,
            'entries_swept': len(pending_entries),
            'total_swept': round(total_swept, 2),
            'swept_at': datetime.utcnow().isoformat()
        }
    
    def manual_sweep(self, user_id: str) -> Dict:
        """Manual sweep trigger"""
        return self.auto_sweep(user_id)
    
    def get_user_stats(self, user_id: str) -> Dict:
        """Get round-up statistics for a user"""
        user_entries = [entry for entry in self.roundup_ledger if entry['user_id'] == user_id]
        
        total_roundups = sum(entry['delta'] for entry in user_entries)
        total_fees = sum(entry['fee'] for entry in user_entries)
        pending_roundups = sum(entry['delta'] for entry in user_entries if entry['status'] == 'pending')
        swept_roundups = sum(entry['delta'] for entry in user_entries if entry['status'] == 'swept')
        
        return {
            'total_roundups': round(total_roundups, 2),
            'total_fees': round(total_fees, 2),
            'pending_roundups': round(pending_roundups, 2),
            'swept_roundups': round(swept_roundups, 2),
            'total_transactions': len(user_entries),
            'pending_count': len([e for e in user_entries if e['status'] == 'pending']),
            'swept_count': len([e for e in user_entries if e['status'] == 'swept'])
        }
    
    def get_admin_stats(self) -> Dict:
        """Get admin-level round-up statistics"""
        total_roundups = sum(entry['delta'] for entry in self.roundup_ledger)
        total_fees = sum(entry['fee'] for entry in self.roundup_ledger)
        total_pending = sum(entry['delta'] for entry in self.roundup_ledger if entry['status'] == 'pending')
        total_swept = sum(entry['delta'] for entry in self.roundup_ledger if entry['status'] == 'swept')
        
        # User breakdown
        user_stats = {}
        for entry in self.roundup_ledger:
            user_id = entry['user_id']
            if user_id not in user_stats:
                user_stats[user_id] = {
                    'total_roundups': 0,
                    'total_fees': 0,
                    'pending_roundups': 0,
                    'swept_roundups': 0,
                    'transaction_count': 0
                }
            
            user_stats[user_id]['total_roundups'] += entry['delta']
            user_stats[user_id]['total_fees'] += entry['fee']
            user_stats[user_id]['transaction_count'] += 1
            
            if entry['status'] == 'pending':
                user_stats[user_id]['pending_roundups'] += entry['delta']
            elif entry['status'] == 'swept':
                user_stats[user_id]['swept_roundups'] += entry['delta']
        
        return {
            'total_roundups': round(total_roundups, 2),
            'total_fees': round(total_fees, 2),
            'total_pending': round(total_pending, 2),
            'total_swept': round(total_swept, 2),
            'total_transactions': len(self.roundup_ledger),
            'active_users': len(user_stats),
            'user_breakdown': user_stats
        }
    
    def get_ledger_entries(self, user_id: str = None, status: str = None) -> List[Dict]:
        """Get ledger entries with optional filtering"""
        entries = self.roundup_ledger
        
        if user_id:
            entries = [e for e in entries if e['user_id'] == user_id]
        
        if status:
            entries = [e for e in entries if e['status'] == status]
        
        return sorted(entries, key=lambda x: x['created_at'], reverse=True)

# Global round-up engine instance
roundup_engine = RoundUpEngine()
