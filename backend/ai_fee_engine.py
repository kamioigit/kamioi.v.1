"""
AI-Powered Fee Calculation Engine
This module provides intelligent fee calculation using machine learning and behavioral analysis.
"""

import sqlite3
import json
import math
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import numpy as np

class AIFeeEngine:
    """AI-powered fee calculation engine with ML capabilities"""
    
    def __init__(self, db_path: str = 'kamioi.db'):
        self.db_path = db_path
        self.ml_models = {
            'loyalty_scorer': LoyaltyScorer(),
            'behavior_analyzer': BehaviorAnalyzer(),
            'market_analyzer': MarketAnalyzer(),
            'retention_predictor': RetentionPredictor()
        }
    
    def calculate_optimal_fee(self, user_id: int, transaction_amount: float, round_up_amount: float) -> Dict:
        """
        Calculate optimal fee using AI analysis of user behavior, market conditions, and business goals
        """
        try:
            # Get user profile and current tier
            user_profile = self._get_user_profile(user_id)
            current_tier = self._get_user_tier(user_id)
            market_conditions = self._get_latest_market_conditions()
            
            # Calculate base fee from tier
            base_fee = self._get_base_fee_from_tier(user_profile['account_type'], current_tier)
            
            # AI Analysis
            ai_factors = self._analyze_ai_factors(user_profile, market_conditions, transaction_amount)
            
            # Calculate dynamic adjustments
            adjustments = self._calculate_ai_adjustments(ai_factors, user_profile)
            
            # Apply adjustments to base fee
            if user_profile['account_type'] == 'business':
                # For business accounts, apply percentage to round-up amount
                final_fee = (base_fee * round_up_amount) + adjustments['total_adjustment']
            else:
                # For individual/family accounts, apply fixed fee with adjustments
                final_fee = base_fee + adjustments['total_adjustment']
            
            # Ensure minimum fee
            final_fee = max(final_fee, 0.01)
            
            # Store AI calculation history
            self._store_ai_calculation(user_id, base_fee, adjustments, final_fee, ai_factors)
            
            return {
                'base_fee': base_fee,
                'ai_adjustments': adjustments,
                'final_fee': round(final_fee, 2),
                'ai_factors': ai_factors,
                'confidence_score': adjustments['confidence_score'],
                'tier_level': current_tier,
                'recommendation': self._generate_fee_recommendation(ai_factors, final_fee)
            }
            
        except Exception as e:
            print(f"Error in AI fee calculation: {e}")
            # Fallback to simple calculation
            return self._fallback_fee_calculation(user_id, round_up_amount)
    
    def _get_user_profile(self, user_id: int) -> Dict:
        """Get comprehensive user profile for AI analysis"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, email, account_type, current_tier, monthly_transaction_count,
                   loyalty_score, risk_profile, ai_fee_multiplier, total_lifetime_transactions,
                   avg_monthly_transactions, created_at
            FROM users WHERE id = ?
        """, (user_id,))
        
        user = cursor.fetchone()
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        # Get recent transaction history
        cursor.execute("""
            SELECT amount, fee, created_at, status
            FROM transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        """, (user_id,))
        
        transactions = cursor.fetchall()
        
        conn.close()
        
        return {
            'id': user[0],
            'email': user[1],
            'account_type': user[2],
            'current_tier': user[3],
            'monthly_transaction_count': user[4],
            'loyalty_score': user[5],
            'risk_profile': user[6],
            'ai_fee_multiplier': user[7],
            'total_lifetime_transactions': user[8],
            'avg_monthly_transactions': user[9],
            'created_at': user[10],
            'recent_transactions': transactions
        }
    
    def _get_user_tier(self, user_id: int) -> int:
        """Get user's current tier based on monthly transaction count"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT current_tier, monthly_transaction_count, account_type
            FROM users WHERE id = ?
        """, (user_id,))
        
        user = cursor.fetchone()
        if not user:
            return 1
        
        current_tier, monthly_count, account_type = user
        
        # Get tier requirements
        cursor.execute("""
            SELECT tier_level, min_transactions, max_transactions
            FROM fee_tiers 
            WHERE account_type = ? AND is_active = 1
            ORDER BY tier_level
        """, (account_type,))
        
        tiers = cursor.fetchall()
        conn.close()
        
        # Determine appropriate tier based on monthly count
        for tier_level, min_trans, max_trans in tiers:
            if min_trans <= monthly_count and (max_trans is None or monthly_count <= max_trans):
                return tier_level
        
        return current_tier
    
    def _get_base_fee_from_tier(self, account_type: str, tier_level: int) -> float:
        """Get base fee from tier configuration"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT base_fee, fee_type
            FROM fee_tiers 
            WHERE account_type = ? AND tier_level = ? AND is_active = 1
        """, (account_type, tier_level))
        
        tier = cursor.fetchone()
        conn.close()
        
        if tier:
            return tier[0]  # base_fee
        else:
            # Default fees if tier not found
            defaults = {'individual': 0.25, 'family': 0.10, 'business': 0.10}
            return defaults.get(account_type, 0.25)
    
    def _get_latest_market_conditions(self) -> Dict:
        """Get latest market conditions for AI analysis"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT volatility, competitor_fees, market_sentiment, ai_recommendations
            FROM market_conditions 
            ORDER BY date DESC 
            LIMIT 1
        """)
        
        conditions = cursor.fetchone()
        conn.close()
        
        if conditions:
            return {
                'volatility': conditions[0],
                'competitor_fees': json.loads(conditions[1]) if conditions[1] else {},
                'market_sentiment': conditions[2],
                'ai_recommendations': json.loads(conditions[3]) if conditions[3] else {}
            }
        else:
            return {
                'volatility': 0.025,
                'competitor_fees': {},
                'market_sentiment': 'neutral',
                'ai_recommendations': {}
            }
    
    def _analyze_ai_factors(self, user_profile: Dict, market_conditions: Dict, transaction_amount: float) -> Dict:
        """Analyze AI factors for fee calculation"""
        
        # Loyalty Analysis
        loyalty_score = self.ml_models['loyalty_scorer'].calculate_loyalty_score(user_profile)
        
        # Behavior Analysis
        behavior_analysis = self.ml_models['behavior_analyzer'].analyze_behavior(user_profile)
        
        # Market Analysis
        market_analysis = self.ml_models['market_analyzer'].analyze_market_conditions(market_conditions)
        
        # Retention Risk
        retention_risk = self.ml_models['retention_predictor'].predict_retention_risk(user_profile)
        
        return {
            'loyalty_score': loyalty_score,
            'behavior_analysis': behavior_analysis,
            'market_analysis': market_analysis,
            'retention_risk': retention_risk,
            'transaction_amount': transaction_amount,
            'user_tenure_days': (datetime.now() - datetime.fromisoformat(user_profile['created_at'])).days,
            'monthly_velocity': user_profile['monthly_transaction_count'],
            'lifetime_value': user_profile['total_lifetime_transactions'] * 0.25  # Estimated LTV
        }
    
    def _calculate_ai_adjustments(self, ai_factors: Dict, user_profile: Dict) -> Dict:
        """Calculate AI-based fee adjustments"""
        
        adjustments = {
            'loyalty_discount': 0.0,
            'behavior_bonus': 0.0,
            'market_adjustment': 0.0,
            'retention_incentive': 0.0,
            'volume_discount': 0.0,
            'total_adjustment': 0.0,
            'confidence_score': 0.0
        }
        
        # Loyalty-based adjustments
        loyalty_score = ai_factors['loyalty_score']
        if loyalty_score > 0.8:
            adjustments['loyalty_discount'] = -0.02  # 2 cent discount for loyal users
        elif loyalty_score > 0.6:
            adjustments['loyalty_discount'] = -0.01  # 1 cent discount
        
        # Behavior-based adjustments
        behavior = ai_factors['behavior_analysis']
        if behavior['consistency_score'] > 0.7:
            adjustments['behavior_bonus'] = -0.01  # Consistent users get discount
        
        # Market-based adjustments
        market = ai_factors['market_analysis']
        if market['competitive_pressure'] > 0.7:
            adjustments['market_adjustment'] = -0.01  # Reduce fees in competitive market
        
        # Retention incentives
        retention_risk = ai_factors['retention_risk']
        if retention_risk > 0.6:  # High churn risk
            adjustments['retention_incentive'] = -0.02  # Incentivize retention
        
        # Volume discounts
        monthly_count = user_profile['monthly_transaction_count']
        if monthly_count > 50:
            adjustments['volume_discount'] = -0.02
        elif monthly_count > 25:
            adjustments['volume_discount'] = -0.01
        
        # Calculate total adjustment
        adjustments['total_adjustment'] = sum([
            adjustments['loyalty_discount'],
            adjustments['behavior_bonus'],
            adjustments['market_adjustment'],
            adjustments['retention_incentive'],
            adjustments['volume_discount']
        ])
        
        # Calculate confidence score
        adjustments['confidence_score'] = min(1.0, max(0.0, 
            (loyalty_score + behavior['consistency_score'] + (1 - retention_risk)) / 3
        ))
        
        return adjustments
    
    def _store_ai_calculation(self, user_id: int, base_fee: float, adjustments: Dict, 
                            final_fee: float, ai_factors: Dict):
        """Store AI calculation history for learning and analysis"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get the latest transaction ID for this user
        cursor.execute("""
            SELECT id FROM transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        """, (user_id,))
        
        latest_transaction = cursor.fetchone()
        transaction_id = latest_transaction[0] if latest_transaction else None
        
        if transaction_id:
            cursor.execute("""
                INSERT INTO ai_fee_history 
                (user_id, transaction_id, base_fee, ai_adjustments, final_fee, ai_factors, tier_at_time, loyalty_score_at_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                transaction_id,
                base_fee,
                json.dumps(adjustments),
                final_fee,
                json.dumps(ai_factors),
                ai_factors.get('tier_level', 1),
                ai_factors.get('loyalty_score', 0.0)
            ))
        
        conn.commit()
        conn.close()
    
    def _generate_fee_recommendation(self, ai_factors: Dict, final_fee: float) -> str:
        """Generate AI recommendation for fee optimization"""
        loyalty_score = ai_factors['loyalty_score']
        retention_risk = ai_factors['retention_risk']
        
        if loyalty_score > 0.8 and retention_risk < 0.3:
            return "Premium user - consider tier upgrade for better rates"
        elif retention_risk > 0.6:
            return "High churn risk - consider retention incentives"
        elif loyalty_score < 0.4:
            return "Low loyalty - focus on engagement strategies"
        else:
            return "Optimal fee structure maintained"
    
    def _fallback_fee_calculation(self, user_id: int, round_up_amount: float) -> Dict:
        """Fallback fee calculation if AI analysis fails"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT account_type, current_tier FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            account_type, tier = user
            base_fee = self._get_base_fee_from_tier(account_type, tier)
            
            if account_type == 'business':
                final_fee = base_fee * round_up_amount
            else:
                final_fee = base_fee
        else:
            final_fee = 0.25  # Default fallback
        
        return {
            'base_fee': final_fee,
            'ai_adjustments': {'total_adjustment': 0.0, 'confidence_score': 0.5},
            'final_fee': final_fee,
            'ai_factors': {},
            'confidence_score': 0.5,
            'tier_level': 1,
            'recommendation': 'Fallback calculation used'
        }


class LoyaltyScorer:
    """ML model for calculating user loyalty scores"""
    
    def calculate_loyalty_score(self, user_profile: Dict) -> float:
        """Calculate loyalty score based on user behavior patterns"""
        score = 0.0
        
        # Tenure factor (0-0.3)
        tenure_days = (datetime.now() - datetime.fromisoformat(user_profile['created_at'])).days
        tenure_score = min(0.3, tenure_days / 365 * 0.3)  # Max 0.3 for 1+ year
        score += tenure_score
        
        # Transaction frequency (0-0.3)
        monthly_count = user_profile['monthly_transaction_count']
        if monthly_count > 0:
            frequency_score = min(0.3, monthly_count / 50 * 0.3)  # Max 0.3 for 50+ transactions
            score += frequency_score
        
        # Lifetime value (0-0.2)
        lifetime_transactions = user_profile['total_lifetime_transactions']
        if lifetime_transactions > 0:
            ltv_score = min(0.2, lifetime_transactions / 200 * 0.2)  # Max 0.2 for 200+ transactions
            score += ltv_score
        
        # Consistency (0-0.2)
        avg_monthly = user_profile['avg_monthly_transactions']
        if avg_monthly > 0 and monthly_count > 0:
            consistency = min(1.0, monthly_count / max(avg_monthly, 1))
            consistency_score = min(0.2, consistency * 0.2)
            score += consistency_score
        
        return min(1.0, max(0.0, score))


class BehaviorAnalyzer:
    """ML model for analyzing user behavior patterns"""
    
    def analyze_behavior(self, user_profile: Dict) -> Dict:
        """Analyze user behavior for fee optimization"""
        recent_transactions = user_profile.get('recent_transactions', [])
        
        if not recent_transactions:
            return {
                'consistency_score': 0.5,
                'activity_level': 'low',
                'engagement_score': 0.3,
                'risk_level': 'medium'
            }
        
        # Calculate consistency score
        transaction_amounts = [t[0] for t in recent_transactions if t[0]]
        if len(transaction_amounts) > 1:
            amount_variance = np.var(transaction_amounts) if len(transaction_amounts) > 1 else 0
            consistency_score = max(0.0, 1.0 - (amount_variance / 1000))  # Normalize variance
        else:
            consistency_score = 0.5
        
        # Determine activity level
        monthly_count = user_profile['monthly_transaction_count']
        if monthly_count > 30:
            activity_level = 'high'
        elif monthly_count > 10:
            activity_level = 'medium'
        else:
            activity_level = 'low'
        
        # Calculate engagement score
        engagement_score = min(1.0, monthly_count / 30)  # Max 1.0 for 30+ transactions
        
        # Determine risk level
        if monthly_count < 5 and user_profile['total_lifetime_transactions'] < 20:
            risk_level = 'high'
        elif monthly_count < 15:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'consistency_score': consistency_score,
            'activity_level': activity_level,
            'engagement_score': engagement_score,
            'risk_level': risk_level
        }


class MarketAnalyzer:
    """ML model for analyzing market conditions"""
    
    def analyze_market_conditions(self, market_conditions: Dict) -> Dict:
        """Analyze market conditions for fee adjustments"""
        volatility = market_conditions.get('volatility', 0.025)
        competitor_fees = market_conditions.get('competitor_fees', {})
        market_sentiment = market_conditions.get('market_sentiment', 'neutral')
        
        # Calculate competitive pressure
        if competitor_fees:
            avg_competitor_fee = sum(competitor_fees.values()) / len(competitor_fees)
            competitive_pressure = min(1.0, avg_competitor_fee / 0.30)  # Normalize to our max fee
        else:
            competitive_pressure = 0.5
        
        # Market sentiment impact
        sentiment_multiplier = {
            'positive': 1.1,
            'neutral': 1.0,
            'negative': 0.9
        }.get(market_sentiment, 1.0)
        
        return {
            'volatility': volatility,
            'competitive_pressure': competitive_pressure,
            'sentiment_multiplier': sentiment_multiplier,
            'market_risk': min(1.0, volatility * 20)  # Scale volatility to 0-1
        }


class RetentionPredictor:
    """ML model for predicting user retention risk"""
    
    def predict_retention_risk(self, user_profile: Dict) -> float:
        """Predict likelihood of user churning"""
        risk_factors = []
        
        # Low activity risk
        monthly_count = user_profile['monthly_transaction_count']
        if monthly_count < 5:
            risk_factors.append(0.3)
        
        # New user risk
        tenure_days = (datetime.now() - datetime.fromisoformat(user_profile['created_at'])).days
        if tenure_days < 30:
            risk_factors.append(0.2)
        
        # Declining activity risk
        avg_monthly = user_profile['avg_monthly_transactions']
        if avg_monthly > 0 and monthly_count < avg_monthly * 0.5:
            risk_factors.append(0.4)
        
        # Low lifetime value risk
        lifetime_transactions = user_profile['total_lifetime_transactions']
        if lifetime_transactions < 10:
            risk_factors.append(0.2)
        
        # Calculate overall risk
        if risk_factors:
            retention_risk = min(1.0, sum(risk_factors) / len(risk_factors))
        else:
            retention_risk = 0.1  # Low risk for active users
        
        return retention_risk


# Initialize the AI Fee Engine
ai_fee_engine = AIFeeEngine()
