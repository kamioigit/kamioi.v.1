"""
Materialized Views System for Kamioi Platform
Pre-computed views for fast dashboard rendering and analytics
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

@dataclass
class MaterializedView:
    name: str
    data: Dict[str, Any]
    last_refresh: str
    refresh_interval: int  # seconds
    dependencies: List[str]  # other views this depends on
    version: str = "1.0"

class MaterializedViewManager:
    def __init__(self):
        self.views: Dict[str, MaterializedView] = {}
        self.refresh_queue = []
        self.auto_refresh_enabled = True
        
    def create_view(self, name: str, data: Dict[str, Any], 
                   refresh_interval: int = 300, dependencies: List[str] = None):
        """Create or update a materialized view"""
        view = MaterializedView(
            name=name,
            data=data,
            last_refresh=datetime.utcnow().isoformat(),
            refresh_interval=refresh_interval,
            dependencies=dependencies or []
        )
        self.views[name] = view
        print(f"Materialized view created: {name}")
        return view
    
    def get_view(self, name: str) -> Optional[MaterializedView]:
        """Get a materialized view by name"""
        return self.views.get(name)
    
    def refresh_view(self, name: str, new_data: Dict[str, Any]):
        """Refresh a materialized view with new data"""
        if name in self.views:
            self.views[name].data = new_data
            self.views[name].last_refresh = datetime.utcnow().isoformat()
            print(f"Materialized view refreshed: {name}")
            
            # Trigger refresh of dependent views
            self._refresh_dependent_views(name)
        else:
            print(f"View not found: {name}")
    
    def _refresh_dependent_views(self, view_name: str):
        """Refresh views that depend on the given view"""
        for name, view in self.views.items():
            if view_name in view.dependencies:
                print(f"Refreshing dependent view: {name}")
                # In a real system, this would trigger the view's refresh logic
                self.refresh_view(name, view.data)  # For now, just update timestamp
    
    def is_stale(self, name: str) -> bool:
        """Check if a view is stale and needs refresh"""
        if name not in self.views:
            return True
        
        view = self.views[name]
        last_refresh = datetime.fromisoformat(view.last_refresh)
        now = datetime.utcnow()
        
        return (now - last_refresh).total_seconds() > view.refresh_interval
    
    def get_stale_views(self) -> List[str]:
        """Get list of stale views that need refresh"""
        return [name for name in self.views.keys() if self.is_stale(name)]
    
    def get_view_stats(self) -> Dict[str, Any]:
        """Get statistics about all materialized views"""
        stats = {
            'total_views': len(self.views),
            'stale_views': len(self.get_stale_views()),
            'views': {}
        }
        
        for name, view in self.views.items():
            stats['views'][name] = {
                'last_refresh': view.last_refresh,
                'refresh_interval': view.refresh_interval,
                'is_stale': self.is_stale(name),
                'dependencies': view.dependencies,
                'data_size': len(str(view.data))
            }
        
        return stats

# Global materialized view manager
mv_manager = MaterializedViewManager()

# Pre-defined materialized views
def create_user_dashboard_view(user_id: str, transactions: List[Dict], 
                              roundup_stats: Dict, mapping_stats: Dict) -> Dict[str, Any]:
    """Create materialized view for user dashboard"""
    
    # Calculate KPIs
    total_spent = sum(t.get('purchase', 0) for t in transactions)
    total_roundups = sum(t.get('round_up', 0) for t in transactions)
    total_fees = sum(t.get('fee', 0) for t in transactions)
    
    # Recent transactions (last 30 days)
    recent_transactions = [
        t for t in transactions 
        if (datetime.utcnow() - datetime.fromisoformat(t.get('date', datetime.utcnow().isoformat()))).days <= 30
    ]
    
    # Category breakdown
    category_spend = {}
    for t in transactions:
        category = t.get('category', 'Other')
        category_spend[category] = category_spend.get(category, 0) + t.get('purchase', 0)
    
    # Top merchants
    merchant_spend = {}
    for t in transactions:
        merchant = t.get('merchant', 'Unknown')
        merchant_spend[merchant] = merchant_spend.get(merchant, 0) + t.get('purchase', 0)
    
    top_merchants = sorted(merchant_spend.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        'user_id': user_id,
        'kpis': {
            'total_spent': total_spent,
            'total_roundups': total_roundups,
            'total_fees': total_fees,
            'transaction_count': len(transactions),
            'recent_transaction_count': len(recent_transactions)
        },
        'recent_transactions': recent_transactions[:10],  # Last 10
        'category_breakdown': category_spend,
        'top_merchants': top_merchants,
        'roundup_stats': roundup_stats,
        'mapping_stats': mapping_stats,
        'last_updated': datetime.utcnow().isoformat()
    }

def create_family_dashboard_view(family_id: str, members: List[str], 
                                member_data: Dict[str, Dict]) -> Dict[str, Any]:
    """Create materialized view for family dashboard"""
    
    # Aggregate member data
    total_spent = sum(data.get('kpis', {}).get('total_spent', 0) for data in member_data.values())
    total_roundups = sum(data.get('kpis', {}).get('total_roundups', 0) for data in member_data.values())
    total_fees = sum(data.get('kpis', {}).get('total_fees', 0) for data in member_data.values())
    
    # Combined category breakdown
    combined_categories = {}
    for data in member_data.values():
        for category, amount in data.get('category_breakdown', {}).items():
            combined_categories[category] = combined_categories.get(category, 0) + amount
    
    # Member leaderboard
    member_leaderboard = []
    for member_id, data in member_data.items():
        member_leaderboard.append({
            'member_id': member_id,
            'total_spent': data.get('kpis', {}).get('total_spent', 0),
            'total_roundups': data.get('kpis', {}).get('total_roundups', 0),
            'transaction_count': data.get('kpis', {}).get('transaction_count', 0)
        })
    
    member_leaderboard.sort(key=lambda x: x['total_roundups'], reverse=True)
    
    return {
        'family_id': family_id,
        'members': members,
        'kpis': {
            'total_spent': total_spent,
            'total_roundups': total_roundups,
            'total_fees': total_fees,
            'member_count': len(members),
            'total_transactions': sum(data.get('kpis', {}).get('transaction_count', 0) for data in member_data.values())
        },
        'category_breakdown': combined_categories,
        'member_leaderboard': member_leaderboard,
        'member_data': member_data,
        'last_updated': datetime.utcnow().isoformat()
    }

def create_business_dashboard_view(business_id: str, team_members: List[str],
                                  member_data: Dict[str, Dict]) -> Dict[str, Any]:
    """Create materialized view for business dashboard"""
    
    # Business KPIs
    total_expenses = sum(data.get('kpis', {}).get('total_spent', 0) for data in member_data.values())
    total_roundups = sum(data.get('kpis', {}).get('total_roundups', 0) for data in member_data.values())
    total_fees = sum(data.get('kpis', {}).get('total_fees', 0) for data in member_data.values())
    
    # Expense categories
    expense_categories = {}
    for data in member_data.values():
        for category, amount in data.get('category_breakdown', {}).items():
            expense_categories[category] = expense_categories.get(category, 0) + amount
    
    # Team spending analysis
    team_spending = []
    for member_id, data in member_data.items():
        team_spending.append({
            'member_id': member_id,
            'total_expenses': data.get('kpis', {}).get('total_spent', 0),
            'total_roundups': data.get('kpis', {}).get('total_roundups', 0),
            'transaction_count': data.get('kpis', {}).get('transaction_count', 0)
        })
    
    team_spending.sort(key=lambda x: x['total_expenses'], reverse=True)
    
    return {
        'business_id': business_id,
        'team_members': team_members,
        'kpis': {
            'total_expenses': total_expenses,
            'total_roundups': total_roundups,
            'total_fees': total_fees,
            'team_size': len(team_members),
            'total_transactions': sum(data.get('kpis', {}).get('transaction_count', 0) for data in member_data.values())
        },
        'expense_categories': expense_categories,
        'team_spending': team_spending,
        'member_data': member_data,
        'last_updated': datetime.utcnow().isoformat()
    }

def create_admin_platform_view(admin_stats: Dict, system_health: Dict,
                              user_stats: Dict, business_stats: Dict) -> Dict[str, Any]:
    """Create materialized view for admin platform overview"""
    
    return {
        'platform_kpis': {
            'total_users': admin_stats.get('total_users', 0),
            'total_families': admin_stats.get('total_families', 0),
            'total_businesses': admin_stats.get('total_businesses', 0),
            'total_transactions': admin_stats.get('total_transactions', 0),
            'total_roundups': admin_stats.get('total_roundups', 0),
            'total_fees': admin_stats.get('total_fees', 0),
            'mapping_coverage': admin_stats.get('mapping_coverage', 0),
            'system_uptime': admin_stats.get('system_uptime', 0)
        },
        'system_health': system_health,
        'user_breakdown': user_stats,
        'business_breakdown': business_stats,
        'recent_activity': admin_stats.get('recent_activity', []),
        'last_updated': datetime.utcnow().isoformat()
    }

def create_llm_center_view(queue_stats: Dict, mapping_stats: Dict,
                          model_performance: Dict) -> Dict[str, Any]:
    """Create materialized view for LLM Center"""
    
    return {
        'queue_status': queue_stats,
        'mapping_stats': mapping_stats,
        'model_performance': model_performance,
        'recent_activity': queue_stats.get('recent_entries', []),
        'last_updated': datetime.utcnow().isoformat()
    }

# Initialize default materialized views
def initialize_materialized_views():
    """Initialize default materialized views"""
    
    # User dashboard view
    mv_manager.create_view(
        'mv_user_dashboard',
        create_user_dashboard_view('user1', [], {}, {}),
        refresh_interval=300,  # 5 minutes
        dependencies=[]
    )
    
    # Family dashboard view
    mv_manager.create_view(
        'mv_family_dashboard',
        create_family_dashboard_view('family1', [], {}),
        refresh_interval=300,
        dependencies=['mv_user_dashboard']
    )
    
    # Business dashboard view
    mv_manager.create_view(
        'mv_business_dashboard',
        create_business_dashboard_view('business1', [], {}),
        refresh_interval=300,
        dependencies=['mv_user_dashboard']
    )
    
    # Admin platform view
    mv_manager.create_view(
        'mv_admin_platform',
        create_admin_platform_view({}, {}, {}, {}),
        refresh_interval=180,  # 3 minutes
        dependencies=['mv_user_dashboard', 'mv_family_dashboard', 'mv_business_dashboard']
    )
    
    # LLM Center view
    mv_manager.create_view(
        'mv_llm_center',
        create_llm_center_view({}, {}, {}),
        refresh_interval=120,  # 2 minutes
        dependencies=[]
    )
    
    print("Materialized views initialized")

# Auto-refresh system
def auto_refresh_views():
    """Auto-refresh stale materialized views"""
    stale_views = mv_manager.get_stale_views()
    
    for view_name in stale_views:
        print(f"Auto-refreshing stale view: {view_name}")
        # In a real system, this would trigger the view's refresh logic
        # For now, just update the timestamp
        view = mv_manager.get_view(view_name)
        if view:
            mv_manager.refresh_view(view_name, view.data)

# Initialize views
initialize_materialized_views()
