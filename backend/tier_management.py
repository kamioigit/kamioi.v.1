"""
AI-Powered Tier Management System
Automatically manages user tiers based on transaction patterns and AI predictions
"""

import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from ai_fee_engine import AIFeeEngine

class TierManagementSystem:
    """AI-powered tier management with automatic upgrades and optimizations"""
    
    def __init__(self, db_path: str = 'kamioi.db'):
        self.db_path = db_path
        self.ai_engine = AIFeeEngine(db_path)
    
    def process_tier_updates(self, user_id: int = None) -> Dict:
        """
        Process tier updates for all users or specific user
        Returns summary of tier changes and recommendations
        """
        try:
            if user_id:
                users_to_process = [self._get_user_info(user_id)]
            else:
                users_to_process = self._get_all_users()
            
            tier_changes = []
            recommendations = []
            
            for user in users_to_process:
                # Analyze current tier status
                tier_analysis = self._analyze_user_tier(user['id'])
                
                # Check if tier upgrade is needed
                if tier_analysis['should_upgrade']:
                    new_tier = tier_analysis['recommended_tier']
                    old_tier = user['current_tier']
                    
                    # Perform tier upgrade
                    upgrade_result = self._upgrade_user_tier(user['id'], new_tier)
                    
                    if upgrade_result['success']:
                        tier_changes.append({
                            'user_id': user['id'],
                            'email': user['email'],
                            'old_tier': old_tier,
                            'new_tier': new_tier,
                            'upgrade_reason': tier_analysis['upgrade_reason'],
                            'benefits': upgrade_result['benefits']
                        })
                
                # Generate AI recommendations
                user_recommendations = self._generate_user_recommendations(user['id'])
                recommendations.extend(user_recommendations)
            
            # Update tier statistics
            self._update_tier_statistics()
            
            return {
                'success': True,
                'tier_changes': tier_changes,
                'recommendations': recommendations,
                'processed_users': len(users_to_process),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _get_user_info(self, user_id: int) -> Dict:
        """Get user information for tier analysis"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, email, account_type, current_tier, monthly_transaction_count,
                   loyalty_score, total_lifetime_transactions, created_at
            FROM users WHERE id = ?
        """, (user_id,))
        
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        return {
            'id': user[0],
            'email': user[1],
            'account_type': user[2],
            'current_tier': user[3],
            'monthly_transaction_count': user[4],
            'loyalty_score': user[5],
            'total_lifetime_transactions': user[6],
            'created_at': user[7]
        }
    
    def _get_all_users(self) -> List[Dict]:
        """Get all users for batch tier processing"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, email, account_type, current_tier, monthly_transaction_count,
                   loyalty_score, total_lifetime_transactions, created_at
            FROM users
            ORDER BY monthly_transaction_count DESC
        """)
        
        users = cursor.fetchall()
        conn.close()
        
        return [
            {
                'id': user[0],
                'email': user[1],
                'account_type': user[2],
                'current_tier': user[3],
                'monthly_transaction_count': user[4],
                'loyalty_score': user[5],
                'total_lifetime_transactions': user[6],
                'created_at': user[7]
            }
            for user in users
        ]
    
    def _analyze_user_tier(self, user_id: int) -> Dict:
        """Analyze if user should be upgraded to higher tier"""
        user = self._get_user_info(user_id)
        
        # Get tier requirements for user's account type
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT tier_level, min_transactions, max_transactions, base_fee
            FROM fee_tiers 
            WHERE account_type = ? AND is_active = 1
            ORDER BY tier_level
        """, (user['account_type'],))
        
        tiers = cursor.fetchall()
        conn.close()
        
        current_tier = user['current_tier']
        monthly_count = user['monthly_transaction_count']
        
        # Find appropriate tier based on transaction count
        recommended_tier = current_tier
        upgrade_reason = None
        
        for tier_level, min_trans, max_trans, base_fee in tiers:
            if min_trans <= monthly_count and (max_trans is None or monthly_count <= max_trans):
                if tier_level > current_tier:
                    recommended_tier = tier_level
                    upgrade_reason = f"Monthly transactions ({monthly_count}) qualify for tier {tier_level}"
                    break
        
        # AI-based tier recommendations
        ai_recommendation = self._get_ai_tier_recommendation(user)
        
        return {
            'current_tier': current_tier,
            'recommended_tier': recommended_tier,
            'should_upgrade': recommended_tier > current_tier,
            'upgrade_reason': upgrade_reason,
            'ai_recommendation': ai_recommendation,
            'monthly_transactions': monthly_count,
            'loyalty_score': user['loyalty_score']
        }
    
    def _get_ai_tier_recommendation(self, user: Dict) -> Dict:
        """Get AI-based tier recommendations"""
        loyalty_score = user['loyalty_score']
        monthly_count = user['monthly_transaction_count']
        lifetime_transactions = user['total_lifetime_transactions']
        
        # AI factors for tier recommendation
        factors = {
            'loyalty_factor': loyalty_score,
            'activity_factor': min(1.0, monthly_count / 50),  # Normalize to 50 transactions
            'lifetime_factor': min(1.0, lifetime_transactions / 200),  # Normalize to 200 transactions
            'consistency_factor': self._calculate_consistency_score(user)
        }
        
        # Calculate AI recommendation score
        ai_score = sum(factors.values()) / len(factors)
        
        # Determine recommendation
        if ai_score > 0.8:
            recommendation = "Premium tier candidate - high value user"
        elif ai_score > 0.6:
            recommendation = "Upgrade recommended - good engagement"
        elif ai_score > 0.4:
            recommendation = "Maintain current tier - moderate activity"
        else:
            recommendation = "Monitor for engagement - low activity"
        
        return {
            'ai_score': ai_score,
            'recommendation': recommendation,
            'factors': factors,
            'confidence': min(1.0, ai_score + 0.2)
        }
    
    def _calculate_consistency_score(self, user: Dict) -> float:
        """Calculate user consistency score for AI analysis"""
        # Get recent transaction history
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT created_at FROM transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 30
        """, (user['id'],))
        
        transactions = cursor.fetchall()
        conn.close()
        
        if len(transactions) < 5:
            return 0.3  # Low consistency for few transactions
        
        # Calculate transaction frequency consistency
        transaction_dates = [datetime.fromisoformat(t[0]) for t in transactions]
        time_gaps = []
        
        for i in range(1, len(transaction_dates)):
            gap = (transaction_dates[i-1] - transaction_dates[i]).days
            time_gaps.append(gap)
        
        if time_gaps:
            avg_gap = sum(time_gaps) / len(time_gaps)
            gap_variance = sum((gap - avg_gap) ** 2 for gap in time_gaps) / len(time_gaps)
            consistency = max(0.0, 1.0 - (gap_variance / 100))  # Normalize variance
        else:
            consistency = 0.5
        
        return min(1.0, consistency)
    
    def _upgrade_user_tier(self, user_id: int, new_tier: int) -> Dict:
        """Upgrade user to new tier and calculate benefits"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get current and new tier information
            cursor.execute("SELECT account_type FROM users WHERE id = ?", (user_id,))
            account_type = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT base_fee FROM fee_tiers 
                WHERE account_type = ? AND tier_level = ? AND is_active = 1
            """, (account_type, new_tier))
            
            new_tier_info = cursor.fetchone()
            if not new_tier_info:
                return {'success': False, 'error': 'New tier not found'}
            
            new_base_fee = new_tier_info[0]
            
            # Update user tier
            cursor.execute("""
                UPDATE users 
                SET current_tier = ?, last_tier_check = CURRENT_DATE
                WHERE id = ?
            """, (new_tier, user_id))
            
            conn.commit()
            conn.close()
            
            # Calculate benefits
            benefits = self._calculate_tier_benefits(user_id, new_tier, new_base_fee)
            
            return {
                'success': True,
                'new_tier': new_tier,
                'new_base_fee': new_base_fee,
                'benefits': benefits
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _calculate_tier_benefits(self, user_id: int, new_tier: int, new_base_fee: float) -> Dict:
        """Calculate benefits of tier upgrade"""
        # Get user's recent transaction patterns
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT amount, round_up, fee FROM transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 20
        """, (user_id,))
        
        recent_transactions = cursor.fetchall()
        conn.close()
        
        if not recent_transactions:
            return {'savings_per_transaction': 0, 'monthly_savings': 0}
        
        # Calculate average savings per transaction
        total_savings = 0
        for amount, round_up, current_fee in recent_transactions:
            if round_up:
                if new_tier > 1:  # Assuming percentage-based for business, fixed for others
                    old_fee = current_fee
                    new_fee = new_base_fee * round_up if new_base_fee < 1 else new_base_fee
                    savings = max(0, old_fee - new_fee)
                    total_savings += savings
        
        avg_savings_per_transaction = total_savings / len(recent_transactions) if recent_transactions else 0
        
        # Estimate monthly savings
        monthly_transactions = len(recent_transactions) * 1.5  # Estimate based on recent activity
        estimated_monthly_savings = avg_savings_per_transaction * monthly_transactions
        
        return {
            'savings_per_transaction': round(avg_savings_per_transaction, 2),
            'monthly_savings': round(estimated_monthly_savings, 2),
            'tier_level': new_tier,
            'fee_reduction': f"{((current_fee - new_base_fee) / current_fee * 100):.1f}%" if recent_transactions else "0%"
        }
    
    def _generate_user_recommendations(self, user_id: int) -> List[Dict]:
        """Generate AI-powered recommendations for user"""
        user = self._get_user_info(user_id)
        recommendations = []
        
        # Transaction frequency recommendations
        monthly_count = user['monthly_transaction_count']
        if monthly_count < 5:
            recommendations.append({
                'type': 'engagement',
                'title': 'Increase Transaction Frequency',
                'description': f'You have {monthly_count} transactions this month. Consider increasing usage to unlock better rates.',
                'action': 'Use Kamioi for more daily purchases to reach tier 2 benefits',
                'priority': 'high'
            })
        elif monthly_count < 15:
            recommendations.append({
                'type': 'tier_upgrade',
                'title': 'Tier Upgrade Available',
                'description': f'You have {monthly_count} transactions. You qualify for tier 2 with better rates.',
                'action': 'Continue current usage to maintain tier 2 benefits',
                'priority': 'medium'
            })
        
        # Loyalty recommendations
        loyalty_score = user['loyalty_score']
        if loyalty_score < 0.4:
            recommendations.append({
                'type': 'retention',
                'title': 'Build Your Loyalty Score',
                'description': 'Your loyalty score is low. Consistent usage will improve your rates.',
                'action': 'Use Kamioi regularly to build loyalty and unlock premium benefits',
                'priority': 'high'
            })
        
        # Lifetime value recommendations
        lifetime_transactions = user['total_lifetime_transactions']
        if lifetime_transactions > 100:
            recommendations.append({
                'type': 'premium',
                'title': 'Premium User Benefits',
                'description': f'You have {lifetime_transactions} lifetime transactions. You qualify for premium features.',
                'action': 'Contact support to unlock premium user benefits',
                'priority': 'low'
            })
        
        return recommendations
    
    def _update_tier_statistics(self):
        """Update tier statistics for admin dashboard"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get tier distribution
        cursor.execute("""
            SELECT current_tier, COUNT(*) as user_count
            FROM users 
            GROUP BY current_tier
            ORDER BY current_tier
        """)
        
        tier_distribution = cursor.fetchall()
        
        # Get tier upgrade trends
        cursor.execute("""
            SELECT DATE(created_at) as date, COUNT(*) as upgrades
            FROM ai_fee_history 
            WHERE tier_at_time > 1
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        """)
        
        upgrade_trends = cursor.fetchall()
        
        conn.close()
        
        # Store statistics (could be stored in a separate analytics table)
        return {
            'tier_distribution': dict(tier_distribution),
            'upgrade_trends': dict(upgrade_trends),
            'last_updated': datetime.now().isoformat()
        }
    
    def get_tier_analytics(self) -> Dict:
        """Get comprehensive tier analytics for admin dashboard"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Overall tier statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_users,
                AVG(current_tier) as avg_tier,
                MAX(current_tier) as max_tier,
                COUNT(CASE WHEN current_tier > 1 THEN 1 END) as upgraded_users
            FROM users
        """)
        
        overall_stats = cursor.fetchone()
        
        # Tier distribution by account type
        cursor.execute("""
            SELECT account_type, current_tier, COUNT(*) as user_count
            FROM users 
            GROUP BY account_type, current_tier
            ORDER BY account_type, current_tier
        """)
        
        tier_by_account = cursor.fetchall()
        
        # Recent tier upgrades
        cursor.execute("""
            SELECT u.email, u.account_type, afh.tier_at_time, afh.created_at
            FROM ai_fee_history afh
            JOIN users u ON afh.user_id = u.id
            WHERE afh.tier_at_time > 1
            ORDER BY afh.created_at DESC
            LIMIT 10
        """)
        
        recent_upgrades = cursor.fetchall()
        
        conn.close()
        
        return {
            'overall_stats': {
                'total_users': overall_stats[0],
                'average_tier': round(overall_stats[1], 2),
                'max_tier': overall_stats[2],
                'upgraded_users': overall_stats[3]
            },
            'tier_distribution': {
                'by_account_type': tier_by_account,
                'recent_upgrades': recent_upgrades
            },
            'last_updated': datetime.now().isoformat()
        }


# Initialize the Tier Management System
tier_manager = TierManagementSystem()
