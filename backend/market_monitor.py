"""
AI-Powered Market Condition Monitoring System
Monitors market conditions, competitor pricing, and provides AI-driven recommendations
"""

import sqlite3
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np

class MarketMonitor:
    """AI-powered market condition monitoring and analysis"""
    
    def __init__(self, db_path: str = 'kamioi.db'):
        self.db_path = db_path
        self.competitor_apis = {
            'competitor_a': 'https://api.competitor-a.com/pricing',
            'competitor_b': 'https://api.competitor-b.com/fees',
            'competitor_c': 'https://api.competitor-c.com/rates'
        }
    
    def update_market_conditions(self) -> Dict:
        """
        Update market conditions with latest data and AI analysis
        Returns comprehensive market analysis
        """
        try:
            # Gather market data
            market_data = self._gather_market_data()
            
            # Analyze market conditions
            analysis = self._analyze_market_conditions(market_data)
            
            # Generate AI recommendations
            recommendations = self._generate_market_recommendations(analysis)
            
            # Store updated conditions
            self._store_market_conditions(market_data, analysis, recommendations)
            
            return {
                'success': True,
                'market_data': market_data,
                'analysis': analysis,
                'recommendations': recommendations,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _gather_market_data(self) -> Dict:
        """Gather market data from various sources"""
        market_data = {
            'volatility': self._calculate_market_volatility(),
            'competitor_fees': self._fetch_competitor_pricing(),
            'user_behavior_trends': self._analyze_user_behavior_trends(),
            'economic_indicators': self._get_economic_indicators(),
            'industry_benchmarks': self._get_industry_benchmarks()
        }
        
        return market_data
    
    def _calculate_market_volatility(self) -> float:
        """Calculate market volatility based on transaction patterns"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get transaction data for volatility calculation
        cursor.execute("""
            SELECT amount, fee, created_at
            FROM transactions 
            WHERE created_at >= date('now', '-30 days')
            ORDER BY created_at
        """)
        
        transactions = cursor.fetchall()
        conn.close()
        
        if len(transactions) < 10:
            return 0.025  # Default volatility
        
        # Calculate fee volatility
        fees = [t[1] for t in transactions if t[1]]
        if len(fees) > 1:
            fee_volatility = np.std(fees) / np.mean(fees) if np.mean(fees) > 0 else 0.025
        else:
            fee_volatility = 0.025
        
        # Calculate transaction amount volatility
        amounts = [t[0] for t in transactions if t[0]]
        if len(amounts) > 1:
            amount_volatility = np.std(amounts) / np.mean(amounts) if np.mean(amounts) > 0 else 0.025
        else:
            amount_volatility = 0.025
        
        # Combine volatilities
        combined_volatility = (fee_volatility + amount_volatility) / 2
        
        return min(0.1, max(0.01, combined_volatility))  # Clamp between 0.01 and 0.1
    
    def _fetch_competitor_pricing(self) -> Dict:
        """Fetch competitor pricing data (simulated for demo)"""
        # In a real implementation, this would fetch from actual competitor APIs
        # For demo purposes, we'll simulate competitor data
        
        competitor_fees = {
            'competitor_a': {
                'individual': 0.30,
                'family': 0.15,
                'business': 0.12
            },
            'competitor_b': {
                'individual': 0.25,
                'family': 0.12,
                'business': 0.10
            },
            'competitor_c': {
                'individual': 0.20,
                'family': 0.10,
                'business': 0.08
            }
        }
        
        # Add some random variation to simulate market changes
        import random
        variation = random.uniform(-0.05, 0.05)
        
        for competitor in competitor_fees:
            for account_type in competitor_fees[competitor]:
                competitor_fees[competitor][account_type] = max(0.05, 
                    competitor_fees[competitor][account_type] + variation)
        
        return competitor_fees
    
    def _analyze_user_behavior_trends(self) -> Dict:
        """Analyze user behavior trends for market insights"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get user behavior trends
        cursor.execute("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as transaction_count,
                AVG(amount) as avg_amount,
                AVG(fee) as avg_fee
            FROM transactions 
            WHERE created_at >= date('now', '-30 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        
        daily_trends = cursor.fetchall()
        
        # Calculate trends
        if len(daily_trends) > 1:
            transaction_counts = [t[1] for t in daily_trends]
            avg_amounts = [t[2] for t in daily_trends if t[2]]
            avg_fees = [t[3] for t in daily_trends if t[3]]
            
            # Calculate growth rates
            transaction_growth = self._calculate_growth_rate(transaction_counts)
            amount_growth = self._calculate_growth_rate(avg_amounts) if avg_amounts else 0
            fee_growth = self._calculate_growth_rate(avg_fees) if avg_fees else 0
        else:
            transaction_growth = 0
            amount_growth = 0
            fee_growth = 0
        
        conn.close()
        
        return {
            'transaction_growth_rate': transaction_growth,
            'amount_growth_rate': amount_growth,
            'fee_growth_rate': fee_growth,
            'trend_direction': 'up' if transaction_growth > 0 else 'down',
            'volatility_score': self._calculate_behavior_volatility(daily_trends)
        }
    
    def _calculate_growth_rate(self, values: List[float]) -> float:
        """Calculate growth rate for a series of values"""
        if len(values) < 2:
            return 0.0
        
        first_half = values[:len(values)//2]
        second_half = values[len(values)//2:]
        
        if not first_half or not second_half:
            return 0.0
        
        first_avg = sum(first_half) / len(first_half)
        second_avg = sum(second_half) / len(second_half)
        
        if first_avg == 0:
            return 0.0
        
        return (second_avg - first_avg) / first_avg
    
    def _calculate_behavior_volatility(self, daily_trends: List) -> float:
        """Calculate volatility in user behavior"""
        if len(daily_trends) < 3:
            return 0.5
        
        transaction_counts = [t[1] for t in daily_trends]
        if len(transaction_counts) < 2:
            return 0.5
        
        mean_count = sum(transaction_counts) / len(transaction_counts)
        variance = sum((count - mean_count) ** 2 for count in transaction_counts) / len(transaction_counts)
        volatility = (variance ** 0.5) / mean_count if mean_count > 0 else 0.5
        
        return min(1.0, max(0.0, volatility))
    
    def _get_economic_indicators(self) -> Dict:
        """Get economic indicators (simulated for demo)"""
        # In a real implementation, this would fetch from economic data APIs
        return {
            'inflation_rate': 0.03,  # 3% inflation
            'interest_rate': 0.05,    # 5% interest rate
            'gdp_growth': 0.025,      # 2.5% GDP growth
            'unemployment_rate': 0.04, # 4% unemployment
            'consumer_confidence': 0.75, # 75% confidence
            'market_sentiment': 'positive'
        }
    
    def _get_industry_benchmarks(self) -> Dict:
        """Get industry benchmarks for fintech sector"""
        return {
            'average_fee_individual': 0.25,
            'average_fee_family': 0.12,
            'average_fee_business': 0.10,
            'industry_growth_rate': 0.15,  # 15% industry growth
            'market_penetration': 0.08,    # 8% market penetration
            'customer_acquisition_cost': 25.0,  # $25 CAC
            'lifetime_value_ratio': 3.5    # 3.5x LTV/CAC ratio
        }
    
    def _analyze_market_conditions(self, market_data: Dict) -> Dict:
        """Analyze market conditions using AI algorithms"""
        volatility = market_data['volatility']
        competitor_fees = market_data['competitor_fees']
        behavior_trends = market_data['user_behavior_trends']
        economic_indicators = market_data['economic_indicators']
        industry_benchmarks = market_data['industry_benchmarks']
        
        # Calculate competitive position
        our_fees = {'individual': 0.25, 'family': 0.10, 'business': 0.10}
        competitive_analysis = {}
        
        for account_type in our_fees:
            competitor_avg = sum(
                competitor_fees[comp][account_type] 
                for comp in competitor_fees
            ) / len(competitor_fees)
            
            our_fee = our_fees[account_type]
            competitive_position = (competitor_avg - our_fee) / competitor_avg if competitor_avg > 0 else 0
            
            competitive_analysis[account_type] = {
                'our_fee': our_fee,
                'competitor_avg': competitor_avg,
                'competitive_position': competitive_position,
                'market_position': 'premium' if competitive_position > 0.1 else 'competitive' if competitive_position > -0.1 else 'discount'
            }
        
        # Calculate market sentiment
        sentiment_factors = {
            'transaction_growth': behavior_trends['transaction_growth_rate'],
            'economic_health': economic_indicators['consumer_confidence'],
            'industry_growth': industry_benchmarks['industry_growth_rate'],
            'volatility_impact': 1 - volatility  # Lower volatility = positive sentiment
        }
        
        sentiment_score = sum(sentiment_factors.values()) / len(sentiment_factors)
        
        # Determine market sentiment
        if sentiment_score > 0.7:
            market_sentiment = 'positive'
        elif sentiment_score > 0.4:
            market_sentiment = 'neutral'
        else:
            market_sentiment = 'negative'
        
        # Calculate risk factors
        risk_factors = {
            'volatility_risk': volatility,
            'competitive_risk': 1 - min(competitive_analysis[at]['competitive_position'] for at in competitive_analysis),
            'economic_risk': 1 - economic_indicators['consumer_confidence'],
            'behavior_risk': behavior_trends['volatility_score']
        }
        
        overall_risk = sum(risk_factors.values()) / len(risk_factors)
        
        return {
            'volatility': volatility,
            'competitive_analysis': competitive_analysis,
            'market_sentiment': market_sentiment,
            'sentiment_score': sentiment_score,
            'risk_factors': risk_factors,
            'overall_risk': overall_risk,
            'trend_analysis': behavior_trends,
            'economic_impact': economic_indicators
        }
    
    def _generate_market_recommendations(self, analysis: Dict) -> Dict:
        """Generate AI-powered market recommendations"""
        recommendations = {
            'fee_adjustments': {},
            'strategic_actions': [],
            'risk_mitigation': [],
            'growth_opportunities': []
        }
        
        # Fee adjustment recommendations
        competitive_analysis = analysis['competitive_analysis']
        for account_type in competitive_analysis:
            position = competitive_analysis[account_type]
            
            if position['market_position'] == 'premium' and analysis['overall_risk'] < 0.3:
                # We can maintain premium pricing
                recommendations['fee_adjustments'][account_type] = {
                    'action': 'maintain',
                    'reason': 'Strong competitive position with low risk',
                    'confidence': 0.8
                }
            elif position['market_position'] == 'discount' and analysis['market_sentiment'] == 'positive':
                # Consider increasing fees
                recommendations['fee_adjustments'][account_type] = {
                    'action': 'increase',
                    'suggested_increase': 0.02,
                    'reason': 'Market conditions support fee increase',
                    'confidence': 0.7
                }
            else:
                # Maintain current pricing
                recommendations['fee_adjustments'][account_type] = {
                    'action': 'monitor',
                    'reason': 'Market conditions require monitoring',
                    'confidence': 0.6
                }
        
        # Strategic actions based on market analysis
        if analysis['market_sentiment'] == 'positive':
            recommendations['strategic_actions'].append({
                'action': 'expand_aggressively',
                'description': 'Market conditions are favorable for growth',
                'priority': 'high'
            })
        
        if analysis['overall_risk'] > 0.6:
            recommendations['risk_mitigation'].append({
                'action': 'diversify_revenue',
                'description': 'High market risk - diversify revenue streams',
                'priority': 'high'
            })
        
        if analysis['trend_analysis']['transaction_growth_rate'] > 0.1:
            recommendations['growth_opportunities'].append({
                'action': 'scale_infrastructure',
                'description': 'High growth rate - prepare for scaling',
                'priority': 'medium'
            })
        
        return recommendations
    
    def _store_market_conditions(self, market_data: Dict, analysis: Dict, recommendations: Dict):
        """Store market conditions in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Store market conditions
        cursor.execute("""
            INSERT INTO market_conditions 
            (date, volatility, competitor_fees, market_sentiment, ai_recommendations)
            VALUES (?, ?, ?, ?, ?)
        """, (
            datetime.now().strftime('%Y-%m-%d'),
            analysis['volatility'],
            json.dumps(market_data['competitor_fees']),
            analysis['market_sentiment'],
            json.dumps(recommendations)
        ))
        
        conn.commit()
        conn.close()
    
    def get_market_analytics(self) -> Dict:
        """Get comprehensive market analytics for admin dashboard"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get latest market conditions
        cursor.execute("""
            SELECT date, volatility, competitor_fees, market_sentiment, ai_recommendations
            FROM market_conditions 
            ORDER BY date DESC 
            LIMIT 1
        """)
        
        latest_conditions = cursor.fetchone()
        
        # Get historical trends
        cursor.execute("""
            SELECT date, volatility, market_sentiment
            FROM market_conditions 
            ORDER BY date DESC 
            LIMIT 30
        """)
        
        historical_trends = cursor.fetchall()
        
        # Get competitive analysis
        if latest_conditions:
            competitor_fees = json.loads(latest_conditions[2])
            ai_recommendations = json.loads(latest_conditions[4])
        else:
            competitor_fees = {}
            ai_recommendations = {}
        
        conn.close()
        
        return {
            'latest_conditions': {
                'date': latest_conditions[0] if latest_conditions else None,
                'volatility': latest_conditions[1] if latest_conditions else 0.025,
                'market_sentiment': latest_conditions[3] if latest_conditions else 'neutral',
                'competitor_fees': competitor_fees,
                'ai_recommendations': ai_recommendations
            },
            'historical_trends': [
                {
                    'date': trend[0],
                    'volatility': trend[1],
                    'sentiment': trend[2]
                }
                for trend in historical_trends
            ],
            'competitive_analysis': self._analyze_competitive_position(competitor_fees),
            'last_updated': datetime.now().isoformat()
        }
    
    def _analyze_competitive_position(self, competitor_fees: Dict) -> Dict:
        """Analyze our competitive position vs competitors"""
        our_fees = {'individual': 0.25, 'family': 0.10, 'business': 0.10}
        
        competitive_position = {}
        for account_type in our_fees:
            if competitor_fees:
                competitor_avg = sum(
                    comp_data.get(account_type, our_fees[account_type])
                    for comp_data in competitor_fees.values()
                ) / len(competitor_fees)
                
                our_fee = our_fees[account_type]
                position_score = (competitor_avg - our_fee) / competitor_avg if competitor_avg > 0 else 0
                
                competitive_position[account_type] = {
                    'our_fee': our_fee,
                    'competitor_avg': competitor_avg,
                    'position_score': position_score,
                    'status': 'premium' if position_score > 0.1 else 'competitive' if position_score > -0.1 else 'discount'
                }
            else:
                competitive_position[account_type] = {
                    'our_fee': our_fees[account_type],
                    'competitor_avg': our_fees[account_type],
                    'position_score': 0,
                    'status': 'competitive'
                }
        
        return competitive_position


# Initialize the Market Monitor
market_monitor = MarketMonitor()
