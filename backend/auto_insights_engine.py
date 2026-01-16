"""
Auto-Insights Engine for Kamioi Platform
Generates intelligent insights and recommendations based on transaction patterns
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import statistics

@dataclass
class InsightCard:
    id: str
    type: str  # 'spending_alert', 'savings_opportunity', 'investment_suggestion', 'pattern_analysis'
    title: str
    description: str
    confidence: float
    priority: str  # 'high', 'medium', 'low'
    actionable: bool
    data: Dict[str, Any]
    created_at: str
    expires_at: Optional[str] = None

@dataclass
class SpendingPattern:
    category: str
    total_amount: float
    transaction_count: int
    avg_amount: float
    trend: str  # 'increasing', 'decreasing', 'stable'
    percentage_of_total: float

class AutoInsightsEngine:
    def __init__(self):
        self.insights: List[InsightCard] = []
        self.spending_thresholds = {
            'high_spending': 1000.0,  # $1000+ in a category
            'frequent_spending': 10,  # 10+ transactions in a category
            'savings_opportunity': 0.15,  # 15% of spending could be optimized
            'investment_threshold': 50.0  # $50+ round-ups available
        }
        
    def generate_insights(self, user_id: str, transactions: List[Dict], 
                         roundup_stats: Dict, mapping_stats: Dict) -> List[InsightCard]:
        """Generate insights for a user based on their transaction data"""
        insights = []
        
        # Analyze spending patterns
        spending_insights = self._analyze_spending_patterns(transactions)
        insights.extend(spending_insights)
        
        # Analyze savings opportunities
        savings_insights = self._analyze_savings_opportunities(transactions, roundup_stats)
        insights.extend(savings_insights)
        
        # Analyze investment opportunities
        investment_insights = self._analyze_investment_opportunities(transactions, roundup_stats)
        insights.extend(investment_insights)
        
        # Analyze spending trends
        trend_insights = self._analyze_spending_trends(transactions)
        insights.extend(trend_insights)
        
        # Analyze category optimization
        category_insights = self._analyze_category_optimization(transactions)
        insights.extend(category_insights)
        
        # Store insights
        for insight in insights:
            insight.id = f"insight_{user_id}_{int(datetime.utcnow().timestamp())}_{len(self.insights)}"
            insight.created_at = datetime.utcnow().isoformat()
            self.insights.append(insight)
        
        return insights
    
    def _analyze_spending_patterns(self, transactions: List[Dict]) -> List[InsightCard]:
        """Analyze spending patterns and generate insights"""
        insights = []
        
        # Group transactions by category
        category_spending = {}
        for txn in transactions:
            category = txn.get('category', 'Other')
            amount = txn.get('purchase', 0)
            
            if category not in category_spending:
                category_spending[category] = {'total': 0, 'count': 0, 'transactions': []}
            
            category_spending[category]['total'] += amount
            category_spending[category]['count'] += 1
            category_spending[category]['transactions'].append(txn)
        
        # Find high-spending categories
        total_spending = sum(cat['total'] for cat in category_spending.values())
        
        for category, data in category_spending.items():
            # High spending alert
            if data['total'] >= self.spending_thresholds['high_spending']:
                insights.append(InsightCard(
                    id="",
                    type="spending_alert",
                    title=f"High Spending in {category}",
                    description=f"You've spent ${data['total']:.2f} in {category} this month. Consider reviewing your budget.",
                    confidence=0.95,
                    priority="high",
                    actionable=True,
                    data={
                        'category': category,
                        'amount': data['total'],
                        'percentage': (data['total'] / total_spending * 100) if total_spending > 0 else 0,
                        'transaction_count': data['count']
                    }
                ))
            
            # Frequent spending alert
            if data['count'] >= self.spending_thresholds['frequent_spending']:
                avg_amount = data['total'] / data['count']
                insights.append(InsightCard(
                    id="",
                    type="pattern_analysis",
                    title=f"Frequent {category} Purchases",
                    description=f"You've made {data['count']} purchases in {category} with an average of ${avg_amount:.2f} per transaction.",
                    confidence=0.90,
                    priority="medium",
                    actionable=True,
                    data={
                        'category': category,
                        'transaction_count': data['count'],
                        'average_amount': avg_amount,
                        'total_amount': data['total']
                    }
                ))
        
        return insights
    
    def _analyze_savings_opportunities(self, transactions: List[Dict], 
                                     roundup_stats: Dict) -> List[InsightCard]:
        """Analyze savings opportunities"""
        insights = []
        
        # Calculate potential savings from round-ups
        total_roundups = roundup_stats.get('total_roundups', 0)
        pending_roundups = roundup_stats.get('pending_roundups', 0)
        
        if total_roundups >= self.spending_thresholds['investment_threshold']:
            insights.append(InsightCard(
                id="",
                type="savings_opportunity",
                title="Round-up Savings Available",
                description=f"You have ${total_roundups:.2f} in round-up savings ready for investment. Consider investing in diversified ETFs.",
                confidence=0.95,
                priority="high",
                actionable=True,
                data={
                    'total_roundups': total_roundups,
                    'pending_roundups': pending_roundups,
                    'investment_suggestion': 'Diversified ETFs'
                }
            ))
        
        # Analyze subscription spending
        subscription_categories = ['Entertainment', 'Software', 'Streaming', 'Membership']
        subscription_spending = 0
        
        for txn in transactions:
            if txn.get('category') in subscription_categories:
                subscription_spending += txn.get('purchase', 0)
        
        if subscription_spending > 100:  # $100+ in subscriptions
            insights.append(InsightCard(
                id="",
                type="savings_opportunity",
                title="Subscription Review Opportunity",
                description=f"You're spending ${subscription_spending:.2f} on subscriptions. Review and cancel unused services to save money.",
                confidence=0.85,
                priority="medium",
                actionable=True,
                data={
                    'subscription_spending': subscription_spending,
                    'categories': subscription_categories,
                    'potential_savings': subscription_spending * 0.2  # Assume 20% could be saved
                }
            ))
        
        return insights
    
    def _analyze_investment_opportunities(self, transactions: List[Dict], 
                                        roundup_stats: Dict) -> List[InsightCard]:
        """Analyze investment opportunities"""
        insights = []
        
        # Analyze spending by category for investment suggestions
        category_spending = {}
        for txn in transactions:
            category = txn.get('category', 'Other')
            amount = txn.get('purchase', 0)
            category_spending[category] = category_spending.get(category, 0) + amount
        
        # Suggest sector-specific investments based on spending
        sector_mappings = {
            'Technology': ['AAPL', 'MSFT', 'GOOGL', 'NVDA'],
            'Consumer Discretionary': ['AMZN', 'TSLA', 'NFLX', 'HD'],
            'Healthcare': ['JNJ', 'PFE', 'UNH', 'ABBV'],
            'Financial': ['JPM', 'BAC', 'V', 'MA'],
            'Energy': ['XOM', 'CVX', 'COP', 'EOG']
        }
        
        for category, amount in category_spending.items():
            if amount >= 500:  # $500+ spending in a category
                # Find matching sector
                for sector, tickers in sector_mappings.items():
                    if self._category_matches_sector(category, sector):
                        insights.append(InsightCard(
                            id="",
                            type="investment_suggestion",
                            title=f"Consider {sector} Investments",
                            description=f"You spend ${amount:.2f} in {category}. Consider investing in {sector} sector ETFs or stocks like {', '.join(tickers[:2])}.",
                            confidence=0.80,
                            priority="medium",
                            actionable=True,
                            data={
                                'category': category,
                                'sector': sector,
                                'suggested_tickers': tickers,
                                'spending_amount': amount
                            }
                        ))
                        break
        
        return insights
    
    def _analyze_spending_trends(self, transactions: List[Dict]) -> List[InsightCard]:
        """Analyze spending trends over time"""
        insights = []
        
        # Group transactions by week
        weekly_spending = {}
        for txn in transactions:
            try:
                date = datetime.fromisoformat(txn.get('date', datetime.utcnow().isoformat()))
                week_start = date - timedelta(days=date.weekday())
                week_key = week_start.strftime('%Y-%W')
                
                if week_key not in weekly_spending:
                    weekly_spending[week_key] = 0
                
                weekly_spending[week_key] += txn.get('purchase', 0)
            except:
                continue
        
        if len(weekly_spending) >= 4:  # At least 4 weeks of data
            weeks = sorted(weekly_spending.keys())
            amounts = [weekly_spending[week] for week in weeks]
            
            # Calculate trend
            if len(amounts) >= 2:
                recent_avg = statistics.mean(amounts[-2:])  # Last 2 weeks
                earlier_avg = statistics.mean(amounts[:-2])  # Earlier weeks
                
                if recent_avg > earlier_avg * 1.2:  # 20% increase
                    insights.append(InsightCard(
                        id="",
                        type="spending_alert",
                        title="Spending Trend Alert",
                        description=f"Your spending has increased by {((recent_avg - earlier_avg) / earlier_avg * 100):.1f}% in recent weeks. Consider reviewing your budget.",
                        confidence=0.90,
                        priority="high",
                        actionable=True,
                        data={
                            'recent_average': recent_avg,
                            'earlier_average': earlier_avg,
                            'increase_percentage': (recent_avg - earlier_avg) / earlier_avg * 100,
                            'weeks_analyzed': len(weeks)
                        }
                    ))
                elif recent_avg < earlier_avg * 0.8:  # 20% decrease
                    insights.append(InsightCard(
                        id="",
                        type="savings_opportunity",
                        title="Great Spending Control!",
                        description=f"Your spending has decreased by {((earlier_avg - recent_avg) / earlier_avg * 100):.1f}% in recent weeks. Keep up the good work!",
                        confidence=0.90,
                        priority="low",
                        actionable=False,
                        data={
                            'recent_average': recent_avg,
                            'earlier_average': earlier_avg,
                            'decrease_percentage': (earlier_avg - recent_avg) / earlier_avg * 100,
                            'weeks_analyzed': len(weeks)
                        }
                    ))
        
        return insights
    
    def _analyze_category_optimization(self, transactions: List[Dict]) -> List[InsightCard]:
        """Analyze category optimization opportunities"""
        insights = []
        
        # Find categories with high variance (inconsistent spending)
        category_amounts = {}
        for txn in transactions:
            category = txn.get('category', 'Other')
            amount = txn.get('purchase', 0)
            
            if category not in category_amounts:
                category_amounts[category] = []
            category_amounts[category].append(amount)
        
        for category, amounts in category_amounts.items():
            if len(amounts) >= 5:  # At least 5 transactions
                variance = statistics.variance(amounts)
                mean_amount = statistics.mean(amounts)
                coefficient_of_variation = (variance ** 0.5) / mean_amount if mean_amount > 0 else 0
                
                if coefficient_of_variation > 1.0:  # High variance
                    insights.append(InsightCard(
                        id="",
                        type="pattern_analysis",
                        title=f"Inconsistent {category} Spending",
                        description=f"Your {category} spending varies significantly (${min(amounts):.2f} to ${max(amounts):.2f}). Consider setting a budget for this category.",
                        confidence=0.85,
                        priority="medium",
                        actionable=True,
                        data={
                            'category': category,
                            'min_amount': min(amounts),
                            'max_amount': max(amounts),
                            'mean_amount': mean_amount,
                            'variance': variance,
                            'coefficient_of_variation': coefficient_of_variation
                        }
                    ))
        
        return insights
    
    def _category_matches_sector(self, category: str, sector: str) -> bool:
        """Check if a spending category matches an investment sector"""
        mappings = {
            'Technology': ['Technology', 'Software', 'Electronics', 'Gadgets'],
            'Consumer Discretionary': ['Shopping', 'Entertainment', 'Restaurants', 'Travel'],
            'Healthcare': ['Healthcare', 'Pharmacy', 'Medical'],
            'Financial': ['Banking', 'Financial', 'Insurance'],
            'Energy': ['Gas', 'Energy', 'Utilities']
        }
        
        return category in mappings.get(sector, [])
    
    def get_user_insights(self, user_id: str, limit: int = 10) -> List[InsightCard]:
        """Get insights for a specific user"""
        user_insights = [insight for insight in self.insights if user_id in insight.id]
        return sorted(user_insights, key=lambda x: x.created_at, reverse=True)[:limit]
    
    def get_insight_stats(self) -> Dict[str, Any]:
        """Get statistics about generated insights"""
        stats = {
            'total_insights': len(self.insights),
            'insight_types': {},
            'priority_breakdown': {'high': 0, 'medium': 0, 'low': 0},
            'actionable_insights': 0,
            'recent_insights': 0
        }
        
        # Count by type and priority
        for insight in self.insights:
            # Count by type
            insight_type = insight.type
            stats['insight_types'][insight_type] = stats['insight_types'].get(insight_type, 0) + 1
            
            # Count by priority
            priority = insight.priority
            stats['priority_breakdown'][priority] += 1
            
            # Count actionable insights
            if insight.actionable:
                stats['actionable_insights'] += 1
            
            # Count recent insights (last 24 hours)
            created_at = datetime.fromisoformat(insight.created_at)
            if (datetime.utcnow() - created_at).total_seconds() < 86400:  # 24 hours
                stats['recent_insights'] += 1
        
        return stats
    
    def clear_old_insights(self, days: int = 30):
        """Clear insights older than specified days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        self.insights = [
            insight for insight in self.insights
            if datetime.fromisoformat(insight.created_at) > cutoff_date
        ]
        print(f"🧹 Cleared insights older than {days} days")

# Global auto-insights engine instance
auto_insights_engine = AutoInsightsEngine()
