"""
Learning Service - Uses stored AI responses to improve the system
This is how we LEARN from all the stored responses
Uses database_manager instead of SQLAlchemy
"""

from database_manager import db_manager
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import json

class LearningService:
    """
    Learning Service - Analyzes stored AI responses to improve accuracy
    
    This service:
    1. Calculates accuracy from admin feedback
    2. Identifies patterns in merchant mappings
    3. Builds merchant knowledge base
    4. Suggests improvements to prompts
    5. Tracks model performance over time
    """
    
    def _ensure_tables(self):
        """Ensure ai_responses table exists"""
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_responses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mapping_id INTEGER,
                    merchant_name TEXT NOT NULL,
                    category TEXT,
                    prompt TEXT NOT NULL,
                    raw_response TEXT NOT NULL,
                    parsed_response TEXT NOT NULL,
                    processing_time_ms INTEGER NOT NULL,
                    model_version TEXT NOT NULL,
                    is_error INTEGER DEFAULT 0,
                    admin_feedback TEXT,
                    admin_correct_ticker TEXT,
                    was_ai_correct INTEGER,
                    feedback_notes TEXT,
                    feedback_date TEXT,
                    created_at TEXT NOT NULL
                )
            """)
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error ensuring ai_responses table: {e}")
        finally:
            db_manager.release_connection(conn)
    
    def calculate_accuracy(self, days: int = 30) -> Dict:
        """
        Calculate AI accuracy from stored responses with feedback
        
        Returns:
            {
                'total_responses': int,
                'responses_with_feedback': int,
                'correct_predictions': int,
                'incorrect_predictions': int,
                'accuracy_rate': float (0.0 to 1.0),
                'confidence_accuracy': Dict,  # Accuracy by confidence level
                'merchant_accuracy': Dict,    # Accuracy by merchant
                'category_accuracy': Dict     # Accuracy by category
            }
        """
        self._ensure_tables()
        cutoff_date = datetime.now() - timedelta(days=days)
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            
            # Get all responses with feedback
            cursor.execute("""
                SELECT merchant_name, category, parsed_response, was_ai_correct
                FROM ai_responses
                WHERE was_ai_correct IS NOT NULL
                AND created_at >= ?
            """, (cutoff_date.isoformat(),))
            
            rows = cursor.fetchall()
            
            total = len(rows)
            correct = sum(1 for r in rows if r[3] == 1)  # was_ai_correct column
            incorrect = total - correct
            accuracy = (correct / total * 100) if total > 0 else 0.0
            
            # Calculate accuracy by confidence level
            confidence_accuracy = self._calculate_confidence_accuracy(rows)
            
            # Calculate accuracy by merchant
            merchant_accuracy = self._calculate_merchant_accuracy(rows)
            
            # Calculate accuracy by category
            category_accuracy = self._calculate_category_accuracy(rows)
            
            # Get total responses count
            cursor.execute("SELECT COUNT(*) FROM ai_responses WHERE created_at >= ?", (cutoff_date.isoformat(),))
            total_responses = cursor.fetchone()[0] or 0
            
            return {
                'total_responses': total_responses,
                'responses_with_feedback': total,
                'correct_predictions': correct,
                'incorrect_predictions': incorrect,
                'accuracy_rate': round(accuracy / 100, 4),  # Convert to 0.0-1.0
                'accuracy_percentage': round(accuracy, 2),
                'confidence_accuracy': confidence_accuracy,
                'merchant_accuracy': merchant_accuracy,
                'category_accuracy': category_accuracy,
                'period_days': days
            }
        finally:
            db_manager.release_connection(conn)
    
    def _calculate_confidence_accuracy(self, rows: List) -> Dict:
        """Calculate accuracy grouped by confidence level"""
        confidence_buckets = {
            'high': [],      # 0.8-1.0
            'medium': [],    # 0.6-0.79
            'low': []        # 0.0-0.59
        }
        
        for row in rows:
            try:
                parsed = json.loads(row[2]) if row[2] else {}  # parsed_response
                confidence = parsed.get('confidence', 0.5)
                
                if confidence >= 0.8:
                    confidence_buckets['high'].append(row)
                elif confidence >= 0.6:
                    confidence_buckets['medium'].append(row)
                else:
                    confidence_buckets['low'].append(row)
            except:
                continue
        
        result = {}
        for level, bucket in confidence_buckets.items():
            if bucket:
                correct = sum(1 for r in bucket if r[3] == 1)  # was_ai_correct
                result[level] = {
                    'total': len(bucket),
                    'correct': correct,
                    'accuracy': round(correct / len(bucket) * 100, 2)
                }
        
        return result
    
    def _calculate_merchant_accuracy(self, rows: List) -> Dict:
        """Calculate accuracy by merchant name"""
        merchant_stats = {}
        
        for row in rows:
            merchant = (row[0] or '').lower()  # merchant_name
            if merchant:
                if merchant not in merchant_stats:
                    merchant_stats[merchant] = {'total': 0, 'correct': 0}
                
                merchant_stats[merchant]['total'] += 1
                if row[3] == 1:  # was_ai_correct
                    merchant_stats[merchant]['correct'] += 1
        
        # Convert to accuracy percentages
        result = {}
        for merchant, stats in merchant_stats.items():
            if stats['total'] >= 3:  # Only include merchants with 3+ responses
                result[merchant] = {
                    'total': stats['total'],
                    'correct': stats['correct'],
                    'accuracy': round(stats['correct'] / stats['total'] * 100, 2)
                }
        
        # Sort by total (most analyzed first)
        return dict(sorted(result.items(), key=lambda x: x[1]['total'], reverse=True)[:20])
    
    def _calculate_category_accuracy(self, rows: List) -> Dict:
        """Calculate accuracy by category"""
        category_stats = {}
        
        for row in rows:
            category = row[1] or 'Unknown'  # category
            if category not in category_stats:
                category_stats[category] = {'total': 0, 'correct': 0}
            
            category_stats[category]['total'] += 1
            if row[3] == 1:  # was_ai_correct
                category_stats[category]['correct'] += 1
        
        # Convert to accuracy percentages
        result = {}
        for category, stats in category_stats.items():
            result[category] = {
                'total': stats['total'],
                'correct': stats['correct'],
                'accuracy': round(stats['correct'] / stats['total'] * 100, 2) if stats['total'] > 0 else 0
            }
        
        return result
    
    def get_merchant_knowledge_base(self, limit: int = 100) -> List[Dict]:
        """
        Build merchant knowledge base from stored responses
        
        Returns most common merchant -> ticker mappings with confidence
        """
        self._ensure_tables()
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            
            # Get all successful responses (not errors)
            cursor.execute("""
                SELECT merchant_name, parsed_response, admin_correct_ticker, admin_feedback
                FROM ai_responses
                WHERE is_error = 0
                ORDER BY created_at DESC
                LIMIT ?
            """, (limit * 10,))
            
            rows = cursor.fetchall()
            
            merchant_ticker_map = {}
            
            for row in rows:
                try:
                    parsed = json.loads(row[1]) if row[1] else {}  # parsed_response
                    merchant = (row[0] or '').lower()  # merchant_name
                    ticker = parsed.get('ticker', '').upper()
                    confidence = parsed.get('confidence', 0.5)
                    status = parsed.get('status', 'uncertain')
                    
                    # If admin provided feedback, use that
                    if row[2]:  # admin_correct_ticker
                        ticker = row[2].upper()
                        confidence = 1.0  # Admin feedback is 100% confident
                    
                    if not ticker or status == 'rejected':
                        continue
                    
                    if merchant not in merchant_ticker_map:
                        merchant_ticker_map[merchant] = {
                            'ticker': ticker,
                            'confidence_sum': 0.0,
                            'count': 0,
                            'admin_verified': bool(row[2])
                        }
                    
                    merchant_ticker_map[merchant]['confidence_sum'] += confidence
                    merchant_ticker_map[merchant]['count'] += 1
                    if row[2]:  # admin_correct_ticker
                        merchant_ticker_map[merchant]['admin_verified'] = True
                except:
                    continue
            
            # Calculate average confidence and sort
            knowledge_base = []
            for merchant, data in merchant_ticker_map.items():
                if data['count'] >= 2:  # Only include merchants with 2+ responses
                    knowledge_base.append({
                        'merchant_name': merchant,
                        'ticker': data['ticker'],
                        'average_confidence': round(data['confidence_sum'] / data['count'], 3),
                        'response_count': data['count'],
                        'admin_verified': data['admin_verified']
                    })
            
            # Sort by response count and confidence
            knowledge_base.sort(key=lambda x: (x['admin_verified'], x['response_count'], x['average_confidence']), reverse=True)
            
            return knowledge_base[:limit]
        finally:
            db_manager.release_connection(conn)
    
    def record_feedback(self, ai_response_id: int, admin_action: str, 
                       correct_ticker: str = None, notes: str = None):
        """
        Record admin feedback on AI response for learning
        
        This is CRITICAL - every admin action teaches the system
        """
        self._ensure_tables()
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            
            # Get the AI response
            cursor.execute("""
                SELECT parsed_response FROM ai_responses WHERE id = ?
            """, (ai_response_id,))
            
            row = cursor.fetchone()
            if not row:
                raise Exception(f"AI response {ai_response_id} not found")
            
            parsed = json.loads(row[0]) if row[0] else {}
            ai_ticker = parsed.get('ticker', '').upper()
            
            # Determine if AI was correct
            if admin_action == 'approved':
                # AI was correct if ticker matches
                was_correct = (ai_ticker == correct_ticker.upper()) if correct_ticker else True
            elif admin_action == 'rejected':
                # AI was wrong
                was_correct = False
            else:
                was_correct = None
            
            # Update AI response with feedback
            cursor.execute("""
                UPDATE ai_responses
                SET admin_feedback = ?,
                    admin_correct_ticker = ?,
                    was_ai_correct = ?,
                    feedback_notes = ?,
                    feedback_date = ?
                WHERE id = ?
            """, (
                admin_action,
                correct_ticker.upper() if correct_ticker else None,
                1 if was_correct else (0 if was_correct is False else None),
                notes,
                datetime.now().isoformat(),
                ai_response_id
            ))
            
            conn.commit()
            
            print(f"✅ Recorded feedback for AI response {ai_response_id}: {admin_action}, correct={was_correct}")
            
            # Return updated response
            cursor.execute("SELECT * FROM ai_responses WHERE id = ?", (ai_response_id,))
            return cursor.fetchone()
        finally:
            db_manager.release_connection(conn)
    
    def get_learning_insights(self) -> Dict:
        """
        Get insights for improving the system
        
        Returns patterns and recommendations
        """
        self._ensure_tables()
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            
            # Get recent responses
            cutoff_date = datetime.now() - timedelta(days=7)
            cursor.execute("""
                SELECT is_error, was_ai_correct, parsed_response
                FROM ai_responses
                WHERE created_at >= ?
            """, (cutoff_date.isoformat(),))
            
            rows = cursor.fetchall()
            
            # Find common errors
            errors = [r for r in rows if r[0] == 1]  # is_error
            incorrect = [r for r in rows if r[1] == 0]  # was_ai_correct == False
            
            # Find merchants that need review
            uncertain_merchants = {}
            for row in rows:
                try:
                    parsed = json.loads(row[2]) if row[2] else {}  # parsed_response
                    if parsed.get('status') == 'uncertain' and parsed.get('confidence', 0) < 0.7:
                        # Would need merchant_name, but we don't have it in this query
                        # For now, just count uncertain responses
                        pass
                except:
                    continue
            
            recommendations = []
            if len(errors) > len(rows) * 0.1:  # More than 10% errors
                recommendations.append("High error rate detected. Check API connectivity and prompt quality.")
            
            if len(incorrect) > len(rows) * 0.3:  # More than 30% incorrect
                recommendations.append("Low accuracy detected. Consider improving prompt with more examples.")
            
            if len(rows) < 10:
                recommendations.append("Need more data for learning. Process more mappings to improve accuracy.")
            
            return {
                'total_responses_last_7_days': len(rows),
                'error_rate': round(len(errors) / len(rows) * 100, 2) if rows else 0,
                'incorrect_predictions': len(incorrect),
                'uncertain_merchants': {},  # TODO: Implement properly
                'recommendations': recommendations
            }
        finally:
            db_manager.release_connection(conn)
