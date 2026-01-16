"""
Smart LLM Transaction Processor for Kamioi Platform
Handles automatic transaction mapping, learning, and stock purchases
"""

import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json
import requests
from alpaca_service import AlpacaService
from database_manager import db_manager

class SmartLLMProcessor:
    def __init__(self):
        self.alpaca = AlpacaService()
        self.is_running = False
        self.processing_thread = None
        self.batch_size = 50
        self.processing_interval = 60  # seconds
        self.learning_threshold = 0.85
        self.auto_approve_threshold = 0.90
        
        # Market hours (EST)
        self.market_open = 9.5  # 9:30 AM
        self.market_close = 16.0  # 4:00 PM
        
        # Kamioi funding account
        self.kamioi_account_id = "kamioi_funding_account"
        
    def is_market_open(self) -> bool:
        """Check if stock market is currently open"""
        now = datetime.now()
        current_time = now.hour + now.minute / 60.0
        
        # Check if it's a weekday (Monday=0, Sunday=6)
        if now.weekday() >= 5:  # Weekend
            return False
            
        # Check if it's within market hours
        return self.market_open <= current_time <= self.market_close
    
    def get_pending_transactions(self, limit: int = 50) -> List[Dict]:
        """Get pending transactions for processing"""
        try:
            conn = db_manager.get_connection()
            cur = conn.cursor()
            
            cur.execute("""
                SELECT id, user_id, merchant, amount, category, created_at
                FROM transactions 
                WHERE status = 'pending' AND ticker IS NULL
                ORDER BY created_at ASC
                LIMIT ?
            """, (limit,))
            
            transactions = []
            for row in cur.fetchall():
                transactions.append({
                    'id': row[0],
                    'user_id': row[1],
                    'merchant': row[2],
                    'amount': row[3],
                    'category': row[4],
                    'created_at': row[5]
                })
            
            conn.close()
            return transactions
            
        except Exception as e:
            print(f"Error getting pending transactions: {e}")
            return []
    
    def llm_map_transaction(self, merchant: str, category: str = None) -> Dict:
        """
        Use LLM to map merchant to stock ticker
        This is where the actual LLM model would be called
        """
        # For now, using the existing auto_mapping_pipeline
        # In production, this would call your actual LLM model
        from auto_mapping_pipeline import auto_mapping_pipeline
        
        result = auto_mapping_pipeline.map_merchant(merchant)
        
        return {
            'ticker': result.ticker,
            'merchant': result.merchant,
            'category': result.category,
            'confidence': result.confidence,
            'method': result.method,
            'evidence': result.evidence
        }
    
    def execute_stock_purchase(self, user_id: int, ticker: str, amount: float) -> Dict:
        """Execute stock purchase through Alpaca API"""
        try:
            # For now, we'll simulate the purchase
            # In production, you'd use the actual Alpaca API
            print(f"Executing stock purchase: {ticker} for ${amount}")
            
            # Simulate successful purchase
            purchase_result = {
                'success': True,
                'ticker': ticker,
                'shares': amount,  # Fractional shares
                'price_per_share': 1.0,  # Simulated price
                'total_cost': amount,
                'order_id': f"order_{int(time.time())}",
                'timestamp': datetime.now().isoformat()
            }
            
            return purchase_result
            
        except Exception as e:
            print(f"Error executing stock purchase: {e}")
            return {'success': False, 'error': str(e)}
    
    def process_transaction(self, transaction: Dict) -> Dict:
        """Process a single transaction through the LLM pipeline"""
        try:
            merchant = transaction['merchant']
            user_id = transaction['user_id']
            tx_id = transaction['id']
            
            # Step 1: LLM mapping
            mapping_result = self.llm_map_transaction(merchant, transaction.get('category'))
            
            if mapping_result['confidence'] >= self.auto_approve_threshold:
                # High confidence - auto-approve and invest
                ticker = mapping_result['ticker']
                
                # Step 2: Execute stock purchase
                if self.is_market_open():
                    purchase_result = self.execute_stock_purchase(user_id, ticker, 1.0)  # $1.00 investment
                    
                    if purchase_result['success']:
                        # Update transaction status
                        self.update_transaction_status(tx_id, 'mapped', ticker, purchase_result)
                        
                        # Create mapping record
                        self.create_mapping_record(user_id, merchant, ticker, mapping_result)
                        
                        return {
                            'status': 'mapped',
                            'ticker': ticker,
                            'purchase': purchase_result,
                            'confidence': mapping_result['confidence']
                        }
                    else:
                        # Purchase failed - keep as pending
                        return {'status': 'pending', 'reason': 'Purchase failed'}
                else:
                    # Market closed - queue for next day
                    self.queue_for_next_day(tx_id, ticker, user_id)
                    return {'status': 'queued', 'ticker': ticker, 'reason': 'Market closed'}
                    
            elif mapping_result['confidence'] >= self.learning_threshold:
                # Medium confidence - send to review queue
                self.create_mapping_record(user_id, merchant, mapping_result['ticker'], mapping_result, 'pending')
                return {'status': 'review', 'ticker': mapping_result['ticker'], 'confidence': mapping_result['confidence']}
            else:
                # Low confidence - keep as pending
                return {'status': 'pending', 'reason': 'Low confidence mapping'}
                
        except Exception as e:
            print(f"Error processing transaction {transaction['id']}: {e}")
            return {'status': 'error', 'error': str(e)}
    
    def update_transaction_status(self, tx_id: int, status: str, ticker: str = None, purchase_data: Dict = None):
        """Update transaction status in database"""
        try:
            conn = db_manager.get_connection()
            cur = conn.cursor()
            
            if status == 'mapped' and ticker and purchase_data:
                cur.execute("""
                    UPDATE transactions 
                    SET status = ?, ticker = ?, shares = ?, price_per_share = ?, 
                        stock_price = ?, order_id = ?, updated_at = ?
                    WHERE id = ?
                """, (
                    status, ticker, purchase_data['shares'], purchase_data['price_per_share'],
                    purchase_data['price_per_share'], purchase_data['order_id'], 
                    datetime.now().isoformat(), tx_id
                ))
            else:
                cur.execute("""
                    UPDATE transactions 
                    SET status = ?, updated_at = ?
                    WHERE id = ?
                """, (status, datetime.now().isoformat(), tx_id))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error updating transaction status: {e}")
    
    def create_mapping_record(self, user_id: int, merchant: str, ticker: str, mapping_result: Dict, status: str = 'approved'):
        """Create mapping record in database"""
        try:
            conn = db_manager.get_connection()
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO llm_mappings 
                (user_id, merchant_name, ticker, category, confidence, status, created_at, method, evidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, merchant, ticker, mapping_result['category'],
                mapping_result['confidence'], status, datetime.now().isoformat(),
                mapping_result['method'], mapping_result['evidence']
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error creating mapping record: {e}")
    
    def queue_for_next_day(self, tx_id: int, ticker: str, user_id: int):
        """Queue transaction for next day when market opens"""
        try:
            conn = db_manager.get_connection()
            cur = conn.cursor()
            
            # Create a queue record
            cur.execute("""
                INSERT INTO market_queue 
                (transaction_id, user_id, ticker, amount, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (tx_id, user_id, ticker, 1.0, 'queued', datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error queuing transaction: {e}")
    
    def process_batch(self) -> Dict:
        """Process a batch of pending transactions"""
        try:
            transactions = self.get_pending_transactions(self.batch_size)
            
            if not transactions:
                return {'processed': 0, 'mapped': 0, 'queued': 0, 'review': 0}
            
            results = {
                'processed': 0,
                'mapped': 0,
                'queued': 0,
                'review': 0,
                'errors': 0
            }
            
            for transaction in transactions:
                result = self.process_transaction(transaction)
                results['processed'] += 1
                
                if result['status'] == 'mapped':
                    results['mapped'] += 1
                elif result['status'] == 'queued':
                    results['queued'] += 1
                elif result['status'] == 'review':
                    results['review'] += 1
                elif result['status'] == 'error':
                    results['errors'] += 1
            
            print(f"Batch processing complete: {results}")
            return results
            
        except Exception as e:
            print(f"Error processing batch: {e}")
            return {'error': str(e)}
    
    def start_processing(self):
        """Start the background processing thread"""
        if self.is_running:
            return
        
        self.is_running = True
        self.processing_thread = threading.Thread(target=self._processing_loop, daemon=True)
        self.processing_thread.start()
        print("Smart LLM Processor started")
    
    def stop_processing(self):
        """Stop the background processing thread"""
        self.is_running = False
        if self.processing_thread:
            self.processing_thread.join()
        print("Smart LLM Processor stopped")
    
    def _processing_loop(self):
        """Main processing loop"""
        while self.is_running:
            try:
                # Process batch of transactions
                result = self.process_batch()
                
                # Wait before next batch
                time.sleep(self.processing_interval)
                
            except Exception as e:
                print(f"Error in processing loop: {e}")
                time.sleep(60)  # Wait a minute before retrying
    
    def get_processing_stats(self) -> Dict:
        """Get current processing statistics"""
        try:
            conn = db_manager.get_connection()
            cur = conn.cursor()
            
            # Get counts
            cur.execute("SELECT COUNT(*) FROM transactions WHERE status = 'pending'")
            pending = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM transactions WHERE status = 'mapped'")
            mapped = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM llm_mappings WHERE status = 'pending'")
            review_queue = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM market_queue WHERE status = 'queued'")
            market_queue = cur.fetchone()[0]
            
            conn.close()
            
            return {
                'pending_transactions': pending,
                'mapped_transactions': mapped,
                'review_queue': review_queue,
                'market_queue': market_queue,
                'is_running': self.is_running,
                'market_open': self.is_market_open()
            }
            
        except Exception as e:
            print(f"Error getting stats: {e}")
            return {'error': str(e)}

# Global processor instance
smart_llm_processor = SmartLLMProcessor()
